/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EASE } from "@/components/ui/motion";
import { site } from "@/lib/site";
import { SpaceCanvas } from "./space-canvas";

const points = ["Final exam and certificate", "12 months of access", "Watch on any device"];

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: EASE },
});

export function VanderbiltMark({ className }: { className?: string }) {
  // Vanderbilt's "V" mark: confirm permission with Vanderbilt's trademark office before launch.
  return <img src="/images/brand/vanderbilt-v.png" alt="Vanderbilt University" className={className} />;
}

export function Hero() {
  return (
    <section className="on-dark relative overflow-hidden bg-[#0b1f3a]">
      <SpaceCanvas className="absolute inset-0" />

      {/* Clinician photo: right side on desktop, fading into the starfield */}
      <motion.img
        src="/images/photos/clinic-ultrasound.webp"
        alt="Clinician performing an ultrasound exam"
        className="absolute inset-y-0 right-0 hidden h-full object-cover object-[60%_center] [mask-image:linear-gradient(90deg,transparent_0%,rgba(0,0,0,0.6)_22%,#000_48%)] lg:block lg:w-[46%] xl:w-[52%]"
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: EASE }}
      />

      <div className="relative mx-auto max-w-[1280px] px-5 py-14 sm:px-8 sm:py-20 lg:flex lg:min-h-[600px] lg:items-center lg:py-24 xl:px-6">
        <div className="max-w-[36rem] lg:max-w-[29rem] xl:max-w-[31rem]">
          <motion.div
            {...rise(0)}
            className="inline-flex items-center gap-2.5 rounded-full border border-[#d6b46a]/40 bg-[#d6b46a]/10 py-1.5 pl-2.5 pr-3.5 text-[13px] font-semibold text-[#e9cf94]"
          >
            <VanderbiltMark className="h-4 w-auto shrink-0" />
            Developed at Vanderbilt University School of Nursing
          </motion.div>
          <motion.h1 {...rise(0.08)} className="mt-6 text-[clamp(2.1rem,4vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.025em] text-white">
            Point-of-care ultrasound and emergency imaging courses
          </motion.h1>
          <motion.p {...rise(0.16)} className="mt-5 text-[17px] leading-relaxed text-bone-dim">
            Self-paced online training for NPs, PAs and physicians. Built over {site.provenance.years} years by a Vanderbilt
            nursing professor and used in Vanderbilt&apos;s advanced practice program.
          </motion.p>
          <motion.div {...rise(0.24)} className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/courses" size="lg" iconRight={<ArrowRight className="h-4 w-4" />}>
              Browse courses
            </ButtonLink>
            <ButtonLink href="/courses/complete-pocus-curriculum" size="lg" variant="secondary">
              Full curriculum: $599
            </ButtonLink>
          </motion.div>
          <motion.ul {...rise(0.34)} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-bone-dim">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#5fd6c3]" /> {p}
              </li>
            ))}
          </motion.ul>
        </div>
      </div>

      <img
        src="/images/photos/clinic-ultrasound.webp"
        alt=""
        className="relative aspect-[16/10] w-full object-cover [mask-image:linear-gradient(180deg,transparent,#000_30%)] lg:hidden"
      />
    </section>
  );
}
