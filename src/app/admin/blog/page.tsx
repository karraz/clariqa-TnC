import Link from "next/link";
import { StatusBadge } from "@/components/badges";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import type { Post } from "@/lib/types";

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("id, slug, title, status, published_at, created_at, tags")
    .order("created_at", { ascending: false });
  const posts = (data ?? []) as Post[];

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Blog</h1>
        <Link href="/admin/blog/new" className="btn-primary">+ New post</Link>
      </div>
      <ul className="card mt-6 divide-y divide-slate-100">
        {posts.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <Link href={`/admin/blog/${p.id}`} className="font-medium text-brand-700 hover:underline">{p.title}</Link>
              <p className="text-xs text-slate-500">
                {p.status === "published" ? `Published ${formatDate(p.published_at)}` : `Created ${formatDate(p.created_at)}`}
                {p.tags.length > 0 && ` · ${p.tags.join(", ")}`}
              </p>
            </div>
            <StatusBadge status={p.status} />
          </li>
        ))}
        {posts.length === 0 && <li className="p-8 text-center text-slate-500">No posts yet.</li>}
      </ul>
    </>
  );
}
