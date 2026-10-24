import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About us" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-bold">About Clariqa</h1>
      <div className="prose prose-slate mt-6 max-w-none">
        <p>
          Clariqa Training &amp; Consultancy helps researchers, postgraduate students and organisations get clear
          answers from their data. We run practical, hands-on training in SPSS, statistics, R, Python, Excel and Power
          BI, and we show you how to use AI tools such as ChatGPT, Claude and Copilot responsibly in analysis.
        </p>
        <h2>What we offer</h2>
        <ul>
          <li><strong>Public courses</strong>: open registration with online payment.</li>
          <li><strong>In-house training</strong>: customised programmes for universities, agencies and companies (HRD Corp claimable).</li>
          <li><strong>Research consultancy</strong>: help with research design, data analysis and reporting.</li>
        </ul>
        <h2>How we teach</h2>
        <p>
          Every session uses real datasets. You leave with slides, datasets, syntax and scripts available in your
          student portal.
        </p>
      </div>
      <Link href="/contact" className="btn-primary mt-8">
        Get in touch
      </Link>
    </div>
  );
}
