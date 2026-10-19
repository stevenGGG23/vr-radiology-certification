import type { Metadata } from "next";
import { StudioEmails } from "@/components/studio/emails";

export const metadata: Metadata = { title: "Emails" };

export default function StudioEmailsPage() {
  return <StudioEmails />;
}
