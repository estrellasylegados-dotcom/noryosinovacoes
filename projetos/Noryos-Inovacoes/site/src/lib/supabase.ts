import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase preparado, mas condicional: enquanto o projeto Supabase
 * real não for criado (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes),
 * `getSupabaseServerClient()` retorna null — quem chama decide o fallback
 * (ex: log local, e-mail, ou apenas confirmar recebimento ao usuário).
 *
 * Nunca usar a service role key no client — este arquivo só deve ser
 * importado em Server Actions / Route Handlers, nunca em Client Components.
 */
let cached: SupabaseClient | null | undefined;

export function getSupabaseServerClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    cached = null;
    return cached;
  }

  cached = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
  return cached;
}

/**
 * DDL de referência pra tabela `diagnosticos` (rodar manualmente no
 * Supabase quando o projeto for criado — ver README.md → Supabase).
 *
 * create table diagnosticos (
 *   id uuid primary key default gen_random_uuid(),
 *   created_at timestamptz not null default now(),
 *   nome_empresa text not null,
 *   responsavel text not null,
 *   whatsapp text not null,
 *   email text,
 *   cidade text,
 *   segmento text,
 *   site text,
 *   instagram text,
 *   google_business text,
 *   objetivo text,
 *   dificuldade text,
 *   observacoes text,
 *   status text not null default 'novo'
 *     check (status in ('novo','em_analise','concluido','reuniao','proposta','cliente','perdido')),
 *   score integer,
 *   resultado jsonb
 * );
 */
export const DIAGNOSTICOS_TABLE = "diagnosticos";
