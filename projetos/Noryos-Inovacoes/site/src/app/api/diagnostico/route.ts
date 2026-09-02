import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import {
  diagnosticoSchema,
  diagnosticoSubmissionSchema,
  linksObrigatoriosFaltando,
  type DiagnosticoInput,
  type DiagnosticoSubmission,
} from "@/app/diagnostico/schema";
import { submissionToDiagnosticoInput } from "@/lib/diagnostico-compose";
import { scoreDiagnostico } from "@/lib/diagnostico-scoring";
import { persistDiagnostico } from "@/lib/diagnostico-store";
import { sendDiagnosticoNotification, type EmailStatus } from "@/lib/email";
import { enforceRateLimit, getDedup, setDedup } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";

/**
 * POST /api/diagnostico — endpoint do Diagnóstico Digital Noryos (Form V2).
 *
 * Pipeline (nessa ordem, ver briefing → seções ANTI-SPAM / DUPLICIDADE):
 *   método → Content-Type → tamanho do payload → JSON válido → honeypot →
 *   tempo mínimo de preenchimento → rate limit por origem (2 janelas:
 *   3/15min + 10/24h) → Cloudflare Turnstile (obrigatório, server-side) →
 *   validação da SUBMISSÃO V2 (zod, respostas estruturadas) → sanitização →
 *   regra de campo cruzado (link obrigatório se marcou que tem) →
 *   composição do texto LEGADO (`composeLegacyText`) → validação defensiva do
 *   `DiagnosticoInput` legado → dedupe → SCORING V1 (função pura, sem I/O) →
 *   PERSISTÊNCIA (lead + scoring + respostas estruturadas numa única linha) →
 *   (só então) NOTIFICAÇÃO por e-mail → resposta de sucesso.
 *
 * O scoring V1 NÃO MUDOU: mesmos pesos, mesmas faixas, `scoring_version =
 * "v1"`. O Form V2 melhora a ORIGEM do sinal — respostas estruturadas
 * viram, de forma determinística, o mesmo texto que os léxicos do scoring já
 * casavam (ver `src/lib/diagnostico-compose.ts`). `form_version = "v2"`.
 *
 * Turnstile é verificado ANTES de qualquer persistência ou e-mail. Uma
 * requisição classificada como spam NÃO persiste e NÃO dispara e-mail. Se o
 * e-mail falhar depois do lead salvo, o lead permanece (resposta 200).
 */

export const runtime = "nodejs";

const MAX_PAYLOAD_BYTES = 24 * 1024; // form V2 (com arrays) ainda cabe folgado
const MIN_FILL_TIME_MS = 2500;

type SubmitPayload = Record<string, unknown> & {
  website?: unknown; // honeypot
  startedAt?: unknown;
  turnstileToken?: unknown; // Cloudflare Turnstile — verificado server-side
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

/** Só strings; sem membros duplicados; teto de tamanho. O zod valida a
 *  pertinência ao enum depois (membro inválido → 400). */
function sanitizeSlugArray(value: unknown, cap = 20): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  for (const v of value) {
    if (typeof v === "string" && v.length <= 40) seen.add(v);
    if (seen.size >= cap) break;
  }
  return [...seen];
}

const asSlug = (v: unknown): string => (typeof v === "string" && v.length <= 40 ? v : "");

