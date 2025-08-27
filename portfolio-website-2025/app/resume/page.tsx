// app/resume/page.tsx
import { createClient } from "@/lib/supabase/server";

export const metadata = {
    title: "Resume | Max Lichter",
    description: "Fall 2025 Resume",
};

export default async function ResumePage() {
    const supabase = await createClient();

    // Check if files exist before getting URLs
    const { data: files } = await supabase.storage.from("resume").list();
    const pdfExists = files?.some(file => file.name === "Max-Lichter-Resume.pdf");
    const pngExists = files?.some(file => file.name === "Max-Lichter-Resume.png");

    const pdf = pdfExists ? supabase.storage.from("resume").getPublicUrl("Max-Lichter-Resume.pdf").data.publicUrl : null;
    const png = pngExists ? supabase.storage.from("resume").getPublicUrl("Max-Lichter-Resume.png").data.publicUrl : null;

    const bust = `?v=${Date.now()}`; // cache-bust preview if needed

    return (
        <main className="flex flex-col items-center px-10 py-16 bg-[#FBFBFB]">
            <div className="flex items-center gap-4 mb-8">
                <span className="text-[24px] font-semilight">Fall 2025 Resume</span>
                {pdf && (
                    <a
                        href="/api/resume/download"  
                        className="px-2.5 py-2.5 border rounded-md bg-[#343330] text-white hover:bg-[#2a2924] transition-colors duration-200 flex items-center justify-center"
                        aria-label="Download resume PDF"
                        title="Download resume (PDF)"
                    >
                        <i className="fas fa-download" aria-hidden="true"></i>
                    </a>
                )}
            </div>

            <main className="w-full px-0 sm:px-4 md:px-16 lg:px-40 flex justify-center">
                <div className="w-full max-w-6xl border-2 border-[#343330] bg-white shadow-md flex justify-center relative group">
                    {png ? (
                        <>
                            {/* Clickable image for download */}
                            <a
                                href="/api/resume/download"  
                                title="Click to download resume (PDF)"
                                className="block w-full relative"
                            >
                                <img
                                    src={`${png}${bust}`}
                                    alt="Max Lichter Resume"
                                    className="w-full h-auto transition-opacity duration-200 group-hover:opacity-95"
                                />
                                {/* subtle hover tint that never blocks clicks */}
                                <div className="pointer-events-none absolute inset-0 transition-colors duration-200 group-hover:bg-black/5" />

                                {/* hover message */}
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/70 text-white px-4 py-2 rounded-md text-sm">
                                        <i className="fas fa-download mr-2" aria-hidden="true"></i>
                                        Click to download PDF
                                    </div>
                                </div>

                            </a>
                        </>
                    ) : (
                        <div className="w-full h-64 flex items-center justify-center text-gray-600">
                            {pdfExists ? (
                                <div className="text-center">
                                    <i className="fas fa-file-pdf text-4xl text-gray-400 mb-4" aria-hidden="true"></i>
                                    <p className="mb-2">Resume preview not available</p>
                                    <a
                                        href={pdf ?? "#"}
                                        download="Max-Lichter-Resume.pdf"
                                        className="inline-flex items-center px-4 py-2 bg-[#343330] text-white rounded-md hover:bg-[#2a2924] transition-colors duration-200"
                                    >
                                        <i className="fas fa-download mr-2" aria-hidden="true"></i>
                                        Download PDF
                                    </a>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <i className="fas fa-file-times text-4xl text-gray-400 mb-4" aria-hidden="true"></i>
                                    <p>No resume available</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Optional: Add some context below */}
            {png && pdf && (
                <p className="text-sm text-gray-500 mt-4 text-center max-w-2xl">
                    Click anywhere on the resume image above to download the full PDF version.
                </p>
            )}
        </main>
    );
}