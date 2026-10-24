"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/format";
import type { PaymentStatus } from "@/lib/types";

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const optional = (fd: FormData, key: string) => text(fd, key) || null;

function fileFrom(fd: FormData, key: string) {
  const file = fd.get(key);
  return file instanceof File && file.size > 0 ? file : null;
}

async function uploadPublicImage(file: File, folder: string) {
  const admin = createAdminClient();
  const path = `${folder}/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${file.name.split(".").pop()}`;
  const { error } = await admin.storage.from("public-images").upload(path, file, { contentType: file.type });
  if (error) throw new Error(error.message);
  return admin.storage.from("public-images").getPublicUrl(path).data.publicUrl;
}

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------
export async function saveCourse(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = text(formData, "id");
  const title = text(formData, "title");

  const course: Record<string, unknown> = {
    title,
    slug: slugify(text(formData, "slug") || title),
    category: text(formData, "category"),
    summary: optional(formData, "summary"),
    description_md: optional(formData, "description_md"),
    price_myr: Number(text(formData, "price_myr") || 0),
    start_date: optional(formData, "start_date"),
    end_date: optional(formData, "end_date"),
    mode: text(formData, "mode"),
    venue: optional(formData, "venue"),
    seats: text(formData, "seats") ? Number(text(formData, "seats")) : null,
    status: text(formData, "status"),
  };
  const cover = fileFrom(formData, "cover");
  if (cover) course.cover_url = await uploadPublicImage(cover, "courses");

  const { data, error } = id
    ? await supabase.from("courses").update(course).eq("id", id).select("id").single()
    : await supabase.from("courses").insert(course).select("id").single();
  if (error) {
    const msg = error.code === "23505" ? "That URL slug is already used by another course." : error.message;
    redirect(`/admin/courses/${id || "new"}?error=${encodeURIComponent(msg)}`);
  }

  revalidatePath("/", "layout");
  redirect(`/admin/courses/${data.id}?saved=1`);
}

export async function deleteCourse(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = text(formData, "id");
  const { count } = await supabase
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("course_id", id)
    .eq("payment_status", "paid");
  if (count) {
    redirect(`/admin/courses/${id}?error=${encodeURIComponent("This course has paid students. Set it to Closed instead of deleting.")}`);
  }
  await supabase.from("courses").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/courses");
}

// ---------------------------------------------------------------------------
// Enrollments / payments
// ---------------------------------------------------------------------------
export async function setPaymentStatus(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const status = text(formData, "status") as PaymentStatus;
  const update: Record<string, unknown> = { payment_status: status };
  if (status === "paid") {
    update.paid_at = new Date().toISOString();
    update.payment_method = optional(formData, "method") ?? "manual";
  }
  await supabase.from("enrollments").update(update).eq("id", text(formData, "enrollmentId"));
  revalidatePath("/admin", "layout");
}

/** Registers an existing student account for a course, e.g. after a bank transfer or HRD Corp claim. */
export async function addManualEnrollment(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const courseId = text(formData, "courseId");
  const email = text(formData, "email").toLowerCase();
  const back = (msg: string) => redirect(`/admin/courses/${courseId}?error=${encodeURIComponent(msg)}#participants`);

  const [{ data: profile }, { data: course }] = await Promise.all([
    supabase.from("profiles").select("id").ilike("email", email).maybeSingle(),
    supabase.from("courses").select("price_myr").eq("id", courseId).single(),
  ]);
  if (!profile) back("No account with that email. Ask the participant to register on the website first.");

  const paid = text(formData, "status") === "paid";
  const { error } = await supabase.from("enrollments").upsert(
    {
      user_id: profile!.id,
      course_id: courseId,
      payment_status: paid ? "paid" : "pending",
      payment_method: paid ? text(formData, "method") || "bank transfer" : null,
      paid_at: paid ? new Date().toISOString() : null,
      amount_myr: Number(text(formData, "amount") || course?.price_myr || 0),
    },
    { onConflict: "user_id,course_id" },
  );
  if (error) back(error.message);
  revalidatePath("/admin", "layout");
  redirect(`/admin/courses/${courseId}?saved=1#participants`);
}

