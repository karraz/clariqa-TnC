import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-brand-900 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-white">Clariqa Training &amp; Consultancy</p>
          <p className="mt-2 text-sm">
            Practical data analytics training for researchers, students and organisations in Malaysia.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">Explore</p>
          <ul className="mt-2 space-y-1">
            <li><Link href="/courses" className="hover:text-white">Upcoming courses</Link></li>
            <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
            <li><Link href="/contact" className="hover:text-white">In-house training</Link></li>
            <li><Link href="/login" className="hover:text-white">Student login</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">Contact</p>
          <ul className="mt-2 space-y-1">
            <li>Selangor, Malaysia</li>
            <li>hello@clariqa.com</li>
            <li>HRD Corp claimable programmes available</li>
          </ul>
        </div>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs">
        © {new Date().getFullYear()} Clariqa Training &amp; Consultancy. All rights reserved.
      </p>
    </footer>
  );
}
