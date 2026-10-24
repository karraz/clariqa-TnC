import { toggleEnquiry } from "@/app/actions/admin";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import type { Enquiry } from "@/lib/types";

export default async function AdminEnquiriesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("enquiries").select("*").order("handled").order("created_at", { ascending: false });
  const enquiries = (data ?? []) as Enquiry[];

  return (
    <>
      <h1 className="text-3xl font-bold">Enquiries</h1>
      <p className="mt-1 text-slate-600">Messages from the contact form, including in-house training requests.</p>
      <div className="mt-6 space-y-4">
        {enquiries.map((e) => (
          <article key={e.id} className={`card p-5 ${e.handled ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{e.name} {e.organisation && <span className="font-normal text-slate-500">· {e.organisation}</span>}</p>
                <p className="text-sm text-slate-600">
                  <a href={`mailto:${e.email}`} className="text-brand-600 hover:underline">{e.email}</a>
                  {e.phone && ` · ${e.phone}`}
                </p>
                <p className="mt-1 text-xs text-slate-500">{e.topic} · {formatDate(e.created_at)}</p>
              </div>
              <form action={toggleEnquiry}>
                <input type="hidden" name="id" value={e.id} />
                <input type="hidden" name="handled" value={String(e.handled)} />
                <button className="btn-outline px-3 py-1 text-xs">{e.handled ? "Mark as open" : "Mark as handled"}</button>
              </form>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm">{e.message}</p>
          </article>
        ))}
        {enquiries.length === 0 && <p className="card p-8 text-center text-slate-500">No enquiries yet.</p>}
      </div>
    </>
  );
}
