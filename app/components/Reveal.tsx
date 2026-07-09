"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type RevealVariant = "rise" | "card" | "fade";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: RevealVariant;
};

const hiddenByVariant = {
  rise: { opacity: 0, y: 20, scale: 0.995, filter: "blur(7px)" },
  card: { opacity: 0, y: 14, scale: 0.985, filter: "blur(5px)" },
  fade: { opacity: 0, y: 6, scale: 1, filter: "blur(3px)" },
} satisfies Record<RevealVariant, { opacity: number; y: number; scale: number; filter: string }>;

const visible = { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" };

export function Reveal({ children, delay = 0, className, variant = "rise" }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : hiddenByVariant[variant]}
      whileInView={visible}
      viewport={{ once: true, amount: 0.08 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : {
              opacity: { duration: 0.34, delay, ease: "easeOut" },
              filter: { duration: 0.42, delay, ease: "easeOut" },
              y: { type: "spring", stiffness: 190, damping: 24, mass: 0.75, delay },
              scale: { type: "spring", stiffness: 190, damping: 24, mass: 0.75, delay },
            }
      }
    >
      {children}
    </motion.div>
  );
}
