import Link from "next/link";
import { PaymentBadge } from "@/components/badges";
import { EnrolmentsByCategoryChart, PaidVsPendingChart, RevenueByMonthChart } from "@/components/charts";
import { buildDashboardStats, type EnrollmentRow } from "@/lib/admin-stats";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatMYR } from "@/lib/format";
import type { Course } from "@/lib/types";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const [{ data: enrollments }, { data: courses }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("*, course:courses(id, title, category, start_date, status), profile:profiles(full_name, email, phone, organisation)")
      .order("created_at", { ascending: false }),
    supabase.from("courses").select("*"),
  ]);
  const rows = (enrollments ?? []) as EnrollmentRow[];
  const stats = buildDashboardStats(rows, (courses ?? []) as Course[]);

  const kpis = [
    { label: "Revenue collected", value: formatMYR(stats.revenue) },
    { label: "Paid registrations", value: stats.paidCount },
    { label: "Pending payments", value: stats.pendingCount, hint: `${formatMYR(stats.pendingValue)} outstanding` },
    { label: "Upcoming courses", value: stats.upcomingCount },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/admin/courses/new" className="btn-primary">+ New course</Link>
          <Link href="/admin/blog/new" className="btn-outline">+ New blog post</Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-5">
            <p className="text-sm text-slate-500">{k.label}</p>
            <p className="mt-1 text-3xl font-bold">{k.value}</p>
            {k.hint && <p className="mt-1 text-xs text-slate-500">{k.hint}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-semibold">Paid vs pending: upcoming courses</h2>
          <p className="mb-4 text-sm text-slate-500">Registrations per course</p>
          {stats.perCourse.length ? (
            <PaidVsPendingChart data={stats.perCourse} />
          ) : (
            <p className="py-10 text-center text-sm text-slate-500">No upcoming courses.</p>
          )}
        </section>
        <section className="card p-5">
          <h2 className="font-semibold">Revenue by month (MYR)</h2>
          <p className="mb-4 text-sm text-slate-500">Paid registrations, last 12 months</p>
          <RevenueByMonthChart data={stats.revenueByMonth} />
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <section className="card p-5">
          <h2 className="font-semibold">Paid students by category</h2>
          <p className="mb-4 text-sm text-slate-500">All time</p>
          {stats.byCategory.length ? (
            <EnrolmentsByCategoryChart data={stats.byCategory} />
          ) : (
            <p className="py-10 text-center text-sm text-slate-500">No paid registrations yet.</p>
          )}
        </section>
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between p-5">
            <h2 className="font-semibold">Latest registrations</h2>
            <Link href="/admin/students" className="text-sm text-brand-600 hover:underline">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-2">Student</th>
                  <th className="px-5 py-2">Course</th>
                  <th className="px-5 py-2">Amount</th>
                  <th className="px-5 py-2">Status</th>
                  <th className="px-5 py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.slice(0, 8).map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-3">{r.profile?.full_name || r.profile?.email}</td>
                    <td className="px-5 py-3">{r.course?.title}</td>
                    <td className="px-5 py-3">{formatMYR(r.amount_myr)}</td>
                    <td className="px-5 py-3"><PaymentBadge status={r.payment_status} /></td>
                    <td className="px-5 py-3 whitespace-nowrap">{formatDate(r.paid_at ?? r.created_at)}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">No registrations yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
