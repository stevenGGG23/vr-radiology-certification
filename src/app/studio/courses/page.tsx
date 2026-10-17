import type { Metadata } from "next";
import { StudioCourseList } from "@/components/studio/course-list";

export const metadata: Metadata = { title: "Courses" };

export default function StudioCoursesPage() {
  return <StudioCourseList />;
}
