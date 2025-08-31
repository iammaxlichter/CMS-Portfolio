// /components/Footer.tsx
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#343330] text-center text-white py-8">
      {/* Social Icons */}
      <div className="flex justify-center space-x-10 mb-4">
        <a
          href="https://github.com/iammaxlichter"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-400"
        >
          <FaGithub size={18} />
        </a>
        <a
          href="https://www.linkedin.com/in/iammaxlichter"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-400"
        >
          <FaLinkedin size={18} />
        </a>
        <a
          href="mailto:iammaxlichter@gmail.com"
          className="hover:text-gray-400"
        >
          <FaEnvelope size={18} />
        </a>
      </div>

      {/* Name */}
      <p className="text-lg font-medium mt-7 mb-7">Max Lichter</p>
      {/* Replaceable Footer Text */}
      <p className="text-sm text-gray-300">
        Thanks for stopping by!
      </p>
    </footer>
  );
}
