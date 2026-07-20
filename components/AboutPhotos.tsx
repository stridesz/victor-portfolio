"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { aboutPhotos } from "@/data/about";
import type { MediaSlot } from "@/data/entries";
import { useStoryPanel } from "./StoryPanelContext";

const ADVANCE_MS = 5500;

export default function AboutPhotos() {
  const { openStory } = useStoryPanel();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const photos = aboutPhotos;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => {
      setReducedMotion(media.matches);
      if (media.matches) setAutoPlayEnabled(false);
    };

    syncPreference();
    media.addEventListener("change", syncPreference);
    return () => media.removeEventListener("change", syncPreference);
  }, []);

  // Auto-advance when enabled; temporarily pause while the gallery is being used.
  useEffect(() => {
    if (!autoPlayEnabled || interactionPaused || photos.length < 2) return;
    const id = window.setInterval(() => {
      setPhotoIndex((i) => (i + 1) % photos.length);
    }, ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [autoPlayEnabled, interactionPaused, photos.length]);

  if (photos.length === 0) {
    return (
      <div className="relative flex aspect-[4/3] max-h-[55vh] w-full items-center justify-center bg-placeholder">
        <span className="text-[12px] uppercase tracking-wide text-meta">
          Photos coming soon
        </span>
      </div>
    );
  }

  const openPhoto = () => {
    const photo = photos[photoIndex];
    const slot: MediaSlot = {
      label: photo.alt,
      kind: "photo",
      caption: photo.caption,
      sizeClass: photo.sizeClass,
      src: photo.src,
    };
    openStory({ entryTitle: "About · Photos", media: slot });
  };

  return (
    <div
      onMouseEnter={() => setInteractionPaused(true)}
      onMouseLeave={() => setInteractionPaused(false)}
      onFocus={() => setInteractionPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setInteractionPaused(false);
        }
      }}
    >
      <div className="relative aspect-[4/3] max-h-[55vh] w-full overflow-hidden bg-placeholder">
        <button
          type="button"
          onClick={openPhoto}
          aria-label={`View photo: ${photos[photoIndex].alt}`}
          className="absolute inset-0 block h-full w-full cursor-pointer"
        >
          {photos.map((photo, i) => (
            <span
              key={photo.src}
              aria-hidden={i !== photoIndex}
              className={`absolute inset-0 ${
                reducedMotion ? "" : "transition-opacity duration-700 ease-out"
              } ${
                i === photoIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={photo.src}
                alt=""
                fill
                className="object-contain"
                sizes="(min-width: 1024px) 768px, (min-width: 768px) calc(100vw - 80px), calc(100vw - 48px)"
              />
            </span>
          ))}
        </button>

        {/* One indicator per photo: emoji when the photo has one, otherwise a dot */}
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full bg-white/70 px-4 py-2 backdrop-blur-sm">
          {photos.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => setPhotoIndex(i)}
              aria-label={`Go to photo ${i + 1} of ${photos.length}: ${photo.alt}`}
              aria-pressed={i === photoIndex}
              className="flex items-center justify-center transition-opacity"
            >
              {photo.icon ? (
                <span
                  aria-hidden
                  className={`text-[16px] leading-none transition-opacity ${
                    i === photoIndex ? "opacity-100" : "opacity-35 hover:opacity-70"
                  }`}
                >
                  {photo.icon}
                </span>
              ) : (
                <span
                  aria-hidden
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i === photoIndex ? "bg-ink" : "bg-meta/50 hover:bg-meta"
                  }`}
                />
              )}
            </button>
          ))}
          <span aria-hidden className="h-4 w-px bg-ink/15" />
          <button
            type="button"
            onClick={() => setAutoPlayEnabled((enabled) => !enabled)}
            aria-label={autoPlayEnabled ? "Pause photo carousel" : "Play photo carousel"}
            className="flex size-4 items-center justify-center text-ink transition-colors hover:text-meta"
          >
            {autoPlayEnabled ? (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
                <rect x="2" y="1" width="2" height="8" />
                <rect x="6" y="1" width="2" height="8" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
                <path d="M2.5 1.25v7.5L8.5 5z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
