import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import type { EnrollmentRow } from "@/lib/admin-stats";
import { createClient } from "@/lib/supabase/server";

function csvCell(value: unknown) {
  const s = String(value ?? "");
  // Quote everything; neutralise spreadsheet formula injection.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const current = await getCurrentUser();
  if (current?.profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const supabase = await createClient();
  const [{ data: course }, { data }] = await Promise.all([
    supabase.from("courses").select("slug").eq("id", id).single(),
    supabase
      .from("enrollments")
      .select("*, profile:profiles(full_name, email, phone, organisation)")
      .eq("course_id", id)
      .order("created_at"),
  ]);

  const header = ["Name", "Email", "Phone", "Organisation", "Status", "Method", "Amount (MYR)", "Paid at", "Registered at"];
  const lines = ((data ?? []) as EnrollmentRow[]).map((r) =>
    [
      r.profile?.full_name,
      r.profile?.email,
      r.profile?.phone,
      r.profile?.organisation,
      r.payment_status,
      r.payment_method,
      r.amount_myr,
      r.paid_at,
      r.created_at,
    ]
      .map(csvCell)
      .join(","),
  );

  return new NextResponse([header.map(csvCell).join(","), ...lines].join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${course?.slug ?? "course"}-participants.csv"`,
    },
  });
}
