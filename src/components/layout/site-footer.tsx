import Link from "next/link";
import { Logo } from "@/components/ui/brand";
import { Container } from "@/components/ui/primitives";
import { site } from "@/lib/site";
import { NewsletterForm } from "./newsletter-form";

const columns = [
  {
    title: "Courses",
    links: [
      { href: "/courses", label: "All courses" },
      { href: "/courses?c=ultrasound", label: "Point-of-care ultrasound" },
      { href: "/courses?c=procedures", label: "Procedural guidance" },
      { href: "/courses?c=radiography", label: "Radiograph interpretation" },
      { href: "/courses?c=ct", label: "CT interpretation" },
      { href: "/courses?c=bundle", label: "Bundles" },
    ],
  },
  {
    title: "Certification",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/verify", label: "Verify a certificate" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "About the course author" },
      { href: "/teams", label: "Group & institutional pricing" },
      { href: "/contact", label: "Contact us" },
      { href: "/login", label: "Student sign in" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="on-dark mt-auto bg-[#0b1f3a]">
      <div className="border-b border-line">
        <Container className="flex flex-col items-start gap-3 py-5 text-[14px] text-bone-dim sm:flex-row sm:items-center">
          {/* Vanderbilt mark: confirm permission with Vanderbilt's trademark office before launch. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/brand/vanderbilt-v.png" alt="Vanderbilt University" className="h-6 w-auto shrink-0" />
          <span>{site.provenance.short}. {site.provenance.years} years in development.</span>
        </Container>
      </div>
      <Container className="grid gap-12 py-14 lg:grid-cols-[1.2fr_2fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-5 text-[14.5px] leading-relaxed text-mute">{site.tagline}</p>
          <div className="mt-6">
            <div className="mb-2 text-[13px] font-semibold text-bone">Get new course announcements</div>
            <NewsletterForm />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title}>
              <div className="text-[13px] font-bold uppercase tracking-[0.1em] text-bone">{col.title}</div>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[14px] text-mute transition-colors hover:text-bone">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
      <div className="border-t border-line">
        <Container className="flex flex-col gap-4 py-6 text-[12.5px] text-faint md:flex-row md:items-center md:justify-between">
          <p>
            © {site.copyrightYear} {site.name}. Educational content only; it does not replace clinical judgment or institutional credentialing.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/legal/privacy" className="hover:text-bone">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-bone">Terms</Link>
            <Link href="/legal/refunds" className="hover:text-bone">Refund policy</Link>
            <Link href="/legal/accessibility" className="hover:text-bone">Accessibility</Link>
            <Link href="/legal/image-credits" className="hover:text-bone">Image credits</Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
