import type { Metadata } from "next";
import { StudioShell } from "@/components/studio/studio-shell";

// Studio is rendered client-side behind the admin check, so it isn't expected to navigate instantly.
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Studio", template: "%s · Studio" },
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <StudioShell>{children}</StudioShell>;
}
