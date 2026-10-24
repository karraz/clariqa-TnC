import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Markdown } from "@/components/markdown";
import { getPostBySlug } from "@/lib/data";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug);
  return { title: post?.title ?? "Blog", description: post?.excerpt ?? undefined };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug((await params).slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/blog" className="text-sm text-brand-600 hover:underline">
        ← All posts
      </Link>
      <p className="mt-6 text-sm text-slate-500">{formatDate(post.published_at)}</p>
      <h1 className="mt-1 text-4xl font-bold leading-tight">{post.title}</h1>
      {post.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.cover_url} alt="" className="mt-6 w-full rounded-xl object-cover" />
      )}
      <div className="mt-8">
        <Markdown>{post.body_md}</Markdown>
      </div>
      <div className="card mt-12 p-6">
        <p className="font-semibold">Want to learn this hands-on?</p>
        <p className="mt-1 text-sm text-slate-600">Join one of our upcoming courses.</p>
        <Link href="/courses" className="btn-primary mt-4">
          Browse courses
        </Link>
      </div>
    </article>
  );
}
