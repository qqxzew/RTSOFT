import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Sparkles,
  Target,
  Users,
  Zap,
  TrendingUp,
  Award,
  Lightbulb,
  Palette,
  Calculator,
  Heart,
  MessageCircle,
  Gift,
  Star,
} from "lucide-react";
import type { UserResponse } from "../utils/onboardingData";

interface SkillScore {
  name: string;
  score: number;
  icon: React.ReactNode;
  color: string;
}

// Career Recommendation Gift Box Component
const CareerRevealBox = ({
  responses,
  userName,
}: {
  responses: UserResponse[];
  userName: string;
}) => {
  const navigate = useNavigate();
  const [isRevealed, setIsRevealed] = useState(false);
  const [isUnwrapping, setIsUnwrapping] = useState(false);

  // AI-based career recommendation logic
  const getRecommendedCareer = () => {
    const answers = responses.map((r) => r.answer.toLowerCase()).join(" ");

    // Analyze interests and skills from responses
    const keywords = {
      tech: [
        "programování",
        "počítač",
        "technolog",
        "it",
        "kód",
        "software",
        "web",
        "aplikac",
      ],
      creative: [
        "kreslení",
        "umění",
        "design",
        "kreativ",
        "hudba",
        "fotograf",
        "grafik",
      ],
      science: [
        "věda",
        "výzkum",
        "experiment",
        "matemat",
        "fyzik",
        "chemie",
        "biolog",
      ],
      business: [
        "podnikání",
        "obchod",
        "marketing",
        "prodej",
        "ekonom",
        "finance",
        "management",
      ],
      medical: ["medicín", "lékař", "zdraví", "pacient", "nemocnic", "léčb"],
      social: [
        "pomoc",
        "lidé",
        "společnost",
        "sociální",
        "psycholog",
        "učitel",
        "vzdělávání",
      ],
      engineering: [
        "stavb",
        "inženýr",
        "konstrukce",
        "projekt",
        "strojírenství",
        "elektro",
      ],
      arts: ["herectv", "divadlo", "film", "literatura", "psaní", "umělec"],
    };

    const scores: Record<string, number> = {};

    Object.entries(keywords).forEach(([category, words]) => {
      scores[category] = words.reduce((acc, word) => {
        const regex = new RegExp(word, "gi");
        const matches = answers.match(regex);
        return acc + (matches ? matches.length : 0);
      }, 0);
    });

    // Find top category
    const topCategory = Object.entries(scores).reduce((a, b) =>
      a[1] > b[1] ? a : b,
    )[0];

    const careers = {
      tech: {
        title: "Software Developer / IT Specialista",
        icon: "💻",
        desc: "Tvůj analytický um a zájem o technologie tě předurčují pro kariéru v IT",
        bg: "from-gray-100 to-gray-50",
      },
      creative: {
        title: "Grafický Designer / Kreativní Director",
        icon: "🎨",
        desc: "Tvá kreativita a umělecký talent jsou tvou největší silou",
        bg: "from-gray-100 to-gray-50",
      },
      science: {
        title: "Vědecký Výzkumník / Inženýr",
        icon: "🔬",
        desc: "Tvá zvídavost a analytické myšlení tě vedou k vědě",
        bg: "from-gray-100 to-gray-50",
      },
      business: {
        title: "Business Analyst / Entrepreneur",
        icon: "📊",
        desc: "Máš talent pro obchod a strategické myšlení",
        bg: "from-gray-100 to-gray-50",
      },
      medical: {
        title: "Lékař / Health Care Professional",
        icon: "⚕️",
        desc: "Tvá empatie a zájem o zdraví jsou klíčové",
        bg: "from-gray-100 to-gray-50",
      },
      social: {
        title: "Psycholog / Sociální Pracovník",
        icon: "🤝",
        desc: "Tvůj zájem o lidi a společnost je tvým posláním",
        bg: "from-gray-100 to-gray-50",
      },
      engineering: {
        title: "Inženýr / Architekt",
        icon: "🏗️",
        desc: "Tvé technické myšlení a zájem o projekty tě posouvají vpřed",
        bg: "from-gray-100 to-gray-50",
      },
      arts: {
        title: "Umělec / Content Creator",
        icon: "🎭",
        desc: "Tvá kreativita a umělecká vize jsou nezaměnitelné",
        bg: "from-gray-100 to-gray-50",
      },
    };

    return careers[topCategory as keyof typeof careers] || careers.tech;
  };

  const career = getRecommendedCareer();

  const handleReveal = () => {
    setIsUnwrapping(true);
    setTimeout(() => setIsRevealed(true), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-8"
    >
      <AnimatePresence mode="wait">
        {!isRevealed ? (
          <motion.div
            key="sealed"
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="text-center mb-8">
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-black text-gray-900 mb-3"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Personalizované doporučení
              </motion.h2>
              <p
                className="text-gray-600 font-medium text-lg"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Na základě analýzy {responses.length} odpovědí jsme připravili
                kariérní doporučení speciálně pro tebe, {userName}
              </p>
            </div>

            <motion.div
              className="relative max-w-2xl mx-auto cursor-pointer group"
              onClick={handleReveal}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {/* Card Container */}
              <div className="relative bg-gradient-to-br from-white via-gray-50 to-white border-2 border-gray-300 rounded-3xl overflow-hidden shadow-2xl">
                {/* Envelope Flap - Top */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-gray-200 via-gray-100 to-transparent z-20 origin-top"
                  animate={
                    isUnwrapping
                      ? {
                          scaleY: [1, 1, 0],
                          rotateX: [0, -90, -180],
                        }
                      : {
                          y: [0, -4, 0],
                        }
                  }
                  transition={
                    isUnwrapping
                      ? {
                          duration: 1.5,
                          times: [0, 0.5, 1],
                          ease: "easeInOut",
                        }
                      : {
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }
                  }
                  style={{
                    transformStyle: "preserve-3d",
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    boxShadow: "inset 0 -2px 10px rgba(0,0,0,0.1)",
                  }}
                />

                {/* Seal/Stamp */}
                <motion.div
                  className="absolute top-24 left-1/2 -translate-x-1/2 z-30"
                  animate={
                    isUnwrapping
                      ? {
                          scale: [1, 1.2, 0],
                          rotate: [0, 10, 0],
                          opacity: [1, 1, 0],
                        }
                      : {}
                  }
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-gray-300 flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🎯</span>
                  </div>
                </motion.div>

                {/* Content Area */}
                <motion.div
                  className="relative px-12 py-24"
                  animate={
                    isUnwrapping
                      ? {
                          opacity: [0.3, 0.3, 1],
                          y: [0, 0, -10, 0],
                        }
                      : {}
                  }
                  transition={{ duration: 2, times: [0, 0.5, 0.8, 1] }}
                >
                  <div className="text-center">
                    <motion.div
                      animate={
                        isUnwrapping
                          ? {}
                          : {
                              scale: [1, 1.05, 1],
                            }
                      }
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="inline-block mb-6"
                    >
                      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-xl border-2 border-gray-300">
                        <span className="text-7xl filter grayscale opacity-40">
                          📋
                        </span>
                      </div>
                    </motion.div>

                    <h3
                      className="text-3xl font-bold text-gray-400 mb-4"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      Tvá ideální kariéra
                    </h3>

                    <div className="flex items-center justify-center gap-3 text-gray-500 group-hover:text-gray-700 transition-colors">
                      <div className="w-12 h-0.5 bg-gray-300 group-hover:bg-[#86BC25] transition-colors"></div>
                      <p
                        className="text-sm font-semibold uppercase tracking-wider"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        Klikni pro odhalení
                      </p>
                      <div className="w-12 h-0.5 bg-gray-300 group-hover:bg-[#86BC25] transition-colors"></div>
                    </div>
                  </div>
                </motion.div>

                {/* Decorative corners */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-gray-300 rounded-tl-lg"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-gray-300 rounded-tr-lg"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-gray-300 rounded-bl-lg"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-gray-300 rounded-br-lg"></div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              delay: 0.2,
            }}
            className="relative"
          >
            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    y: "50%",
                    x: `${50 + (Math.random() - 0.5) * 20}%`,
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    y: `${-20 + Math.random() * -40}%`,
                    x: `${50 + (Math.random() - 0.5) * 100}%`,
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0.5],
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    delay: Math.random() * 0.5,
                    ease: "easeOut",
                  }}
                  className="absolute w-2 h-2 rounded-full bg-gray-400"
                />
              ))}
            </div>

            <div className="relative bg-white border-2 border-gray-200 rounded-3xl shadow-2xl overflow-hidden">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${career.bg} opacity-50`}
              ></div>

              <div className="relative px-12 py-16">
                <div className="text-center max-w-3xl mx-auto">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.3,
                    }}
                    className="text-9xl mb-8 inline-block filter drop-shadow-lg"
                  >
                    {career.icon}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div
                      className="inline-block px-6 py-2 bg-gray-900 text-white text-sm font-bold rounded-full mb-6"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      AI DOPORUČENÍ
                    </div>

                    <h3
                      className="text-5xl font-black text-gray-900 mb-6 leading-tight"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {career.title}
                    </h3>

                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent mx-auto mb-8"></div>

                    <p
                      className="text-2xl text-gray-700 font-medium leading-relaxed mb-10"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {career.desc}
                    </p>

                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        navigate("/roadmap", {
                          state: { recommendedCareer: career.title },
                        })
                      }
                      className="inline-flex items-center gap-3 px-10 py-5 bg-gray-900 text-white rounded-full text-lg font-bold shadow-xl hover:bg-gray-800 transition-colors cursor-pointer"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      <Sparkles className="w-6 h-6" />
                      Vytvořit Roadmap
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const Overview = () => {
  const navigate = useNavigate();
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [skills, setSkills] = useState<SkillScore[]>([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Check if onboarding is complete
    const onboardingComplete = localStorage.getItem("onboardingComplete");
    if (!onboardingComplete) {
      navigate("/ai-onboarding");
      return;
    }

    // Load responses
    const savedResponses = localStorage.getItem("onboardingResponses");
    const name = localStorage.getItem("username");

    if (savedResponses) {
      const parsedResponses: UserResponse[] = JSON.parse(savedResponses);
      setResponses(parsedResponses);
      setUserName(name || "Student");
      analyzeResponses(parsedResponses);
    }
  }, [navigate]);

  const analyzeResponses = (responses: UserResponse[]) => {
    // Count categories
    const categoryCount = {
      interests: 0,
      skills: 0,
      goals: 0,
      preferences: 0,
    };

    responses.forEach((response) => {
      if (response.category in categoryCount) {
        categoryCount[response.category as keyof typeof categoryCount]++;
      }
    });

    // Analyze skills based on responses
    const calculatedSkills: SkillScore[] = [
      {
        name: "Kreativita",
        score: calculateCreativity(responses),
        icon: <Palette className="w-6 h-6" />,
        color: "#FF6B6B",
      },
      {
        name: "Logické myšlení",
        score: calculateLogic(responses),
        icon: <Brain className="w-6 h-6" />,
        color: "#4ECDC4",
      },
      {
        name: "Komunikace",
        score: calculateCommunication(responses),
        icon: <MessageCircle className="w-6 h-6" />,
        color: "#95E1D3",
      },
      {
        name: "Analytické schopnosti",
        score: calculateAnalytical(responses),
        icon: <Calculator className="w-6 h-6" />,
        color: "#F38181",
      },
      {
        name: "Týmová práce",
        score: calculateTeamwork(responses),
        icon: <Users className="w-6 h-6" />,
        color: "#AA96DA",
      },
      {
        name: "Motivace",
        score: calculateMotivation(responses),
        icon: <Zap className="w-6 h-6" />,
        color: "#86BC25",
      },
      {
        name: "Empatie",
        score: calculateEmpathy(responses),
        icon: <Heart className="w-6 h-6" />,
        color: "#FCBAD3",
      },
      {
        name: "Vedení",
        score: calculateLeadership(responses),
        icon: <Award className="w-6 h-6" />,
        color: "#FDDB3A",
      },
    ];

    setSkills(calculatedSkills);
  };

  // Analysis functions
  const calculateCreativity = (responses: UserResponse[]): number => {
    let score = 50;
    responses.forEach((response) => {
      const answer = response.answer.toLowerCase();
      if (
        answer.includes("kreslení") ||
        answer.includes("umění") ||
        answer.includes("hudba") ||
        answer.includes("psaní") ||
        answer.includes("kreativ")
      ) {
        score += 10;
      }
    });
    return Math.min(score, 100);
  };

  const calculateLogic = (responses: UserResponse[]): number => {
    let score = 50;
    responses.forEach((response) => {
      const answer = response.answer.toLowerCase();
      if (
        answer.includes("matemat") ||
        answer.includes("fyzik") ||
        answer.includes("programování") ||
        answer.includes("věda") ||
        answer.includes("logick")
      ) {
        score += 10;
      }
    });
    return Math.min(score, 100);
  };

  const calculateCommunication = (responses: UserResponse[]): number => {
    let score = 50;
    responses.forEach((response) => {
      const answer = response.answer.toLowerCase();
      if (
        answer.includes("tým") ||
        answer.includes("skupin") ||
        answer.includes("diskuz") ||
        answer.includes("komunikac") ||
        answer.includes("ostatní")
      ) {
        score += 10;
      }
    });
    return Math.min(score, 100);
  };

  const calculateAnalytical = (responses: UserResponse[]): number => {
    let score = 50;
    responses.forEach((response) => {
      const answer = response.answer.toLowerCase();
      if (
        answer.includes("analyz") ||
        answer.includes("data") ||
        answer.includes("čísl") ||
        answer.includes("statistik") ||
        answer.includes("výzkum")
      ) {
        score += 10;
      }
    });
    return Math.min(score, 100);
  };

  const calculateTeamwork = (responses: UserResponse[]): number => {
    let score = 50;
    responses.forEach((response) => {
      const answer = response.answer.toLowerCase();
      if (
        answer.includes("tým") ||
        answer.includes("skupin") ||
        answer.includes("spolupráce") ||
        answer.includes("společně")
      ) {
        score += 12;
      }
      if (answer.includes("sám") || answer.includes("samostatně")) {
        score -= 8;
      }
    });
    return Math.max(Math.min(score, 100), 0);
  };

  const calculateMotivation = (responses: UserResponse[]): number => {
    let score = 60;
    responses.forEach((response) => {
      const answer = response.answer.toLowerCase();
      if (
        answer.includes("motivac") ||
        answer.includes("cíl") ||
        answer.includes("úspěch") ||
        answer.includes("vynikající") ||
        answer.includes("nejlepší")
      ) {
        score += 8;
      }
    });
    return Math.min(score, 100);
  };

  const calculateEmpathy = (responses: UserResponse[]): number => {
    let score = 50;
    responses.forEach((response) => {
      const answer = response.answer.toLowerCase();
      if (
        answer.includes("pomoc") ||
        answer.includes("lidé") ||
        answer.includes("péče") ||
        answer.includes("porozumění") ||
        answer.includes("empatie")
      ) {
        score += 10;
      }
    });
    return Math.min(score, 100);
  };

  const calculateLeadership = (responses: UserResponse[]): number => {
    let score = 50;
    responses.forEach((response) => {
      const answer = response.answer.toLowerCase();
      if (
        answer.includes("veden") ||
        answer.includes("organizac") ||
        answer.includes("řízení") ||
        answer.includes("vedoucí") ||
        answer.includes("iniciativa")
      ) {
        score += 10;
      }
    });
    return Math.min(score, 100);
  };

  const topSkills = [...skills].sort((a, b) => b.score - a.score).slice(0, 3);
  const averageScore =
    skills.length > 0
      ? Math.round(
          skills.reduce((acc, skill) => acc + skill.score, 0) / skills.length,
        )
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-24 pb-12 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-8"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#86BC25] to-[#6a9c1d] rounded-3xl mb-4 shadow-2xl"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h1
            className="text-5xl font-bold text-gray-900 mb-3"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Ahoj, {userName}! 👋
          </h1>
          <p
            className="text-xl text-gray-600 font-medium"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Tvůj osobní přehled a analýza
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Responses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#86BC25]/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white/90 backdrop-blur-xl border-2 border-gray-200 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-[#86BC25]" />
                <span
                  className="text-3xl font-bold text-gray-900"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {responses.length}
                </span>
              </div>
              <p
                className="text-gray-600 font-semibold"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Dokončených odpovědí
              </p>
            </div>
          </motion.div>

          {/* Average Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#86BC25]/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white/90 backdrop-blur-xl border-2 border-gray-200 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-[#86BC25]" />
                <span
                  className="text-3xl font-bold text-gray-900"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {averageScore}%
                </span>
              </div>
              <p
                className="text-gray-600 font-semibold"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Průměrné skóre
              </p>
            </div>
          </motion.div>

          {/* Top Skill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#86BC25]/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white/90 backdrop-blur-xl border-2 border-gray-200 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-[#86BC25]" />
                <span
                  className="text-lg font-bold text-gray-900"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {topSkills[0]?.score}%
                </span>
              </div>
              <p
                className="text-gray-600 font-semibold"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {topSkills[0]?.name || "Nejlepší dovednost"}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Skills Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/90 backdrop-blur-xl border-2 border-gray-200 rounded-3xl p-8 shadow-2xl mb-8"
        >
          <h2
            className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            <Brain className="w-8 h-8 text-gray-700" />
            Analýza dovedností
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <div className="text-gray-700">{skill.icon}</div>
                    </div>
                    <span
                      className="font-bold text-gray-900"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {skill.name}
                    </span>
                  </div>
                  <span
                    className="text-lg font-bold text-gray-700"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {skill.score}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.score}%` }}
                    transition={{
                      duration: 1,
                      delay: 0.5 + index * 0.05,
                      ease: "easeOut",
                    }}
                    className="h-full rounded-full relative overflow-hidden bg-gradient-to-r from-gray-700 to-gray-900"
                  >
                    {/* Shine effect */}
                    <motion.div
                      animate={{ x: [-200, 200] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Career Recommendation Gift Box */}
        <CareerRevealBox responses={responses} userName={userName} />

        {/* Top 3 Skills Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl mb-8"
        >
          <h2
            className="text-3xl font-bold text-white mb-6 flex items-center gap-3"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            <Lightbulb className="w-8 h-8" />
            Tvoje nejsilnější stránky
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topSkills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1, type: "spring" }}
                className="bg-white/20 backdrop-blur-xl border-2 border-white/30 rounded-2xl p-6 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/30 rounded-2xl mb-4">
                  <div className="text-white">{skill.icon}</div>
                </div>
                <div
                  className="text-6xl font-bold text-white mb-2"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  #{index + 1}
                </div>
                <h3
                  className="text-xl font-bold text-white mb-2"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {skill.name}
                </h3>
                <div
                  className="text-3xl font-bold text-white/90"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {skill.score}%
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/90 backdrop-blur-xl border-2 border-gray-200 rounded-3xl p-8 shadow-2xl"
        >
          <h2
            className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            <Target className="w-8 h-8 text-gray-700 group-hover:text-[#86BC25] transition-colors" />
            Doporučení pro tebe
          </h2>

          <div className="space-y-4">
            {topSkills[0] && (
              <div className="p-6 bg-gradient-to-r from-gray-100 to-transparent rounded-2xl border-l-4 border-gray-900 hover:border-[#86BC25] transition-all duration-300">
                <h3
                  className="text-xl font-bold text-gray-900 mb-2"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  Vyzkoušej obory využívající {topSkills[0].name.toLowerCase()}
                </h3>
                <p
                  className="text-gray-700 font-medium"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  S tvým talentem v této oblasti bys mohl/a excelovat v oborech
                  jako design, umění, marketing nebo inovace.
                </p>
              </div>
            )}

            <div className="p-6 bg-gradient-to-r from-gray-100 to-transparent rounded-2xl border-l-4 border-gray-700 hover:border-[#86BC25] transition-all duration-300">
              <h3
                className="text-xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Pokračuj v rozvoji svých silných stránek
              </h3>
              <p
                className="text-gray-700 font-medium"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Tvoje top 3 dovednosti ti dávají skvělý základ. Zaměř se na
                projekty, které je kombinují!
              </p>
            </div>

            <div className="p-6 bg-gradient-to-r from-gray-100 to-transparent rounded-2xl border-l-4 border-gray-500 hover:border-[#86BC25] transition-all duration-300">
              <h3
                className="text-xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                探索 nové možnosti
              </h3>
              <p
                className="text-gray-700 font-medium"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Na základě tvého profilu ti doporučujeme prozkoumать střední
                školy se zaměřením na tvoje silné stránky.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
