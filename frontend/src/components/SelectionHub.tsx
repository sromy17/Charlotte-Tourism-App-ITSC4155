import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPinned, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { ActiveItinerary } from '../state/authStore';

type Props = {
  itinerary: ActiveItinerary;
  userName?: string;
  onResume: () => void;
  onStartNew: () => void;
};

export const SelectionHub: React.FC<Props> = ({ itinerary, userName, onResume, onStartNew }) => {
  const previewStops = itinerary.nodes?.slice(0, 3) ?? [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex h-full w-full max-w-5xl items-center"
    >
      <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="luxury-panel rounded-[30px] p-6 sm:p-8">
          <p className="luxury-label text-[#79bfa0]">Selection Hub</p>
          <h1 className="mt-3 text-4xl italic sm:text-5xl">
            {userName ? `Welcome back, ${userName}.` : 'Deployment ready.'}
          </h1>
          <p className="mt-3 max-w-2xl text-white/72">
            We detected an active itinerary in your session. Resume your existing route or clear the current deployment and launch a new induction sequence.
          </p>

          <div className="mt-6 rounded-[24px] border border-[#d6c08e]/30 bg-black/25 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#d6c08e]">
                  Active itinerary
                </p>
                <h2 className="mt-2 text-2xl italic text-[#F6F3EB]">{itinerary.title}</h2>
              </div>
              <div className="rounded-full border border-[#79bfa0]/30 bg-[#004D2C]/25 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#cde7da]">
                {itinerary.status ?? 'active'}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">Created</p>
                <p className="mt-2 text-sm text-white/80">{new Date(itinerary.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">Persona</p>
                <p className="mt-2 text-sm text-white/80">{itinerary.selections?.persona || 'Custom flow'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">Budget</p>
                <p className="mt-2 text-sm text-white/80">${itinerary.selections?.budget ?? '—'}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onResume}
              className="flex items-center gap-2 rounded-full border border-[#d6c08e]/80 bg-[#d6c08e]/10 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[#F6F3EB] transition hover:bg-[#d6c08e]/18"
            >
              <MapPinned size={15} />
              Access Existing Deployment
              <ArrowRight size={14} />
            </button>

            <button
              onClick={onStartNew}
              className="flex items-center gap-2 rounded-full border border-[#79bfa0]/70 bg-[#004D2C]/30 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[#F6F3EB] transition hover:bg-[#004D2C]/45"
            >
              <RotateCcw size={15} />
              Initialize New Sequence
            </button>
          </div>
        </div>

        <div className="luxury-panel rounded-[30px] p-6 sm:p-7">
          <div className="flex items-center gap-2 text-[#d6c08e]">
            <ShieldCheck size={16} />
            <p className="font-mono text-[11px] uppercase tracking-[0.22em]">Tactical Luxury Overview</p>
          </div>

          <div className="mt-5 space-y-3">
            {previewStops.length > 0 ? (
              previewStops.map((stop, index) => (
                <motion.div
                  key={stop.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.3 }}
                  className="rounded-2xl border border-white/10 bg-black/25 p-4"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#79bfa0]">Stop {index + 1}</p>
                  <p className="mt-2 text-base italic text-[#F6F3EB]">{stop.title}</p>
                  <p className="mt-1 text-sm text-white/60">{stop.location} · {stop.time}</p>
                </motion.div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/70">
                Your stored itinerary summary is ready for backend wiring.
              </div>
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-[#d6c08e]/20 bg-[#d6c08e]/5 p-4 text-sm text-white/70">
            <div className="flex items-center gap-2 text-[#d6c08e]">
              <Sparkles size={15} />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em]">Merge-ready note</span>
            </div>
            <p className="mt-2">
              The hub is powered by Zustand state, so backend endpoints can be dropped in without rewriting the UI flow.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default SelectionHub;
