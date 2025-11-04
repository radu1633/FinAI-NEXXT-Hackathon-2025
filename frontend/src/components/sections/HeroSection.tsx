import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function HeroSection() {
  const navigate = useNavigate();

  const scrollToNext = () => {
    const howItWorksSection = document.getElementById("how-it-works");
    howItWorksSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0e0e0f] via-[#222224] to-[#fbe304] opacity-90" />

      {/* Hero content */}
      <div className="relative z-10 text-center px-6 max-w-5xl">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6 text-white"
          style={{ fontSize: "4.5rem", fontWeight: 800, lineHeight: 1.1 }}
        >
          Invest Smarter.
          <br />
          <span className="text-[#fbe304]">Bank Intelligently.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mb-10 text-[#dfc9bc] max-w-2xl mx-auto"
          style={{ fontSize: "1.25rem", lineHeight: 1.6 }}
        >
          AI-powered insights and personalized investment recommendations, built
          for your financial goals.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 30px rgba(251, 227, 4, 0.6)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/dashboard")}
          className="px-16 py-4 bg-[#fbe304] text-[#3b3c44] rounded-full transition-all duration-300 hover:bg-[#f8eb4c]"
          style={{ fontWeight: 600, fontSize: "1.5rem" }}
        >
          Get Started
        </motion.button>

        {/* Scroll indicator */}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer"
        onClick={scrollToNext}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="text-[#3b3c44]" size={48} />
        </motion.div>
      </motion.div>
    </section>
  );
}
