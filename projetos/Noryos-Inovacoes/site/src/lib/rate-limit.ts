import { getSupabaseServerClient } from "@/lib/supabase";

/**
 * Rate limit compartilhado do endpoint do Diagnóstico + deduplicação de
 * submissões.
 *
 * ## Rate limit — DUAS janelas por origem
 *
 * Cada submissão é checada contra duas janelas fixas, ambas na mesma chave
 * de origem (tipicamente o IP). A primeira que estourar devolve 429:
 *
 * - **curta** — default **3 envios / 15 min** (`DIAGNOSTIC_RATELIMIT_SHORT_*`)
 * - **longa** — default **10 envios / 24 h** (`DIAGNOSTIC_RATELIMIT_LONG_*`)
 *
 * Dois backends, escolhidos por janela:
 *
 * 1. **Supabase** (`diagnostico_check_rate_limit` RPC) — quando o projeto
 *    Supabase está configurado. Compartilhado entre instâncias e sobrevive a
 *    restart do processo. É o alvo de produção. Cada janela é uma linha
 *    própria (`<chave>:15m`, `<chave>:24h`). Ver o DDL em `src/lib/supabase.ts`.
 * 2. **Memória do processo** (`Map`) — fallback quando o Supabase não está
 *    configurado (dev/teste) ou quando a RPC falha. Um `console.warn` único
 *    avisa que o rate limit está degradado (não compartilhado).
 *
 * ## Deduplicação
 *
 * Ainda em memória do processo — cobre duplo clique / retry de rede / refresh
 * logo após enviar. Se o processo reiniciar exatamente entre dois cliques, o
 * dedupe erra; a proteção forte contra registro duplicado nesse caso é um
 * índice único no banco (pendência — ver README).
 *
 * Nada aqui é logado. As chaves podem conter IP/e-mail; ficam só na RAM / na
 * tabela do Supabase.
 */

// --- Config das janelas (overrides por env, úteis pra testar expiração rápido) ---
// `DIAGNOSTIC_RATELIMIT_MAX` / `_WINDOW_MS` (nomes legados, janela única) ainda
// são aceitos como fallback da janela curta, pra não quebrar infra existente.
const LEGACY_MAX = numFromEnv("DIAGNOSTIC_RATELIMIT_MAX", 3);
const LEGACY_WINDOW_MS = numFromEnv("DIAGNOSTIC_RATELIMIT_WINDOW_MS", 15 * 60 * 1000);

export type RateWindowConfig = { suffix: string; max: number; windowMs: number };

export const RATE_LIMIT_WINDOWS: RateWindowConfig[] = [
  {
    suffix: "15m",
    max: numFromEnv("DIAGNOSTIC_RATELIMIT_SHORT_MAX", LEGACY_MAX),
    windowMs: numFromEnv("DIAGNOSTIC_RATELIMIT_SHORT_WINDOW_MS", LEGACY_WINDOW_MS),
  },
  {
    suffix: "24h",
    max: numFromEnv("DIAGNOSTIC_RATELIMIT_LONG_MAX", 10),
    windowMs: numFromEnv("DIAGNOSTIC_RATELIMIT_LONG_WINDOW_MS", 24 * 60 * 60 * 1000),
  },
];

export const DEDUP_TTL_MS = 2 * 60 * 1000; // 2 min

function numFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export type RateResult = { ok: true } | { ok: false; retryAfterSec: number };

// --- Backend em memória ---
type Hit = { count: number; resetAt: number };
const rateBuckets = new Map<string, Hit>();
const dedupCache = new Map<string, { at: number; value: unknown }>();

function sweep(now: number) {
  if (rateBuckets.size > 5000) {
    for (const [k, v] of rateBuckets) if (v.resetAt <= now) rateBuckets.delete(k);
  }
  if (dedupCache.size > 5000) {
    for (const [k, v] of dedupCache) if (now - v.at > DEDUP_TTL_MS) dedupCache.delete(k);
  }
}

function checkWindowInMemory(key: string, max: number, windowMs: number, now = Date.now()): RateResult {
  sweep(now);
  const hit = rateBuckets.get(key);

  if (!hit || hit.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (hit.count >= max) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((hit.resetAt - now) / 1000)) };
  }
  hit.count += 1;
  return { ok: true };
}

// --- Backend Supabase (compartilhado) ---
let degradedWarned = false;
function warnDegradedOnce(reason: string, detail?: Record<string, unknown>) {
  if (degradedWarned) return;
  degradedWarned = true;
  console.warn(
    "[diagnostico] rate_limit_degraded",
    JSON.stringify({
      reason,
      ...detail,
      efeito: "usando fallback em memória (não compartilhado entre instâncias/restart)",
    })
  );
}

async function checkWindowShared(key: string, max: number, windowMs: number): Promise<RateResult | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.rpc("diagnostico_check_rate_limit", {
      p_key: key,
      p_max: max,
      p_window_seconds: Math.ceil(windowMs / 1000),
    });

    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row || typeof row.allowed !== "boolean") {
      const e = (error ?? null) as { code?: string; message?: string; hint?: string; status?: number } | null;
      warnDegradedOnce(error ? "rpc_error" : "rpc_sem_resposta", {
        step: "rpc:diagnostico_check_rate_limit",
        code: e?.code ?? null,
        status: e?.status ?? null,
        message: (e?.message ?? "").slice(0, 300) || null,
        hint: (e?.hint ?? "").slice(0, 200) || null,
      });
      return null;
    }
    return row.allowed
      ? { ok: true }
      : { ok: false, retryAfterSec: Math.max(1, Number(row.retry_after) || 60) };
  } catch {
    warnDegradedOnce("rpc_exception");
    return null;
  }
}

/** Uma janela: tenta o backend compartilhado; se não houver ou falhar, memória. */
async function checkWindow(key: string, max: number, windowMs: number): Promise<RateResult> {
  const shared = await checkWindowShared(key, max, windowMs);
  return shared ?? checkWindowInMemory(key, max, windowMs);
}

/**
 * Ponto de entrada único. Checa `baseKey` contra TODAS as janelas de
 * `RATE_LIMIT_WINDOWS` (curta primeiro). Devolve o primeiro 429 encontrado;
 * `{ ok: true }` só se todas as janelas permitirem.
 */
export async function enforceRateLimit(baseKey: string): Promise<RateResult> {
  for (const w of RATE_LIMIT_WINDOWS) {
    const res = await checkWindow(`${baseKey}:${w.suffix}`, w.max, w.windowMs);
    if (!res.ok) return res;
  }
  return { ok: true };
}

// --- Deduplicação (em memória) ---
export function getDedup<T>(key: string, now = Date.now()): T | undefined {
  const entry = dedupCache.get(key);
  if (!entry) return undefined;
  if (now - entry.at > DEDUP_TTL_MS) {
    dedupCache.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function setDedup(key: string, value: unknown, now = Date.now()) {
  dedupCache.set(key, { at: now, value });
}

/** Só pros testes — zera o estado em memória entre casos. */
export function __resetRateLimitState() {
  rateBuckets.clear();
  dedupCache.clear();
  degradedWarned = false;
}
