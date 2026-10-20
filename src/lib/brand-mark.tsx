/*
  THE LOGO MARK, defined once.

  Everything that shows the logo draws it from MARK below: the site header and
  footer, Studio, sign-in pages, lesson and exam headers, the certificate
  (header and seal), the browser-tab icons, the iPhone icon and the
  link-preview cards. To change the logo everywhere, replace MARK with the
  shapes from the new SVG (keep or update the viewBox) and rebuild.

  Colour roles:
    ink     the main colour. Follows the surrounding text on the site (white on
            navy, navy on light pages); fixed colours elsewhere.
    accent  brand blue
    gold    brand gold
*/

export type Paint = "ink" | "accent" | "gold";

type Style = {
  fill?: Paint;
  stroke?: Paint;
  strokeWidth?: number;
  opacity?: number;
  linejoin?: "round" | "miter" | "bevel";
  linecap?: "round" | "butt" | "square";
};

export type MarkShape = (Style & { type: "path"; d: string }) | (Style & { type: "circle"; cx: number; cy: number; r: number });

export const MARK: { viewBox: string; shapes: MarkShape[] } = {
  viewBox: "0 0 32 32",
  shapes: [
    { type: "path", d: "M16 3.5 4.6 23.2a14.2 14.2 0 0 0 22.8 0L16 3.5Z", stroke: "ink", strokeWidth: 1.4, linejoin: "round" },
    { type: "path", d: "M9.2 15.6a10 10 0 0 0 13.6 0", stroke: "ink", strokeWidth: 1.2, opacity: 0.55 },
    { type: "path", d: "M11.6 11.4a6 6 0 0 0 8.8 0", stroke: "ink", strokeWidth: 1.2, opacity: 0.35 },
    { type: "circle", cx: 18.6, cy: 19.2, r: 2.1, fill: "accent" },
    { type: "circle", cx: 7.4, cy: 7.2, r: 1.3, fill: "gold" },
  ],
};

/** "current" follows CSS currentColor (site UI); onLight/onDark are fixed colours; mono paints everything one colour. */
export type MarkTheme = "current" | "onLight" | "onDark" | { mono: string };

export const BRAND = { navy: "#0b1f3a", accent: "#35a3de", gold: "#b58b33", goldOnDark: "#d6b46a" };

const PALETTES = {
  current: { ink: "currentColor", accent: BRAND.accent, gold: BRAND.gold },
  onLight: { ink: BRAND.navy, accent: BRAND.accent, gold: BRAND.gold },
  onDark: { ink: "#ffffff", accent: BRAND.accent, gold: BRAND.goldOnDark },
};

function paint(p: Paint | undefined, theme: MarkTheme) {
  if (!p) return "none";
  return typeof theme === "object" ? theme.mono : PALETTES[theme][p];
}

function shapeProps(s: MarkShape, theme: MarkTheme) {
  return {
    fill: paint(s.fill, theme),
    stroke: paint(s.stroke, theme),
    strokeWidth: s.strokeWidth,
    opacity: s.opacity,
    strokeLinejoin: s.linejoin,
    strokeLinecap: s.linecap,
  };
}

/** The mark as an <svg>. No hooks, so it renders on the site and in generated images alike. */
export function MarkSvg({ theme = "current", size, className }: { theme?: MarkTheme; size?: number; className?: string }) {
  return (
    <svg viewBox={MARK.viewBox} width={size} height={size} className={className} fill="none" aria-hidden>
      {MARK.shapes.map((s, i) =>
        s.type === "path" ? <path key={i} d={s.d} {...shapeProps(s, theme)} /> : <circle key={i} cx={s.cx} cy={s.cy} r={s.r} {...shapeProps(s, theme)} />,
      )}
    </svg>
  );
}

const attrs = (o: Record<string, string | number | undefined>) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== "none")
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");

/**
 * The mark as SVG text, for the browser-tab icon and exported files. With a
 * background, it sits centred on a rounded square tile.
 */
export function markSvgString({
  theme,
  size,
  background,
}: {
  theme: Exclude<MarkTheme, "current">;
  size?: number;
  background?: { color: string; radius: number; padding: number };
}) {
  const shapes = MARK.shapes
    .map((s) => {
      const p = shapeProps(s, theme);
      const style = attrs({
        fill: p.fill,
        stroke: p.stroke,
        "stroke-width": p.strokeWidth,
        opacity: p.opacity,
        "stroke-linejoin": p.strokeLinejoin,
        "stroke-linecap": p.strokeLinecap,
      });
      const fillNone = p.fill === "none" ? ` fill="none"` : "";
      return s.type === "path" ? `<path d="${s.d}" ${style}${fillNone}/>` : `<circle cx="${s.cx}" cy="${s.cy}" r="${s.r}" ${style}${fillNone}/>`;
    })
    .join("");
  const dims = size ? ` width="${size}" height="${size}"` : "";
  if (!background) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK.viewBox}"${dims}>${shapes}</svg>`;

  const [minX, minY, w, h] = MARK.viewBox.split(/[\s,]+/).map(Number);
  const inner = 32 - background.padding * 2;
  const scale = inner / Math.max(w, h);
  const dx = background.padding + (inner - w * scale) / 2 - minX * scale;
  const dy = background.padding + (inner - h * scale) / 2 - minY * scale;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"${dims}>` +
    `<rect width="32" height="32" rx="${background.radius}" fill="${background.color}"/>` +
    `<g transform="translate(${dx.toFixed(3)} ${dy.toFixed(3)}) scale(${scale.toFixed(4)})">${shapes}</g></svg>`
  );
}
