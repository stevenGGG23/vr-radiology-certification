"use client";

import { signIn, signOut } from "next-auth/react";
import { create } from "zustand";
import { useSession } from "./store/session";
import type { Role } from "./types";

export interface GoogleUser {
  name?: string | null;
  email: string;
  image?: string | null;
  role?: Role;
}

/** Whether this browser has a Google (Auth.js) session. Not persisted. */
export const useAuthProvider = create<{ google: boolean; signingOut: boolean }>(() => ({ google: false, signingOut: false }));

/** Sends the visitor to Google, then back through /auth/complete to `next`. */
export function signInWithGoogle(next: string) {
  return signIn("google", { redirectTo: `/auth/complete?next=${encodeURIComponent(next)}` });
}

/** Reads the Google session from the Auth.js cookie, if there is one. */
export async function fetchGoogleUser(timeoutMs = 4000): Promise<GoogleUser | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch("/api/auth/session", { cache: "no-store", signal: controller.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as { user?: GoogleUser } | null;
    return data?.user?.email ? data.user : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Set on the home page URL after signing out, so it can confirm it. */
export const SIGNED_OUT_PARAM = "signed-out";

/**
 * Signs out of the site and, if present, the Google session too. A short
 * "Signing out" screen covers the switch, then the home page reloads so
 * nothing from the account stays in memory (learners often share
 * hospital workstations).
 */
export async function signOutEverywhere() {
  if (useAuthProvider.getState().signingOut) return;
  useAuthProvider.setState({ signingOut: true });
  const pause = new Promise((resolve) => setTimeout(resolve, 650));
  const google = useAuthProvider.getState().google ? signOut({ redirect: false }).catch(() => {}) : null;
  await Promise.all([pause, google]);
  // Cleared last, right before leaving, so the current page can't react to it first.
  useSession.getState().signOut();
  window.location.replace(`/?${SIGNED_OUT_PARAM}=1`);
}
