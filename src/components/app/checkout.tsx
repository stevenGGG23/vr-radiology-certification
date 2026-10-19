/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, CircleCheck, Loader2, Lock, ShieldCheck, Tag as TagIcon, Trash2, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { AppleIcon, GoogleIcon } from "@/components/ui/brand-icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Container, Skeleton } from "@/components/ui/primitives";
import { ceHoursFor } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatPriceUSD } from "@/lib/format";
import { site } from "@/lib/site";
import { useCart } from "@/lib/store/cart";
import { useCatalog } from "@/lib/store/catalog";
import { useCurrentUser, useHydration, useSession } from "@/lib/store/session";
import type { Course, PaymentMethod } from "@/lib/types";

/*
  Checkout runs in three deliberate steps so nobody buys by accident:
    1. /checkout          Review the order (items, promo code, account). No charge.
    2. /checkout/pay      Payment: Apple Pay, Google Pay or card, then confirm.
    3. /checkout/success  Confirmation.
  In production step 2 hosts Stripe's Payment Element and Express Checkout
  Element, and the order is created by the Stripe webhook, not the browser.
*/

const PROMOS: Record<string, number> = { RUDY10: 0.1 };
const money = (cents: number) => formatPriceUSD(cents).replace(" USD", "");
const methodLabel: Record<PaymentMethod, string> = { card: "Card", apple_pay: "Apple Pay", google_pay: "Google Pay" };

/** /checkout/[slug] ("Buy it now" links): put the course in the cart, then go to the review step. */
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

/** Cart contents and totals, shared by the review and payment steps. */
function useOrder() {
  const courses = useCatalog((s) => s.courses);
  const ids = useCart((s) => s.ids);
  const promo = useCart((s) => s.promo);
  const user = useCurrentUser();
  const enrollments = useSession((s) => s.db.enrollments);
  const items = ids.map((id) => courses.find((c) => c.id === id)).filter((c): c is Course => Boolean(c));
  const owns = (c: Course) =>
    (c.includes?.length ? c.includes : [c.id]).every((id) => enrollments.some((e) => e.userId === user?.id && e.courseId === id));
  const payable = items.filter((c) => !owns(c) && c.status === "published");
  const subtotal = payable.reduce((n, c) => n + c.priceCents, 0);
  const rate = promo ? (PROMOS[promo] ?? 0) : 0;
  const discount = Math.round(subtotal * rate);
  return { courses, items, owns, payable, subtotal, promo: rate ? promo : null, rate, discount, total: subtotal - discount, user };
}

