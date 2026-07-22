"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useStoryPanel } from "./StoryPanelContext";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export default function StoryPanel() {
  const { panel, closeStory, goNext, goPrev } = useStoryPanel();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const media = panel.media[panel.index];
  const hasMultiple = panel.media.length > 1;

  // Start video playback when the current slot is a video; pause otherwise.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (panel.open && media?.kind === "video") {
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [panel.open, panel.index, media]);

  // Focus management + simple focus trap
  useEffect(() => {
    if (!panel.open) return;
    lastActiveRef.current = document.activeElement as HTMLElement | null;
    const node = panelRef.current;
    const focusables = node?.querySelectorAll<HTMLElement>(FOCUSABLE);
    (focusables?.[0] ?? node)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !node) return;
      // getClientRects() (unlike offsetParent) correctly reports position:fixed controls as visible.
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.getClientRects().length > 0 || el === document.activeElement
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
    <div
      aria-hidden={!panel.open}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ease-out ${
        panel.open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {/* Scrim */}
      <div aria-hidden onClick={closeStory} className="absolute inset-0 bg-black/60" />

      {/* Dialog wrapper stays transform-free so the fixed-position controls pin to the viewport. */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${panel.entryTitle} media viewer`}
        tabIndex={-1}
        data-lenis-prevent
        className="relative z-10 outline-none"
      >
        {/* Close */}
        <button
          type="button"
          onClick={closeStory}
          aria-label="Close"
          className="fixed right-4 top-4 z-20 flex size-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path
              d="M4 4l10 10M14 4L4 14"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Prev / Next — only when the entry has more than one media item */}
        {hasMultiple ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous"
              className="fixed left-2 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 md:left-5"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
                <path
                  d="M13.5 5l-6 6 6 6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next"
              className="fixed right-2 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 md:right-5"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
                <path
                  d="M8.5 5l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        ) : null}

        {/* Media + caption, animated in */}
        <div
          className={`flex max-w-[85vw] flex-col items-center transition-[opacity,transform] duration-[220ms] ease-out ${
            panel.open ? "scale-100 opacity-100" : "scale-[0.96] opacity-0"
          }`}
        >
          {media ? (
            <>
              {media.src && media.kind === "video" ? (
                <video
                  key={media.src}
                  ref={videoRef}
                  src={media.src}
                  poster={media.poster}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[80vh] max-w-[85vw] bg-black"
                />
              ) : media.src ? (
                <Image
                  key={media.src}
                  src={media.src}
                  alt={media.label}
                  width={0}
                  height={0}
                  sizes="85vw"
                  className="h-auto w-auto max-h-[80vh] max-w-[85vw]"
                />
              ) : (
                <div
                  className={`relative bg-placeholder ${media.sizeClass} w-[70vw] max-w-[520px]`}
                >
                  <span className="absolute left-3 top-3 text-[12px] uppercase tracking-wide text-white/60">
                    {media.label}
                  </span>
                </div>
              )}
              <p className="mt-3 max-w-[85vw] text-center text-[14px] text-white/70">
                {media.caption}
              </p>
              {media.externalUrl ? (
                <p className="mt-2 text-[14px] text-white/60">
                  <a
                    href={media.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline underline-offset-2"
                  >
                    ↳ {media.externalLabel ?? "Open original"}
                  </a>
                </p>
              ) : null}
              {hasMultiple ? (
                <p className="mt-3 text-[12px] tabular-nums tracking-wide text-white/50">
                  {panel.index + 1} / {panel.media.length}
                </p>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
