import type { MetadataRoute } from "next";
import { seedCourses } from "@/lib/seed/courses";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/courses", "/about", "/teams", "/faq", "/contact", "/verify"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}` })),
    ...seedCourses.filter((c) => c.status !== "draft").map((c) => ({ url: `${site.url}/courses/${c.slug}` })),
  ];
}
