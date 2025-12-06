import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Video,
  MessageCircle,
  ArrowRight,
  Bot,
  Target,
  Rocket,
  BarChart3,
  Lightbulb,
  TrendingUp,
  Award,
  Brain,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { UserResponse } from "../utils/onboardingData";

const BigItem: React.FC<{
  btnText: string;
  description: string;
  icon: React.ReactNode;
  image: string;
}> = ({ btnText, description, icon, image }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative h-full"
    >
      {/* Glass card */}
      <div className="relative flex flex-col h-full p-6 bg-white/70 backdrop-blur-2xl border-2 border-gray-200/50 rounded-3xl shadow-xl overflow-hidden">
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex-1 flex flex-col items-center justify-center">
            <img
              src={image}
              className="w-full h-32 object-contain mb-3 opacity-90"
              alt="ai feature"
            />

            <p
              className="text-sm font-medium text-gray-700 text-center mb-4 leading-relaxed"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {description}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="relative flex gap-2 w-full items-center justify-center px-5 py-3 bg-gradient-to-r from-black to-gray-900 text-white rounded-xl font-bold hover:from-[#86BC25] hover:to-[#6a9c1d] transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden group/btn text-sm"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            <span className="flex items-center gap-2 relative z-10">
              {icon}
              <span className="font-bold">{btnText}</span>
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export const Landing = () => {
  const navigate = useNavigate();
  const [completedQuestions, setCompletedQuestions] = useState(0);
  const [topSkill, setTopSkill] = useState("");
  const [averageScore, setAverageScore] = useState(0);

  useEffect(() => {
    // Load user data
    const savedResponses = localStorage.getItem("onboardingResponses");
    if (savedResponses) {
      const responses: UserResponse[] = JSON.parse(savedResponses);
      setCompletedQuestions(responses.length);

      // Calculate simple metrics
      const skills = calculateSkills(responses);
      if (skills.length > 0) {
        const top = skills.sort((a, b) => b.score - a.score)[0];
        setTopSkill(top.name);
        setAverageScore(
          Math.round(
            skills.reduce((acc, s) => acc + s.score, 0) / skills.length,
          ),
        );
      }
    }
  }, []);

  const calculateSkills = (responses: UserResponse[]) => {
    const skills = [
      { name: "Kreativita", score: 50 },
      { name: "Logika", score: 50 },
      { name: "Komunikace", score: 50 },
    ];

    responses.forEach((response) => {
      const answer = response.answer.toLowerCase();
      // Creativity
      if (
        answer.includes("kreslení") ||
        answer.includes("umění") ||
        answer.includes("hudba")
      ) {
        skills[0].score += 10;
      }
      // Logic
      if (
        answer.includes("matemat") ||
        answer.includes("fyzik") ||
        answer.includes("programování")
      ) {
        skills[1].score += 10;
      }
      // Communication
      if (
        answer.includes("tým") ||
        answer.includes("diskuz") ||
        answer.includes("komunikac")
      ) {
        skills[2].score += 10;
      }
    });

    return skills.map((s) => ({ ...s, score: Math.min(s.score, 100) }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Subtle background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#86BC25]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#86BC25]/5 rounded-full blur-3xl" />
      </div>

      {/* Hero Section - Full Screen Split */}
      <section className="h-screen flex items-center justify-center px-8 pt-20 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Left Side - Title & KPI Cards */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl lg:text-6xl font-black mb-6 tracking-tighter leading-tight"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                <span className="text-black">Tvá budoucnost</span>
                <br />
                <span className="text-[#86BC25]">začíná teď</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-base text-gray-600 mb-8 max-w-md leading-relaxed"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Tvoje AI kamarád, co ti pomůže rozhodnout se, kam dál.
              </motion.p>

              {/* KPI Cards */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#86BC25]/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-white/60 backdrop-blur-xl border-2 border-gray-200/50 rounded-2xl p-5 hover:border-[#86BC25]/50 transition-all duration-300 shadow-lg">
                    <div
                      className="text-3xl font-black text-black mb-1"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      Beta
                    </div>
                    <div
                      className="text-xs text-gray-500 font-semibold uppercase tracking-wider"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      Verze
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#86BC25]/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-white/60 backdrop-blur-xl border-2 border-gray-200/50 rounded-2xl p-5 hover:border-[#86BC25]/50 transition-all duration-300 shadow-lg">
                    <div
                      className="text-3xl font-black text-black mb-1"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      100%
                    </div>
                    <div
                      className="text-xs text-gray-500 font-semibold uppercase tracking-wider"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      Zdarma
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#86BC25]/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-white/60 backdrop-blur-xl border-2 border-gray-200/50 rounded-2xl p-5 hover:border-[#86BC25]/50 transition-all duration-300 shadow-lg">
                    <div
                      className="text-3xl font-black text-black mb-1"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      24/7
                    </div>
                    <div
                      className="text-xs text-gray-500 font-semibold uppercase tracking-wider"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      Online
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Social Proof / CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="relative group mb-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#86BC25]/10 to-transparent rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-gradient-to-r from-[#86BC25]/10 to-transparent backdrop-blur-sm border-2 border-[#86BC25]/20 rounded-2xl p-5 hover:border-[#86BC25]/40 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-2 border-white" />
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 border-2 border-white" />
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 border-2 border-white" />
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#86BC25] to-[#6a9c1d] border-2 border-white flex items-center justify-center">
                        <span className="text-white text-xs font-bold">+</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-sm font-bold text-black leading-tight"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        Připoj se k dalším studentům
                      </p>
                      <p
                        className="text-xs text-gray-600 font-medium"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        Jsi prvních, kdo to zkouší!
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Mini Stats / Metrics - Personalized */}
              <div className="grid grid-cols-3 gap-3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="relative group"
                >
                  <div className="relative bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl p-3 hover:border-[#86BC25]/30 transition-all duration-300">
                    <div className="flex items-center justify-center mb-1">
                      <div className="flex items-end gap-0.5">
                        <div className="w-1 h-3 bg-[#86BC25]/40 rounded-full"></div>
                        <div className="w-1 h-5 bg-[#86BC25]/70 rounded-full"></div>
                        <div className="w-1 h-7 bg-[#86BC25] rounded-full"></div>
                      </div>
                    </div>
                    <p
                      className="text-xs font-bold text-black text-center"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {completedQuestions > 0
                        ? `${Math.min(completedQuestions, 30)} dní`
                        : "Start"}
                    </p>
                    <p
                      className="text-xs text-gray-500 font-medium text-center"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      Aktivita
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="relative group"
                >
                  <div className="relative bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl p-3 hover:border-[#86BC25]/30 transition-all duration-300">
                    <div className="flex items-center justify-center mb-1">
                      <div className="flex items-center gap-0.5">
                        <div className="w-2 h-2 rounded-full bg-[#86BC25] animate-pulse"></div>
                        <div
                          className="w-2 h-2 rounded-full bg-[#86BC25]/60 animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full bg-[#86BC25]/40 animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                    <p
                      className="text-xs font-bold text-black text-center"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {completedQuestions >= 25 ? "Ready" : "Waiting"}
                    </p>
                    <p
                      className="text-xs text-gray-500 font-medium text-center"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      AI Status
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                  className="relative group"
                >
                  <div className="relative bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl p-3 hover:border-[#86BC25]/30 transition-all duration-300">
                    <div className="flex items-center justify-center mb-1">
                      <Brain className="w-6 h-6 text-[#86BC25]" />
                    </div>
                    <p
                      className="text-xs font-bold text-black text-center truncate"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {topSkill || "--"}
                    </p>
                    <p
                      className="text-xs text-gray-500 font-medium text-center"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {topSkill ? "Top skill" : "Talent"}
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Side - Big Action Cards */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col gap-5"
            >
              <BigItem
                btnText="Zahájit video"
                description="Prozkoumej své možnosti v interaktivní video konzultaci"
                icon={<Video />}
                image="aivideo.svg"
              />
              <BigItem
                btnText="Spustit AI chat"
                description="Popovídej si s AI a získej doporučení na míru"
                icon={<Bot />}
                image="aichat.svg"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2
              className="text-4xl lg:text-5xl font-bold text-black mb-6 tracking-tight"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Proč Školník?
            </h2>
            <p
              className="text-lg text-gray-500 max-w-2xl mx-auto font-light"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Jsme nový startup, který věří, že každý student zaslouží najít
              svou cestu
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Target,
                title: "Najdi své síly",
                desc: "Objevuj své skryté talenty a zájmy, které tě baví",
              },
              {
                icon: Rocket,
                title: "Rychlý start",
                desc: "Za pár minut získáš jasný plán, kam dál",
              },
              {
                icon: BarChart3,
                title: "100% zdarma",
                desc: "Věříme, že vzdělání musí být dostupné pro všechny",
              },
              {
                icon: Lightbulb,
                title: "Tvoje tempo",
                desc: "Nikdo tě netlaká, postupuj svým tempem",
              },
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative group"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#86BC25]/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Glass card */}
                  <div className="relative bg-white/60 backdrop-blur-xl border-2 border-gray-200/50 rounded-2xl p-8 hover:border-[#86BC25]/50 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden">
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-[#86BC25]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10">
                      {/* Icon with glassmorphism */}
                      <div className="inline-flex p-4 rounded-xl bg-black/5 backdrop-blur-sm border border-gray-200/30 mb-6 group-hover:bg-[#86BC25]/10 group-hover:border-[#86BC25]/30 transition-all duration-300">
                        <IconComponent
                          className="w-8 h-8 text-black group-hover:text-[#86BC25] transition-colors"
                          strokeWidth={2.5}
                        />
                      </div>

                      <h3
                        className="text-xl font-bold text-black mb-3 tracking-tight group-hover:text-[#86BC25] transition-colors"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        {feature.title}
                      </h3>
                      <p
                        className="text-gray-600 font-normal leading-relaxed"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#86BC25]/30 to-transparent rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Glass card */}
            <div className="relative bg-white/70 backdrop-blur-2xl border-2 border-gray-200/50 rounded-3xl p-16 lg:p-20 hover:border-[#86BC25]/50 transition-all duration-500 shadow-2xl overflow-hidden">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-[#86BC25]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <motion.h2
                  className="text-5xl lg:text-6xl font-black text-black mb-8 tracking-tighter"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                  whileHover={{ scale: 1.02 }}
                >
                  Přidej se k nám!
                </motion.h2>

                <p
                  className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto font-medium"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  Vyzkoušej Školník zdarma a objev, kam tě může tvá cesta
                  zavést.
                </p>

                <motion.button
                  onClick={() => navigate("/login")}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-12 py-6 bg-gradient-to-r from-black to-gray-900 text-white rounded-2xl font-bold text-lg hover:from-[#86BC25] hover:to-[#6a9c1d] transition-all duration-300 inline-flex items-center gap-3 shadow-xl hover:shadow-2xl"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  <span className="font-bold">Začít zdarma</span>
                  <ArrowRight className="w-6 h-6" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 relative border-t border-gray-200/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3"
          >
            <motion.img
              whileHover={{ rotate: 5 }}
              src="/skolnik.png"
              alt="Školník"
              className="h-9 w-auto opacity-80 hover:opacity-100 transition-opacity"
            />
            <span
              className="text-lg font-black text-black tracking-tight"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Školník
            </span>
          </motion.div>
          <div
            className="text-gray-500 text-sm font-medium"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            © 2025 Školník. Všechna práva vyhrazena.
          </div>
        </div>
      </footer>
    </div>
  );
};
