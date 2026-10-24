import { isSupabaseConfigured } from "@/lib/env";

/** Shown while the site is not yet connected to Supabase, so a fresh checkout still renders. */
export function SetupNotice() {
  if (isSupabaseConfigured()) return null;
  return (
    <div className="bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
      Demo mode: connect Supabase in <code>.env.local</code> to load courses, blog posts and logins. See README.
    </div>
  );
}
