"use client";

import { useEffect, useRef } from "react";
import { useStoryPanel } from "./StoryPanelContext";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export default function StoryPanel() {
  const { panel, closeStory } = useStoryPanel();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  // Focus management + simple focus trap
  useEffect(() => {
    if (!panel.open) return;
    lastActiveRef.current = document.activeElement as HTMLElement | null;
    const node = panelRef.current;
    const focusables = node?.querySelectorAll<HTMLElement>(FOCUSABLE);
    (focusables?.[0] ?? node)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (items.length === 0) {
        e.preventDefault();
        node.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      lastActiveRef.current?.focus();
    };
  }, [panel.open]);

  return (
    <>
      {/* Scrim */}
      <div
        aria-hidden
        onClick={closeStory}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ease-out ${
          panel.open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      {/* Panel: right slide-over on desktop, bottom sheet on mobile */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-hidden={!panel.open}
        aria-label={`${panel.title} — story`}
        tabIndex={-1}
        data-lenis-prevent
        className={`fixed z-50 bg-paper text-ink outline-none transition-transform duration-300 ease-out
          inset-x-0 bottom-0 max-h-[85dvh] rounded-t-2xl overflow-y-auto
          md:inset-y-0 md:left-auto md:right-0 md:bottom-auto md:h-full md:max-h-none md:w-[420px] md:rounded-none md:border-l md:border-placeholder
          ${
            panel.open
              ? "translate-x-0 translate-y-0"
              : "translate-y-full md:translate-x-full md:translate-y-0"
          }`}
      >
        <div className="px-6 py-8 md:px-8 md:py-10">
          <button
            type="button"
            onClick={closeStory}
            className="mb-10 text-[13px] uppercase tracking-wide text-meta hover:text-ink transition-colors"
          >
            Close — esc
          </button>
          <p className="text-[13px] text-meta">{panel.year}</p>
          <h2 className="mt-1 text-2xl font-semibold leading-tight md:text-[28px]">
            {panel.title}
          </h2>
          <p className="mt-6 text-[15px] leading-[1.6] whitespace-pre-line">
            {panel.storyText}
          </p>
          {panel.specialThanks ? (
            <p className="mt-8 text-[13px] text-meta">{panel.specialThanks}</p>
          ) : null}
        </div>
      </div>
    </>
  );
}
