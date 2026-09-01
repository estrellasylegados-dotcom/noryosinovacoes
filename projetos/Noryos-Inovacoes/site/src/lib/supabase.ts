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

  // A env continua se chamando SUPABASE_SERVICE_ROLE_KEY por compatibilidade,
  // mas o VALOR pode ser tanto a JWT service_role legada quanto uma Secret API
  // Key nova (`sb_secret_…`). Ambas são aceitas: nada aqui valida o formato — a
  // string é repassada como está e quem decide a validade é o servidor Supabase.
  // O `@supabase/supabase-js` (>= 2.x) já reconhece `sb_secret_…`. Só avisamos,
  // sem vazar o valor, se o formato for claramente o de uma chave de client.
  if (serviceRoleKey.startsWith("sb_publishable_") || serviceRoleKey.startsWith("anon")) {
    console.error(
      "[supabase] SUPABASE_SERVICE_ROLE_KEY parece ser uma chave de CLIENT (publishable/anon), " +
        "não uma credencial server-side (service_role JWT ou sb_secret_…). RLS vai bloquear as escritas."
    );
  }

  cached = createClient(url, serviceRoleKey, {
    // Cliente administrativo server-side: sem sessão, sem refresh, sem parsing de URL.
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
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
 *
 * -- Rate limit compartilhado do endpoint /api/diagnostico (ver src/lib/rate-limit.ts).
 * -- Janela fixa, atômica por linha (`for update`) — funciona com múltiplas
 * -- instâncias e sobrevive a restart do processo.
 *
 * create table if not exists diagnostico_rate_limit (
 *   key text primary key,
 *   hits integer not null default 0,
 *   window_start timestamptz not null default now()
 * );
 *
 * create or replace function diagnostico_check_rate_limit(
 *   p_key text, p_max integer, p_window_seconds integer
 * ) returns table (allowed boolean, retry_after integer)
 * language plpgsql as $$
 * declare
 *   rec diagnostico_rate_limit%rowtype;
 * begin
 *   insert into diagnostico_rate_limit (key) values (p_key)
 *     on conflict (key) do nothing;
 *   select * into rec from diagnostico_rate_limit where key = p_key for update;
 *
 *   if now() - rec.window_start >= make_interval(secs => p_window_seconds) then
 *     update diagnostico_rate_limit set hits = 1, window_start = now() where key = p_key;
 *     return query select true, 0; return;
 *   end if;
 *
 *   if rec.hits >= p_max then
 *     return query select false,
 *       greatest(1, ceil(extract(epoch from
 *         (rec.window_start + make_interval(secs => p_window_seconds) - now())))::integer);
 *     return;
 *   end if;
 *
 *   update diagnostico_rate_limit set hits = rec.hits + 1 where key = p_key;
 *   return query select true, 0;
 * end;
 * $$;
 *
 * -- opcional: limpeza periódica das janelas vencidas
 * -- delete from diagnostico_rate_limit where window_start < now() - interval '1 day';
 */
export const DIAGNOSTICOS_TABLE = "diagnosticos";
