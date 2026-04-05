import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

type LabeledSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue: (value: number) => string;
};

const LabeledSlider: React.FC<LabeledSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue,
}) => {
  const reduceMotion = useReducedMotion();
  const progress = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted/95">{label}</p>

        <div className="relative min-w-[100px] text-right">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={value}
              initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: reduceMotion ? 0.12 : 0.18, ease: 'easeOut' }}
              className="inline-flex rounded-full border border-stroke bg-bone-white/[0.06] px-4 py-1.5 text-[0.95rem] font-black tracking-wide text-gold"
            >
              {formatValue(value)}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{
          background: `linear-gradient(90deg, rgba(107,123,58,0.92) 0%, rgba(107,123,58,0.76) ${progress}%, rgba(241,231,200,0.18) ${progress}%, rgba(241,231,200,0.18) 100%)`,
          boxShadow: `inset 0 0 0 1px rgba(241,231,200,0.08), inset 0 0 12px rgba(107,123,58,${Math.max(progress / 240, 0.14).toFixed(3)})`,
        }}
        className="h-2.5 w-full cursor-pointer appearance-none rounded-full shadow-inner
          [&::-webkit-slider-runnable-track]:h-2.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent
          [&::-webkit-slider-thumb]:-mt-[7px] [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-bone-white/70 [&::-webkit-slider-thumb]:bg-bone-white [&::-webkit-slider-thumb]:shadow-[0_0_0_5px_rgba(107,123,58,0.2),0_0_18px_rgba(107,123,58,0.55)]
          [&::-moz-range-track]:h-2.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent
          [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-bone-white/70 [&::-moz-range-thumb]:bg-bone-white [&::-moz-range-thumb]:shadow-[0_0_0_5px_rgba(107,123,58,0.2),0_0_18px_rgba(107,123,58,0.55)]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald/70"
      />
    </div>
  );
};

export default LabeledSlider;