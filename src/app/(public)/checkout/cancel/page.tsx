import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Payment cancelled" };

export default async function CheckoutCancelPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const { course } = await searchParams;
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">Payment not completed</h1>
      <p className="mt-3 text-slate-600">
        No money was taken. Your seat is not reserved until payment is completed. You can try again at any time from
        the course page or your portal.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        {course && (
          <Link href={`/courses/${course}`} className="btn-primary">
            Try again
          </Link>
        )}
        <Link href="/contact" className="btn-outline">
          Pay by bank transfer instead
        </Link>
      </div>
    </div>
  );
}
