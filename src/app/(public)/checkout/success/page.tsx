import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Payment received" };

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-3xl">✓</div>
      <h1 className="mt-6 text-3xl font-bold">Thank you for registering!</h1>
      <p className="mt-3 text-slate-600">
        Your payment is being confirmed. Card payments are confirmed instantly; FPX payments can take a few minutes. Your
        course will show as <strong>paid</strong> in your portal once confirmed, and the materials will unlock.
      </p>
      <Link href="/dashboard" className="btn-primary mt-8">
        Go to my courses
      </Link>
    </div>
  );
}
