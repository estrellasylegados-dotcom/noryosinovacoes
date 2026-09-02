import { randomUUID } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { getSupabaseServerClient, DIAGNOSTICOS_TABLE } from "@/lib/supabase";
import type { DiagnosticoInput, DiagnosticoSubmission } from "@/app/diagnostico/schema";
import type { DiagnosticoScoring } from "@/lib/diagnostico-scoring";

/**
 * Objeto gravado em `respostas` (jsonb) — as respostas ESTRUTURADAS do Form
 * V2, auditáveis, sem duplicar o que já vira coluna. Só campos preenchidos.
 */
function buildRespostas(sub: DiagnosticoSubmission) {
  const orNull = (v: string | undefined) => (v && v.trim() ? v.trim() : null);
  return {
    presenca: sub.presenca,
    links: {
      site: orNull(sub.site),
      instagram: orNull(sub.instagram),
      google_perfil: orNull(sub.googleBusiness),
    },
    canais: sub.canais,
    canais_outro: orNull(sub.canaisOutro),
    ferramentas: sub.ferramentas,
    organizacao: sub.organizacao || null,
    dificuldade_principal: sub.dificuldadePrincipal || null,
    dificuldade_outro: orNull(sub.dificuldadeOutro),
    objetivo_principal: sub.objetivoPrincipal,
    objetivo_outro: orNull(sub.objetivoOutro),
    prazo: sub.prazo,
    porte: sub.porte || null,
    notas: {
      aquisicao: orNull(sub.aquisicaoNota),
      dificuldade: orNull(sub.dificuldadeNota),
      objetivo: orNull(sub.objetivoNota),
    },
  };
}

/**
 * Persistência do Diagnóstico Digital.
 *
 * Driver primário: **Supabase** (quando `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
 * existem). É o alvo de produção.
 *
 * Fallback: **arquivo JSONL local** (`site/.data/diagnostico.local.jsonl`,
 * git-ignorado). É um recurso de **dev/teste**, nunca um armazenamento
 * alternativo silencioso de produção:
 *
 * - Em produção (`NODE_ENV === "production"`) o fallback fica **desligado**
 *   por padrão. Sem Supabase, ou com o insert falhando, `persistDiagnostico`
 *   devolve `{ ok: false }` → o endpoint responde erro controlado (503) e
 *   loga de forma segura (sem PII). A falha de persistência não é mascarada.
 * - Só é permitido em produção com `DIAGNOSTIC_ALLOW_FILE_FALLBACK=1`
 *   explícito (usado, por ex., pelo servidor da suíte E2E). Nesse caso cada
 *   gravação loga um WARN identificando que é fallback.
 * - Em dev/teste (`NODE_ENV !== "production"`) o fallback é permitido e
 *   também logado.
 */

const FILE_FALLBACK_ALLOWED =
  process.env.NODE_ENV !== "production" || process.env.DIAGNOSTIC_ALLOW_FILE_FALLBACK === "1";

export type StoredDiagnostico = {
  id: string;
  createdAt: string; // ISO
};

export type PersistResult =
  | { ok: true; record: StoredDiagnostico; driver: "supabase" | "file" }
  | { ok: false; error: string; driver: "supabase" | "file" };

const LOCAL_FILE = path.join(process.cwd(), ".data", "diagnostico.local.jsonl");

/**
 * Monta a linha da tabela `diagnosticos`.
 *
 * `data` (forma LEGADA) preenche as colunas de sempre — inclusive as de
 * texto (`objetivo` / `dificuldade` / `observacoes`), que agora recebem o
 * texto COMPOSTO a partir das respostas estruturadas (`composeLegacyText`).
 * Consultas e o scoring que leem essas colunas continuam funcionando.
 *
 * Quando `scoring` é passado (fluxo normal — o endpoint pontua entre o dedupe
 * e a persistência), grava também as colunas de qualificação:
 *   - `score`              → potencial comercial (0–100), score principal
 *   - `maturidade_digital` → maturidade digital (0–100)
 *   - `classificacao`, `prioridade`, `scoring_version` → filtro/relatório
 *   - `resultado` (jsonb)  → objeto completo e auditável do scoring
 *
 * Quando `sub` é passado (Form V2), grava as colunas ADITIVAS:
 *   - `form_version` = "v2"
 *   - `respostas` (jsonb) → respostas estruturadas completas
 *   - `prazo`, `objetivo_principal`, `porte` → promovidas p/ filtro direto
 * Sem `scoring`/`sub` (chamada legada / teste), essas colunas ficam NULL —
 * como nos registros pré-v1 / pré-v2. Migração aditiva, nada destrutivo.
 */
