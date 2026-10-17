/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowDown, ArrowLeft, ArrowUp, Check, ChevronDown, CircleCheck, Eye, FileVideo, GripVertical, ImagePlus, Plus, Trash2, Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select, Textarea, Toggle } from "@/components/ui/form";
import { Skeleton, Tag } from "@/components/ui/primitives";
import { CourseCover } from "@/components/course/course-cover";
import { allLessons, totalMinutes } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatMinutes, slugify } from "@/lib/format";
import { categories } from "@/lib/site";
import { useCatalog } from "@/lib/store/catalog";
import { useHydration } from "@/lib/store/session";
import type { CategoryId, Course, CourseStatus, Level } from "@/lib/types";

const coverLibrary = [
  "/images/courses/pocus-foundations.webp", "/images/courses/efast.webp", "/images/courses/cardiac-rush.webp",
  "/images/courses/lung.webp", "/images/courses/vascular-access.webp", "/images/courses/abdominal-vascular.webp",
  "/images/courses/chest-radiograph.webp", "/images/courses/msk-radiograph.webp", "/images/courses/ct-head.webp",
  "/images/courses/vr-lab.webp", "/images/courses/bundle-pocus.webp", "/images/courses/bundle-emergency.webp",
  "/images/photos/scanning-patient.webp", "/images/photos/procedure.webp", "/images/photos/chest-xray.webp",
];

function uid(p: string) {
  return `${p}-${crypto.randomUUID().slice(0, 8)}`;
}

function blankCourse(): Course {
  return {
    id: "",
    slug: "",
    code: "",
    title: "",
    subtitle: "",
    category: "ultrasound",
    level: "Foundational",
    status: "draft",
    featured: false,
    priceCents: 12900,
    ceHours: 0,
    accessDays: 365,
    cover: coverLibrary[0],
    coverLabel: "",
    description: "",
    outcomes: [],
    audience: ["Nurse practitioners", "Physician assistants", "Physicians & residents"],
    modules: [],
    exam: { passingScore: 80, maxAttempts: 2, timeLimitMin: 30, questions: [] },
    updatedAt: "",
  };
}

type Tab = "details" | "curriculum" | "exam";

