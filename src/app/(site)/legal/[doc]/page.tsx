import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/primitives";
import { imageCredits } from "@/lib/image-credits";
import { site } from "@/lib/site";

const docs: Record<string, { title: string; sections: [string, string][] }> = {
  privacy: {
    title: "Privacy Policy",
    sections: [
      ["What we collect", "Account details (name, email, profession, optional license number), course progress, exam attempts and certificates, and purchase records. Payments are processed by our payment provider; we never see or store full card numbers."],
      ["How we use it", "To deliver courses, issue and verify certificates, provide support, and, if you opt in, send course updates."],
      ["Certificate verification", "Anyone with a certificate ID can see the recipient name, course, issue date and score. Nothing else is shown."],
      ["Your choices", `You can update your profile at any time and request deletion by emailing support@${site.domain}.`],
    ],
  },
  terms: {
    title: "Terms of Service",
    sections: [
      ["Educational use", "Courses are educational and don't replace clinical judgment, supervised training or institutional credentialing. Practice within your licensed scope."],
      ["Accounts", "One learner per account. Sharing logins or redistributing course videos is prohibited and may result in loss of access without refund."],
      ["Access", "Purchases include 12 months of access to the course lessons, the final exam (two attempts) and certificate."],
      ["Intellectual property", "All videos, images and materials are owned by the academy and its instructor."],
    ],
  },
  refunds: {
    title: "Refund Policy",
    sections: [
      ["14-day refunds", "Request a refund within 14 days of purchase if you've completed less than 20% of the course and haven't started the exam."],
      ["Bundles", "Bundles are refundable under the same terms, measured across all included courses."],
      ["How to request", `Email support@${site.domain} with your order email.`],
    ],
  },
  "image-credits": {
    title: "Image credits",
    sections: [["Third-party images", "Photos and imaging on this site are used under the licenses below. Ultrasound, radiograph and CT images are de-identified educational images from Wikimedia Commons."]],
  },
  accessibility: {
    title: "Accessibility",
    sections: [
      ["Our commitment", "We aim to meet WCAG 2.2 AA. Every lesson will include captions, and the site supports keyboard navigation and reduced-motion preferences."],
      ["Feedback", `If something isn't working for you, email support@${site.domain} and we'll help.`],
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(docs).map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: PageProps<"/legal/[doc]">): Promise<Metadata> {
  const { doc } = await params;
  return { title: docs[doc]?.title ?? "Legal" };
}

export default async function LegalPage({ params }: PageProps<"/legal/[doc]">) {
  const { doc } = await params;
  const d = docs[doc];
  if (!d) notFound();
  return (
    <Container className="max-w-3xl py-16 sm:py-24">
      <div className="text-[13px] font-semibold text-faint">Legal</div>
      <h1 className="mt-3 text-[clamp(1.9rem,4vw,2.6rem)] font-bold tracking-[-0.02em] text-bone">{d.title}</h1>
      {doc !== "image-credits" && (
        <p className="mt-6 rounded-lg border border-[#ecdcb8] bg-[#fbf7ee] p-4 text-[13.5px] text-[#8a6a22]">
          Placeholder text for the draft. Have an attorney review and finalize before launch.
        </p>
      )}
      {doc === "image-credits" && (
        <ul className="mt-10 divide-y divide-line rounded-lg border border-line text-[14px]">
          {imageCredits.map((c) => (
            <li key={c.file} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-bone">{c.title} <span className="text-mute">by {c.author}</span></span>
              <a href={c.source} target="_blank" rel="noreferrer" className="shrink-0 font-semibold text-caliper hover:underline">{c.license}</a>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-10 space-y-9">
        {d.sections.map(([h, b]) => (
          <section key={h}>
            <h2 className="text-[18px] font-medium text-bone">{h}</h2>
            <p className="mt-2 text-[15.5px] leading-relaxed text-mute">{b}</p>
          </section>
        ))}
      </div>
    </Container>
  );
}
