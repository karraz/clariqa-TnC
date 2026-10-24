import type { PaymentStatus } from "@/lib/types";

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  paid: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-slate-200 text-slate-700",
};

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${PAYMENT_STYLES[status]}`}>
      {status}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">{category}</span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const style =
    status === "published"
      ? "bg-emerald-100 text-emerald-800"
      : status === "closed"
        ? "bg-slate-200 text-slate-700"
        : "bg-amber-100 text-amber-800";
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${style}`}>{status}</span>;
}
