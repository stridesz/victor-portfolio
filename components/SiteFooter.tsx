export default function SiteFooter() {
  return (
    <footer className="flex items-center justify-between gap-4 border-t border-placeholder py-10 text-[13px] text-meta">
      <span className="whitespace-nowrap">Victor Qi 2026</span>
      <a
        href="mailto:victorqi0707@gmail.com"
        className="whitespace-nowrap transition-colors hover:text-ink focus-visible:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink"
      >
        victorqi0707@gmail.com
      </a>
    </footer>
  );
}
