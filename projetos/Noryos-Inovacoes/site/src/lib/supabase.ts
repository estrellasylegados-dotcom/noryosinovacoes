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
 *   -- Qualificação comercial automática (scoring V1, determinístico —
 *   -- ver src/lib/diagnostico-scoring.ts). Gravados num único insert, junto
 *   -- com o lead. Registros pré-v1 ficam com estas colunas NULL.
 *   score integer,              -- POTENCIAL COMERCIAL (0–100) — score principal
 *   maturidade_digital integer, -- MATURIDADE DIGITAL (0–100)
 *   classificacao text,         -- baixa_prioridade | oportunidade_fria | boa_oportunidade | oportunidade_quente | prioridade_comercial
 *   prioridade text,            -- baixa | media | alta | critica
 *   scoring_version text,       -- 'v1'
 *   resultado jsonb,            -- objeto completo e auditável (scores, criterios, gaps, servicosRecomendados, proximaAcao, qualidadeContato)
 *   -- Form V2 (respostas estruturadas — ver src/app/diagnostico/schema.ts +
 *   -- src/lib/diagnostico-compose.ts). Aditivas; leads pré-v2 ficam NULL.
 *   -- O scoring V1 NÃO mudou — estas colunas não entram no algoritmo.
 *   form_version text,          -- 'v2' (NULL = formulário legado)
 *   respostas jsonb,            -- respostas estruturadas completas (presenca, canais, ferramentas, organizacao, dificuldade_principal, objetivo_principal, prazo, porte, links, notas)
 *   prazo text,                 -- o_quanto_antes | ate_30_dias | ate_90_dias | 3_a_6_meses | pesquisando
 *   objetivo_principal text,    -- slug do objetivo principal (ver OBJETIVO_OPCOES)
 *   porte text                  -- autonomo | 2_5 | 6_20 | 21_50 | 51_mais | nao_informar
 * );
 *
 * create index if not exists diagnosticos_classificacao_idx      on diagnosticos (classificacao);
 * create index if not exists diagnosticos_prioridade_idx         on diagnosticos (prioridade);
 * create index if not exists diagnosticos_maturidade_digital_idx on diagnosticos (maturidade_digital);
 * create index if not exists diagnosticos_score_idx              on diagnosticos (score);
 * create index if not exists diagnosticos_form_version_idx       on diagnosticos (form_version);
 * create index if not exists diagnosticos_prazo_idx              on diagnosticos (prazo);
 * create index if not exists diagnosticos_objetivo_principal_idx on diagnosticos (objetivo_principal);
 *
 * -- Já existe um projeto Supabase? Migração ADITIVA, não-destrutiva (não
 * -- altera linhas existentes — as colunas novas ficam NULL):
 * --   alter table diagnosticos add column if not exists maturidade_digital integer;
 * --   alter table diagnosticos add column if not exists classificacao      text;
 * --   alter table diagnosticos add column if not exists prioridade         text;
 * --   alter table diagnosticos add column if not exists scoring_version    text;
 * --   (score e resultado já existiam; passam a ser preenchidos)
 * --   -- Form V2 (ver supabase/migrations/2026-09-03_diagnostico_form_v2.sql):
 * --   alter table diagnosticos add column if not exists form_version       text;
 * --   alter table diagnosticos add column if not exists respostas          jsonb;
 * --   alter table diagnosticos add column if not exists prazo              text;
 * --   alter table diagnosticos add column if not exists objetivo_principal text;
 * --   alter table diagnosticos add column if not exists porte              text;
 * --   + os create index acima.
 *
 * -- Rate limit compartilhado do endpoint /api/diagnostico (ver src/lib/rate-limit.ts).
 * -- Janela fixa, atômica por linha (`for update`) — funciona com múltiplas
 * -- instâncias e sobrevive a restart do processo. São DUAS janelas por
 * -- origem (curta 3/15min + longa 10/24h): a mesma função/tabela, chamada
 * -- com chaves distintas (`<chave>:15m`, `<chave>:24h`) e p_max/p_window
 * -- próprios. Nenhuma mudança de SQL entre uma e duas janelas.
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
