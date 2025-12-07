import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Video, Bot, Brain, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { UserResponse } from "../utils/onboardingData";

const BigItem: React.FC<{
    btnText: string;
    description: string;
    icon: React.ReactNode;
    image: string;
    onClick?: () => void;
}> = ({ btnText, description, icon, image, onClick }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative h-full"
    >
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
                    onClick={onClick}
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

export const Landing = () => {
    const navigate = useNavigate();
    const [completedQuestions, setCompletedQuestions] = useState(0);
    const [topSkill, setTopSkill] = useState("");
    const isLoggedIn = localStorage.getItem("isAuthenticated") === "true";

    useEffect(() => {
        if (isLoggedIn) {
            const savedResponses = localStorage.getItem("onboardingResponses");
            if (savedResponses) {
                const responses: UserResponse[] = JSON.parse(savedResponses);
                setCompletedQuestions(responses.length);

                const skills = calculateSkills(responses);
                if (skills.length > 0) {
                    const top = skills.sort((a, b) => b.score - a.score)[0];
                    setTopSkill(top.name);
                }
            }
        }
    }, [isLoggedIn]);

    const calculateSkills = (responses: UserResponse[]) => {
        const skills = [
            { name: "Kreativita", score: 50 },
            { name: "Logika", score: 50 },
            { name: "Komunikace", score: 50 },
        ];

        responses.forEach((response) => {
            const answer = response.answer.toLowerCase();
            if (answer.includes("kreslení") || answer.includes("umění") || answer.includes("hudba")) {
                skills[0].score += 10;
            }
            if (answer.includes("matemat") || answer.includes("fyzik") || answer.includes("programování")) {
                skills[1].score += 10;
            }
            if (answer.includes("tým") || answer.includes("diskuz") || answer.includes("komunikac")) {
                skills[2].score += 10;
            }
        });

        return skills.map((s) => ({ ...s, score: Math.min(s.score, 100) }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
            {/* Hero Section */}
            <motion.section
                className="h-screen flex flex-col items-center justify-center px-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <motion.h1
                    className="text-5xl lg:text-6xl font-black mb-4 tracking-tight"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <span className="text-black">Tvá budoucnost</span>
                    <br />
                    <span className="text-[#86BC25]">začíná teď</span>
                </motion.h1>

                <motion.p
                    className="text-lg text-gray-600 max-w-xl"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    Školník ti pomůže objevit tvoje talenty a doporučí vhodnou střední školu.
                </motion.p>

                {!isLoggedIn ? (
                    <motion.button
                        onClick={() => navigate("/login")}
                        className="mt-8 px-12 py-5 bg-gradient-to-r from-black to-gray-900 text-white rounded-2xl font-bold text-lg hover:from-[#86BC25] hover:to-[#6a9c1d] transition-all duration-300 shadow-xl hover:shadow-2xl"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                        Začít zdarma <ArrowRight className="w-5 h-5 inline-block ml-2" />
                    </motion.button>
                ) : (
                    <div className="mt-12 grid grid-cols-2 gap-6 max-w-2xl w-full">
                        <BigItem
                            btnText="Zahájit video"
                            description="Prozkoumej své možnosti v interaktivní video konzultaci"
                            icon={<Video />}
                            image="aivideo.svg"
                            onClick={() => navigate("/chat3d")}
                        />
                        <BigItem
                            btnText="Spustit AI chat"
                            description="Popovídej si s AI a získej doporučení na míru"
                            icon={<Bot />}
                            image="aichat.svg"
                            onClick={() => navigate("/chat")}
                        />
                    </div>
                )}
            </motion.section>

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
                            Jsme startup, který věří, že každý student zaslouží najít svou cestu.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Brain,
                                title: "Najdi své síly",
                                desc: "Objevuj své talenty a zájmy, které tě baví",
                            },
                            {
                                icon: Video,
                                title: "Rychlý start",
                                desc: "Za pár minut získáš jasný plán, kam dál",
                            },
                            {
                                icon: Bot,
                                title: "AI kamarád",
                                desc: "Chat a doporučení na míru podle tvých zájmů",
                            },
                            {
                                icon: Brain,
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
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#86BC25]/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="relative bg-white/60 backdrop-blur-xl border-2 border-gray-200/50 rounded-2xl p-8 hover:border-[#86BC25]/50 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-[#86BC25]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="relative z-10">
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

            {/* Footer */}
            <footer className="py-16 px-6 relative border-t border-gray-200/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <img
                            src="/skolnik.png"
                            alt="Školník"
                            className="h-9 w-auto opacity-80 transition-opacity"
                        />
                        <span
                            className="text-lg font-black text-black tracking-tight"
                            style={{ fontFamily: "Montserrat, sans-serif" }}
                        >
              Školník
            </span>
                    </div>
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
