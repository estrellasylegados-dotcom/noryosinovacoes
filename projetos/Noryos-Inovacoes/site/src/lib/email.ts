import { appendFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import type { DiagnosticoInput } from "@/app/diagnostico/schema";

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

export function buildNotificationBody({ diagnostico: d, id, receivedAt }: NotificationInput) {
  const subject = `Novo Diagnóstico Digital Noryos — ${d.nomeEmpresa}`;

  const text =
    `Novo Diagnóstico Digital recebido\n\n` +
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

  const esc = (s?: string | null) =>
    (s && s.trim() ? s.trim() : "—").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
  const row = (label: string, value?: string | null) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#64748b;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:4px 0;color:#0f172a">${esc(value)}</td></tr>`;

  const html =
    `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;line-height:1.5">` +
    `<h2 style="margin:0 0 16px;font-size:16px">Novo Diagnóstico Digital recebido</h2>` +
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
      JSON.stringify({ at: new Date().toISOString(), to, subject, textPreview: text.slice(0, 200), providerId }) + "\n",
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
