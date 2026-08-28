"use client";

import { RefObject, useEffect, useRef, useState } from "react";

/**
 * Base do motion system — hooks pequenos sobre IntersectionObserver /
 * matchMedia / rAF. Nenhuma dependência externa. Tudo respeita
 * prefers-reduced-motion (a CSS global já neutraliza as transições, os
 * hooks só evitam trabalho de JS desnecessário).
 */

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

type InViewOptions = {
  /** Só dispara uma vez (padrão) — evita re-animar ao rolar pra cima. */
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
};

export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: InViewOptions = {}
): [RefObject<T | null>, boolean] {
  const { once = true, threshold = 0, rootMargin = "0px 0px -12% 0px" } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold, rootMargin]);

  return [ref, inView];
}

/**
 * Progresso (0→1) de uma seção cruzando a viewport. Usa rAF só enquanto
 * a seção está visível. Serve pra timeline e fluxo do sistema.
 */
export function useScrollProgress<T extends HTMLElement = HTMLDivElement>(): [
  RefObject<T | null>,
  number
] {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setProgress(1));
      return () => cancelAnimationFrame(id);
    }

    let raf = 0;
    let active = false;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 quando o topo entra por baixo; 1 quando a base sai por cima.
      const total = rect.height + vh;
      const passed = vh - rect.top;
      const p = Math.min(1, Math.max(0, passed / total));
      setProgress(p);
      raf = active ? requestAnimationFrame(measure) : 0;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        if (active && !raf) raf = requestAnimationFrame(measure);
      },
      { threshold: 0 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return [ref, progress];
}

/**
 * Posição do mouse relativa a um elemento, normalizada -1..1.
 * Desligado em toque e reduced-motion (retorna 0,0). Para parallax leve.
 */
export function useMouseParallax<T extends HTMLElement = HTMLDivElement>(): [
  RefObject<T | null>,
  { x: number; y: number }
] {
  const ref = useRef<T>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(hover: none)").matches
    ) {
      return;
    }

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        setPos({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
      });
    };
    const onLeave = () => setPos({ x: 0, y: 0 });

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return [ref, pos];
}

/**
 * Parallax de scroll — desloca o elemento no eixo Y conforme ele cruza a
 * viewport (drift sutil). `strength` = amplitude total em px. Desligado em
 * reduced-motion. rAF só enquanto visível.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(
  strength = 36
): [RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let active = false;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // -1 (elemento abaixo da tela) .. 0 (centralizado) .. 1 (acima)
      const ratio = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
      setOffset(-Math.max(-1.2, Math.min(1.2, ratio)) * strength);
      raf = active ? requestAnimationFrame(measure) : 0;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        if (active && !raf) raf = requestAnimationFrame(measure);
      },
      { threshold: 0 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [strength]);

  return [ref, offset];
}

/**
 * Contador suave (§16 do briefing) — anima de 0 até `target` quando `active`
 * fica true. easeOutCubic, ~1s, uma única vez. Em reduced-motion pula direto
 * pro valor final. Retorna inteiro pronto pra render.
 */
export function useCountUp(target: number, active: boolean, duration = 1000): number {
  const [value, setValue] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    if (!active || done.current) return;
    done.current = true;

    let raf = 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      raf = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(raf);
    }

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);

  return value;
}

/** Spotlight de card — grava --mx/--my no elemento sob o cursor. */
export function useSpotlight<T extends HTMLElement = HTMLDivElement>(): RefObject<T | null> {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(hover: none)").matches) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        el.style.setProperty("--my", `${e.clientY - rect.top}px`);
      });
    };
    el.addEventListener("mousemove", onMove);
    return () => {
      el.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return ref;
}
