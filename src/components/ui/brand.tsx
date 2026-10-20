import Link from "next/link";
import { MarkSvg } from "@/lib/brand-mark";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

/** The logo mark. Its drawing lives in src/lib/brand-mark.tsx so every use updates at once. */
export function LogoMark({ className }: { className?: string }) {
  return <MarkSvg className={cn("h-7 w-7", className)} />;
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5 text-bone", className)} aria-label={`${site.name} home`}>
      <LogoMark className="transition-transform duration-500 ease-out group-hover:rotate-[-8deg]" />
      {!compact && (
        <span className="flex flex-col whitespace-nowrap leading-none">
          <span className="text-[16px] font-bold tracking-[-0.02em] sm:text-[18px]">Sonosus VR</span>
          <span className="mt-[3px] text-[9.5px] font-semibold uppercase tracking-[0.3em] text-mute">Education</span>
        </span>
      )}
    </Link>
  );
}
