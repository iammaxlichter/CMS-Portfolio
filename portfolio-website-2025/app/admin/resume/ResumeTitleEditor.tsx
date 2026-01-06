"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function ResumeTitleEditor() {
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data, error } = await supabase
        .from("resume_settings")
        .select("title")
        .eq("id", 1)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        setMsg(`Failed to load title: ${error.message}`);
        return;
      }

      setTitle(data?.title ?? "Fall 2025 Resume");
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const save = async () => {
    setMsg(null);
    setBusy(true);
    try {
      const next = title.trim();
      if (!next) {
        setMsg("Title cannot be empty.");
        return;
      }

      const { error } = await supabase
        .from("resume_settings")
        .update({ title: next })
        .eq("id", 1);

      if (error) throw error;

      setMsg("Saved successfully.");
    } catch (e: any) {
      setMsg(`Save failed: ${e.message ?? e}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 mb-20">
      <div className="text-xl text-black font-medium">Resume Page Title</div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#343330]"
        placeholder="e.g. Fall 2025 Resume"
        disabled={busy}
      />

      <button
        onClick={save}
        disabled={busy}
        className="
          w-full rounded-md bg-[#343330] px-4 py-2 text-white font-medium
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:bg-[#2a2924] transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-[#343330] focus:ring-offset-2
        "
      >
        {busy ? "Saving…" : "Save title"}
      </button>

      {msg && (
        <div
          className={`text-sm p-3 rounded-md ${
            msg.toLowerCase().includes("fail")
              ? "text-red-700 bg-red-50 border border-red-200"
              : "text-green-700 bg-green-50 border border-green-200"
          }`}
        >
          {msg}
        </div>
      )}
    </div>
  );
}
