import type { Metadata } from "next";
import Image from "next/image";
import { Covered_By_Your_Grace } from "next/font/google";
import Link from "next/link";

const coverScrawl = Covered_By_Your_Grace({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Projects | Victor Qi",
  description: "Current and past projects by Victor Qi.",
};

const currentProjects = [
  {
    name: "Tablr",
    logo: "/projects/tablr-logo.png",
    logoAlt: "Tablr logo",
  },
  {
    name: "The Fractional Few",
    logo: "/projects/fractional-few-logo.png",
    logoAlt: "The Fractional Few logo",
  },
];

export default function ProjectsPage() {
  return (
    <main className="projects-page">
      <nav className="projects-nav" aria-label="Projects navigation">
        <Link href="/">Home</Link>
        <Link href="/#about-me">About Me</Link>
      </nav>

      <section className="projects-hero" aria-labelledby="projects-title">
        <p className="projects-kicker">Current Projects</p>
        <h1 id="projects-title" className={`${coverScrawl.className} projects-title`}>
          My Projects
        </h1>
      </section>

      <section className="project-list" aria-label="Current projects">
        {currentProjects.map((project, index) => (
          <article className="project-row" key={project.name}>
            <div className="project-index">{String(index + 1).padStart(2, "0")}</div>
            <div className="project-logo-wrap">
              <Image
                src={project.logo}
                alt={project.logoAlt}
                width={900}
                height={900}
                className="project-logo"
                priority={index === 0}
              />
            </div>
            <div className="project-copy">
              <p className="project-status">Currently building</p>
              <h2 className={`${coverScrawl.className} project-name`}>{project.name}</h2>
              <p className="project-placeholder">Description coming soon.</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
