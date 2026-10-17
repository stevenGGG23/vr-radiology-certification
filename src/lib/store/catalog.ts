"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { seedCourses } from "../seed/courses";
import { defaultSettings } from "../seed/demo";
import type { Course, SiteSettings } from "../types";

/*
  Catalog store (courses + site settings). In the draft it persists to
  localStorage so Studio edits show up immediately across the site.
  Backend swap: replace these actions with calls to the courses API and keep
  the same function names.
*/

interface CatalogState {
  courses: Course[];
  settings: SiteSettings;
  saveCourse: (course: Course) => void;
  deleteCourse: (id: string) => void;
  updateSettings: (patch: Partial<SiteSettings>) => void;
  resetCatalog: () => void;
}

export const useCatalog = create<CatalogState>()(
  persist(
    (set) => ({
      courses: seedCourses,
      settings: defaultSettings,
      saveCourse: (course) =>
        set((s) => {
          const stamped = { ...course, updatedAt: new Date().toISOString() };
          const exists = s.courses.some((c) => c.id === course.id);
          return {
            courses: exists
              ? s.courses.map((c) => (c.id === course.id ? stamped : c))
              : [...s.courses, stamped],
          };
        }),
      deleteCourse: (id) =>
        set((s) => ({
          courses: s.courses
            .filter((c) => c.id !== id)
            .map((c) => (c.includes ? { ...c, includes: c.includes.filter((x) => x !== id) } : c)),
        })),
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      resetCatalog: () => set({ courses: seedCourses, settings: defaultSettings }),
    }),
    {
      name: "ria-catalog",
      // Bump when the seed catalog changes shape; older drafts reset to the new seed.
      version: 2,
      migrate: () => ({ courses: seedCourses, settings: defaultSettings }),
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({ courses: s.courses, settings: s.settings }),
    },
  ),
);
