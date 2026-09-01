import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { diagnosticoSchema, type DiagnosticoInput } from "@/app/diagnostico/schema";
import { persistDiagnostico } from "@/lib/diagnostico-store";
import { sendDiagnosticoNotification, type EmailStatus } from "@/lib/email";
import { enforceRateLimit, getDedup, setDedup } from "@/lib/rate-limit";

/**
 * POST /api/diagnostico — endpoint do Diagnóstico Digital Noryos.
 *
 * Pipeline (nessa ordem, ver briefing → seções ANTI-SPAM / DUPLICIDADE):
 *   método → Content-Type → tamanho do payload → JSON válido → honeypot →
 *   tempo mínimo de preenchimento → rate limit por IP → validação (zod) →
 *   sanitização → dedupe → PERSISTÊNCIA → (só então) NOTIFICAÇÃO por e-mail →
 *   resposta de sucesso.
 *
 * Uma requisição classificada como spam NÃO persiste e NÃO dispara e-mail.
 * Se o e-mail falhar depois do lead salvo, o lead permanece (resposta
 * continua 200; o status do e-mail vem no corpo e um warning seguro vai
 * pro log do servidor).
 */

export const runtime = "nodejs";

const MAX_PAYLOAD_BYTES = 16 * 1024; // form inteiro cabe folgado
const MIN_FILL_TIME_MS = 2500;

type SubmitPayload = Partial<Record<keyof DiagnosticoInput, unknown>> & {
  website?: unknown; // honeypot
  startedAt?: unknown;
};

type ApiOk = { ok: true; id: string; email: EmailStatus["status"]; duplicate?: true };
type ApiErr = { ok: false; error: string };

/**
 * IP do cliente pra chave de rate limit.
 *
 * `X-Forwarded-For` é uma lista `cliente, proxy1, proxy2, ...` onde só as
 * entradas da DIREITA são acrescentadas por infra confiável — a da esquerda
 * é enviada pelo cliente e pode ser forjada. Por isso:
 *   1. `x-real-ip` (valor único que o proxy da Hostinger define) quando existe;
 *   2. senão, a ÚLTIMA entrada do `x-forwarded-for` (a que o proxy mais
 *      próximo acrescentou) — não a primeira;
 *   3. senão, "unknown" (todos caem no mesmo bucket — limite global).
 */
function clientIp(req: Request): string {
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1]!;
  }
  return "unknown";
}

/**
 * Descarta caracteres de controle (C0/C1 + DEL), preservando tab (9) e
 * quebra de linha (10); normaliza espaços/linhas em excesso e corta no
 * limite. Filtra por code point — sem regex de controle.
 */
