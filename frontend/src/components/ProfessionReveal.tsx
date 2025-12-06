import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ProfessionRevealProps {
  profession: string;
  onComplete?: () => void;
}

export const ProfessionReveal = ({ profession, onComplete }: ProfessionRevealProps) => {
  const [showGlow, setShowGlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGlow(true);
      if (onComplete) {
        setTimeout(onComplete, 2000);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0"
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" 
             style={{ animationDelay: '1s' }} />
      </motion.div>

      <div className="relative z-10 text-center px-8 max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-light text-white mb-12"
        >
          Tvoje nejvhodnější profese je:
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative"
        >
          {showGlow && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: 2 }}
                className="absolute inset-0 bg-primary/30 blur-3xl rounded-full"
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 2, 0] }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 border-4 border-primary rounded-full"
              />
            </>
          )}
          
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary via-white to-primary 
                     bg-clip-text text-transparent
                     animate-glow-pulse
                     relative"
          >
            {profession}
          </motion.h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-16"
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], y: [0, -100] }}
              transition={{
                duration: 2,
                delay: 1.5 + i * 0.05,
                repeat: 0
              }}
              className="absolute w-2 h-2 bg-primary rounded-full"
              style={{
                left: `${50 + (Math.random() - 0.5) * 40}%`,
                top: '50%'
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};
