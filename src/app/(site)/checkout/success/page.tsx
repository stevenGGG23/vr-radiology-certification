import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutSuccess } from "@/components/app/checkout";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <CheckoutSuccess />
    </Suspense>
  );
}
