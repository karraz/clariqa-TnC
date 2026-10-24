import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { enrollmentUpdateFromEvent } from "@/lib/payments";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const update = enrollmentUpdateFromEvent(event);
  if (!update) return NextResponse.json({ received: true });

  const session = event.data.object as Stripe.Checkout.Session;
  const fields = { ...update.fields, payment_method: session.payment_method_types?.[0] ?? null };

  // Never touch an already-paid enrollment: re-delivered success events keep the
  // original paid_at, and a late failure from an abandoned retry cannot undo a payment.
  const { error } = await createAdminClient()
    .from("enrollments")
    .update(fields)
    .eq("id", update.enrollmentId)
    .neq("payment_status", "paid");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ received: true });
}
