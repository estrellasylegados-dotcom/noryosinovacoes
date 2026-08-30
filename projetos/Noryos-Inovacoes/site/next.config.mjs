import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Deploy self-hospedado (Hostinger Web Apps / Node.js).
   *
   * `standalone` faz o `next build` gerar um servidor mínimo em
   * `.next/standalone/` contendo só os arquivos necessários pra rodar em
   * produção (inclui o subset de `node_modules` que o app usa). Reduz muito
   * o tamanho do deploy. `next start` continua funcionando localmente.
   */
  output: "standalone",

  /**
   * O site vive num subdiretório de um repositório maior (workspace MazyOS).
   * Sem isso, o Next pode inferir a raiz de tracing errada ao encontrar
   * `.git` / lockfiles acima na árvore. Fixa a raiz nesta pasta.
   */
  outputFileTracingRoot: __dirname,

  /**
   * Sem otimização de imagem em runtime. O deploy Hostinger Web Apps roda
   * `next start` num ambiente enxuto — o otimizador (`sharp`) é uma fonte
   * extra de falha e reprocessa os PNGs. Os ativos de marca (logo/ícone)
   * devem ser servidos exatamente como fornecidos, então servimos estáticos.
   */
  images: { unoptimized: true },
};

export default nextConfig;
