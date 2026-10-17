import Link from "next/link";
import { bundleCompareAt, includedCourses, lessonCount, totalMinutes } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatMinutes, formatPriceUSD } from "@/lib/format";
import { categories } from "@/lib/site";
import type { Course } from "@/lib/types";
import { CourseCover } from "./course-cover";

export function CourseCard({ course, catalog, className }: { course: Course; catalog: Course[]; className?: string }) {
  const isBundle = Boolean(course.includes?.length);
  const compareAt = isBundle ? bundleCompareAt(course, catalog) : course.compareAtCents;
  const cat = categories.find((c) => c.id === course.category);
  return (
    <Link href={`/courses/${course.slug}`} className={cn("group flex h-full flex-col transition-transform duration-500 ease-out hover:-translate-y-1", className)}>
      <CourseCover course={course} catalog={catalog} className="shadow-sm ring-1 ring-black/5" />
      <div className="flex flex-1 flex-col pt-4">
        <div className="text-[11.5px] font-bold uppercase tracking-[0.1em] text-caliper">
          {course.code} · {cat?.short}
        </div>
        <h3 className="mt-1.5 text-[17px] font-semibold leading-snug text-bone transition-colors group-hover:text-caliper">{course.title}</h3>
        <p className="mt-1.5 text-[13px] text-mute">
          {isBundle ? `${includedCourses(course, catalog).length} courses` : `${lessonCount(course)} lessons`} · {formatMinutes(totalMinutes(course, catalog))} · {course.level}
        </p>
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          {course.status === "coming-soon" ? (
            <span className="text-[15px] font-semibold text-mute">Coming soon · join the waitlist</span>
          ) : (
            <>
              <span className="text-[16px] font-bold text-bone">{formatPriceUSD(course.priceCents)}</span>
              {compareAt && compareAt > course.priceCents && (
                <span className="text-[13.5px] text-faint line-through">{formatPriceUSD(compareAt)}</span>
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
