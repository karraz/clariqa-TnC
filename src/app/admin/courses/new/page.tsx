import Link from "next/link";
import { CourseForm } from "@/components/admin/course-form";
import { Flash } from "@/components/flash";

export default async function NewCoursePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <>
      <Link href="/admin/courses" className="text-sm text-brand-600 hover:underline">← Courses</Link>
      <h1 className="mt-3 mb-6 text-3xl font-bold">New course</h1>
      <div className="mb-4"><Flash error={error} /></div>
      <CourseForm />
    </>
  );
}
