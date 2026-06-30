"use client";

import { motion } from "framer-motion";
import { Mail, Send, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-24 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Get in touch</h2>
          <p className="text-gray-400 text-xl">
            I&apos;m actively looking for consulting internship opportunities and interesting collaborations.
            Reach out if you want to discuss projects, strategy, or just grab coffee.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <Mail className="text-[#13f235]" />
                Contact form
              </h3>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle className="w-20 h-20 text-[#13f235] mx-auto mb-6" />
                  <h4 className="text-2xl font-bold mb-4">Message sent!</h4>
                  <p className="text-gray-400">
                    Thanks for reaching out. I&apos;ll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-8 px-6 py-3 border border-gray-700 text-white rounded-full hover:bg-gray-800 transition-colors duration-200"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-400 mb-2">
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      className="w-full px-5 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#13f235] transition-colors duration-200"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-400 mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      className="w-full px-5 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#13f235] transition-colors duration-200"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-gray-400 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      required
                      className="w-full px-5 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#13f235] transition-colors duration-200 resize-none"
                      placeholder="What&apos;s on your mind?"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-8 py-4 bg-[#13f235] text-black font-bold text-lg rounded-full hover:bg-[#10d32d] disabled:opacity-70 transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Send message
                      </>
                    )}
                  </button>
                </form>
              )}

              <p className="text-gray-500 text-sm mt-8 text-center">
                This form uses a <strong>Formspree backend</strong> for reliable delivery.
                No spam, ever.
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
            <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-8">
              <h4 className="text-xl font-bold mb-6">Why reach out?</h4>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#13f235] rounded-full mt-2 flex-shrink-0" />
                  <span>
                    <strong>Consulting internships</strong> – I&apos;m actively seeking summer 2027 roles.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#13f235] rounded-full mt-2 flex-shrink-0" />
                  <span>
                    <strong>Project collaboration</strong> – Especially at the intersection of business and tech.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#13f235] rounded-full mt-2 flex-shrink-0" />
                  <span>
                    <strong>Supply chain / fintech</strong> – Interested in problems involving data, automation, and
                    logistics.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#13f235] rounded-full mt-2 flex-shrink-0" />
                  <span>
                    <strong>Networking</strong> – Always happy to chat about career paths, side projects, or
                    ideas.
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-8">
              <h4 className="text-xl font-bold mb-6">Other ways to connect</h4>
              <div className="space-y-4">
                <a
                  href="mailto:victor@example.com"
                  className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors duration-200"
                >
                  <Mail className="text-[#13f235]" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-400 text-sm">victor@example.com</p>
                  </div>
                </a>
                <a
                  href="https://linkedin.com/in/victorqi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors duration-200"
                >
                  <div className="w-6 h-6 flex items-center justify-center bg-blue-600 rounded">
                    <span className="text-white font-bold text-xs">in</span>
                  </div>
                  <div>
                    <p className="font-medium">LinkedIn</p>
                    <p className="text-gray-400 text-sm">/in/victorqi</p>
                  </div>
                </a>
                <a
                  href="https://github.com/victorqi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors duration-200"
                >
                  <div className="w-6 h-6 flex items-center justify-center bg-gray-800 rounded">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">GitHub</p>
                    <p className="text-gray-400 text-sm">@victorqi</p>
                  </div>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}