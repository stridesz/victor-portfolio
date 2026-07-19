"use client";

import type { LedgerEntry, MediaSlot } from "@/data/entries";
import { useStoryPanel } from "./StoryPanelContext";

function MediaPlaceholder({
  entry,
  slot,
}: {
  entry: LedgerEntry;
  slot: MediaSlot;
}) {
  const { openStory } = useStoryPanel();
  return (
    <button
      type="button"
      onClick={() =>
        openStory({
          title: entry.title,
          year: entry.year,
          storyText: entry.storyText,
          specialThanks: entry.specialThanks,
        })
      }
      className={`group block w-full bg-placeholder ${slot.sizeClass} relative overflow-hidden text-left`}
      aria-label={`Open story for ${entry.title}`}
    >
      <span className="absolute left-3 top-3 text-[12px] uppercase tracking-wide text-meta group-hover:text-ink transition-colors">
        {slot.label}
      </span>
    </button>
  );
}

export default function EntrySection({ entry }: { entry: LedgerEntry }) {
  return (
    <section
      id={entry.id}
      data-entry
      className="scroll-mt-24 border-t border-placeholder pt-10 md:pt-14"
    >
      <div className="grid gap-8 md:grid-cols-[220px_1fr] md:gap-12">
        {/* Metadata — left aligned */}
        <div className="text-[13px] leading-relaxed md:text-sm">
          <p className="text-meta">{entry.year}</p>
          <h2 className="mt-1 text-2xl font-semibold leading-tight md:text-[28px]">
            {entry.title}
          </h2>
          <dl className="mt-4 space-y-1">
            <div className="flex gap-2">
              <dt className="text-meta">Role</dt>
              <dd>{entry.role}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-meta">Org</dt>
              <dd>{entry.org}</dd>
            </div>
            {entry.metaNote ? (
              <div className="flex gap-2">
                <dt className="text-meta">Note</dt>
                <dd className="text-meta">{entry.metaNote}</dd>
              </div>
            ) : null}
          </dl>
        </div>
        {/* Media gallery — right/center, honest varied sizes */}
        <div className="flex flex-wrap items-start gap-4">
          {entry.mediaPlaceholders.map((slot, i) => (
            <div
              key={i}
              className={
                slot.sizeClass.includes("16") || slot.sizeClass.includes("4/3")
                  ? "w-full sm:w-[calc(60%-0.5rem)]"
                  : "w-full sm:w-[calc(40%-0.5rem)]"
              }
            >
              <MediaPlaceholder entry={entry} slot={slot} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
