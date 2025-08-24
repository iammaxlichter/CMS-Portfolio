// app/resume/page.tsx
import Link from "next/link";

export const metadata = {
    title: "Resume | Max Lichter",
    description: "Fall 2025 Resume",
};

export default function ResumePage() {
    return (
        <main className="flex flex-col items-center px-10 py-16">
            {/* Title + Download button */}
            <div className="flex items-center gap-4 mb-8">
                <span className="text-[24px] font-semilight">Fall 2025 Resume</span>

                {/* Use a plain <a> with download for guaranteed file download */}
                <a
                    href="/resume/Max-Lichter-Resume.pdf"
                    download="Max-Lichter-Resume.pdf"
                    className="px-4 py-3 border rounded-md bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center"
                    aria-label="Download resume PDF"
                    title="Download resume (PDF)"
                >
                    <i className="fas fa-download" aria-hidden="true"></i>
                </a>
            </div>

            <main className="w-full px-0 sm:px-4 md:px-16 lg:px-32 flex justify-center">
                <div className="w-full max-w-6xl border bg-white shadow-md flex justify-center">
                    <a
                        href="/resume/Max-Lichter-Resume.pdf"
                        download="Max-Lichter-Resume.pdf"
                        title="Download resume (PDF)"
                        className="block w-full"
                    >
                        <img
                            src="/resume/Max-Lichter-Resume.png"
                            alt="Max Lichter Resume"
                            className="w-full h-auto"
                        />
                    </a>
                </div>
            </main>


        </main>
    );
}
