"use client";

import { CircleCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";

/** Stub: post to a form endpoint or CRM (HubSpot, Formspree, email) later. */
export function TeamsQuoteForm() {
  const [sent, setSent] = useState(false);
  if (sent) {
    return (
      <div className="mt-8 rounded-xl border border-phosphor/30 bg-phosphor/[0.05] p-6">
        <CircleCheck className="h-6 w-6 text-phosphor" />
        <p className="mt-3 text-[16px] text-bone">Thanks! Your request is in.</p>
        <p className="mt-1 text-[14px] text-mute">Draft preview: nothing was actually sent. This will email the academy once connected.</p>
      </div>
    );
  }
  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" htmlFor="q-name"><Input id="q-name" required /></Field>
        <Field label="Work email" htmlFor="q-email"><Input id="q-email" type="email" required /></Field>
      </div>
      <Field label="Organization" htmlFor="q-org"><Input id="q-org" required placeholder="Hospital, group or program" /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Number of learners" htmlFor="q-seats">
          <Select id="q-seats" defaultValue="5–10">
            {["5–10", "11–25", "26–50", "51–100", "100+"].map((o) => <option key={o}>{o}</option>)}
          </Select>
        </Field>
        <Field label="Interested in" htmlFor="q-int">
          <Select id="q-int" defaultValue="Complete POCUS Curriculum">
            {["Complete POCUS Curriculum", "Emergency Imaging, Complete", "Specific courses", "Not sure yet"].map((o) => <option key={o}>{o}</option>)}
          </Select>
        </Field>
      </div>
      <Field label="Anything else?" htmlFor="q-msg"><Textarea id="q-msg" placeholder="Timeline, learner roles, LMS requirements…" /></Field>
      <Button type="submit" size="lg" className="w-full">Request pricing</Button>
    </form>
  );
}
