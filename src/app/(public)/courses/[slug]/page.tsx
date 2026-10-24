import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { startCheckout } from "@/app/actions/checkout";
import { CategoryBadge } from "@/components/badges";
import { Flash } from "@/components/flash";
import { Markdown } from "@/components/markdown";
import { SubmitButton } from "@/components/submit-button";
import { getCourseBySlug, getSeatsTaken } from "@/lib/data";
import { formatDateRange, formatMYR } from "@/lib/format";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ error?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getCourseBySlug((await params).slug);
  return { title: course?.title ?? "Course", description: course?.summary ?? undefined };
}

export default async function CourseDetailPage({ params, searchParams }: Props) {
  const [{ slug }, { error }] = await Promise.all([params, searchParams]);
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const taken = await getSeatsTaken(course.id);
  const seatsLeft = course.seats ? Math.max(course.seats - taken, 0) : null;
  const soldOut = seatsLeft === 0;
  const open = course.status === "published" && !soldOut;

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1fr_340px]">
      <article>
        <Link href="/courses" className="text-sm text-brand-600 hover:underline">
          ← All courses
        </Link>
        <div className="mt-4 flex items-center gap-2">
          <CategoryBadge category={course.category} />
          <span className="text-sm capitalize text-slate-500">{course.mode}</span>
        </div>
        <h1 className="mt-2 text-4xl font-bold leading-tight">{course.title}</h1>
        {course.summary && <p className="mt-3 text-lg text-slate-600">{course.summary}</p>}
        <div className="mt-8">
          <Markdown>{course.description_md}</Markdown>
        </div>
      </article>

      <aside className="card h-fit space-y-4 p-6 lg:sticky lg:top-24">
        <p className="text-3xl font-black text-brand-700">{formatMYR(course.price_myr)}</p>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Date</dt>
            <dd className="text-right font-medium">{formatDateRange(course.start_date, course.end_date)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Mode</dt>
            <dd className="font-medium capitalize">{course.mode}</dd>
          </div>
          {course.venue && (
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Venue</dt>
              <dd className="text-right font-medium">{course.venue}</dd>
            </div>
          )}
          {seatsLeft !== null && (
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Seats left</dt>
              <dd className={`font-medium ${seatsLeft <= 5 ? "text-red-600" : ""}`}>{seatsLeft}</dd>
            </div>
          )}
        </dl>
        <Flash error={error} />
        {open ? (
          <form action={startCheckout}>
            <input type="hidden" name="courseId" value={course.id} />
            <SubmitButton className="btn-accent w-full py-3 text-base" pendingText="Redirecting to payment…">
              Enrol &amp; pay now
            </SubmitButton>
          </form>
        ) : (
          <p className="rounded-lg bg-slate-100 p-3 text-center text-sm font-semibold text-slate-600">
            {soldOut ? "Fully booked" : "Registration closed"}
          </p>
        )}
        <p className="text-xs text-slate-500">
          Pay securely with FPX online banking or card. Need an invoice, bank transfer or HRD Corp claim?{" "}
          <Link href="/contact" className="text-brand-600 underline">
            Contact us
          </Link>
          .
        </p>
      </aside>
    </div>
  );
}
