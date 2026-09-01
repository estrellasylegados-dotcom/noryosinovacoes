import { randomUUID } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { getSupabaseServerClient, DIAGNOSTICOS_TABLE } from "@/lib/supabase";
import type { DiagnosticoInput } from "@/app/diagnostico/schema";

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

function toRow(data: DiagnosticoInput) {
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
  };
}

export async function persistDiagnostico(data: DiagnosticoInput): Promise<PersistResult> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data: inserted, error } = await supabase
      .from(DIAGNOSTICOS_TABLE)
      .insert(toRow(data))
      .select("id, created_at")
      .single();

    if (error || !inserted) {
      // Mensagem do Supabase pode conter detalhe de schema — logamos curto,
      // sem PII, e devolvemos genérico pra cima. NÃO cai pro fallback: uma
      // falha de persistência em produção tem que virar erro controlado.
      console.error("[diagnostico] insert Supabase falhou:", error?.code ?? "sem_codigo");
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
      "[diagnostico] Supabase não configurado em produção e fallback local desabilitado — persistência indisponível."
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
    await appendFile(LOCAL_FILE, JSON.stringify({ ...record, ...toRow(data) }) + "\n", "utf8");
    return { ok: true, record, driver: "file" };
  } catch (err) {
    console.error("[diagnostico] fallback local falhou:", err instanceof Error ? err.name : "erro");
    return { ok: false, error: "persist_failed", driver: "file" };
  }
}

export { LOCAL_FILE as DIAGNOSTICO_LOCAL_FILE };
