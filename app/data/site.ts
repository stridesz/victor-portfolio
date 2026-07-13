export type Project = {
  name: string;
  eyebrow: string;
  challenge: string;
  contribution: string;
  signal: string;
  skills: string[];
};

export const projects: Project[] = [
  {
    name: "Tablr",
    eyebrow: "Social dining · Product strategy",
    challenge: "Students want new connections, but most campus social products add friction instead of creating a natural reason to meet.",
    contribution: "Reframed the concept from restaurant discounts to curated small-group dining, shaping the positioning, experience, and early operating model.",
    signal: "Customer discovery, business-model iteration, and product judgment under real margin constraints.",
    skills: ["Product strategy", "Customer discovery", "Go-to-market"],
  },
  {
    name: "RSA Bot",
    eyebrow: "Markets · Research automation",
    challenge: "Reverse-split setups require monitoring fragmented filings and market signals quickly without confusing alerts with investment advice.",
    contribution: "Building an alert-first research system that turns public filing events into structured, reviewable signals for a niche market workflow.",
    signal: "Translates an ambiguous research process into a disciplined system with explicit risk boundaries.",
    skills: ["Workflow design", "Python", "Financial research"],
  },
  {
    name: "Flaxwell & Co.",
    eyebrow: "Textiles · Brand and commerce",
    challenge: "Premium linen products need a credible consumer story without losing the material and supply-chain knowledge behind them.",
    contribution: "Developing the brand direction and commercial thesis at the intersection of linen sourcing, product presentation, and customer trust.",
    signal: "Connects family-industry context with brand strategy, merchandising, and supply-chain thinking.",
    skills: ["Brand strategy", "Supply chain", "Merchandising"],
  },
];

export const experience = [
  ["Stride Retail", "$300K peak annual revenue across resale, FBA, wholesale sourcing, and fulfillment."],
  ["Swipe Signals", "$300K ARR and 150+ five-star reviews; hands-on experience with customers, retention, and operations."],
  ["Huaren Linen", "AI/ERP internship inside an export manufacturer; taught AI fundamentals to 100+ staff."],
  ["Northeastern", "Business Administration, 3.97 GPA; concentrations in Supply Chain Management and Management."],
] as const;
