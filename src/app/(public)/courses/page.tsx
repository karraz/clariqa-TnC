import Link from "next/link";
import type { Metadata } from "next";
import { CourseCard } from "@/components/course-card";
import { getUpcomingCourses } from "@/lib/data";
import { COURSE_CATEGORIES } from "@/lib/types";

export const metadata: Metadata = { title: "Upcoming courses" };

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const courses = await getUpcomingCourses({ category });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold">Upcoming courses</h1>
      <p className="mt-2 text-slate-600">Public classes open for registration. Pay online and get instant access to your course portal.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/courses" className={!category ? "btn-primary" : "btn-outline"}>
          All
        </Link>
        {COURSE_CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/courses?category=${encodeURIComponent(c)}`}
            className={category === c ? "btn-primary" : "btn-outline"}
          >
            {c}
          </Link>
        ))}
      </div>

      {courses.length ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <p className="card mt-8 p-8 text-center text-slate-600">
          No upcoming {category ?? ""} courses right now. <Link href="/contact" className="text-brand-600 underline">Tell us what you need</Link>.
        </p>
      )}
    </div>
  );
}
