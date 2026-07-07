import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProjectCard } from "../components/ProjectCard";
import { SectionHeader } from "../components/SectionHeader";
import { SiteFooter } from "../components/SiteFooter";
import { SiteNav } from "../components/SiteNav";
import { StatusPill } from "../components/StatusPill";
import { projects } from "../data/site";

export default function ProjectsPage() {
  return (
    <main className="site-shell page-shell">
      <SiteNav />

      <section className="section-pad page-hero" aria-labelledby="projects-page-title">
        <div className="container section-stack">
          <Link className="back-link" href="/">
            <ArrowLeft aria-hidden="true" size={16} /> Home
          </Link>
          <StatusPill tone="muted">Projects</StatusPill>
          <h1 id="projects-page-title">Projects</h1>
          <p>
            A focused list of current projects, communities, and experiments, with room for fuller case studies once
            the work deserves the space.
          </p>
        </div>
      </section>

      <section className="section-pad section-pad--tight">
        <div className="container section-stack">
          <SectionHeader
            eyebrow="Current work"
            title="The projects open right now."
            description="No inflated press-release copy — just the projects currently moving."
          />
          <div className="card-grid card-grid--two">
            {projects.map((project, index) => (
              <ProjectCard key={project.name} project={project} priority={index === 0} />
            ))}
          </div>
          <div className="future-panel">
            <span>writeup queue</span>
            <p>Future project writeups can slot here once there is enough useful detail to make them worth reading.</p>
            <Link className="inline-link" href="/#contact">
              Ask about a project <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
