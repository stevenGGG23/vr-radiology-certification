"use client";

import { AnimatePresence, motion } from "motion/react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { categories } from "@/lib/site";
import { useCatalog } from "@/lib/store/catalog";
import type { Course, Level } from "@/lib/types";
import { CourseCard } from "./course-card";

const levels: Level[] = ["Foundational", "Intermediate", "Advanced"];
const prices = [
  { id: "u100", label: "Under $100", test: (c: Course) => c.priceCents < 10000 },
  { id: "100-150", label: "$100 – $150", test: (c: Course) => c.priceCents >= 10000 && c.priceCents <= 15000 },
  { id: "o150", label: "Over $150", test: (c: Course) => c.priceCents > 15000 },
];
const sorts = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price, low to high" },
  { id: "price-desc", label: "Price, high to low" },
  { id: "ce", label: "Most contact hours" },
  { id: "az", label: "Alphabetically, A–Z" },
] as const;

function Check({ checked, onChange, label, count }: { checked: boolean; onChange: () => void; label: string; count?: number }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1.5 text-[14.5px] text-bone-dim hover:text-bone">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded border-line-strong accent-[#1a5bd0]" />
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-[12.5px] text-faint">({count})</span>}
    </label>
  );
}

function toggle<T>(set: Set<T>, v: T) {
  const n = new Set(set);
  if (n.has(v)) n.delete(v);
  else n.add(v);
  return n;
}

export function CatalogView() {
  const params = useSearchParams();
  const courses = useCatalog((s) => s.courses);
  const paramCat = params.get("c");
  const [prevParam, setPrevParam] = useState(paramCat);
  const [cats, setCats] = useState<Set<string>>(new Set(paramCat ? [paramCat] : []));
  if (paramCat !== prevParam) {
    setPrevParam(paramCat);
    setCats(new Set(paramCat ? [paramCat] : []));
  }
  const [lv, setLv] = useState<Set<Level>>(new Set());
  const [pr, setPr] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<(typeof sorts)[number]["id"]>("featured");
  const [drawer, setDrawer] = useState(false);

  const live = useMemo(() => courses.filter((c) => c.status !== "draft"), [courses]);
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = live
      .filter((c) => !cats.size || cats.has(c.category))
      .filter((c) => !lv.size || lv.has(c.level))
      .filter((c) => !pr.size || prices.some((p) => pr.has(p.id) && p.test(c)))
      .filter(
        (c) =>
          !q ||
          [c.title, c.subtitle, c.code, ...c.modules.flatMap((m) => m.lessons.map((l) => l.title))].join(" ").toLowerCase().includes(q),
      );
    const s = [...out];
    if (sort === "price-asc") s.sort((a, b) => a.priceCents - b.priceCents);
    if (sort === "price-desc") s.sort((a, b) => b.priceCents - a.priceCents);
    if (sort === "ce") s.sort((a, b) => b.ceHours - a.ceHours);
    if (sort === "az") s.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "featured") s.sort((a, b) => Number(b.featured) - Number(a.featured) || a.code.localeCompare(b.code));
    return s;
  }, [live, cats, lv, pr, query, sort]);

  const active = cats.size + lv.size + pr.size + (query ? 1 : 0);
  const clear = () => {
    setCats(new Set());
    setLv(new Set());
    setPr(new Set());
    setQuery("");
  };

  const filters = (
    <div className="space-y-7">
      <div>
        <div className="text-[13px] font-bold uppercase tracking-[0.08em] text-bone">Specialty</div>
        <div className="mt-2">
          {categories.map((c) => (
            <Check key={c.id} label={c.label} checked={cats.has(c.id)} onChange={() => setCats(toggle(cats, c.id))} count={live.filter((x) => x.category === c.id).length} />
          ))}
        </div>
      </div>
      <div className="border-t border-line pt-6">
        <div className="text-[13px] font-bold uppercase tracking-[0.08em] text-bone">Level</div>
        <div className="mt-2">
          {levels.map((l) => (
            <Check key={l} label={l} checked={lv.has(l)} onChange={() => setLv(toggle(lv, l))} count={live.filter((x) => x.level === l).length} />
          ))}
        </div>
      </div>
      <div className="border-t border-line pt-6">
        <div className="text-[13px] font-bold uppercase tracking-[0.08em] text-bone">Price</div>
        <div className="mt-2">
          {prices.map((p) => (
            <Check key={p.id} label={p.label} checked={pr.has(p.id)} onChange={() => setPr(toggle(pr, p.id))} count={live.filter(p.test).length} />
          ))}
        </div>
      </div>
      {active > 0 && (
        <button onClick={clear} className="text-[14px] font-semibold text-caliper hover:underline">Clear all filters</button>
      )}
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-24">{filters}</div>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses and lessons"
              aria-label="Search courses"
              className="h-11 w-full rounded-md border border-line-strong bg-white pl-10 pr-9 text-[15px] text-bone placeholder:text-faint focus:border-caliper focus:outline-none focus:ring-4 focus:ring-caliper/15"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-bone">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setDrawer(true)} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-line-strong px-4 text-[14px] font-semibold text-bone lg:hidden">
              <SlidersHorizontal className="h-4 w-4" /> Filters{active ? ` (${active})` : ""}
            </button>
            <label className="flex flex-1 items-center gap-2 text-[14px] text-mute sm:flex-none">
              <span className="hidden sm:inline">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                aria-label="Sort courses"
                className="select-chevron h-11 w-full appearance-none rounded-md border border-line-strong bg-white pl-3 pr-9 text-[14px] text-bone focus:outline-none sm:w-auto"
              >
                {sorts.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
          </div>
        </div>
        <p className="mt-4 text-[14px] text-mute">{list.length} {list.length === 1 ? "product" : "products"}</p>

        <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => (
            <motion.div key={c.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <CourseCard course={c} catalog={courses} />
            </motion.div>
          ))}
        </div>
        {list.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-line-strong p-10 text-center">
            <p className="text-[18px] font-semibold text-bone">No courses match these filters.</p>
            <button onClick={clear} className="mt-3 text-[14.5px] font-semibold text-caliper hover:underline">Clear all filters</button>
          </div>
        )}
        <p className="mt-12 text-[12.5px] text-faint">Contact hours are estimates pending accreditation.</p>
      </div>

      <AnimatePresence>
        {drawer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-[#071528]/50 lg:hidden" onClick={() => setDrawer(false)} />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="fixed inset-y-0 left-0 z-[81] flex w-[min(88vw,340px)] flex-col bg-white lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <span className="text-[17px] font-bold text-bone">Filters</span>
                <button onClick={() => setDrawer(false)} aria-label="Close filters" className="text-faint hover:text-bone"><X className="h-5 w-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">{filters}</div>
              <div className="border-t border-line p-4">
                <button onClick={() => setDrawer(false)} className={cn("h-12 w-full rounded-lg bg-[#1a5bd0] text-[15px] font-semibold text-white")}>
                  Show {list.length} results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
