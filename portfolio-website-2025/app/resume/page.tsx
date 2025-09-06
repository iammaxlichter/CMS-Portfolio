// app/resume/page.tsx
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Resume | Max Lichter",
  description: "Fall 2025 Resume",
};

export default async function ResumePage() {
  const supabase = await createClient();

  const { data: files } = await supabase.storage.from("resume").list();
  const pdfExists = files?.some((f) => f.name === "Max-Lichter-Resume.pdf");
  const pngExists = files?.some((f) => f.name === "Max-Lichter-Resume.png");

  const pdf = pdfExists
    ? supabase.storage.from("resume").getPublicUrl("Max-Lichter-Resume.pdf").data.publicUrl
    : null;
  const png = pngExists
    ? supabase.storage.from("resume").getPublicUrl("Max-Lichter-Resume.png").data.publicUrl
    : null;

  const bust = `?v=${Date.now()}`;

  return (
    <main className="flex flex-col items-center px-10 py-16 bg-[#FBFBFB]">
      {/* Keyframes for entrance */}
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translate3d(0,16px,0); }
          to   { opacity: 1; transform: translate3d(0,0,0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translate3d(-24px,0,0); }
          to   { opacity: 1; transform: translate3d(0,0,0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translate3d(24px,0,0); }
          to   { opacity: 1; transform: translate3d(0,0,0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; }
        }
      `}</style>

      {/* Header row */}
      <div className="flex items-center gap-4 mb-8 opacity-0 [animation:slideInUp_0.6s_cubic-bezier(0.22,1,0.36,1)_0.02s_both]">
        <span className="text-[24px] font-semilight opacity-0 [animation:slideInLeft_0.7s_cubic-bezier(0.22,1,0.36,1)_0.06s_both]">
          Fall 2025 Resume
        </span>

        {pdf && (
          <a
            href="/api/resume/download"
            aria-label="Download resume PDF"
            title="Download resume (PDF)"
            className="
              px-2.5 py-2.5 border rounded-md bg-[#343330] text-white
              hover:bg-[#2a2924] transition-colors duration-200
              flex items-center justify-center
              opacity-0 [animation:slideInRight_0.7s_cubic-bezier(0.22,1,0.36,1)_0.08s_both]
              transform-gpu transition-transform
              hover:scale-[1.06] active:scale-[0.96] hover:-translate-y-[1px]
              shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40
            "
          >
            <i className="fas fa-download" aria-hidden="true" />
          </a>
        )}
      </div>

      {/* Preview card (scale the WHOLE bordered box on hover) */}
      <div className="w-full px-0 sm:px-4 md:px-16 lg:px-40 flex justify-center">
        <div
          className="
            w-full max-w-6xl border-2 border-[#343330] bg-white shadow-md
            relative group overflow-hidden flex justify-center
            opacity-0 [animation:slideInUp_0.7s_cubic-bezier(0.22,1,0.36,1)_0.12s_both]
            transform-gpu transition-transform duration-300 ease-out
            hover:scale-[1.015] active:scale-[0.995]
          "
        >
          {png ? (
            <>
              {/* Clickable area fills container */}
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

                {/* Subtle hover tint */}
                <div className="pointer-events-none absolute inset-0 transition-colors duration-200 group-hover:bg-black/5" />

                {/* Hover message */}
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
                <div className="text-center opacity-0 [animation:fadeIn_0.5s_ease-out_0.15s_both]">
                  <i className="fas fa-file-pdf text-4xl text-gray-400 mb-4" aria-hidden="true"></i>
                  <p className="mb-2">Resume preview not available</p>
                  <a
                    href={pdf ?? "#"}
                    download="Max-Lichter-Resume.pdf"
                    className="
                      inline-flex items-center px-4 py-2 bg-[#343330] text-white rounded-md
                      hover:bg-[#2a2924] transition-colors duration-200
                      transform-gpu transition-transform hover:scale-[1.06] active:scale-[0.96] hover:-translate-y-[1px]
                      shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40
                    "
                  >
                    <i className="fas fa-download mr-2" aria-hidden="true"></i>
                    Download PDF
                  </a>
                </div>
              ) : (
                <div className="text-center opacity-0 [animation:fadeIn_0.5s_ease-out_0.15s_both]">
                  <i className="fas fa-file-times text-4xl text-gray-400 mb-4" aria-hidden="true"></i>
                  <p>No resume available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Context text */}
      {png && pdf && (
        <p className="text-sm text-gray-500 mt-4 text-center max-w-2xl opacity-0 [animation:fadeIn_0.6s_ease-out_0.25s_both]">
          Click anywhere on the resume image above to download the full PDF version.
        </p>
      )}
    </main>
  );
}
