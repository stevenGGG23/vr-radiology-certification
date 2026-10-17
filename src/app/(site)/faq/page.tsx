import type { Metadata } from "next";
import { AccordionItem } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";
import { faqs } from "@/lib/faq";

export const metadata: Metadata = { title: "Frequently asked questions" };

export default function FaqPage() {
  const groups = Array.from(new Set(faqs.map((f) => f.group)));
  return (
    <Container className="max-w-4xl py-16 sm:py-24">
      <h1 className="mt-5 text-[clamp(1.9rem,4vw,2.6rem)] font-bold leading-tight tracking-[-0.02em] text-bone">Frequently asked questions</h1>
      {groups.map((g) => (
        <section key={g} className="mt-14">
          <h2 className="eyebrow mb-2">{g}</h2>
          <div className="border-t border-line">
            {faqs.filter((f) => f.group === g).map((f) => (
              <AccordionItem key={f.q} title={f.q}>
                <p className="text-[15px] leading-relaxed text-mute">{f.a}</p>
              </AccordionItem>
            ))}
          </div>
        </section>
      ))}
      <div className="mt-16 rounded-2xl border border-line p-8 text-center">
        <p className="font-display text-[22px] text-bone">Didn&apos;t find your answer?</p>
        <ButtonLink href="/contact" className="mt-5">Contact us</ButtonLink>
      </div>
    </Container>
  );
}
