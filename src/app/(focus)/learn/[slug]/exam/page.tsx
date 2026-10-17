import type { Metadata } from "next";
import { Suspense } from "react";
import { ExamRunner } from "@/components/learn/exam-runner";

export const metadata: Metadata = { title: "Final exam", robots: { index: false } };

export default function ExamPage({ params }: PageProps<"/learn/[slug]/exam">) {
  return <Suspense>{params.then(({ slug }) => <ExamRunner slug={slug} />)}</Suspense>;
}
