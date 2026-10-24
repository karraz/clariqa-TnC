import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { Profile } from "@/lib/types";

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return { user, profile: profile as Profile | null };
}

export async function requireUser(next = "/dashboard") {
  const current = await getCurrentUser();
  if (!current) redirect(`/login?next=${encodeURIComponent(next)}`);
  return current;
}

export async function requireAdmin() {
  const current = await requireUser("/admin");
  if (current.profile?.role !== "admin") redirect("/dashboard");
  return current;
}
