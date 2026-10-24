import Link from "next/link";
import { startCheckout } from "@/app/actions/checkout";
import { PaymentBadge } from "@/components/badges";
import { SubmitButton } from "@/components/submit-button";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDateRange, formatMYR } from "@/lib/format";
import type { Course, Enrollment } from "@/lib/types";

type Row = Enrollment & { course: Course };

export default async function DashboardPage() {
  const { user, profile } = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("enrollments")
    .select("*, course:courses(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as Row[];

  return (
    <>
      <h1 className="text-3xl font-bold">Welcome, {profile?.full_name?.split(" ")[0] || "there"}</h1>
      <p className="mt-1 text-slate-600">Your registered courses and their materials.</p>

      {rows.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="text-slate-600">You have not registered for any course yet.</p>
          <Link href="/courses" className="btn-primary mt-4">Browse upcoming courses</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {rows.map(({ course, ...enrollment }) => (
            <div key={enrollment.id} className="card flex flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold leading-snug">{course.title}</h2>
                <PaymentBadge status={enrollment.payment_status} />
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {formatDateRange(course.start_date, course.end_date)} · <span className="capitalize">{course.mode}</span>
                {course.venue ? ` · ${course.venue}` : ""}
              </p>
              <div className="mt-auto pt-5">
                {enrollment.payment_status === "paid" ? (
                  <Link href={`/dashboard/courses/${course.id}`} className="btn-primary">Open course materials</Link>
                ) : (
                  <form action={startCheckout} className="flex items-center gap-3">
                    <input type="hidden" name="courseId" value={course.id} />
                    <SubmitButton className="btn-accent" pendingText="Redirecting…">
                      Complete payment · {formatMYR(enrollment.amount_myr)}
                    </SubmitButton>
                    <span className="text-xs text-slate-500">Materials unlock after payment.</span>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
