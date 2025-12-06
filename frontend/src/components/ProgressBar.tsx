import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ProgressBarProps {
  progress: number;
  total: number;
  className?: string;
}

export const ProgressBar = ({ progress, total, className = '' }: ProgressBarProps) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const percentage = (progress / total) * 100;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">Krok {progress} z {total}</span>
        <span className="text-sm font-semibold text-primary">{Math.round(displayProgress)}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden backdrop-blur-xl">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-primary-dark to-primary rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${displayProgress}%` }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </motion.div>
      </div>
    </div>
  );
};
