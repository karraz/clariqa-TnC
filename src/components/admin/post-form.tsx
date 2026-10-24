"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { savePost } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import type { Post } from "@/lib/types";

export function PostForm({ post }: { post?: Post }) {
  const [body, setBody] = useState(post?.body_md ?? "");
  const [preview, setPreview] = useState(false);

  return (
    <form action={savePost} className="card space-y-4 p-6">
      {post && <input type="hidden" name="id" value={post.id} />}
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <div>
          <label className="label" htmlFor="title">Title</label>
          <input className="input" id="title" name="title" defaultValue={post?.title} required />
        </div>
        <div>
          <label className="label" htmlFor="slug">URL slug (optional)</label>
          <input className="input" id="slug" name="slug" defaultValue={post?.slug} placeholder="auto from title" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="excerpt">Excerpt (shown in lists and search results)</label>
        <textarea className="input" id="excerpt" name="excerpt" rows={2} defaultValue={post?.excerpt ?? ""} />
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="label mb-0" htmlFor="body_md">Body (Markdown)</label>
          <button type="button" onClick={() => setPreview((p) => !p)} className="text-sm font-medium text-brand-600">
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
        <textarea
          className={`input min-h-80 font-mono ${preview ? "hidden" : ""}`}
          id="body_md"
          name="body_md"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        {preview && (
          <div className="prose prose-slate min-h-80 max-w-none rounded-lg border border-slate-200 p-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{body || "_Nothing to preview yet._"}</ReactMarkdown>
          </div>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="tags">Tags (comma separated)</label>
          <input className="input" id="tags" name="tags" defaultValue={post?.tags.join(", ")} placeholder="spss, statistics" />
        </div>
        <div>
          <label className="label" htmlFor="cover">Cover image</label>
          <input className="input" id="cover" name="cover" type="file" accept="image/*" />
        </div>
        <div>
          <label className="label" htmlFor="status">Status</label>
          <select className="input" id="status" name="status" defaultValue={post?.status ?? "draft"}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>
      <SubmitButton pendingText="Saving…">{post ? "Save post" : "Create post"}</SubmitButton>
    </form>
  );
}
