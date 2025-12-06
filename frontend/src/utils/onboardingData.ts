export interface Question {
  id: number;
  aiMessage: string;
  promptPrefix: string;
  type: "text" | "choice";
  choices?: string[];
  placeholder?: string;
  category: "personal" | "interests" | "skills" | "goals" | "preferences";
}

export const onboardingQuestions: Question[] = [
  {
    id: 1,
    aiMessage: "Ahoj! Jak se jmenuješ? 👋",
    promptPrefix: "Ahoj, jmenuji se",
    type: "text",
    placeholder: "...",
    category: "personal",
  },
  {
    id: 2,
    aiMessage: "Skvělé! Kolik ti je let?",
    promptPrefix: "Je mi",
    type: "text",
    placeholder: "let",
    category: "personal",
  },
  {
    id: 3,
    aiMessage: "Perfektní! A do jaké třídy chodíš? 📚",
    promptPrefix: "Chodím do",
    type: "text",
    placeholder: "třídy",
    category: "personal",
  },
  {
    id: 4,
    aiMessage: "Zajímavé! Který předmět tě baví nejvíc? 🎯",
    promptPrefix: "Nejvíc mě baví",
    type: "text",
    placeholder: "...",
    category: "interests",
  },
  {
    id: 5,
    aiMessage: "A který předmět ti jde nejlépe? 🌟",
    promptPrefix: "Nejlépe mi jde",
    type: "text",
    placeholder: "...",
    category: "skills",
  },
  {
    id: 6,
    aiMessage: "Super! Co tě zajímá ve volném čase?",
    promptPrefix: "Ve volném čase se věnuji",
    type: "text",
    placeholder: "...",
    category: "interests",
  },
  {
    id: 7,
    aiMessage: "Máš nějaké koníčky nebo zájmy? 🎨🎮🎸",
    promptPrefix: "Moje koníčky jsou",
    type: "text",
    placeholder: "...",
    category: "interests",
  },
  {
    id: 8,
    aiMessage:
      "Skvělé! Jaké máš oblíbené aktivity? Vyber všechny, které tě baví:",
    promptPrefix: "",
    type: "choice",
    choices: [
      "Sport a pohyb",
      "Kreslení a umění",
      "Programování",
      "Hudba",
      "Psaní a literatura",
      "Věda a experimenty",
    ],
    category: "interests",
  },
  {
    id: 9,
    aiMessage: "Jak se učíš nejlépe? 📖",
    promptPrefix: "",
    type: "choice",
    choices: [
      "Videem a vizuálně",
      "Čtením textů",
      "Praxí a zkoušením",
      "Diskuzí s ostatními",
    ],
    category: "preferences",
  },
  {
    id: 10,
    aiMessage: "Co je pro tebe největší motivace? 💪",
    promptPrefix: "Motivuje mě",
    type: "text",
    placeholder: "...",
    category: "preferences",
  },
  {
    id: 11,
    aiMessage: "V čem jsi opravdu dobrý/á? Nebuď skromný/á! 🌟",
    promptPrefix: "Jsem dobrý/á v",
    type: "text",
    placeholder: "...",
    category: "skills",
  },
  {
    id: 12,
    aiMessage: "A co bys chtěl/a zlepšit?",
    promptPrefix: "Chtěl/a bych zlepšit",
    type: "text",
    placeholder: "...",
    category: "goals",
  },
  {
    id: 13,
    aiMessage: "Jaké je tvé vysněné povolání nebo kariéra? 🚀",
    promptPrefix: "Moje vysněné povolání je",
    type: "text",
    placeholder: "...",
    category: "goals",
  },
  {
    id: 14,
    aiMessage: "Proč právě tato kariéra? Co tě na ní láká?",
    promptPrefix: "Láká mě to, protože",
    type: "text",
    placeholder: "...",
    category: "goals",
  },
  {
    id: 15,
    aiMessage: "Jak se raději učíš? ⏰",
    promptPrefix: "",
    type: "choice",
    choices: [
      "Ráno - jsem ranní ptáče",
      "Odpoledne - po škole",
      "Večer - mám klid",
      "Kdykoli - není to důležité",
    ],
    category: "preferences",
  },
  {
    id: 16,
    aiMessage: "Preferuješ práci sám/sama nebo v týmu? 👥",
    promptPrefix: "",
    type: "choice",
    choices: [
      "Raději sám/sama",
      "V malé skupině",
      "Ve velkém týmu",
      "Záleží na situaci",
    ],
    category: "preferences",
  },
  {
    id: 17,
    aiMessage: "Co tě stresuje nejvíc při učení? 😰",
    promptPrefix: "Při učení mě stresuje",
    type: "text",
    placeholder: "...",
    category: "preferences",
  },
  {
    id: 18,
    aiMessage: "Jaké technologie používáš nejčastěji? 💻📱",
    promptPrefix: "",
    type: "choice",
    choices: ["Počítač/Notebook", "Tablet", "Smartphone", "Všechno dohromady"],
    category: "preferences",
  },
  {
    id: 19,
    aiMessage: "Jak moc času trávíš učením denně? ⏱️",
    promptPrefix: "",
    type: "choice",
    choices: [
      "Méně než hodinu",
      "1-2 hodiny",
      "2-3 hodiny",
      "Více než 3 hodiny",
    ],
    category: "preferences",
  },
  {
    id: 20,
    aiMessage: "Jaké jsou tvé silné stránky? Vyber všechny:",
    promptPrefix: "",
    type: "choice",
    choices: [
      "Kreativita",
      "Logické myšlení",
      "Komunikace",
      "Organizace",
      "Trpělivost",
      "Rychlé učení",
    ],
    category: "skills",
  },
  {
    id: 21,
    aiMessage: "Co očekáváš od této platformy? 🎯",
    promptPrefix: "Očekávám, že mi pomůže",
    type: "text",
    placeholder: "...",
    category: "goals",
  },
  {
    id: 22,
    aiMessage: "Jakou střední školu zvažuješ? 🏫",
    promptPrefix: "Zvažuji",
    type: "text",
    placeholder: "typ školy nebo konkrétní školu",
    category: "goals",
  },
  {
    id: 23,
    aiMessage: "Co je pro tebe nejdůležitější při výběru střední školy?",
    promptPrefix: "",
    type: "choice",
    choices: [
      "Kvalita výuky",
      "Blízkost k domovu",
      "Zaměření školy",
      "Přátelé/spolužáci",
      "Budoucí kariéra",
    ],
    category: "goals",
  },
  {
    id: 24,
    aiMessage: "Jak se cítíš ohledně své budoucnosti? 😊",
    promptPrefix: "",
    type: "choice",
    choices: [
      "Nadšený/á a jistý/á",
      "Optimistický/á ale nejistý/á",
      "Trochu nervózní",
      "Nevím co čekat",
    ],
    category: "preferences",
  },
  {
    id: 25,
    aiMessage: "Poslední otázka! Co by ti nejvíc pomohlo právě teď? 💡",
    promptPrefix: "Nejvíc by mi pomohlo",
    type: "text",
    placeholder: "...",
    category: "goals",
  },
];

export interface UserResponse {
  questionId: number;
  question: string;
  answer: string;
  category: string;
  timestamp: string;
}
