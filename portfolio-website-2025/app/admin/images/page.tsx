import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ImageUploadPanel from "@/components/admin/images/ImageUploadPanel";

export const dynamic = "force-dynamic";

export default async function AdminImages() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/signin?next=/admin/images");
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (profile?.role !== "admin") redirect("/");

    return (
        <div className="flex items-center justify-center pt-20 pb-20">
            <div className="w-full max-w-2xl space-y-6 ">
                <div className="flex items-center justify-between">
                    <Link
                        href="/admin"
                        className="inline-block rounded bg-neutral-200 px-3 py-2 text-sm text-black hover:bg-neutral-300"
                    >
                        ← Back to Admin
                    </Link>
                    
                </div>
                <h1 className="text-lg sm:text-xl font-semibold text-black">Image Upload</h1>
                <p className="text-sm text-neutral-600 text-left">
                    Convert JPG/JPEG to PNG, auto-index, and upload to <code>public-images</code> in Supabase.
                </p>
                <ImageUploadPanel />
            </div>
        </div>
    );

}
