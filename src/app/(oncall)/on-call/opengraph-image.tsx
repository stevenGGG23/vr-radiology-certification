import { shareCard, shareSize } from "@/lib/share-card";

export const alt = "Sonosus VR: Virtual Response On Call, coming soon";
export const size = shareSize;
export const contentType = "image/png";

export default function Image() {
  return shareCard({
    label: "On Call",
    title: "Virtual Response On Call",
    subtitle: "A new on-call clinical service from Dr. Susanna Rudy, DNP. Coming soon.",
    domain: "sonosusvr.com",
  });
}
