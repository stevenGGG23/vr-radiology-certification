import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full rounded-md border border-line-strong bg-white px-3.5 text-[15px] text-bone placeholder:text-faint " +
  "transition-[border-color,box-shadow] duration-200 hover:border-bone/30 focus:border-caliper focus:outline-none " +
  "focus:ring-4 focus:ring-caliper/15 disabled:bg-ink-950 disabled:opacity-70";

export function Field({
  label,
  hint,
  error,
  children,
  className,
  htmlFor,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-[13.5px] font-semibold text-bone-dim">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[12.5px] text-doppler-red">{error}</p>
      ) : hint ? (
        <p className="text-[12.5px] text-faint">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-28 py-2.5 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        control,
        "select-chevron h-11 appearance-none pr-10",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-start justify-between gap-4 rounded-lg border border-line bg-white px-4 py-3 text-left transition-colors hover:border-line-strong"
    >
      <span>
        <span className="block text-sm font-medium text-bone">{label}</span>
        {description && <span className="mt-0.5 block text-[12.5px] text-faint">{description}</span>}
      </span>
      <span
        className={cn(
          "relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-[#1a5bd0]" : "bg-ink-600",
        )}
      >
        <span
          className={cn(
            "h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
            checked ? "translate-x-[18px]" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}
