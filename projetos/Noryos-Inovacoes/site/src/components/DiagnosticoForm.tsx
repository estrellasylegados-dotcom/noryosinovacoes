"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import {
  diagnosticoSteps,
  PORTE_OPCOES,
  PORTE_LABEL,
  PRESENCA_OPCOES,
  PRESENCA_LABEL,
  PRESENCA_EXCLUSIVA,
  CANAIS_OPCOES,
  CANAIS_LABEL,
  FERRAMENTAS_OPCOES,
  FERRAMENTAS_LABEL,
  FERRAMENTAS_EXCLUSIVA,
  ORGANIZACAO_OPCOES,
  ORGANIZACAO_LABEL,
  DIFICULDADE_OPCOES,
  DIFICULDADE_LABEL,
  OBJETIVO_OPCOES,
  OBJETIVO_LABEL,
  PRAZO_OPCOES,
  PRAZO_LABEL,
} from "@/app/diagnostico/schema";
import { analyticsEvents as ev } from "@/lib/config";
import { track } from "@/lib/analytics";
import { Button } from "./ui/Button";

const ENDPOINT = "/api/diagnostico";
const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js";

type TurnstileApi = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback: (token: string) => void;
      "error-callback"?: () => void;
      "expired-callback"?: () => void;
      "timeout-callback"?: () => void;
      theme?: "auto" | "light" | "dark";
      action?: string;
    }
  ) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type FormState = {
  nomeEmpresa: string;
  responsavel: string;
  whatsapp: string;
  email: string;
  cidade: string;
  segmento: string;
  porte: string;
  presenca: string[];
  site: string;
  instagram: string;
  googleBusiness: string;
  canais: string[];
  canaisOutro: string;
  aquisicaoNota: string;
  ferramentas: string[];
  organizacao: string;
  dificuldadePrincipal: string;
  dificuldadeOutro: string;
  dificuldadeNota: string;
  objetivoPrincipal: string;
  objetivoOutro: string;
  objetivoNota: string;
  prazo: string;
  consentimento: boolean;
  website: string; // honeypot
};

const initialState: FormState = {
  nomeEmpresa: "",
  responsavel: "",
  whatsapp: "",
  email: "",
  cidade: "",
  segmento: "",
  porte: "",
  presenca: [],
  site: "",
  instagram: "",
  googleBusiness: "",
  canais: [],
  canaisOutro: "",
  aquisicaoNota: "",
  ferramentas: [],
  organizacao: "",
  dificuldadePrincipal: "",
  dificuldadeOutro: "",
  dificuldadeNota: "",
  objetivoPrincipal: "",
  objetivoOutro: "",
  objetivoNota: "",
  prazo: "",
  consentimento: false,
  website: "",
};

const SEGMENTO_SUGESTOES = [
  "Odontologia",
  "Estética e beleza",
  "Advocacia",
  "Contabilidade",
  "Comércio local",
  "E-commerce",
  "Serviços",
  "Construção e reforma",
  "Saúde",
  "Educação",
  "Alimentação",
];

/** Slug de presença → chave do campo de link no estado. */
const LINK_FIELD: Record<string, "site" | "instagram" | "googleBusiness"> = {
  site: "site",
  instagram: "instagram",
  google_perfil: "googleBusiness",
};
const LINK_LABEL: Record<"site" | "instagram" | "googleBusiness", string> = {
  site: "Endereço do site",
  instagram: "@ ou link do Instagram",
  googleBusiness: "Link do Perfil da Empresa no Google (Google Meu Negócio)",
};

const inputCls =
  "w-full rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-transparent px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus-visible:border-[var(--color-cyan)] focus-visible:outline-none";

/** input transparente por cima do chip/card inteiro → área de toque grande,
 *  nada intercepta o clique, e `peer-*` estiliza o <span> visível. */
const overlayInputCls = "peer absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0";

const chipCls =
  "inline-flex min-h-[44px] items-center rounded-full border border-[var(--color-border-strong)] px-4 py-2.5 text-sm text-[var(--color-text-muted)] select-none transition-colors peer-hover:border-[var(--color-cyan)] peer-checked:border-[var(--color-cyan)] peer-checked:bg-[color-mix(in_oklab,var(--color-cyan)_14%,transparent)] peer-checked:text-[var(--color-text)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--color-cyan)]";

