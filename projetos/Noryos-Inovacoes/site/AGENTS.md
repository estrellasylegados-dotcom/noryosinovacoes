# Next.js 15 (App Router)

Este projeto roda **Next.js 15.5.x** — App Router, React 19, TypeScript,
Tailwind v4.

## Por que 15 e não 16

Downgrade controlado de `16.3.3` → `15.5.24`. O binário nativo do
SWC/Turbopack do Next 16 (`@next/swc-linux-x64-gnu`) exige **GLIBC 2.29+**,
indisponível no ambiente de build da **Hostinger Web Apps** (glibc 2.28) —
o deploy quebrava com `version 'GLIBC_2.29' not found` e, em seguida,
`Failed to load next.config.ts`. Ver `DEPLOY-HOSTINGER.md`.

## Regras

- **Não** subir `next` pra 16.x sem antes confirmar que a Hostinger
  atualizou o glibc do ambiente de build — senão o deploy quebra de novo.
- Bundler de produção: **webpack** (padrão no Next 15). `next build` sem flags.
- Config em `next.config.mjs` (ESM puro, sem etapa de compilação de config).
- `output: "standalone"` + `outputFileTracingRoot` fixado nesta pasta são
  necessários pro deploy self-hospedado — não remover.
