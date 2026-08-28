import type { Metadata } from "next";
import { SolutionPage } from "@/components/SolutionPage";
import { solucoesDetalhe } from "@/content/solucoes-detalhe";

const data = solucoesDetalhe.automacoes;

export const metadata: Metadata = {
  title: data.titulo,
  description: data.subtitulo,
  alternates: { canonical: "/solucoes/automacoes" },
};

export default function Page() {
  return <SolutionPage data={data} />;
}
