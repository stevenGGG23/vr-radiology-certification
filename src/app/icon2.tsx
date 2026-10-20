import { appIcon } from "@/lib/share-card";

/* PNG tab icon for browsers and search results that don't use the SVG one. */
export const size = { width: 96, height: 96 };
export const contentType = "image/png";

export default function Icon() {
  return appIcon(96, { rounded: true });
}
