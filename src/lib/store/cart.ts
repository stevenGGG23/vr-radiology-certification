"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/* Shopping cart: a list of course ids. Production hands this list to Stripe Checkout. */
interface CartState {
  ids: string[];
  /** Promo code applied at review, carried to the payment step. */
  promo: string | null;
  open: boolean;
  add: (id: string) => void;
  remove: (id: string) => void;
  setPromo: (code: string | null) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      ids: [],
      promo: null,
      open: false,
      add: (id) => set((s) => ({ ids: s.ids.includes(id) ? s.ids : [...s.ids, id], open: true })),
      remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
      setPromo: (promo) => set({ promo }),
      clear: () => set({ ids: [], promo: null }),
      setOpen: (open) => set({ open }),
    }),
    {
      name: "ria-cart",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({ ids: s.ids, promo: s.promo }),
    },
  ),
);
