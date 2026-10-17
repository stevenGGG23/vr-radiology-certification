"use client";

import Link from "next/link";
import { ArrowLeft, Check, Link2, Printer } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/ui/brand";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container, Skeleton } from "@/components/ui/primitives";
import { site } from "@/lib/site";
import { useCatalog } from "@/lib/store/catalog";
import { useHydration, useSession } from "@/lib/store/session";
import { Certificate } from "./certificate";

export function CertificateView({ id }: { id: string }) {
  const hydrated = useHydration((s) => s.hydrated);
  const cert = useSession((s) => s.db.certificates.find((c) => c.id === id));
  const statement = useCatalog((s) => s.settings.accreditationStatement);
  const [copied, setCopied] = useState(false);

  if (!hydrated) return <Container className="py-24"><Skeleton className="aspect-[1.414/1]" /></Container>;
  if (!cert) {
    return (
      <Container className="py-32 text-center">
        <p className="text-[14px] font-semibold text-doppler-red">Not found</p>
        <h1 className="mt-4 font-display text-4xl text-bone">No certificate with that ID.</h1>
        <ButtonLink href="/verify" className="mt-8">Go to verification</ButtonLink>
      </Container>
    );
  }

  return (
    <div className="min-h-[100svh]">
      <header className="no-print sticky top-0 z-30 border-b border-line bg-void/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1240px] items-center gap-3 px-4 sm:px-8">
          <Logo compact />
          <Link href="/dashboard" className="ml-2 hidden items-center gap-1.5 text-[13.5px] text-mute hover:text-bone sm:flex">
            <ArrowLeft className="h-3.5 w-3.5" /> My learning
          </Link>
          <div className="ml-auto flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              iconLeft={copied ? <Check className="h-3.5 w-3.5 text-phosphor" /> : <Link2 className="h-3.5 w-3.5" />}
              onClick={() => {
                navigator.clipboard?.writeText(`${window.location.origin}/verify?id=${cert.id}`).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                });
              }}
            >
              {copied ? "Copied" : "Copy verification link"}
            </Button>
            <Button size="sm" iconLeft={<Printer className="h-3.5 w-3.5" />} onClick={() => window.print()}>
              Print / Save PDF
            </Button>
          </div>
        </div>
      </header>
      <Container className="max-w-5xl py-10 sm:py-16 print:max-w-none print:p-0">
        <Certificate data={cert} accreditation={`${statement.split(".")[0]}.`} className="print:w-full" />
        <p className="no-print mt-6 text-center text-[13px] text-faint">
          Anyone can verify this certificate at {site.domain}/verify with ID <span className="font-mono text-bone-dim">{cert.id}</span>.
        </p>
      </Container>
    </div>
  );
}
