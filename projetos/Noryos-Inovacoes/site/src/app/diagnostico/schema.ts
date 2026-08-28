import { z } from "zod";

/**
 * Só o necessário — nada de campo "porque pode ser útil algum dia".
 * `consentimento` é obrigatório (LGPD, ver seção 12/36 do briefing).
 */
export const diagnosticoSchema = z.object({
  nomeEmpresa: z.string().min(2, "Informe o nome da empresa"),
  responsavel: z.string().min(2, "Informe seu nome"),
  whatsapp: z.string().min(8, "Informe um WhatsApp válido"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  cidade: z.string().optional().or(z.literal("")),
  segmento: z.string().optional().or(z.literal("")),
  site: z.string().optional().or(z.literal("")),
  instagram: z.string().optional().or(z.literal("")),
  googleBusiness: z.string().optional().or(z.literal("")),
  comoConquistaClientes: z.string().optional().or(z.literal("")),
  dificuldade: z.string().optional().or(z.literal("")),
  objetivo: z.string().optional().or(z.literal("")),
  observacoes: z.string().optional().or(z.literal("")),
  consentimento: z.literal(true, {
    message: "É necessário aceitar o contato da Noryos para enviar",
  }),
});

export type DiagnosticoInput = z.infer<typeof diagnosticoSchema>;

export const diagnosticoSteps = [
  { titulo: "Sobre a empresa", campos: ["nomeEmpresa", "responsavel", "whatsapp", "email", "cidade", "segmento"] },
  { titulo: "Presença digital", campos: ["site", "instagram", "googleBusiness"] },
  { titulo: "Aquisição de clientes", campos: ["comoConquistaClientes"] },
  { titulo: "Atendimento e processos", campos: ["dificuldade"] },
  { titulo: "Objetivos", campos: ["objetivo", "observacoes", "consentimento"] },
] as const;
