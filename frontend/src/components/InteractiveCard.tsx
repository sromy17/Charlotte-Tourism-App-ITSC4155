import React from 'react';
import {
  motion,
  MotionValue,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  Variants,
} from 'framer-motion';

type InteractiveRenderArgs = {
  imageY: MotionValue<number>;
  reduceMotion: boolean;
};

type InteractiveCardProps = {
  className?: string;
  maxTilt?: number;
  variants?: Variants;
  children: React.ReactNode | ((args: InteractiveRenderArgs) => React.ReactNode);
};

const InteractiveCard: React.FC<InteractiveCardProps> = ({
  className = '',
  maxTilt = 7,
  variants,
  children,
}) => {
  const reduceMotion = useReducedMotion() ?? false;
  const cardRef = React.useRef<HTMLDivElement>(null);
  const frameRef = React.useRef<number | null>(null);
  const pointerRef = React.useRef<{ x: number; y: number } | null>(null);

  const rotateXInput = useMotionValue(0);
  const rotateYInput = useMotionValue(0);

  const rotateX = useSpring(rotateXInput, { stiffness: 250, damping: 28, mass: 0.8 });
  const rotateY = useSpring(rotateYInput, { stiffness: 250, damping: 28, mass: 0.8 });

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [-12, 12]);

  const updateTilt = () => {
    if (!cardRef.current || !pointerRef.current) {
      frameRef.current = null;
      return;
    }

    const bounds = cardRef.current.getBoundingClientRect();
    const centerX = bounds.width / 2;
    const centerY = bounds.height / 2;
    const x = pointerRef.current.x - centerX;
    const y = pointerRef.current.y - centerY;

    rotateYInput.set((x / centerX) * maxTilt);
    rotateXInput.set((-(y / centerY)) * maxTilt);
    frameRef.current = null;
  };

  const onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || !cardRef.current) return;

    const bounds = cardRef.current.getBoundingClientRect();
    pointerRef.current = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };

    if (frameRef.current === null) {
      frameRef.current = window.requestAnimationFrame(updateTilt);
    }
  };

  const resetTilt = () => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    rotateXInput.set(0);
    rotateYInput.set(0);
    pointerRef.current = null;
  };

  React.useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      ref={cardRef}
      variants={variants}
      style={{
        rotateX: reduceMotion ? 0 : rotateX,
        rotateY: reduceMotion ? 0 : rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={reduceMotion ? {} : { scale: 1.02, y: -6 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className={`group relative ${className}`}
      onMouseMove={onMouseMove}
      onMouseLeave={resetTilt}
      onFocus={resetTilt}
    >
      {typeof children === 'function' ? children({ imageY, reduceMotion }) : children}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 mix-blend-soft-light" />
      <div className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100 shadow-[0_0_26px_rgba(212,175,55,0.3)]" />
    </motion.div>
  );
};

export default InteractiveCard;
