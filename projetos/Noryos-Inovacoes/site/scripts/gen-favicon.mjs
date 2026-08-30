/**
 * Gera os assets de favicon a partir do símbolo oficial da Noryos.
 *
 * Fonte única: public/noryos-icon.png (1254x1254, fundo transparente).
 * NÃO redesenha, NÃO recolore, NÃO adiciona margem/fundo — apenas
 * reamostra o símbolo oficial para os tamanhos técnicos.
 *
 * Saídas:
 *   src/app/favicon.ico   — multi-resolução 16 / 32 / 48
 *   src/app/icon.png      — 512x512 (convenção App Router)
 *   src/app/apple-icon.png — 180x180 (padrão Apple touch icon)
 *
 * Requer devDeps temporários: npm i -D jimp to-ico
 * Rodar:                     node scripts/gen-favicon.mjs
 * Depois:                    npm un -D jimp to-ico
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { Jimp, ResizeStrategy } from "jimp";
import toIco from "to-ico";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = resolve(root, "public/noryos-icon.png");

async function pngAt(size) {
  const img = await Jimp.read(SRC);
  img.resize({ w: size, h: size, mode: ResizeStrategy.BICUBIC });
  return img.getBuffer("image/png");
}

const [p16, p32, p48, p512, p180] = await Promise.all([
  pngAt(16),
  pngAt(32),
  pngAt(48),
  pngAt(512),
  pngAt(180),
]);

await writeFile(resolve(root, "src/app/favicon.ico"), await toIco([p16, p32, p48]));
await writeFile(resolve(root, "src/app/icon.png"), p512);
await writeFile(resolve(root, "src/app/apple-icon.png"), p180);

const srcBytes = (await readFile(SRC)).length;
console.log("fonte  public/noryos-icon.png ", srcBytes, "bytes (1254x1254)");
console.log("gerado src/app/favicon.ico    16/32/48");
console.log("gerado src/app/icon.png       512x512");
console.log("gerado src/app/apple-icon.png 180x180");
