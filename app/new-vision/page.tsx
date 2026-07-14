import { Component } from "@/components/ui/etheral-shadow";
import type { IconType } from "react-icons";
import { FaEnvelope, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";

import { socials } from "@/app/data/site";
import { DinoGame } from "@/app/new-vision/DinoGame";

const socialIcons: Record<string, IconType> = {
  LinkedIn: FaLinkedinIn,
  Instagram: FaInstagram,
  X: FaXTwitter,
  Email: FaEnvelope,
};

export default function NewVisionPage() {
  return (
    <div className="fixed inset-0 z-[100] bg-white">
      <Component
        color="rgba(128, 128, 128, 1)"
        animation={{ scale: 100, speed: 90 }}
        noise={{ opacity: 1, scale: 1.2 }}
        sizing="fill"
        contentStyle={{
          top: "50%",
          left: "clamp(1.5rem, 6vw, 6rem)",
          transform: "translateY(-50%)",
          textAlign: "left",
        }}
      >
        <div className="relative">
          <h1
            className="font-bold text-left whitespace-nowrap"
            style={{ fontSize: "clamp(3.25rem, 7.5vw, 5rem)" }}
          >
            Victor Qi
          </h1>
          <nav aria-label="Social links" className="absolute left-0 top-full -mt-2 flex flex-nowrap gap-2">
            {socials.map((social) => {
              const SocialIcon = socialIcons[social.label];

              return (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex h-8 w-8 items-center justify-center border-none text-[#070707]"
                  style={{ color: "#070707" }}
                >
                  <SocialIcon aria-hidden="true" size={20} />
                </a>
              );
            })}
          </nav>
        </div>
      </Component>
      <DinoGame />
    </div>
  );
}