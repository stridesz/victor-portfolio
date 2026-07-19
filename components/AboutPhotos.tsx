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
  const [paused, setPaused] = useState(false);

  const photos = aboutPhotos;

  // Auto-advance; paused on hover/focus
  useEffect(() => {
    if (paused || photos.length < 2) return;
    const id = window.setInterval(() => {
      setPhotoIndex((i) => (i + 1) % photos.length);
    }, ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [paused, photos.length]);

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
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
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
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                i === photoIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={photo.src}
                alt=""
                fill
                className="object-cover"
                sizes="(min-width: 768px) 60vw, 100vw"
              />
            </span>
          ))}
        </button>

        {/* One indicator per photo: emoji when the photo has one, otherwise a dot */}
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-white/70 px-3 py-1.5 backdrop-blur-sm">
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
                  className={`text-[13px] leading-none transition-opacity ${
                    i === photoIndex ? "opacity-100" : "opacity-35 hover:opacity-70"
                  }`}
                >
                  {photo.icon}
                </span>
              ) : (
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    i === photoIndex ? "bg-ink" : "bg-meta/50 hover:bg-meta"
                  }`}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
