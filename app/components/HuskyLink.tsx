"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

export function HuskyLink({ children, href }: { children: React.ReactNode; href: string }) {
  const shouldReduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  if (shouldReduceMotion) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="husky-link"
      >
        {children}
      </a>
    );
  }

  return (
    <span
      className="husky-link-wrap"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <a href={href} target="_blank" rel="noopener noreferrer" className="husky-link">
        {children}
      </a>
      <motion.span
        className="husky-link__emoji"
        initial={{ opacity: 0, scale: 0, y: 8, rotate: 0 }}
        animate={
          hovered
            ? {
                opacity: [0, 1, 1, 1, 1, 0],
                scale: [0, 1.35, 1, 1.1, 1.1, 0.4],
                rotate: [0, 5, 0, -22, -22, -30],
                y: [8, -4, -2, -6, -6, -14],
              }
            : { opacity: 0, scale: 0, y: 8, rotate: 0 }
        }
        transition={{
          duration: 1.6,
          times: [0, 0.12, 0.25, 0.45, 0.7, 1],
          ease: [0.16, 1, 0.3, 1],
        }}
        aria-hidden="true"
      >
        🐺
      </motion.span>
    </span>
  );
}