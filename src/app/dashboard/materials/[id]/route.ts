import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Redirects a paid student (or admin) to a short-lived signed URL for a material file. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS decides access: this returns nothing unless the user has paid for the course.
  const { data: material } = await supabase.from("materials").select("file_path").eq("id", id).maybeSingle();
  if (!material?.file_path) return NextResponse.redirect(new URL("/dashboard", request.url));

  const { data, error } = await createAdminClient()
    .storage.from("course-materials")
    .createSignedUrl(material.file_path, 60 * 5, { download: true });
  if (error || !data) return NextResponse.json({ error: "File unavailable" }, { status: 404 });

  return NextResponse.redirect(data.signedUrl);
}
