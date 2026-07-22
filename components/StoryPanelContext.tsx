"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { MediaSlot } from "@/data/entries";

type StoryPanelState = {
  open: boolean;
  entryTitle: string;
  /** All media for the opened entry, so the viewer can page through them. */
  media: MediaSlot[];
  /** Index of the currently shown slot within `media`. */
  index: number;
};

export type OpenStoryPayload = {
  entryTitle: string;
  media: MediaSlot[];
  index?: number;
};

const StoryPanelContext = createContext<{
  panel: StoryPanelState;
  openStory: (payload: OpenStoryPayload) => void;
  closeStory: () => void;
  goNext: () => void;
  goPrev: () => void;
} | null>(null);

export function useStoryPanel() {
  const ctx = useContext(StoryPanelContext);
  if (!ctx) throw new Error("useStoryPanel must be used inside StoryPanelProvider");
  return ctx;
}

const CLOSED: StoryPanelState = {
  open: false,
  entryTitle: "",
  media: [],
  index: 0,
};

export function StoryPanelProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<StoryPanelState>(CLOSED);

  const openStory = useCallback((payload: OpenStoryPayload) => {
    setPanel({
      open: true,
      entryTitle: payload.entryTitle,
      media: payload.media,
      index: payload.index ?? 0,
    });
  }, []);

  const closeStory = useCallback(() => {
    setPanel((p) => ({ ...p, open: false }));
  }, []);

  // Wrap around at both ends so paging through a gallery never dead-ends.
  const goNext = useCallback(() => {
    setPanel((p) =>
      p.media.length < 2 ? p : { ...p, index: (p.index + 1) % p.media.length }
    );
  }, []);

  const goPrev = useCallback(() => {
    setPanel((p) =>
      p.media.length < 2
        ? p
        : { ...p, index: (p.index - 1 + p.media.length) % p.media.length }
    );
  }, []);

  useEffect(() => {
    if (!panel.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeStory();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panel.open, closeStory, goNext, goPrev]);

  // Lock page scroll while the lightbox is open
  useEffect(() => {
    if (!panel.open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [panel.open]);

  return (
    <StoryPanelContext.Provider
      value={{ panel, openStory, closeStory, goNext, goPrev }}
    >
      {children}
    </StoryPanelContext.Provider>
  );
}
