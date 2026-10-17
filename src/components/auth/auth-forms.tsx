"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Info } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
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

function DemoNote({ children }: { children: React.ReactNode }) {
  if (!site.demoMode) return null;
  return (
    <div className="mt-8 flex gap-3 rounded-lg border border-[#e9d9b4] bg-[#fbf7ee] p-4 text-[13px] leading-relaxed text-bone-dim">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#8a6a22]" />
      <div>{children}</div>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
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
      <form
        className="mt-9 space-y-5"
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

export function SignupForm() {
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
      <form
        className="mt-9 space-y-5"
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
          <input type="checkbox" checked={form.agree} onChange={set("agree")} className="mt-1 h-4 w-4 accent-[#f3c969]" />
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
