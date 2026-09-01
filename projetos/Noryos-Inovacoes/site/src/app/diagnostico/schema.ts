import { z } from "zod";

/**
 * Só o necessário — nada de campo "porque pode ser útil algum dia".
 * `consentimento` é obrigatório (LGPD, ver seção 12/36 do briefing).
 *
 * Todos os campos de texto têm `.trim()` + limite de tamanho: o limite
 * é a primeira barreira de sanitização (payload não pode inflar via um
 * campo gigante) e o servidor ainda passa tudo por `sanitizeText()`
 * antes de persistir / notificar.
 */
const shortText = (max = 160) => z.string().trim().max(max);
const longText = (max = 2000) => z.string().trim().max(max);

/**
 * Campo de URL/link "leniente": aceita vazio, ou algo que ao menos pareça um
 * endereço — sem espaços e com um ponto (`exemplo.com.br`, `https://x.com/a`).
 * Não força `http://` pra não atrapalhar quem digita só o domínio.
 */
const looseUrl = (max = 300) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((v) => v === "" || (!/\s/.test(v) && /\.[a-z]{2,}/i.test(v)), "Informe um endereço válido");

export const diagnosticoSchema = z.object({
  nomeEmpresa: z.string().trim().min(2, "Informe o nome da empresa").max(160),
  responsavel: z.string().trim().min(2, "Informe seu nome").max(160),
  whatsapp: z.string().trim().min(8, "Informe um WhatsApp válido").max(40),
  email: z.string().trim().email("E-mail inválido").max(180).optional().or(z.literal("")),
  cidade: shortText().optional().or(z.literal("")),
  segmento: shortText().optional().or(z.literal("")),
  site: looseUrl(300).optional().or(z.literal("")),
  instagram: shortText(300).optional().or(z.literal("")),
  googleBusiness: looseUrl(500).optional().or(z.literal("")),
  comoConquistaClientes: longText().optional().or(z.literal("")),
  dificuldade: longText().optional().or(z.literal("")),
  objetivo: longText().optional().or(z.literal("")),
  observacoes: longText().optional().or(z.literal("")),
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
