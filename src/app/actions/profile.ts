"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const { user } = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: String(formData.get("full_name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim() || null,
      organisation: String(formData.get("organisation") ?? "").trim() || null,
    })
    .eq("id", user.id);
  redirect(`/dashboard/profile?${error ? "error=Could not save profile" : "saved=1"}`);
}

export async function changePassword(formData: FormData) {
  await requireUser();
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) redirect("/dashboard/profile?error=Password must be at least 8 characters");
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  redirect(`/dashboard/profile?${error ? `error=${encodeURIComponent(error.message)}` : "saved=1"}`);
}
