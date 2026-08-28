"use client";

import { FormEvent, useState } from "react";
import { diagnosticoSteps } from "@/app/diagnostico/schema";
import { submitDiagnostico } from "@/app/diagnostico/actions";
import { Button } from "./ui/Button";

type FormState = Record<string, string | boolean>;

const initialState: FormState = {
  nomeEmpresa: "",
  responsavel: "",
  whatsapp: "",
  email: "",
  cidade: "",
  segmento: "",
  site: "",
  instagram: "",
  googleBusiness: "",
  comoConquistaClientes: "",
  dificuldade: "",
  objetivo: "",
  observacoes: "",
  consentimento: false,
  website: "", // honeypot
};

const fieldLabels: Record<string, string> = {
  nomeEmpresa: "Nome da empresa",
  responsavel: "Seu nome",
  whatsapp: "WhatsApp",
  email: "E-mail",
  cidade: "Cidade",
  segmento: "Segmento / ramo de atuação",
  site: "Site atual (se tiver)",
  instagram: "Instagram",
  googleBusiness: "Link do Google Business Profile (se tiver)",
  comoConquistaClientes: "Como sua empresa consegue clientes hoje?",
  dificuldade: "Qual sua maior dificuldade com atendimento ou processos hoje?",
  objetivo: "Qual o principal objetivo com a operação digital agora?",
  observacoes: "Alguma informação adicional que ajude a entender seu contexto?",
};

const requiredFields = new Set(["nomeEmpresa", "responsavel", "whatsapp"]);
const textareaFields = new Set(["comoConquistaClientes", "dificuldade", "objetivo", "observacoes"]);

export function DiagnosticoForm() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<FormState>(initialState);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [startedAt] = useState(() => Date.now());

  const isLastStep = step === diagnosticoSteps.length - 1;
  const currentStep = diagnosticoSteps[step];

  function update(field: string, value: string | boolean) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function validateStep(): boolean {
    for (const field of currentStep.campos) {
      if (field === "consentimento" && !values.consentimento) return false;
      if (requiredFields.has(field) && !String(values[field] ?? "").trim()) return false;
    }
    return true;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isLastStep) {
      if (!validateStep()) return;
      setStep((s) => s + 1);
      return;
    }
    if (!validateStep()) return;

    setStatus("submitting");
    setErrorMsg("");

    const result = await submitDiagnostico({
      ...(values as unknown as Record<string, string>),
      consentimento: true,
      startedAt,
    } as never);

    if (result.ok) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMsg(result.error);
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-8 text-center">
        <h3 className="text-xl font-semibold">Diagnóstico recebido.</h3>
        <p className="mt-3 text-[var(--color-text-muted)]">
          Vamos analisar as informações e entrar em contato pelo WhatsApp informado. Sem enrolação — se ainda não for
          o momento certo pra sua empresa, também vamos te dizer isso.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-6 sm:p-8">
      {/* honeypot — invisível, sem label, sem tabindex */}
      <input
        type="text"
        name="website"
        value={values.website as string}
        onChange={(e) => update("website", e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="mb-6 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-green)]">
          Etapa {step + 1} de {diagnosticoSteps.length}
        </span>
        <div className="flex gap-1.5">
          {diagnosticoSteps.map((_, i) => (
            <span
              key={i}
              className="h-1.5 w-6 rounded-full"
              style={{ background: i <= step ? "var(--color-cyan)" : "var(--color-border-strong)" }}
            />
          ))}
        </div>
      </div>

      <h3 className="mb-6 text-lg font-semibold">{currentStep.titulo}</h3>

      <div className="grid gap-5">
        {currentStep.campos.map((field) => {
          if (field === "consentimento") {
            return (
              <label key={field} className="flex items-start gap-3 text-sm text-[var(--color-text-muted)]">
                <input
                  type="checkbox"
                  checked={Boolean(values.consentimento)}
                  onChange={(e) => update("consentimento", e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-cyan)]"
                  required
                />
                <span>
                  Ao enviar seus dados, você concorda que a Noryos entre em contato para tratar da sua solicitação e
                  realizar o diagnóstico solicitado. Veja a{" "}
                  <a href="/politica-de-privacidade" className="underline hover:text-[var(--color-text)]">
                    Política de Privacidade
                  </a>
                  .
                </span>
              </label>
            );
          }

          const label = fieldLabels[field];
          const isRequired = requiredFields.has(field);
          const commonProps = {
            id: field,
            name: field,
            value: values[field] as string,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(field, e.target.value),
            required: isRequired,
            className:
              "w-full rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-transparent px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus-visible:border-[var(--color-cyan)]",
          };

          return (
            <div key={field}>
              <label htmlFor={field} className="mb-1.5 block text-sm text-[var(--color-text-muted)]">
                {label} {isRequired && <span className="text-[var(--color-cyan)]">*</span>}
              </label>
              {textareaFields.has(field) ? (
                <textarea rows={3} {...commonProps} />
              ) : (
                <input type={field === "email" ? "email" : "text"} {...commonProps} />
              )}
            </div>
          );
        })}
      </div>

      {status === "error" && <p className="mt-4 text-sm text-red-400">{errorMsg}</p>}

      <div className="mt-8 flex items-center justify-between gap-4">
        {step > 0 ? (
          <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
            Voltar
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" variant="primary" disabled={status === "submitting"}>
          {status === "submitting" ? "Enviando..." : isLastStep ? "Solicitar meu diagnóstico" : "Continuar"}
        </Button>
      </div>
    </form>
  );
}
