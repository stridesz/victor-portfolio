"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // Instant snaps, no smooth engine.
      return;
    }

    // Lerp mode eases toward the real scroll position every frame, so the page
    // tracks the wheel closely instead of gliding over a fixed duration. Higher
    // `lerp` = snappier/more connected, lower = floatier. This is the dial to taste-tune.
    const lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      wheelMultiplier: 1,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    // Route in-page anchor clicks through Lenis for smooth scrolling.
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      let id: string;
      try {
        id = decodeURIComponent(href.slice(1));
      } catch {
        return;
      }
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -32 });
    };
    document.addEventListener("click", onClick);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Subtle scroll-triggered position shifts for each entry block.
    const blocks = gsap.utils.toArray<HTMLElement>("[data-entry]");
    const triggers = blocks.map((block) =>
      gsap.fromTo(
        block,
        { y: 32 },
        {
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: block,
            start: "top 95%",
            end: "top 40%",
            // A short catch-up (vs. scrub: true) lets the reveal glide instead of
            // snapping frame-for-frame to the scrollbar, which reads as smoother.
            scrub: 0.6,
          },
        }
      )
    );

    return () => {
      document.removeEventListener("click", onClick);
      triggers.forEach((t) => t.scrollTrigger?.kill());
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
