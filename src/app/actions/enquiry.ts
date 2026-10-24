"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function submitEnquiry(formData: FormData) {
  const field = (k: string) => String(formData.get(k) ?? "").trim();
  const enquiry = {
    name: field("name"),
    email: field("email"),
    phone: field("phone") || null,
    organisation: field("organisation") || null,
    topic: field("topic") || null,
    message: field("message"),
  };
  if (!enquiry.name || !enquiry.email || !enquiry.message) {
    redirect("/contact?error=" + encodeURIComponent("Please fill in your name, email and message."));
  }

  const supabase = await createClient();
  const { error } = await supabase.from("enquiries").insert(enquiry);
  if (error) redirect("/contact?error=" + encodeURIComponent("Sorry, something went wrong. Please email us instead."));
  redirect("/contact?sent=1");
}
