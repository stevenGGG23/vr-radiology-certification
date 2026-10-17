/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, CircleCheck, Loader2, Lock, ShieldCheck, Tag as TagIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container, Skeleton } from "@/components/ui/primitives";
import { ceHoursFor } from "@/lib/catalog";
import { formatPriceUSD } from "@/lib/format";
import { site } from "@/lib/site";
import { useCart } from "@/lib/store/cart";
import { useCatalog } from "@/lib/store/catalog";
import { useCurrentUser, useHydration, useSession } from "@/lib/store/session";
import type { Course } from "@/lib/types";

const PROMOS: Record<string, number> = { RUDY10: 0.1 };

/** /checkout/[slug] ("Buy it now" links): put the course in the cart, then go to checkout. */
export function BuyNow({ slug }: { slug: string }) {
  const router = useRouter();
  const hydrated = useHydration((s) => s.hydrated);
  const course = useCatalog((s) => s.courses.find((c) => c.slug === slug));
  useEffect(() => {
    if (!hydrated) return;
    if (course) useCart.getState().add(course.id);
    useCart.getState().setOpen(false);
    router.replace("/checkout");
  }, [hydrated, course, router]);
  return <Container className="py-24"><Skeleton className="h-64" /></Container>;
}

export function Checkout() {
  return (
    <RequireAuth>
      <CheckoutInner />
    </RequireAuth>
  );
}

