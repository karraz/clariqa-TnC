import Link from "next/link";
import type { Course } from "@/lib/types";
import { formatDateRange, formatMYR } from "@/lib/format";
import { CategoryBadge } from "@/components/badges";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-36 bg-gradient-to-br from-brand-600 to-accent-500">
        {course.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={course.cover_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="absolute bottom-3 left-4 text-3xl font-black text-white/90">{course.category}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center gap-2">
          <CategoryBadge category={course.category} />
          <span className="text-xs capitalize text-slate-500">{course.mode}</span>
        </div>
        <h3 className="font-semibold leading-snug group-hover:text-brand-600">{course.title}</h3>
        {course.summary && <p className="line-clamp-2 text-sm text-slate-600">{course.summary}</p>}
        <div className="mt-auto flex items-center justify-between pt-3 text-sm">
          <span className="text-slate-600">{formatDateRange(course.start_date, course.end_date)}</span>
          <span className="font-bold text-brand-700">{formatMYR(course.price_myr)}</span>
        </div>
      </div>
    </Link>
  );
}
