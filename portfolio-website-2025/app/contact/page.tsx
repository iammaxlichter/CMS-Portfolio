"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, type Variants, type Transition } from "framer-motion";

const enterSpring: Transition = { type: "spring", stiffness: 320, damping: 28 };

const leftCol: Variants = {
  hidden: { opacity: 0, x: -32 },
  show: {
    opacity: 1,
    x: 0,
    transition: { ...enterSpring, when: "beforeChildren", staggerChildren: 0.06 },
  },
};

const rightCol: Variants = {
  hidden: { opacity: 0, x: 32 },
  show: { opacity: 1, x: 0, transition: enterSpring },
};

const item: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: enterSpring },
};

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // NEW: dynamic achievements
  const [achievements, setAchievements] = useState<string[]>([]);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/achievements", { cache: "no-store" });
        if (!res.ok) throw new Error("fetch failed");
        const json = await res.json();
        if (!alive) return;
        setAchievements((json?.items ?? []).map((x: any) => String(x.text)));
      } catch {
        setAchievements([]); // fallback uses static list below
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const body = new FormData(formRef.current);
      const computedSubject =
        formData.subject?.trim() ||
        `New message from ${formData.firstName || "Unknown"} ${formData.lastName || ""}`.trim();
      body.set("_subject", computedSubject);

      const resp = await fetch("https://formspree.io/f/mqadzlee", {
        method: "POST",
        headers: { Accept: "application/json" },
        body,
      });

      if (resp.ok) {
        setStatus("success");
        setFormData({ firstName: "", lastName: "", email: "", subject: "", message: "" });
        formRef.current.reset();
      } else {
        const data = await resp.json().catch(() => null);
        setStatus("error");
        setErrorMsg(data?.errors?.[0]?.message || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB]">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-32 py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* LEFT */}
          <motion.div
            variants={leftCol}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.h1
              className="text-5xl sm:text-5xl md:text-6xl lg:text-[67px] font-bold mb-1 leading-none tracking-tighter"
              style={{ color: "#343330" }}
              variants={item}
            >
              Discover more
            </motion.h1>
            <motion.h2
              className="text-5xl sm:text-5xl md:text-6xl lg:text-[67px] font-bold mb-6 leading-none tracking-tighter"
              style={{ color: "#343330" }}
              variants={item}
            >
              about me
            </motion.h2>
            <motion.p
              className="lg:text-[20px] md:text-[16px] sm:text-[10px] text-[#9D231B] mb-8"
              variants={item}
            >
              Let's explore more about who I am as a person.
            </motion.p>

            <motion.div variants={item}>
              {achievements.length === 0 ? (
                <>
                  <motion.div
                    className="border border-[#9D231B] border-t rounded-tl-md rounded-tr-md p-6 bg-white"
                    variants={item}
                  >
                    <div className="flex items-start">
                      <div className="text-[#9D231B] mr-3 mt-1">✓</div>
                      <p className="text-[#343330]">
                        Software Engineer II at Paycom LLC working full-time in Irving, Texas
                      </p>
                    </div>
                  </motion.div>

                  <motion.div className="border-l border-r border-b border-[#9D231B] p-6 bg-white" variants={item}>
                    <div className="flex items-start">
                      <div className="text-[#9D231B] mr-3 mt-0">✓</div>
                      <p className="text-[#343330]">Former Software Engineer at Ayoka Systems.</p>
                    </div>
                  </motion.div>

                  <motion.div className="border-l border-r border-b border-[#9D231B] p-6 bg-white" variants={item}>
                    <div className="flex items-start">
                      <div className="text-[#9D231B] mr-3 mt-1">✓</div>
                      <p className="text-[#343330]">
                        Former 2 time intern (Software Development and Quality Engineering) at Signet Jewelers
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="border-l border-r border-b border-[#9D231B] rounded-bl-md rounded-br-md p-6 bg-white"
                    variants={item}
                  >
                    <div className="flex items-start">
                      <div className="text-[#9D231B] mr-3 mt-1">✓</div>
                      <p className="text-[#343330]">
                        Computer Science graduate from the University of Texas at Dallas
                      </p>
                    </div>
                  </motion.div>
                </>
              ) : (
                achievements.map((t, idx) => (
                  <motion.div
                    key={idx}
                    className={[
                      "p-6 bg-white border-[#9D231B]",
                      "border-x border-t",                                      
                      idx === 0 ? "rounded-tl-md rounded-tr-md" : "",          
                      idx === achievements.length - 1 ? "border-b rounded-bl-md rounded-br-md" : "", 
                    ].join(" ")}

                    variants={item}
                  >
                    <div className="flex items-start">
                      <div className="text-[#9D231B] mr-3 mt-1">✓</div>
                      <p className="text-[#343330]">{t}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            variants={rightCol}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-[16px] font-bold text-[#343330] mb-1">
                    First Name<span style={{ color: "#9D231B" }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    required
                    className="w-full h-12 px-3 rounded-md bg-white shadow-sm border border-[#9D231B] focus:outline-none focus:ring-1 focus:ring-[#9D231B] focus:border-[#9D231B]"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-[16px] font-bold text-[#343330] mb-1">
                    Last Name<span style={{ color: "#9D231B" }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    required
                    className="w-full h-12 px-3 rounded-md bg-white shadow-sm border border-[#9D231B] focus:outline-none focus:ring-1 focus:ring-[#9D231B] focus:border-[#9D231B]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-[16px] font-bold text-[#343330] mb-1">
                  Email<span style={{ color: "#9D231B" }}>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                  className="w-full h-12 px-3 rounded-md bg-white shadow-sm border border-[#9D231B] focus:outline-none focus:ring-1 focus:ring-[#9D231B] focus:border-[#9D231B]"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-[16px] font-bold text-[#343330] mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Enter the subject"
                  className="w-full h-12 px-3 rounded-md bg-white shadow-sm border border-[#9D231B] focus:outline-none focus:ring-1 focus:ring-[#9D231B] focus:border-[#9D231B]"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-[16px] font-bold text-[#343330] mb-1">
                  Message<span style={{ color: "#9D231B" }}>*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Enter your message"
                  rows={6}
                  required
                  className="w-full px-3 py-3 rounded-md bg-white shadow-sm border border-[#9D231B] focus:outline-none focus:ring-1 focus:ring-[#9D231B] focus:border-[#9D231B] resize-vertical"
                />
              </div>

              <input type="hidden" name="_subject" value="" />

              <p className="text-[12px] font-bold" style={{ color: "#9D231B" }}>
                Fields marked with an asterisk (*) are required.
              </p>

              <motion.button
                type="submit"
                disabled={status === "loading"}
                style={{ backgroundColor: "#9D231B", border: "1px solid #343330" }}
                className="text-white rounded font-medium py-3 px-12 rounded-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 hover:opacity-90"
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={enterSpring}
              >
                {status === "loading" ? "Submitting…" : "Submit"}
              </motion.button>

              {status === "success" && (
                <motion.div
                  className="text-green-700 text-sm font-medium"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={enterSpring}
                >
                  Thanks! Your message has been sent.
                </motion.div>
              )}
              {status === "error" && (
                <motion.div
                  className="text-red-700 text-sm font-medium"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={enterSpring}
                >
                  {errorMsg || "There was a problem sending your message."}
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
