import type { Metadata } from "next";
import { Dashboard } from "@/components/app/dashboard";

export const metadata: Metadata = { title: "My learning", robots: { index: false } };

export default function DashboardPage() {
  return <Dashboard />;
}
