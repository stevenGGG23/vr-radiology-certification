/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Lock, PlayCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import type { Course, Lesson } from "@/lib/types";

function embedUrl(url: string) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0&modestbranding=1`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?dnt=1`;
  return null;
}

/**
 * Lesson video. Accepts a direct MP4 URL, or a YouTube/Vimeo link for quick
 * testing. Paid content should use a host with signed, expiring playback URLs
 * (Mux, Bunny Stream, Cloudflare Stream) so a copied link stops working.
 */
export function VideoPlayer({
  course,
  lesson,
  locked,
  onEnded,
  isAdmin = false,
}: {
  course: Course;
  lesson: Lesson;
  locked: boolean;
  onEnded?: () => void;
  isAdmin?: boolean;
}) {
  const frame = "on-dark relative aspect-video w-full overflow-hidden rounded-xl bg-[#0b1f3a]";

  if (locked) {
    return (
      <div className={frame}>
        <img src={course.cover} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-md" />
        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white/10">
            <Lock className="h-5 w-5 text-white" />
          </span>
          <h3 className="mt-4 text-[clamp(1.2rem,2.4vw,1.6rem)] font-bold text-white">Enroll to watch this lesson</h3>
          <p className="mt-1.5 max-w-md text-[14.5px] text-bone-dim">Includes every lesson, the final exam and your certificate.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <ButtonLink href={`/checkout/${course.slug}`}>Enroll for {formatPrice(course.priceCents)}</ButtonLink>
            <ButtonLink href={`/courses/${course.slug}`} variant="secondary">Course details</ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  if (lesson.videoUrl) {
    const embed = embedUrl(lesson.videoUrl);
    return (
      <div className={frame}>
        {embed ? (
          <iframe src={embed} title={lesson.title} className="absolute inset-0 h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
        ) : (
          <video
            key={lesson.id}
            src={lesson.videoUrl}
            controls
            playsInline
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            onEnded={onEnded}
            className="absolute inset-0 h-full w-full bg-black object-contain"
          />
        )}
      </div>
    );
  }

  return (
    <div className={frame}>
      <img src={course.cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <PlayCircle className="h-12 w-12 text-white/85" strokeWidth={1.3} />
        <p className="mt-3 text-[16px] font-semibold text-white">Video coming soon</p>
        {isAdmin ? (
          <p className="mt-1 text-[13px] text-bone-dim">
            Add it in <Link href={`/studio/courses/${course.id}`} className="underline underline-offset-4">Studio → Curriculum</Link>
          </p>
        ) : (
          <p className="mt-1 text-[13px] text-bone-dim">This lesson&apos;s video is being uploaded.</p>
        )}
      </div>
    </div>
  );
}
