import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1240px] px-5 sm:px-8", className)} {...props} />;
}

export function Tag({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "caliper" | "phosphor" | "red" | "blue";
  className?: string;
}) {
  const tones = {
    default: "border-line-strong text-bone-dim",
    caliper: "border-caliper/35 text-caliper bg-caliper/[0.06]",
    phosphor: "border-phosphor/30 text-phosphor bg-phosphor/[0.05]",
    red: "border-doppler-red/35 text-doppler-red bg-doppler-red/[0.06]",
    blue: "border-doppler-blue/35 text-[#8fb0ff] bg-doppler-blue/[0.06]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] font-mono text-[10.5px] uppercase tracking-[0.1em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-ink-700", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-phosphor to-caliper transition-[width] duration-700 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-ink-700", className)} />;
}
