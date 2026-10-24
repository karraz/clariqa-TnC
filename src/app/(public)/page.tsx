import Link from "next/link";
import { CourseCard } from "@/components/course-card";
import { getPublishedPosts, getUpcomingCourses } from "@/lib/data";
import { formatDate } from "@/lib/format";

const TOPICS = [
  { name: "SPSS", text: "Data entry, descriptive and inferential tests, APA-style reporting." },
  { name: "Statistics", text: "Regression, ANOVA, SEM, SmartPLS and choosing the right test." },
  { name: "R", text: "Tidyverse, ggplot2, modelling and reproducible reports." },
  { name: "Python", text: "pandas, visualisation and machine learning basics." },
  { name: "Excel", text: "PivotTables, Power Query and interactive dashboards." },
  { name: "AI", text: "Using ChatGPT, Claude and Copilot to analyse data responsibly." },
];

const TESTIMONIALS = [
  { quote: "I finally understood which test to run for my thesis. The hands-on exercises made all the difference.", who: "PhD candidate, public university" },
  { quote: "Our team now builds monthly dashboards in Excel in a fraction of the time.", who: "Finance manager, GLC" },
  { quote: "The AI for Data Analysis session changed how I write R code.", who: "Research officer" },
];

export default async function HomePage() {
  const [courses, posts] = await Promise.all([getUpcomingCourses({ limit: 6 }), getPublishedPosts(3)]);

  return (
    <>
      <section className="bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2">
          <div>
            <p className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-400">
              Data analytics training · Malaysia
            </p>
            <h1 className="text-4xl font-black leading-tight md:text-5xl">
              Turn data into decisions with confidence.
            </h1>
            <p className="mt-4 max-w-lg text-lg text-slate-200">
              Practical, hands-on courses in SPSS, statistics, R, Python, Excel and AI-assisted analysis, for
              researchers, students and professionals.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/courses" className="btn-accent px-6 py-3 text-base">
                See upcoming courses
              </Link>
              <Link href="/contact" className="btn border border-white/30 px-6 py-3 text-base text-white hover:bg-white/10">
                Request in-house training
              </Link>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-4">
            {[
              ["Hands-on", "Real datasets in every session"],
              ["Small classes", "Personal attention from trainers"],
              ["Materials", "Slides, datasets and syntax to keep"],
              ["HRD Corp", "Claimable programmes for employers"],
            ].map(([title, text]) => (
              <div key={title} className="rounded-xl bg-white/10 p-5">
                <dt className="text-lg font-bold">{title}</dt>
                <dd className="mt-1 text-sm text-slate-200">{text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Upcoming courses</h2>
            <p className="mt-1 text-slate-600">Secure your seat online with FPX online banking or card.</p>
          </div>
          <Link href="/courses" className="whitespace-nowrap text-sm font-semibold text-brand-600 hover:underline">
            View all →
          </Link>
        </div>
        {courses.length ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <p className="card mt-8 p-8 text-center text-slate-600">New courses are announced soon. Check back shortly.</p>
        )}
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold">What we teach</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOPICS.map((t) => (
              <Link key={t.name} href={`/courses?category=${encodeURIComponent(t.name)}`} className="card p-6 hover:border-brand-200">
                <p className="text-xl font-bold text-brand-700">{t.name}</p>
                <p className="mt-2 text-sm text-slate-600">{t.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold">What participants say</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.who} className="card p-6">
              <blockquote className="text-slate-700">“{t.quote}”</blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-slate-500">{t.who}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {posts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-4">
          <h2 className="text-3xl font-bold">From the blog</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="card p-6 hover:border-brand-200">
                <p className="text-xs text-slate-500">{formatDate(post.published_at)}</p>
                <p className="mt-1 font-semibold">{post.title}</p>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto mt-12 max-w-6xl px-4">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-accent-500 p-8 text-white md:flex-row md:items-center">
          <div>
            <p className="text-2xl font-bold">Training for your whole team?</p>
            <p className="mt-1 text-white/90">We run customised in-house programmes and research consultancy.</p>
          </div>
          <Link href="/contact" className="btn bg-white px-6 py-3 text-accent-600 hover:bg-slate-100">
            Talk to us
          </Link>
        </div>
      </section>
    </>
  );
}
