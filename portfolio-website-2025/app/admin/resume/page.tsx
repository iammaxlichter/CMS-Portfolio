// app/admin/resume/page.tsx
export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import ResumeUploader from "./uploader";

export default async function AdminResumePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || profile.role !== "admin") return null;

  const { data: files } = await supabase.storage.from("resume").list();
  const pdfExists = files?.some(file => file.name === "Max-Lichter-Resume.pdf");
  const pngExists = files?.some(file => file.name === "Max-Lichter-Resume.png");

  const pdf = pdfExists ? supabase.storage.from("resume").getPublicUrl("Max-Lichter-Resume.pdf").data.publicUrl : null;
  const png = pngExists ? supabase.storage.from("resume").getPublicUrl("Max-Lichter-Resume.png").data.publicUrl : null;

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <ResumeUploader />
    </main>
  );
}