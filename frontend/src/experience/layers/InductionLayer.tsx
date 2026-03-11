import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { SelectionPayload } from '../../state/experienceMachine';

type Props = {
  selections: SelectionPayload;
  onChange: (payload: Partial<SelectionPayload>) => void;
  onGenerate: () => void;
};

const personas = [
  {
    id: 'social',
    name: 'Social Weekend',
    description: 'Live atmosphere, game-day energy, and vibrant hotspots.',
    image: '/img/cltfans.jpg',
  },
  {
    id: 'leisure',
    name: 'Leisure & Luxury',
    description: 'Beautiful spaces, relaxed pace, and polished experiences.',
    image: '/img/cltgolf.jpg',
  },
  {
    id: 'food',
    name: 'Food & Culture',
    description: 'Curated culinary spots, local flavor, and creative districts.',
    image: '/img/beergarden.jpg',
  },
  {
    id: 'city',
    name: 'City Explorer',
    description: 'A balanced Charlotte mix from skyline to neighborhoods.',
    image: '/img/optimist1.jpg',
  },
];

const paceOptions = ['Relaxed', 'Balanced', 'Full Day'];

export const InductionLayer: React.FC<Props> = ({ selections, onChange, onGenerate }) => {
  const dateRef = useRef<HTMLDivElement | null>(null);
  const budgetRef = useRef<HTMLDivElement | null>(null);
  const paceRef = useRef<HTMLDivElement | null>(null);
  const launchRef = useRef<HTMLDivElement | null>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto h-full w-full max-w-6xl"
    >
      <div className="luxury-scroll h-full overflow-y-auto pr-1">
        <div className="pb-24 pt-2">
          <div className="mb-8">
            <p className="luxury-label text-[#79bfa0]">Step 1 · Choose your style</p>
            <h1 className="mt-4 text-5xl italic sm:text-6xl">Tell us your vibe, and we’ll do the rest</h1>
            <p className="mt-3 max-w-3xl text-white/72">
              This is a guided experience: once you make a choice, we’ll smoothly move you to the next step.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {personas.map((persona, index) => {
              const active = selections.persona === persona.name;
              return (
                <motion.button
                  key={persona.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: index * 0.06, duration: 0.35 }}
                  onClick={() => {
                    onChange({ persona: persona.name });
                    scrollTo(dateRef);
                  }}
                  className={`luxury-panel overflow-hidden text-left transition ${
                    active ? 'ring-1 ring-[#79bfa0]' : 'hover:ring-1 hover:ring-[#d6c08e]/55'
                  }`}
                >
                  <img src={persona.image} alt={persona.name} className="h-52 w-full object-cover" />
                  <div className="p-5">
                    <h3 className="text-3xl italic">{persona.name}</h3>
                    <p className="mt-2 text-sm text-white/70">{persona.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div ref={dateRef} className="mt-12 luxury-panel p-6">
            <p className="luxury-label">Step 2 · Pick a date</p>
            <h2 className="mt-2 text-3xl italic">When are you visiting?</h2>
            <input
              type="date"
              value={selections.arrival}
              onChange={(event) => {
                onChange({ arrival: event.target.value });
                scrollTo(budgetRef);
              }}
              className="mt-5 w-full max-w-sm rounded-xl border border-white/20 bg-black/35 px-4 py-3 text-white"
            />
          </div>

          <div ref={budgetRef} className="mt-5 luxury-panel p-6">
            <p className="luxury-label">Step 3 · Set your comfort budget</p>
            <h2 className="mt-2 text-3xl italic">How much would you like to spend?</h2>
            <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.2em] text-[#79bfa0]">${selections.budget}</p>
            <input
              type="range"
              min={100}
              max={3000}
              step={100}
              value={selections.budget}
              onChange={(event) => onChange({ budget: Number(event.target.value) })}
              onMouseUp={() => scrollTo(paceRef)}
              onTouchEnd={() => scrollTo(paceRef)}
              className="mt-4 w-full accent-[#79bfa0]"
            />
          </div>

          <div ref={paceRef} className="mt-5 luxury-panel p-6">
            <p className="luxury-label">Step 4 · Set your pace</p>
            <h2 className="mt-2 text-3xl italic">How full do you want your day to feel?</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {paceOptions.map((option) => {
                const active = selections.protocol === option;
                return (
                  <button
                    key={option}
                    onClick={() => {
                      onChange({ protocol: option });
                      scrollTo(launchRef);
                    }}
                    className={`rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] ${
                      active ? 'border-[#79bfa0] bg-[#004D2C]/30' : 'border-white/20 hover:border-[#d6c08e]/55'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div ref={launchRef} className="mt-8 luxury-panel p-6">
            <p className="luxury-label">Final Step · Build my plan</p>
            <h3 className="mt-2 text-3xl italic">You’re ready for your curated itinerary</h3>
            <p className="mt-2 text-white/70">
              We’ll combine your preferences with live city data and reveal your day in an interactive timeline.
            </p>
            <button
              onClick={onGenerate}
              className="mt-6 rounded-full border border-[#79bfa0] bg-[#004D2C]/45 px-7 py-3 font-mono text-[11px] uppercase tracking-[0.23em] hover:bg-[#004D2C]/65"
            >
              Build My Charlotte Day
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
