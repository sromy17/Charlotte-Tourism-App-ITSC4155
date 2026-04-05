import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type GlowButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
};

const GlowButton: React.FC<GlowButtonProps> = ({
  children,
  onClick,
  className = '',
  type = 'button',
}) => {
  const reduceMotion = useReducedMotion();
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (reduceMotion) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    const strength = 0.12;
    const maxOffset = 8;

    setOffset({
      x: Math.max(-maxOffset, Math.min(maxOffset, x * strength)),
      y: Math.max(-maxOffset, Math.min(maxOffset, y * strength)),
    });
  };

  const resetOffset = () => setOffset({ x: 0, y: 0 });

  return (
    <motion.button
      type={type}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetOffset}
      onBlur={resetOffset}
      whileHover={reduceMotion ? {} : { scale: 1.03 }}
      whileTap={reduceMotion ? {} : { scale: 0.99 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`group relative overflow-hidden rounded-full border border-gold/60 bg-transparent px-10 py-4 font-inter text-xs font-semibold uppercase tracking-[0.24em] text-gold glow transition-colors hover:border-gold hover:bg-gold hover:text-bg0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald/70 ${className}`}
    >
      <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-gold/10 via-gold/26 to-gold/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span
        className="relative z-10 inline-block transition-transform duration-200"
        style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
      >
        {children}
      </span>
    </motion.button>
  );
};

export default GlowButton;