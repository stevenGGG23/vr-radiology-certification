import { formatDate } from "../format";
import { site } from "../site";
import type { EmailEvent, EmailTemplate, PaymentMethod } from "../types";

/*
  Automatic (transactional) emails. Each event renders to a subject, preview
  text, HTML and plain text, with no framework code, so the same templates run
  in the draft (Studio → Emails) and later on the server, where Stripe and
  auth webhooks trigger them and Resend or Postmark delivers them.
*/

export interface RenderedEmail {
  subject: string;
  preheader: string;
  html: string;
  text: string;
}

type Link = { label: string; href: string };
type Block =
  | { p: string; link?: Link }
  | { steps: string[] }
  | { rows: [string, string][]; total?: [string, string] }
  | { cta: Link }
  | { note: string };

interface Content {
  subject: string;
  preheader: string;
  heading: string;
  blocks: Block[];
}

const methodLabel: Record<PaymentMethod, string> = { card: "card", apple_pay: "Apple Pay", google_pay: "Google Pay" };

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const money = (cents: number) => usd.format(cents / 100);
const firstName = (name: string) => name.trim().split(/\s+/)[0] || "there";
const months = (days: number) => (days % 30 === 0 || days >= 360 ? `${Math.round(days / 30.4)} months` : `${days} days`);

