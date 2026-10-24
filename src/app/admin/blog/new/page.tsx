import Link from "next/link";
import { PostForm } from "@/components/admin/post-form";
import { Flash } from "@/components/flash";

export default async function NewPostPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <>
      <Link href="/admin/blog" className="text-sm text-brand-600 hover:underline">← Blog</Link>
      <h1 className="mt-3 mb-6 text-3xl font-bold">New blog post</h1>
      <div className="mb-4"><Flash error={error} /></div>
      <PostForm />
    </>
  );
}
