import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/brand";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center">
            <div className="relative">
        <div className="on-dark mx-auto inline-block rounded-lg bg-[#0b1f3a] px-3 py-2"><Logo /></div>
        <p className="mt-16 text-[14px] font-semibold text-caliper">Error 404</p>
        <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3rem)] leading-tight text-bone">Page not found</h1>
        <p className="mx-auto mt-5 max-w-md text-[16px] text-mute">The page you&apos;re looking for has moved or doesn&apos;t exist.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" iconRight={<ArrowRight className="h-4 w-4" />}>Home</ButtonLink>
          <ButtonLink href="/courses" variant="secondary">Course catalog</ButtonLink>
        </div>
      </div>
    </div>
  );
}