/** Sanitiza o corpo cru pro shape da submissão V2 (antes do zod). */
function sanitizeSubmission(raw: SubmitPayload) {
  return {
    nomeEmpresa: sanitizeText(raw.nomeEmpresa, 160),
    responsavel: sanitizeText(raw.responsavel, 160),
    whatsapp: sanitizeText(raw.whatsapp, 40),
    email: sanitizeText(raw.email, 180),
    cidade: sanitizeText(raw.cidade, 160),
    segmento: sanitizeText(raw.segmento, 160),
    porte: asSlug(raw.porte),

    presenca: sanitizeSlugArray(raw.presenca),
    site: sanitizeText(raw.site, 300),
    instagram: sanitizeText(raw.instagram, 300),
    googleBusiness: sanitizeText(raw.googleBusiness, 500),

    canais: sanitizeSlugArray(raw.canais),
    canaisOutro: sanitizeText(raw.canaisOutro, 160),
    aquisicaoNota: sanitizeText(raw.aquisicaoNota, 600),

    ferramentas: sanitizeSlugArray(raw.ferramentas),
    organizacao: asSlug(raw.organizacao),
    dificuldadePrincipal: asSlug(raw.dificuldadePrincipal),
    dificuldadeOutro: sanitizeText(raw.dificuldadeOutro, 160),
    dificuldadeNota: sanitizeText(raw.dificuldadeNota, 600),

    objetivoPrincipal: asSlug(raw.objetivoPrincipal),
    objetivoOutro: sanitizeText(raw.objetivoOutro, 160),
    objetivoNota: sanitizeText(raw.objetivoNota, 1000),
    prazo: asSlug(raw.prazo),

    consentimento: raw.consentimento === true,
  };
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

  // 6. Rate limit por origem — DUAS janelas (3/15min + 10/24h). Backend
  //    compartilhado via Supabase; fallback em memória. Ver src/lib/rate-limit.ts.
  const ip = clientIp(request);
  const rate = await enforceRateLimit(`diagnostico:${ip}`);
  if (!rate.ok) {
    return json(
      { ok: false, error: "Muitas tentativas. Tente novamente em alguns minutos." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
    );
  }

  // 7. Cloudflare Turnstile — verificação OBRIGATÓRIA server-side. Sem um
  //    token que a Cloudflare confirme, responde 403 e NÃO persiste nem
  //    envia e-mail. O TURNSTILE_SECRET_KEY nunca sai do servidor.
  const turnstile = await verifyTurnstileToken(payload.turnstileToken, ip);
  if (!turnstile.ok) {
    return json(
      {
        ok: false,
        error: "Não foi possível confirmar a verificação de segurança. Recarregue a página e tente novamente.",
      },
      { status: 403 }
    );
  }

  // 8. Validação da SUBMISSÃO V2 (zod), sobre os dados já sanitizados. Membro
  //    de multiselect fora do enum, opção inválida, obrigatório ausente
  //    (objetivo/prazo/consentimento) → 400.
  const parsedSub = diagnosticoSubmissionSchema.safeParse(sanitizeSubmission(payload));
  if (!parsedSub.success) {
    return json({ ok: false, error: "Alguns dados não são válidos. Revise o formulário." }, { status: 400 });
  }
  const sub: DiagnosticoSubmission = parsedSub.data;

  // 9. Regra de campo cruzado — marcou que TEM Site / Instagram / Perfil no
  //    Google mas não informou o link/@ → 400. Preserva a regra de presença
  //    do scoring V1 (presença = URL não-vazia).
  if (linksObrigatoriosFaltando(sub).length > 0) {
    return json(
      { ok: false, error: "Informe o link (ou @) dos perfis que você marcou como existentes." },
      { status: 400 }
    );
  }

  // 10. Composição do texto LEGADO + validação defensiva do DiagnosticoInput
  //     que o scoring V1 consome. Não deveria falhar (entradas já limitadas);
  //     se falhar, é 400 controlado, não 500.
  const data: DiagnosticoInput = submissionToDiagnosticoInput(sub);
  const parsedLegacy = diagnosticoSchema.safeParse(data);
  if (!parsedLegacy.success) {
    return json({ ok: false, error: "Alguns dados não são válidos. Revise o formulário." }, { status: 400 });
  }

  // 11. Dedupe — duplo clique / retry rápido devolvem o mesmo resultado,
  //     sem novo insert e sem novo e-mail. Mesma chave de sempre.
  const dedupKey =
    "diagnostico:" +
    createHash("sha256")
      .update([data.nomeEmpresa, data.whatsapp, data.email ?? ""].join("|").toLowerCase())
      .digest("hex");
  const cached = getDedup<ApiOk>(dedupKey);
  if (cached) return json({ ...cached, duplicate: true });

  // 12. SCORING V1 — qualificação comercial determinística. Função PURA (sem
  //     rede, sem I/O, sem estado). Ver src/lib/diagnostico-scoring.ts.
  const scoring = scoreDiagnostico(data);

  // 13. PERSISTÊNCIA (antes do e-mail) — lead + scoring + respostas
  //     estruturadas (respostas jsonb, form_version, prazo, objetivo_principal,
  //     porte) numa única linha. Colunas legadas seguem sendo gravadas.
  const persisted = await persistDiagnostico(data, scoring, sub);
  if (!persisted.ok) {
    return json(
      { ok: false, error: "Não conseguimos registrar agora. Tente novamente em instantes." },
      { status: 503 }
    );
  }
  const { id } = persisted.record;

  // 14. NOTIFICAÇÃO — só depois do lead salvo. Falha aqui NÃO perde o lead.
  //     O e-mail carrega o resumo do scoring no topo + o bloco de respostas
  //     estruturadas + os dados crus.
  const receivedAt = new Date(persisted.record.createdAt);
  let email: EmailStatus;
  try {
    email = await sendDiagnosticoNotification({ diagnostico: data, submission: sub, id, receivedAt, scoring });
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

  // 15. Sucesso — guarda no dedupe e responde.
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
