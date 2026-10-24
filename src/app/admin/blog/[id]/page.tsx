import Link from "next/link";
import { notFound } from "next/navigation";
import { deletePost } from "@/app/actions/admin";
import { PostForm } from "@/components/admin/post-form";
import { Flash } from "@/components/flash";
import { SubmitButton } from "@/components/submit-button";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> };

export default async function EditPostPage({ params, searchParams }: Props) {
  const [{ id }, { saved, error }] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const post = data as Post;

  return (
    <>
      <Link href="/admin/blog" className="text-sm text-brand-600 hover:underline">← Blog</Link>
      <div className="mt-3 mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Edit post</h1>
        {post.status === "published" && (
          <Link href={`/blog/${post.slug}`} target="_blank" className="btn-outline">View post ↗</Link>
        )}
      </div>
      <div className="mb-4"><Flash error={error} message={saved ? "Saved." : undefined} /></div>
      <PostForm post={post} />
      <form action={deletePost} className="mt-4">
        <input type="hidden" name="id" value={post.id} />
        <SubmitButton className="btn-danger" pendingText="Deleting…">Delete post</SubmitButton>
      </form>
    </>
  );
}
