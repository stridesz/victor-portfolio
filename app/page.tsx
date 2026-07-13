import { ArrowDown, ArrowUpRight } from "lucide-react";
import { ContactForm } from "./components/ContactForm";
import { MotionReveal } from "./components/MotionReveal";
import { experience, projects } from "./data/site";

const socials = [["LinkedIn", "https://www.linkedin.com/in/victor-qi/"], ["Email", "mailto:victorqi0707@gmail.com"]] as const;

export default function Home() {
  return <main>
    <section id="hero" className="hero" aria-labelledby="hero-title">
      <nav className="hero-nav" aria-label="Primary navigation"><a className="wordmark" href="#hero">Victor Qi</a><div><a href="#projects">Projects</a><a href="#experience">Experience</a><a href="#contact">Contact</a></div></nav>
      <div className="hero-heading"><p>Operator · Builder · Northeastern</p><h1 id="hero-title">Victor Qi</h1></div>
      <p className="hero-phrase">I love being Victor its awesome</p>
      <a className="hero-scroll" href="#intro" aria-label="Scroll to introduction"><ArrowDown aria-hidden="true" /></a>
    </section>
    <div className="editorial-page">
      <section id="intro" className="intro section-shell" aria-labelledby="intro-title">
        <MotionReveal><p className="kicker">01 / Profile</p><h2 id="intro-title">I build at the intersection of operations, technology, and customer behavior.</h2></MotionReveal>
        <MotionReveal className="intro-copy" delay={0.08}><p>I’m a Northeastern business student who has operated real ventures, worked inside an export manufacturer, and learned to turn messy processes into practical systems.</p><p>My strongest work combines commercial judgment with execution: understanding the constraint, making the tradeoff, and staying close to the customer.</p></MotionReveal>
      </section>
      <section id="projects" className="section-shell section-block" aria-labelledby="projects-title">
        <MotionReveal className="section-heading"><p className="kicker">02 / Selected projects</p><h2 id="projects-title">Work that shows how I think.</h2><p>Concise case studies focused on the problem, my contribution, and the signal each project provides.</p></MotionReveal>
        <div className="project-list">{projects.map((project,index)=><MotionReveal className="project-wrap" delay={index*.06} key={project.name}><article className="project-case"><header><span>0{index+1}</span><p>{project.eyebrow}</p><h3>{project.name}</h3></header><dl><div><dt>Challenge</dt><dd>{project.challenge}</dd></div><div><dt>Contribution</dt><dd>{project.contribution}</dd></div><div><dt>Recruiter signal</dt><dd>{project.signal}</dd></div></dl><ul aria-label={`${project.name} skills`}>{project.skills.map(skill=><li key={skill}>{skill}</li>)}</ul></article></MotionReveal>)}</div>
      </section>
      <section id="experience" className="section-shell section-block" aria-labelledby="experience-title">
        <MotionReveal className="section-heading"><p className="kicker">03 / Evidence</p><h2 id="experience-title">A record of operating reps.</h2></MotionReveal>
        <div className="experience-list">{experience.map(([name,detail],index)=><MotionReveal key={name} delay={index*.04}><article><span>0{index+1}</span><h3>{name}</h3><p>{detail}</p></article></MotionReveal>)}</div>
      </section>
      <section id="contact" className="section-shell section-block contact" aria-labelledby="contact-title">
        <MotionReveal className="contact-intro"><p className="kicker">04 / Contact</p><h2 id="contact-title">Let’s talk about work worth doing.</h2><p>For internships, operating roles, and thoughtful collaborations.</p><div className="social-links">{socials.map(([label,href])=><a key={label} href={href} target={href.startsWith("http")?"_blank":undefined} rel={href.startsWith("http")?"noopener noreferrer":undefined}>{label}<ArrowUpRight aria-hidden="true" size={16}/></a>)}</div></MotionReveal>
        <MotionReveal delay={0.08}><ContactForm /></MotionReveal>
      </section>
      <footer className="section-shell footer"><p>Victor Qi</p><p>Built with restraint. No invented outcomes.</p></footer>
    </div>
  </main>;
}