function CheckoutInner() {
  const courses = useCatalog((s) => s.courses);
  const ids = useCart((s) => s.ids);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const user = useCurrentUser();
  const purchase = useSession((s) => s.purchase);
  const enrollments = useSession((s) => s.db.enrollments);
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string>();
  const [stage, setStage] = useState<"review" | "processing" | "done">("review");
  const [bought, setBought] = useState<Course[]>([]);

  const items = ids.map((id) => courses.find((c) => c.id === id)).filter((c): c is Course => Boolean(c));
  const owns = (c: Course) => (c.includes?.length ? c.includes : [c.id]).every((id) => enrollments.some((e) => e.userId === user?.id && e.courseId === id));
  const payable = items.filter((c) => !owns(c) && c.status === "published");
  const subtotal = payable.reduce((n, c) => n + c.priceCents, 0);
  const discount = applied ? Math.round(subtotal * PROMOS[applied]) : 0;
  const total = subtotal - discount;

  const pay = () => {
    setStage("processing");
    // Production: POST the cart to /api/checkout -> Stripe Checkout Session -> redirect.
    // Enrollments are created by the Stripe webhook, never by the browser.
    setTimeout(() => {
      payable.forEach((c) => purchase(c));
      setBought(payable);
      clear();
      setStage("done");
    }, 1500);
  };

  if (stage === "done") {
    const first = bought.find((c) => !c.includes);
    return (
      <Container className="max-w-2xl py-20 text-center">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.4 }}>
          <CircleCheck className="mx-auto h-16 w-16 text-phosphor" strokeWidth={1.5} />
        </motion.div>
        <h1 className="mt-5 text-[32px] font-bold tracking-[-0.02em] text-bone">You&apos;re enrolled.</h1>
        <p className="mt-3 text-[16px] text-mute">
          {bought.length} {bought.length === 1 ? "item" : "items"} added to your account. A receipt would be emailed to {user?.email}.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {first ? (
            <ButtonLink href={`/learn/${first.slug}`} size="lg" iconRight={<ArrowRight className="h-4 w-4" />}>Start learning</ButtonLink>
          ) : (
            <ButtonLink href="/dashboard" size="lg" iconRight={<ArrowRight className="h-4 w-4" />}>Go to my courses</ButtonLink>
          )}
          <ButtonLink href="/dashboard" size="lg" variant="secondary">My courses</ButtonLink>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-14">
      <h1 className="text-[clamp(1.8rem,4vw,2.4rem)] font-bold tracking-[-0.02em] text-bone">Checkout</h1>
      {items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line-strong p-10 text-center">
          <p className="text-[17px] font-semibold text-bone">Your cart is empty.</p>
          <ButtonLink href="/courses" className="mt-5">Browse courses</ButtonLink>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-6">
            <section className="panel p-5 sm:p-6">
              <h2 className="text-[17px] font-bold text-bone">Items</h2>
              <ul className="mt-4 divide-y divide-line">
                {items.map((c) => (
                  <li key={c.id} className="flex gap-4 py-4">
                    <img src={c.cover} alt="" className="h-16 w-20 shrink-0 rounded-md object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-bone">{c.title}</div>
                      <div className="text-[13px] text-mute">{c.code} · {ceHoursFor(c, courses)} contact hours</div>
                      {owns(c) && <div className="mt-1 text-[13px] font-semibold text-phosphor">Already in your account, so it won&apos;t be charged</div>}
                      <button onClick={() => remove(c.id)} className="mt-1 flex items-center gap-1 text-[13px] text-faint hover:text-doppler-red"><Trash2 className="h-3.5 w-3.5" /> Remove</button>
                    </div>
                    <div className="font-semibold text-bone">{formatPriceUSD(c.priceCents)}</div>
                  </li>
                ))}
              </ul>
            </section>
            <section className="panel p-5 sm:p-6">
              <h2 className="text-[17px] font-bold text-bone">Account</h2>
              <p className="mt-2 text-[15px] text-bone-dim">{user?.name} · {user?.email}</p>
              <p className="mt-1 text-[13px] text-faint">Certificates are issued to this name. <Link href="/account" className="text-caliper hover:underline">Edit</Link></p>
            </section>
          </div>

          <aside>
            <div className="panel sticky top-24 p-5 sm:p-6">
              <h2 className="text-[17px] font-bold text-bone">Order summary</h2>
              <form
                className="mt-4 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const c = code.trim().toUpperCase();
                  if (PROMOS[c]) {
                    setApplied(c);
                    setCodeError(undefined);
                  } else setCodeError("That code isn't valid.");
                }}
              >
                <div className="relative flex-1">
                  <TagIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                  <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Promo code" aria-label="Promo code" className="h-11 w-full rounded-md border border-line-strong bg-white pl-9 pr-3 text-[14.5px] text-bone placeholder:text-faint focus:border-caliper focus:outline-none" />
                </div>
                <Button type="submit" variant="secondary" size="md" className="h-11">Apply</Button>
              </form>
              {codeError && <p className="mt-2 text-[13px] text-doppler-red">{codeError}</p>}
              {site.demoMode && !applied && <p className="mt-2 text-[12.5px] text-faint">Draft: try RUDY10.</p>}
              <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-[15px]">
                <div className="flex justify-between"><dt className="text-mute">Subtotal</dt><dd className="text-bone">{formatPriceUSD(subtotal)}</dd></div>
                {applied && <div className="flex justify-between text-phosphor"><dt>Code {applied}</dt><dd>−{formatPriceUSD(discount)}</dd></div>}
                <div className="flex justify-between border-t border-line pt-3 text-[17px] font-bold"><dt className="text-bone">Total</dt><dd className="text-bone">{formatPriceUSD(total)}</dd></div>
              </dl>
              <Button
                size="lg"
                className="mt-5 w-full"
                onClick={pay}
                disabled={stage === "processing" || payable.length === 0}
                iconLeft={stage === "processing" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              >
                {stage === "processing" ? "Processing…" : `Pay ${formatPriceUSD(total).replace(" USD", "")}`}
              </Button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[12.5px] text-faint"><ShieldCheck className="h-3.5 w-3.5" /> Payment is handled by a secure payment processor.</p>
              {site.demoMode && (
                <p className="mt-3 rounded-md bg-[#fbf7ee] px-3 py-2 text-center text-[12.5px] text-[#8a6a22]">Draft preview: no card is charged.</p>
              )}
            </div>
          </aside>
        </div>
      )}
    </Container>
  );
}
