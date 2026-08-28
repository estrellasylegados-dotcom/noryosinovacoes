"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

/**
 * Confirma que uma seção entrou na tela — não decora, só evita que tudo
 * apareça "estático" de uma vez. Respeita prefers-reduced-motion via CSS
 * global (ver globals.css), então não precisa checar isso em JS aqui.
 */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${visible ? "is-visible" : ""} ${className}`}>
      {children}
    </div>
  );
}
