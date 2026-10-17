import type { Metadata } from "next";
import { Suspense } from "react";
import { BuyNow } from "@/components/app/checkout";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function BuyNowPage({ params }: PageProps<"/checkout/[slug]">) {
  return <Suspense>{params.then(({ slug }) => <BuyNow slug={slug} />)}</Suspense>;
}
