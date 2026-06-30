"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.jpg"
          alt="Mountain landscape hero background"
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto px-6 text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Business student,{" "}
            <span className="text-[#13f235]">operator</span>, and builder of
            projects that bridge technology and strategy.
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl">
            Northeastern University · AI/ERP Consulting · Fintech · SaaS · Supply Chain
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            <motion.a
              href="#projects"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-[#13f235] text-black font-bold text-lg rounded-full hover:bg-[#10d32d] transition-colors duration-200 shadow-lg"
            >
              View projects
            </motion.a>
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 border-2 border-white text-white font-bold text-lg rounded-full hover:bg-white hover:text-black transition-all duration-200"
            >
              Get in touch
            </motion.a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-6 text-left"
        >
          <p className="text-[#13f235] text-2xl md:text-3xl font-mono tracking-wide">
            I love being Victor it's awesome
          </p>
          <p className="text-gray-400 text-sm mt-2">(Inspired by Kanye's "ye" album cover)</p>
        </motion.div>
      </div>

      <div className="absolute bottom-10 right-10">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-gray-400"
        >
          <span className="block text-sm">Scroll down</span>
          <div className="mx-auto mt-2 w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}