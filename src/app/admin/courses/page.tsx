import Link from "next/link";
import { StatusBadge } from "@/components/badges";
import { createClient } from "@/lib/supabase/server";
import { formatDateRange, formatMYR } from "@/lib/format";
import type { Course } from "@/lib/types";

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const [{ data: courses }, { data: enrollments }] = await Promise.all([
    supabase.from("courses").select("*").order("start_date", { ascending: false, nullsFirst: true }),
    supabase.from("enrollments").select("course_id, payment_status"),
  ]);
  const counts = (courseId: string, status: string) =>
    (enrollments ?? []).filter((e) => e.course_id === courseId && e.payment_status === status).length;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Courses</h1>
        <Link href="/admin/courses/new" className="btn-primary">+ New course</Link>
      </div>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Course</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Paid</th>
              <th className="px-5 py-3">Pending</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {((courses ?? []) as Course[]).map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <Link href={`/admin/courses/${c.id}`} className="font-medium text-brand-700 hover:underline">{c.title}</Link>
                  <p className="text-xs text-slate-500">{c.category}</p>
                </td>
                <td className="px-5 py-3 whitespace-nowrap">{formatDateRange(c.start_date, c.end_date)}</td>
                <td className="px-5 py-3">{formatMYR(c.price_myr)}</td>
                <td className="px-5 py-3">{counts(c.id, "paid")}{c.seats ? ` / ${c.seats}` : ""}</td>
                <td className="px-5 py-3">{counts(c.id, "pending")}</td>
                <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
              </tr>
            ))}
            {!courses?.length && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">No courses yet. Create your first one.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