const cardCls =
  "flex min-h-[44px] items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-4 py-3 text-sm text-[var(--color-text-muted)] select-none transition-colors peer-hover:border-[var(--color-cyan)] peer-checked:border-[var(--color-cyan)] peer-checked:bg-[color-mix(in_oklab,var(--color-cyan)_10%,transparent)] peer-checked:text-[var(--color-text)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--color-cyan)]";

function Field({ legend, hint, children }: { legend: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="mb-2 block text-sm text-[var(--color-text-muted)]">{legend}</legend>
      {hint && <p className="mb-3 -mt-1 text-xs text-[var(--color-text-muted)]">{hint}</p>}
      {children}
    </fieldset>
  );
}

function Chips<T extends string>({
  name,
  options,
  labels,
  selected,
  exclusive,
  onToggle,
}: {
  name: string;
  options: readonly T[];
  labels: Record<T, string>;
  selected: string[];
  exclusive?: string;
  onToggle: (next: string[]) => void;
}) {
  function toggle(value: string) {
    const has = selected.includes(value);
    if (exclusive && value === exclusive) {
      onToggle(has ? [] : [exclusive]);
      return;
    }
    let next = has ? selected.filter((v) => v !== value) : [...selected, value];
    if (exclusive) next = next.filter((v) => v !== exclusive);
    onToggle(next);
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <label key={opt} className="relative inline-flex">
          <input
            type="checkbox"
            name={name}
            value={opt}
            checked={selected.includes(opt)}
            onChange={() => toggle(opt)}
            className={overlayInputCls}
          />
          <span className={chipCls}>{labels[opt]}</span>
        </label>
      ))}
    </div>
  );
}

function Cards<T extends string>({
  name,
  options,
  labels,
  value,
  onSelect,
  clearable,
}: {
  name: string;
  options: readonly T[];
  labels: Record<T, string>;
  value: string;
  onSelect: (value: string) => void;
  clearable?: boolean;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((opt) => (
        <label key={opt} className="relative block">
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onSelect(opt)}
            className={overlayInputCls}
          />
          <span className={cardCls}>{labels[opt]}</span>
        </label>
      ))}
      {clearable && value && (
        <button
          type="button"
          onClick={() => onSelect("")}
          className="justify-self-start text-xs text-[var(--color-text-muted)] underline underline-offset-2 hover:text-[var(--color-text)]"
        >
          Limpar seleção
        </button>
      )}
    </div>
  );
}

/**
 * `turnstileSiteKey` é o site key PÚBLICO do Cloudflare Turnstile, lido no
 * servidor e repassado aqui. A validação de verdade acontece no servidor
 * (`/api/diagnostico` → `src/lib/turnstile.ts`) com o `TURNSTILE_SECRET_KEY`.
 * Vazio (ambiente sem Turnstile) → o widget não é renderizado e o servidor
 * decide (em produção sem secret, responde 403).
 */
