import Link from "next/link";
import { Logo } from "@/components/logo";
import { signOut } from "@/app/actions/auth";

export function PortalShell({
  title,
  nav,
  userName,
  children,
}: {
  title: string;
  nav: { href: string; label: string }[];
  userName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-slate-200 bg-white lg:min-h-screen lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between p-4 lg:block">
          <Logo />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 lg:mt-6">{title}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 text-sm font-medium lg:flex-col lg:pb-0">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-lg px-3 py-2 text-slate-700 hover:bg-brand-50 hover:text-brand-700">
              {item.label}
            </Link>
          ))}
          <Link href="/" className="whitespace-nowrap rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100">
            ← Public site
          </Link>
        </nav>
        <div className="hidden border-t border-slate-100 p-4 text-sm lg:mt-6 lg:block">
          <p className="truncate font-medium">{userName}</p>
          <form action={signOut}>
            <button className="mt-1 text-slate-500 hover:text-red-600">Sign out</button>
          </form>
        </div>
      </aside>
      <main className="p-4 sm:p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
        <form action={signOut} className="mt-10 lg:hidden">
          <button className="text-sm text-slate-500 hover:text-red-600">Sign out</button>
        </form>
      </main>
    </div>
  );
}
