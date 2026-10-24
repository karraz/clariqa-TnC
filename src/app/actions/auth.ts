"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, siteUrl } from "@/lib/env";

function safeNext(value: FormDataEntryValue | null, fallback = "/dashboard") {
  const next = String(value ?? "");
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

function fail(path: string, message: string, next?: string): never {
  const params = new URLSearchParams({ error: message });
  if (next) params.set("next", next);
  redirect(`${path}?${params}`);
}

export async function signIn(formData: FormData) {
  const next = safeNext(formData.get("next"), "");
  if (!isSupabaseConfigured()) fail("/login", "Login is not configured yet.", next);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) fail("/login", "Incorrect email or password.", next);

  if (next) redirect(next);
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
  redirect(profile?.role === "admin" ? "/admin" : "/dashboard");
}

export async function signUp(formData: FormData) {
  const next = safeNext(formData.get("next"));
  if (!isSupabaseConfigured()) fail("/register", "Registration is not configured yet.", next);

  const password = String(formData.get("password") ?? "");
  if (password.length < 8) fail("/register", "Password must be at least 8 characters.", next);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get("email") ?? ""),
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      data: {
        full_name: String(formData.get("full_name") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        organisation: String(formData.get("organisation") ?? ""),
      },
    },
  });
  if (error) fail("/register", error.message, next);

  // With email confirmation off, Supabase signs the user in straight away.
  if (data.session) redirect(next);
  redirect("/login?message=" + encodeURIComponent("Check your email to confirm your account, then log in."));
}

export async function requestPasswordReset(formData: FormData) {
  if (!isSupabaseConfigured()) fail("/forgot-password", "Not configured yet.");
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(String(formData.get("email") ?? ""), {
    redirectTo: `${siteUrl}/auth/callback?next=/dashboard/profile`,
  });
  redirect("/forgot-password?sent=1");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
