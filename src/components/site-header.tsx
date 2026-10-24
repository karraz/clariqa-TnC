import Link from "next/link";
import { Logo } from "@/components/logo";
import { getCurrentUser } from "@/lib/auth";

const NAV = [
  { href: "/courses", label: "Courses" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export async function SiteHeader() {
  const current = await getCurrentUser();
  const isAdmin = current?.profile?.role === "admin";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-brand-600">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {current ? (
            <Link href={isAdmin ? "/admin" : "/dashboard"} className="btn-primary">
              {isAdmin ? "Admin" : "My courses"}
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-outline hidden sm:inline-flex">
                Log in
              </Link>
              <Link href="/courses" className="btn-primary">
                Browse courses
              </Link>
            </>
          )}
        </div>
      </div>
      <nav className="flex justify-center gap-5 border-t border-slate-100 py-2 text-sm font-medium text-slate-700 md:hidden">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
