import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export const Tooltip = ({
  content,
  children,
  position = "top",
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: "-top-12 left-1/2 -translate-x-1/2",
    bottom: "-bottom-12 left-1/2 -translate-x-1/2",
    left: "top-1/2 -translate-y-1/2 -left-32",
    right: "top-1/2 -translate-y-1/2 -right-32",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.8,
              y: position === "top" ? 10 : -10,
            }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: position === "top" ? 10 : -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${positions[position]} z-50 pointer-events-none`}
          >
            <div className="px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap">
              {content}
              <div
                className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 
                ${position === "top" ? "bottom-[-4px] left-1/2 -translate-x-1/2" : ""}
                ${position === "bottom" ? "top-[-4px] left-1/2 -translate-x-1/2" : ""}
                ${position === "left" ? "right-[-4px] top-1/2 -translate-y-1/2" : ""}
                ${position === "right" ? "left-[-4px] top-1/2 -translate-y-1/2" : ""}
              `}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
