/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight, ChevronDown, LayoutDashboard, LogOut, Menu, Search, Settings, ShieldCheck, ShoppingBag, Trash2, UserRound, X,
} from "lucide-react";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/ui/brand";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatPrice, initials } from "@/lib/format";
import { categories, site } from "@/lib/site";
import { signOutEverywhere } from "@/lib/auth-client";
import { useCart } from "@/lib/store/cart";
import { useCatalog } from "@/lib/store/catalog";
import { useCurrentUser, useHydration } from "@/lib/store/session";
import type { Course } from "@/lib/types";

const links = [
  { href: "/courses?c=bundle", label: "Bundles" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/teams", label: "For teams" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function useLiveCourses() {
  const courses = useCatalog((s) => s.courses);
  return useMemo(() => courses.filter((c) => c.status !== "draft"), [courses]);
}

function AnnouncementBar() {
  const settings = useCatalog((s) => s.settings);
  const hydrated = useHydration((s) => s.hydrated);
  const [dismissed, setDismissed] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem("ria-announce");
    } catch {
      return null;
    }
  });
  if (!hydrated || !settings.announcementOn || dismissed === settings.announcement || !settings.announcement) return null;
  return (
    <div className="relative z-50 bg-[#1a5bd0] text-[13px] font-medium text-white">
      <div className="mx-auto flex max-w-[1280px] items-center justify-center px-10 py-2 text-center">
        <Link href="/courses" className="hover:underline">
          {settings.announcement} <span aria-hidden>→</span>
        </Link>
        <button
          aria-label="Dismiss announcement"
          className="absolute right-3 rounded p-1 text-white/70 hover:text-white"
          onClick={() => {
            setDismissed(settings.announcement);
            try {
              sessionStorage.setItem("ria-announce", settings.announcement);
            } catch {}
          }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function MegaMenu({ courses, onPick }: { courses: Course[]; onPick: () => void }) {
  const bundle = courses.find((c) => c.id === "ria-b1") ?? courses.find((c) => c.includes);
  const groups = categories
    .filter((c) => c.id !== "bundle")
    .map((cat) => ({ cat, items: courses.filter((c) => c.category === cat.id) }))
    .filter((g) => g.items.length);
  return (
    <div className="mx-auto grid max-w-[1280px] gap-8 px-8 py-8 lg:grid-cols-[1fr_300px]">
      <div className="grid grid-cols-2 gap-x-8 gap-y-7 xl:grid-cols-3">
        {groups.map(({ cat, items }) => (
          <div key={cat.id}>
            <Link href={`/courses?c=${cat.id}`} onClick={onPick} className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#1a5bd0] hover:underline">
              {cat.label}
            </Link>
            <ul className="mt-3 space-y-1">
              {items.map((c) => (
                <li key={c.id}>
                  <Link href={`/courses/${c.slug}`} onClick={onPick} className="-mx-2 flex items-baseline justify-between gap-3 rounded-md px-2 py-1.5 text-[14px] text-bone-dim hover:bg-ink-950 hover:text-bone">
                    <span>{c.title}</span>
                    <span className="shrink-0 text-[12.5px] text-faint">{c.status === "coming-soon" ? "Soon" : formatPrice(c.priceCents)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {bundle && (
        <Link href={`/courses/${bundle.slug}`} onClick={onPick} className="group overflow-hidden rounded-xl border border-line bg-ink-950">
          <img src={bundle.cover} alt="" className="aspect-[16/9] w-full object-cover" />
          <div className="p-4">
            <div className="text-[11.5px] font-bold uppercase tracking-[0.1em] text-[#b58b33]">Best value</div>
            <div className="mt-1 text-[15px] font-semibold text-bone">{bundle.title}</div>
            <div className="mt-1 text-[13px] text-mute">{bundle.includes?.length} courses · {formatPrice(bundle.priceCents)}</div>
            <div className="mt-3 flex items-center gap-1 text-[13px] font-semibold text-[#1a5bd0]">
              View bundle <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </Link>
      )}
      <div className="flex items-center justify-between border-t border-line pt-5 text-[13.5px] lg:col-span-2">
        <span className="text-mute">{courses.length} courses and bundles · self-paced · certificate on completion</span>
        <Link href="/courses" onClick={onPick} className="font-semibold text-[#1a5bd0] hover:underline">Browse the full catalog →</Link>
      </div>
    </div>
  );
}

function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const courses = useLiveCourses();
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    const list = t
      ? courses.filter((c) =>
          [c.title, c.subtitle, c.code, ...c.modules.flatMap((m) => m.lessons.map((l) => l.title))].join(" ").toLowerCase().includes(t),
        )
      : courses.filter((c) => c.featured);
    return list.slice(0, 7);
  }, [courses, q]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-[#071528]/60 backdrop-blur-sm" onClick={onClose}>
          <motion.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="mx-auto mt-[10vh] w-[min(92vw,640px)] overflow-hidden rounded-xl bg-white shadow-2xl"
            role="dialog"
            aria-label="Search courses"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="h-4 w-4 text-faint" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && onClose()}
                placeholder="Search courses, e.g. eFAST, lung, fracture"
                className="h-14 flex-1 bg-transparent text-[16px] text-bone placeholder:text-faint focus:outline-none"
              />
              <button onClick={onClose} className="rounded p-1 text-faint hover:text-bone" aria-label="Close search"><X className="h-4 w-4" /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {!q && <div className="px-3 pb-1 pt-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-faint">Popular courses</div>}
              {results.map((c) => (
                <Link key={c.id} href={`/courses/${c.slug}`} onClick={onClose} className="flex items-center gap-3 rounded-lg p-2 hover:bg-ink-950">
                  <img src={c.cover} alt="" className="h-12 w-16 shrink-0 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14.5px] font-semibold text-bone">{c.title}</div>
                    <div className="truncate text-[12.5px] text-mute">{c.code} · {c.ceHours} contact hours</div>
                  </div>
                  <div className="text-[13.5px] font-semibold text-bone">{formatPrice(c.priceCents)}</div>
                </Link>
              ))}
              {results.length === 0 && <p className="p-4 text-[14px] text-mute">No courses match &ldquo;{q}&rdquo;.</p>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CartDrawer() {
  const { ids, open, setOpen, remove } = useCart();
  const courses = useCatalog((s) => s.courses);
  const router = useRouter();
  const items = ids.map((id) => courses.find((c) => c.id === id)).filter((c): c is Course => Boolean(c));
  const subtotal = items.reduce((n, c) => n + c.priceCents, 0);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-[#071528]/50" onClick={() => setOpen(false)} />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed inset-y-0 right-0 z-[81] flex w-[min(100vw,420px)] flex-col bg-white shadow-2xl"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-[17px] font-bold text-bone">Your cart ({items.length})</h2>
              <button onClick={() => setOpen(false)} aria-label="Close cart" className="rounded p-1 text-faint hover:text-bone"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5">
              {items.length === 0 ? (
                <div className="py-16 text-center">
                  <ShoppingBag className="mx-auto h-8 w-8 text-faint" />
                  <p className="mt-3 text-[15px] text-mute">Your cart is empty.</p>
                  <ButtonLink href="/courses" className="mt-5" onClick={() => setOpen(false)}>Browse courses</ButtonLink>
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  {items.map((c) => (
                    <li key={c.id} className="flex gap-3 py-4">
                      <img src={c.cover} alt="" className="h-16 w-20 shrink-0 rounded-md object-cover" />
                      <div className="min-w-0 flex-1">
                        <Link href={`/courses/${c.slug}`} onClick={() => setOpen(false)} className="line-clamp-2 text-[14.5px] font-semibold leading-snug text-bone hover:underline">{c.title}</Link>
                        <div className="mt-0.5 text-[12.5px] text-mute">{c.code} · {c.ceHours} contact hours</div>
                        <button onClick={() => remove(c.id)} className="mt-1.5 flex items-center gap-1 text-[12.5px] text-faint hover:text-doppler-red"><Trash2 className="h-3.5 w-3.5" /> Remove</button>
                      </div>
                      <div className="text-[14.5px] font-semibold text-bone">{formatPrice(c.priceCents)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {items.length > 0 && (
              <div className="border-t border-line px-5 py-5">
                <div className="flex justify-between text-[15px]">
                  <span className="text-mute">Subtotal</span>
                  <span className="font-bold text-bone">{formatPrice(subtotal)} USD</span>
                </div>
                <p className="mt-1 text-[12.5px] text-faint">Promo codes are applied at checkout.</p>
                <button
                  onClick={() => {
                    setOpen(false);
                    router.push("/checkout");
                  }}
                  className="mt-4 h-12 w-full rounded-lg bg-[#1a5bd0] text-[15px] font-semibold text-white hover:bg-[#1447a8]"
                >
                  Check out
                </button>
                <button onClick={() => setOpen(false)} className="mt-2 h-10 w-full text-[14px] font-semibold text-bone-dim hover:text-bone">Continue shopping</button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function AccountButton() {
  const user = useCurrentUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  if (!user) {
    return (
      <Link href="/login" className="flex items-center gap-2 rounded-md px-2.5 py-2 text-[14px] font-medium text-bone-dim hover:text-white" aria-label="Sign in">
        <UserRound className="h-5 w-5" />
        <span className="hidden xl:inline">Sign in</span>
      </Link>
    );
  }
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Account menu" className="flex items-center gap-1.5 rounded-full p-1 pr-2 text-bone-dim hover:text-white">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-[12px] font-bold text-white">{initials(user.name)}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-[calc(100%+10px)] w-60 rounded-xl border border-[#e3e8ef] bg-white p-1.5 text-[#0d1b2e] shadow-xl"
          >
            <div className="px-3 pb-2 pt-1.5">
              <div className="truncate text-[14px] font-semibold">{user.name}</div>
              <div className="truncate text-[12px] text-[#7d8ba0]">{user.email}</div>
            </div>
            <div className="h-px bg-[#e3e8ef]" />
            {[
              { href: "/dashboard", label: "My courses", icon: LayoutDashboard },
              { href: "/account", label: "Account settings", icon: Settings },
              ...(user.role === "admin" ? [{ href: "/studio", label: "Studio (admin)", icon: ShieldCheck }] : []),
            ].map((i) => (
              <Link key={i.href} href={i.href} onClick={() => setOpen(false)} className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] text-[#33445a] hover:bg-[#f5f7fa]">
                <i.icon className="h-4 w-4" /> {i.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                void signOutEverywhere();
              }}
              className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] text-[#33445a] hover:bg-[#f5f7fa]"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OnNavigate({ onChange }: { onChange: () => void }) {
  const pathname = usePathname();
  useEffect(() => onChange(), [pathname, onChange]);
  return null;
}

export function SiteHeader() {
  const courses = useLiveCourses();
  const user = useCurrentUser();
  const hydrated = useHydration((s) => s.hydrated);
  const count = useCart((s) => s.ids.length);
  const setCartOpen = useCart((s) => s.setOpen);
  const [mega, setMega] = useState(false);
  const [search, setSearch] = useState(false);
  const [mobile, setMobile] = useState(false);
  const closeAll = useCallback(() => {
    setMega(false);
    setMobile(false);
  }, []);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    document.documentElement.style.overflow = mobile ? "hidden" : "";
  }, [mobile]);

  return (
    <>
      <Suspense>
        <OnNavigate onChange={closeAll} />
      </Suspense>
      <AnnouncementBar />
      <header
        className="on-dark sticky top-0 z-40 bg-[#0b1f3a] shadow-[0_1px_0_rgba(255,255,255,0.06)]"
        onMouseLeave={() => {
          timer.current = setTimeout(() => setMega(false), 150);
        }}
      >
        <div className="mx-auto flex h-[68px] max-w-[1280px] items-center gap-6 px-5 sm:px-8">
          <Logo />
          <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Main">
            <button
              onMouseEnter={() => {
                clearTimeout(timer.current);
                setMega(true);
              }}
              onClick={() => setMega((m) => !m)}
              aria-expanded={mega}
              className={cn("flex items-center gap-1 rounded-md px-3 py-2 text-[14.5px] font-medium transition-colors", mega ? "text-white" : "text-bone-dim hover:text-white")}
            >
              Courses <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", mega && "rotate-180")} />
            </button>
            {links.map((l) => (
              <Link key={l.href} href={l.href} onMouseEnter={() => setMega(false)} className="rounded-md px-3 py-2 text-[14.5px] font-medium text-bone-dim transition-colors hover:text-white">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <button onClick={() => setSearch(true)} aria-label="Search courses" className="rounded-md p-2.5 text-bone-dim hover:text-white">
              <Search className="h-5 w-5" />
            </button>
            {hydrated ? <AccountButton /> : <span className="w-10" />}
            <button onClick={() => setCartOpen(true)} aria-label={`Cart, ${count} items`} className="relative rounded-md p-2.5 text-bone-dim hover:text-white">
              <ShoppingBag className="h-5 w-5" />
              {hydrated && count > 0 && (
                <span className="absolute right-1 top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#35a3de] px-1 text-[10.5px] font-bold text-white">{count}</span>
              )}
            </button>
            <button className="ml-1 rounded-md p-2 text-white lg:hidden" onClick={() => setMobile((m) => !m)} aria-label={mobile ? "Close menu" : "Open menu"} aria-expanded={mobile}>
              {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mega && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              onMouseEnter={() => clearTimeout(timer.current)}
              className="light-scope absolute inset-x-0 top-full hidden border-b border-[#e3e8ef] bg-white shadow-xl lg:block"
            >
              <MegaMenu courses={courses} onPick={() => setMega(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed inset-x-0 bottom-0 top-[68px] z-30 overflow-y-auto bg-white lg:hidden"
          >
            <nav className="px-5 pb-12 pt-4" aria-label="Mobile">
              <div className="text-[12px] font-bold uppercase tracking-[0.1em] text-faint">Courses by specialty</div>
              <ul className="mt-2 divide-y divide-line border-y border-line">
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link href={`/courses?c=${c.id}`} className="flex items-center justify-between py-3.5 text-[16px] font-semibold text-bone">
                      {c.label}
                      <span className="text-[13px] font-normal text-faint">{courses.filter((x) => x.category === c.id).length}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="mt-6 space-y-1">
                {[{ href: "/courses", label: "All courses" }, ...links, { href: "/verify", label: "Verify a certificate" }].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="block py-2.5 text-[16px] text-bone-dim">{l.label}</Link>
                  </li>
                ))}
              </ul>
              <div className="mt-8 grid gap-3">
                {user ? (
                  <ButtonLink href="/dashboard" size="lg" iconLeft={<LayoutDashboard className="h-4 w-4" />}>My courses</ButtonLink>
                ) : (
                  <>
                    <ButtonLink href="/courses" size="lg">Browse courses</ButtonLink>
                    <ButtonLink href="/login" size="lg" variant="secondary">Sign in</ButtonLink>
                  </>
                )}
              </div>
              <p className="mt-8 text-[12.5px] leading-relaxed text-faint">{site.provenance.short}.</p>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchDialog open={search} onClose={() => setSearch(false)} />
      <CartDrawer />
    </>
  );
}
