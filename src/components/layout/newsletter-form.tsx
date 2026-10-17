"use client";

import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";

/** Stub: connect to the email provider (Mailchimp, ConvertKit, Resend…) later. */
export function NewsletterForm() {
  const [done, setDone] = useState(false);
  return done ? (
    <p className="flex items-center gap-2 text-sm text-phosphor">
      <Check className="h-4 w-4" /> You&apos;re on the list.
    </p>
  ) : (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
      className="flex h-11 items-center rounded-lg border border-line-strong bg-white/5 pl-3.5 pr-1 focus-within:border-caliper/60"
    >
      <input
        type="email"
        required
        placeholder="you@hospital.org"
        aria-label="Email address"
        className="min-w-0 flex-1 bg-transparent text-sm text-bone placeholder:text-faint focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Subscribe"
        className="grid h-9 w-9 place-items-center rounded-md bg-[#1a5bd0] text-white transition-colors hover:bg-[#1447a8]"
      >
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
