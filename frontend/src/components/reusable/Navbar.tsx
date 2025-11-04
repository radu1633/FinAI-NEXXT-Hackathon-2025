import { motion } from "motion/react";

export function Navbar() {
  const scrollTo = (id: string) => {
    const section = document.getElementById(id);
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full py-6 absolute top-0 left-0 z-20"
    >
      <div className="max-w-8xl mx-14 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => scrollTo("hero")}
          className="text-[#fbe304] text-2xl font-extrabold tracking-tight cursor-pointer"
        >
          Fin<span className="text-white">AI</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-10">
          {[
            { label: "How It Works", id: "how-it-works" },
            { label: "Why Choose Us", id: "why-choose-us" },
            { label: "Join Now", id: "join-now" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-white font-medium relative group"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#fbe304] transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}
