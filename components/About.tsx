"use client";

import { motion } from "framer-motion";
import { GraduationCap, Briefcase, MapPin, Award } from "lucide-react";

export default function About() {
  const highlights = [
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: "Northeastern University",
      desc: "Business/Management, 3.97 GPA · NYC Scholar, Boston · Adding Supply Chain concentration.",
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: "Current Focus",
      desc: "Consulting internship search, maintaining GPA, strengthening resume, learning options trading carefully.",
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Long‑Term Goal",
      desc: "Lead the family linen business in China (top‑3 US linen exporter from China).",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Recent Experience",
      desc: "Huaren Linen AI/ERP consulting (Shenzhen), Alibaba Shenzhen AI class (June 2026).",
    },
  ];

  return (
    <section id="about" className="py-24 bg-black">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              About <span className="text-[#13f235]">Victor</span>
            </h2>
            <div className="space-y-6 text-gray-300 text-lg">
              <p>
                I&apos;m a Northeastern business student with an operator&apos;s mindset—building projects that sit at the
                intersection of technology, finance, and real‑world supply chains.
              </p>
              <p>
                My summer 2026 internship at <strong>Huaren Linen</strong> (Shenzhen) involved AI/ERP consulting and
                teaching AI fundamentals to 100+ staff. Before that, I co‑founded <strong>Tablr</strong> (social dining
                app), ran <strong>Stride Retail</strong> ($300K sneaker resale), and built the{" "}
                <strong>RSA Bot</strong> for reverse‑split alerts.
              </p>
              <p>
                I approach problems with a blend of business strategy and technical execution—whether it&apos;s improving
                linen procurement workflows or deploying a real‑time financial scanner.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {highlights.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ x: 10 }}
                className="flex gap-6 p-6 bg-gray-900/50 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all duration-300"
              >
                <div className="flex-shrink-0">
                  <div className="p-3 bg-gradient-to-br from-[#13f235]/20 to-transparent rounded-xl">
                    {item.icon}
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 p-8 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-2xl"
        >
          <h3 className="text-2xl font-bold mb-6">Why consulting?</h3>
          <p className="text-gray-300 max-w-3xl">
            I&apos;m pursuing consulting to sharpen problem‑solving before stepping into the family business. The
            rigor of case work, exposure to diverse industries, and rapid iteration align with how I&apos;ve built
            projects—identifying gaps, designing solutions, and executing with measurable outcomes.
          </p>
        </motion.div>
      </div>
    </section>
  );
}