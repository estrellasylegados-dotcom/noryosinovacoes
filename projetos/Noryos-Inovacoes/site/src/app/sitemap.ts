import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

const routes = [
  "",
  "/solucoes",
  "/solucoes/sites",
  "/solucoes/automacoes",
  "/solucoes/performance",
  "/sobre",
  "/diagnostico",
  "/contato",
  "/politica-de-privacidade",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
