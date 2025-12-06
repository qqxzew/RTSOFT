import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { Tooltip } from '../components/Tooltip';
import { springConfigs } from '../utils/animations';

export const Roadmap = () => {
  const location = useLocation();
  const profession = location.state?.profession || 'Frontend Developer';
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    {
      icon: '📚',
      title: 'Základy programování',
      description: 'Nauč se základy HTML, CSS a JavaScriptu. Pochop, jak fungují webové stránky a jak se vytváří interaktivní rozhraní.',
      resources: ['FreeCodeCamp', 'Codecademy', 'MDN Web Docs'],
      duration: '2-3 měsíce',
    },
    {
      icon: '⚛️',
      title: 'React a moderní framework',
      description: 'Osvojte si React, nejpopulárnější JavaScript framework. Naučte se pracovat s komponentami, hooks a state managementem.',
      resources: ['React Documentation', 'Scrimba React Course', 'Epic React'],
      duration: '3-4 měsíce',
    },
    {
      icon: '🎨',
      title: 'UI/UX a design',
      description: 'Studujte principy dobrého designu, naučte se Figmu a pochopte, jak vytvářet krásná a intuitivní uživatelská rozhraní.',
      resources: ['Figma', 'Refactoring UI', 'Laws of UX'],
      duration: '2-3 měsíce',
    },
    {
      icon: '🛠️',
      title: 'Nástroje a best practices',
      description: 'Zvládněte Git, TypeScript, testování a další profesionální nástroje. Naučte se pracovat v týmu a dodržovat best practices.',
      resources: ['Git Documentation', 'TypeScript Handbook', 'Testing Library'],
      duration: '2-3 měsíce',
    },
    {
      icon: '🚀',
      title: 'Portfolio a první projekty',
      description: 'Vytvořte si portfolio s reálnými projekty. Začněte se zajímat o open-source a hledejte první pracovní příležitosti.',
      resources: ['GitHub', 'LinkedIn', 'Portfolio Examples'],
      duration: '3-4 měsíce',
    },
  ];

  const handleStepToggle = (index: number) => {
    setExpandedStep(expandedStep === index ? null : index);
  };

  const handleStepComplete = (index: number) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter(i => i !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  const progress = (completedSteps.length / steps.length) * 100;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />
      <AnimatedBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springConfigs.smooth}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, ...springConfigs.bouncy }}
            className="inline-block mb-6"
          >
            <div className="px-6 py-3 rounded-full bg-primary/10 border border-primary/20 
                          backdrop-blur-xl text-primary font-semibold text-lg">
              🎯 Tvoje kariérní cesta
            </div>
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {profession}
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Zde je tvá personalizovaná cesta k úspěchu. Každý krok tě přiblíží k tvému cíli.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.5, ...springConfigs.smooth }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Celkový postup</span>
              <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary via-primary-dark to-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.6 }}
              />
            </div>
          </motion.div>
        </motion.div>

        <div className="mb-12">
          <GlassCard className="p-6 md:p-10" hover={false}>
            <div className="flex items-center gap-4 mb-8">
              <motion.div 
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 
                          flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 10 }}
                transition={springConfigs.bouncy}
              >
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Tvůj učební plán
                </h2>
                <p className="text-gray-600 mt-1">
                  Projdi těmito kroky systematicky a staň se expertem
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => {
                const isExpanded = expandedStep === index;
                const isCompleted = completedSteps.includes(index);

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <motion.div
                      layout
                      className={`
                        backdrop-blur-2xl rounded-2xl p-6 border-2 transition-all cursor-pointer
                        ${isCompleted 
                          ? 'bg-primary/5 border-primary/30' 
                          : 'bg-white/60 border-white/20'
                        }
                        hover:shadow-glass-hover
                      `}
                      onClick={() => handleStepToggle(index)}
                      whileHover={{ scale: 1.01, x: 5 }}
                      transition={springConfigs.gentle}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <motion.div 
                            className={`
                              w-16 h-16 rounded-2xl flex items-center justify-center text-3xl
                              ${isCompleted 
                                ? 'bg-primary/20 border-2 border-primary' 
                                : 'bg-gradient-to-br from-gray-100 to-gray-50'
                              }
                            `}
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                          >
                            {step.icon}
                          </motion.div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                              {step.title}
                              {isCompleted && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={springConfigs.bouncy}
                                >
                                  ✓
                                </motion.span>
                              )}
                            </h3>
                            <Tooltip content={step.duration}>
                              <div className="px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                                {step.duration}
                              </div>
                            </Tooltip>
                          </div>
                          
                          <p className="text-gray-600 leading-relaxed mb-4">
                            {step.description}
                          </p>

                          <motion.div
                            initial={false}
                            animate={{ height: isExpanded ? 'auto' : 0 }}
                            className="overflow-hidden"
                          >
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="pt-4 border-t border-gray-200 space-y-3"
                              >
                                <h4 className="font-semibold text-gray-900 text-sm">Doporučené zdroje:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {step.resources.map((resource, i) => (
                                    <motion.span
                                      key={i}
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: i * 0.1 }}
                                      className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm font-medium"
                                    >
                                      {resource}
                                    </motion.span>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Tooltip content={isCompleted ? "Označit jako nedokončené" : "Označit jako dokončené"}>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStepComplete(index);
                              }}
                              className={`
                                w-10 h-10 rounded-xl flex items-center justify-center transition-all
                                ${isCompleted 
                                  ? 'bg-primary text-white shadow-glow' 
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                }
                              `}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </motion.button>
                          </Tooltip>

                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={springConfigs.gentle}
                          >
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>

                    {index < steps.length - 1 && (
                      <div className="ml-8 h-8 flex items-center">
                        <div className={`
                          w-0.5 h-full transition-all
                          ${completedSteps.includes(index) ? 'bg-primary' : 'bg-gradient-to-b from-primary/50 to-transparent'}
                        `} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {[
            { icon: '⏱️', value: '12-18 měsíců', label: 'Odhadovaná doba' },
            { icon: '💼', value: '40-80K Kč', label: 'Průměrná mzda junior' },
            { icon: '📈', value: 'Vysoká', label: 'Poptávka na trhu' },
          ].map((stat, index) => (
            <GlassCard key={index} className="p-6 text-center" delay={index * 0.1}>
              <motion.div
                className="text-5xl mb-4"
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={springConfigs.bouncy}
              >
                {stat.icon}
              </motion.div>
              <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </GlassCard>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <p className="text-gray-500">
            💡 Tip: Udržuj si pravidelný studijní rytmus a neboj se ptát komunity
          </p>
        </motion.div>
      </div>
    </div>
  );
};
