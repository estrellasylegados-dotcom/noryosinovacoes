import { getSupabaseServerClient } from "@/lib/supabase";

/**
 * Rate limit compartilhado do endpoint do Diagnóstico + deduplicação de
 * submissões.
 *
 * ## Rate limit
 *
 * Janela fixa por chave (tipicamente o IP). Dois backends:
 *
 * 1. **Supabase** (`diagnostico_check_rate_limit` RPC) — quando o projeto
 *    Supabase está configurado. Compartilhado entre instâncias e sobrevive a
 *    restart do processo. É o alvo de produção. Ver o DDL em
 *    `src/lib/supabase.ts`.
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

// --- Config (overrides por env, úteis pra testar expiração rápido) ---
export const RATE_LIMIT_MAX = numFromEnv("DIAGNOSTIC_RATELIMIT_MAX", 5);
export const RATE_LIMIT_WINDOW_MS = numFromEnv("DIAGNOSTIC_RATELIMIT_WINDOW_MS", 10 * 60 * 1000);
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

function checkRateLimitInMemory(key: string, now = Date.now()): RateResult {
  sweep(now);
  const hit = rateBuckets.get(key);

  if (!hit || hit.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true };
  }
  if (hit.count >= RATE_LIMIT_MAX) {
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

async function checkRateLimitShared(key: string): Promise<RateResult | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.rpc("diagnostico_check_rate_limit", {
      p_key: key,
      p_max: RATE_LIMIT_MAX,
      p_window_seconds: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
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

/**
 * Ponto de entrada único. Tenta o backend compartilhado (Supabase); se não
 * houver ou falhar, cai pro backend em memória.
 */
export async function enforceRateLimit(key: string): Promise<RateResult> {
  const shared = await checkRateLimitShared(key);
  return shared ?? checkRateLimitInMemory(key);
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
