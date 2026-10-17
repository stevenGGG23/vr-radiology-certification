import type { Metadata } from "next";
import { Checkout } from "@/components/app/checkout";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return <Checkout />;
}
