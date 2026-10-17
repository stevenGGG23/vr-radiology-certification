/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { Logo } from "@/components/ui/brand";
import { site } from "@/lib/site";

const perks = ["Pick up lessons where you left off", "Take exams and download certificates", "Access every course you own, on any device"];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[100svh] lg:grid-cols-[1fr_1fr]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <div className="rounded-lg bg-[#0b1f3a] px-3 py-2 on-dark">
            <Logo />
          </div>
          <Link href="/" className="flex items-center gap-1.5 text-[13.5px] font-medium text-mute hover:text-bone">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to site
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-12">{children}</div>
      </div>
      <div className="relative hidden overflow-hidden lg:block">
        <img src="/images/photos/clinician-probe.webp" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,31,58,0.1)_40%,rgba(11,31,58,0.85))]" />
        <div className="absolute inset-x-10 bottom-10 max-w-md rounded-xl bg-white p-6 shadow-xl">
          <div className="text-[16px] font-bold text-bone">Your account</div>
          <ul className="mt-3 space-y-2">
            {perks.map((p) => (
              <li key={p} className="flex gap-2.5 text-[14.5px] text-bone-dim">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-phosphor" /> {p}
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-line pt-3 text-[12.5px] text-faint">{site.provenance.short}.</p>
        </div>
      </div>
    </div>
  );
}
