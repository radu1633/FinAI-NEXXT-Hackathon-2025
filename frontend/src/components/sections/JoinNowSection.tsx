import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function JoinNowSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.5 });
  const navigate = useNavigate();

  return (
    <section
      ref={ref}
      id="join-now"
      className="relative min-h-screen w-full flex items-center justify-center py-24 px-6 overflow-hidden"
    >
      {/* Animated diagonal gradient background */}
      <motion.div
        animate={{
          background: [
            "linear-gradient(135deg, rgba(251,227,4,0.6) 0%, rgba(255,255,255,0.5) 50%, rgba(251,227,4,0.6) 100%)",
            "linear-gradient(135deg, rgba(251,227,4,0.7) 0%, rgba(255,255,255,0.6) 50%, rgba(251,227,4,0.7) 100%)",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "reverse",
        }}
        className="absolute inset-0"
      />

      {/* Subtle glow overlay for depth */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(circle at 50% 70%, rgba(251, 227, 4, 0.4) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Floating card animation */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -100, scale: 0.5, rotate: -20 }}
          animate={
            isInView
              ? { opacity: 1, y: 0, scale: 1, rotate: 0 }
              : { opacity: 0, y: -100, scale: 0.5, rotate: -20 }
          }
          transition={{
            duration: 0.9,
            ease: "easeInOut",
          }}
          className="mb-12"
        >
          <div className="w-48 h-32 mx-auto bg-gradient-to-br from-[#fbe304] to-[#928915] rounded-2xl shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
            <span style={{ fontSize: "3rem" }}>💳</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-[#3b3c44] mb-6"
          style={{ fontSize: "3.5rem", fontWeight: 800, lineHeight: 1.2 }}
        >
          Start your journey to{" "}
          <span className="text-[#928915]">intelligent investing.</span>
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-[#3b3c44]/70 mb-10 max-w-2xl mx-auto"
          style={{ fontSize: "1.25rem", lineHeight: 1.6 }}
        >
          Join thousands of smart investors who trust FinAI to make data-driven
          financial decisions every day.
        </motion.p>

        {/* CTA Button */}
        <motion.button
          onClick={() => navigate("/dashboard")}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={
            isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }
          }
          transition={{ duration: 0.5, delay: 0.7 }}
          whileHover={{
            scale: 1.05,
            boxShadow: "0 20px 60px rgba(146, 137, 21, 0.4)",
          }}
          whileTap={{ scale: 0.95 }}
          className="group px-12 py-5 bg-[#3b3c44] text-white rounded-full transition-all duration-300 hover:bg-[#928915] flex items-center gap-3 mx-auto"
          style={{ fontWeight: 700, fontSize: "1.2rem" }}
        >
          Go to Dashboard
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowRight size={24} />
          </motion.div>
        </motion.button>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-16 flex items-center justify-center gap-8 text-[#3b3c44]/70"
        >
          <div className="text-center">
            <div
              style={{ fontSize: "2rem", fontWeight: 800 }}
              className="text-[#3b3c44]"
            >
              10k+
            </div>
            <div style={{ fontSize: "0.9rem" }}>Active Users</div>
          </div>
          <div className="w-px h-12 bg-[#3b3c44]/20" />
          <div className="text-center">
            <div
              style={{ fontSize: "2rem", fontWeight: 800 }}
              className="text-[#3b3c44]"
            >
              $50M+
            </div>
            <div style={{ fontSize: "0.9rem" }}>Invested</div>
          </div>
          <div className="w-px h-12 bg-[#3b3c44]/20" />
          <div className="text-center">
            <div
              style={{ fontSize: "2rem", fontWeight: 800 }}
              className="text-[#3b3c44]"
            >
              98%
            </div>
            <div style={{ fontSize: "0.9rem" }}>Satisfaction</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