function toRow(data: DiagnosticoInput, scoring?: DiagnosticoScoring, sub?: DiagnosticoSubmission) {
  return {
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
    status: "novo" as const,
    ...(scoring
      ? {
          score: scoring.potencialComercial,
          maturidade_digital: scoring.maturidadeDigital,
          classificacao: scoring.classificacao,
          prioridade: scoring.prioridade,
          scoring_version: scoring.scoringVersion,
          resultado: scoring,
        }
      : {}),
    ...(sub
      ? {
          form_version: "v2" as const,
          respostas: buildRespostas(sub),
          prazo: sub.prazo,
          objetivo_principal: sub.objetivoPrincipal,
          porte: sub.porte || null,
        }
      : {}),
  };
}

export async function persistDiagnostico(
  data: DiagnosticoInput,
  scoring?: DiagnosticoScoring,
  sub?: DiagnosticoSubmission
): Promise<PersistResult> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data: inserted, error } = await supabase
      .from(DIAGNOSTICOS_TABLE)
      .insert(toRow(data, scoring, sub))
      .select("id, created_at")
      .single();

    if (error || !inserted) {
      // Log técnico p/ diagnosticar a causa (ver scripts/supabase-doctor.mjs).
      // NÃO contém PII do lead: code/status/message/hint do PostgREST são de
      // schema/permissão; `details` pode ecoar valor de constraint, então vai
      // sanitizado. NÃO cai pro fallback: falha de persistência em produção
      // tem que virar erro controlado.
      const e = (error ?? {}) as { code?: string; message?: string; hint?: string; details?: string; status?: number };
      console.error(
        "[diagnostico] supabase_insert_failed",
        JSON.stringify({
          step: "insert:diagnosticos",
          code: e.code ?? null,
          status: e.status ?? null,
          message: (e.message ?? "").slice(0, 300) || null,
          hint: (e.hint ?? "").slice(0, 200) || null,
          details: (e.details ?? "").replace(/=\([^)]*\)/g, "=(<redacted>)").slice(0, 200) || null,
        })
      );
      return { ok: false, error: "persist_failed", driver: "supabase" };
    }

    return {
      ok: true,
      driver: "supabase",
      record: { id: String(inserted.id), createdAt: String(inserted.created_at) },
    };
  }

  // --- Sem Supabase configurado ---
  if (!FILE_FALLBACK_ALLOWED) {
    // Produção sem Supabase e sem opt-in explícito: não inventa armazenamento.
    console.error(
      "[diagnostico] supabase_client_absent",
      JSON.stringify({
        step: "getSupabaseServerClient",
        reason: "SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY ausentes ou não carregadas pelo processo",
        SUPABASE_URL_present: Boolean(process.env.SUPABASE_URL),
        SUPABASE_SERVICE_ROLE_KEY_present: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      })
    );
    return { ok: false, error: "persist_unavailable", driver: "supabase" };
  }

  // --- Fallback local (dev/teste, ou opt-in explícito) ---
  console.warn(
    `[diagnostico] FALLBACK LOCAL ativo (NODE_ENV=${process.env.NODE_ENV ?? "undefined"}) — ` +
      "gravando em .data/diagnostico.local.jsonl. Não é armazenamento de produção; configure Supabase."
  );

  const record: StoredDiagnostico = { id: randomUUID(), createdAt: new Date().toISOString() };
  try {
    await mkdir(path.dirname(LOCAL_FILE), { recursive: true });
    await appendFile(LOCAL_FILE, JSON.stringify({ ...record, ...toRow(data, scoring, sub) }) + "\n", "utf8");
    return { ok: true, record, driver: "file" };
  } catch (err) {
    console.error("[diagnostico] fallback local falhou:", err instanceof Error ? err.name : "erro");
    return { ok: false, error: "persist_failed", driver: "file" };
  }
}

export { LOCAL_FILE as DIAGNOSTICO_LOCAL_FILE };
