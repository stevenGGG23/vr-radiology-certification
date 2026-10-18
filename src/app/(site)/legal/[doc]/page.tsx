import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/primitives";
import { imageCredits } from "@/lib/image-credits";
import { site } from "@/lib/site";

/*
  Site policies. A block is a paragraph (string) or a bulleted list (string[]).
  Update LAST_UPDATED whenever a policy changes.
*/

type Block = string | string[];

interface Doc {
  title: string;
  intro?: string;
  sections: { heading: string; body: Block[] }[];
}

const LAST_UPDATED = "October 18, 2026";
const NAME = site.name;
const EMAIL = site.supportEmail;

const docs: Record<string, Doc> = {
  privacy: {
    title: "Privacy Policy",
    intro: `This policy explains what information ${NAME} ("we", "us") collects when you use ${site.domain} and our courses, how we use it, and the choices you have.`,
    sections: [
      {
        heading: "Information we collect",
        body: [
          [
            "Account details: your name, email address and profession, plus your license number and organization if you choose to add them. If you sign in with Google, Google shares your name, email address and profile photo with us.",
            "Learning records: lessons completed, exam attempts and results, and certificates issued.",
            "Purchase records: what you bought, the amount and the date. Payments are handled by our payment processor; we never receive or store your full card number.",
            "Technical information: browser and device type, pages visited and similar usage data, collected through cookies and similar technologies.",
          ],
        ],
      },
      {
        heading: "How we use it",
        body: [
          [
            "To provide your courses, save your progress, run exams and issue certificates",
            "To let employers and credentialing offices verify certificates you share with them",
            "To process payments and refunds, and to prevent fraud",
            "To answer support requests and send messages about your account and purchases",
            "To send course announcements, only if you sign up for them; you can unsubscribe at any time",
            "To keep the site secure, fix problems and improve our courses",
          ],
        ],
      },
      {
        heading: "Certificate verification",
        body: [
          "Anyone who enters a certificate ID on our verification page can see the recipient's name, the course, the date issued and that the final exam was passed. Exam scores are never shown.",
        ],
      },
      {
        heading: "How we share information",
        body: [
          "We do not sell your personal information. We share it only:",
          [
            "With service providers that run the site for us, such as hosting, payment, video and email providers, who may use it only to provide their services",
            "With your organization, if it purchased your seat, which can see your progress and completion",
            "With an accrediting body, if a course offers continuing education credit and reporting is required; we will tell you on the course page",
            "When required by law, or to protect the rights and safety of our learners and our business",
          ],
        ],
      },
      {
        heading: "Cookies",
        body: [
          "We use essential cookies and browser storage to keep you signed in and remember your cart and progress. You can block cookies in your browser settings, but parts of the site will stop working.",
        ],
      },
      {
        heading: "Retention and security",
        body: [
          "We keep account and learning records while your account is open and as long as needed to verify certificates and meet record-keeping obligations. Information is encrypted in transit and access is limited to people who need it. No system is perfectly secure, so please use a strong password and keep it private.",
        ],
      },
      {
        heading: "Your choices and rights",
        body: [
          `You can update your profile at any time. You can also ask us to access, correct, export or delete your personal information by emailing ${EMAIL}. Depending on where you live, you may have additional privacy rights, and we will honor them. We will not treat you differently for using these rights.`,
        ],
      },
      {
        heading: "Patient information",
        body: [
          "Our courses are educational and do not ask for patient health information. Please do not upload or send patient information through the site.",
        ],
      },
      {
        heading: "Children",
        body: ["Our courses are for adults. We do not knowingly collect information from anyone under 18."],
      },
      {
        heading: "Changes and contact",
        body: [
          `We will post any changes here and update the date above; for significant changes we will also email account holders. Questions? Email ${EMAIL}.`,
        ],
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    intro: `These terms govern your use of ${site.domain} and the courses offered by ${NAME}. By creating an account or making a purchase, you agree to them.`,
    sections: [
      {
        heading: "Educational purpose",
        body: [
          "Our courses provide education for licensed healthcare professionals and students. They are not medical advice and do not replace clinical judgment, supervised training, or your institution's credentialing and privileging requirements. Always practice within the scope of your license.",
        ],
      },
      {
        heading: "Accounts",
        body: [
          [
            "You must be at least 18 and give accurate information. The name on your account is the name printed on your certificates.",
            "Each account is for one learner. Do not share your sign-in or let others take your exams.",
            "You are responsible for activity under your account. Tell us right away if you think it has been accessed without permission.",
          ],
        ],
      },
      {
        heading: "Purchases and access",
        body: [
          "Prices are in US dollars, and applicable taxes are added at checkout. Unless a course page says otherwise, a purchase gives you 12 months of access to the course lessons, its final exam and certificate. We may update course content to keep it current. If we retire a course during your access period, we will offer a comparable course or a prorated refund.",
        ],
      },
      {
        heading: "Exams and certificates",
        body: [
          [
            "Each final exam unlocks after you complete every lesson. A score of 80% or higher passes, and two attempts are included unless the course page says otherwise.",
            "Certificates are pass/fail certificates of completion. They do not show your score.",
            "A certificate shows that you completed the education. It is not a license, a board certification, or a grant of clinical privileges.",
            "Continuing education credit is offered only when the course page lists it.",
            "We may revoke a certificate earned through cheating or account sharing.",
          ],
        ],
      },
      {
        heading: "Acceptable use",
        body: [
          "We grant you a personal, non-transferable license to view the courses you purchase for your own education. You may not:",
          [
            "Download, record, copy or redistribute course videos or materials",
            "Share exam questions or answers",
            "Resell access or use the content to train others commercially",
            "Use automated tools to access the site, or attempt to bypass its security",
          ],
          "Breaking these rules may lead to loss of access without a refund.",
        ],
      },
      {
        heading: "Group and institutional purchases",
        body: ["Purchases made by an organization for its learners are also governed by the terms of that order."],
      },
      {
        heading: "Intellectual property",
        body: [
          `All course videos, text, images, exams and other materials belong to ${NAME}, Dr. Susanna Rudy or their licensors and are protected by copyright. Other names and marks shown on the site belong to their owners, and their appearance does not imply sponsorship or endorsement unless stated.`,
        ],
      },
      {
        heading: "Third-party services",
        body: [
          "Sign-in, payments and video playback are provided by third-party services, such as Google and our payment processor, whose own terms also apply.",
        ],
      },
      {
        heading: "Disclaimers and limitation of liability",
        body: [
          "Medical knowledge changes, and while we work to keep our courses accurate, they are provided as is, without warranties of any kind. To the fullest extent permitted by law, we are not liable for indirect or consequential damages, and our total liability for any claim is limited to the amount you paid us in the 12 months before the claim.",
        ],
      },
      {
        heading: "Ending your account",
        body: [
          "You can stop using the site at any time. We may suspend or close accounts that break these terms.",
        ],
      },
      {
        heading: "Governing law, changes and contact",
        body: [
          `These terms are governed by the laws of the State of Tennessee, without regard to its conflict-of-law rules. We may update these terms; continued use after changes are posted means you accept them. Questions? Email ${EMAIL}.`,
        ],
      },
    ],
  },
  refunds: {
    title: "Refund Policy",
    intro: "We want every learner to be satisfied with their course. Here is how refunds work.",
    sections: [
      {
        heading: "14-day refunds",
        body: [
          "You can request a full refund within 14 days of purchase, as long as you have completed less than 20% of the course lessons and have not started the final exam.",
        ],
      },
      {
        heading: "Bundles",
        body: [
          "Bundles follow the same rule, with progress measured across all of the courses in the bundle. Individual courses within a bundle cannot be refunded separately.",
        ],
      },
      {
        heading: "When refunds aren't available",
        body: [
          [
            "More than 14 days after purchase",
            "After you have started a final exam or received a certificate",
            "When an account has broken our Terms of Service",
          ],
          "We will always fix billing errors, such as duplicate charges, and will work with you if a technical problem on our side keeps you from using a course.",
        ],
      },
      {
        heading: "Group and institutional purchases",
        body: ["Refunds for purchases made by an organization follow the terms of that order."],
      },
      {
        heading: "How to request a refund",
        body: [
          `Email ${EMAIL} from the address on your account and tell us which course you'd like refunded. We'll reply within 2 business days. Approved refunds go back to your original payment method and usually appear within 5 to 10 business days, depending on your bank. Access to the course ends when the refund is issued.`,
        ],
      },
    ],
  },
  "image-credits": {
    title: "Image credits",
    sections: [
      {
        heading: "Third-party images",
        body: [
          "Photos and imaging on this site are used under the licenses below. Ultrasound, radiograph and CT images are de-identified educational images from Wikimedia Commons.",
        ],
      },
    ],
  },
  accessibility: {
    title: "Accessibility Statement",
    intro: `${NAME} is committed to making our courses usable by every clinician, including people with disabilities.`,
    sections: [
      {
        heading: "Our standard",
        body: ["We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at Level AA across the site and our courses."],
      },
      {
        heading: "What we do",
        body: [
          [
            "Every page can be used with a keyboard, with visible focus indicators",
            "Text and controls meet color contrast requirements",
            "Images have text alternatives, and pages use clear headings and labels",
            "Animations stop when your device is set to reduce motion",
            "Pages adapt to phones, tablets and zoom up to 200%",
            "Lesson videos include captions, and transcripts are available on request",
          ],
        ],
      },
      {
        heading: "Known limitations",
        body: [
          "Some older lesson recordings may not yet have captions, and some embedded third-party content may not fully meet our standard. We are working through both.",
        ],
      },
      {
        heading: "Feedback and help",
        body: [
          `If something is hard to use, or you need course material in another format, email ${EMAIL}. We'll respond within 5 business days.`,
        ],
      },
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

function BlockView({ block }: { block: Block }) {
  if (typeof block === "string") return <p className="text-[15.5px] leading-relaxed text-mute">{block}</p>;
  return (
    <ul className="list-disc space-y-1.5 pl-5 text-[15.5px] leading-relaxed text-mute marker:text-faint">
      {block.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default async function LegalPage({ params }: PageProps<"/legal/[doc]">) {
  const { doc } = await params;
  const d = docs[doc];
  if (!d) notFound();
  return (
    <Container className="max-w-3xl py-16 sm:py-24">
      <div className="text-[13px] font-semibold text-faint">Legal</div>
      <h1 className="mt-3 text-[clamp(1.9rem,4vw,2.6rem)] font-bold tracking-[-0.02em] text-bone">{d.title}</h1>
      {doc !== "image-credits" && <p className="mt-3 text-[14px] text-faint">Last updated {LAST_UPDATED}</p>}
      {d.intro && <p className="mt-6 text-[16.5px] leading-relaxed text-bone-dim">{d.intro}</p>}
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
        {d.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-[18px] font-semibold text-bone">{s.heading}</h2>
            <div className="mt-2 space-y-3">
              {s.body.map((b, i) => (
                <BlockView key={i} block={b} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </Container>
  );
}
