import { useState, useEffect } from "react";
import { Scene3D } from "../components/Scene3D";
import { HeroSection } from "../components/sections/HeroSection";
import { HowItWorksSection } from "../components/sections/HowItWorksSection";
import { WhyChooseUsSection } from "../components/sections/WhyChooseUsSection";
import { JoinNowSection } from "../components/sections/JoinNowSection";
import { Navbar } from "../components/reusable/Navbar";

export default function LandingPage() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight =
        document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = scrolled / documentHeight;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative w-full">
      {/* Fixed 3D Scene Background */}
      <Scene3D scrollProgress={scrollProgress} />

      {/* Page Content */}
      <div className="relative z-10">
        <Navbar />
        <div id="hero">
          <HeroSection />
        </div>
        <div id="how-it-works">
          <HowItWorksSection />
        </div>
        <div id="why-choose-us">
          <WhyChooseUsSection />
        </div>
        <div id="join-now">
          <JoinNowSection />
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-[#3b3c44] text-[#dfc9bc] py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3
                className="text-[#fbe304] mb-4"
                style={{ fontWeight: 700, fontSize: "1.2rem" }}
              >
                <span className="text-white">Fin</span>AI
              </h3>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
                Your AI-powered banking assistant for intelligent investing.
              </p>
            </div>

            <div>
              <h4 className="text-white mb-4" style={{ fontWeight: 600 }}>
                Product
              </h4>
              <ul className="space-y-2" style={{ fontSize: "0.9rem" }}>
                <li>
                  <a
                    href="/dashboard"
                    className="hover:text-[#fbe304] transition-colors"
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="/chat"
                    className="hover:text-[#fbe304] transition-colors"
                  >
                    AI Chat
                  </a>
                </li>
                <li>
                  <a
                    href="/bank/dash/"
                    className="hover:text-[#fbe304] transition-colors"
                  >
                    Banker Portal
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbe304] transition-colors"
                  >
                    Analytics
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white mb-4" style={{ fontWeight: 600 }}>
                Company
              </h4>
              <ul className="space-y-2" style={{ fontSize: "0.9rem" }}>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbe304] transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbe304] transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbe304] transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbe304] transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white mb-4" style={{ fontWeight: 600 }}>
                Legal
              </h4>
              <ul className="space-y-2" style={{ fontSize: "0.9rem" }}>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbe304] transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbe304] transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbe304] transition-colors"
                  >
                    Security
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbe304] transition-colors"
                  >
                    Compliance
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#6c6e74] pt-8 text-center">
            <p style={{ fontSize: "0.9rem" }}>
              © 2025 FinAI. All rights reserved. Built with AI-powered
              technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
