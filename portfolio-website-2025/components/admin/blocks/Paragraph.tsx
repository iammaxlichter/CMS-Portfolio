import { useRef } from "react";
import type { Block, ParagraphData } from "@/lib/blocks/types";

export default function Paragraph({
  block,
  onChange,
}: {
  block: Block & { data: ParagraphData };
  onChange: (b: Block) => void;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);

  const setData = (patch: Partial<ParagraphData>) =>
    onChange({ ...block, data: { ...block.data, ...patch } });

  // Wrap current selection with tags
  const surround = (before: string, after: string) => {
    const ta = taRef.current;
    if (!ta) return;
    const { selectionStart, selectionEnd, value } = ta;
    const sel = value.slice(selectionStart, selectionEnd) || "";
    const next =
      value.slice(0, selectionStart) +
      before +
      sel +
      after +
      value.slice(selectionEnd);
    setData({ html: next });
    // restore caret around selection
    requestAnimationFrame(() => {
      ta.focus();
      const offset = before.length;
      ta.setSelectionRange(selectionStart + offset, selectionEnd + offset);
    });
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded border px-2 py-1 text-sm"
          onClick={() => surround("<strong>", "</strong>")}
          title="Bold"
        >
          <b>B</b>
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1 text-sm italic"
          onClick={() => surround("<em>", "</em>")}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1 text-sm underline"
          onClick={() => surround("<u>", "</u>")}
          title="Underline"
        >
          U
        </button>
      </div>

      {/* HTML textarea */}
      <textarea
        ref={taRef}
        className="w-full min-h-28 rounded border p-2 text-black"
        value={block.data.html}
        onChange={(e) => setData({ html: e.target.value })}
        placeholder="Write something… (you can also add <strong>, <em>, <u>, <a>, <br>)"
      />

      {/* Font size + margins */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <label className="text-sm text-black flex flex-col gap-1">
          Font size (px)
          <input
            type="number"
            className="rounded border p-2 text-black"
            min={10}
            value={block.data.fontSize ?? 16}
            onChange={(e) => setData({ fontSize: Number(e.target.value) || 0 })}
          />
        </label>

        <label className="text-sm text-black flex flex-col gap-1">
          Margin top (px)
          <input
            type="number"
            className="rounded border p-2 text-black"
            value={block.data.marginTop ?? 16}
            onChange={(e) => setData({ marginTop: Number(e.target.value) })}
          />
        </label>

        <label className="text-sm text-black flex flex-col gap-1">
          Margin bottom (px)
          <input
            type="number"
            className="rounded border p-2 text-black"
            value={block.data.marginBottom ?? 16}
            onChange={(e) => setData({ marginBottom: Number(e.target.value) })}
          />
        </label>
      </div>

      <div className="text-xs text-neutral-500">
        Tip: Use the toolbar or manually type <code>&lt;strong&gt;</code>,{" "}
        <code>&lt;em&gt;</code>, <code>&lt;u&gt;</code>. You can also add links
        with
        <code>
          &lt;a href=&quot;…&quot; target=&quot;_blank&quot;
          rel=&quot;noopener&quot;&gt;…&lt;/a&gt;
        </code>
        .
      </div>
    </div>
  );
}
