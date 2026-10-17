import Link from "next/link";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

/**
 * Placeholder mark: an ultrasound sector with depth arcs and the probe's
 * orientation dot. Replace with the real logo when it's ready (keep the
 * component name so every usage updates at once).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={cn("h-7 w-7", className)} aria-hidden>
      <path d="M16 3.5 4.6 23.2a14.2 14.2 0 0 0 22.8 0L16 3.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M9.2 15.6a10 10 0 0 0 13.6 0" stroke="currentColor" strokeOpacity=".55" strokeWidth="1.2" />
      <path d="M11.6 11.4a6 6 0 0 0 8.8 0" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.2" />
      <circle cx="18.6" cy="19.2" r="2.1" fill="#35a3de" />
      <circle cx="7.4" cy="7.2" r="1.3" fill="#b58b33" />
    </svg>
  );
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
