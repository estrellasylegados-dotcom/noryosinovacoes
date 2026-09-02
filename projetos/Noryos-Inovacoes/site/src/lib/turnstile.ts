/**
 * Verificação server-side do Cloudflare Turnstile para o endpoint do
 * Diagnóstico Digital (`POST /api/diagnostico`).
 *
 * O token vem do widget no formulário (campo `turnstileToken` no corpo do
 * POST). Aqui ele é validado contra a API `siteverify` da Cloudflare usando
 * o `TURNSTILE_SECRET_KEY` — **exclusivamente server-side**, nunca
 * `NEXT_PUBLIC_`. O site key público (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`) só
 * aparece no frontend e não valida nada.
 *
 * O frontend NUNCA é a fonte de verdade: mesmo que o widget seja burlado ou
 * removido do DOM, sem um token que a Cloudflare confirme como válido o
 * endpoint responde 403 e não persiste nem envia e-mail.
 *
 * Modos (`TURNSTILE_MODE`):
 * - `live` (default) — chama a API real da Cloudflare.
 *     - Sem `TURNSTILE_SECRET_KEY` em produção (e sem
 *       `DIAGNOSTIC_ALLOW_FILE_FALLBACK=1`): **falha fechado** → o endpoint
 *       responde 403. A ausência de configuração não é mascarada.
 *     - Sem `TURNSTILE_SECRET_KEY` em dev/teste: a verificação é **pulada**
 *       com um WARN único (mesma filosofia do fallback de
 *       persistência/e-mail — permissivo em dev, fechado em produção).
 * - `mock` — resultado determinado pelo próprio token, sem rede. Só
 *     dev/teste (a suíte E2E usa isso). Bloqueado em produção sem
 *     `DIAGNOSTIC_ALLOW_FILE_FALLBACK=1`.
 *
 * Nunca lança. Devolve `{ ok }` + um `reason` curto e seguro pra log — sem
 * PII, sem secret, sem o corpo bruto da resposta da Cloudflare.
 */

export type TurnstileResult = { ok: true; skipped?: true } | { ok: false; reason: string };

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_TOKEN_LEN = 2048; // tokens do Turnstile ficam bem abaixo disso
const VERIFY_TIMEOUT_MS = 5000;

const MODE = (process.env.TURNSTILE_MODE ?? "live").toLowerCase();

/**
 * Só dev/teste pode operar sem verificação real. Em produção exige opt-in
 * explícito (`DIAGNOSTIC_ALLOW_FILE_FALLBACK=1`, usado pelo servidor da
 * suíte E2E) — igual ao fallback de persistência/e-mail.
 */
const ALLOW_INSECURE =
  process.env.NODE_ENV !== "production" || process.env.DIAGNOSTIC_ALLOW_FILE_FALLBACK === "1";

let warnedSkip = false;
function warnSkipOnce() {
  if (warnedSkip) return;
  warnedSkip = true;
  console.warn(
    "[diagnostico] turnstile_skipped",
    JSON.stringify({
      reason: "TURNSTILE_SECRET_KEY ausente e ambiente não-produção",
      efeito: "submissões aceitas SEM verificação de Turnstile (apenas dev/teste)",
    })
  );
}

function normalizeToken(token: unknown): string {
  return typeof token === "string" ? token.trim() : "";
}

function verifyMock(token: string): TurnstileResult {
  if (!ALLOW_INSECURE) return { ok: false, reason: "mock_blocked_in_production" };
  if (!token) return { ok: false, reason: "missing_token" };
  // "XXXX.DUMMY.TOKEN.XXXX" é o token que o site key de teste ("always
  // passes") da Cloudflare emite; "pass" é um gatilho explícito pros testes.
  if (token === "XXXX.DUMMY.TOKEN.XXXX" || token.includes("pass")) return { ok: true };
  return { ok: false, reason: "mock_rejected" };
}

async function verifyLive(token: string, remoteIp?: string): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (ALLOW_INSECURE) {
      warnSkipOnce();
      return { ok: true, skipped: true };
    }
    console.error(
      "[diagnostico] turnstile_secret_absent",
      JSON.stringify({
        step: "verifyTurnstileToken",
        reason: "TURNSTILE_SECRET_KEY ausente ou não carregada pelo processo",
        efeito: "falha fechado — endpoint responde 403",
      })
    );
    return { ok: false, reason: "not_configured" };
  }

  if (!token) return { ok: false, reason: "missing_token" };

  try {
    const form = new URLSearchParams();
    form.set("secret", secret);
    form.set("response", token);
    if (remoteIp && remoteIp !== "unknown") form.set("remoteip", remoteIp);

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    });

    if (!res.ok) return { ok: false, reason: `verify_http_${res.status}` };

    const data = (await res.json().catch(() => null)) as
      | { success?: boolean; "error-codes"?: unknown }
      | null;

    if (!data || data.success !== true) {
      const codes = Array.isArray(data?.["error-codes"])
        ? (data!["error-codes"] as unknown[]).map(String).join(",")
        : "unknown";
      return { ok: false, reason: `rejected:${codes}`.slice(0, 120) };
    }

    return { ok: true };
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    return { ok: false, reason: timedOut ? "verify_timeout" : "verify_unreachable" };
  }
}

/**
 * Ponto de entrada único. `token` é o valor bruto vindo do corpo do POST;
 * `remoteIp` é o IP do cliente (mesma derivação usada pelo rate limit) e
 * vira o `remoteip` do siteverify quando conhecido.
 */
export async function verifyTurnstileToken(token: unknown, remoteIp?: string): Promise<TurnstileResult> {
  const t = normalizeToken(token);
  if (t.length > MAX_TOKEN_LEN) return { ok: false, reason: "token_too_long" };
  return MODE === "mock" ? verifyMock(t) : verifyLive(t, remoteIp);
}

/** Só pros testes — zera o estado de warning entre casos. */
export function __resetTurnstileState() {
  warnedSkip = false;
}
