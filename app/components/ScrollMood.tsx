"use client";

import { useEffect } from "react";

// While the Featured Projects section owns the middle of the viewport, the page
// shifts into "projects" mood: the background warms to a light green suede and
// the ambient grid becomes falling green rain streaks (see globals.css + AmbientGrid,
// which both react to the data-mood attribute on <html>). It reverts as soon as
// the hero above or the Proof section below takes over.
export function ScrollMood() {
  useEffect(() => {
    const section = document.getElementById("projects");
    const root = document.documentElement;

    // Only the home page has the Featured Projects section.
    if (!(section instanceof HTMLElement)) {
      root.removeAttribute("data-mood");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const active = entries[0]?.isIntersecting ?? false;
        root.setAttribute("data-mood", active ? "projects" : "default");
      },
      // Shrink the root to a central band so the mood is only on while the
      // section is genuinely centered — not the moment it peeks into view.
      { rootMargin: "-38% 0px -38% 0px", threshold: 0 },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      root.removeAttribute("data-mood");
    };
  }, []);

  return null;
}
