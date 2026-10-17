"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/*
  WebGL "space" backdrop: navy ground, slow-moving nebula and drifting stars.
  With `scanner`, it also plays real bedside ultrasound clips inside an
  ultrasound sector; every few seconds a sweep line rescans the sector and
  reveals the next clip.

  Clips: Gillman & Kirkpatrick, Scand J Trauma Resusc Emerg Med 2012,
  CC BY 2.0 via Wikimedia Commons (credited on /legal/image-credits).
  `crop` is the image area of each 640x480 frame (u0, v0, u1, v1), which keeps
  the scanner's on-screen text out of the sector.
*/

const CLIPS = [
  { src: "/videos/lung-point.mp4", label: "Lung point · pneumothorax", crop: [0.297, 0.104, 0.773, 0.74] },
  { src: "/videos/pleural-fluid.mp4", label: "Pleural effusion", crop: [0.352, 0.094, 0.898, 0.823] },
  { src: "/videos/comet-tails.mp4", label: "Comet-tail artifacts", crop: [0.297, 0.125, 0.773, 0.76] },
] as const;

// Sector geometry in a 1000 x 1000 box.
const S = 1000;
const APEX = [500, -150] as const;
const R0 = 200;
const R1 = 1120;
const HALF = 0.44;
const SWEEP_MS = 2400;
const HOLD_MS = 6500;

const VERT = `attribute vec2 aPos; void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform vec4 uRect;
uniform float uTime;
uniform float uSweep;
uniform float uSweepOn;
uniform float uReadyA;
uniform float uReadyB;
uniform vec2 uMouse;
uniform vec4 uCropA;
uniform vec4 uCropB;
uniform float uBg;
uniform sampler2D uA;
uniform sampler2D uB;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return v;
}
float stars(vec2 p, float scale, float density) {
  vec2 g = floor(p * scale);
  vec2 f = fract(p * scale);
  float h = hash(g);
  if (h > density) return 0.0;
  vec2 c = vec2(hash(g + 1.7), hash(g + 9.2)) * 0.8 + 0.1;
  float size = mix(0.04, 0.11, hash(g + 4.4));
  float tw = 0.6 + 0.4 * sin(uTime * (0.6 + 2.0 * hash(g + 2.0)) + h * 60.0);
  return smoothstep(size, 0.0, length(f - c)) * tw;
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 p = frag / uRes.y;

  vec3 col = mix(vec3(0.051, 0.133, 0.243), vec3(0.027, 0.075, 0.149), clamp(frag.y / uRes.y, 0.0, 1.0));
  vec2 drift = vec2(uTime * 0.008, -uTime * 0.004);
  col += vec3(0.09, 0.20, 0.38) * pow(fbm(p * 1.3 + drift), 3.0) * 1.1;
  col += vec3(0.32, 0.25, 0.10) * pow(fbm(p * 2.4 + 11.0 - drift), 5.0) * 0.55;
  vec2 par = uMouse * 0.012;
  float s = stars(p + par * 0.4 + drift * 0.6, 110.0, 0.08) * 0.5
          + stars(p + par + 3.1 + drift, 55.0, 0.05) * 0.8
          + stars(p + par * 1.8 + 7.7 + drift * 1.4, 24.0, 0.03) * 1.0;
  col += vec3(0.80, 0.88, 1.0) * s;
  float alpha = uBg;
  col *= uBg;

  if (uRect.z > 1.0) {
    vec2 t = (frag - uRect.xy) / uRect.zw;
    vec2 d = t * ${S.toFixed(1)} - vec2(${APEX[0].toFixed(1)}, ${APEX[1].toFixed(1)});
    float r = length(d);
    float th = atan(d.x, d.y);
    float edge = min(min(r - ${R0.toFixed(1)}, ${R1.toFixed(1)} - r), (${HALF} - abs(th)) * r) * (uRect.z / ${S.toFixed(1)});
    float mask = clamp(edge, 0.0, 1.0);
    if (mask > 0.0) {
      float a = texture2D(uA, mix(uCropA.xy, uCropA.zw, t)).r * uReadyA;
      float b = texture2D(uB, mix(uCropB.xy, uCropB.zw, t)).r * uReadyB;
      float v = (uSweepOn > 0.5 && th < uSweep) ? b : a;
      if (uSweepOn > 0.5) {
        float dt = uSweep - th;
        v += 0.45 * exp(-abs(dt) * 90.0);
        v += 0.08 * exp(-max(dt, 0.0) * 9.0) * step(0.0, dt);
      }
      v = clamp(v * 1.08, 0.0, 1.0);
      vec3 us = mix(vec3(0.015, 0.03, 0.055), vec3(1.0, 0.99, 0.97), v);
      col = mix(col, us, mask);
      alpha = max(alpha, mask);
    }
    float rim = clamp(1.0 - abs(edge) / 14.0, 0.0, 1.0) * step(edge, 0.0) * uBg;
    col += vec3(0.25, 0.55, 0.95) * rim * 0.12;
  }
  // Premultiplied output so the transparent variant composites cleanly.
  gl_FragColor = vec4(col * (uBg > 0.5 ? 1.0 : alpha), alpha);
}
`;

