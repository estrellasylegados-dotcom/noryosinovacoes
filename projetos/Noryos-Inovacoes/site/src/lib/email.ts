import { appendFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import type { DiagnosticoInput } from "@/app/diagnostico/schema";
import {
  CLASSIFICACAO_LABEL,
  PRIORIDADE_LABEL,
  type DiagnosticoScoring,
} from "@/lib/diagnostico-scoring";

/**
 * Notificação interna do Diagnóstico Digital.
 *
 * Destinatário: **exclusivamente** `process.env.DIAGNOSTIC_NOTIFICATION_EMAIL`
 * (server-side, sem `NEXT_PUBLIC_`). Nunca vem do formulário — o visitante
 * não escolhe pra quem o sistema envia.
 *
 * Provedores (`DIAGNOSTIC_EMAIL_PROVIDER`):
 * - `resend` (default) — transacional via API HTTP, `fetch` puro (sem SDK).
 * - `mock` — grava o e-mail em `.data/diagnostico.email-mock.jsonl` em vez de
 *   enviar. Só pra dev/teste (a suíte E2E usa isso pra não disparar e-mail
 *   real). Bloqueado em produção sem `DIAGNOSTIC_ALLOW_FILE_FALLBACK=1`.
 *
 * Trocar de provedor real é reescrever só `sendViaProvider()`.
 *
 * Esta função **nunca lança**. Devolve um status pra quem chamou registrar.
 * O lead já foi persistido antes daqui; se o e-mail falhar, o registro
 * continua no banco pra reenvio posterior.
 */

export type EmailStatus =
  | { status: "sent"; provider: string; providerId: string | null }
  | { status: "skipped"; reason: "no_recipient" | "no_credentials" | "provider_not_configured" }
  | { status: "error"; reason: string };

export type NotificationInput = {
  diagnostico: DiagnosticoInput;
  id: string;
  receivedAt: Date;
  /** Qualificação comercial V1 (determinística). Ver src/lib/diagnostico-scoring.ts. */
  scoring: DiagnosticoScoring;
};

const PROVIDER = (process.env.DIAGNOSTIC_EMAIL_PROVIDER ?? "resend").toLowerCase();

/** Remetente. Em produção, usar um endereço no domínio verificado no provedor. */
const FROM = process.env.DIAGNOSTIC_NOTIFICATION_FROM ?? "Noryos Diagnóstico <onboarding@resend.dev>";

function fmtDateBR(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(d);
}

function line(label: string, value?: string | null) {
  return `${label}:\n${value && value.trim() ? value.trim() : "—"}\n`;
}

/** Lista em texto puro; "— nenhum" quando vazia. */
function bullets(items: string[]): string {
  return items.length ? items.map((i) => `- ${i}`).join("\n") : "- —";
}

/** Escapa `& < >` pro corpo HTML; devolve "—" quando vazio. */
function escHtml(s?: string | null): string {
  return (s && s.trim() ? s.trim() : "—").replace(
    /[&<>]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!)
  );
}

/**
 * Resumo comercial (topo do e-mail) — o que a Noryos bate o olho primeiro.
 * Emoji/chamada forte no subject SÓ pra `prioridade_comercial` (85+): abaixo
 * disso o subject é neutro, pra não banalizar o alerta.
 */
function buildAnaliseComercial(d: DiagnosticoInput, s: DiagnosticoScoring) {
  const alta = s.classificacao === "prioridade_comercial";
  const subject = alta
    ? `🔥 ${s.potencialComercial}/100 — Novo Diagnóstico — ${d.nomeEmpresa}`
    : `Novo Diagnóstico Digital Noryos — ${d.nomeEmpresa}`;

  const gapsTitulos = s.gaps.map((g) => g.titulo);

  const text =
    `NOVO DIAGNÓSTICO DIGITAL\n\n` +
    `Empresa: ${d.nomeEmpresa}\n` +
    `Potencial comercial: ${s.potencialComercial}/100\n` +
    `Maturidade digital: ${s.maturidadeDigital}/100\n` +
    `Classificação: ${CLASSIFICACAO_LABEL[s.classificacao]}\n` +
    `Prioridade: ${PRIORIDADE_LABEL[s.prioridade]}\n\n` +
    `Principais gaps:\n${bullets(gapsTitulos)}\n\n` +
    `Serviços sugeridos:\n${bullets(s.servicosRecomendados)}\n\n` +
    `Próxima ação:\n${s.proximaAcao}\n\n` +
    `Scoring: ${s.scoringVersion}\n` +
    `${"─".repeat(28)}\nDADOS ENVIADOS PELO LEAD\n\n`;

  const chipBg = alta ? "#fee2e2" : "#e0f2fe";
  const chipFg = alta ? "#991b1b" : "#075985";
  const htmlList = (items: string[]) =>
    items.length
      ? `<ul style="margin:4px 0 0;padding-left:18px">${items.map((i) => `<li>${escHtml(i)}</li>`).join("")}</ul>`
      : `<p style="margin:4px 0 0;color:#64748b">—</p>`;

  const html =
    `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;line-height:1.5;color:#0f172a">` +
    `<h2 style="margin:0 0 4px;font-size:18px">Novo Diagnóstico Digital</h2>` +
    `<p style="margin:0 0 14px;font-size:15px"><strong>${escHtml(d.nomeEmpresa)}</strong></p>` +
    `<table style="border-collapse:collapse;margin-bottom:14px">` +
    `<tr><td style="padding:3px 14px 3px 0;color:#64748b">Potencial comercial</td><td style="padding:3px 0"><strong>${s.potencialComercial}/100</strong> <span style="background:${chipBg};color:${chipFg};border-radius:4px;padding:1px 8px;font-size:12px">${escHtml(CLASSIFICACAO_LABEL[s.classificacao])}</span></td></tr>` +
    `<tr><td style="padding:3px 14px 3px 0;color:#64748b">Maturidade digital</td><td style="padding:3px 0">${s.maturidadeDigital}/100</td></tr>` +
    `<tr><td style="padding:3px 14px 3px 0;color:#64748b">Prioridade</td><td style="padding:3px 0">${escHtml(PRIORIDADE_LABEL[s.prioridade])}</td></tr>` +
    `</table>` +
    `<p style="margin:0;color:#64748b">Principais gaps</p>${htmlList(gapsTitulos)}` +
    `<p style="margin:12px 0 0;color:#64748b">Serviços sugeridos</p>${htmlList(s.servicosRecomendados)}` +
    `<p style="margin:12px 0 0;color:#64748b">Próxima ação</p><p style="margin:4px 0 0"><strong>${escHtml(s.proximaAcao)}</strong></p>` +
    `<p style="margin:14px 0 0;font-size:12px;color:#94a3b8">Scoring ${escHtml(s.scoringVersion)}</p>` +
    `<hr style="border:none;border-top:1px solid #e2e8f0;margin:18px 0"/>`;

  return { subject, text, html };
}

