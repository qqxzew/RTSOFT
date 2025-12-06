import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bot, Send, Sparkles, CheckCircle2, Star, Zap } from "lucide-react";
import { onboardingQuestions } from "../utils/onboardingData";
import type { UserResponse } from "../utils/onboardingData";

export const AIOnboarding = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [isAITyping, setIsAITyping] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const currentQuestion = onboardingQuestions[currentQuestionIndex];
  const totalQuestions = onboardingQuestions.length;

  useEffect(() => {
    // Check if user is authenticated
    if (!localStorage.getItem("isAuthenticated")) {
      navigate("/auth");
      return;
    }

    // Show AI message with typing effect
    setIsAITyping(true);
    setDisplayedText("");

    const typingTimer = setTimeout(() => {
      setIsAITyping(false);
      setShowQuestion(true);

      // Typing animation for AI message
      const message = currentQuestion.aiMessage;
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < message.length) {
          setDisplayedText(message.slice(0, i + 1));
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, 30);

      return () => clearInterval(typingInterval);
    }, 800);

    return () => clearTimeout(typingTimer);
  }, [currentQuestionIndex, navigate, currentQuestion.aiMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [responses, showQuestion]);

  useEffect(() => {
    setProgress((currentQuestionIndex / totalQuestions) * 100);
  }, [currentQuestionIndex]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (currentQuestion.type === "text" && !userInput.trim()) return;
    if (currentQuestion.type === "choice" && selectedChoices.length === 0)
      return;

    const answer =
      currentQuestion.type === "text"
        ? currentQuestion.promptPrefix + " " + userInput
        : selectedChoices.join(", ");

    const newResponse: UserResponse = {
      questionId: currentQuestion.id,
      question: currentQuestion.aiMessage,
      answer,
      category: currentQuestion.category,
      timestamp: new Date().toISOString(),
    };

    setResponses([...responses, newResponse]);
    setUserInput("");
    setSelectedChoices([]);
    setShowQuestion(false);

    // Save responses to localStorage
    const allResponses = [...responses, newResponse];
    localStorage.setItem("onboardingResponses", JSON.stringify(allResponses));

    if (currentQuestionIndex < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 500);
    } else {
      // Onboarding complete
      setTimeout(() => {
        localStorage.setItem("onboardingComplete", "true");
        navigate("/");
      }, 1500);
    }
  };

  const handleChoiceToggle = (choice: string) => {
    setSelectedChoices((prev) => {
      if (prev.includes(choice)) {
        return prev.filter((c) => c !== choice);
      }
      return [...prev, choice];
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main gradient orb */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-[#86BC25]/10 via-[#86BC25]/5 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.3, 1, 1.3],
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-tl from-gray-300/20 via-gray-200/10 to-transparent rounded-full blur-3xl"
        />

        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#86BC25]/30 rounded-full"
            animate={{
              y: [0, -150, 0],
              x: [0, Math.random() * 100 - 50, 0],
              opacity: [0, 0.6, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(200,200,200,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(200,200,200,0.3)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      {/* Progress bar - improved */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-gray-200/80 backdrop-blur-xl border-b border-gray-300/50">
          <motion.div
            className="h-full bg-gradient-to-r from-[#86BC25] via-[#a0d030] to-[#86BC25] shadow-[0_0_15px_rgba(134,188,37,0.3)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Header - redesigned */}
      <div className="relative z-10 pt-6 pb-4 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between p-4 bg-white/90 backdrop-blur-2xl border-2 border-gray-200/80 rounded-2xl shadow-xl">
            <div className="flex items-center gap-4">
              {/* AI Avatar with glow */}
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-[#86BC25]/30 to-[#86BC25]/10 rounded-2xl blur-xl"
                />
                <div className="relative w-14 h-14 bg-gradient-to-br from-[#86BC25] to-[#6a9c1d] rounded-2xl flex items-center justify-center shadow-xl">
                  <Bot className="w-8 h-8 text-white" />
                </div>
              </div>

              <div>
                <h2
                  className="text-xl font-bold text-gray-900 flex items-center gap-2"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  AI Průvodce
                  <Sparkles className="w-4 h-4 text-[#86BC25]" />
                </h2>
                <p
                  className="text-sm text-gray-600 font-medium"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  Otázka {currentQuestionIndex + 1} z {totalQuestions}
                </p>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span
                  className="text-xs text-gray-500 font-medium"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  Dokončeno
                </span>
                <span
                  className="text-2xl font-bold bg-gradient-to-r from-[#86BC25] to-[#6a9c1d] bg-clip-text text-transparent"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {Math.round(progress)}%
                </span>
              </div>

              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="rgba(200,200,200,0.3)"
                    strokeWidth="4"
                    fill="none"
                  />
                  <motion.circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="url(#gradient)"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 175.93" }}
                    animate={{
                      strokeDasharray: `${(progress / 100) * 175.93} 175.93`,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#86BC25" />
                      <stop offset="100%" stopColor="#a0d030" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Star className="w-6 h-6 text-[#86BC25]" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chat messages - redesigned */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 pb-48 pt-4">
        <div className="space-y-6">
          {/* Previous responses - show only last one */}
          {responses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              {/* AI previous question */}
              <motion.div className="flex gap-4 items-start">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#86BC25]/20 rounded-2xl blur-lg" />
                  <div className="relative w-12 h-12 bg-gradient-to-br from-[#86BC25] to-[#6a9c1d] rounded-2xl flex items-center justify-center shadow-lg">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="flex-1 max-w-[80%]">
                  <div className="bg-white/90 backdrop-blur-xl border-2 border-gray-200 rounded-2xl rounded-tl-none p-4 shadow-xl">
                    <p
                      className="text-gray-800 font-medium text-sm leading-relaxed"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {responses[responses.length - 1].question}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* User previous answer */}
              <motion.div className="flex gap-4 items-start justify-end">
                <div className="flex-1 max-w-[80%] flex justify-end">
                  <div className="bg-gradient-to-br from-[#86BC25] to-[#6a9c1d] rounded-2xl rounded-tr-none p-4 shadow-xl">
                    <p
                      className="text-white font-medium leading-relaxed"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {responses[responses.length - 1].answer}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gray-400/20 rounded-2xl blur-lg" />
                  <div className="relative w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">
                      {localStorage.getItem("username")?.[0].toUpperCase()}
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Current AI question */}
          <AnimatePresence mode="wait">
            {isAITyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex gap-4 items-start"
              >
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-[#86BC25]/20 rounded-2xl blur-lg"
                  />
                  <div className="relative w-12 h-12 bg-gradient-to-br from-[#86BC25] to-[#6a9c1d] rounded-2xl flex items-center justify-center shadow-lg">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="flex-1 max-w-[85%]">
                  <div className="bg-white/90 backdrop-blur-xl border-2 border-gray-200 rounded-2xl rounded-tl-none p-5 shadow-xl">
                    <div className="flex gap-2">
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="w-2.5 h-2.5 bg-[#86BC25] rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: 0.2,
                          ease: "easeInOut",
                        }}
                        className="w-2.5 h-2.5 bg-[#86BC25] rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: 0.4,
                          ease: "easeInOut",
                        }}
                        className="w-2.5 h-2.5 bg-[#86BC25] rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {showQuestion && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="flex gap-4 items-start"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-[#86BC25]/20 rounded-2xl blur-lg" />
                  <div className="relative w-12 h-12 bg-gradient-to-br from-[#86BC25] to-[#6a9c1d] rounded-2xl flex items-center justify-center shadow-lg">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="flex-1 max-w-[85%]">
                  <motion.div className="relative group bg-white/90 backdrop-blur-xl border-2 border-gray-200 rounded-2xl rounded-tl-none p-6 shadow-2xl overflow-hidden">
                    {/* Animated gradient overlay */}
                    <motion.div
                      animate={{
                        x: [-200, 200],
                        opacity: [0, 0.15, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-[#86BC25]/20 to-transparent"
                    />

                    <p
                      className="relative text-gray-900 font-semibold text-lg leading-relaxed"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {displayedText}
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block w-0.5 h-5 bg-[#86BC25] ml-1"
                      />
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area - redesigned */}
      {showQuestion && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="fixed bottom-0 left-0 right-0 z-20"
        >
          {/* Gradient backdrop */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/98 to-transparent backdrop-blur-2xl border-t border-gray-200" />

          <div className="relative max-w-4xl mx-auto p-6">
            {currentQuestion.type === "text" ? (
              <form onSubmit={handleSubmit}>
                <div className="relative group">
                  {/* Animated glow */}
                  <motion.div
                    animate={{
                      opacity: [0.3, 0.5, 0.3],
                      scale: [1, 1.02, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -inset-1 bg-gradient-to-r from-[#86BC25]/30 to-[#86BC25]/10 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-all duration-500"
                  />

                  <div className="relative flex items-center gap-3 bg-white backdrop-blur-xl border-2 border-gray-200 rounded-3xl p-2 shadow-2xl">
                    {/* Input container */}
                    <div className="flex-1 flex items-center gap-3 px-4 py-3">
                      <Zap className="w-5 h-5 text-[#86BC25] flex-shrink-0" />
                      <div className="flex-1 flex items-center gap-2">
                        <span
                          className="text-gray-600 font-semibold text-sm whitespace-nowrap"
                          style={{ fontFamily: "Montserrat, sans-serif" }}
                        >
                          {currentQuestion.promptPrefix}
                        </span>
                        <input
                          ref={inputRef}
                          type="text"
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          className="flex-1 outline-none bg-transparent font-semibold text-gray-900 placeholder:text-gray-400"
                          style={{ fontFamily: "Montserrat, sans-serif" }}
                          placeholder={currentQuestion.placeholder}
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Send button */}
                    <motion.button
                      type="submit"
                      disabled={!userInput.trim()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative px-8 py-4 bg-gradient-to-r from-[#86BC25] to-[#6a9c1d] rounded-2xl font-bold text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden group/btn"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      <motion.div
                        animate={{ x: [-100, 100] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      />
                      <span className="relative flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        Odeslat
                      </span>
                    </motion.button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Choice buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQuestion.choices?.map((choice, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: index * 0.08,
                        type: "spring",
                        stiffness: 200,
                      }}
                      onClick={() => handleChoiceToggle(choice)}
                      className="relative group/choice"
                    >
                      {/* Glow effect */}
                      <motion.div
                        animate={{
                          opacity: selectedChoices.includes(choice)
                            ? [0.3, 0.5, 0.3]
                            : 0,
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -inset-0.5 bg-gradient-to-r from-[#86BC25]/30 to-[#86BC25]/10 rounded-2xl blur-lg"
                      />

                      <div
                        className={`
                        relative p-5 rounded-2xl border-2 font-semibold text-left transition-all duration-300 shadow-xl overflow-hidden
                        ${
                          selectedChoices.includes(choice)
                            ? "bg-gradient-to-r from-[#86BC25] to-[#6a9c1d] text-white border-[#86BC25] scale-[1.02]"
                            : "bg-white text-gray-800 border-gray-200 hover:border-[#86BC25]/50 hover:bg-gray-50"
                        }
                      `}
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        {/* Shine effect */}
                        {selectedChoices.includes(choice) && (
                          <motion.div
                            animate={{ x: [-200, 200] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          />
                        )}

                        <div className="relative flex items-center justify-between gap-3">
                          <span className="flex-1">{choice}</span>
                          <motion.div
                            animate={{
                              scale: selectedChoices.includes(choice)
                                ? [1, 1.2, 1]
                                : 1,
                              rotate: selectedChoices.includes(choice)
                                ? [0, 360]
                                : 0,
                            }}
                            transition={{ duration: 0.5 }}
                          >
                            {selectedChoices.includes(choice) ? (
                              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0" />
                            )}
                          </motion.div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Continue button for choices */}
                <motion.button
                  onClick={() => handleSubmit()}
                  disabled={selectedChoices.length === 0}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: (currentQuestion.choices?.length || 0) * 0.08 + 0.2,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative w-full py-5 bg-gradient-to-r from-[#86BC25] to-[#6a9c1d] rounded-2xl font-bold text-white shadow-2xl hover:shadow-[#86BC25]/30 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden group/btn text-lg"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  <motion.div
                    animate={{ x: [-200, 200] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                  <span className="relative flex items-center justify-center gap-3">
                    <Send className="w-6 h-6" />
                    Pokračovat ({selectedChoices.length} vybráno)
                  </span>
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Completion message - redesigned */}
      {currentQuestionIndex === totalQuestions - 1 &&
        responses.length === totalQuestions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl"
          >
            {/* Celebration particles */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-gradient-to-br from-[#86BC25] to-yellow-400 rounded-full"
                initial={{
                  x: "50vw",
                  y: "50vh",
                  scale: 0,
                  opacity: 1,
                }}
                animate={{
                  x: `${Math.random() * 100}vw`,
                  y: `${Math.random() * 100}vh`,
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.05,
                  ease: "easeOut",
                }}
              />
            ))}

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: 0.2,
              }}
              className="relative max-w-lg mx-4"
            >
              {/* Glow effect */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-r from-[#86BC25] to-[#86BC25] rounded-3xl blur-3xl"
              />

              <div className="relative bg-white/95 backdrop-blur-2xl border-2 border-gray-200 rounded-3xl p-10 shadow-2xl text-center overflow-hidden">
                {/* Animated gradient overlay */}
                <motion.div
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 opacity-5"
                  style={{
                    background:
                      "linear-gradient(90deg, #86BC25, #d0d0d0, #86BC25)",
                    backgroundSize: "200% 200%",
                  }}
                />

                {/* Success icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.3,
                  }}
                  className="relative"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-24 h-24 bg-gradient-to-br from-[#86BC25] to-[#6a9c1d] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                  >
                    <Sparkles className="w-12 h-12 text-white" />
                  </motion.div>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="relative text-4xl font-bold text-gray-900 mb-4"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  Skvělá práce! 🎉
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="relative text-gray-700 font-medium text-lg mb-6 leading-relaxed"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  Tvoje odpovědi nám pomohou připravit personalizovaný plán pro
                  tvoji budoucnost...
                </motion.p>

                {/* Loading bar */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="relative"
                >
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.5, delay: 0.8 }}
                      className="h-full bg-gradient-to-r from-[#86BC25] to-[#a0d030]"
                    />
                  </div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="text-gray-600 text-sm mt-3 font-medium"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    Analyzuji odpovědi...
                  </motion.p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
    </div>
  );
};
