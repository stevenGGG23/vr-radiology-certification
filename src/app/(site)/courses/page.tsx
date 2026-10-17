import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CatalogView } from "@/components/course/catalog-view";
import { Container, Skeleton } from "@/components/ui/primitives";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Online courses",
  description: "Point-of-care ultrasound, procedural guidance, radiograph and CT interpretation courses with exams and certificates.",
};

export default function CoursesPage() {
  return (
    <>
      <section className="border-b border-line bg-ink-950">
        <Container className="py-10 sm:py-12">
          <nav className="text-[13px] text-faint" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-bone">Home</Link> <span className="mx-1.5">/</span> <span className="text-bone-dim">Courses</span>
          </nav>
          <h1 className="mt-3 text-[clamp(1.9rem,4vw,2.6rem)] font-bold tracking-[-0.02em] text-bone">Online courses</h1>
          <p className="mt-2 max-w-2xl text-[16px] text-mute">
            Self-paced video courses with a final exam and certificate. {site.provenance.short}.
          </p>
        </Container>
      </section>
      <Container className="py-10">
        <Suspense
          fallback={
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-[340px]" />)}
            </div>
          }
        >
          <CatalogView />
        </Suspense>
      </Container>
    </>
  );
}