export function buildNotificationBody({ diagnostico: d, id, receivedAt, scoring }: NotificationInput) {
  const analise = buildAnaliseComercial(d, scoring);
  const subject = analise.subject;

  const text =
    analise.text +
    line("Empresa", d.nomeEmpresa) +
    line("Responsável", d.responsavel) +
    line("E-mail", d.email) +
    line("WhatsApp", d.whatsapp) +
    line("Cidade", d.cidade) +
    line("Segmento", d.segmento) +
    line("Site", d.site) +
    line("Instagram", d.instagram) +
    line("Google Business", d.googleBusiness) +
    line("Como consegue clientes hoje", d.comoConquistaClientes) +
    line("Objetivo", d.objetivo) +
    line("Principal dificuldade", d.dificuldade) +
    line("Observações", d.observacoes) +
    line("ID do diagnóstico", id) +
    line("Recebido em", `${fmtDateBR(receivedAt)} (America/Sao_Paulo)`);

  const row = (label: string, value?: string | null) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#64748b;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:4px 0;color:#0f172a">${escHtml(value)}</td></tr>`;

  const html =
    analise.html +
    `<h3 style="margin:0 0 12px;font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em">Dados enviados pelo lead</h3>` +
    `<table style="border-collapse:collapse">` +
    row("Empresa", d.nomeEmpresa) +
    row("Responsável", d.responsavel) +
    row("E-mail", d.email) +
    row("WhatsApp", d.whatsapp) +
    row("Cidade", d.cidade) +
    row("Segmento", d.segmento) +
    row("Site", d.site) +
    row("Instagram", d.instagram) +
    row("Google Business", d.googleBusiness) +
    row("Como consegue clientes hoje", d.comoConquistaClientes) +
    row("Objetivo", d.objetivo) +
    row("Principal dificuldade", d.dificuldade) +
    row("Observações", d.observacoes) +
    row("ID do diagnóstico", id) +
    row("Recebido em", `${fmtDateBR(receivedAt)} (America/Sao_Paulo)`) +
    `</table></div>`;

  return { subject, text, html };
}

const MOCK_FILE = path.join(process.cwd(), ".data", "diagnostico.email-mock.jsonl");
const MOCK_ALLOWED =
  process.env.NODE_ENV !== "production" || process.env.DIAGNOSTIC_ALLOW_FILE_FALLBACK === "1";

async function sendViaMock(to: string, subject: string, text: string): Promise<EmailStatus> {
  if (!MOCK_ALLOWED) return { status: "error", reason: "mock_blocked_in_production" };
  const providerId = `mock_${randomUUID()}`;
  try {
    await mkdir(path.dirname(MOCK_FILE), { recursive: true });
    await appendFile(
      MOCK_FILE,
      // `textPreview` cobre o bloco de análise comercial inteiro (topo do
      // corpo) — a suíte E2E asserta o conteúdo do resumo aqui.
      JSON.stringify({ at: new Date().toISOString(), to, subject, textPreview: text.slice(0, 1400), providerId }) + "\n",
      "utf8"
    );
  } catch {
    return { status: "error", reason: "mock_write_failed" };
  }
  return { status: "sent", provider: "mock", providerId };
}

async function sendViaProvider(to: string, subject: string, text: string, html: string): Promise<EmailStatus> {
  if (PROVIDER === "mock") {
    return sendViaMock(to, subject, text);
  }

  if (PROVIDER === "resend") {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return { status: "skipped", reason: "no_credentials" };

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: FROM, to: [to], subject, text, html }),
      });

      if (!res.ok) {
        // Corpo do provedor pode trazer detalhe de conta — só o status sobe pro log.
        return { status: "error", reason: `provider_http_${res.status}` };
      }
      const data = (await res.json().catch(() => null)) as { id?: string } | null;
      return { status: "sent", provider: "resend", providerId: data?.id ?? null };
    } catch {
      return { status: "error", reason: "provider_unreachable" };
    }
  }

  return { status: "skipped", reason: "provider_not_configured" };
}

export async function sendDiagnosticoNotification(input: NotificationInput): Promise<EmailStatus> {
  const to = process.env.DIAGNOSTIC_NOTIFICATION_EMAIL;
  if (!to) return { status: "skipped", reason: "no_recipient" };

  const { subject, text, html } = buildNotificationBody(input);
  return sendViaProvider(to, subject, text, html);
}
