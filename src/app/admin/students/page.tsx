import Link from "next/link";
import { setPaymentStatus } from "@/app/actions/admin";
import { PaymentBadge } from "@/components/badges";
import type { EnrollmentRow } from "@/lib/admin-stats";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatMYR } from "@/lib/format";

const STATUSES = ["all", "paid", "pending", "failed", "refunded"] as const;

type Props = { searchParams: Promise<{ status?: string; q?: string }> };

export default async function AdminStudentsPage({ searchParams }: Props) {
  const { status = "all", q = "" } = await searchParams;
  const supabase = await createClient();
  let query = supabase
    .from("enrollments")
    .select("*, course:courses(id, title, category, start_date, status), profile:profiles(full_name, email, phone, organisation)")
    .order("created_at", { ascending: false });
  if (status !== "all") query = query.eq("payment_status", status);
  const { data } = await query;

  const needle = q.toLowerCase();
  const rows = ((data ?? []) as EnrollmentRow[]).filter(
    (r) =>
      !needle ||
      [r.profile?.full_name, r.profile?.email, r.profile?.organisation, r.course?.title]
        .some((v) => v?.toLowerCase().includes(needle)),
  );

  return (
    <>
      <h1 className="text-3xl font-bold">Students &amp; payments</h1>
      <form className="mt-6 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Search name, email, organisation or course" className="input max-w-sm" />
        <select name="status" defaultValue={status} className="input w-auto">
          {STATUSES.map((s) => <option key={s} value={s}>{s === "all" ? "All statuses" : s}</option>)}
        </select>
        <button className="btn-primary">Filter</button>
      </form>
      <p className="mt-3 text-sm text-slate-500">
        {rows.length} registrations · {formatMYR(rows.filter((r) => r.payment_status === "paid").reduce((s, r) => s + Number(r.amount_myr), 0))} paid
      </p>
      <div className="card mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">Student</th>
              <th className="px-4 py-2">Course</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Registered</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">{r.profile?.full_name || "—"}</p>
                  <p className="text-xs text-slate-500">{r.profile?.email}{r.profile?.phone ? ` · ${r.profile.phone}` : ""}</p>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/courses/${r.course_id}`} className="text-brand-700 hover:underline">{r.course?.title}</Link>
                  <p className="text-xs text-slate-500">{formatDate(r.course?.start_date)}</p>
                </td>
                <td className="px-4 py-3">{formatMYR(r.amount_myr)}</td>
                <td className="px-4 py-3"><PaymentBadge status={r.payment_status} /></td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(r.created_at)}</td>
                <td className="px-4 py-3">
                  {r.payment_status !== "paid" && (
                    <form action={setPaymentStatus}>
                      <input type="hidden" name="enrollmentId" value={r.id} />
                      <button name="status" value="paid" className="btn-outline px-2 py-1 text-xs">Mark paid</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No matching registrations.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