function sanitizeText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  let out = "";
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    if (code === 9 || code === 10) {
      out += ch;
      continue;
    }
    if (code < 0x20 || (code >= 0x7f && code <= 0x9f)) continue;
    out += ch;
  }
  return out
    .replace(/ {2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

function sanitizeInput(raw: Record<string, unknown>): Record<string, string | boolean> {
  const caps: Record<string, number> = {
    nomeEmpresa: 160,
    responsavel: 160,
    whatsapp: 40,
    email: 180,
    cidade: 160,
    segmento: 160,
    site: 300,
    instagram: 300,
    googleBusiness: 500,
    comoConquistaClientes: 2000,
    dificuldade: 2000,
    objetivo: 2000,
    observacoes: 2000,
  };
  const out: Record<string, string | boolean> = {};
  for (const [key, max] of Object.entries(caps)) out[key] = sanitizeText(raw[key], max);
  out.consentimento = raw.consentimento === true;
  return out;
}

function json(body: ApiOk | ApiErr, init?: ResponseInit) {
  return NextResponse.json(body, init);
}

export async function POST(request: Request): Promise<Response> {
  // 1. Content-Type esperado
  const ct = request.headers.get("content-type") ?? "";
  if (!ct.toLowerCase().includes("application/json")) {
    return json({ ok: false, error: "Formato não suportado." }, { status: 415 });
  }

  // 2. Limite de payload (header declarado + leitura real)
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_PAYLOAD_BYTES) {
    return json({ ok: false, error: "Requisição muito grande." }, { status: 413 });
  }
  const rawText = await request.text();
  if (rawText.length > MAX_PAYLOAD_BYTES) {
    return json({ ok: false, error: "Requisição muito grande." }, { status: 413 });
  }

  // 3. JSON válido
  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawText);
  } catch {
    return json({ ok: false, error: "Corpo inválido." }, { status: 400 });
  }
  if (typeof parsedBody !== "object" || parsedBody === null || Array.isArray(parsedBody)) {
    return json({ ok: false, error: "Corpo inválido." }, { status: 400 });
  }
  const payload = parsedBody as SubmitPayload;

  // 4. Honeypot — bot preencheu o campo invisível. Finge sucesso, não persiste.
  if (typeof payload.website === "string" && payload.website.trim() !== "") {
    return json({ ok: true, id: "", email: "skipped" });
  }

  // 5. Tempo mínimo de preenchimento — submissão instantânea = bot.
  const startedAt = typeof payload.startedAt === "number" ? payload.startedAt : 0;
  if (startedAt && Date.now() - startedAt < MIN_FILL_TIME_MS) {
    return json({ ok: true, id: "", email: "skipped" });
  }

  // 6. Rate limit por IP (backend compartilhado via Supabase; fallback em memória)
  const ip = clientIp(request);
  const rate = await enforceRateLimit(`diagnostico:${ip}`);
  if (!rate.ok) {
    return json(
      { ok: false, error: "Muitas tentativas. Tente novamente em alguns minutos." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
    );
  }

  // 7. Validação server-side (zod), sobre os dados já sanitizados
  const parsed = diagnosticoSchema.safeParse(sanitizeInput(payload as Record<string, unknown>));
  if (!parsed.success) {
    return json({ ok: false, error: "Alguns dados não são válidos. Revise o formulário." }, { status: 400 });
  }
  const data = parsed.data;

  // 8. Dedupe — duplo clique / retry rápido devolvem o mesmo resultado,
  //    sem novo insert e sem novo e-mail.
  const dedupKey =
    "diagnostico:" +
    createHash("sha256")
      .update([data.nomeEmpresa, data.whatsapp, data.email ?? ""].join("|").toLowerCase())
      .digest("hex");
  const cached = getDedup<ApiOk>(dedupKey);
  if (cached) return json({ ...cached, duplicate: true });

  // 9. PERSISTÊNCIA (antes do e-mail)
  const persisted = await persistDiagnostico(data);
  if (!persisted.ok) {
    return json(
      { ok: false, error: "Não conseguimos registrar agora. Tente novamente em instantes." },
      { status: 503 }
    );
  }
  const { id } = persisted.record;

  // 10. NOTIFICAÇÃO — só depois do lead salvo. Falha aqui NÃO perde o lead.
  const receivedAt = new Date(persisted.record.createdAt);
  let email: EmailStatus;
  try {
    email = await sendDiagnosticoNotification({ diagnostico: data, id, receivedAt });
  } catch {
    email = { status: "error", reason: "unexpected" };
  }
  if (email.status === "error") {
    console.error(
      `[diagnostico] lead ${id} salvo (${persisted.driver}), mas a notificação falhou: ${email.reason}. ` +
        `Registro preservado pra reenvio.`
    );
  } else if (email.status === "skipped") {
    console.warn(
      `[diagnostico] lead ${id} salvo (${persisted.driver}); notificação NÃO enviada (${email.reason}). ` +
        `Configure DIAGNOSTIC_NOTIFICATION_EMAIL / RESEND_API_KEY.`
    );
  }

  // 11. Sucesso — guarda no dedupe e responde.
  const result: ApiOk = { ok: true, id, email: email.status };
  setDedup(dedupKey, result);
  return json(result);
}

/** Qualquer outro método → 405. */
export async function GET() {
  return json({ ok: false, error: "Método não permitido." }, { status: 405, headers: { Allow: "POST" } });
}
export const PUT = GET;
export const PATCH = GET;
export const DELETE = GET;
