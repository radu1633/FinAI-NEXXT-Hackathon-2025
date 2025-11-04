import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import {
  Award,
  Eye,
  Home,
  Shield,
  TrendingUp,
  User,
  Zap,
  AlertCircle,
} from "lucide-react";
import Slider from "react-slick";

const features = [
  {
    icon: Eye,
    title: "Smart Insights",
    description:
      "Our AI explains every decision clearly, so you understand exactly why each recommendation makes sense for you.",
    gradient: "from-[#fbe304] to-[#f8eb4c]",
  },
  {
    icon: Shield,
    title: "Secure Banking",
    description:
      "Bank-grade encryption and trusted security protocols keep your financial data safe and private.",
    gradient: "from-[#f8eb4c] to-[#928915]",
  },
  {
    icon: Zap,
    title: "Real-Time Predictions",
    description:
      "Market analysis updated every day using cutting-edge AI models trained on years of financial data.",
    gradient: "from-[#f8eb4c] to-[#928915]",
  },
];

const testimonials = [
  {
    name: "Maria Popescu",
    role: "Investor",
    text: "This platform helped me understand my investments better than any financial advisor before.",
  },
  {
    name: "Andrei Ionescu",
    role: "Entrepreneur",
    text: "The real-time insights are incredible. I can see trends forming before they become obvious to others.",
  },
  {
    name: "Elena Radu",
    role: "Banking Professional",
    text: "The AI explanations are so intuitive — it’s like having a financial expert available 24/7.",
  },
  {
    name: "Mihai Georgescu",
    role: "Data Analyst",
    text: "Super clean interface and reliable predictions. Perfect balance between design and intelligence.",
  },
];

export function WhyChooseUsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <section
      ref={ref}
      className="relative min-h-screen w-full flex flex-col items-center justify-center py-16 px-6"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3b3c44] via-[#6c6e74] to-[#3b3c44]" />

      {/* Decorative lights */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-20 right-20 w-96 h-96 bg-[#fbe304] opacity-5 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-70 left-30 w-48 h-48 bg-[#fbe304] opacity-5 rounded-full blur-3xl"
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2
            className="text-white mb-4"
            style={{ fontSize: "2.5rem", fontWeight: 800 }}
          >
            Why Choose Us
          </h2>
        </motion.div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14 px-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, rotateX: -15 }}
              animate={
                isInView
                  ? { opacity: 1, y: 0, rotateX: 0 }
                  : { opacity: 0, y: 50, rotateX: -15 }
              }
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{
                y: -10,
                rotateY: 16,
                rotateX: 5,
                scale: 1.05,
                transition: { type: "spring", stiffness: 150, damping: 12 },
              }}
              className="relative group transform-gpu"
              style={{ perspective: "1000px" }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`}
              />

              <div className="relative bg-[#3b3c44]/90 backdrop-blur-sm rounded-3xl p-8 border border-[#6c6e74] group-hover:border-[#fbe304] transition-all duration-500 shadow-lg">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6`}
                >
                  <feature.icon
                    className="text-[#3b3c44]"
                    size={32}
                    strokeWidth={2.5}
                  />
                </motion.div>

                <h3
                  className="text-white mb-4"
                  style={{ fontSize: "1.5rem", fontWeight: 700 }}
                >
                  {feature.title}
                </h3>

                <p
                  className="text-[#dfc9bc]"
                  style={{ fontSize: "1rem", lineHeight: 1.6 }}
                >
                  {feature.description}
                </p>

                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-8xl mx-auto text-center"
        >
          <h3
            className="text-white font-bold mb-10"
            style={{ fontSize: "2.5rem", fontWeight: 800 }}
          >
            What Our Users Say
          </h3>
          <Slider {...settings}>
            {testimonials.map((t, i) => (
              <div key={i} className="px-4">
                <div className="flex flex-row md:flex-row items-stretch justify-center bg-[#3b3c44] rounded-3xl shadow-md">
                  {/* CARD PROFIL */}
                  <div className="flex-[0.4] p-6 flex flex-col bg-[#3b3c44] border-l rounded-l-3xl justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 mb-3.5 rounded-full">
                            <User className="text-[#3b3c44]" size={32} />
                          </div>
                          <div className="ml-2">
                            <h3 className="font-semibold text-white text-lg">
                              Andrei Popescu
                            </h3>
                            <div className="flex justify-between mt-2 mb-2">
                              <p className="text-sm pt-1 text-white">28 ani</p>
                              <span className="border border-[#f39c12] bg-gradient-to-br from-[#f39c12]/20 to-[#f8eb4c]/10 text-white px-3 py-1 rounded-full text-xs font-medium">
                                Agresiv
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <TrendingUp size={16} className="text-white" />
                          <span className="text-white">
                            Venit lunar: 8.500 RON
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award size={16} className="text-white" />
                          <span className="text-white">
                            Capital: 45.000 RON
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Home size={16} className="text-white" />
                          <span className="text-white">
                            Proprietate: 350.000 RON
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#fbe304] text-sm text-white">
                      <p>
                        Scor credit:{" "}
                        <span className="font-semibold text-[#fbe304]">
                          720
                        </span>
                      </p>
                      <p className="mt-1">Creștere rapidă capital</p>
                    </div>
                  </div>

                  {/* CARD RECOMANDARE */}
                  <div className="flex-[1.6] p-8 border-l border-[#fbe304] shadow-md relative overflow-hidden">
                    <div className="relative z-10 flex items-start justify-between mb-3">
                      <div className="flex gap-3">
                        <div className="bg-[#fbe304] text-gray-900 font-bold rounded-full w-10 h-10 flex items-center justify-center text-sm shadow">
                          #1
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">NVDA</h3>
                          <p className="text-sm text-white">
                            NVIDIA Corporation
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 text-[#f4d03f] font-bold text-lg">
                          <TrendingUp size={18} />
                          100%
                        </div>
                        <p className="text-xs text-white font-medium">
                          Scor potrivire
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-white mb-4 font-medium">
                      Profil tânăr cu orizont de investiție lung. NVDA oferă
                      potențial de creștere de 31.4%.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="relative bg-[#3b3c44] border border-yellow-200 p-4 rounded-lg overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#fbe304]/20 to-[#f8eb4c]/10 opacity-60 rounded-lg pointer-events-none" />
                        <div className="relative z-10">
                          <p className="text-xs text-white font-semibold mb-1">
                            Sumă Recomandată
                          </p>
                          <p className="font-bold text-white text-lg">
                            $909.09
                          </p>
                          <p className="text-xs text-white font-medium">
                            4500 RON
                          </p>
                        </div>
                      </div>

                      <div className="relative bg-[#3b3c44] border border-[#f39c12] p-4 rounded-lg overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#f39c12]/20 to-[#f8eb4c]/10 opacity-60 rounded-lg pointer-events-none" />
                        <div className="relative z-10">
                          <p className="text-xs text-white font-semibold mb-1">
                            Return Estimat
                          </p>
                          <p className="font-bold text-[#f39c12] text-lg">
                            +31.4%
                          </p>
                          <p className="text-xs text-white font-medium">
                            în 12 luni
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-white">
                      <AlertCircle size={14} />
                      <span>Risc: 65 | Volatilitate: 42.8</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </motion.div>
      </div>
    </section>
  );
}
