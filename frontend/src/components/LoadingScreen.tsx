import { motion } from 'framer-motion';

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 z-50">
      <div className="text-center">
        <motion.div
          className="relative w-20 h-20 mx-auto mb-8"
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary" />
        </motion.div>

        <motion.h2
          className="text-2xl font-bold text-gray-900 mb-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          Načítání...
        </motion.h2>
        
        <motion.p
          className="text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Připravujeme pro vás nejlepší zážitek
        </motion.p>
      </div>
    </div>
  );
};
