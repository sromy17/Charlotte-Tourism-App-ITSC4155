import React from 'react';
import { motion } from 'framer-motion';
import { SelectionPayload } from '../../state/experienceMachine';

type Props = {
  selections: SelectionPayload;
  loading: boolean;
  error: string | null;
  onSkip: () => void;
  onRetry: () => void;
};

const streamMessages = [
  'Matching your style with Charlotte highlights',
  'Balancing timing, pace, and travel flow',
  'Filtering for comfort and budget fit',
  'Curating signature moments for your day',
];

export const EngineLayer: React.FC<Props> = ({ selections, loading, error, onSkip, onRetry }) => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="mx-auto flex h-full w-full max-w-5xl flex-col justify-center"
    >
      <p className="luxury-label text-[#79bfa0]">Phase 2 · Curating Your Plan</p>
      <h2 className="mt-4 text-5xl italic">Putting together your perfect Charlotte day</h2>

      <div className="luxury-panel mt-10 p-7">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/70">
          Style: {selections.persona || 'Not selected'} · Pace: {selections.protocol}
        </p>

        <div className="mt-8 space-y-4">
          {streamMessages.map((line, idx) => (
            <motion.div
              key={line}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.35, duration: 0.35 }}
              className="flex items-center gap-3"
            >
              <motion.span
                className="h-2 w-2 rounded-full bg-[#79bfa0] shadow-[0_0_10px_rgba(121,191,160,0.7)]"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: idx * 0.15 }}
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/85">{line}</span>
            </motion.div>
          ))}
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-300/40 bg-red-900/20 p-3">
            <p className="font-mono text-[10px] tracking-[0.12em] text-red-100">{error}</p>
          </div>
        )}

        <motion.div
          className="mt-10 h-[2px] w-full bg-gradient-to-r from-transparent via-[#79bfa0] to-transparent"
          animate={{ opacity: loading ? [0.2, 1, 0.2] : [0.2, 0.4, 0.2], scaleX: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        />
      </div>

      <div className="mt-8 flex gap-3">
        {error && (
          <button
            onClick={onRetry}
            className="w-fit rounded-lg border border-[#79bfa0]/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#79bfa0] hover:bg-[#004D2C]/30"
          >
            Retry Stream
          </button>
        )}
        <button
          onClick={onSkip}
          className="w-fit rounded-lg border border-white/25 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.28em] text-white/85 hover:border-white/50"
        >
          Open My Itinerary
        </button>
      </div>
    </motion.section>
  );
};
