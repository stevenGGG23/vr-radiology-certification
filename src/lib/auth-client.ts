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
export const useAuthProvider = create<{ google: boolean }>(() => ({ google: false }));

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

/** Signs out of the site and, if present, the Google session too. */
export async function signOutEverywhere() {
  useSession.getState().signOut();
  if (useAuthProvider.getState().google) {
    useAuthProvider.setState({ google: false });
    await signOut({ redirect: false }).catch(() => {});
  }
}
