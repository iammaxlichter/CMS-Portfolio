// /components/Footer.tsx
"use client";

import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { motion, type Variants, type Transition } from "framer-motion";

const container: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 24, staggerChildren: 0.08 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 26 },
  },
};

// If you also pass inline `transition={...}` props elsewhere, typing them helps too:
const hoverTapSpring: Transition = { type: "spring", stiffness: 500, damping: 32 };

export default function Footer() {
  return (
    <footer className="bg-[#343330] text-white">
      <motion.div
        className="mx-auto max-w-5xl px-6 py-10 text-center"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* Social Icons */}
        <motion.div className="mb-5 flex justify-center gap-10" variants={item}>
          <IconLink href="https://github.com/iammaxlichter" label="GitHub" Icon={FaGithub} />
          <IconLink href="https://www.linkedin.com/in/iammaxlichter" label="LinkedIn" Icon={FaLinkedin} />
          <IconLink href="mailto:iammaxlichter@gmail.com" label="Email" Icon={FaEnvelope} />
        </motion.div>

        {/* Name */}
        <motion.p variants={item} className="mt-4 mb-7 text-lg font-medium relative inline-block">
          <span className="relative">
            Max Lichter
            <span className="absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-100 bg-white/60" aria-hidden />
          </span>
        </motion.p>

        {/* Footer Text */}
        <motion.p variants={item} className="text-sm text-gray-300">
          Thanks for stopping by!
        </motion.p>
      </motion.div>
    </footer>
  );
}

function IconLink({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
}) {
  return (
    <motion.a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      aria-label={label}
      className="rounded p-2 text-white/90 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white/40"
      whileHover={{ y: -2, scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      transition={hoverTapSpring}
    >
      <Icon size={20} />
    </motion.a>
  );
}
