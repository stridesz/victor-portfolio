import { StatusPill } from "./StatusPill";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  headingId?: string;
};

export function SectionHeader({ eyebrow, title, description, align = "left", headingId }: SectionHeaderProps) {
  return (
    <div className={`section-header section-header--${align}`}>
      <StatusPill tone="muted">{eyebrow}</StatusPill>
      <h2 id={headingId}>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
