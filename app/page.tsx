import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { ProjectCard } from "./components/ProjectCard";
import { SectionHeader } from "./components/SectionHeader";
import { SiteFooter } from "./components/SiteFooter";
import { SiteNav } from "./components/SiteNav";
import { StatusPill } from "./components/StatusPill";
import { projects, proofPoints, socials } from "./data/site";

export default function Home() {
  return (
    <main className="site-shell">
      <SiteNav />

      <section className="hero section-pad" aria-labelledby="hero-title">
        <div className="container hero__grid">
          <div className="hero__copy">
            <StatusPill tone="muted">Business · AI · Operations</StatusPill>
            <h1 id="hero-title">Victor Qi</h1>
            <p>
              Business student, builder, and systems operator working across startups, AI, operations, and supply
              chain.
            </p>
            <div className="hero__actions">
              <Link className="button button--primary" href="/projects">
                View Projects <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <a className="button button--secondary" href="#contact">
                Contact Me <Mail aria-hidden="true" size={18} />
              </a>
            </div>
          </div>

          <aside className="intro-card" aria-label="Victor Qi profile snapshot">
            <span>Profile</span>
            <p>
              Northeastern business student with operating reps across resale, subscription products, events,
              campus-facing startups, and AI/ERP work inside a linen export business.
            </p>
            <dl>
              <div>
                <dt>Focus</dt>
                <dd>Supply chain, AI systems, operations</dd>
              </div>
              <div>
                <dt>Builder mode</dt>
                <dd>Useful products, cleaner handoffs, real execution</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="section-pad" id="projects" aria-labelledby="projects-title">
        <div className="container section-stack">
          <SectionHeader
            eyebrow="Featured projects"
            title="Current work with enough substance to show."
            description="A short list of projects and communities I am building around student experiences, markets, and useful systems."
          />
          <div className="card-grid card-grid--two">
            {projects.map((project, index) => (
              <ProjectCard key={project.name} project={project} priority={index === 0} />
            ))}
          </div>
          <Link className="inline-link" href="/projects">
            View full project list <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
      </section>

      <section className="section-pad section-pad--muted" aria-labelledby="proof-title">
        <div className="container section-stack">
          <SectionHeader
            eyebrow="Proof"
            title="A compact record of real operating reps."
            description="Ventures, internships, and execution-heavy work that shaped how I think about business systems."
          />
          <div className="proof-grid">
            {proofPoints.map((item) => (
              <article className="proof-card" key={item.label}>
                <p>{item.label}</p>
                <h3>{item.metric}</h3>
                <span>{item.description}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad" aria-labelledby="blog-preview-title">
        <div className="container writing-panel">
          <SectionHeader
            eyebrow="Writing"
            title="Notes will live here when they earn the space."
            description="No essays published yet. The good ones take a minute."
          />
          <Link className="button button--secondary" href="/blog">
            View notes <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </div>
      </section>

      <section className="section-pad contact-section" id="contact" aria-labelledby="contact-title">
        <div className="container contact-card">
          <div>
            <StatusPill tone="muted">Contact</StatusPill>
            <h2 id="contact-title">Have something worth building?</h2>
            <p>Send a note if there is a project, role, or problem where clean execution matters.</p>
          </div>
          <div className="contact-links">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target={social.href.startsWith("http") ? "_blank" : undefined}
                rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                {social.label} <ArrowRight aria-hidden="true" size={16} />
              </a>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
