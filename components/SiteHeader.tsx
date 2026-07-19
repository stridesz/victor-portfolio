"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAbout = pathname === "/about";

  return (
    <header className="flex items-baseline justify-between pt-10 md:pt-14">
      <div className="flex items-baseline gap-4">
        {isHome ? (
          <h1 className="text-[32px] font-medium leading-none md:text-[40px]">
            Victor Qi
          </h1>
        ) : (
          <Link
            href="/"
            className="text-[32px] font-medium leading-none transition-colors hover:text-meta md:text-[40px]"
          >
            Victor Qi
          </Link>
        )}
        <span className="text-[13px] text-meta md:text-sm">2026</span>
      </div>
      <nav className="flex gap-6 text-[13px] md:text-sm">
        <Link
          href="/about"
          className={`transition-colors hover:text-meta ${
            isAbout ? "text-ink underline underline-offset-4" : ""
          }`}
        >
          About
        </Link>
        <a
          href="https://www.linkedin.com/in/victor-qi"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-meta"
        >
          LinkedIn
        </a>
        <a
          href="mailto:victorqi0707@gmail.com"
          className="transition-colors hover:text-meta"
        >
          Email
        </a>
      </nav>
    </header>
  );
}
