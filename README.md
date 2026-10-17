# Sonosus VR Education (draft)

Preview: https://vr-radiology-certification-ahmh1unff-stevenggg23s-projects.vercel.app/

Online course store for Dr. Susanna Rudy's point-of-care ultrasound and emergency imaging curriculum:
course catalog, course pages, cart and checkout, video lessons behind a paywall, a final exam with two
attempts, verifiable certificates, a student dashboard and an admin **Studio** for managing courses.

This is a **front-end draft**. Accounts, payments, progress and certificates are simulated in the browser
(localStorage) so the whole flow can be clicked through before the real backend exists.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000 (Codespaces: open the forwarded port 3000)
npm run build      # production build check
```

## Demo walkthrough

- **Draft tools** button (footer, phone menu, Studio sidebar): sign in as a student, open the Studio as
  Dr. Rudy, or reset all demo data.
- **Admin (Studio) login:** `susanna@sonosusvr.org`, any password, then `/studio`.
- **Promo code:** `RUDY10` (10% off).
- **Verify page:** try `SVR-DEMO-1038`, or the ID on any certificate you earn.
- Certificates are pass/fail: they never show the exam score.
- In a lesson, "Draft tool: mark all lessons complete" unlocks the exam quickly.

## Domains

One Vercel project serves both domains (add both under Project → Settings → Domains):

- **sonosusvr.org**: Sonosus VR Education (this course site). Make it the primary domain.
- **sonosusvr.com**: Sonosus VR, Virtual Response On Call. Its home page is rewritten to `/on-call`
  (see `rewrites` in `next.config.ts`); edit that page in `src/app/(oncall)/on-call/page.tsx`.

## Where things live

| What | Where |
| --- | --- |
| Brand name, domain, Vanderbilt wording, demo flag | `src/lib/site.ts` |
| Starting course catalog (placeholder titles, prices, lessons, exam questions) | `src/lib/seed/courses.ts` |
| Image licenses and credits (shown at `/legal/image-credits`) | `src/lib/image-credits.ts` |
| Course photos and imaging | `public/images/courses`, `public/images/photos` |
| Sample lesson videos (real lung ultrasound, CC BY 2.0) | `public/videos` |
| Pages | `src/app` (`(site)` storefront, `(auth)` sign in, `(focus)` lessons/exam/certificate, `studio` admin) |

Dr. Rudy can edit courses, lessons, video links, exam questions, prices and site text from the Studio.
In the draft those edits are saved in the browser only.

## Content still needed from Dr. Rudy

1. Real course list: titles, descriptions, lesson outlines, durations, prices.
2. Lesson videos (the 3 years of recordings), plus any slide or PDF handouts.
3. Exam questions per course. The current ones are drafts written for structure.
4. Professional headshots she owns the rights to. The current photo is a Vanderbilt news photo, so
   it needs permission or replacing.
5. De-identified scan stills from her own teaching to replace the stock and Commons images.
6. A signature image for certificates, a logo, and the domain name.
7. **Vanderbilt:** written permission before using Vanderbilt's name prominently or any Vanderbilt logo
   (contact the university's trademark/licensing office). The logo slot is intentionally left out.
8. **CE accreditation:** contact hours are shown as "pending". Selling credit requires an accredited
   provider (e.g. ANCC / AANP for NPs, AAPA for PAs). The certificate text updates from Studio → Settings.

## Next build phase (backend)

- **Auth + database:** Supabase (Postgres + Auth). Admin role checked on the server, row-level security,
  and two-factor sign-in for admin accounts. The Studio address can stay unlisted, but the role check
  is what protects it.
- **Payments:** Stripe Checkout. A webhook creates enrollments; the browser never grants access.
- **Video:** Mux or Bunny Stream with signed, expiring playback URLs so paid videos can't be shared.
- **Exams:** graded on the server; answers are never sent to the browser.
- **Certificates:** generated server-side as PDFs, with a public verification record.
- **Email:** receipts, password reset and certificates via Resend or Postmark.
- **Hosting:** Vercel, plus the custom domain.

The data shapes in `src/lib/types.ts` map directly onto future database tables, and the store actions
in `src/lib/store/*` are the seams where API calls replace local storage.

## Recommended VS Code extensions

See `.vscode/extensions.json` (VS Code will prompt you to install them): Tailwind CSS IntelliSense,
ESLint, Prettier, Pretty TypeScript Errors, and later the Supabase and Stripe extensions.