interface Rect { x: number; y: number; w: number; h: number }

/** Where the sector sits inside the canvas: centered and as large as fits. */
function layout(w: number, h: number, cutout: boolean): Rect {
  if (cutout) {
    // The sector spans about 95% of its box's width and 3–97% of its height.
    const size = Math.min(w / 0.96, h / 0.98);
    return { x: (w - size) / 2, y: (h - size) / 2 - size * 0.01, w: size, h: size };
  }
  const size = Math.min(h * 1.02, w * 0.92);
  return { x: (w - size) / 2, y: (h - size) / 2 + size * 0.02, w: size, h: size };
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
}

function makeTexture(gl: WebGLRenderingContext) {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0]));
  return tex;
}

export function SpaceCanvas({
  className,
  scanner = false,
  cutout = false,
}: {
  className?: string;
  scanner?: boolean;
  /** Scanner only, with no space background (transparent around the sector). */
  cutout?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const [rect, setRect] = useState<Rect | null>(null);
  const [clip, setClip] = useState(0);
  const [fallback, setFallback] = useState(false);
  const [caliper, setCaliper] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: "high-performance" });
    const vs = gl && compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = gl && compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!gl || !vs || !fs) {
      setFallback(true);
      return;
    }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const U = {
      res: u("uRes"), rect: u("uRect"), time: u("uTime"), sweep: u("uSweep"), sweepOn: u("uSweepOn"),
      readyA: u("uReadyA"), readyB: u("uReadyB"), mouse: u("uMouse"), cropA: u("uCropA"), cropB: u("uCropB"),
      bg: u("uBg"),
    };
    gl.uniform1i(u("uA"), 0);
    gl.uniform1i(u("uB"), 1);

    const videos = scanner
      ? CLIPS.map((c) => {
          const v = document.createElement("video");
          v.src = c.src;
          v.muted = true;
          v.loop = true;
          v.playsInline = true;
          v.preload = "auto";
          v.setAttribute("playsinline", "");
          return v;
        })
      : [];
    const textures = videos.map(() => makeTexture(gl));
    const upload = (k: number) => {
      const v = videos[k];
      if (!v || v.readyState < 2) return false;
      gl.bindTexture(gl.TEXTURE_2D, textures[k]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, v);
      return true;
    };

    let dpr = 1;
    let css: Rect = { x: 0, y: 0, w: 0, h: 0 };
    const resize = () => {
      const b = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, b.width < 700 ? 1.5 : 1.75);
      canvas.width = Math.max(1, Math.floor(b.width * dpr));
      canvas.height = Math.max(1, Math.floor(b.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (scanner) {
        css = layout(b.width, b.height, cutout);
        setRect(css);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      const b = wrap.getBoundingClientRect();
      mouse.tx = ((e.clientX - b.left) / b.width) * 2 - 1;
      mouse.ty = ((e.clientY - b.top) / b.height) * 2 - 1;
      if (!scanner) return;
      const x = ((e.clientX - b.left - css.x) / css.w) * S;
      const y = ((e.clientY - b.top - css.y) / css.h) * S;
      const r = Math.hypot(x - APEX[0], y - APEX[1]);
      const th = Math.atan2(x - APEX[0], y - APEX[1]);
      setCaliper(r > R0 && r < R1 && Math.abs(th) < HALF ? { x, y } : null);
    };
    const onLeave = () => setCaliper(null);
    const target = wrap.parentElement ?? wrap;
    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerleave", onLeave);

    let visible = true;
    let current = 0;
    let next = 1 % CLIPS.length;
    const syncPlayback = () => {
      videos.forEach((v, k) => {
        if (visible && !reduce && (k === current || k === next)) v.play().catch(() => {});
        else v.pause();
      });
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      syncPlayback();
    });
    io.observe(wrap);
    syncPlayback();

    let sweepStart = -1;
    let nextSweepAt = HOLD_MS;
    let readyA = 0;
    let readyB = 0;
    const t0 = performance.now();
    let raf = 0;
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible || document.hidden) return;
      const t = now - t0;
      let sweepOn = 0;
      let sweep = 0;
      if (scanner) {
        if (upload(current)) readyA = Math.min(1, readyA + 0.04);
        if (!reduce) {
          if (sweepStart < 0 && t >= nextSweepAt && videos[next].readyState >= 2) sweepStart = t;
          if (sweepStart >= 0) {
            if (upload(next)) readyB = 1;
            const k = Math.min(1, (t - sweepStart) / SWEEP_MS);
            const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
            sweep = -HALF - 0.06 + e * (2 * HALF + 0.12);
            sweepOn = 1;
            if (k >= 1) {
              current = next;
              next = (current + 1) % CLIPS.length;
              readyA = 1;
              readyB = 0;
              sweepStart = -1;
              nextSweepAt = t + HOLD_MS;
              sweepOn = 0;
              setClip(current);
              syncPlayback();
            }
          }
        }
      }
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      const ca = CLIPS[current].crop;
      const cb = CLIPS[next].crop;
      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform4f(U.rect, css.x * dpr, css.y * dpr, css.w * dpr, css.h * dpr);
      gl.uniform1f(U.time, reduce ? 0 : t / 1000);
      gl.uniform1f(U.sweep, sweep);
      gl.uniform1f(U.sweepOn, sweepOn);
      gl.uniform1f(U.readyA, readyA);
      gl.uniform1f(U.readyB, readyB);
      gl.uniform2f(U.mouse, mouse.x, mouse.y);
      gl.uniform4f(U.cropA, ca[0], ca[1], ca[2], ca[3]);
      gl.uniform4f(U.cropB, cb[0], cb[1], cb[2], cb[3]);
      gl.uniform1f(U.bg, cutout ? 0 : 1);
      if (scanner) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures[current]);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, textures[next]);
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerleave", onLeave);
      videos.forEach((v) => {
        v.pause();
        v.removeAttribute("src");
        v.load();
      });
      textures.forEach((tx) => gl.deleteTexture(tx));
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, [reduce, scanner, cutout]);

  return (
    <div ref={wrapRef} className={cn(!cutout && "overflow-hidden bg-[#0b1f3a]", className)} aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {scanner && fallback && (
        <video src={CLIPS[0].src} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-contain" />
      )}
      {scanner && rect && <SectorOverlay rect={rect} caliper={caliper} cutout={cutout} />}
      {scanner && !cutout && (
        <span className="absolute left-3 top-3 whitespace-nowrap rounded-full bg-[#071528]/75 px-3 py-1 text-[12px] font-medium text-[#c9d3e1] backdrop-blur">
          Real bedside ultrasound · {CLIPS[clip].label}
        </span>
      )}
      {scanner && cutout && (
        <span className="absolute inset-x-0 -bottom-8 text-center text-[13px] font-medium text-mute">
          Real bedside ultrasound · {CLIPS[clip].label}
        </span>
      )}
    </div>
  );
}