// ---------------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------------
export async function addMaterial(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const courseId = text(formData, "courseId");
  const file = fileFrom(formData, "file");
  const externalUrl = optional(formData, "external_url");
  const back = (q: string) => redirect(`/admin/courses/${courseId}?${q}#materials`);
  if (!file && !externalUrl) back("error=" + encodeURIComponent("Choose a file or enter a link."));

  let filePath: string | null = null;
  if (file) {
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    filePath = `${courseId}/${Date.now()}-${safeName}`;
    const { error } = await createAdminClient()
      .storage.from("course-materials")
      .upload(filePath, file, { contentType: file.type || "application/octet-stream" });
    if (error) back("error=" + encodeURIComponent(`Upload failed: ${error.message}`));
  }

  const { count } = await supabase.from("materials").select("id", { count: "exact", head: true }).eq("course_id", courseId);
  await supabase.from("materials").insert({
    course_id: courseId,
    title: text(formData, "title") || file?.name || "Material",
    description: optional(formData, "description"),
    file_path: filePath,
    external_url: externalUrl,
    sort_order: count ?? 0,
  });
  revalidatePath(`/admin/courses/${courseId}`);
  back("saved=1");
}

export async function deleteMaterial(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = text(formData, "id");
  const { data: material } = await supabase.from("materials").select("course_id, file_path").eq("id", id).single();
  if (material?.file_path) await createAdminClient().storage.from("course-materials").remove([material.file_path]);
  await supabase.from("materials").delete().eq("id", id);
  if (material) revalidatePath(`/admin/courses/${material.course_id}`);
}

export async function moveMaterial(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const courseId = text(formData, "courseId");
  const id = text(formData, "id");
  const direction = text(formData, "direction") === "up" ? -1 : 1;

  const { data } = await supabase.from("materials").select("id").eq("course_id", courseId).order("sort_order").order("created_at");
  const ids = (data ?? []).map((m) => m.id as string);
  const from = ids.indexOf(id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= ids.length) return;
  [ids[from], ids[to]] = [ids[to], ids[from]];
  await Promise.all(ids.map((mid, i) => supabase.from("materials").update({ sort_order: i }).eq("id", mid)));
  revalidatePath(`/admin/courses/${courseId}`);
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------
export async function savePost(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = text(formData, "id");
  const title = text(formData, "title");
  const status = text(formData, "status") as "draft" | "published";

  const post: Record<string, unknown> = {
    title,
    slug: slugify(text(formData, "slug") || title),
    excerpt: optional(formData, "excerpt"),
    body_md: optional(formData, "body_md"),
    tags: text(formData, "tags")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean),
    status,
  };
  if (status === "published") {
    const { data: existing } = id
      ? await supabase.from("posts").select("published_at").eq("id", id).single()
      : { data: null };
    post.published_at = existing?.published_at ?? new Date().toISOString();
  }
  const cover = fileFrom(formData, "cover");
  if (cover) post.cover_url = await uploadPublicImage(cover, "blog");

  const { data, error } = id
    ? await supabase.from("posts").update(post).eq("id", id).select("id").single()
    : await supabase.from("posts").insert(post).select("id").single();
  if (error) {
    const msg = error.code === "23505" ? "That URL slug is already used by another post." : error.message;
    redirect(`/admin/blog/${id || "new"}?error=${encodeURIComponent(msg)}`);
  }
  revalidatePath("/", "layout");
  redirect(`/admin/blog/${data.id}?saved=1`);
}

export async function deletePost(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("posts").delete().eq("id", text(formData, "id"));
  revalidatePath("/", "layout");
  redirect("/admin/blog");
}

// ---------------------------------------------------------------------------
// Enquiries
// ---------------------------------------------------------------------------
export async function toggleEnquiry(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("enquiries")
    .update({ handled: text(formData, "handled") !== "true" })
    .eq("id", text(formData, "id"));
  revalidatePath("/admin/enquiries");
}
