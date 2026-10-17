"use client";

import { useEffect } from "react";
import { useCart } from "./cart";
import { useCatalog } from "./catalog";
import { useHydration, useSession } from "./session";

/** Loads persisted demo data after the first paint so server and client HTML match. */
export function StoreHydrator() {
  useEffect(() => {
    Promise.all([useCatalog.persist.rehydrate(), useSession.persist.rehydrate(), useCart.persist.rehydrate()]).finally(() => {
      useHydration.setState({ hydrated: true });
      document.documentElement.dataset.hydrated = "true";
    });
  }, []);
  return null;
}
