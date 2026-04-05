import { Transition, Variants } from 'framer-motion';

type HoverLiftPreset = {
  whileHover: { y?: number; scale?: number };
  whileTap: { scale?: number };
  transition: Transition;
};

export type MotionPresets = {
  fadeUp: Variants;
  staggerChildren: Variants;
  hoverLift: HoverLiftPreset;
  pageTransition: {
    initial: { opacity: number; y: number };
    animate: { opacity: number; y: number };
    exit: { opacity: number; y: number };
    transition: Transition;
  };
};

export const getMotionPresets = (reduceMotion: boolean): MotionPresets => {
  const ease = [0.22, 1, 0.36, 1] as const;

  return {
    fadeUp: {
      hidden: reduceMotion ? { opacity: 0, y: 0 } : { opacity: 0, y: 18 },
      show: {
        opacity: 1,
        y: 0,
        transition: {
          duration: reduceMotion ? 0.16 : 0.45,
          ease,
        },
      },
    },
    staggerChildren: {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: reduceMotion ? 0 : 0.08,
          delayChildren: reduceMotion ? 0 : 0.06,
        },
      },
    },
    hoverLift: {
      whileHover: reduceMotion ? {} : { y: -4, scale: 1.01 },
      whileTap: reduceMotion ? {} : { scale: 0.99 },
      transition: { duration: 0.2, ease },
    },
    pageTransition: {
      initial: reduceMotion ? { opacity: 0, y: 0 } : { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      exit: reduceMotion ? { opacity: 0, y: 0 } : { opacity: 0, y: 12 },
      transition: {
        duration: reduceMotion ? 0.16 : 0.34,
        ease,
      },
    },
  };
};