function Steps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-[13px] font-medium sm:gap-3" aria-label="Checkout steps">
      {["Review", "Payment", "Confirmation"].map((label, i) => {
        const n = i + 1;
        const state = n < current ? "done" : n === current ? "current" : "todo";
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-3" aria-current={state === "current" ? "step" : undefined}>
            {i > 0 && <span className="h-px w-4 bg-line-strong sm:w-10" />}
            <span className={cn("grid h-6 w-6 place-items-center rounded-full text-[12px] font-bold", state === "todo" ? "border border-line-strong text-faint" : "bg-caliper text-white")}>
              {state === "done" ? <Check className="h-3.5 w-3.5" /> : n}
            </span>
            <span className={state === "todo" ? "text-faint" : "text-bone"}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------ 1. Review */

export function Checkout() {
  return (
    <RequireAuth>
      <ReviewStep />
    </RequireAuth>
  );
}

function ReviewStep() {
  const order = useOrder();
  const remove = useCart((s) => s.remove);
  const setPromo = useCart((s) => s.setPromo);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string>();
  const { items, payable, user } = order;

  return (
    <Container className="py-10 sm:py-14">
      <Steps current={1} />
      <h1 className="mt-6 text-[clamp(1.8rem,4vw,2.4rem)] font-bold tracking-[-0.02em] text-bone">Review your order</h1>
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
                      <div className="text-[13px] text-mute">{c.code} · {ceHoursFor(c, order.courses)} contact hours</div>
                      {order.owns(c) && <div className="mt-1 text-[13px] font-semibold text-phosphor">Already in your account, so it won&apos;t be charged</div>}
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
                    setPromo(c);
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
              {site.demoMode && !order.promo && <p className="mt-2 text-[12.5px] text-faint">Draft: try RUDY10.</p>}
              <Totals order={order} onRemovePromo={() => setPromo(null)} />
              {payable.length > 0 ? (
                <ButtonLink href="/checkout/pay" size="lg" className="mt-5 w-full" iconRight={<ArrowRight className="h-4 w-4" />}>
                  Continue to payment
                </ButtonLink>
              ) : (
                <Button size="lg" className="mt-5 w-full" disabled>Nothing to pay for</Button>
              )}
              <p className="mt-3 text-center text-[12.5px] text-faint">You&apos;ll choose how to pay and confirm on the next step. Nothing is charged yet.</p>
            </div>
          </aside>
        </div>
      )}
    </Container>
  );
}

function Totals({ order, onRemovePromo }: { order: ReturnType<typeof useOrder>; onRemovePromo?: () => void }) {
  return (
    <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-[15px]">
      <div className="flex justify-between"><dt className="text-mute">Subtotal</dt><dd className="text-bone">{formatPriceUSD(order.subtotal)}</dd></div>
      {order.promo && (
        <div className="flex justify-between text-phosphor">
          <dt className="flex items-center gap-2">
            Code {order.promo}
            {onRemovePromo && <button type="button" onClick={onRemovePromo} className="text-[12.5px] text-faint underline hover:text-bone">Remove</button>}
          </dt>
          <dd>−{formatPriceUSD(order.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between border-t border-line pt-3 text-[17px] font-bold"><dt className="text-bone">Total</dt><dd className="text-bone">{formatPriceUSD(order.total)}</dd></div>
    </dl>
  );
}

/* ------------------------------------------------------------ 2. Payment */

type Wallet = "apple_pay" | "google_pay";

/**
 * Both wallets are offered on every device that can use them. Google Pay runs
 * in every major browser. Apple Pay runs in Safari and, by scanning a code with
 * an iPhone, in other desktop browsers, so only Android phones can't use it.
 * In production Stripe's Express Checkout Element makes the same call with
 * applePay and googlePay set to "always".
 */
const ALL_WALLETS = { apple_pay: true, google_pay: true };
let detected: typeof ALL_WALLETS | null = null;
function walletSupport() {
  detected ??= { apple_pay: !/Android/i.test(navigator.userAgent), google_pay: true };
  return detected;
}
const noSubscribe = () => () => {};

function luhn(digits: string) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) d = d * 2 > 9 ? d * 2 - 9 : d * 2;
    sum += d;
  }
  return sum % 10 === 0;
}

type CardForm = { number: string; expiry: string; cvc: string; name: string; zip: string };

function validateCard(c: CardForm) {
  const errors: Partial<Record<keyof CardForm, string>> = {};
  const digits = c.number.replace(/\D/g, "");
  if (digits.length < 13 || !luhn(digits)) errors.number = "Enter a valid card number.";
  const m = c.expiry.match(/^(\d{2}) \/ (\d{2})$/);
  if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) errors.expiry = "Use MM / YY.";
  else if (new Date(2000 + Number(m[2]), Number(m[1]), 1) <= new Date()) errors.expiry = "This card has expired.";
  if (!/^\d{3,4}$/.test(c.cvc)) errors.cvc = "3 or 4 digits.";
  if (!c.name.trim()) errors.name = "Enter the name on the card.";
  if (!c.zip.trim()) errors.zip = "Enter your ZIP or postal code.";
  return errors;
}

export function CheckoutPayment() {
  return (
    <RequireAuth>
      <PaymentStep />
    </RequireAuth>
  );
}

function PaymentStep() {
  const router = useRouter();
  const order = useOrder();
  const placeOrder = useSession((s) => s.placeOrder);
  const clear = useCart((s) => s.clear);
  const wallets = useSyncExternalStore(noSubscribe, walletSupport, () => ALL_WALLETS);
  const [sheet, setSheet] = useState<Wallet | null>(null);
  const [paying, setPaying] = useState<PaymentMethod | null>(null);
  const [card, setCard] = useState<CardForm>({ number: "", expiry: "", cvc: "", name: order.user?.name ?? "", zip: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof CardForm, string>>>({});
  const nothingToPay = order.payable.length === 0;

  // Nothing left to pay for (empty cart, or already owned): back to the review step.
  useEffect(() => {
    if (nothingToPay && !paying) router.replace("/checkout");
  }, [nothingToPay, paying, router]);

  const complete = (method: PaymentMethod) => {
    setPaying(method);
    // Production: Stripe confirms the payment and redirects here; the webhook creates the order,
    // the enrollments and the receipt email.
    setTimeout(() => {
      const orders = placeOrder(order.payable, { method, discountRate: order.rate });
      clear();
      router.replace(`/checkout/success?orders=${orders.map((o) => o.id).join(",")}`);
    }, 1400);
  };

  const set = (k: keyof CardForm, v: string) => {
    setCard((c) => ({ ...c, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };
  // Never let the browser autofill a real card into the draft.
  const autofill = (value: string) => (site.demoMode ? "off" : value);

  if (nothingToPay && !paying) return <Container className="py-24"><Skeleton className="h-64" /></Container>;

  return (
    <Container className="py-10 sm:py-14">
      <Steps current={2} />
      <h1 className="mt-6 text-[clamp(1.8rem,4vw,2.4rem)] font-bold tracking-[-0.02em] text-bone">Payment</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.15fr]">
        <aside className="lg:order-2">
          <div className="panel p-5 sm:p-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-bone">Your order</h2>
              <Link href="/checkout" className="text-[13.5px] text-caliper hover:underline">Edit</Link>
            </div>
            <ul className="mt-4 space-y-3">
              {order.payable.map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-4 text-[14.5px]">
                  <span className="text-bone-dim">{c.title}</span>
                  <span className="shrink-0 text-bone">{money(c.priceCents)}</span>
                </li>
              ))}
            </ul>
            <Totals order={order} />
            <p className="mt-4 text-[13px] text-faint">Receipt to {order.user?.email}</p>
          </div>
        </aside>

        <div className="panel p-5 sm:p-6 lg:order-1">
          <h2 className="text-[17px] font-bold text-bone">Express checkout</h2>
          <div className={cn("mt-4 grid gap-3", wallets.apple_pay && wallets.google_pay && "sm:grid-cols-2")}>
            {wallets.apple_pay && <WalletButton wallet="apple_pay" disabled={paying !== null} onClick={() => setSheet("apple_pay")} />}
            {wallets.google_pay && <WalletButton wallet="google_pay" disabled={paying !== null} onClick={() => setSheet("google_pay")} />}
          </div>

          <div className="my-6 flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.1em] text-faint">
            <span className="h-px flex-1 bg-line" /> or pay with card <span className="h-px flex-1 bg-line" />
          </div>

          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              const found = validateCard(card);
              setErrors(found);
              if (Object.keys(found).length === 0) complete("card");
            }}
            className="space-y-4"
          >
            <Field label="Card number" htmlFor="cc-number" error={errors.number}>
              <Input
                id="cc-number"
                inputMode="numeric"
                autoComplete={autofill("cc-number")}
                placeholder="1234 1234 1234 1234"
                value={card.number}
                onChange={(e) => set("number", e.target.value.replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 "))}
                aria-invalid={Boolean(errors.number)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Expiry" htmlFor="cc-exp" error={errors.expiry}>
                <Input
                  id="cc-exp"
                  inputMode="numeric"
                  autoComplete={autofill("cc-exp")}
                  placeholder="MM / YY"
                  value={card.expiry}
                  onChange={(e) => {
                    const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                    set("expiry", d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d);
                  }}
                  aria-invalid={Boolean(errors.expiry)}
                />
              </Field>
              <Field label="Security code" htmlFor="cc-csc" error={errors.cvc}>
                <Input
                  id="cc-csc"
                  inputMode="numeric"
                  autoComplete={autofill("cc-csc")}
                  placeholder="CVC"
                  value={card.cvc}
                  onChange={(e) => set("cvc", e.target.value.replace(/\D/g, "").slice(0, 4))}
                  aria-invalid={Boolean(errors.cvc)}
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1.5fr_1fr]">
              <Field label="Name on card" htmlFor="cc-name" error={errors.name}>
                <Input id="cc-name" autoComplete={autofill("cc-name")} value={card.name} onChange={(e) => set("name", e.target.value)} aria-invalid={Boolean(errors.name)} />
              </Field>
              <Field label="ZIP / postal code" htmlFor="cc-zip" error={errors.zip}>
                <Input id="cc-zip" autoComplete={autofill("postal-code")} value={card.zip} onChange={(e) => set("zip", e.target.value.slice(0, 10))} aria-invalid={Boolean(errors.zip)} />
              </Field>
            </div>
            {site.demoMode && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-[#fbf7ee] px-3 py-2.5 text-[12.5px] text-[#8a6a22]">
                <span>Draft preview: don&apos;t enter a real card. Nothing is charged.</span>
                <button
                  type="button"
                  onClick={() => {
                    setCard((c) => ({ ...c, number: "4242 4242 4242 4242", expiry: "12 / 34", cvc: "123", zip: c.zip || "37203" }));
                    setErrors({});
                  }}
                  className="font-semibold underline underline-offset-2 hover:text-[#5f4813]"
                >
                  Use a test card
                </button>
              </div>
            )}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={paying !== null}
              iconLeft={paying === "card" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            >
              {paying === "card" ? "Processing…" : `Pay ${money(order.total)}`}
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-[12.5px] text-faint">
              <ShieldCheck className="h-3.5 w-3.5" /> Payments are processed securely by Stripe. We never see your full card number.
            </p>
          </form>
          <Link href="/checkout" className="mt-6 inline-flex items-center gap-1.5 text-[14px] text-mute hover:text-bone">
            <ArrowLeft className="h-4 w-4" /> Back to your order
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {sheet && (
          <WalletSheet
            wallet={sheet}
            total={order.total}
            email={order.user?.email ?? ""}
            busy={paying !== null}
            onCancel={() => setSheet(null)}
            onConfirm={() => complete(sheet)}
          />
        )}
      </AnimatePresence>
    </Container>
  );
}

function WalletButton({ wallet, disabled, onClick }: { wallet: Wallet; disabled: boolean; onClick: () => void }) {
  const apple = wallet === "apple_pay";
  return (
    <button
      type="button"
      aria-label={apple ? "Pay with Apple Pay" : "Pay with Google Pay"}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-12 w-full items-center justify-center rounded-lg bg-black text-[17px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60",
        apple && "apple-pay-button",
      )}
    >
      <span className="flex items-center gap-1.5">
        {apple ? <AppleIcon className="-mt-1 h-[18px] w-[18px]" /> : <GoogleIcon className="h-[18px] w-[18px]" />} Pay
      </span>
    </button>
  );
}

/** Stand-in for the confirmation sheet Apple Pay or Google Pay shows before any charge. */
function WalletSheet({
  wallet,
  total,
  email,
  busy,
  onCancel,
  onConfirm,
}: {
  wallet: Wallet;
  total: number;
  email: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const apple = wallet === "apple_pay";
  const name = apple ? "Apple Pay" : "Google Pay";
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/50 sm:items-center sm:p-6"
      onClick={busy ? undefined : onCancel}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={name}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-2xl bg-white p-6 text-[#0d1b2e] shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[20px] font-semibold">
            {apple ? <AppleIcon className="-mt-1 h-5 w-5" /> : <GoogleIcon className="h-5 w-5" />} Pay
          </span>
          <button onClick={onCancel} disabled={busy} aria-label="Close" className="rounded-full p-1.5 text-[#7d8ba0] hover:bg-[#f5f7fa] disabled:opacity-40">
            <X className="h-5 w-5" />
          </button>
        </div>
        <dl className="mt-5 divide-y divide-[#e3e8ef] border-y border-[#e3e8ef] text-[14.5px]">
          {[
            ["Card", "Visa •••• 4242"],
            ["Contact", email],
            ["Pay", site.name],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-3">
              <dt className="text-[#5b6b80]">{k}</dt>
              <dd className="truncate font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-[15px] text-[#5b6b80]">Total</span>
          <span className="text-[24px] font-bold">{money(total)}</span>
        </div>
        <Button size="lg" className="mt-5 w-full" onClick={onConfirm} disabled={busy} iconLeft={busy ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}>
          {busy ? "Processing…" : `Confirm and pay ${money(total)}`}
        </Button>
        <button onClick={onCancel} disabled={busy} className="mt-2 w-full rounded-lg py-2.5 text-[14.5px] font-medium text-[#5b6b80] hover:bg-[#f5f7fa] disabled:opacity-40">
          Cancel
        </button>
        {site.demoMode && (
          <p className="mt-2 text-center text-[12px] text-[#7d8ba0]">Draft preview of the {name} sheet. The real one comes from your device, and nothing is charged here.</p>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------ 3. Confirmation */

export function CheckoutSuccess() {
  return (
    <RequireAuth>
      <SuccessStep />
    </RequireAuth>
  );
}

function SuccessStep() {
  const params = useSearchParams();
  const user = useCurrentUser();
  const courses = useCatalog((s) => s.courses);
  const allOrders = useSession((s) => s.db.orders);
  const ids = (params.get("orders") ?? "").split(",").filter(Boolean);
  const orders = allOrders.filter((o) => ids.includes(o.id) && o.userId === user?.id);
  const bought = orders.map((o) => courses.find((c) => c.id === o.courseId)).filter((c): c is Course => Boolean(c));
  const first = bought.find((c) => !c.includes);

  if (orders.length === 0) {
    return (
      <Container className="max-w-2xl py-20 text-center">
        <h1 className="text-[28px] font-bold tracking-[-0.02em] text-bone">No recent order to show</h1>
        <p className="mt-3 text-mute">Your courses are always in My Courses.</p>
        <ButtonLink href="/dashboard" className="mt-8">Go to my courses</ButtonLink>
      </Container>
    );
  }

  const total = orders.reduce((n, o) => n + o.amountCents, 0);
  return (
    <Container className="max-w-2xl py-10 sm:py-14">
      <Steps current={3} />
      <div className="mt-10 text-center">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.4 }}>
          <CircleCheck className="mx-auto h-16 w-16 text-phosphor" strokeWidth={1.5} />
        </motion.div>
        <h1 className="mt-5 text-[32px] font-bold tracking-[-0.02em] text-bone">You&apos;re enrolled.</h1>
        <p className="mt-3 text-[16px] text-mute">Your receipt is on its way to {user?.email}.</p>
        {site.demoMode && <p className="mt-2 text-[13px] text-faint">Draft preview: emails are recorded in Studio → Emails instead of being sent.</p>}
      </div>
      <div className="panel mt-8 p-5 sm:p-6">
        <ul className="divide-y divide-line text-[15px]">
          {bought.map((c, i) => (
            <li key={orders[i].id} className="flex justify-between gap-4 py-3">
              <span className="text-bone">{c.title}</span>
              <span className="shrink-0 text-bone-dim">{money(orders[i].amountCents)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-line pt-3 text-[15px]">
          <span className="text-mute">Paid with {methodLabel[orders[0].method ?? "card"]}</span>
          <span className="font-bold text-bone">{money(total)}</span>
        </div>
      </div>
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
