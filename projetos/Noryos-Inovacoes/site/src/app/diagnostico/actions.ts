"use server";

import { diagnosticoSchema, type DiagnosticoInput } from "./schema";
import { getSupabaseServerClient, DIAGNOSTICOS_TABLE } from "@/lib/supabase";

export type SubmitDiagnosticoResult = { ok: true } | { ok: false; error: string };

type SubmitPayload = DiagnosticoInput & {
  /** Honeypot — campo invisível pro usuário; se vier preenchido, é bot. */
  website?: string;
  /** timestamp (ms) de quando o formulário foi montado no cliente. */
  startedAt?: number;
};

const MIN_FILL_TIME_MS = 2500;

export async function submitDiagnostico(input: SubmitPayload): Promise<SubmitDiagnosticoResult> {
  // Proteção básica contra spam (seção 32 do briefing) — sem captcha visível,
  // sem fricção pro usuário real.
  if (input.website) {
    return { ok: true }; // finge sucesso pro bot, não dá pista de que foi bloqueado
  }
  if (input.startedAt && Date.now() - input.startedAt < MIN_FILL_TIME_MS) {
    return { ok: true };
  }

  const parsed = diagnosticoSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Alguns dados não são válidos. Revise o formulário." };
  }

  const data = parsed.data;
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    // Supabase ainda não configurado nesta fase — não bloqueia o lead,
    // apenas não persiste. Nenhum dado pessoal vai pro log.
    console.warn("[diagnostico] Supabase não configurado — lead recebido mas não persistido. Ver README → Supabase.");
    return { ok: true };
  }

  const { error } = await supabase.from(DIAGNOSTICOS_TABLE).insert({
    nome_empresa: data.nomeEmpresa,
    responsavel: data.responsavel,
    whatsapp: data.whatsapp,
    email: data.email || null,
    cidade: data.cidade || null,
    segmento: data.segmento || null,
    site: data.site || null,
    instagram: data.instagram || null,
    google_business: data.googleBusiness || null,
    objetivo: [data.comoConquistaClientes, data.objetivo].filter(Boolean).join(" | ") || null,
    dificuldade: data.dificuldade || null,
    observacoes: data.observacoes || null,
    status: "novo",
  });

  if (error) {
    console.error("[diagnostico] Falha ao gravar no Supabase:", error.message);
    return { ok: false, error: "Não conseguimos registrar agora. Tente novamente em instantes." };
  }

  return { ok: true };
}
