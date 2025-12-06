import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
    ArrowRight,
    Check,
    Lock,
    Sparkles,
    BookOpen,
    Code,
    Briefcase,
    GraduationCap,
    Target,
    Zap,
} from "lucide-react";

interface RoadmapNode {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    category: "foundation" | "intermediate" | "advanced" | "expert";
    connections: string[];
    resources?: { name: string; url: string }[];
    estimatedTime?: string;
}

export const RoadmapPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedCareer, setSelectedCareer] = useState<string>("");
    const [roadmapNodes, setRoadmapNodes] = useState<RoadmapNode[]>([]);
    const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());
    const [isGenerating, setIsGenerating] = useState(false);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customCareer, setCustomCareer] = useState("");

    useEffect(() => {
        if (location.state?.recommendedCareer) {
            setSelectedCareer(location.state.recommendedCareer);
            generateRoadmap(location.state.recommendedCareer);
        }

        const saved = localStorage.getItem("completedRoadmapNodes");
        if (saved) {
            setCompletedNodes(new Set(JSON.parse(saved)));
        }
    }, [location]);

    const careerTemplates = [
        { id: "tech", title: "Software Developer / IT", icon: "💻" },
        { id: "creative", title: "Grafický Designer", icon: "🎨" },
        { id: "business", title: "Business Analyst", icon: "📊" },
        { id: "science", title: "Vědecký Výzkumník", icon: "🔬" },
        { id: "medical", title: "Healthcare Professional", icon: "⚕️" },
        { id: "custom", title: "Vlastní profese", icon: "✨" },
    ];

    const generateRoadmap = (career: string) => {
        setIsGenerating(true);
        setTimeout(() => {
            const nodes = getRoadmapForCareer(career);
            setRoadmapNodes(nodes);
            setIsGenerating(false);
            localStorage.setItem("userRoadmap", JSON.stringify({ career, nodes }));
        }, 1500);
    };


    const getRoadmapForCareer = (career: string): RoadmapNode[] => {
        const c = career.toLowerCase();
        setCompletedNodes(new Set());

        if (c.includes("software") || c.includes("it") || c.includes("programov")) {
            return [
                {
                    id: "basics",
                    title: "Základy programování",
                    description: "HTML, CSS, základy JavaScriptu",
                    icon: <BookOpen className="w-6 h-6" />,
                    category: "foundation",
                    connections: ["frontend", "backend"],
                    estimatedTime: "2-3 měsíce",
                    resources: [
                        { name: "FreeCodeCamp", url: "https://www.freecodecamp.org/" },
                        { name: "MDN Web Docs", url: "https://developer.mozilla.org/" },
                        { name: "JavaScript.info", url: "https://javascript.info/" },
                    ],
                },
                {
                    id: "frontend",
                    title: "Frontend Development",
                    description: "React, TypeScript, Tailwind CSS",
                    icon: <Code className="w-6 h-6" />,
                    category: "intermediate",
                    connections: ["fullstack", "advanced-frontend"],
                    estimatedTime: "3-4 měsíce",
                    resources: [
                        { name: "React Docs", url: "https://reactjs.org/docs/getting-started.html" },
                        { name: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/" },
                        { name: "Tailwind CSS Guide", url: "https://tailwindcss.com/docs" },
                    ],
                },
                {
                    id: "backend",
                    title: "Backend Development",
                    description: "Node.js, Express, databáze (PostgreSQL)",
                    icon: <Code className="w-6 h-6" />,
                    category: "intermediate",
                    connections: ["fullstack", "databases"],
                    estimatedTime: "3-4 měsíce",
                    resources: [
                        { name: "Node.js Docs", url: "https://nodejs.org/en/docs/" },
                        { name: "Express Guide", url: "https://expressjs.com/en/starter/installing.html" },
                        { name: "PostgreSQL Docs", url: "https://www.postgresql.org/docs/" },
                    ],
                },
                {
                    id: "databases",
                    title: "Databáze & ORM",
                    description: "SQL, NoSQL, Prisma/TypeORM",
                    icon: <BookOpen className="w-6 h-6" />,
                    category: "intermediate",
                    connections: ["fullstack"],
                    estimatedTime: "2 měsíce",
                    resources: [
                        { name: "SQL Tutorial", url: "https://www.w3schools.com/sql/" },
                        { name: "Prisma Docs", url: "https://www.prisma.io/docs/" },
                        { name: "TypeORM Docs", url: "https://typeorm.io/" },
                    ],
                },
                {
                    id: "fullstack",
                    title: "Full-Stack Projects",
                    description: "Komplexní aplikace s frontendem a backendem",
                    icon: <Briefcase className="w-6 h-6" />,
                    category: "advanced",
                    connections: ["devops", "portfolio"],
                    estimatedTime: "4-6 měsíce",
                    resources: [
                        { name: "Fullstack Tutorial", url: "https://www.fullstackopen.com/en/" },
                    ],
                },
                {
                    id: "advanced-frontend",
                    title: "Pokročilý Frontend",
                    description: "Next.js, State Management, Testing",
                    icon: <Zap className="w-6 h-6" />,
                    category: "advanced",
                    connections: ["portfolio"],
                    estimatedTime: "2-3 měsíce",
                    resources: [
                        { name: "Next.js Docs", url: "https://nextjs.org/docs" },
                        { name: "React Testing Library", url: "https://testing-library.com/docs/react-testing-library/intro/" },
                    ],
                },
                {
                    id: "devops",
                    title: "DevOps & Deployment",
                    description: "Docker, CI/CD, Cloud hosting",
                    icon: <Target className="w-6 h-6" />,
                    category: "advanced",
                    connections: ["portfolio"],
                    estimatedTime: "2 měsíce",
                    resources: [
                        { name: "Docker Docs", url: "https://docs.docker.com/" },
                        { name: "GitHub Actions", url: "https://docs.github.com/en/actions" },
                        { name: "AWS Docs", url: "https://aws.amazon.com/documentation/" },
                    ],
                },
                {
                    id: "portfolio",
                    title: "Portfolio & Job Search",
                    description: "GitHub projekty, CV, networking",
                    icon: <GraduationCap className="w-6 h-6" />,
                    category: "expert",
                    connections: [],
                    estimatedTime: "1-2 měsíce",
                    resources: [
                        { name: "GitHub", url: "https://github.com/" },
                        { name: "LinkedIn", url: "https://www.linkedin.com/" },
                        { name: "Resume Tips", url: "https://novoresume.com/career-blog/resume-tips" },
                    ],
                },
            ];
        }

        if (c.includes("design") || c.includes("grafick")) {
            return [
                {
                    id: "design-basics",
                    title: "Design Fundamentals",
                    description: "Barvy, typografie, kompozice",
                    icon: <BookOpen className="w-6 h-6" />,
                    category: "foundation",
                    connections: ["tools", "ui-ux"],
                    estimatedTime: "2 měsíce",
                    resources: [
                        { name: "Canva Design School", url: "https://www.canva.com/learn/design/" },
                        { name: "The Futur", url: "https://www.thefutur.com/" },
                    ],
                },
                {
                    id: "tools",
                    title: "Design Tools",
                    description: "Figma, Adobe XD, Illustrator",
                    icon: <Code className="w-6 h-6" />,
                    category: "foundation",
                    connections: ["ui-ux", "branding"],
                    estimatedTime: "2-3 měsíce",
                    resources: [
                        { name: "Figma Docs", url: "https://help.figma.com/hc/en-us" },
                        { name: "Adobe XD Tutorials", url: "https://helpx.adobe.com/xd/tutorials.html" },
                        { name: "Illustrator Guide", url: "https://helpx.adobe.com/illustrator/tutorials.html" },
                    ],
                },
                {
                    id: "ui-ux",
                    title: "UI/UX Design",
                    description: "User research, wireframing, prototyping",
                    icon: <Target className="w-6 h-6" />,
                    category: "intermediate",
                    connections: ["advanced-design"],
                    estimatedTime: "3-4 měsíce",
                    resources: [
                        { name: "NNGroup UX Articles", url: "https://www.nngroup.com/articles/" },
                        { name: "UX Collective", url: "https://uxdesign.cc/" },
                    ],
                },
                {
                    id: "branding",
                    title: "Brand Identity",
                    description: "Logo design, brand guidelines",
                    icon: <Sparkles className="w-6 h-6" />,
                    category: "intermediate",
                    connections: ["advanced-design"],
                    estimatedTime: "2 měsíce",
                    resources: [
                        { name: "Branding Basics", url: "https://www.canva.com/learn/branding/" },
                    ],
                },
                {
                    id: "advanced-design",
                    title: "Advanced Projects",
                    description: "Komplexní design systémy, case studies",
                    icon: <Briefcase className="w-6 h-6" />,
                    category: "advanced",
                    connections: ["portfolio-design"],
                    estimatedTime: "4-6 měsíce",
                    resources: [
                        { name: "Case Study Guide", url: "https://www.smashingmagazine.com/2018/01/design-case-study/" },
                    ],
                },
                {
                    id: "portfolio-design",
                    title: "Portfolio & Career",
                    description: "Online portfolio, Behance, Dribbble",
                    icon: <GraduationCap className="w-6 h-6" />,
                    category: "expert",
                    connections: [],
                    estimatedTime: "2 měsíce",
                    resources: [
                        { name: "Behance", url: "https://www.behance.net/" },
                        { name: "Dribbble", url: "https://dribbble.com/" },
                    ],
                },
            ];
        }

        if (c.includes("business")) {
            return [
                {
                    id: "business-basics",
                    title: "Business Fundamentals",
                    description: "Základy ekonomie a obchodní analýzy",
                    icon: <BookOpen className="w-6 h-6" />,
                    category: "foundation",
                    connections: ["data-analysis", "tools-business"],
                    estimatedTime: "2 měsíce",
                    resources: [
                        { name: "Coursera Business Fundamentals", url: "https://www.coursera.org/specializations/wharton-business-foundations" },
                        { name: "Khan Academy Economics", url: "https://www.khanacademy.org/economics-finance-domain" },
                    ],
                },
                {
                    id: "data-analysis",
                    title: "Data Analysis",
                    description: "Excel, SQL, Power BI",
                    icon: <Code className="w-6 h-6" />,
                    category: "intermediate",
                    connections: ["modeling", "visualization"],
                    estimatedTime: "3 měsíce",
                    resources: [
                        { name: "SQL Tutorial", url: "https://www.w3schools.com/sql/" },
                        { name: "Power BI Guide", url: "https://learn.microsoft.com/en-us/power-bi/" },
                    ],
                },
                {
                    id: "tools-business",
                    title: "Business Tools",
                    description: "Jira, Confluence, Tableau",
                    icon: <Zap className="w-6 h-6" />,
                    category: "intermediate",
                    connections: ["project-management"],
                    estimatedTime: "2 měsíce",
                    resources: [
                        { name: "Tableau Docs", url: "https://help.tableau.com/current/guides/e-learning/en-us/tableau_elearning.htm" },
                        { name: "Jira Guide", url: "https://www.atlassian.com/software/jira/guides" },
                    ],
                },
                {
                    id: "project-management",
                    title: "Project Management",
                    description: "Agile, Scrum, Kanban",
                    icon: <Briefcase className="w-6 h-6" />,
                    category: "advanced",
                    connections: ["portfolio-business"],
                    estimatedTime: "3 měsíce",
                    resources: [
                        { name: "Scrum Guide", url: "https://scrumguides.org/" },
                    ],
                },
                {
                    id: "portfolio-business",
                    title: "Portfolio & Career",
                    description: "Business case studies, consulting projects",
                    icon: <GraduationCap className="w-6 h-6" />,
                    category: "expert",
                    connections: [],
                    estimatedTime: "2 měsíce",
                    resources: [
                        { name: "Consulting Portfolio Tips", url: "https://www.managementconsulted.com/consulting-case-study-prep/" },
                    ],
                },
            ];
        }

        if (c.includes("vědecký") || c.includes("science")) {
            return [
                {
                    id: "science-basics",
                    title: "Science Fundamentals",
                    description: "Matematika, fyzika, chemie, biologie",
                    icon: <BookOpen className="w-6 h-6" />,
                    category: "foundation",
                    connections: ["research-methods"],
                    estimatedTime: "2-3 měsíce",
                    resources: [
                        { name: "Khan Academy Science", url: "https://www.khanacademy.org/science" },
                        { name: "Coursera Science Courses", url: "https://www.coursera.org/browse/physical-science-and-engineering" },
                    ],
                },
                {
                    id: "research-methods",
                    title: "Research Methods",
                    description: "Experiment design, data collection, statistics",
                    icon: <Target className="w-6 h-6" />,
                    category: "intermediate",
                    connections: ["specialization"],
                    estimatedTime: "3 měsíce",
                    resources: [
                        { name: "Research Methods Guide", url: "https://libguides.usc.edu/writingguide/researchmethods" },
                    ],
                },
                {
                    id: "specialization",
                    title: "Specialization",
                    description: "Vybraná oblast vědy, laboratorní práce",
                    icon: <Zap className="w-6 h-6" />,
                    category: "advanced",
                    connections: ["portfolio-science"],
                    estimatedTime: "4-6 měsíce",
                    resources: [
                        { name: "Specialized Journals", url: "https://www.sciencedirect.com/" },
                    ],
                },
                {
                    id: "portfolio-science",
                    title: "Portfolio & Career",
                    description: "Publikace, konference, networking",
                    icon: <GraduationCap className="w-6 h-6" />,
                    category: "expert",
                    connections: [],
                    estimatedTime: "2-3 měsíce",
                    resources: [
                        { name: "ResearchGate", url: "https://www.researchgate.net/" },
                    ],
                },
            ];
        }

        if (c.includes("health") || c.includes("medical") || c.includes("lékař")) {
            return [
                {
                    id: "medical-basics",
                    title: "Medical Fundamentals",
                    description: "Anatomie, fyziologie, biochemie",
                    icon: <BookOpen className="w-6 h-6" />,
                    category: "foundation",
                    connections: ["clinical-skills"],
                    estimatedTime: "6 měsíců",
                    resources: [
                        { name: "Khan Academy Health", url: "https://www.khanacademy.org/science/health-and-medicine" },
                        { name: "MedlinePlus", url: "https://medlineplus.gov/" },
                    ],
                },
                {
                    id: "clinical-skills",
                    title: "Clinical Skills",
                    description: "Základy péče o pacienta, diagnostika",
                    icon: <Zap className="w-6 h-6" />,
                    category: "intermediate",
                    connections: ["specialization-medical"],
                    estimatedTime: "1 rok",
                    resources: [
                        { name: "BMJ Learning", url: "https://learning.bmj.com/" },
                    ],
                },
                {
                    id: "specialization-medical",
                    title: "Specialization",
                    description: "Vybraná medicínská specializace",
                    icon: <Briefcase className="w-6 h-6" />,
                    category: "advanced",
                    connections: ["portfolio-medical"],
                    estimatedTime: "1-2 roky",
                    resources: [
                        { name: "Specialty Societies", url: "https://www.ama-assn.org/education/specialty-education-resources" },
                    ],
                },
                {
                    id: "portfolio-medical",
                    title: "Portfolio & Career",
                    description: "Praxe, konference, certifikace",
                    icon: <GraduationCap className="w-6 h-6" />,
                    category: "expert",
                    connections: [],
                    estimatedTime: "6-12 měsíců",
                    resources: [
                        { name: "LinkedIn", url: "https://www.linkedin.com/" },
                    ],
                },
            ];
        }

        // Fallback generic roadmap
        return [
            {
                id: "foundation",
                title: "Základní vzdělání",
                description: "Střední škola a relevantní předměty",
                icon: <BookOpen className="w-6 h-6" />,
                category: "foundation",
                connections: ["learning"],
                estimatedTime: "4 roky",
                resources: [
                    { name: "Coursera Basics", url: "https://www.coursera.org/" },
                ],
            },
            {
                id: "learning",
                title: "Odborné dovednosti",
                description: "Kurzy, certifikace, praxe",
                icon: <Code className="w-6 h-6" />,
                category: "intermediate",
                connections: ["experience"],
                estimatedTime: "1-2 roky",
                resources: [
                    { name: "Udemy Courses", url: "https://www.udemy.com/" },
                    { name: "edX", url: "https://www.edx.org/" },
                ],
            },
            {
                id: "experience",
                title: "Praktické zkušenosti",
                description: "Stáže, projekty, networking",
                icon: <Briefcase className="w-6 h-6" />,
                category: "advanced",
                connections: ["career"],
                estimatedTime: "1-2 roky",
                resources: [
                    { name: "Internship Guide", url: "https://www.internships.com/" },
                ],
            },
            {
                id: "career",
                title: "Kariérní start",
                description: "První pracovní pozice",
                icon: <GraduationCap className="w-6 h-6" />,
                category: "expert",
                connections: [],
                estimatedTime: "6-12 měsíců",
                resources: [
                    { name: "LinkedIn", url: "https://www.linkedin.com/" },
                ],
            },
        ];
    };


    const toggleNodeCompletion = (nodeId: string) => {
        const newCompleted = new Set(completedNodes);
        if (newCompleted.has(nodeId)) newCompleted.delete(nodeId);
        else newCompleted.add(nodeId);
        setCompletedNodes(newCompleted);
        localStorage.setItem("completedRoadmapNodes", JSON.stringify([...newCompleted]));
    };

    const handleCareerSelect = (careerId: string, careerTitle: string) => {
        if (careerId === "custom") setShowCustomInput(true);
        else {
            setSelectedCareer(careerTitle);
            generateRoadmap(careerTitle);
        }
    };

    const handleCustomCareerSubmit = async () => {
        if (!customCareer.trim()) return;
        setIsGenerating(true);
        setShowCustomInput(false);
        setSelectedCareer(customCareer);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8080/__generate_roadmap__", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ profession: customCareer }),
            });

            if (!res.ok) throw new Error("Chyba při generování roadmapy");
            let text = await res.text();
            text = text.replace(/^```json\s*/, "").replace(/```$/, "");
            const dataFromBackend: any[] = JSON.parse(text);

            const nodes: RoadmapNode[] = dataFromBackend.map((node, index) => ({
                id: node.id || `step-${index}`,
                title: node.title,
                description: node.description,
                icon: <span>{node.icon}</span>,
                category: "foundation",
                connections: [],
                resources: node.resources?.map((r: any) => ({ name: r.name, url: r.url })),
                estimatedTime: node.estimated_duration,
            }));

            setRoadmapNodes(nodes);
            setCompletedNodes(new Set());
            localStorage.setItem("userRoadmap", JSON.stringify({ career: customCareer, nodes }));
        } catch (err) {
            console.error(err);
            alert("Nepodařilo se vygenerovat roadmapu. Zkus to znovu.");
            setSelectedCareer("");
        } finally {
            setIsGenerating(false);
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "foundation": return "from-gray-500 to-gray-600";
            case "intermediate": return "from-gray-600 to-gray-700";
            case "advanced": return "from-gray-700 to-gray-800";
            case "expert": return "from-gray-900 to-black";
            default: return "from-gray-500 to-gray-600";
        }
    };

    const getProgressPercentage = () => {
        if (roadmapNodes.length === 0) return 0;
        return Math.round((completedNodes.size / roadmapNodes.length) * 100);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-24 pb-16 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                    <h1 className="text-6xl font-black text-gray-900 mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>
                        Tvá kariérní roadmapa
                    </h1>
                    <p className="text-xl text-gray-600 font-medium" style={{ fontFamily: "Montserrat, sans-serif" }}>
                        Personalizovaný plán k tvé vysněné profesi
                    </p>
                </motion.div>

                {/* Career Selection */}
                {!selectedCareer && !isGenerating && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center" style={{ fontFamily: "Montserrat, sans-serif" }}>
                            Vyber profesi
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {careerTemplates.map((career, index) => (
                                <motion.button
                                    key={career.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    onClick={() => handleCareerSelect(career.id, career.title)}
                                    className="group relative bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-gray-900 hover:shadow-2xl transition-all duration-300"
                                >
                                    <div className="text-6xl mb-4">{career.icon}</div>
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-900 transition-colors" style={{ fontFamily: "Montserrat, sans-serif" }}>
                                        {career.title}
                                    </h3>
                                    <ArrowRight className="absolute bottom-6 right-6 w-6 h-6 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                                </motion.button>
                            ))}
                        </div>

                        <AnimatePresence>
                            {showCustomInput && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-6 bg-white border-2 border-gray-200 rounded-2xl p-6"
                                >
                                    <label className="block text-sm font-bold text-gray-900 mb-3" style={{ fontFamily: "Montserrat, sans-serif" }}>
                                        Zadej vlastní profesi:
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={customCareer}
                                            onChange={(e) => setCustomCareer(e.target.value)}
                                            onKeyPress={(e) => e.key === "Enter" && handleCustomCareerSubmit()}
                                            placeholder="např. Data Scientist, Architekt..."
                                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none font-medium"
                                            style={{ fontFamily: "Montserrat, sans-serif" }}
                                        />
                                        <button
                                            onClick={handleCustomCareerSubmit}
                                            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                                            style={{ fontFamily: "Montserrat, sans-serif" }}
                                        >
                                            Vytvořit
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Loading State */}
                {isGenerating && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full mb-6" />
                        <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
                            Generuji personalizovanou roadmapu...
                        </p>
                    </motion.div>
                )}

                {/* Roadmap Display */}
                {selectedCareer && roadmapNodes.length > 0 && !isGenerating && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                        {/* Progress Bar */}
                        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
                                    {selectedCareer}
                                </h3>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
                                        {getProgressPercentage()}%
                                    </p>
                                    <p className="text-sm text-gray-600 font-medium">Dokončeno</p>
                                </div>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${getProgressPercentage()}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-gradient-to-r from-gray-700 to-gray-900 rounded-full" />
                            </div>
                        </div>

                        {/* Roadmap Nodes */}
                        <div className="space-y-6">
                            {roadmapNodes.map((node, index) => {
                                const isCompleted = completedNodes.has(node.id);
                                const isLocked = index > 0 && !completedNodes.has(roadmapNodes[index - 1].id);

                                return (
                                    <motion.div key={node.id} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="relative">
                                        {index < roadmapNodes.length - 1 && <div className="absolute left-12 top-full w-0.5 h-6 bg-gray-300 z-0" />}

                                        <div
                                            className={`relative bg-white border-2 rounded-2xl p-6 transition-all duration-300 ${
                                                isLocked
                                                    ? "border-gray-200 opacity-50 cursor-not-allowed"
                                                    : isCompleted
                                                        ? "border-gray-900 shadow-lg"
                                                        : "border-gray-300 hover:border-gray-400 hover:shadow-xl cursor-pointer"
                                            }`}
                                            onClick={() => !isLocked && toggleNodeCompletion(node.id)}
                                        >
                                            <div className="flex items-start gap-6">
                                                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${getCategoryColor(node.category)} flex items-center justify-center text-white relative`}>
                                                    {isLocked ? <Lock className="w-8 h-8" /> : isCompleted ? <Check className="w-8 h-8" /> : node.icon}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h3 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: "Montserrat, sans-serif" }}>
                                                                {node.title}
                                                            </h3>
                                                            <p className="text-gray-600 font-medium" style={{ fontFamily: "Montserrat, sans-serif" }}>
                                                                {node.description}
                                                            </p>
                                                        </div>
                                                        {node.estimatedTime && (
                                                            <div className="flex-shrink-0 ml-4 px-4 py-2 bg-gray-100 rounded-lg">
                                                                <p className="text-sm font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
                                                                    {node.estimatedTime}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {node.resources && node.resources.length > 0 && !isLocked && (
                                                        <div className="mt-4 flex flex-wrap gap-2">
                                                            {node.resources.map((resource, i) => (
                                                                <a
                                                                    key={i}
                                                                    href={resource.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-200 transition-colors"
                                                                    style={{ fontFamily: "Montserrat, sans-serif" }}
                                                                >
                                                                    {resource.name}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Reset Button */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-12 text-center">
                            <button
                                onClick={() => {
                                    setSelectedCareer("");
                                    setRoadmapNodes([]);
                                    setCompletedNodes(new Set());
                                }}
                                className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-900 rounded-xl font-bold hover:border-gray-900 hover:shadow-lg transition-all"
                                style={{ fontFamily: "Montserrat, sans-serif" }}
                            >
                                Změnit profesi
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};
