"use client";

import { Mail } from "lucide-react";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Skeleton, Tag } from "@/components/ui/primitives";
import { emailCatalog, renderEmail } from "@/lib/email/templates";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";
import { useHydration, useSession } from "@/lib/store/session";
import type { EmailTemplate } from "@/lib/types";
import { StudioHeader } from "./studio-shell";

type Selection = { kind: "sent"; id: string } | { kind: "sample"; template: EmailTemplate };

const noSubscribe = () => () => {};
const timeFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export function StudioEmails() {
  const hydrated = useHydration((s) => s.hydrated);
  const emails = useSession((s) => s.db.emails);
  const sent = useMemo(() => [...emails].reverse(), [emails]);
  const origin = useSyncExternalStore(noSubscribe, () => window.location.origin, () => site.url);
  const [picked, setPicked] = useState<Selection | null>(null);
  const [mode, setMode] = useState<"html" | "text">("html");
  const preview = useRef<HTMLElement>(null);
  // On narrow screens the preview sits below the lists, so bring it into view.
  const pick = (s: Selection) => {
    setPicked(s);
    if (window.matchMedia("(max-width: 1279px)").matches) preview.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selection: Selection = picked ?? (sent[0] ? { kind: "sent", id: sent[0].id } : { kind: "sample", template: "welcome" });
  const message = selection.kind === "sent" ? sent.find((m) => m.id === selection.id) : undefined;
  const template = message?.template ?? (selection.kind === "sample" ? selection.template : "welcome");
  const info = emailCatalog.find((t) => t.template === template)!;
  const rendered = useMemo(
    () => renderEmail(message ?? info.sample, { at: message?.at, baseUrl: origin }),
    [message, info, origin],
  );
  // Links in the preview open in a new tab instead of inside the frame.
  const previewHtml = rendered.html.replace("<head>", '<head><base target="_blank">');

  if (!hydrated) return <Skeleton className="h-[60vh]" />;

  return (
    <>
      <StudioHeader
        title="Emails"
        description="Every automatic email the site sends. In this draft they're recorded here instead of being delivered."
      />
      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,360px)_1fr]">
        <div className="space-y-6">
          <section className="panel p-5">
            <h2 className="text-[15px] font-medium text-bone">Templates</h2>
            <ul className="mt-3 space-y-1">
              {emailCatalog.map((t) => {
                const active = selection.kind === "sample" && selection.template === t.template;
                return (
                  <li key={t.template}>
                    <button
                      onClick={() => pick({ kind: "sample", template: t.template })}
                      className={cn("w-full rounded-lg px-3 py-2.5 text-left transition-colors", active ? "bg-caliper/10" : "hover:bg-white/[0.04]")}
                    >
                      <div className={cn("text-[14px] font-medium", active ? "text-caliper" : "text-bone")}>{t.label}</div>
                      <div className="mt-0.5 text-[12.5px] leading-snug text-mute">{t.trigger}</div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="panel p-5">
            <h2 className="flex items-center justify-between text-[15px] font-medium text-bone">
              Recorded in this browser <span className="font-mono text-[12px] text-faint">{sent.length}</span>
            </h2>
            {sent.length === 0 ? (
              <p className="mt-3 text-[13.5px] leading-relaxed text-mute">
                Nothing yet. Create an account, buy a course or pass an exam, and the emails it would send appear here.
              </p>
            ) : (
              <ul className="no-scrollbar mt-3 max-h-[420px] space-y-1 overflow-y-auto">
                {sent.map((m) => {
                  const active = selection.kind === "sent" && selection.id === m.id;
                  return (
                    <li key={m.id}>
                      <button
                        onClick={() => pick({ kind: "sent", id: m.id })}
                        className={cn("flex w-full gap-3 rounded-lg px-3 py-2.5 text-left transition-colors", active ? "bg-caliper/10" : "hover:bg-white/[0.04]")}
                      >
                        <Mail className={cn("mt-0.5 h-4 w-4 shrink-0", active ? "text-caliper" : "text-faint")} />
                        <span className="min-w-0">
                          <span className="block truncate text-[13.5px] text-bone">{renderEmail(m, { at: m.at }).subject}</span>
                          <span className="block truncate text-[12px] text-faint">{m.to} · {timeFormat.format(new Date(m.at))}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <section ref={preview} className="panel min-w-0 scroll-mt-20 overflow-hidden">
          <div className="space-y-2 border-b border-line p-5 text-[13.5px]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[16px] font-semibold text-bone">{rendered.subject}</div>
                <div className="mt-1 text-mute">
                  To {message ? message.to : "a sample learner"}
                  {message && <> · {timeFormat.format(new Date(message.at))}</>}
                </div>
              </div>
              <div className="flex rounded-lg border border-line-strong p-0.5 text-[12.5px]" role="tablist" aria-label="Format">
                {(["html", "text"] as const).map((m) => (
                  <button
                    key={m}
                    role="tab"
                    aria-selected={mode === m}
                    onClick={() => setMode(m)}
                    className={cn("rounded-md px-3 py-1", mode === m ? "bg-white/[0.08] text-bone" : "text-mute hover:text-bone")}
                  >
                    {m === "html" ? "Email" : "Plain text"}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-faint">Preview text: {rendered.preheader}</div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {!message && <Tag>Sample</Tag>}
              <Tag tone="blue">At launch: {info.production}</Tag>
            </div>
          </div>
          {mode === "html" ? (
            <iframe title="Email preview" sandbox="allow-popups allow-popups-to-escape-sandbox" srcDoc={previewHtml} className="block h-[680px] w-full bg-[#f5f7fa]" />
          ) : (
            <pre className="max-h-[680px] overflow-auto whitespace-pre-wrap p-5 font-mono text-[12.5px] leading-relaxed text-bone-dim">{rendered.text}</pre>
          )}
        </section>
      </div>
    </>
  );
}
