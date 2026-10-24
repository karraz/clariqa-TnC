import type Stripe from "stripe";
import type { PaymentStatus } from "@/lib/types";

export interface EnrollmentUpdate {
  enrollmentId: string;
  fields: {
    payment_status: PaymentStatus;
    stripe_payment_intent?: string | null;
    payment_method?: string | null;
    paid_at?: string | null;
  };
}

/**
 * Maps a Stripe webhook event to the enrollment change it implies, or null if
 * the event is irrelevant. FPX and other delayed methods complete with
 * payment_status "unpaid" and settle later via async_payment_succeeded/failed.
 */
export function enrollmentUpdateFromEvent(event: Stripe.Event, now = new Date()): EnrollmentUpdate | null {
  if (!event.type.startsWith("checkout.session.")) return null;

  const session = event.data.object as Stripe.Checkout.Session;
  const enrollmentId = session.metadata?.enrollment_id ?? session.client_reference_id;
  if (!enrollmentId) return null;

  const paymentIntent =
    typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);
  const paid = { payment_status: "paid" as const, stripe_payment_intent: paymentIntent, paid_at: now.toISOString() };

  switch (event.type) {
    case "checkout.session.completed":
      return session.payment_status === "paid" ? { enrollmentId, fields: paid } : null;
    case "checkout.session.async_payment_succeeded":
      return { enrollmentId, fields: paid };
    case "checkout.session.async_payment_failed":
      return { enrollmentId, fields: { payment_status: "failed", stripe_payment_intent: paymentIntent } };
    default:
      return null;
  }
}
