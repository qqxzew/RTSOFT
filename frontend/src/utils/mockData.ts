export const mockProfessions = [
  {
    id: "frontend-developer",
    name: "Frontend Developer",
    description: "Vytváření uživatelských rozhraní webových aplikací",
    salary: "40-80K Kč",
    demand: "Vysoká",
    duration: "12-18 měsíců",
  },
  {
    id: "backend-developer",
    name: "Backend Developer",
    description: "Vývoj serverové části aplikací a API",
    salary: "45-85K Kč",
    demand: "Vysoká",
    duration: "12-18 měsíců",
  },
  {
    id: "ui-ux-designer",
    name: "UI/UX Designer",
    description: "Navrhování uživatelského rozhraní a zkušeností",
    salary: "35-70K Kč",
    demand: "Střední",
    duration: "10-16 měsíců",
  },
  {
    id: "data-analyst",
    name: "Data Analyst",
    description: "Analýza dat a vytváření reportů",
    salary: "40-75K Kč",
    demand: "Vysoká",
    duration: "14-20 měsíců",
  },
];

export const mockRoadmaps = {
  "frontend-developer": [
    {
      icon: "📚",
      title: "Základy programování",
      description:
        "Nauč se základy HTML, CSS a JavaScriptu. Pochop, jak fungují webové stránky a jak se vytváří interaktivní rozhraní.",
    },
    {
      icon: "⚛️",
      title: "React a moderní framework",
      description:
        "Osvojte si React, nejpopulárnější JavaScript framework. Naučte se pracovat s komponentami, hooks a state managementem.",
    },
    {
      icon: "🎨",
      title: "UI/UX a design",
      description:
        "Studujte principy dobrého designu, naučte se Figmu a pochopte, jak vytvářet krásná a intuitivní uživatelská rozhraní.",
    },
    {
      icon: "🛠️",
      title: "Nástroje a best practices",
      description:
        "Zvládněte Git, TypeScript, testování a další profesionální nástroje. Naučte se pracovat v týmu a dodržovat best practices.",
    },
    {
      icon: "🚀",
      title: "Portfolio a první projekty",
      description:
        "Vytvořte si portfolio s reálnými projekty. Začněte se zajímat o open-source a hledejte první pracovní příležitosti.",
    },
  ],
  "backend-developer": [
    {
      icon: "💻",
      title: "Základy programování",
      description:
        "Nauč se programovat v Pythonu nebo Node.js. Pochop algoritmy, datové struktury a objektově orientované programování.",
    },
    {
      icon: "🗄️",
      title: "Databáze a SQL",
      description:
        "Zvládni práci s databázemi - SQL, PostgreSQL, MongoDB. Nauč se navrhovat efektivní databázové schéma.",
    },
    {
      icon: "🌐",
      title: "REST API a GraphQL",
      description:
        "Vytváření API endpointů, autentizace, autorizace. Pochop REST principy a moderní API architektury.",
    },
    {
      icon: "🔒",
      title: "Bezpečnost a optimalizace",
      description:
        "Naučte se zajišťovat aplikace, pracovat s cache, optimalizovat výkon a škálovat systémy.",
    },
    {
      icon: "☁️",
      title: "Cloud a deployment",
      description:
        "Práce s cloudem (AWS, Azure), CI/CD, Docker, Kubernetes. Deployování produkčních aplikací.",
    },
  ],
};
