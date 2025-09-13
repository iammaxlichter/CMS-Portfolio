// components/admin/PageToolbar.tsx
import Link from "next/link";
import { ALL_KINDS, type Kind, buildHref } from "@/lib/admin/pages";

export default function PageToolbar({
  sort,
  kinds,
}: {
  sort: "asc" | "desc";
  kinds: Kind[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-neutral-600 mr-1">Filter:</span>

      {/* All / Clear */}
      <Link
        href={buildHref([], sort)}
        className={`rounded px-3 py-1 text-sm border ${
          kinds.length === 0
            ? "bg-black text-white border-black"
            : "bg-white hover:bg-neutral-100 border-neutral-300 text-black"
        }`}
      >
        All
      </Link>

      {ALL_KINDS.map((k) => {
        const isActive = kinds.includes(k);
        const nextKinds: Kind[] = isActive
          ? (kinds.filter((x) => x !== k) as Kind[])
          : ([...kinds, k] as Kind[]);
        return (
          <Link
            key={k}
            href={buildHref(nextKinds, sort)}
            className={`rounded px-3 py-1 text-sm border capitalize ${
              isActive
                ? "bg-[#343330] text-white border-[#343330]"
                : "bg-white hover:bg-neutral-100 border-neutral-300 text-black"
            }`}
          >
            {k}
          </Link>
        );
      })}

      {/* Sort toggle */}
      <Link
        href={buildHref(kinds, sort === "asc" ? "desc" : "asc")}
        className="ml-auto rounded bg-neutral-200 px-3 py-1 text-sm hover:bg-neutral-300"
      >
        Sort {sort === "asc" ? "A - Z" : "Z - A"}
      </Link>
    </div>
  );
}
