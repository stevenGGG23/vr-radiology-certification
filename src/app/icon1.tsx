import { BRAND, markSvgString } from "@/lib/brand-mark";

/* Browser-tab icon (SVG, sharp at any size). Drawn from the logo in src/lib/brand-mark.tsx. */
export const contentType = "image/svg+xml";

export default function Icon() {
  const svg = markSvgString({ theme: "onDark", background: { color: BRAND.navy, radius: 7, padding: 3 } });
  return new Response(svg, { headers: { "Content-Type": "image/svg+xml" } });
}
