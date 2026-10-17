import type { Metadata } from "next";
import { StudioSettings } from "@/components/studio/settings";

export const metadata: Metadata = { title: "Settings" };

export default function StudioSettingsPage() {
  return <StudioSettings />;
}
