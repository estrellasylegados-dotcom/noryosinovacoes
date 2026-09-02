-- ============================================================================
-- Diagnóstico Digital — Form V2 (respostas estruturadas)
-- Data: 2026-09-03
--
-- Migração ADITIVA e NÃO-DESTRUTIVA. Não altera nenhuma linha existente:
-- todas as colunas novas são nullable e ficam NULL nos registros pré-v2.
-- Não renomeia, não muda tipo, não faz UPDATE em massa, não mexe em índice
-- existente. Rollback = ignorar as colunas (ou `drop column if exists`).
--
-- O scoring V1 (src/lib/diagnostico-scoring.ts) NÃO muda: mesmos pesos,
-- mesmas faixas, scoring_version = 'v1'. Estas colunas NÃO entram no
-- algoritmo — o Form V2 melhora a ORIGEM do sinal (respostas estruturadas
-- viram texto legado determinístico via src/lib/diagnostico-compose.ts).
--
-- Rodar uma vez no SQL Editor do projeto Supabase de produção.
-- ============================================================================

alter table public.diagnosticos add column if not exists form_version       text;   -- 'v2' | NULL(legado)
alter table public.diagnosticos add column if not exists respostas          jsonb;  -- respostas estruturadas completas
alter table public.diagnosticos add column if not exists prazo              text;   -- o_quanto_antes | ate_30_dias | ate_90_dias | 3_a_6_meses | pesquisando
alter table public.diagnosticos add column if not exists objetivo_principal text;   -- slug do objetivo principal
alter table public.diagnosticos add column if not exists porte              text;   -- autonomo | 2_5 | 6_20 | 21_50 | 51_mais | nao_informar

create index if not exists diagnosticos_form_version_idx       on public.diagnosticos (form_version);
create index if not exists diagnosticos_prazo_idx              on public.diagnosticos (prazo);
create index if not exists diagnosticos_objetivo_principal_idx on public.diagnosticos (objetivo_principal);

-- Verificação rápida (opcional):
--   select column_name, data_type
--   from information_schema.columns
--   where table_name = 'diagnosticos'
--     and column_name in ('form_version','respostas','prazo','objetivo_principal','porte')
--   order by column_name;
