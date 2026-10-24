import { saveCourse } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { COURSE_CATEGORIES, type Course } from "@/lib/types";

export function CourseForm({ course }: { course?: Course }) {
  return (
    <form action={saveCourse} className="card space-y-4 p-6">
      {course && <input type="hidden" name="id" value={course.id} />}
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <div>
          <label className="label" htmlFor="title">Title</label>
          <input className="input" id="title" name="title" defaultValue={course?.title} required />
        </div>
        <div>
          <label className="label" htmlFor="slug">URL slug (optional)</label>
          <input className="input" id="slug" name="slug" defaultValue={course?.slug} placeholder="auto from title" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="category">Category</label>
          <select className="input" id="category" name="category" defaultValue={course?.category ?? "SPSS"}>
            {COURSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="price_myr">Price (RM)</label>
          <input className="input" id="price_myr" name="price_myr" type="number" min="0" step="0.01" defaultValue={course?.price_myr ?? ""} required />
        </div>
        <div>
          <label className="label" htmlFor="seats">Seats (blank = unlimited)</label>
          <input className="input" id="seats" name="seats" type="number" min="1" defaultValue={course?.seats ?? ""} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="start_date">Start date</label>
          <input className="input" id="start_date" name="start_date" type="date" defaultValue={course?.start_date ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="end_date">End date</label>
          <input className="input" id="end_date" name="end_date" type="date" defaultValue={course?.end_date ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="mode">Mode</label>
          <select className="input" id="mode" name="mode" defaultValue={course?.mode ?? "online"}>
            <option value="online">Online</option>
            <option value="physical">Physical</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="venue">Venue / platform</label>
        <input className="input" id="venue" name="venue" defaultValue={course?.venue ?? ""} placeholder="e.g. Shah Alam, or Zoom" />
      </div>
      <div>
        <label className="label" htmlFor="summary">Short summary</label>
        <textarea className="input" id="summary" name="summary" rows={2} defaultValue={course?.summary ?? ""} />
      </div>
      <div>
        <label className="label" htmlFor="description_md">Full description (Markdown supported)</label>
        <textarea className="input font-mono" id="description_md" name="description_md" rows={10} defaultValue={course?.description_md ?? ""} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="cover">Cover image</label>
          <input className="input" id="cover" name="cover" type="file" accept="image/*" />
          {course?.cover_url && <p className="mt-1 text-xs text-slate-500">Current image is kept unless you upload a new one.</p>}
        </div>
        <div>
          <label className="label" htmlFor="status">Status</label>
          <select className="input" id="status" name="status" defaultValue={course?.status ?? "draft"}>
            <option value="draft">Draft (hidden)</option>
            <option value="published">Published (open for registration)</option>
            <option value="closed">Closed (visible, registration closed)</option>
          </select>
        </div>
      </div>
      <SubmitButton pendingText="Saving…">{course ? "Save changes" : "Create course"}</SubmitButton>
    </form>
  );
}
