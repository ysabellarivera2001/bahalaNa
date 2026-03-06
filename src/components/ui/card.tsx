import { ReactNode } from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

export function Card({ title, subtitle, children }: CardProps) {
  return (
    <section className="rounded-xl border bg-[var(--surface)] p-4 shadow-[0_4px_16px_rgba(17,43,78,0.05)]">
      {title ? <h3 className="text-sm font-bold text-[var(--text)]">{title}</h3> : null}
      {subtitle ? <p className="mt-1 text-xs text-[var(--muted)]">{subtitle}</p> : null}
      <div className={title || subtitle ? "mt-3" : ""}>{children}</div>
    </section>
  );
}
