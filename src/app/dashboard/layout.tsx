import { PortalShell } from "@/components/portal-shell";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireUser();
  const nav = [
    { href: "/dashboard", label: "My courses" },
    { href: "/courses", label: "Browse courses" },
    { href: "/dashboard/profile", label: "Profile" },
  ];
  if (profile?.role === "admin") nav.push({ href: "/admin", label: "Admin portal" });

  return (
    <PortalShell title="Student portal" nav={nav} userName={profile?.full_name || user.email || ""}>
      {children}
    </PortalShell>
  );
}

// Pages depend on the signed-in user and live data.
export const dynamic = "force-dynamic";
