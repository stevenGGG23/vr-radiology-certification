"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Info } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { signInWithGoogle } from "@/lib/auth-client";
import { site } from "@/lib/site";
import { useSession } from "@/lib/store/session";

export const credentialOptions = [
  "Nurse Practitioner (NP)",
  "Physician Assistant (PA)",
  "Physician (MD/DO)",
  "Resident / Fellow",
  "Registered Nurse (RN)",
  "Paramedic / EMT",
  "Student",
  "Other",
];

function safeNext(next: string | null, fallback: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

function PasswordInput(props: React.ComponentProps<"input">) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? "text" : "password"} className="pr-11" />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-bone"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A11.9 11.9 0 0 1 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

/** "Continue with Google" plus an "or" divider. Rendered only when Google sign-in is configured. */
function GoogleSignIn({ next }: { next: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          signInWithGoogle(next).catch(() => setBusy(false));
        }}
        className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-line-strong bg-white text-[15px] font-semibold text-bone shadow-sm transition-colors hover:bg-ink-950 disabled:opacity-60"
      >
        <GoogleIcon className="h-5 w-5" />
        {busy ? "Opening Google…" : "Continue with Google"}
      </button>
      <div className="mt-6 flex items-center gap-3 text-[12.5px] font-medium uppercase tracking-[0.1em] text-faint">
        <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
      </div>
    </>
  );
}

function DemoNote({ children }: { children: React.ReactNode }) {
  if (!site.demoMode) return null;
  return (
    <div className="mt-8 flex gap-3 rounded-lg border border-[#e9d9b4] bg-[#fbf7ee] p-4 text-[13px] leading-relaxed text-bone-dim">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#8a6a22]" />
      <div>{children}</div>
    </div>
  );
}

export function LoginForm({ google = false }: { google?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const googleError = params.get("error");
  const signIn = useSession((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [forgot, setForgot] = useState(false);

  return (
    <>
      <h1 className="text-[32px] font-bold leading-tight tracking-[-0.02em] text-bone">Sign in</h1>
      <p className="mt-3 text-[15px] text-mute">
        New here?{" "}
        <Link href={`/signup${params.get("next") ? `?next=${encodeURIComponent(params.get("next")!)}` : ""}`} className="text-bone underline decoration-line-strong underline-offset-4 hover:decoration-caliper">
          Create an account
        </Link>
      </p>
      {googleError && (
        <p className="mt-6 rounded-lg border border-doppler-red/30 bg-doppler-red/[0.05] p-3 text-[13.5px] text-doppler-red">
          Google sign-in didn&apos;t finish. Please try again, or sign in with your email.
        </p>
      )}
      {google && <GoogleSignIn next={safeNext(params.get("next"), "/dashboard")} />}
      <form
        className={google ? "mt-6 space-y-5" : "mt-9 space-y-5"}
        onSubmit={(e) => {
          e.preventDefault();
          setError(undefined);
          if (!password) return setError("Enter your password.");
          const r = signIn(email);
          if (!r.ok) return setError(r.error);
          const isAdmin = email.trim().toLowerCase() === site.demoAdminEmail;
          router.push(safeNext(params.get("next"), isAdmin ? "/studio" : "/dashboard"));
        }}
      >
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@hospital.org" />
        </Field>
        <Field
          label="Password"
          htmlFor="password"
          error={error}
          hint={
            <button type="button" onClick={() => setForgot(true)} className="text-faint hover:text-bone">
              {forgot ? "A reset link would be emailed here once email is connected." : "Forgot your password?"}
            </button>
          }
        >
          <PasswordInput id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Button type="submit" size="lg" className="w-full" iconRight={<ArrowRight className="h-4 w-4" />}>
          Sign in
        </Button>
      </form>
      <DemoNote>
        Draft preview: any password works. Sign in as Dr. Rudy with <span className="font-semibold text-bone">{site.demoAdminEmail}</span> to open the Studio, or create a new student account.
      </DemoNote>
    </>
  );
}

export function SignupForm({ google = false }: { google?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const signUp = useSession((s) => s.signUp);
  const [form, setForm] = useState({ name: "", email: "", password: "", credential: credentialOptions[0], license: "", agree: false });
  const [error, setError] = useState<string>();
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  return (
    <>
      <h1 className="text-[32px] font-bold leading-tight tracking-[-0.02em] text-bone">Create your account</h1>
      <p className="mt-3 text-[15px] text-mute">
        Already have one?{" "}
        <Link href={`/login${params.get("next") ? `?next=${encodeURIComponent(params.get("next")!)}` : ""}`} className="text-bone underline decoration-line-strong underline-offset-4 hover:decoration-caliper">
          Sign in
        </Link>
      </p>
      {google && <GoogleSignIn next={safeNext(params.get("next"), "/dashboard")} />}
      <form
        className={google ? "mt-6 space-y-5" : "mt-9 space-y-5"}
        onSubmit={(e) => {
          e.preventDefault();
          setError(undefined);
          if (form.password.length < 8) return setError("Use at least 8 characters for your password.");
          if (!form.agree) return setError("Please accept the terms to continue.");
          const r = signUp({ name: form.name, email: form.email, credential: form.credential, licenseNumber: form.license });
          if (!r.ok) return setError(r.error);
          router.push(safeNext(params.get("next"), "/dashboard"));
        }}
      >
        <Field label="Full name" htmlFor="name" hint="Exactly as it should appear on your certificates.">
          <Input id="name" required autoComplete="name" value={form.name} onChange={set("name")} placeholder="Jordan A. Example" />
        </Field>
        <Field label="Email" htmlFor="su-email">
          <Input id="su-email" type="email" required autoComplete="email" value={form.email} onChange={set("email")} placeholder="you@hospital.org" />
        </Field>
        <Field label="Password" htmlFor="su-password">
          <PasswordInput id="su-password" autoComplete="new-password" value={form.password} onChange={set("password")} placeholder="At least 8 characters" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Profession" htmlFor="credential">
            <Select id="credential" value={form.credential} onChange={set("credential")}>
              {credentialOptions.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="License # (optional)" htmlFor="license">
            <Input id="license" value={form.license} onChange={set("license")} placeholder="For CE records" />
          </Field>
        </div>
        <label className="flex items-start gap-3 text-[13.5px] leading-relaxed text-mute">
          <input type="checkbox" checked={form.agree} onChange={set("agree")} className="mt-1 h-4 w-4 accent-[#1a5bd0]" />
          <span>
            I agree to the <Link href="/legal/terms" className="text-bone-dim underline underline-offset-4">Terms</Link> and{" "}
            <Link href="/legal/privacy" className="text-bone-dim underline underline-offset-4">Privacy Policy</Link>.
          </span>
        </label>
        {error && <p className="text-[13px] text-doppler-red">{error}</p>}
        <Button type="submit" size="lg" className="w-full" iconRight={<ArrowRight className="h-4 w-4" />}>
          Create account
        </Button>
      </form>
      <DemoNote>Draft preview: accounts are stored only in this browser, and no email is sent.</DemoNote>
    </>
  );
}