export function DiagnosticoForm({ turnstileSiteKey = "" }: { turnstileSiteKey?: string }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<FormState>(initialState);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [stepError, setStepError] = useState("");
  const [startedAt] = useState(() => Date.now());
  const inFlight = useRef(false);
  const started = useRef(false);

  const isLastStep = step === diagnosticoSteps.length - 1;
  const currentStep = diagnosticoSteps[step];

  // --- Cloudflare Turnstile (só na última etapa, quando o site key existe) ---
  const turnstileEnabled = turnstileSiteKey !== "";
  const turnstileMountRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileError, setTurnstileError] = useState(false);

  const renderTurnstile = useCallback(() => {
    if (!turnstileEnabled || !window.turnstile || !turnstileMountRef.current) return;
    if (turnstileWidgetId.current !== null) return;
    turnstileWidgetId.current = window.turnstile.render(turnstileMountRef.current, {
      sitekey: turnstileSiteKey,
      action: "diagnostico",
      callback: (token) => {
        setTurnstileToken(token);
        setTurnstileError(false);
        track(ev.turnstileDoneDiagnostico);
      },
      "expired-callback": () => setTurnstileToken(""),
      "error-callback": () => {
        setTurnstileToken("");
        setTurnstileError(true);
      },
      "timeout-callback": () => setTurnstileToken(""),
    });
  }, [turnstileEnabled, turnstileSiteKey]);

  useEffect(() => {
    if (!turnstileEnabled) return;
    if (isLastStep && (scriptReady || window.turnstile)) renderTurnstile();
    return () => {
      if (turnstileWidgetId.current !== null && window.turnstile) {
        window.turnstile.remove(turnstileWidgetId.current);
        turnstileWidgetId.current = null;
        setTurnstileToken("");
      }
    };
  }, [turnstileEnabled, isLastStep, scriptReady, renderTurnstile]);

  const turnstileSatisfied = !turnstileEnabled || turnstileToken !== "";

  // --- Analytics: início + visualização de cada etapa (sem PII) ---
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    track(ev.startDiagnostico);
  }, []);
  useEffect(() => {
    if (status === "success") return;
    track(ev.viewStepDiagnostico, { etapa: step + 1 });
  }, [step, status]);

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (stepError) setStepError("");
  }

  function validateStep(): true | string {
    if (step === 0) {
      if (!values.nomeEmpresa.trim() || !values.responsavel.trim() || !values.whatsapp.trim()) {
        return "Preencha nome da empresa, seu nome e WhatsApp para continuar.";
      }
    }
    if (step === 1) {
      for (const slug of ["site", "instagram", "google_perfil"] as const) {
        if (values.presenca.includes(slug) && !values[LINK_FIELD[slug]].trim()) {
          return "Informe o link (ou @) dos perfis que você marcou como existentes.";
        }
      }
    }
    if (isLastStep) {
      if (!values.objetivoPrincipal) return "Escolha o seu objetivo principal.";
      if (!values.prazo) return "Escolha quando você quer começar.";
      if (!values.consentimento) return "É preciso aceitar o contato da Noryos para enviar.";
    }
    return true;
  }

  function goNext() {
    const ok = validateStep();
    if (ok !== true) {
      setStepError(ok);
      track(ev.stepErrorDiagnostico, { etapa: step + 1 });
      return;
    }
    setStepError("");
    track(ev.nextStepDiagnostico, { de: step + 1, para: step + 2 });
    setStep((s) => s + 1);
  }

  function goBack() {
    setStepError("");
    track(ev.prevStepDiagnostico, { de: step + 1, para: step });
    setStep((s) => Math.max(0, s - 1));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isLastStep) {
      goNext();
      return;
    }

    const ok = validateStep();
    if (ok !== true) {
      setStepError(ok);
      track(ev.stepErrorDiagnostico, { etapa: step + 1 });
      return;
    }
    if (!turnstileSatisfied) {
      setStatus("error");
      setErrorMsg("Confirme a verificação de segurança abaixo antes de enviar.");
      return;
    }
    if (inFlight.current || status === "submitting" || status === "success") return;

    inFlight.current = true;
    setStatus("submitting");
    setErrorMsg("");
    setStepError("");
    track(ev.submitDiagnostico, { etapa: diagnosticoSteps.length });

    let res: Response | undefined;
    try {
      res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, consentimento: true, startedAt, turnstileToken }),
      });

      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (res.ok && data?.ok) {
        setStatus("success");
        track(ev.successDiagnostico);
      } else {
        setStatus("error");
        setErrorMsg(data?.error || "Não conseguimos enviar agora. Tente novamente em instantes.");
        track(ev.errorDiagnostico, { status: res.status });
        if (turnstileEnabled && window.turnstile && turnstileWidgetId.current !== null) {
          window.turnstile.reset(turnstileWidgetId.current);
          setTurnstileToken("");
        }
      }
    } catch {
      setStatus("error");
      setErrorMsg("Falha de conexão. Verifique sua internet e tente novamente.");
      track(ev.errorDiagnostico, { status: res?.status ?? 0 });
    } finally {
      inFlight.current = false;
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
    <form
      onSubmit={handleSubmit}
      className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-6 sm:p-8"
    >
      {/* honeypot — invisível, sem label, sem tabindex */}
      <input
        type="text"
        name="website"
        value={values.website}
        onChange={(e) => set("website", e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="mb-6 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-green)]">
          Etapa {step + 1} de {diagnosticoSteps.length}
        </span>
        <div className="flex gap-1.5" aria-hidden="true">
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

      <div className="grid gap-6">
        {/* ETAPA 1 — Sobre a empresa */}
        {step === 0 && (
          <>
            <TextInput id="nomeEmpresa" label="Nome da empresa" required value={values.nomeEmpresa} onChange={(v) => set("nomeEmpresa", v)} />
            <TextInput id="responsavel" label="Seu nome" required value={values.responsavel} onChange={(v) => set("responsavel", v)} />
            <TextInput id="whatsapp" label="WhatsApp" required value={values.whatsapp} onChange={(v) => set("whatsapp", v)} />
            <TextInput id="email" label="E-mail" type="email" value={values.email} onChange={(v) => set("email", v)} />
            <TextInput id="cidade" label="Cidade" value={values.cidade} onChange={(v) => set("cidade", v)} />
            <div>
              <label htmlFor="segmento" className="mb-1.5 block text-sm text-[var(--color-text-muted)]">
                Segmento / ramo de atuação
              </label>
              <input
                id="segmento"
                name="segmento"
                list="segmento-sugestoes"
                value={values.segmento}
                onChange={(e) => set("segmento", e.target.value)}
                className={inputCls}
              />
              <datalist id="segmento-sugestoes">
                {SEGMENTO_SUGESTOES.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <Field legend="Tamanho da operação (opcional)">
              <Cards
                name="porte"
                options={PORTE_OPCOES}
                labels={PORTE_LABEL}
                value={values.porte}
                onSelect={(v) => set("porte", v)}
                clearable
              />
            </Field>
          </>
        )}

        {/* ETAPA 2 — Presença digital */}
        {step === 1 && (
          <>
            <Field
              legend="O que sua empresa já tem hoje?"
              hint="Marque tudo que se aplica. Para Site, Instagram e Perfil da Empresa no Google, peça o link logo abaixo."
            >
              <Chips
                name="presenca"
                options={PRESENCA_OPCOES}
                labels={PRESENCA_LABEL}
                selected={values.presenca}
                exclusive={PRESENCA_EXCLUSIVA}
                onToggle={(next) => set("presenca", next)}
              />
            </Field>
            {(["site", "instagram", "google_perfil"] as const)
              .filter((slug) => values.presenca.includes(slug))
              .map((slug) => {
                const field = LINK_FIELD[slug];
                return (
                  <TextInput
                    key={slug}
                    id={field}
                    label={LINK_LABEL[field]}
                    required
                    value={values[field]}
                    onChange={(v) => set(field, v)}
                  />
                );
              })}
          </>
        )}

        {/* ETAPA 3 — Como você consegue clientes */}
        {step === 2 && (
          <>
            <Field legend="Por onde chegam seus clientes hoje?" hint="Pode marcar mais de um.">
              <Chips
                name="canais"
                options={CANAIS_OPCOES}
                labels={CANAIS_LABEL}
                selected={values.canais}
                onToggle={(next) => set("canais", next)}
              />
            </Field>
            {values.canais.includes("outro") && (
              <TextInput id="canaisOutro" label="Qual outro canal?" value={values.canaisOutro} onChange={(v) => set("canaisOutro", v)} />
            )}
            <TextArea
              id="aquisicaoNota"
              label="Quer detalhar como funciona hoje? (opcional)"
              placeholder="ex: 80% vem de indicação, tentei anúncio uma vez e não deu certo"
              value={values.aquisicaoNota}
              onChange={(v) => set("aquisicaoNota", v)}
            />
          </>
        )}

        {/* ETAPA 4 — Atendimento e organização */}
        {step === 3 && (
          <>
            <Field legend="Como você organiza contatos e atendimentos hoje?">
              <Chips
                name="ferramentas"
                options={FERRAMENTAS_OPCOES}
                labels={FERRAMENTAS_LABEL}
                selected={values.ferramentas}
                exclusive={FERRAMENTAS_EXCLUSIVA}
                onToggle={(next) => set("ferramentas", next)}
              />
            </Field>
            <Field legend="E como você sente que isso funciona hoje?">
              <Cards
                name="organizacao"
                options={ORGANIZACAO_OPCOES}
                labels={ORGANIZACAO_LABEL}
                value={values.organizacao}
                onSelect={(v) => set("organizacao", v)}
                clearable
              />
            </Field>
            <Field legend="Qual a maior dificuldade hoje?">
              <Cards
                name="dificuldadePrincipal"
                options={DIFICULDADE_OPCOES}
                labels={DIFICULDADE_LABEL}
                value={values.dificuldadePrincipal}
                onSelect={(v) => set("dificuldadePrincipal", v)}
                clearable
              />
            </Field>
            {values.dificuldadePrincipal === "outro" && (
              <TextInput id="dificuldadeOutro" label="Qual outra dificuldade?" value={values.dificuldadeOutro} onChange={(v) => set("dificuldadeOutro", v)} />
            )}
            <TextArea
              id="dificuldadeNota"
              label="Conte um pouco mais (opcional)"
              value={values.dificuldadeNota}
              onChange={(v) => set("dificuldadeNota", v)}
            />
          </>
        )}

        {/* ETAPA 5 — Objetivo e prazo */}
        {step === 4 && (
          <>
            <Field legend="Qual seu principal objetivo agora? *">
              <Cards
                name="objetivoPrincipal"
                options={OBJETIVO_OPCOES}
                labels={OBJETIVO_LABEL}
                value={values.objetivoPrincipal}
                onSelect={(v) => set("objetivoPrincipal", v)}
              />
            </Field>
            {values.objetivoPrincipal === "outro" && (
              <TextInput id="objetivoOutro" label="Qual outro objetivo?" value={values.objetivoOutro} onChange={(v) => set("objetivoOutro", v)} />
            )}
            <Field legend="Quando você quer começar a resolver isso? *">
              <Cards
                name="prazo"
                options={PRAZO_OPCOES}
                labels={PRAZO_LABEL}
                value={values.prazo}
                onSelect={(v) => set("prazo", v)}
              />
            </Field>
            <TextArea
              id="objetivoNota"
              label="Quer contar mais sobre o objetivo ou o contexto? (opcional)"
              value={values.objetivoNota}
              onChange={(v) => set("objetivoNota", v)}
            />
            <label className="flex items-start gap-3 text-sm text-[var(--color-text-muted)]">
              <input
                type="checkbox"
                checked={values.consentimento}
                onChange={(e) => set("consentimento", e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-cyan)]"
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
          </>
        )}
      </div>

      {isLastStep && turnstileEnabled && (
        <div className="mt-6">
          <Script
            src={TURNSTILE_SCRIPT}
            strategy="afterInteractive"
            onLoad={() => setScriptReady(true)}
            onReady={() => setScriptReady(true)}
          />
          <div ref={turnstileMountRef} className="min-h-[65px]" />
          {turnstileError && (
            <p className="mt-2 text-sm text-red-400">
              A verificação de segurança não carregou. Recarregue a página e tente novamente.
            </p>
          )}
        </div>
      )}

      {stepError && (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {stepError}
        </p>
      )}
      {status === "error" && (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {errorMsg}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-4">
        {step > 0 ? (
          <Button type="button" variant="ghost" onClick={goBack}>
            Voltar
          </Button>
        ) : (
          <span />
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={status === "submitting" || (isLastStep && !turnstileSatisfied)}
        >
          {status === "submitting" ? "Enviando..." : isLastStep ? "Solicitar meu diagnóstico" : "Continuar"}
        </Button>
      </div>
    </form>
  );
}

function TextInput({
  id,
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: "text" | "email";
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm text-[var(--color-text-muted)]">
        {label} {required && <span className="text-[var(--color-cyan)]">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={inputCls}
      />
    </div>
  );
}

function TextArea({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm text-[var(--color-text-muted)]">
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        rows={3}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </div>
  );
}
