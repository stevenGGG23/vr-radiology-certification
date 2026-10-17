/*
  One place for brand + business details. Rename the academy, swap the domain,
  or turn demo mode off here.
*/
export const site = {
  name: "Rudy Imaging Academy",
  shortName: "Rudy Imaging",
  /** Placeholder until the domain is purchased. */
  domain: "rudyimaging.academy",
  url: "https://rudyimaging.academy",
  tagline: "Bedside imaging education for advanced practice providers.",
  description:
    "Self-paced point-of-care ultrasound and emergency imaging courses by Dr. Susanna Rudy, DNP. Watch, pass the exam, and earn a verifiable certificate.",
  instructor: {
    name: "Susanna Rudy",
    display: "Dr. Susanna Rudy",
    credentials: "DNP, MFS, AG-ACNP, FNP, ENP",
    title: "Emergency Nurse Practitioner & POCUS Educator",
  },
  copyrightYear: 2026,
  /**
   * Provenance line used across the store. Confirm exact wording with
   * Dr. Rudy and Vanderbilt before launch. Using Vanderbilt's name or logo in
   * marketing needs the university's permission.
   */
  provenance: {
    short: "Developed by a Vanderbilt University School of Nursing professor",
    long: "Developed over three years by Dr. Susanna Rudy, a Vanderbilt University School of Nursing professor, and used to teach point-of-care ultrasound in Vanderbilt's advanced practice program.",
    years: 3,
  },
  /**
   * Demo mode: accounts, payments and progress live in the browser only.
   * Set NEXT_PUBLIC_DEMO_MODE=false once the real backend is connected.
   */
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE !== "false",
  /** Demo admin account (Studio). Real auth replaces this entirely. */
  demoAdminEmail: "susanna@rudyimaging.academy",
} as const;

export const categories: { id: string; label: string; short: string }[] = [
  { id: "ultrasound", short: "Ultrasound", label: "Point-of-care ultrasound" },
  { id: "procedures", short: "Procedures", label: "Procedural guidance" },
  { id: "radiography", short: "Radiographs", label: "Radiograph interpretation" },
  { id: "ct", short: "CT", label: "CT interpretation" },
  { id: "simulation", short: "VR simulation", label: "VR simulation" },
  { id: "bundle", short: "Bundle", label: "Bundles" },
];

