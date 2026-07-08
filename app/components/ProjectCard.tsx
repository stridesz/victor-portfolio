"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "../data/site";
import { StatusPill } from "./StatusPill";

type ProjectCardProps = {
  project: Project;
  priority?: boolean;
};

export function ProjectCard({ project, priority = false }: ProjectCardProps) {
  return (
    <motion.article className="project-card" whileHover={{ y: -6 }}>

      <div className="project-card__topline">
        <StatusPill>{project.status}</StatusPill>
      </div>

      <div className="project-card__body">
        <div className="project-card__logo-shell">
          <Image
            src={project.logo}
            alt={project.logoAlt}
            width={160}
            height={160}
            className="project-card__logo"
            priority={priority}
          />
        </div>
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
