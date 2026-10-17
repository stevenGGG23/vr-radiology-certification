import type { Metadata } from "next";
import { StudioStudents } from "@/components/studio/students";

export const metadata: Metadata = { title: "Students" };

export default function StudioStudentsPage() {
  return <StudioStudents />;
}
