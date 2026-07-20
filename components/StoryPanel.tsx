"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useStoryPanel } from "./StoryPanelContext";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export default function StoryPanel() {
  const { panel, closeStory } = useStoryPanel();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Pause the reel when the lightbox closes (it stays mounted off-screen)
  useEffect(() => {
    if (!panel.open) videoRef.current?.pause();
  }, [panel.open]);

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

  const media = panel.media;

  return (
    <div
      aria-hidden={!panel.open}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ease-out ${
        panel.open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {/* Scrim */}
      <div aria-hidden onClick={closeStory} className="absolute inset-0 bg-black/60" />

      {/* Centered lightbox: media + caption only */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${panel.entryTitle} media viewer`}
        tabIndex={-1}
        data-lenis-prevent
        className={`relative z-10 flex max-w-[85vw] flex-col items-center outline-none transition-[opacity,transform] duration-[220ms] ease-out ${
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
                playsInline
                className="max-h-[80vh] max-w-[85vw] bg-black"
              />
            ) : media.src ? (
              <Image
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
          </>
        ) : null}
      </div>
    </div>
  );
}
