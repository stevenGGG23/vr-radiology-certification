import type { Metadata } from "next";
import { Suspense } from "react";
import { CoursePlayer } from "@/components/learn/course-player";

export const metadata: Metadata = { title: "Lesson", robots: { index: false } };

export default function LearnPage({ params }: PageProps<"/learn/[slug]">) {
  return <Suspense>{params.then(({ slug }) => <CoursePlayer slug={slug} />)}</Suspense>;
}
