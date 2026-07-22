"use client";

import { useEffect, useState, type ReactNode } from "react";
import SmoothScroll from "@/components/SmoothScroll";

export default function Template({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frame = requestAnimationFrame(() => {
      if (reduced) setReducedMotion(true);
      else setShown(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Skip the enter transition entirely for visitors who prefer reduced motion.
  if (reducedMotion) {
    return <SmoothScroll>{children}</SmoothScroll>;
  }

  return (
    <SmoothScroll>
      <div
        className={`transition-[opacity,transform] duration-[240ms] ease-out ${
          shown ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"
        }`}
      >
        {children}
      </div>
    </SmoothScroll>
  );
}
