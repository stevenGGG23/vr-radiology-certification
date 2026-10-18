"use client";

import { useEffect } from "react";
import { fetchGoogleUser, useAuthProvider } from "../auth-client";
import { useCart } from "./cart";
import { useCatalog } from "./catalog";
import { useHydration, useSession } from "./session";

/**
 * Loads persisted demo data after the first paint so server and client HTML
 * match. With Google sign-in on, it also restores a Google session into the
 * site when nobody is signed in locally (e.g. after site data was cleared).
 */
export function StoreHydrator({ googleSignIn = false }: { googleSignIn?: boolean }) {
  useEffect(() => {
    const restore = async () => {
      await Promise.all([useCatalog.persist.rehydrate(), useSession.persist.rehydrate(), useCart.persist.rehydrate()]);
      if (!googleSignIn) return;
      const user = await fetchGoogleUser();
      if (!user) return;
      useAuthProvider.setState({ google: true });
      if (!useSession.getState().currentUserId) useSession.getState().signInWithProvider(user);
    };
    restore().finally(() => {
      useHydration.setState({ hydrated: true });
      document.documentElement.dataset.hydrated = "true";
    });
  }, [googleSignIn]);
  return null;
}
