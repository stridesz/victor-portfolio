import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HuskyLink } from "./components/HuskyLink";
import { ProjectCard } from "./components/ProjectCard";
import { Reveal } from "./components/Reveal";
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
            <h1 id="hero-title">Victor Qi</h1>
            <div className="hero__actions">
              <Link className="button button--primary" href="/projects">
                View Projects <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <Link className="button button--secondary" href="/about">
                About me <ArrowRight aria-hidden="true" size={18} />
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
                <dd>
                  <HuskyLink href="https://www.northeastern.edu">Northeastern University</HuskyLink>
                </dd>
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
          <Reveal>
            <SectionHeader
              eyebrow="Featured projects"
              title="Current work with enough substance to show."
              description="A short list of projects and communities I am building around student experiences, markets, and useful systems."
            />
          </Reveal>
          <div className="card-grid card-grid--two">
            {projects.map((project, index) => (
              <Reveal className="reveal-card" delay={0.06 + index * 0.08} key={project.name} variant="card">
                <ProjectCard project={project} priority={index === 0} />
              </Reveal>
            ))}
          </div>
          <Reveal className="reveal-link" delay={0.16} variant="fade">
            <Link className="inline-link" href="/projects">
              View full project list <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section-pad section-pad--muted" aria-labelledby="proof-title">
        <div className="container section-stack">
          <Reveal>
            <SectionHeader
              eyebrow="Proof"
              title="A compact record of real operating reps."
              description="Ventures, internships, and execution-heavy work that shaped how I think about business systems."
            />
          </Reveal>
          <div className="proof-grid">
            {proofPoints.map((item, index) => (
              <Reveal className="reveal-card" delay={0.05 + index * 0.06} key={item.label} variant="card">
                <article className="proof-card">
                  <p>{item.label}</p>
                  <h3>{item.metric}</h3>
                  <span>{item.description}</span>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}