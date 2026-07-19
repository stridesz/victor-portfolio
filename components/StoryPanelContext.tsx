"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type StoryPanelState = {
  open: boolean;
  title: string;
  year: string;
  storyText: string;
  specialThanks?: string;
};

export type OpenStoryPayload = Omit<StoryPanelState, "open">;

const StoryPanelContext = createContext<{
  panel: StoryPanelState;
  openStory: (payload: OpenStoryPayload) => void;
  closeStory: () => void;
} | null>(null);

export function useStoryPanel() {
  const ctx = useContext(StoryPanelContext);
  if (!ctx) throw new Error("useStoryPanel must be used inside StoryPanelProvider");
  return ctx;
}

const CLOSED: StoryPanelState = {
  open: false,
  title: "",
  year: "",
  storyText: "",
};

export function StoryPanelProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<StoryPanelState>(CLOSED);

  const openStory = useCallback((payload: OpenStoryPayload) => {
    setPanel({ open: true, ...payload });
  }, []);

  const closeStory = useCallback(() => {
    setPanel((p) => ({ ...p, open: false }));
  }, []);

  useEffect(() => {
    if (!panel.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeStory();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panel.open, closeStory]);

  return (
    <StoryPanelContext.Provider value={{ panel, openStory, closeStory }}>
      {children}
    </StoryPanelContext.Provider>
  );
}
