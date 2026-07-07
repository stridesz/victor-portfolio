import { StatusPill } from "./StatusPill";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeader({ eyebrow, title, description, align = "left" }: SectionHeaderProps) {
  return (
    <div className={`section-header section-header--${align}`}>
      <StatusPill tone="muted">{eyebrow}</StatusPill>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
