"use client";

import Image from "next/image";
import { useEffect, useState, type ComponentType } from "react";
import { photoCategories } from "@/data/about";
import type { MediaSlot } from "@/data/entries";
import { useStoryPanel } from "./StoryPanelContext";

const ADVANCE_MS = 5500;

function GridIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </svg>
  );
}

function PawIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden
    >
      <ellipse cx="8" cy="10.5" rx="3" ry="2.5" />
      <circle cx="4" cy="7" r="1.2" />
      <circle cx="6.5" cy="4.8" r="1.2" />
      <circle cx="9.5" cy="4.8" r="1.2" />
      <circle cx="12" cy="7" r="1.2" />
    </svg>
  );
}

const CATEGORY_ICONS: Record<string, ComponentType> = {
  everything: GridIcon,
  wiggles: PawIcon,
};

export default function AboutPhotos() {
  const { openStory } = useStoryPanel();
  const [catIndex, setCatIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const category = photoCategories[catIndex];
  const photos = category.photos;

  // Auto-advance within the active category; paused on hover/focus
  useEffect(() => {
    if (paused || photos.length < 2) return;
    const id = window.setInterval(() => {
      setPhotoIndex((i) => (i + 1) % photos.length);
    }, ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [paused, catIndex, photos.length]);

  const selectCategory = (i: number) => {
    setCatIndex(i);
    setPhotoIndex(0);
  };

  const openPhoto = () => {
    const photo = photos[photoIndex];
    const slot: MediaSlot = {
      label: photo.alt,
      kind: "photo",
      caption: photo.caption,
      sizeClass: photo.sizeClass,
      src: photo.src,
    };
    openStory({ entryTitle: `About · ${category.label}`, media: slot });
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

        {/* Floating pill nav: one icon per category + dots for the active category */}
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-2 backdrop-blur">
          {photoCategories.map((cat, i) => {
            const Icon = CATEGORY_ICONS[cat.id] ?? GridIcon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => selectCategory(i)}
                aria-label={`Show ${cat.label} photos`}
                aria-pressed={i === catIndex}
                className={`transition-colors ${
                  i === catIndex ? "text-ink" : "text-meta hover:text-ink"
                }`}
              >
                <Icon />
              </button>
            );
          })}
          <span className="flex items-center gap-1.5 px-1">
            {photos.map((photo, i) => (
              <button
                key={photo.src}
                type="button"
                onClick={() => setPhotoIndex(i)}
                aria-label={`Go to photo ${i + 1} of ${photos.length}`}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === photoIndex ? "bg-ink" : "bg-meta/50 hover:bg-meta"
                }`}
              />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
