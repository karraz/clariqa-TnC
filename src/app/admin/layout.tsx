import { PortalShell } from "@/components/portal-shell";
import { requireAdmin } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/courses", label: "Courses & materials" },
  { href: "/admin/students", label: "Students & payments" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/enquiries", label: "Enquiries" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireAdmin();
  return (
    <PortalShell title="Admin portal" nav={NAV} userName={profile?.full_name || user.email || ""}>
      {children}
    </PortalShell>
  );
}

// Pages depend on the signed-in user and live data.
export const dynamic = "force-dynamic";
