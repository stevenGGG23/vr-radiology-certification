"use client";

import { animate, motion, useInView, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Fades and lifts content into place the first time it scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
  as = "div",
  ...rest
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
} & Omit<HTMLMotionProps<"div">, "children">) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Counts up to a number the first time it scrolls into view. */
export function Counter({ to, suffix = "", className }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.4, ease: EASE, onUpdate: (v) => setVal(v) });
    return () => c.stop();
  }, [inView, to]);
  return (
    <span ref={ref} className={className}>
      {Math.round(val)}
      {suffix}
    </span>
  );
}

export { EASE };
