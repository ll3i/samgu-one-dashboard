import { type ReactNode } from "react";
import { type LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

/* ----------------------------------------------------------------------------
 * Shared presentational helpers used across all modules.
 * Brand tone: Samkoo corporate navy / blue, clean enterprise SaaS.
 * -------------------------------------------------------------------------- */

type Tone = "blue" | "green" | "amber" | "red" | "navy" | "slate";

const toneMap: Record<Tone, { bg: string; fg: string; soft: string }> = {
  blue: { bg: "bg-[var(--brand-blue)]", fg: "text-[var(--brand-blue)]", soft: "bg-[var(--brand-blue-soft)]" },
  green: { bg: "bg-[var(--success)]", fg: "text-[var(--success)]", soft: "bg-[var(--success-soft)]" },
  amber: { bg: "bg-[var(--warning)]", fg: "text-[var(--warning)]", soft: "bg-[var(--warning-soft)]" },
  red: { bg: "bg-[var(--danger)]", fg: "text-[var(--danger)]", soft: "bg-[var(--danger-soft)]" },
  navy: { bg: "bg-[var(--brand-navy)]", fg: "text-[var(--brand-navy)]", soft: "bg-[#eef2fb]" },
  slate: { bg: "bg-slate-500", fg: "text-slate-600", soft: "bg-slate-100" },
};

export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  tone = "blue",
  delta,
  hint,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  tone?: Tone;
  delta?: { value: string; up?: boolean; good?: boolean };
  hint?: string;
}) {
  const t = toneMap[tone];
  return (
    <div className="relative flex min-h-[142px] flex-col bg-card rounded-lg border border-border px-4 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-muted-foreground" style={{ fontSize: "0.75rem" }}>
          {label}
        </span>
        <Icon className="size-4 text-muted-foreground/70" />
      </div>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-foreground tracking-tight" style={{ fontSize: "1.875rem", lineHeight: 1, fontWeight: 700, fontFamily: "var(--font-heading)" }}>
          {value}
        </span>
        {unit && (
          <span className="text-muted-foreground" style={{ fontSize: "0.875rem" }}>
            {unit}
          </span>
        )}
      </div>
      <div className="mt-auto flex items-center gap-2 border-t border-border/70 pt-2.5">
        {delta && (
          <span
            className="inline-flex items-center gap-0.5 font-medium"
            style={{
              fontSize: "0.6875rem",
              color: delta.good ? "var(--success)" : "var(--danger)",
            }}
          >
            {delta.up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {delta.value}
          </span>
        )}
        {hint && (
          <span className="text-muted-foreground" style={{ fontSize: "0.6875rem" }}>
            {hint}
          </span>
        )}
        {!delta && !hint && <span className="text-[.6875rem] text-muted-foreground">실시간 집계</span>}
        <span className={`ml-auto size-1.5 rounded-full ${t.bg}`} aria-hidden="true" />
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  description,
  icon: Icon,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`bg-card rounded-[var(--radius)] border border-border shadow-sm ${className}`}>
      <header className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
        <div className="flex items-start gap-3">
          {Icon && (
            <span className="size-9 rounded-lg grid place-items-center bg-[var(--brand-blue-soft)] mt-0.5">
              <Icon className="size-[18px] text-[var(--brand-blue)]" />
            </span>
          )}
          <div>
            <h3 style={{ fontSize: "1.0625rem", fontWeight: 600 }}>{title}</h3>
            {description && (
              <p className="text-muted-foreground mt-0.5" style={{ fontSize: "0.8125rem" }}>
                {description}
              </p>
            )}
          </div>
        </div>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatusPill({ tone, children }: { tone: Tone; children: ReactNode }) {
  const t = toneMap[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${t.soft} ${t.fg}`}
      style={{ fontSize: "0.75rem", fontWeight: 600 }}
    >
      <span className={`size-1.5 rounded-full ${t.bg}`} />
      {children}
    </span>
  );
}

export function ProgressBar({ value, tone = "blue" }: { value: number; tone?: Tone }) {
  const t = toneMap[tone];
  return (
    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
      <div className={`h-full rounded-full ${t.bg}`} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>{title}</h1>
        <p className="text-muted-foreground mt-1" style={{ fontSize: "0.9375rem" }}>
          {subtitle}
        </p>
      </div>
      {action}
    </div>
  );
}
