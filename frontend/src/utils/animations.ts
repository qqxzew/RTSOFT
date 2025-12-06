export const springConfigs = {
  gentle: {
    type: "spring" as const,
    stiffness: 100,
    damping: 20,
    mass: 1,
  },
  smooth: {
    type: "spring" as const,
    stiffness: 150,
    damping: 25,
    mass: 0.8,
  },
  bouncy: {
    type: "spring" as const,
    stiffness: 300,
    damping: 15,
    mass: 0.5,
  },
  stiff: {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
    mass: 0.3,
  },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -60 },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -60 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 60 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

export const slideInRight = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const floatingAnimation = {
  y: [0, -20, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

export const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

export const glowAnimation = {
  boxShadow: [
    "0 0 20px rgba(0, 255, 156, 0.3)",
    "0 0 40px rgba(0, 255, 156, 0.6)",
    "0 0 20px rgba(0, 255, 156, 0.3)",
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

export const rotateIn = {
  initial: { opacity: 0, rotate: -180, scale: 0 },
  animate: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: springConfigs.bouncy,
  },
};

export const pageTransition = {
  initial: { opacity: 0, x: 100 },
  animate: {
    opacity: 1,
    x: 0,
    transition: springConfigs.smooth,
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: { duration: 0.3 },
  },
};

export const modalAnimation = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springConfigs.smooth,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: { duration: 0.2 },
  },
};

export const hoverScale = {
  scale: 1.05,
  transition: springConfigs.gentle,
};

export const tapScale = {
  scale: 0.95,
  transition: springConfigs.stiff,
};
