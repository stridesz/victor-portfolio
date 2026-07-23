import { type ReactNode } from "react";
import SmoothScroll from "@/components/SmoothScroll";

// Route enter animation lives in CSS (.page-enter + @starting-style in globals.css):
// no JS, so it can't strand content invisible if hydration is slow, and it replays on
// every navigation because Next remounts this template — a fresh DOM node re-fires
// @starting-style. Reduced motion is handled in the same CSS block.
export default function Template({ children }: { children: ReactNode }) {
  return (
    <SmoothScroll>
      <div className="page-enter">{children}</div>
    </SmoothScroll>
  );
}
