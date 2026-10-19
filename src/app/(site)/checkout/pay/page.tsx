import type { Metadata } from "next";
import { CheckoutPayment } from "@/components/app/checkout";

export const metadata: Metadata = { title: "Payment", robots: { index: false } };

export default function CheckoutPaymentPage() {
  return <CheckoutPayment />;
}
