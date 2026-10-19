"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ExternalLink, LayoutDashboard, LogOut, Mail, Menu, Settings, UsersRound, X } from "lucide-react";
import { Suspense, useState, type ReactNode } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { DraftTools } from "./draft-tools";
import { LogoMark } from "@/components/ui/brand";
import { cn } from "@/lib/cn";
import { signOutEverywhere } from "@/lib/auth-client";
import { site } from "@/lib/site";
import { useCurrentUser } from "@/lib/store/session";

const items = [
  { href: "/studio", label: "Overview", icon: LayoutDashboard },
  { href: "/studio/courses", label: "Courses", icon: BookOpen },
  { href: "/studio/students", label: "Students", icon: UsersRound },
  { href: "/studio/emails", label: "Emails", icon: Mail },
  { href: "/studio/settings", label: "Settings", icon: Settings },
];

function NavItems({ onPick }: { onPick?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {items.map((i) => {
        const active = i.href === "/studio" ? pathname === "/studio" : pathname.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            onClick={onPick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] transition-colors",
              active ? "bg-white/[0.07] text-bone" : "text-mute hover:bg-white/[0.04] hover:text-bone",
            )}
          >
            <i.icon className={cn("h-4 w-4", active && "text-caliper")} />
            {i.label}
          </Link>
        );
      })}
    </>
  );
}

function Sidebar({ onPick }: { onPick?: () => void }) {
  const user = useCurrentUser();
  return (
    <div className="flex h-full flex-col">
      <Link href="/studio" className="flex items-center gap-2.5 px-3 py-1 text-bone">
        <LogoMark className="h-6 w-6" />
        <span className="font-display text-[19px]">Studio</span>
        {site.demoMode && <span className="ml-auto rounded-full border border-caliper/30 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-caliper">Draft</span>}
      </Link>
      <nav className="mt-8 space-y-1" aria-label="Studio">
        <Suspense fallback={null}>
          <NavItems onPick={onPick} />
        </Suspense>
      </nav>
      <div className="mt-auto space-y-1 border-t border-line pt-4">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] text-mute hover:text-bone">
          <ExternalLink className="h-4 w-4" /> View live site
        </Link>
        <button
          onClick={() => void signOutEverywhere()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] text-mute hover:text-bone"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
        {user && <div className="truncate px-3 pt-2 text-[12px] text-faint">{user.email}</div>}
        {site.demoMode && (
          <div className="px-1 pt-3">
            <Suspense>
              <DraftTools />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}

export function StudioShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <RequireAuth role="admin">
      <div className="flex min-h-[100svh]">
        <aside className="sticky top-0 hidden h-[100svh] w-60 shrink-0 border-r border-line bg-ink-950/70 p-4 lg:block">
          <Sidebar />
        </aside>
        <div className="min-w-0 flex-1">
          <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-void/90 px-4 backdrop-blur lg:hidden">
            <span className="flex items-center gap-2 font-display text-[19px] text-bone"><LogoMark className="h-6 w-6" /> Studio</span>
            <button onClick={() => setOpen(true)} aria-label="Open menu" className="p-2 text-bone"><Menu className="h-5 w-5" /></button>
          </div>
          {open && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
              <div className="absolute inset-y-0 left-0 w-64 border-r border-line bg-ink-950 p-4">
                <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-3 p-1 text-faint"><X className="h-5 w-5" /></button>
                <Sidebar onPick={() => setOpen(false)} />
              </div>
            </div>
          )}
          <main className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-8 sm:py-10">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}

export function StudioHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[clamp(1.7rem,3.5vw,2.2rem)] font-bold leading-tight tracking-[-0.02em] text-bone">{title}</h1>
        {description && <p className="mt-2 text-[14.5px] text-mute">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