function SectorOverlay({ rect, caliper, cutout }: { rect: Rect; caliper: { x: number; y: number } | null; cutout: boolean }) {
  // Depth ticks just outside the right edge of the sector, perpendicular to it.
  const ticks = Array.from({ length: 11 }, (_, k) => {
    const r = R0 + 30 + (k / 10) * (R1 - R0 - 90);
    const nx = Math.cos(HALF);
    const ny = -Math.sin(HALF);
    const x = APEX[0] + r * Math.sin(HALF) + 10 * nx;
    const y = APEX[1] + r * Math.cos(HALF) + 10 * ny;
    const len = k % 5 === 0 ? 24 : 13;
    return { k, x, y, x2: x + len * nx, y2: y + len * ny };
  });
  const dot = { x: APEX[0] - (R0 + 10) * Math.sin(HALF) - 20, y: APEX[1] + (R0 + 10) * Math.cos(HALF) - 14 };
  return (
    <svg
      viewBox={`0 0 ${S} ${S}`}
      className="pointer-events-none absolute overflow-visible"
      style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
    >
      <g stroke={cutout ? "rgba(26,91,208,0.45)" : "rgba(124,184,255,0.55)"} strokeWidth={2.5}>
        {ticks.map((t) => <line key={t.k} x1={t.x} y1={t.y} x2={t.x2} y2={t.y2} />)}
      </g>
      <circle cx={dot.x} cy={dot.y} r={10} fill="#5fd6c3" />
      {caliper && (
        <g stroke="#e9cf94" strokeWidth={3}>
          <line x1={caliper.x - 22} y1={caliper.y} x2={caliper.x - 7} y2={caliper.y} />
          <line x1={caliper.x + 7} y1={caliper.y} x2={caliper.x + 22} y2={caliper.y} />
          <line x1={caliper.x} y1={caliper.y - 22} x2={caliper.x} y2={caliper.y - 7} />
          <line x1={caliper.x} y1={caliper.y + 7} x2={caliper.x} y2={caliper.y + 22} />
        </g>
      )}
    </svg>
  );
}
