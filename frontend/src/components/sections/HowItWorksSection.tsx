import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { Brain, TrendingUp, Lightbulb } from "lucide-react";

const steps = [
  {
    icon: Brain,
    title: "Analyze your financial profile",
    description:
      "Our AI studies your spending habits, income, and financial goals to build a comprehensive profile.",
  },
  {
    icon: TrendingUp,
    title: "Predict stock market trends",
    description:
      "Advanced algorithms analyze market data in real-time to identify opportunities and risks.",
  },
  {
    icon: Lightbulb,
    title: "Personalized recommendations",
    description:
      "Receive tailored investment advice that matches your risk profile and financial objectives.",
  },
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative min-h-screen w-full flex items-center justify-center pb-24 pt-10 px-6"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#fbe304] to-[#ffffff] opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2
            className="text-[#3b3c44] mb-4 tracking-wider"
            style={{ fontSize: "3rem", fontWeight: 800 }}
          >
            How It Works
          </h2>
          <p className="text-[#6c6e74]" style={{ fontSize: "1.2rem" }}>
            Three simple steps to smarter investing
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-20 h-20 bg-gradient-to-br from-[#f9dc01] to-[#f8eb4c] rounded-2xl flex items-center justify-center mb-6 mx-auto"
              >
                <span style={{ fontSize: "2.5rem" }}>
                  <step.icon
                    className="text-[#3b3c44]"
                    size={32}
                    strokeWidth={2.5}
                  />
                </span>
              </motion.div>

              <h3
                className="text-[#3b3c44] mb-4 text-center"
                style={{ fontSize: "1.5rem", fontWeight: 700 }}
              >
                {step.title}
              </h3>

              <p
                className="text-[#6c6e74] text-center"
                style={{ fontSize: "1rem", lineHeight: 1.6 }}
              >
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
