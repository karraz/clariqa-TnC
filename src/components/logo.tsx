import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
          <path d="M4 19V11M10 19V5M16 19v-6M22 19H2" strokeLinecap="round" />
        </svg>
      </span>
      <span className="leading-tight">
        Clariqa
        <span className="block text-[10px] font-medium uppercase tracking-widest text-slate-500">
          Training &amp; Consultancy
        </span>
      </span>
    </Link>
  );
}
