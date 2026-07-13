import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";
import type { Project } from "../data/site";

type ProjectCardProps = {
  project: Project;
  priority?: boolean;
  index: number;
};

export function ProjectCard({ project, priority = false, index }: ProjectCardProps) {
  const cardStyle = {
    "--project-tint": project.tint,
  } as CSSProperties & { "--project-tint": string };

  return (
    <article className={`project-card project-card--${index + 1}`} style={cardStyle}>
      <div className="project-card__visual">
        <Image
          src={project.logo}
          alt={project.logoAlt}
          width={240}
          height={240}
          className="project-card__logo"
          priority={priority}
        />
      </div>
      <div className="project-card__caption">
        <div className="project-card__topline">
          <span>0{index + 1} / 02</span>
          <span>{project.status}</span>
        </div>
        <h3>{project.name}</h3>
        <p className="project-card__description">{project.description}</p>
        <a className="project-card__cta" href={project.href} target="_blank" rel="noopener noreferrer">
          Open {project.name} <ArrowUpRight aria-hidden="true" size={17} />
        </a>
      </div>
    </article>
  );
}
