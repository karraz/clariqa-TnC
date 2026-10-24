import Link from "next/link";
import { notFound } from "next/navigation";
import {
  addManualEnrollment,
  addMaterial,
  deleteCourse,
  deleteMaterial,
  moveMaterial,
  setPaymentStatus,
} from "@/app/actions/admin";
import { CourseForm } from "@/components/admin/course-form";
import { PaymentBadge } from "@/components/badges";
import { Flash } from "@/components/flash";
import { SubmitButton } from "@/components/submit-button";
import type { EnrollmentRow } from "@/lib/admin-stats";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatMYR } from "@/lib/format";
import type { Course, Material } from "@/lib/types";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> };

export default async function AdminCoursePage({ params, searchParams }: Props) {
  const [{ id }, { saved, error }] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const [{ data: course }, { data: enrollments }, { data: materials }] = await Promise.all([
    supabase.from("courses").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("enrollments")
      .select("*, course:courses(id, title, category, start_date, status), profile:profiles(full_name, email, phone, organisation)")
      .eq("course_id", id)
      .order("created_at"),
    supabase.from("materials").select("*").eq("course_id", id).order("sort_order").order("created_at"),
  ]);
  if (!course) notFound();
  const c = course as Course;
  const rows = (enrollments ?? []) as EnrollmentRow[];
  const items = (materials ?? []) as Material[];
  const paid = rows.filter((r) => r.payment_status === "paid");

  return (
    <>
      <Link href="/admin/courses" className="text-sm text-brand-600 hover:underline">← Courses</Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">{c.title}</h1>
        {c.status !== "draft" && (
          <Link href={`/courses/${c.slug}`} className="btn-outline" target="_blank">View public page ↗</Link>
        )}
      </div>
      <div className="mt-4"><Flash error={error} message={saved ? "Saved." : undefined} /></div>

      {/* Participants */}
      <section id="participants" className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Participants</h2>
            <p className="text-sm text-slate-500">
              {paid.length} paid · {rows.length - paid.length} not paid · {formatMYR(paid.reduce((s, r) => s + Number(r.amount_myr), 0))} collected
            </p>
          </div>
          <a href={`/admin/courses/${c.id}/participants.csv`} className="btn-outline">Export CSV</a>
        </div>
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Contact</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Paid on</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.profile?.full_name || "—"}</p>
                    <p className="text-xs text-slate-500">{r.profile?.organisation}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {r.profile?.email}<br />{r.profile?.phone}
                  </td>
                  <td className="px-4 py-3">{formatMYR(r.amount_myr)}</td>
                  <td className="px-4 py-3">
                    <PaymentBadge status={r.payment_status} />
                    {r.payment_method && <p className="mt-1 text-xs text-slate-500">{r.payment_method}</p>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.paid_at ? formatDate(r.paid_at) : "—"}</td>
                  <td className="px-4 py-3">
                    <form action={setPaymentStatus} className="flex gap-1">
                      <input type="hidden" name="enrollmentId" value={r.id} />
                      {r.payment_status !== "paid" ? (
                        <button name="status" value="paid" className="btn-outline px-2 py-1 text-xs">Mark paid</button>
                      ) : (
                        <button name="status" value="refunded" className="btn-outline px-2 py-1 text-xs">Mark refunded</button>
                      )}
                      {r.payment_status !== "pending" && (
                        <button name="status" value="pending" className="btn-outline px-2 py-1 text-xs">Set pending</button>
                      )}
                    </form>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No registrations yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <form action={addManualEnrollment} className="card mt-4 grid gap-3 p-4 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:items-end">
          <input type="hidden" name="courseId" value={c.id} />
          <div>
            <label className="label" htmlFor="email">Add participant by email</label>
            <input className="input" id="email" name="email" type="email" placeholder="registered student email" required />
          </div>
          <div>
            <label className="label" htmlFor="amount">Amount (RM)</label>
            <input className="input" id="amount" name="amount" type="number" step="0.01" defaultValue={c.price_myr} />
          </div>
          <div>
            <label className="label" htmlFor="m-status">Status</label>
            <select className="input" id="m-status" name="status" defaultValue="paid">
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="method">Method</label>
            <select className="input" id="method" name="method">
              <option>bank transfer</option>
              <option>HRD Corp</option>
              <option>LO / purchase order</option>
              <option>cash</option>
              <option>complimentary</option>
            </select>
          </div>
          <SubmitButton className="btn-primary">Add</SubmitButton>
        </form>
      </section>

      {/* Materials */}
      <section id="materials" className="mt-12">
        <h2 className="text-xl font-semibold">Course materials</h2>
        <p className="text-sm text-slate-500">Only participants with a <strong>paid</strong> status can see and download these.</p>
        <ul className="card mt-4 divide-y divide-slate-100">
          {items.map((m, i) => (
            <li key={m.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{m.title}</p>
                {m.description && <p className="text-sm text-slate-600">{m.description}</p>}
                <p className="text-xs text-slate-400">
                  {m.file_path ? m.file_path.split("/").pop() : m.external_url} · added {formatDate(m.created_at)}
                </p>
              </div>
              <div className="flex gap-1">
                {m.file_path && <a href={`/dashboard/materials/${m.id}`} className="btn-outline px-2 py-1 text-xs">Download</a>}
                <form action={moveMaterial} className="flex gap-1">
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="courseId" value={c.id} />
                  <button name="direction" value="up" disabled={i === 0} className="btn-outline px-2 py-1 text-xs" aria-label="Move up">↑</button>
                  <button name="direction" value="down" disabled={i === items.length - 1} className="btn-outline px-2 py-1 text-xs" aria-label="Move down">↓</button>
                </form>
                <form action={deleteMaterial}>
                  <input type="hidden" name="id" value={m.id} />
                  <button className="btn-outline px-2 py-1 text-xs text-red-600">Delete</button>
                </form>
              </div>
            </li>
          ))}
          {items.length === 0 && <li className="p-6 text-center text-sm text-slate-500">No materials uploaded yet.</li>}
        </ul>
        <form action={addMaterial} className="card mt-4 grid gap-3 p-4 md:grid-cols-2">
          <input type="hidden" name="courseId" value={c.id} />
          <div>
            <label className="label" htmlFor="m-title">Title</label>
            <input className="input" id="m-title" name="title" placeholder="e.g. Day 1 slides" />
          </div>
          <div>
            <label className="label" htmlFor="m-desc">Description</label>
            <input className="input" id="m-desc" name="description" placeholder="optional" />
          </div>
          <div>
            <label className="label" htmlFor="m-file">File (PDF, slides, dataset, syntax…)</label>
            <input className="input" id="m-file" name="file" type="file" />
          </div>
          <div>
            <label className="label" htmlFor="m-url">…or a link (Google Drive, YouTube, Zoom recording)</label>
            <input className="input" id="m-url" name="external_url" type="url" placeholder="https://" />
          </div>
          <div className="md:col-span-2">
            <SubmitButton pendingText="Uploading…">Add material</SubmitButton>
          </div>
        </form>
      </section>

      {/* Details */}
      <section className="mt-12">
        <h2 className="mb-4 text-xl font-semibold">Course details</h2>
        <CourseForm course={c} />
        <form action={deleteCourse} className="mt-4">
          <input type="hidden" name="id" value={c.id} />
          <SubmitButton className="btn-danger" pendingText="Deleting…">Delete course</SubmitButton>
        </form>
      </section>
    </>
  );
}
