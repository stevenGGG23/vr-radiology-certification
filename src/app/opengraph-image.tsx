import { shareCard, shareSize } from "@/lib/share-card";

export const alt = "Sonosus VR Education: point-of-care ultrasound and emergency imaging courses by Dr. Susanna Rudy, DNP";
export const size = shareSize;
export const contentType = "image/png";

export default function Image() {
  return shareCard({
    label: "Education",
    title: "Point-of-care ultrasound and emergency imaging courses",
    subtitle: "By Dr. Susanna Rudy, DNP. Watch the lessons, pass the exam, earn a verifiable certificate.",
    domain: "sonosusvr.org",
  });
}
