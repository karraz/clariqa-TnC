import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { Course, Post } from "@/lib/types";

export async function getUpcomingCourses(opts: { category?: string; limit?: number } = {}) {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  let query = supabase
    .from("courses")
    .select("*")
    .eq("status", "published")
    .order("start_date", { ascending: true, nullsFirst: false });
  if (opts.category) query = query.eq("category", opts.category);
  if (opts.limit) query = query.limit(opts.limit);
  const { data } = await query;
  return (data ?? []) as Course[];
}

export async function getCourseBySlug(slug: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("courses").select("*").eq("slug", slug).maybeSingle();
  return data as Course | null;
}

export async function getSeatsTaken(courseId: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("seats_taken", { p_course_id: courseId });
  return (data as number | null) ?? 0;
}

export async function getPublishedPosts(limit?: number) {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select("id, slug, title, excerpt, cover_url, tags, published_at, status, created_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data } = await query;
  return (data ?? []) as Post[];
}

export async function getPostBySlug(slug: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("*").eq("slug", slug).maybeSingle();
  return data as Post | null;
}
