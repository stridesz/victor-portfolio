"use client";

import { useEffect, useState, type ReactNode } from "react";
import SmoothScroll from "@/components/SmoothScroll";

export default function Template({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

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
