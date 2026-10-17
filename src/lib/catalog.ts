import type { Course, Lesson } from "./types";

export function allLessons(course: Course): Lesson[] {
  return course.modules.flatMap((m) => m.lessons);
}

export function lessonCount(course: Course, catalog?: Course[]) {
  if (course.includes && catalog) {
    return includedCourses(course, catalog).reduce((n, c) => n + allLessons(c).length, 0);
  }
  return allLessons(course).length;
}

export function totalMinutes(course: Course, catalog?: Course[]): number {
  if (course.includes && catalog) {
    return includedCourses(course, catalog).reduce((n, c) => n + totalMinutes(c), 0);
  }
  return allLessons(course).reduce((n, l) => n + l.durationMin, 0);
}

export function includedCourses(course: Course, catalog: Course[]) {
  return (course.includes ?? [])
    .map((id) => catalog.find((c) => c.id === id))
    .filter((c): c is Course => Boolean(c));
}

export function bundleCompareAt(course: Course, catalog: Course[]) {
  return includedCourses(course, catalog).reduce((n, c) => n + c.priceCents, 0);
}

export function ceHoursFor(course: Course, catalog: Course[]) {
  if (course.includes) return includedCourses(course, catalog).reduce((n, c) => n + c.ceHours, 0);
  return course.ceHours;
}

export function isPurchasable(course: Course) {
  return course.status === "published";
}

export function nextLesson(course: Course, completed: string[]) {
  return allLessons(course).find((l) => !completed.includes(l.id)) ?? allLessons(course)[0];
}

export function progressFor(course: Course, completed: string[]) {
  const lessons = allLessons(course);
  if (!lessons.length) return 0;
  return Math.round((lessons.filter((l) => completed.includes(l.id)).length / lessons.length) * 100);
}
