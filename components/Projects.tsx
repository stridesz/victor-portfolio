"use client";

import { motion } from "framer-motion";
import { ExternalLink, Code, TrendingUp, Users } from "lucide-react";

const projects = [
  {
    title: "Tablr",
    subtitle: "Social dining app for student bonding",
    description:
      "Built a Next.js platform that connects students over curated dining experiences. Pivoted from a discount model to focus on social bonding after market feedback.",
    role: "Co‑founder & Product Lead",
    outcome: "$300K ARR, 150+ 5‑star reviews, featured in entrepreneurship class as pivot case study.",
    tech: ["Next.js", "Tailwind", "Supabase", "Vercel"],
    link: "#",
    icon: <Users className="w-8 h-8" />,
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "RSA Bot",
    subtitle: "Reverse‑split alert system",
    description:
      "Real‑time scanner that detects Nasdaq reverse‑split proposals and sends Discord alerts. Built as an alert‑only, no‑automation watchdog.",
    role: "Solo Developer & Operator",
    outcome: "Monitors 9–5 ET, alerts profitable opportunities, used by small investment group.",
    tech: ["Python", "SQLite", "Cron", "Discord API"],
    link: "#",
    icon: <TrendingUp className="w-8 h-8" />,
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Flaxwell & Co.",
    subtitle: "Linen supply chain consulting",
    description:
      "Consulted for Huaren Linen (China‑based manufacturer) on AI/ERP integration, taught AI Fundamentals to 100+ staff, and supported US market entry.",
    role: "AI/ERP Consulting Intern",
    outcome: "Improved internal workflow efficiency, prepared materials for Avendra/Marriott procurement outreach.",
    tech: ["ERP", "AI Training", "Supply Chain", "B2B Sales"],
    link: "#",
    icon: <Code className="w-8 h-8" />,
    color: "from-amber-500 to-orange-500",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-24 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Selected Projects</h2>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto">
            Built to solve real problems—ranging from fintech alerts to social apps and supply‑chain consulting.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {projects.map((project, idx) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-all duration-300"
            >
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${project.color} mb-6`}>
                {project.icon}
              </div>
              <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
              <p className="text-gray-300 mb-4">{project.subtitle}</p>
              <p className="text-gray-400 mb-6">{project.description}</p>

              <div className="space-y-4 mb-8">
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">{project.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Outcome</p>
                  <p className="font-medium">{project.outcome}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tech</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <a
                href={project.link}
                className="inline-flex items-center gap-2 text-white font-medium hover:text-[#13f235] transition-colors duration-200"
              >
                <span>View details</span>
                <ExternalLink size={18} />
              </a>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <p className="text-gray-400 max-w-2xl mx-auto">
            Also built: <strong>12 Pell</strong> (Pell‑grant advocacy), <strong>Swipe Signals</strong> (NFT analytics),{" "}
            <strong>Stride Retail</strong> (sneaker resale, $300K peak year revenue), and several internal tools.
          </p>
        </motion.div>
      </div>
    </section>
  );
}