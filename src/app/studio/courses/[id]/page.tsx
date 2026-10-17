import type { Metadata } from "next";
import { Suspense } from "react";
import { CourseEditor } from "@/components/studio/course-editor";

export const metadata: Metadata = { title: "Edit course" };

export default function StudioCourseEditPage({ params }: PageProps<"/studio/courses/[id]">) {
  return <Suspense>{params.then(({ id }) => <CourseEditor key={id} id={id} />)}</Suspense>;
}
