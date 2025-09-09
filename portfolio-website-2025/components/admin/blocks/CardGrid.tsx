"use client";
import type { Block, CardGridData, CardItem } from "@/lib/blocks/types";
import { isCardGridData } from "@/lib/blocks/types";

export default function CardGridEditor({
  block,
  onChange,
}: { block?: Block; onChange: (b: Block) => void }) {
  if (!block || block.block_type !== "card_grid") return null;

  const data = block.data as CardGridData;
  const items = data.items ?? [];

  const set = (next: Partial<CardGridData>) =>
    onChange({ ...block, data: { ...data, ...next } });
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="rounded border p-3">
          <div className="grid gap-2 md:grid-cols-2">
            <input className="rounded border p-2 text-black" value={it.title} placeholder="Card title"
              onChange={(e) => { const arr=[...items]; arr[i]={...it,title:e.target.value}; set({items:arr}); }} />
            <input className="rounded border p-2 text-black" value={it.href} placeholder="Link (/slug or https://...)"
              onChange={(e) => { const arr=[...items]; arr[i]={...it,href:e.target.value}; set({items:arr}); }} />
            <input className="rounded border p-2 text-black md:col-span-2" value={it.img} placeholder="Thumbnail"
              onChange={(e) => { const arr=[...items]; arr[i]={...it,img:e.target.value}; set({items:arr}); }} />
            <input className="rounded border p-2 text-black md:col-span-2" value={it.caption ?? ""} placeholder="Optional caption"
              onChange={(e) => { const arr=[...items]; arr[i]={...it,caption:e.target.value}; set({items:arr}); }} />
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-3">
            <label className="text-sm text-black flex flex-col gap-1">
              Align (card)
              <select className="rounded border p-2 text-black" value={it.align ?? "left"}
                onChange={(e) => { const arr=[...items]; arr[i]={...it,align:e.target.value as "left"|"center"|"right"}; set({items:arr}); }}>
                <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
              </select>
            </label>
            <label className="text-sm text-black flex flex-col gap-1">
              Card width (%)
              <input type="number" min={10} max={100} className="rounded border p-2 text-black" value={it.widthPercent ?? 100}
                onChange={(e) => { const v=Math.max(10,Math.min(100,Number(e.target.value)||100)); const arr=[...items]; arr[i]={...it,widthPercent:v}; set({items:arr}); }} />
            </label>
            <label className="text-sm text-black flex flex-col gap-1">
              img mw (px)
              <input type="number" min={0} className="rounded border p-2 text-black" value={it.thumbMaxWidthPx ?? ""}
                onChange={(e) => { const raw=e.target.value?Number(e.target.value):undefined; const v=raw!==undefined && raw<80?undefined:raw; const arr=[...items]; arr[i]={...it,thumbMaxWidthPx:v}; set({items:arr}); }} />
            </label>
            {["borderWidthPx","borderColor","paddingPx"].map((k) => (
              <label key={k} className="text-sm text-black flex flex-col gap-1">
                {k==="borderColor"?"Border color":k==="paddingPx"?"pd in border (px)":"Border width (px)"}
                <input
                  type={k==="borderColor"?"text":"number"}
                  min={k==="borderColor"?undefined:0}
                  className="rounded border p-2 text-black"
                  value={(it as any)[k] ?? (k==="borderColor"?"#343330":0)}
                  onChange={(e) => { const arr=[...items]; (arr[i] as any)[k] = k==="borderColor"? (e.target.value || "#343330") : Number(e.target.value)||0; set({items:arr}); }}
                />
              </label>
            ))}
          </div>

          <div className="mt-2 grid gap-2 md:grid-cols-4">
            {(["marginTop","marginBottom","marginLeft","marginRight"] as const).map((k)=>(
              <label key={k} className="text-sm text-black flex flex-col gap-1">
                {k.replace(/([A-Z])/g," $1")} (px)
                <input type="number" className="rounded border p-2 text-black" value={(it as any)[k] ?? 0}
                  onChange={(e)=>{ const arr=[...items]; (arr[i] as any)[k]=Number(e.target.value); set({items:arr}); }} />
              </label>
            ))}
          </div>

          <div className="mt-2 flex gap-2">
            <button type="button" className="rounded border px-2 text-sm"
              onClick={()=>{ const arr=[...items]; if(i>0)[arr[i-1],arr[i]]=[arr[i],arr[i-1]]; set({items:arr}); }}>↑</button>
            <button type="button" className="rounded border px-2 text-sm"
              onClick={()=>{ const arr=[...items]; if(i<arr.length-1)[arr[i+1],arr[i]]=[arr[i],arr[i+1]]; set({items:arr}); }}>↓</button>
            <button type="button" className="rounded border px-2 text-sm text-red-600"
              onClick={()=>{ const arr=[...items]; arr.splice(i,1); set({items:arr}); }}>Delete</button>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="rounded border px-3 py-2 text-sm"
        onClick={() => set({ items: [...items, { title:"", href:"", img:"", caption:"", widthPercent:100 } as CardItem] })}
      >
        + Add card
      </button>

      <div className="text-xs text-neutral-500">Cards render in a responsive grid and link to the provided URL.</div>
    </div>
  );
}
