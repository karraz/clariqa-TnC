import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SetupNotice } from "@/components/setup-notice";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SetupNotice />
      <SiteHeader />
      <main className="min-h-[60vh]">{children}</main>
      <SiteFooter />
    </>
  );
}

// Pages depend on the signed-in user and live data.
export const dynamic = "force-dynamic";
