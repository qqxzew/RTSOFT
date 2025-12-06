import { motion } from "framer-motion";
import { ReactNode } from "react";

interface TimelineStepProps {
  icon: ReactNode;
  title: string;
  description: string;
  index: number;
}

export const TimelineStep = ({
  icon,
  title,
  description,
  index,
}: TimelineStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative"
    >
      <div className="flex items-start gap-6 group">
        <div
          className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 
                      flex items-center justify-center
                      border-l-4 border-primary
                      group-hover:scale-110 transition-transform duration-300"
        >
          <div className="text-primary text-2xl">{icon}</div>
        </div>

        <div
          className="flex-1 backdrop-blur-2xl bg-white/60 border border-white/20 
                      rounded-2xl p-6 shadow-glass
                      hover:shadow-glass-hover hover:bg-white/70
                      transition-all duration-300
                      border-l-4 border-l-primary"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>

      {index !== 4 && (
        <div className="ml-8 mt-4 mb-4 w-0.5 h-8 bg-gradient-to-b from-primary/50 to-transparent" />
      )}
    </motion.div>
  );
};
