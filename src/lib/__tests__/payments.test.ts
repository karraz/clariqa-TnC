import { describe, expect, it } from "vitest";
import type Stripe from "stripe";
import { enrollmentUpdateFromEvent } from "@/lib/payments";

function event(type: string, session: Partial<Stripe.Checkout.Session>) {
  return { type, data: { object: session } } as unknown as Stripe.Event;
}

const now = new Date("2026-01-01T00:00:00Z");

describe("enrollmentUpdateFromEvent", () => {
  it("marks a card payment as paid on checkout.session.completed", () => {
    const update = enrollmentUpdateFromEvent(
      event("checkout.session.completed", {
        payment_status: "paid",
        payment_intent: "pi_123",
        metadata: { enrollment_id: "enr_1" },
      }),
      now,
    );
    expect(update).toEqual({
      enrollmentId: "enr_1",
      fields: { payment_status: "paid", stripe_payment_intent: "pi_123", paid_at: now.toISOString() },
    });
  });

  it("waits for async settlement when FPX completes unpaid", () => {
    const update = enrollmentUpdateFromEvent(
      event("checkout.session.completed", { payment_status: "unpaid", metadata: { enrollment_id: "enr_1" } }),
    );
    expect(update).toBeNull();
  });

  it("marks paid on async_payment_succeeded, using client_reference_id as fallback", () => {
    const update = enrollmentUpdateFromEvent(
      event("checkout.session.async_payment_succeeded", { client_reference_id: "enr_2", payment_intent: null }),
      now,
    );
    expect(update?.enrollmentId).toBe("enr_2");
    expect(update?.fields.payment_status).toBe("paid");
  });

  it("marks failed on async_payment_failed", () => {
    const update = enrollmentUpdateFromEvent(
      event("checkout.session.async_payment_failed", { metadata: { enrollment_id: "enr_3" } }),
    );
    expect(update?.fields.payment_status).toBe("failed");
  });

  it("ignores unrelated events and sessions without an enrollment", () => {
    expect(enrollmentUpdateFromEvent(event("invoice.paid", {}))).toBeNull();
    expect(enrollmentUpdateFromEvent(event("checkout.session.completed", { payment_status: "paid" }))).toBeNull();
  });
});
