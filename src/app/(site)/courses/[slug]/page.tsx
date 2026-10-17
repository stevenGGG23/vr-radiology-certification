import { Suspense } from "react";
import { CourseDetail } from "@/components/course/course-detail";
import { Container, Skeleton } from "@/components/ui/primitives";

export default function CoursePage({ params }: PageProps<"/courses/[slug]">) {
  return (
    <Suspense fallback={<Container className="py-24"><Skeleton className="h-96" /></Container>}>
      {params.then(({ slug }) => (
        <CourseDetail slug={slug} />
      ))}
    </Suspense>
  );
}
