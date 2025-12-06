import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { TypingText } from '../components/TypingText';
import { GradientButton } from '../components/GradientButton';
import { ProgressBar } from '../components/ProgressBar';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { springConfigs } from '../utils/animations';

type ConversationStep = {
  id: number;
  question: string;
  answer?: string;
};

export const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState<ConversationStep[]>([
    { id: 0, question: 'Ahoj, já jsem RTSoft kariérní poradce.' },
  ]);
  const [showInput, setShowInput] = useState(false);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    age: '',
    interests: '',
  });

  const questions = [
    { key: 'name', prompt: 'Napiš prosím: Ahoj, já jsem …', validation: (val: string) => val.length >= 2 },
    { key: 'age', prompt: 'Kolik je ti let?', validation: (val: string) => /^\d+$/.test(val) && parseInt(val) >= 12 && parseInt(val) <= 18 },
    { key: 'interests', prompt: 'Co tě baví? Co ti jde?', validation: (val: string) => val.length >= 5 },
  ];

  useEffect(() => {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [conversation]);

  const handleTypingComplete = () => {
    if (currentStep === 0) {
      setTimeout(() => {
        setConversation(prev => [...prev, { id: 1, question: questions[0].prompt }]);
        setCurrentStep(1);
        setShowInput(true);
      }, 800);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) {
      setError('Toto pole nemůže být prázdné');
      return;
    }

    const currentQuestion = questions[currentStep - 1];
    if (!currentQuestion.validation(userInput.trim())) {
      if (currentQuestion.key === 'name') {
        setError('Jméno musí obsahovat alespoň 2 znaky');
      } else if (currentQuestion.key === 'age') {
        setError('Zadej svůj věk číslem (12-18 let)');
      } else if (currentQuestion.key === 'interests') {
        setError('Napiš něco více o svých zájmech (min. 5 znaků)');
      }
      return;
    }

    setError('');
    const updatedConversation = [...conversation];
    updatedConversation[updatedConversation.length - 1].answer = userInput;
    setConversation(updatedConversation);

    if (currentQuestion.key === 'name') {
      setUserData(prev => ({ ...prev, name: userInput }));
    } else if (currentQuestion.key === 'age') {
      setUserData(prev => ({ ...prev, age: userInput }));
    } else if (currentQuestion.key === 'interests') {
      setUserData(prev => ({ ...prev, interests: userInput }));
    }

    setUserInput('');
    setShowInput(false);
    setIsTyping(true);

    if (currentStep < questions.length) {
      setTimeout(() => {
        setConversation(prev => [...prev, { id: currentStep + 1, question: questions[currentStep].prompt }]);
        setCurrentStep(currentStep + 1);
        setIsTyping(false);
        setTimeout(() => setShowInput(true), 500);
      }, 1500);
    } else {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsTyping(false);
      }, 500);
    }
  };

  const handleGetProfession = () => {
    navigate('/profession-reveal', { 
      state: { 
        profession: 'Frontend Developer',
        userData 
      } 
    });
  };

  const isComplete = currentStep > questions.length;
  const progress = Math.min(currentStep, questions.length);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springConfigs.smooth}
          className="mb-8"
        >
          <ProgressBar progress={progress} total={questions.length} />
        </motion.div>

        <GlassCard className="p-6 md:p-12 min-h-[600px] flex flex-col" hover={false}>
          <div 
            id="messages-container"
            className="flex-1 space-y-6 mb-8 overflow-y-auto max-h-[500px] pr-4 scroll-smooth"
          >
            <AnimatePresence mode="wait">
              {conversation.map((item, index) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    initial={{ opacity: 0, x: -30, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ ...springConfigs.smooth, delay: 0.1 }}
                    className="flex items-start gap-4 mb-4"
                  >
                    <motion.div 
                      className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 
                                flex items-center justify-center flex-shrink-0 shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={springConfigs.bouncy}
                    >
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </motion.div>
                    <div className="flex-1 pt-2">
                      {index === 0 || item.id > currentStep - 1 ? (
                        <TypingText
                          text={item.question}
                          speed={30}
                          onComplete={index === 0 ? handleTypingComplete : undefined}
                          className="text-lg md:text-xl text-gray-700 font-medium"
                        />
                      ) : (
                        <p className="text-lg md:text-xl text-gray-700 font-medium">{item.question}</p>
                      )}
                    </div>
                  </motion.div>

                  {item.answer && (
                    <motion.div
                      initial={{ opacity: 0, x: 30, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={springConfigs.smooth}
                      className="flex items-start gap-4 justify-end mb-6"
                    >
                      <div className="flex-1 text-right pt-2">
                        <motion.div 
                          className="inline-block px-6 py-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5
                                    border border-primary/20 text-gray-800 font-medium shadow-lg"
                          whileHover={{ scale: 1.02 }}
                          transition={springConfigs.gentle}
                        >
                          {item.answer}
                        </motion.div>
                      </div>
                      <motion.div 
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-100 
                                  flex items-center justify-center flex-shrink-0 shadow-lg"
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        transition={springConfigs.bouncy}
                      >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 
                                flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 rounded-full bg-primary/40"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {showInput && !isComplete && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={springConfigs.smooth}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium"
                  >
                    {error}
                  </motion.div>
                )}
                
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => {
                      setUserInput(e.target.value);
                      setError('');
                    }}
                    placeholder="Napiš svou odpověď..."
                    className="flex-1 px-6 py-4 rounded-2xl bg-white/50 border-2 border-white/20
                             backdrop-blur-xl text-gray-900 placeholder-gray-500
                             focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50
                             transition-all duration-300 font-medium"
                    autoFocus
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary via-primary-dark to-primary
                             text-gray-900 font-bold shadow-glow hover:shadow-glow-lg
                             transition-all duration-300 flex items-center gap-2"
                  >
                    <span>Odeslat</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </motion.button>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Stiskni Enter pro odeslání</span>
                </div>
              </motion.form>
            )}

            {isComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={springConfigs.bouncy}
                className="text-center space-y-6"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  ✨
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Skvělé! Máme všechny informace
                </h3>
                <p className="text-gray-600">
                  Nyní pro tebe připravíme personalizované kariérní doporučení
                </p>
                <GradientButton onClick={handleGetProfession} className="w-full md:w-auto px-12 py-5 text-lg">
                  <span className="flex items-center gap-3">
                    Získat profesi
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </GradientButton>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  );
};
