"use client";

import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import type { MotionStyle } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";
import type { PointerEvent } from "react";
import type { Project } from "../data/site";
import { StatusPill } from "./StatusPill";

type ProjectCardProps = {
  project: Project;
  priority?: boolean;
};

const spring = { stiffness: 240, damping: 28, mass: 0.7 };

export function ProjectCard({ project, priority = false }: ProjectCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const canTilt = useRef(false);
  const rotateXTarget = useMotionValue(0);
  const rotateYTarget = useMotionValue(0);
  const liftTarget = useMotionValue(0);
  const logoXTarget = useMotionValue(0);
  const logoYTarget = useMotionValue(0);
  const rotateX = useSpring(rotateXTarget, spring);
  const rotateY = useSpring(rotateYTarget, spring);
  const y = useSpring(liftTarget, spring);
  const logoX = useSpring(logoXTarget, spring);
  const logoY = useSpring(logoYTarget, spring);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    const syncPointerCapability = () => {
      canTilt.current = finePointer.matches && !shouldReduceMotion;

      if (!canTilt.current) {
        rotateXTarget.set(0);
        rotateYTarget.set(0);
        liftTarget.set(0);
        logoXTarget.set(0);
        logoYTarget.set(0);
      }
    };

    const resetOnBlur = () => {
      rotateXTarget.set(0);
      rotateYTarget.set(0);
      liftTarget.set(0);
      logoXTarget.set(0);
      logoYTarget.set(0);
    };

    syncPointerCapability();
    finePointer.addEventListener("change", syncPointerCapability);
    window.addEventListener("blur", resetOnBlur);

    return () => {
      finePointer.removeEventListener("change", syncPointerCapability);
      window.removeEventListener("blur", resetOnBlur);
    };
  }, [liftTarget, logoXTarget, logoYTarget, rotateXTarget, rotateYTarget, shouldReduceMotion]);

  const resetCard = () => {
    rotateXTarget.set(0);
    rotateYTarget.set(0);
    liftTarget.set(0);
    logoXTarget.set(0);
    logoYTarget.set(0);
  };

  const handlePointerEnter = (event: PointerEvent<HTMLElement>) => {
    if (canTilt.current && event.pointerType === "mouse") {
      liftTarget.set(-4);
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!canTilt.current || event.pointerType !== "mouse") {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;

    rotateXTarget.set(normalizedY * -4);
    rotateYTarget.set(normalizedX * 4);
    logoXTarget.set(normalizedX * 5);
    logoYTarget.set(normalizedY * 5);
  };

  return (
    <motion.article
      className="project-card"
      style={
        {
          "--card-tint": project.tint,
          rotateX,
          rotateY,
          y,
          transformPerspective: 1100,
        } as MotionStyle & Record<"--card-tint", string>
      }
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetCard}
      onPointerCancel={resetCard}
    >
      <div className="project-card__topline">
        <StatusPill>{project.status}</StatusPill>
      </div>

      <div className="project-card__body">
        <motion.div className="project-card__logo-shell" style={{ x: logoX, y: logoY, z: 18 }}>
          <Image
            src={project.logo}
            alt={project.logoAlt}
            width={160}
            height={160}
            className="project-card__logo"
            priority={priority}
          />
        </motion.div>
        <div>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
        </div>
      </div>

      <div className="project-card__tags" aria-label={`${project.name} tags`}>
        {project.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      <a className="project-card__cta" href={project.href} target="_blank" rel="noopener noreferrer">
        Open project <ArrowUpRight aria-hidden="true" size={17} />
      </a>
    </motion.article>
  );
}