function content(event: EmailEvent, at: string, url: (path: string) => string): Content {
  switch (event.template) {
    case "welcome": {
      const { name } = event.data;
      return {
        subject: `Welcome to ${site.name}`,
        preheader: "Your account is ready. Here is how courses and certificates work.",
        heading: `Welcome, ${firstName(name)}`,
        blocks: [
          { p: "Your account is set up. Every course is self-paced and works the same way:" },
          { steps: ["Watch each lesson all the way through.", "Pass the final exam.", "Download your certificate, which employers can verify online."] },
          { p: "Your certificates use the name on your account, so please check it's exactly how it should appear.", link: { label: "Check your name", href: url("/account") } },
          { cta: { label: "Browse courses", href: url("/courses") } },
        ],
      };
    }
    case "receipt": {
      const { name, orderIds, items, discountCents, totalCents, method } = event.data;
      const rows: [string, string][] = items.map((i) => [`${i.title} (${i.code})`, money(i.priceCents)]);
      if (discountCents > 0) rows.push(["Discount", `−${money(discountCents)}`]);
      const longest = Math.max(...items.map((i) => i.accessDays));
      return {
        subject: `Your receipt from ${site.name}`,
        preheader: `Thanks for your purchase. ${items.length === 1 ? "Your course is" : "Your courses are"} ready to start.`,
        heading: `Thanks, ${firstName(name)}. You're enrolled.`,
        blocks: [
          { p: `${items.length === 1 ? "Your course is" : "Your courses are"} in your account now, with ${months(longest)} of access to the lessons, final exam and certificate.` },
          { rows, total: ["Total paid", money(totalCents)] },
          {
            rows: [
              ["Paid with", methodLabel[method]],
              ["Date", formatDate(at)],
              [orderIds.length === 1 ? "Order" : "Orders", orderIds.join(", ")],
            ],
          },
          { cta: { label: "Start learning", href: url("/dashboard") } },
          {
            p: "Changed your mind? You can get a full refund within 14 days if you've completed less than 20% of the course and haven't started the exam.",
            link: { label: "Refund policy", href: url("/legal/refunds") },
          },
          { note: "Keep this email for your records. Payments are processed securely by our payment provider; we never see your full card number." },
        ],
      };
    }
    case "refund": {
      const { name, orderId, courseTitle, amountCents, method } = event.data;
      return {
        subject: `Your refund for ${courseTitle}`,
        preheader: `We've refunded ${money(amountCents)} to your ${methodLabel[method]}.`,
        heading: "Your refund is on its way",
        blocks: [
          { p: `Hi ${firstName(name)}, we've refunded ${money(amountCents)} for ${courseTitle} to the ${methodLabel[method]} you paid with. Depending on your bank, it can take 5 to 10 business days to appear.` },
          { rows: [["Refund", money(amountCents)], ["Order", orderId], ["Date", formatDate(at)]] },
          { p: `Your access to ${courseTitle} has ended, so its lessons and exam are no longer in your account. Any certificate you already earned stays valid.` },
          { note: `If you didn't ask for this refund, reply to this email or write to ${site.supportEmail}.` },
        ],
      };
    }
    case "access_granted": {
      const { name, courseTitle, slug, accessDays } = event.data;
      return {
        subject: `You now have access to ${courseTitle}`,
        preheader: `${courseTitle} has been added to your account.`,
        heading: "A course was added to your account",
        blocks: [
          { p: `Hi ${firstName(name)}, the ${site.shortName} team has added ${courseTitle} to your account, with ${months(accessDays)} of access to the lessons, final exam and certificate.` },
          { cta: { label: "Start the course", href: url(`/learn/${slug}`) } },
          { note: `Not expecting this? Reply to this email or write to ${site.supportEmail}.` },
        ],
      };
    }
    case "access_revoked": {
      const { name, courseTitle } = event.data;
      return {
        subject: `Your access to ${courseTitle} has ended`,
        preheader: `${courseTitle} has been removed from your account.`,
        heading: "Your course access has changed",
        blocks: [
          { p: `Hi ${firstName(name)}, ${courseTitle} has been removed from your account, so its lessons and exam are no longer available. Any certificate you already earned stays valid.` },
          { p: `If you think this is a mistake, reply to this email or write to ${site.supportEmail} with the email address you sign in with.` },
        ],
      };
    }
    case "certificate": {
      const { name, courseTitle, courseCode, certificateId, ceHours } = event.data;
      return {
        subject: `You passed: your certificate for ${courseTitle}`,
        preheader: `Certificate ${certificateId} is ready to download.`,
        heading: `Congratulations, ${firstName(name)}`,
        blocks: [
          { p: `You passed the final exam for ${courseTitle} (${courseCode}), and your certificate is ready.` },
          { rows: [["Certificate ID", certificateId], ["Contact hours", String(ceHours)], ["Issued", formatDate(at)]] },
          { cta: { label: "View and download your certificate", href: url(`/certificates/${encodeURIComponent(certificateId)}`) } },
          { p: `Anyone, such as an employer, can confirm it at ${site.domain}/verify using the certificate ID.`, link: { label: "Verification page", href: url(`/verify?id=${encodeURIComponent(certificateId)}`) } },
        ],
      };
    }
  }
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const C = { navy: "#0b1f3a", blue: "#1a5bd0", ink: "#16212f", body: "#3b4a5e", mute: "#6b7a8f", line: "#e3e8ef", bg: "#f5f7fa", gold: "#b58b33" };
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function blockHtml(b: Block) {
  if ("p" in b) {
    const link = b.link ? ` <a href="${esc(b.link.href)}" style="color:${C.blue};text-decoration:underline">${esc(b.link.label)}</a>` : "";
    return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${C.body}">${esc(b.p)}${link}</p>`;
  }
  if ("steps" in b) {
    const items = b.steps.map((s, i) => `<tr><td valign="top" style="padding:0 10px 8px 0;font-size:14px;font-weight:700;color:${C.blue}">${i + 1}.</td><td style="padding:0 0 8px;font-size:15px;line-height:1.5;color:${C.body}">${esc(s)}</td></tr>`).join("");
    return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px">${items}</table>`;
  }
  if ("rows" in b) {
    const row = ([k, v]: [string, string], strong = false) =>
      `<tr><td style="padding:10px 0;border-top:1px solid ${C.line};font-size:14px;color:${strong ? C.ink : C.mute};${strong ? "font-weight:700" : ""}">${esc(k)}</td><td align="right" style="padding:10px 0;border-top:1px solid ${C.line};font-size:14px;color:${C.ink};${strong ? "font-weight:700" : ""}">${esc(v)}</td></tr>`;
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-bottom:1px solid ${C.line}">${b.rows.map((r) => row(r)).join("")}${b.total ? row(b.total, true) : ""}</table>`;
  }
  if ("cta" in b) {
    return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px"><tr><td style="border-radius:8px;background:${C.blue}"><a href="${esc(b.cta.href)}" style="display:inline-block;padding:13px 22px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none">${esc(b.cta.label)}</a></td></tr></table>`;
  }
  return `<p style="margin:0 0 16px;font-size:13px;line-height:1.55;color:${C.mute}">${esc(b.note)}</p>`;
}

function blockText(b: Block) {
  if ("p" in b) return b.link ? `${b.p}\n${b.link.label}: ${b.link.href}` : b.p;
  if ("steps" in b) return b.steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
  if ("rows" in b) return [...b.rows, ...(b.total ? [b.total] : [])].map(([k, v]) => `${k}: ${v}`).join("\n");
  if ("cta" in b) return `${b.cta.label}: ${b.cta.href}`;
  return b.note;
}

const footerText = (home: string) =>
  `${site.name} · ${home}\nYou're getting this email because of activity on your account. Questions? Reply to this email or write to ${site.supportEmail}.`;

/** Renders one email. `baseUrl` makes links absolute (the live domain by default). */
export function renderEmail(event: EmailEvent, opts: { at?: string; baseUrl?: string } = {}): RenderedEmail {
  const base = (opts.baseUrl ?? site.url).replace(/\/$/, "");
  const at = opts.at ?? new Date().toISOString();
  const c = content(event, at, (path) => base + path);

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(c.subject)}</title></head>
<body style="margin:0;padding:0;background:${C.bg};font-family:${FONT}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(c.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg}"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${C.line};border-radius:12px;overflow:hidden">
<tr><td style="background:${C.navy};padding:20px 32px;font-size:15px;font-weight:700;letter-spacing:.02em;color:#ffffff">${esc(site.name)}</td></tr>
<tr><td style="height:3px;background:${C.gold};font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="padding:32px 32px 12px">
<h1 style="margin:0 0 18px;font-size:22px;line-height:1.3;color:${C.ink}">${esc(c.heading)}</h1>
${c.blocks.map(blockHtml).join("\n")}
</td></tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px"><tr><td style="padding:20px 32px;font-size:12px;line-height:1.6;color:${C.mute};text-align:center">
${esc(site.name)} · <a href="${esc(base)}" style="color:${C.mute}">${esc(base.replace(/^https?:\/\//, ""))}</a><br>
You're getting this email because of activity on your account. Questions? Reply to this email or write to <a href="mailto:${esc(site.supportEmail)}" style="color:${C.mute}">${esc(site.supportEmail)}</a>.
</td></tr></table>
</td></tr></table>
</body>
</html>`;

  const text = [c.heading, ...c.blocks.map(blockText), "—", footerText(base.replace(/^https?:\/\//, ""))].join("\n\n");
  return { subject: c.subject, preheader: c.preheader, html, text };
}

/** What sends each email, in the draft and in production. Shown in Studio and the README. */
export const emailCatalog: { template: EmailTemplate; label: string; trigger: string; production: string; sample: EmailEvent }[] = [
  {
    template: "welcome",
    label: "Welcome",
    trigger: "A new account is created (email or Google).",
    production: "Auth provider's user-created hook",
    sample: { template: "welcome", data: { name: "Jordan Example" } },
  },
  {
    template: "receipt",
    label: "Purchase receipt",
    trigger: "Checkout succeeds. One email per checkout, listing every course.",
    production: "Stripe webhook checkout.session.completed",
    sample: {
      template: "receipt",
      data: {
        name: "Jordan Example",
        orderIds: ["o-1a2b3c4d"],
        items: [{ title: "eFAST: Trauma Ultrasound", code: "SVR-110", slug: "efast-trauma-ultrasound", priceCents: 12900, accessDays: 365 }],
        discountCents: 0,
        totalCents: 12900,
        method: "apple_pay",
      },
    },
  },
  {
    template: "refund",
    label: "Refund and access removed",
    trigger: "An order is refunded. Access to that course ends at the same time.",
    production: "Stripe webhook charge.refunded",
    sample: { template: "refund", data: { name: "Jordan Example", orderId: "o-1a2b3c4d", courseTitle: "eFAST: Trauma Ultrasound", amountCents: 12900, method: "card" } },
  },
  {
    template: "access_granted",
    label: "Access granted",
    trigger: "Staff add a course to a learner's account (comps, group seats).",
    production: "Studio action (server)",
    sample: { template: "access_granted", data: { name: "Jordan Example", courseTitle: "eFAST: Trauma Ultrasound", slug: "efast-trauma-ultrasound", accessDays: 365 } },
  },
  {
    template: "access_revoked",
    label: "Access removed",
    trigger: "Staff remove a course without a refund, or a payment is disputed.",
    production: "Studio action, or Stripe webhook charge.dispute.created",
    sample: { template: "access_revoked", data: { name: "Jordan Example", courseTitle: "eFAST: Trauma Ultrasound" } },
  },
  {
    template: "certificate",
    label: "Course passed and certificate",
    trigger: "A learner passes the final exam and the certificate is issued.",
    production: "Server-side exam grading",
    sample: { template: "certificate", data: { name: "Jordan Example", courseTitle: "eFAST: Trauma Ultrasound", courseCode: "SVR-110", certificateId: "SVR-7KQ2-M9XD", ceHours: 5.5 } },
  },
];
