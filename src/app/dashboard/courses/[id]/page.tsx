import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDateRange } from "@/lib/format";
import type { Course, Enrollment, Material } from "@/lib/types";

export default async function StudentCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await requireUser();
  const supabase = await createClient();

  const [{ data: enrollment }, { data: course }, { data: materials }] = await Promise.all([
    supabase.from("enrollments").select("*").eq("course_id", id).eq("user_id", user.id).maybeSingle(),
    supabase.from("courses").select("*").eq("id", id).maybeSingle(),
    // RLS only returns materials when this user has a paid enrollment.
    supabase.from("materials").select("*").eq("course_id", id).order("sort_order").order("created_at"),
  ]);
  if (!course) notFound();
  if ((enrollment as Enrollment | null)?.payment_status !== "paid") redirect("/dashboard");

  const c = course as Course;
  const items = (materials ?? []) as Material[];

  return (
    <>
      <Link href="/dashboard" className="text-sm text-brand-600 hover:underline">← My courses</Link>
      <h1 className="mt-3 text-3xl font-bold">{c.title}</h1>
      <p className="mt-1 text-slate-600">
        {formatDateRange(c.start_date, c.end_date)} · <span className="capitalize">{c.mode}</span>
        {c.venue ? ` · ${c.venue}` : ""}
      </p>

      <h2 className="mt-10 text-xl font-semibold">Course materials</h2>
      {items.length === 0 ? (
        <p className="card mt-4 p-8 text-center text-slate-600">
          Materials will appear here before the course starts. Check back soon.
        </p>
      ) : (
        <ul className="card mt-4 divide-y divide-slate-100">
          {items.map((m) => (
            <li key={m.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{m.title}</p>
                {m.description && <p className="text-sm text-slate-600">{m.description}</p>}
                <p className="text-xs text-slate-400">Added {formatDate(m.created_at)}</p>
              </div>
              <div className="flex gap-2">
                {m.file_path && (
                  <a href={`/dashboard/materials/${m.id}`} className="btn-primary">Download</a>
                )}
                {m.external_url && (
                  <a href={m.external_url} target="_blank" rel="noopener noreferrer" className="btn-outline">Open link</a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
