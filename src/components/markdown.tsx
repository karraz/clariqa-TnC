import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string | null | undefined }) {
  if (!children) return null;
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-brand-600">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
