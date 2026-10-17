"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  meta,
}: {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  meta?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className="border-b border-line">
      <button
        className="group flex w-full items-center justify-between gap-6 py-5 text-left"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-[16px] font-semibold text-bone transition-colors group-hover:text-caliper">{title}</span>
        <span className="flex shrink-0 items-center gap-4">
          {meta}
          <span
            className={cn(
              "grid h-7 w-7 place-items-center rounded-full border border-line-strong text-mute transition-all duration-300",
              open && "rotate-45 border-caliper/50 text-caliper",
            )}
          >
            <Plus className="h-3.5 w-3.5" />
          </span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 pr-12">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
