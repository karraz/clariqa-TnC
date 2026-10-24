import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-bold">Blog</h1>
      <p className="mt-2 text-slate-600">Tips and guides on statistics, data analysis tools and AI for research.</p>
      <div className="mt-10 space-y-6">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="card flex flex-col gap-4 p-6 hover:border-brand-200 sm:flex-row">
            {post.cover_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.cover_url} alt="" className="h-32 w-full rounded-lg object-cover sm:w-48" />
            )}
            <div>
              <p className="text-xs text-slate-500">
                {formatDate(post.published_at)}
                {post.tags.length > 0 && <> · {post.tags.join(", ")}</>}
              </p>
              <h2 className="mt-1 text-xl font-semibold">{post.title}</h2>
              <p className="mt-2 text-slate-600">{post.excerpt}</p>
            </div>
          </Link>
        ))}
        {posts.length === 0 && <p className="card p-8 text-center text-slate-600">No posts yet.</p>}
      </div>
    </div>
  );
}
