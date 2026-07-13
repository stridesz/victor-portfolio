import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "../data/site";

type ProjectCardProps = {
  project: Project;
  priority?: boolean;
  index: number;
};

export function ProjectCard({ project, priority = false, index }: ProjectCardProps) {
  return (
    <article className={`project-card project-card--${index + 1}`}>
      <div className="project-card__topline">
        <span>0{index + 1} / 02</span>
        <span>{project.status}</span>
      </div>
      <div className="project-card__identity">
        <div className="project-card__logo-shell">
          <Image
            src={project.logo}
            alt={project.logoAlt}
            width={120}
            height={120}
            className="project-card__logo"
            priority={priority}
          />
        </div>
        <h3>{project.name}</h3>
      </div>
      <p className="project-card__description">{project.description}</p>
      <p className="project-card__tags">{project.tags.join(" · ")}</p>
      <a className="project-card__cta" href={project.href} target="_blank" rel="noopener noreferrer">
        Open {project.name} <ArrowUpRight aria-hidden="true" size={17} />
      </a>
    </article>
  );
}
