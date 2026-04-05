import React from 'react';
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  Variants,
} from 'framer-motion';
import InteractiveCard from './InteractiveCard';

type VibeCardProps = {
  title: string;
  subtitle: string;
  imageSrc: string;
  onClick: () => void;
  selected?: boolean;
  className?: string;
};

const VibeCard: React.FC<VibeCardProps> = ({
  title,
  subtitle,
  imageSrc,
  onClick,
  selected = false,
  className = '',
}) => {
  const reduceMotion = useReducedMotion() ?? false;

  const glowBackground = useMotionTemplate`radial-gradient(110% 85% at 20% 15%, rgba(61,74,47,0.28), transparent 55%), radial-gradient(90% 75% at 85% 20%, rgba(212,175,55,0.2), transparent 60%)`;

  const cardVariants: Variants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0.2 : 0.55,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <InteractiveCard
      variants={cardVariants}
      maxTilt={7}
      className={`group relative h-[420px] min-w-0 w-full overflow-hidden rounded-[22px] border bg-panel/85 shadow-[0_20px_40px_rgba(43,43,43,0.46)] ${
        selected ? 'border-gold/75 shadow-[0_0_0_1px_rgba(212,175,55,0.45),0_20px_46px_rgba(0,0,0,0.56)]' : 'border-gold/20 group-hover:border-gold/55'
      } ${className}`}
    >
      {({ imageY }) => (
        <button
          onClick={onClick}
          className="relative block h-full w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald/70"
          aria-label={title}
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: glowBackground }}
          />

          <motion.img
            src={imageSrc}
            alt={title}
            loading="lazy"
            decoding="async"
            style={{ y: imageY }}
            className="absolute inset-0 h-full w-full object-cover"
            animate={reduceMotion ? { scale: 1 } : { scale: 1.02 }}
            whileHover={reduceMotion ? {} : { scale: 1.05 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#2B2B2B]/0 via-[#2B2B2B]/30 to-[#2B2B2B]/88" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(241,231,200,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(107,123,58,0.08)_1px,transparent_1px)] bg-[size:36px_36px] opacity-15" />

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.32em] text-gold/95">
              {subtitle}
            </p>
            <h4 className="font-serif text-[1.6rem] leading-tight text-bone-white">
              {title}
            </h4>
          </div>
        </button>
      )}
    </InteractiveCard>
  );
};

export default VibeCard;