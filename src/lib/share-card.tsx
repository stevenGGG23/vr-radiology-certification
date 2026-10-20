import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { MarkSvg } from "./brand-mark";

/*
  Link-preview artwork (the picture shown when the site is shared in
  Messages, email, Slack, LinkedIn and so on). Rendered once at build time by
  the opengraph-image routes. Fonts are bundled in /assets/fonts (SIL OFL).
*/

export const shareSize = { width: 1200, height: 630 };

// Read once when the module loads, so the images can be prerendered at build time.
const [medium, bold, extraBold] = await Promise.all([
  readFile(join(process.cwd(), "assets/fonts/PlusJakartaSans-500.ttf")),
  readFile(join(process.cwd(), "assets/fonts/PlusJakartaSans-700.ttf")),
  readFile(join(process.cwd(), "assets/fonts/PlusJakartaSans-800.ttf")),
]);
const brandFonts = [
  { name: "Jakarta", data: medium, weight: 500 as const, style: "normal" as const },
  { name: "Jakarta", data: bold, weight: 700 as const, style: "normal" as const },
  { name: "Jakarta", data: extraBold, weight: 800 as const, style: "normal" as const },
];

export function shareCard({
  label,
  title,
  subtitle,
  domain,
}: {
  /** Second line of the logo lockup, e.g. "Education". */
  label: string;
  title: string;
  subtitle: string;
  domain: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#0b1f3a",
          backgroundImage:
            "radial-gradient(circle at 8% 12%, rgba(26,91,208,0.55), rgba(11,31,58,0) 46%), radial-gradient(circle at 96% 100%, rgba(53,163,222,0.32), rgba(11,31,58,0) 52%)",
          fontFamily: "Jakarta",
          color: "#ffffff",
        }}
      >
        <div style={{ position: "absolute", right: -90, top: -10, display: "flex" }}>
          <div style={{ display: "flex", opacity: 0.08 }}>
            <MarkSvg theme={{ mono: "#ffffff" }} size={660} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", padding: "68px 80px 64px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <MarkSvg theme="onDark" size={86} />
            <div style={{ display: "flex", flexDirection: "column", marginLeft: 22 }}>
              <div style={{ fontSize: 46, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 }}>Sonosus VR</div>
              <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "0.34em", color: "#9fb3cf", marginTop: 10 }}>{label.toUpperCase()}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 780 }}>
            <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.025em" }}>{title}</div>
            <div style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.45, color: "#c4d0e2", marginTop: 22 }}>{subtitle}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 56, height: 4, borderRadius: 2, backgroundColor: "#d6b46a" }} />
            <div style={{ fontSize: 24, fontWeight: 700, color: "#d6b46a", marginLeft: 16, letterSpacing: "0.02em" }}>{domain}</div>
          </div>
        </div>
      </div>
    ),
    { ...shareSize, fonts: brandFonts },
  );
}

/** Square app icon (iPhone home screen, the small icon some previews show, and the PNG tab icon). */
export function appIcon(size: number, { rounded = false }: { rounded?: boolean } = {}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b1f3a",
          backgroundImage: "radial-gradient(circle at 20% 15%, rgba(26,91,208,0.6), rgba(11,31,58,0) 60%)",
          // iPhone icons must be square (iOS rounds them); tab icons get their own corners.
          borderRadius: rounded ? Math.round(size * 0.22) : 0,
        }}
      >
        <MarkSvg theme="onDark" size={Math.round(size * 0.66)} />
      </div>
    ),
    { width: size, height: size },
  );
}
