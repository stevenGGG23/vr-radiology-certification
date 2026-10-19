"use client";

import { Maximize, Minimize } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";

/*
  Lesson video with watch rules for the first viewing:
    - No skipping ahead. Seeking past the furthest point watched snaps back;
      rewinding is always allowed.
    - The lesson completes only when playback reaches the last frame.
  Once the lesson is complete the rules lift so it can be reviewed freely.

  The learner's name floats over the picture (and stays on in fullscreen,
  because fullscreen wraps the whole frame). It can't block screen recording,
  but any recording shows whose account it came from. Download,
  picture-in-picture and casting are turned off.

  These rules work on any HTMLMediaElement, including Mux's <mux-player>, so
  they carry over to a secure video host. On their own they deter casual
  skipping; the server must also confirm watch time (README, "Video security").
*/

const noSubscribe = () => () => {};
const WATERMARK_SPOTS = ["left-[6%] top-[8%]", "right-[6%] top-[22%]", "left-[10%] top-[48%]", "right-[8%] top-[62%]"];

export function ProtectedVideo({
  src,
  title,
  enforce,
  resumeAt = 0,
  watermark,
  onProgress,
  onComplete,
}: {
  src: string;
  title: string;
  /** Apply the watch rules (enrolled and not yet complete). */
  enforce: boolean;
  /** Furthest point already watched, in seconds. */
  resumeAt?: number;
  /** Text to float over the video, e.g. the learner's name and email. */
  watermark?: string;
  onProgress?: (seconds: number) => void;
  onComplete?: () => void;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const furthest = useRef(resumeAt);
  const last = useRef(0);
  const saved = useRef(resumeAt);
  const handlers = useRef({ enforce, onProgress, onComplete });
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [spot, setSpot] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const canFullscreen = useSyncExternalStore(noSubscribe, () => document.fullscreenEnabled === true, () => false);

  useEffect(() => {
    handlers.current = { enforce, onProgress, onComplete };
  }, [enforce, onProgress, onComplete]);

  const save = useCallback(() => {
    if (furthest.current > saved.current) {
      saved.current = furthest.current;
      handlers.current.onProgress?.(furthest.current);
    }
  }, []);

  // Keep what was watched when the learner leaves the lesson.
  useEffect(() => save, [save]);

  useEffect(() => {
    if (!watermark) return;
    const id = setInterval(() => setSpot((s) => (s + 1) % WATERMARK_SPOTS.length), 15000);
    return () => clearInterval(id);
  }, [watermark]);

  useEffect(() => {
    const sync = () => {
      const el = document.fullscreenElement;
      // A browser's own full-screen button enlarges just the video, hiding the
      // watermark; move full screen to the whole frame instead.
      if (el instanceof HTMLVideoElement && frame.current?.contains(el)) {
        void document.exitFullscreen().then(() => frame.current?.requestFullscreen()).catch(() => {});
        return;
      }
      setFullscreen(el === frame.current);
    };
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  useEffect(() => () => clearTimeout(noticeTimer.current), []);

  const flash = (message: string) => {
    setNotice(message);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 3500);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void frame.current?.requestFullscreen();
  };

  const controls = ["nodownload", canFullscreen && "nofullscreen"].filter(Boolean).join(" ");

  return (
    <div ref={frame} className="group absolute inset-0 bg-black">
      <video
        src={src}
        title={title}
        controls
        playsInline
        preload="metadata"
        controlsList={controls}
        disablePictureInPicture
        disableRemotePlayback
        onContextMenu={(e) => e.preventDefault()}
        onDoubleClick={(e) => {
          if (!canFullscreen) return;
          e.preventDefault();
          toggleFullscreen();
        }}
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          if (resumeAt > 2 && resumeAt < v.duration - 2) v.currentTime = resumeAt - 1;
          last.current = v.currentTime;
        }}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          const step = v.currentTime - last.current;
          // Only small forward steps count as watching (at any speed); jumps don't.
          if (step > 0 && step < 1.6 * Math.max(1, v.playbackRate) && !v.seeking) furthest.current = Math.max(furthest.current, v.currentTime);
          last.current = v.currentTime;
          if (furthest.current - saved.current >= 5) save();
        }}
        onSeeking={(e) => {
          const v = e.currentTarget;
          if (handlers.current.enforce && v.currentTime > furthest.current + 1) {
            v.currentTime = furthest.current;
            flash("Skipping ahead unlocks once you've watched this lesson.");
          }
        }}
        onSeeked={(e) => {
          last.current = e.currentTarget.currentTime;
        }}
        onPause={save}
        onEnded={(e) => {
          const v = e.currentTarget;
          save();
          if (!handlers.current.enforce) return;
          if (furthest.current >= v.duration - 1) handlers.current.onComplete?.();
          else flash("Watch the whole lesson to complete it.");
        }}
        className="absolute inset-0 h-full w-full object-contain"
      />

      {watermark && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute z-10 select-none text-[11px] font-medium tracking-wide text-white/40 transition-all duration-1000 [text-shadow:0_1px_2px_rgba(0,0,0,.7)] sm:text-[12.5px]",
            WATERMARK_SPOTS[spot],
          )}
        >
          {watermark}
        </div>
      )}

      {notice && (
        <div role="status" className="absolute left-1/2 top-3 z-20 max-w-[90%] -translate-x-1/2 rounded-full bg-black/80 px-3.5 py-1.5 text-center text-[12.5px] font-medium text-white">
          {notice}
        </div>
      )}

      {canFullscreen && (
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={fullscreen ? "Exit full screen" : "Full screen"}
          className="absolute right-3 top-3 z-20 rounded-md bg-black/55 p-2 text-white opacity-0 transition-opacity hover:bg-black/75 focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-80"
        >
          {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}
