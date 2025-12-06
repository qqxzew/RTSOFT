import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GradientButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const GradientButton = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  disabled = false 
}: GradientButtonProps) => {
  const primaryStyles = `
    bg-gradient-to-r from-primary via-primary-dark to-primary
    text-gray-900 font-semibold
    shadow-glow hover:shadow-glow-lg
  `;

  const secondaryStyles = `
    bg-white/10 backdrop-blur-xl
    text-gray-700 font-medium
    border border-white/20
    hover:bg-white/20
  `;

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-8 py-4 rounded-2xl
        transition-all duration-300
        ${variant === 'primary' ? primaryStyles : secondaryStyles}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
};
