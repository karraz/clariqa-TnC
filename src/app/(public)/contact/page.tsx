import type { Metadata } from "next";
import { submitEnquiry } from "@/app/actions/enquiry";
import { Flash } from "@/components/flash";
import { SubmitButton } from "@/components/submit-button";

export const metadata: Metadata = { title: "Contact & in-house training" };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const { sent, error } = await searchParams;
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-2">
      <div>
        <h1 className="text-4xl font-bold">Contact us</h1>
        <p className="mt-3 text-slate-600">
          Ask about a course, request an invoice or bank transfer, or plan an in-house programme for your team. We reply
          within one working day.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-slate-700">
          <li>📍 Selangor, Malaysia</li>
          <li>✉️ hello@clariqa.com</li>
          <li>🏢 HRD Corp claimable in-house training</li>
        </ul>
      </div>
      <form action={submitEnquiry} className="card space-y-4 p-6">
        <Flash error={error} message={sent ? "Thank you! We will be in touch shortly." : undefined} />
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input className="input" id="name" name="name" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input className="input" id="email" name="email" type="email" required />
          </div>
          <div>
            <label className="label" htmlFor="phone">Phone</label>
            <input className="input" id="phone" name="phone" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="organisation">Organisation</label>
          <input className="input" id="organisation" name="organisation" />
        </div>
        <div>
          <label className="label" htmlFor="topic">Topic</label>
          <select className="input" id="topic" name="topic" defaultValue="General enquiry">
            <option>General enquiry</option>
            <option>In-house / corporate training</option>
            <option>Research consultancy</option>
            <option>Invoice / bank transfer / HRD Corp</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="message">Message</label>
          <textarea className="input min-h-32" id="message" name="message" required />
        </div>
        <SubmitButton pendingText="Sending…">Send message</SubmitButton>
      </form>
    </div>
  );
}
