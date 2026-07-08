import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
            <p className="hero__kicker">Northeastern University · Class of 2029</p>
            <h1 id="hero-title">Victor Qi</h1>
            <div className="hero__actions">
              <Link className="button button--primary" href="/projects">
                View Projects <ArrowRight aria-hidden="true" size={18} />
              </Link>
            </div>
          </div>

          <aside className="hero-contact-card" aria-label="Contact methods">
            <StatusPill tone="muted">Contact</StatusPill>
            <div className="hero-contact-links" aria-label="Contact links">
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
          </aside>

          <aside className="intro-card intro-card--facts" id="profile" aria-label="Victor Qi profile snapshot">
            <span>Profile</span>
            <dl>
              <div>
                <dt>Education</dt>
                <dd>Northeastern University</dd>
              </div>
              <div>
                <dt>Class</dt>
                <dd>2029</dd>
              </div>
              <div>
                <dt>Year</dt>
                <dd>Sophomore</dd>
              </div>
              <div>
                <dt>Major</dt>
                <dd>Business Administration</dd>
              </div>
              <div>
                <dt>Concentrations</dt>
                <dd>Supply Chain Management &amp; Management</dd>
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
