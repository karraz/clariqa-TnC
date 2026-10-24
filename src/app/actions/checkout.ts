"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { isStripeConfigured, siteUrl } from "@/lib/env";
import type { Course, Enrollment } from "@/lib/types";

export async function startCheckout(formData: FormData) {
  const courseId = String(formData.get("courseId") ?? "");
  const admin = createAdminClient();

  const { data: courseRow } = await admin.from("courses").select("*").eq("id", courseId).maybeSingle();
  const course = courseRow as Course | null;
  if (!course) redirect("/courses");

  const slug = course.slug;
  function back(error: string): never {
    redirect(`/courses/${slug}?error=${encodeURIComponent(error)}`);
  }

  const current = await getCurrentUser();
  if (!current) redirect(`/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`);
  const { user } = current;

  if (course.status !== "published") back("Registration for this course is closed.");

  const { data: existingRow } = await admin
    .from("enrollments")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .maybeSingle();
  const existing = existingRow as Enrollment | null;
  if (existing?.payment_status === "paid") redirect(`/dashboard/courses/${course.id}`);

  if (course.seats) {
    const { data: taken } = await admin.rpc("seats_taken", { p_course_id: course.id });
    if ((taken ?? 0) >= course.seats) back("Sorry, this course is fully booked.");
  }

  const price = Number(course.price_myr);
  const { data: enrollmentRow, error } = await admin
    .from("enrollments")
    .upsert(
      {
        user_id: user.id,
        course_id: course.id,
        payment_status: price === 0 ? "paid" : "pending",
        payment_method: price === 0 ? "free" : null,
        paid_at: price === 0 ? new Date().toISOString() : null,
        amount_myr: price,
      },
      { onConflict: "user_id,course_id" },
    )
    .select()
    .single();
  if (error || !enrollmentRow) back("Could not create your registration. Please try again.");
  const enrollment = enrollmentRow as Enrollment;

  if (price === 0) redirect(`/dashboard/courses/${course.id}`);
  if (!isStripeConfigured()) back("Online payment is not available yet. Please contact us to register.");

  // Payment methods (FPX, card, GrabPay…) come from the Stripe dashboard settings.
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    currency: "myr",
    customer_email: user.email,
    client_reference_id: enrollment.id,
    metadata: { enrollment_id: enrollment.id, course_id: course.id, user_id: user.id },
    payment_intent_data: { metadata: { enrollment_id: enrollment.id, course_id: course.id } },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "myr",
          unit_amount: Math.round(price * 100),
          product_data: { name: course.title, description: course.summary ?? undefined },
        },
      },
    ],
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout/cancel?course=${course.slug}`,
  });

  await admin.from("enrollments").update({ stripe_session_id: session.id }).eq("id", enrollment.id);
  redirect(session.url!);
}
