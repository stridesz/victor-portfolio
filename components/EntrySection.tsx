"use client";

import Image from "next/image";
import type { LedgerEntry, MediaSlot } from "@/data/entries";
import { useStoryPanel } from "./StoryPanelContext";

function MediaPlaceholder({
  entry,
  slot,
  index,
  priority,
}: {
  entry: LedgerEntry;
  slot: MediaSlot;
  index: number;
  /** Eager-load above-the-fold media so it doesn't gate the Largest Contentful Paint. */
  priority?: boolean;
}) {
  const { openStory } = useStoryPanel();
  const imgSrc = slot.kind === "video" ? slot.poster : slot.src;
  const labelText = slot.previewLabel ?? slot.label;
  const isVideoThumbnail = slot.kind === "video" && Boolean(imgSrc);
  return (
    <div>
      <button
        type="button"
        onClick={() =>
          openStory({
            entryTitle: entry.title,
            media: entry.mediaPlaceholders,
            index,
          })
        }
        className={`group block w-full cursor-pointer bg-placeholder ${slot.sizeClass} relative overflow-hidden text-left ${
          isVideoThumbnail
            ? ""
            : "transition-transform transition-shadow duration-200 ease-out hover:scale-[1.02] hover:shadow-lg hover:shadow-black/10"
        }`}
        aria-label={`${slot.kind === "video" ? "Play" : "View"} ${slot.label} for ${entry.title}`}
      >
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={slot.label}
            fill
            priority={priority}
            className="object-cover"
            sizes="(min-width: 768px) 45vw, 100vw"
          />
        ) : (
          <span className="absolute left-3 top-3 text-[12px] uppercase tracking-wide text-meta group-hover:text-ink transition-colors">
            {labelText}
          </span>
        )}
        {isVideoThumbnail ? (
          <span className="pointer-events-none absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white transition-transform duration-200 ease-out group-hover:scale-105 group-focus:scale-105">
            <svg
              aria-hidden="true"
              className="pointer-events-none ml-0.5 h-3.5 w-3.5 text-black"
              viewBox="0 0 14 14"
              fill="currentColor"
            >
              <path d="M3.5 2.2v9.6L11 7 3.5 2.2Z" />
            </svg>
          </span>
        ) : null}
      </button>
      {imgSrc ? (
        <p className="mt-2 text-[12px] uppercase tracking-wide text-meta">
          {labelText}
        </p>
      ) : null}
    </div>
  );
}

/** Parse an aspect-[W/H] utility into a ratio; wide slots get the larger column share */
function isWideSlot(sizeClass: string): boolean {
  const m = sizeClass.match(
    /aspect-\[(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\]/
  );
  if (m) return parseFloat(m[1]) / parseFloat(m[2]) >= 1.2;
  return sizeClass.includes("16") || sizeClass.includes("4/3");
}

function formatLinkDisplay(link: string): string {
  try {
    const url = new URL(link);
    const host = url.hostname.replace(/^www\./, "");
    const path = url.pathname === "/" ? "" : url.pathname;
    return `↳ ${host}${path}`;
  } catch {
    return `↳ ${link}`;
  }
}

export default function EntrySection({
  entry,
  priority,
}: {
  entry: LedgerEntry;
  /** When true, eager-load this entry's media (used for the first, above-the-fold entry). */
  priority?: boolean;
}) {
  return (
    <section
      id={entry.id}
      data-entry
      className="scroll-mt-24 border-t border-placeholder pt-10 md:pt-14"
    >
      <div className="grid gap-8 md:grid-cols-[2fr_3fr] md:gap-12">
        {/* Metadata — left aligned, ~40% width */}
        <div className="text-[13px] leading-relaxed md:text-sm">
          {entry.year ? (
            <p className="text-meta">{entry.year}</p>
          ) : null}
          <h2 className="mt-1 text-2xl font-semibold leading-tight md:text-[28px]">
            {entry.title}
          </h2>
          <dl className="mt-4 space-y-1">
            <div className="flex gap-2">
              <dt className="text-meta">Role</dt>
              <dd>{entry.role}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-meta">Note</dt>
              <dd className="text-meta">{entry.note}</dd>
            </div>
          </dl>
          {entry.link ? (
            <p className="mt-3 text-meta">
              <a
                href={entry.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline underline-offset-2"
              >
                {formatLinkDisplay(entry.link)}
              </a>
            </p>
          ) : null}
        </div>
        {/* Media gallery — right/center, honest varied sizes, capped height */}
        <div className="flex flex-wrap items-start gap-4">
          {entry.mediaPlaceholders.map((slot, i) => (
            <div
              key={i}
              className={
                isWideSlot(slot.sizeClass)
                  ? "w-full sm:w-[calc(60%-0.5rem)]"
                  : "w-full sm:w-[calc(40%-0.5rem)]"
              }
            >
              <MediaPlaceholder
                entry={entry}
                slot={slot}
                index={i}
                priority={priority && i === 0}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
