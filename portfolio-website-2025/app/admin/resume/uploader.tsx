"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
declare global {
    interface Window {
        pdfjsLib: any;
    }
}

export default function ResumeUploader() {
    const [pdf, setPdf] = useState<File | null>(null);
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [pdfjsLoaded, setPdfjsLoaded] = useState(false);

    useEffect(() => {
        const loadPdfJsFromCDN = () => {
            const PDFJS_VERSION = '3.11.174';

            if (window.pdfjsLib) {
                setPdfjsLoaded(true);
                return;
            }

            const script = document.createElement('script');
            script.src = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
            script.onload = () => {
                if (window.pdfjsLib) {
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;
                    console.log(`PDF.js ${PDFJS_VERSION} loaded from CDN`);
                    setPdfjsLoaded(true);
                }
            };
            script.onerror = () => {
                console.error('Failed to load PDF.js from CDN');
                setMsg("PDF processing unavailable - preview generation disabled");
            };

            document.head.appendChild(script);

            return () => {
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            };
        };

        const cleanup = loadPdfJsFromCDN();
        return cleanup;
    }, []);

    const convertPdfToPng = async (pdfFile: File): Promise<Blob> => {
        if (!window.pdfjsLib) throw new Error("PDF.js not loaded yet");

        const buf = await pdfFile.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({
            data: new Uint8Array(buf),
            verbosity: 0,
            disableFontFace: true,
        }).promise;

        const page = await pdf.getPage(1);
        const scale = 2;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("No 2D context");

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        await page.render({
            canvasContext: ctx,
            viewport,
            background: "white",
        }).promise;

        return await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(b => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png", 0.95);
        });
    };

    const handlePdfSelect = async (file: File | null) => {
        setPdf(file);
        setPreview(null);
        setMsg(null);

        if (file && pdfjsLoaded) {
            try {
                setMsg("Generating preview...");
                const pngBlob = await convertPdfToPng(file);
                const previewUrl = URL.createObjectURL(pngBlob);
                setPreview(previewUrl);
                setMsg("Preview generated successfully");
            } catch (error) {
                console.error('Preview generation failed:', error);
                setMsg("Preview generation failed, but you can still upload the PDF.");
            }
        } else if (file && !pdfjsLoaded) {
            setMsg("PDF selected. Preview will be generated after PDF.js loads.");
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg(null);
        if (!pdf) {
            setMsg("Please choose a PDF.");
            return;
        }

        setBusy(true);
        try {
            const pdfRes = await supabase.storage
                .from("resume")
                .upload("Max-Lichter-Resume.pdf", pdf, {
                    upsert: true,
                    contentType: "application/pdf"
                });

            if (pdfRes.error) throw pdfRes.error;

            if (pdfjsLoaded) {
                try {
                    const pngBlob = await convertPdfToPng(pdf);
                    const pngFile = new File([pngBlob], "Max-Lichter-Resume.png", {
                        type: "image/png"
                    });

                    const pngRes = await supabase.storage
                        .from("resume")
                        .upload("Max-Lichter-Resume.png", pngFile, {
                            upsert: true,
                            contentType: "image/png"
                        });

                    if (pngRes.error) throw pngRes.error;

                    setMsg("Resume uploaded successfully! PDF available for download, PNG preview generated.");
                } catch (pngError) {
                    console.error('PNG generation failed:', pngError);
                    setMsg("PDF uploaded successfully! (Preview generation failed - PNG may need manual upload)");
                }
            } else {
                setMsg("PDF uploaded successfully! (Preview generation not available - PDF.js still loading)");
            }

        } catch (err: any) {
            console.error('Upload error:', err);
            setMsg(`Upload failed: ${err.message ?? err}`);
        } finally {
            setBusy(false);
        }
    };

    // Clean up preview URL when component unmounts or preview changes
    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    // Auto-generate preview if PDF.js loads after file selection
    useEffect(() => {
        if (pdf && pdfjsLoaded && !preview && !busy) {
            handlePdfSelect(pdf);
        }
    }, [pdfjsLoaded, pdf]);

    return (

        <div className="space-y-4">

            <div>
                <Link
                    href="/admin"
                    className="inline-block rounded bg-neutral-200 px-3 py-2 text-sm text-black hover:bg-neutral-300"
                >
                    ← Back to Admin
                </Link>
            </div>

            {!pdfjsLoaded && (
                <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md border border-blue-200">
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Loading PDF processor from CDN for preview generation...
                    </div>
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <h1 className="text-xl font-semibold mb-5">Update Resume</h1>
                    <label className="block text-sm font-medium mb-2">
                        PDF Resume
                    </label>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => handlePdfSelect(e.target.files?.[0] ?? null)}
                        className="block w-full text-sm text-gray-500 
                       file:mr-4 file:py-2 file:px-4 
                       file:rounded-md file:border-0 
                       file:text-sm file:font-medium
                       file:bg-blue-50 file:text-blue-700 
                       hover:file:bg-blue-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={busy}
                    />
                    {pdf && (
                        <p className="text-xs text-gray-500 mt-1">
                            Selected: {pdf.name} ({(pdf.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                    )}
                </div>

                {preview && (
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="text-sm font-medium text-gray-700 mb-2">
                            Preview (will be displayed on resume page):
                        </div>
                        <div className="flex justify-center">
                            <img
                                src={preview}
                                alt="Resume preview"
                                className="max-h-64 w-auto border border-gray-200 rounded shadow-sm"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            This PNG preview will be shown to visitors, while the PDF will be available for download.
                        </p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={busy || !pdf}
                    className="w-full rounded-md bg-[#343330] px-4 py-2 text-white font-medium
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-[#2a2924] transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-[#343330] focus:ring-offset-2"
                >
                    {busy ? "Uploading…" : "Upload Resume"}
                </button>

                {msg && (
                    <div className={`text-sm p-3 rounded-md ${msg.includes('✅')
                            ? 'text-green-700 bg-green-50 border border-green-200'
                            : msg.includes('❌') || msg.includes('failed')
                                ? 'text-red-700 bg-red-50 border border-red-200'
                                : 'text-blue-700 bg-blue-50 border border-blue-200'
                        }`}>
                        {msg}
                    </div>
                )}
            </form>
        </div>
    );
}