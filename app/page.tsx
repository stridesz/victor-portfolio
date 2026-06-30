import type { SVGProps } from "react";
import { Covered_By_Your_Grace } from "next/font/google";

const coverScrawl = Covered_By_Your_Grace({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const socialLinks = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/victor-qi/",
    variant: "linkedin",
    Icon: LinkedInIcon,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/victor.qii/",
    variant: "instagram",
    Icon: InstagramIcon,
  },
  {
    label: "X",
    href: "https://x.com/stridesoles",
    variant: "x",
    Icon: XIcon,
  },
  {
    label: "Email",
    href: "mailto:victorqi0707@gmail.com",
    variant: "email",
    Icon: MailIcon,
  },
];

export default function Home() {
  return (
    <main className="landing-page" aria-label="Victor Qi portfolio landing page">
      <div className="landing-backdrop" />

      <nav className="top-nav" aria-label="Primary navigation">
        <a href="https://github.com/stridesz" target="_blank" rel="noopener noreferrer">
          My Projects
        </a>
        <a href="#about-me">About Me</a>
      </nav>

      <section className="landing-content">
        <h1 className={`${coverScrawl.className} ye-title`} aria-label="I love being Victor it's awesome">
          <span>I love being</span>
          <span>Victor</span>
          <span>it&apos;s awesome</span>
        </h1>

        <nav className="social-links" aria-label="Social links">
          {socialLinks.map(({ label, href, variant, Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className={`social-icon social-${variant}`}
              aria-label={label}
              title={label}
            >
              <Icon aria-hidden="true" />
            </a>
          ))}
        </nav>
      </section>
    </main>
  );
}

function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.45 20.45h-3.56v-5.58c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.32 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13Zm1.78 13.02H3.54V9H7.1v11.45ZM22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0Z" />
    </svg>
  );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.35" cy="6.65" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 2h3.28l-7.16 8.18L23.44 22h-6.6l-5.17-6.76L5.75 22H2.47l7.66-8.75L2.06 2h6.77l4.67 6.17L18.9 2Zm-1.15 17.92h1.82L7.84 3.97H5.9l11.85 15.95Z" />
    </svg>
  );
}

function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.4" />
      <path d="m4.2 7 7.8 6.1L19.8 7" />
    </svg>
  );
}