function StringList({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [v, setV] = useState("");
  return (
    <Field label={label}>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <Input value={it} onChange={(e) => onChange(items.map((x, k) => (k === i ? e.target.value : x)))} />
            <button type="button" onClick={() => onChange(items.filter((_, k) => k !== i))} className="rounded-lg px-2 text-faint hover:text-doppler-red" aria-label="Remove">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Input
          value={v}
          placeholder={placeholder}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && v.trim()) {
              e.preventDefault();
              onChange([...items, v.trim()]);
              setV("");
            }
          }}
        />
        <Button type="button" variant="secondary" onClick={() => { if (v.trim()) { onChange([...items, v.trim()]); setV(""); } }} iconLeft={<Plus className="h-4 w-4" />}>Add</Button>
      </div>
    </Field>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="panel p-5 sm:p-6">
      <h2 className="text-[16px] font-medium text-bone">{title}</h2>
      {description && <p className="mt-1 text-[13px] text-faint">{description}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function MoveButtons({ onUp, onDown, onDelete, upDisabled, downDisabled }: { onUp: () => void; onDown: () => void; onDelete: () => void; upDisabled: boolean; downDisabled: boolean }) {
  const b = "rounded-md p-1.5 text-faint hover:bg-white/[0.05] hover:text-bone disabled:opacity-30";
  return (
    <div className="flex shrink-0 items-center">
      <button type="button" className={b} onClick={onUp} disabled={upDisabled} aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
      <button type="button" className={b} onClick={onDown} disabled={downDisabled} aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
      <button type="button" className={cn(b, "hover:text-doppler-red")} onClick={onDelete} aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}

function move<T>(arr: T[], i: number, d: number) {
  const j = i + d;
  if (j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
}

export function CourseEditor({ id }: { id: string }) {
  const hydrated = useHydration((s) => s.hydrated);
  const courses = useCatalog((s) => s.courses);
  const isNew = id === "new";
  const original = isNew ? null : courses.find((c) => c.id === id);
  if (!hydrated) return <Skeleton className="h-[60vh]" />;
  if (!isNew && !original) {
    return (
      <div className="py-24 text-center">
        <h1 className="font-display text-4xl text-bone">Course not found</h1>
        <ButtonLink href="/studio/courses" className="mt-6">Back to courses</ButtonLink>
      </div>
    );
  }
  return <EditorForm initial={original ? structuredClone(original) : blankCourse()} isNew={isNew} />;
}

function EditorForm({ initial, isNew }: { initial: Course; isNew: boolean }) {
  const router = useRouter();
  const courses = useCatalog((s) => s.courses);
  const saveCourse = useCatalog((s) => s.saveCourse);
  const [draft, setDraft] = useState<Course>(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const [tab, setTab] = useState<Tab>("details");
  const [errors, setErrors] = useState<string[]>([]);
  const [toast, setToast] = useState(false);
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [uploadNote, setUploadNote] = useState(false);

  const dirty = JSON.stringify(draft) !== baseline;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = <K extends keyof Course>(k: K, v: Course[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const mutate = (fn: (c: Course) => void) =>
    setDraft((d) => {
      const n = structuredClone(d);
      fn(n);
      return n;
    });
  const isBundle = draft.category === "bundle";

  const save = () => {
    const errs: string[] = [];
    const slug = draft.slug || slugify(draft.title);
    if (!draft.title.trim()) errs.push("Add a course title.");
    if (!slug) errs.push("Add a URL slug.");
    if (courses.some((c) => c.slug === slug && c.id !== draft.id)) errs.push(`Another course already uses the URL “${slug}”.`);
    if (draft.priceCents < 0) errs.push("Price can't be negative.");
    draft.exam.questions.forEach((q, i) => {
      if (!q.prompt.trim()) errs.push(`Exam question ${i + 1} needs a prompt.`);
      if (q.choices.some((c) => !c.trim())) errs.push(`Exam question ${i + 1} has an empty answer choice.`);
    });
    setErrors(errs);
    if (errs.length) return;
    const final: Course = {
      ...draft,
      id: draft.id || uid("c"),
      slug,
      code: draft.code || `SVR-${slug.slice(0, 3).toUpperCase()}`,
      includes: isBundle ? draft.includes ?? [] : undefined,
    };
    saveCourse(final);
    setDraft(final);
    setBaseline(JSON.stringify(final));
    setToast(true);
    setTimeout(() => setToast(false), 2400);
    if (isNew) router.replace(`/studio/courses/${final.id}`);
  };

  const discard = () => {
    const b = JSON.parse(baseline) as Course;
    setDraft(b);
    setErrors([]);
  };

  return (
    <div className="pb-28">
      <Link href="/studio/courses" className="inline-flex items-center gap-1.5 text-[13px] text-faint hover:text-bone">
        <ArrowLeft className="h-3.5 w-3.5" /> All courses
      </Link>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            {draft.code && <Tag tone="caliper">{draft.code}</Tag>}
            <Tag tone={draft.status === "published" ? "phosphor" : "default"}>{draft.status.replace("-", " ")}</Tag>
          </div>
          <h1 className="mt-3 text-[clamp(1.7rem,3.5vw,2.2rem)] font-bold leading-tight tracking-[-0.02em] text-bone">{draft.title || "Untitled course"}</h1>
        </div>
        {!isNew && draft.slug && (
          <ButtonLink href={`/courses/${draft.slug}`} target="_blank" variant="secondary" size="sm" iconLeft={<Eye className="h-4 w-4" />}>View on site</ButtonLink>
        )}
      </div>

      <div className="mt-8 flex gap-1 border-b border-line" role="tablist">
        {(["details", "curriculum", "exam"] as Tab[])
          .filter((t) => !(isBundle && t !== "details"))
          .map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn("relative px-4 py-3 text-[14px] capitalize transition-colors", tab === t ? "text-bone" : "text-mute hover:text-bone")}
            >
              {t}
              {t === "curriculum" && <span className="ml-2 font-mono text-[11px] text-faint">{allLessons(draft).length}</span>}
              {t === "exam" && <span className="ml-2 font-mono text-[11px] text-faint">{draft.exam.questions.length}</span>}
              {tab === t && <motion.span layoutId="studio-tab" className="absolute inset-x-2 -bottom-px h-0.5 bg-caliper" />}
            </button>
          ))}
      </div>

      {errors.length > 0 && (
        <div className="mt-6 rounded-xl border border-doppler-red/40 bg-doppler-red/[0.05] p-4 text-[13.5px] text-doppler-red">
          <ul className="list-disc space-y-1 pl-5">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}

      {/* ------------------------------------------------------------ details */}
      {tab === "details" && (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <Section title="Basics">
              <Field label="Title" htmlFor="e-title">
                <Input
                  id="e-title"
                  value={draft.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setDraft((d) => ({ ...d, title, slug: isNew && (!d.slug || d.slug === slugify(d.title)) ? slugify(title) : d.slug }));
                  }}
                  placeholder="e.g. Ocular Ultrasound"
                />
              </Field>
              <Field label="Subtitle" htmlFor="e-sub" hint="One sentence shown on course cards.">
                <Input id="e-sub" value={draft.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="URL slug" htmlFor="e-slug" hint={`/courses/${draft.slug || "…"}`}>
                  <Input id="e-slug" value={draft.slug} onChange={(e) => set("slug", slugify(e.target.value))} />
                </Field>
                <Field label="Course code" htmlFor="e-code">
                  <Input id="e-code" value={draft.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="SVR-160" />
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Category" htmlFor="e-cat">
                  <Select id="e-cat" value={draft.category} onChange={(e) => set("category", e.target.value as CategoryId)}>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </Select>
                </Field>
                <Field label="Level" htmlFor="e-level">
                  <Select id="e-level" value={draft.level} onChange={(e) => set("level", e.target.value as Level)}>
                    {["Foundational", "Intermediate", "Advanced"].map((l) => <option key={l}>{l}</option>)}
                  </Select>
                </Field>
                <Field label="Status" htmlFor="e-status">
                  <Select id="e-status" value={draft.status} onChange={(e) => set("status", e.target.value as CourseStatus)}>
                    <option value="draft">Draft (hidden)</option>
                    <option value="published">Published</option>
                    <option value="coming-soon">Coming soon (waitlist)</option>
                  </Select>
                </Field>
              </div>
              <Toggle checked={draft.featured} onChange={(v) => set("featured", v)} label="Feature on the home page" description="Featured courses appear in the home page curriculum grid." />
            </Section>

            <Section title="Description & outcomes">
              <Field label="Description" htmlFor="e-desc">
                <Textarea id="e-desc" value={draft.description} onChange={(e) => set("description", e.target.value)} className="min-h-36" />
              </Field>
              <StringList label="What learners will be able to do" items={draft.outcomes} onChange={(v) => set("outcomes", v)} placeholder="Add an outcome and press Enter" />
              <StringList label="Who it's for" items={draft.audience} onChange={(v) => set("audience", v)} placeholder="e.g. Emergency NPs" />
            </Section>

            {isBundle && (
              <Section title="Included courses" description="Buying the bundle enrolls the learner in each of these.">
                <div className="grid gap-2 sm:grid-cols-2">
                  {courses.filter((c) => !c.includes && c.id !== draft.id).map((c) => {
                    const on = draft.includes?.includes(c.id) ?? false;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => set("includes", on ? (draft.includes ?? []).filter((x) => x !== c.id) : [...(draft.includes ?? []), c.id])}
                        className={cn("flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-[13.5px]", on ? "border-caliper/50 bg-caliper/[0.06] text-bone" : "border-line text-mute hover:text-bone")}
                      >
                        <span className={cn("grid h-4 w-4 place-items-center rounded border", on ? "border-caliper bg-caliper text-ink-950" : "border-line-strong")}>{on && <Check className="h-3 w-3" />}</span>
                        {c.title}
                      </button>
                    );
                  })}
                </div>
              </Section>
            )}
          </div>

          <div className="space-y-6">
            <Section title="Pricing & access">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Price (USD)" htmlFor="e-price">
                  <Input id="e-price" type="number" min={0} step="1" value={draft.priceCents / 100} onChange={(e) => set("priceCents", Math.round(Number(e.target.value) * 100))} />
                </Field>
                <Field label="Compare-at price" htmlFor="e-cmp" hint="Optional strikethrough price.">
                  <Input id="e-cmp" type="number" min={0} value={draft.compareAtCents ? draft.compareAtCents / 100 : ""} onChange={(e) => set("compareAtCents", e.target.value ? Math.round(Number(e.target.value) * 100) : undefined)} />
                </Field>
                <Field label="Contact hours" htmlFor="e-ce">
                  <Input id="e-ce" type="number" min={0} step="0.25" value={draft.ceHours} onChange={(e) => set("ceHours", Number(e.target.value))} />
                </Field>
                <Field label="Access length (days)" htmlFor="e-days">
                  <Input id="e-days" type="number" min={1} value={draft.accessDays} onChange={(e) => set("accessDays", Number(e.target.value))} />
                </Field>
              </div>
            </Section>

            <Section title="Cover image">
              <CourseCover course={draft} catalog={courses} />
              <div className="grid grid-cols-5 gap-2">
                {coverLibrary.map((src) => (
                  <button key={src} type="button" onClick={() => set("cover", src)} className={cn("overflow-hidden rounded-md border-2", draft.cover === src ? "border-caliper" : "border-transparent opacity-70 hover:opacity-100")}>
                    <img src={src} alt="" className="aspect-[3/2] w-full object-cover" />
                  </button>
                ))}
              </div>
              <Field label="Or paste an image URL" htmlFor="e-cover">
                <Input id="e-cover" value={draft.cover.startsWith("data:") ? "(uploaded image)" : draft.cover} onChange={(e) => set("cover", e.target.value)} />
              </Field>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong px-3 py-3 text-[13.5px] text-mute hover:border-bone/30 hover:text-bone">
                <ImagePlus className="h-4 w-4" /> Upload an image
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (f.size > 1.5 * 1024 * 1024) {
                      setErrors(["Images must be under 1.5 MB in the draft (production uploads go to file storage)."]);
                      return;
                    }
                    const r = new FileReader();
                    r.onload = () => set("cover", String(r.result));
                    r.readAsDataURL(f);
                  }}
                />
              </label>
              <Field label="Overlay label" htmlFor="e-clabel" hint="Small text in the image corner, e.g. “C5-2 · RUQ”.">
                <Input id="e-clabel" value={draft.coverLabel} onChange={(e) => set("coverLabel", e.target.value.toUpperCase())} />
              </Field>
            </Section>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- curriculum */}
      {tab === "curriculum" && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13.5px] text-mute">
              {draft.modules.length} modules · {allLessons(draft).length} lessons · {formatMinutes(totalMinutes(draft))}
            </p>
            <Button variant="secondary" size="sm" iconLeft={<Plus className="h-4 w-4" />} onClick={() => mutate((c) => { c.modules.push({ id: uid("m"), title: `Module ${c.modules.length + 1}`, lessons: [] }); })}>
              Add module
            </Button>
          </div>
          {draft.modules.length === 0 && (
            <div className="rounded-2xl border border-dashed border-line-strong p-10 text-center text-mute">No modules yet. Add one to start building the curriculum.</div>
          )}
          {draft.modules.map((m, mi) => (
            <div key={m.id} className="panel p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 shrink-0 text-faint" />
                <span className="font-mono text-[12px] text-faint">{String(mi + 1).padStart(2, "0")}</span>
                <Input value={m.title} onChange={(e) => mutate((c) => { c.modules[mi].title = e.target.value; })} className="h-10 flex-1 font-medium" aria-label="Module title" />
                <MoveButtons
                  upDisabled={mi === 0}
                  downDisabled={mi === draft.modules.length - 1}
                  onUp={() => mutate((c) => move(c.modules, mi, -1))}
                  onDown={() => mutate((c) => move(c.modules, mi, 1))}
                  onDelete={() => mutate((c) => { c.modules.splice(mi, 1); })}
                />
              </div>
              <ul className="mt-4 space-y-2 sm:pl-8">
                {m.lessons.map((l, li) => {
                  const open = openLesson === l.id;
                  return (
                    <li key={l.id} className="rounded-xl border border-line bg-ink-950/50">
                      <div className="flex items-center gap-2 p-2.5">
                        <button type="button" onClick={() => setOpenLesson(open ? null : l.id)} className="rounded-md p-1 text-faint hover:text-bone" aria-label="Expand lesson">
                          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
                        </button>
                        <Input value={l.title} onChange={(e) => mutate((c) => { c.modules[mi].lessons[li].title = e.target.value; })} className="h-9 flex-1 text-[14px]" aria-label="Lesson title" />
                        <div className="hidden items-center gap-1.5 sm:flex">
                          <div className="w-16"><Input type="number" min={1} value={l.durationMin} onChange={(e) => mutate((c) => { c.modules[mi].lessons[li].durationMin = Number(e.target.value); })} className="h-9 px-2 text-center text-[13px]" aria-label="Minutes" /></div>
                          <span className="text-[12px] text-faint">min</span>
                        </div>
                        {l.videoUrl ? <FileVideo className="h-4 w-4 shrink-0 text-phosphor" aria-label="Has video" /> : <FileVideo className="h-4 w-4 shrink-0 text-faint/50" aria-label="No video yet" />}
                        {l.preview && <Tag tone="phosphor" className="hidden md:inline-flex">Free</Tag>}
                        <MoveButtons
                          upDisabled={li === 0}
                          downDisabled={li === m.lessons.length - 1}
                          onUp={() => mutate((c) => move(c.modules[mi].lessons, li, -1))}
                          onDown={() => mutate((c) => move(c.modules[mi].lessons, li, 1))}
                          onDelete={() => mutate((c) => { c.modules[mi].lessons.splice(li, 1); })}
                        />
                      </div>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="space-y-4 border-t border-line p-4">
                              <Field label="Video" hint="Paste an MP4 link, or a YouTube/Vimeo link for testing. Paid lessons should use a secure video host.">
                                <div className="flex flex-col gap-2 sm:flex-row">
                                  <Input value={l.videoUrl} placeholder="https://…" onChange={(e) => mutate((c) => { c.modules[mi].lessons[li].videoUrl = e.target.value.trim(); })} />
                                  <Button type="button" variant="secondary" iconLeft={<Upload className="h-4 w-4" />} onClick={() => setUploadNote(true)}>Upload</Button>
                                </div>
                                {uploadNote && (
                                  <p className="text-[12.5px] text-caliper">
                                    Direct uploads connect to the video host (e.g. Mux or Bunny Stream) in the next build phase. For now, paste a link.
                                  </p>
                                )}
                              </Field>
                              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                                <Field label="Lesson notes" htmlFor={`sum-${l.id}`}>
                                  <Textarea id={`sum-${l.id}`} value={l.summary} onChange={(e) => mutate((c) => { c.modules[mi].lessons[li].summary = e.target.value; })} placeholder="Key points students see under the video" />
                                </Field>
                                <div className="space-y-3 sm:w-56">
                                  <Field label="Minutes" htmlFor={`min-${l.id}`}>
                                    <Input id={`min-${l.id}`} type="number" min={1} value={l.durationMin} onChange={(e) => mutate((c) => { c.modules[mi].lessons[li].durationMin = Number(e.target.value); })} />
                                  </Field>
                                  <Toggle checked={l.preview} onChange={(v) => mutate((c) => { c.modules[mi].lessons[li].preview = v; })} label="Free preview" description="Watchable without buying" />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                onClick={() => {
                  const nid = uid("l");
                  mutate((c) => { c.modules[mi].lessons.push({ id: nid, title: "New lesson", durationMin: 10, videoUrl: "", preview: false, summary: "", resources: [] }); });
                  setOpenLesson(nid);
                }}
                className="mt-3 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] text-mute hover:text-bone sm:ml-8"
              >
                <Plus className="h-4 w-4" /> Add lesson
              </button>
            </div>
          ))}
        </div>
      )}

      {/* --------------------------------------------------------------- exam */}
      {tab === "exam" && (
        <div className="mt-6 space-y-5">
          <Section title="Exam rules">
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Passing score (%)" htmlFor="x-pass">
                <Input id="x-pass" type="number" min={1} max={100} value={draft.exam.passingScore} onChange={(e) => mutate((c) => { c.exam.passingScore = Number(e.target.value); })} />
              </Field>
              <Field label="Attempts allowed" htmlFor="x-att">
                <Input id="x-att" type="number" min={1} max={10} value={draft.exam.maxAttempts} onChange={(e) => mutate((c) => { c.exam.maxAttempts = Number(e.target.value); })} />
              </Field>
              <Field label="Time limit (minutes)" htmlFor="x-time">
                <Input id="x-time" type="number" min={1} value={draft.exam.timeLimitMin} onChange={(e) => mutate((c) => { c.exam.timeLimitMin = Number(e.target.value); })} />
              </Field>
            </div>
          </Section>
          {draft.exam.questions.map((q, qi) => (
            <div key={q.id} className="panel p-5">
              <div className="flex items-start gap-3">
                <span className="mt-2.5 font-mono text-[12px] text-faint">Q{qi + 1}</span>
                <Textarea value={q.prompt} onChange={(e) => mutate((c) => { c.exam.questions[qi].prompt = e.target.value; })} className="min-h-20 flex-1" placeholder="Question prompt" aria-label="Question prompt" />
                <MoveButtons
                  upDisabled={qi === 0}
                  downDisabled={qi === draft.exam.questions.length - 1}
                  onUp={() => mutate((c) => move(c.exam.questions, qi, -1))}
                  onDown={() => mutate((c) => move(c.exam.questions, qi, 1))}
                  onDelete={() => mutate((c) => { c.exam.questions.splice(qi, 1); })}
                />
              </div>
              <div className="mt-4 space-y-2 sm:pl-9">
                <div className="text-[12.5px] text-faint">Answer choices (select the correct one)</div>
                {q.choices.map((ch, ci) => (
                  <div key={ci} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => mutate((c) => { c.exam.questions[qi].answerIndex = ci; })}
                      className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full border font-mono text-[12px]", q.answerIndex === ci ? "border-phosphor bg-phosphor text-ink-950" : "border-line-strong text-faint hover:text-bone")}
                      aria-label={`Mark choice ${String.fromCharCode(65 + ci)} correct`}
                      aria-pressed={q.answerIndex === ci}
                    >
                      {q.answerIndex === ci ? <Check className="h-4 w-4" /> : String.fromCharCode(65 + ci)}
                    </button>
                    <Input value={ch} onChange={(e) => mutate((c) => { c.exam.questions[qi].choices[ci] = e.target.value; })} className="h-10" aria-label={`Choice ${String.fromCharCode(65 + ci)}`} />
                    <button
                      type="button"
                      disabled={q.choices.length <= 2}
                      onClick={() => mutate((c) => {
                        const qq = c.exam.questions[qi];
                        qq.choices.splice(ci, 1);
                        if (qq.answerIndex >= qq.choices.length) qq.answerIndex = 0;
                        else if (qq.answerIndex > ci) qq.answerIndex--;
                      })}
                      className="rounded-md p-1.5 text-faint hover:text-doppler-red disabled:opacity-30"
                      aria-label="Remove choice"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {q.choices.length < 6 && (
                  <button type="button" onClick={() => mutate((c) => { c.exam.questions[qi].choices.push(""); })} className="flex items-center gap-1.5 px-1 py-1 text-[13px] text-mute hover:text-bone">
                    <Plus className="h-4 w-4" /> Add choice
                  </button>
                )}
                <Field label="Explanation (for your records)">
                  <Input value={q.explanation} onChange={(e) => mutate((c) => { c.exam.questions[qi].explanation = e.target.value; })} placeholder="Why the answer is correct" />
                </Field>
              </div>
            </div>
          ))}
          <Button
            variant="secondary"
            iconLeft={<Plus className="h-4 w-4" />}
            onClick={() => mutate((c) => { c.exam.questions.push({ id: uid("q"), prompt: "", choices: ["", "", "", ""], answerIndex: 0, explanation: "" }); })}
          >
            Add question
          </Button>
        </div>
      )}

      {/* ---------------------------------------------------------- save bar */}
      <AnimatePresence>
        {(dirty || isNew) && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-line-strong bg-ink-950/95 backdrop-blur-xl lg:left-60"
          >
            <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3 px-4 py-3 sm:px-8">
              <span className="flex items-center gap-2 text-[13.5px] text-caliper">
                <span className="h-2 w-2 animate-pulse rounded-full bg-caliper" /> {isNew ? "New course, not saved yet" : "Unsaved changes"}
              </span>
              <div className="flex gap-2">
                {!isNew && <Button variant="ghost" onClick={discard}>Discard</Button>}
                <Button onClick={save}>{isNew ? "Create course" : "Save changes"}</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-phosphor/40 bg-ink-900 px-4 py-2 text-[13.5px] text-phosphor shadow-xl">
            <CircleCheck className="h-4 w-4" /> Saved. It&apos;s live on the site.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
