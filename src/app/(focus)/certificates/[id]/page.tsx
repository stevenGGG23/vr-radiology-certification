import type { Metadata } from "next";
import { Suspense } from "react";
import { CertificateView } from "@/components/certificate/certificate-view";

export const metadata: Metadata = { title: "Certificate", robots: { index: false } };

export default function CertificatePage({ params }: PageProps<"/certificates/[id]">) {
  return <Suspense>{params.then(({ id }) => <CertificateView id={decodeURIComponent(id)} />)}</Suspense>;
}
