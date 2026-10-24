import type { Course, Enrollment, Profile } from "@/lib/types";

export type EnrollmentRow = Enrollment & {
  course: Pick<Course, "id" | "title" | "category" | "start_date" | "status"> | null;
  profile: Pick<Profile, "full_name" | "email" | "phone" | "organisation"> | null;
};

/** Aggregates enrollments into the numbers and series shown on the admin dashboard. */
export function buildDashboardStats(rows: EnrollmentRow[], courses: Course[], today = new Date()) {
  const paid = rows.filter((r) => r.payment_status === "paid");
  const pending = rows.filter((r) => r.payment_status === "pending");
  const revenue = paid.reduce((sum, r) => sum + Number(r.amount_myr), 0);
  const pendingValue = pending.reduce((sum, r) => sum + Number(r.amount_myr), 0);

  const todayIso = today.toISOString().slice(0, 10);
  const upcoming = courses
    .filter((c) => c.status === "published" && (!c.start_date || c.start_date >= todayIso))
    .sort((a, b) => (a.start_date ?? "9999").localeCompare(b.start_date ?? "9999"));

  // Last 12 calendar months, oldest first, so empty months still show.
  const months: { key: string; month: string; revenue: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - i, 1));
    months.push({
      key: d.toISOString().slice(0, 7),
      month: d.toLocaleDateString("en-MY", { month: "short", year: "2-digit", timeZone: "UTC" }),
      revenue: 0,
    });
  }
  for (const r of paid) {
    const key = (r.paid_at ?? r.created_at).slice(0, 7);
    const m = months.find((x) => x.key === key);
    if (m) m.revenue += Number(r.amount_myr);
  }

  const perCourse = upcoming.map((c) => ({
    course: c.title.length > 28 ? `${c.title.slice(0, 27)}…` : c.title,
    paid: rows.filter((r) => r.course_id === c.id && r.payment_status === "paid").length,
    pending: rows.filter((r) => r.course_id === c.id && r.payment_status === "pending").length,
  }));

  const byCategoryMap = new Map<string, number>();
  for (const r of paid) {
    const cat = r.course?.category ?? "Other";
    byCategoryMap.set(cat, (byCategoryMap.get(cat) ?? 0) + 1);
  }
  const byCategory = [...byCategoryMap.entries()]
    .map(([category, students]) => ({ category, students }))
    .sort((a, b) => b.students - a.students);

  return {
    revenue,
    pendingValue,
    paidCount: paid.length,
    pendingCount: pending.length,
    upcomingCount: upcoming.length,
    revenueByMonth: months.map(({ month, revenue }) => ({ month, revenue })),
    perCourse,
    byCategory,
  };
}
