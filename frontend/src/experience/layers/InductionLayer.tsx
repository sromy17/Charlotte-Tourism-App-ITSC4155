import React, { useMemo, useRef, useState } from 'react';
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
    categoryKey: 'social-weekend',
    description: 'Live atmosphere, game-day energy, and vibrant hotspots.',
    image: '/img/cltfans.jpg',
  },
  {
    id: 'leisure',
    name: 'Leisure and Luxury',
    categoryKey: 'leisure-and-luxury',
    description: 'Beautiful spaces, relaxed pace, and polished experiences.',
    image: '/img/cltgolf.jpg',
  },
  {
    id: 'food',
    name: 'Food and Culture',
    categoryKey: 'food-and-culture',
    description: 'Curated culinary spots, local flavor, and creative districts.',
    image: '/img/beergarden.jpg',
  },
  {
    id: 'city',
    name: 'City Explorer',
    categoryKey: 'city-explorer',
    description: 'A balanced Charlotte mix from skyline to neighborhoods.',
    image: '/img/optimist1.jpg',
  },
];

const paceOptions = ['Relaxed', 'Balanced', 'Full Day'];
const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const normalizeDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const addMonths = (date: Date, count: number) => new Date(date.getFullYear(), date.getMonth() + count, 1);

const toDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateValue = (value: string) => {
  if (!value) return null;

  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;

  return normalizeDate(new Date(year, month - 1, day));
};

const formatShortDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const formatLongDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const formatMonthLabel = (date: Date) => date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const getRangeLengthDays = (start: Date, end: Date) => Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
const isSameDay = (left: Date | null, right: Date | null) => Boolean(left && right && left.getTime() === right.getTime());

const buildCalendarDays = (month: Date) => {
  const monthStart = startOfMonth(month);
  const firstWeekday = monthStart.getDay();
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = Array.from({ length: firstWeekday }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(monthStart.getFullYear(), monthStart.getMonth(), day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
};

export const InductionLayer: React.FC<Props> = ({ selections, onChange, onGenerate }) => {
  const dateRef = useRef<HTMLDivElement | null>(null);
  const budgetRef = useRef<HTMLDivElement | null>(null);
  const paceRef = useRef<HTMLDivElement | null>(null);
  const launchRef = useRef<HTMLDivElement | null>(null);

  const today = useMemo(() => normalizeDate(new Date()), []);
  const selectedStart = parseDateValue(selections.arrival);
  const selectedEnd = parseDateValue(selections.endDate || selections.arrival);
  const initialVisibleMonth = startOfMonth(selectedStart ?? today);
  const [visibleMonth, setVisibleMonth] = useState(initialVisibleMonth);

  const tripLengthDays = selectedStart && selectedEnd ? getRangeLengthDays(selectedStart, selectedEnd) : 0;
  const tripSummary = selectedStart && selectedEnd
    ? selectedStart.getTime() === selectedEnd.getTime()
      ? `${formatLongDate(selectedStart)} · 1 day`
      : `${formatLongDate(selectedStart)} → ${formatLongDate(selectedEnd)} · ${tripLengthDays} days`
    : 'Pick your check-in and check-out dates';

  const calendarMonths = useMemo(
    () => [startOfMonth(visibleMonth), startOfMonth(addMonths(visibleMonth, 1))],
    [visibleMonth],
  );

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleDateSelection = (date: Date) => {
    const clickedDate = normalizeDate(date);
    const clickedValue = toDateValue(clickedDate);

    if (!selectedStart || !selectedEnd || selectedStart.getTime() !== selectedEnd.getTime()) {
      onChange({
        arrival: clickedValue,
        endDate: clickedValue,
        hours: 24,
      });
      return;
    }

    const [nextStart, nextEnd] = clickedDate.getTime() < selectedStart.getTime()
      ? [clickedDate, selectedStart]
      : [selectedStart, clickedDate];

    onChange({
      arrival: toDateValue(nextStart),
      endDate: toDateValue(nextEnd),
      hours: getRangeLengthDays(nextStart, nextEnd) * 24,
    });

    scrollTo(budgetRef);
  };

  const canMoveBackward = startOfMonth(visibleMonth).getTime() > startOfMonth(today).getTime();
  const isReadyToGenerate = Boolean(selections.category && selections.arrival && selections.budget > 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-7xl"
    >
      <div className="pb-24 pt-2">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
          <div className="xl:pr-6">
            <p className="luxury-label text-[#79bfa0]">Step 1 · Choose your style</p>
            <h1 className="mt-4 max-w-4xl text-5xl italic leading-[1.04] sm:text-6xl">
              Tell us your vibe, and we’ll shape the perfect Charlotte trip
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/72">
              Pick your mood, choose your dates, and set the pace. The planner now supports everything from a single day to a longer multi-day stay.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#79bfa0]/35 bg-[#004D2C]/20 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#cde7da]">
                {selections.persona || 'Choose a vibe'}
              </span>
              <span className="rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
                {selectedStart && selectedEnd
                  ? `${formatShortDate(selectedStart)} → ${formatShortDate(selectedEnd)}`
                  : 'Pick travel dates'}
              </span>
              <span className="rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
                {tripLengthDays > 0 ? `${tripLengthDays} day${tripLengthDays > 1 ? 's' : ''}` : 'Length flexible'}
              </span>
              <span className="rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
                Budget ${selections.budget}
              </span>
            </div>
          </div>

          <div className="luxury-panel rounded-[30px] p-5 sm:p-6">
            <p className="luxury-label text-[#79bfa0]">Quick Flow</p>
            <div className="mt-4 space-y-3">
              {[
                { step: '01', label: 'Pick your vibe', value: selections.persona || 'Not selected' },
                { step: '02', label: 'Travel dates', value: tripSummary },
                { step: '03', label: 'Set your budget', value: `$${selections.budget}` },
                { step: '04', label: 'Pick your pace', value: selections.protocol || 'Balanced' },
              ].map((item) => (
                <div key={item.step} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#79bfa0]">{item.step} · {item.label}</p>
                  <p className="mt-2 text-sm text-white/78">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {personas.map((persona, index) => {
            const active = selections.persona === persona.name;
            return (
              <motion.button
                key={persona.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
                onClick={() => {
                  onChange({ persona: persona.name, category: persona.categoryKey });
                  scrollTo(dateRef);
                }}
                className={`luxury-panel overflow-hidden rounded-[30px] text-left transition-all duration-300 ${
                  active
                    ? 'ring-1 ring-[#79bfa0] shadow-[0_0_0_1px_rgba(121,191,160,0.2)]'
                    : 'hover:-translate-y-1 hover:ring-1 hover:ring-[#d6c08e]/45'
                }`}
              >
                <img src={persona.image} alt={persona.name} className="h-64 w-full object-cover sm:h-72" />
                <div className="p-6 sm:p-7">
                  <h3 className="text-3xl italic sm:text-[2rem]">{persona.name}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">{persona.description}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div ref={dateRef} className="mt-10 luxury-panel p-6 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="luxury-label">Step 2 · Pick your dates</p>
              <h2 className="mt-2 text-3xl italic">Choose your check-in and check-out</h2>
              <p className="mt-2 max-w-2xl text-sm text-white/65">
                Click once to set your start date, then click again to set your end date. The two-month calendar makes it easy to choose trips that cross into the next month.
              </p>
            </div>

            <div className="rounded-2xl border border-[#79bfa0]/25 bg-[#004D2C]/15 px-4 py-3 text-right">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#79bfa0]">Selected stay</p>
              <p className="mt-2 text-sm text-white/85">{tripSummary}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
              disabled={!canMoveBackward}
              className="rounded-full border border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/75 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Earlier
            </button>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">Two-month range view</p>
            <button
              type="button"
              onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
              className="rounded-full border border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/75 hover:border-[#d6c08e]/45"
            >
              Later
            </button>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            {calendarMonths.map((month) => {
              const days = buildCalendarDays(month);

              return (
                <div key={month.toISOString()} className="rounded-[28px] border border-white/10 bg-black/20 p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-2xl italic">{formatMonthLabel(month)}</h3>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">Charlotte stay</p>
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-center">
                    {dayLabels.map((label) => (
                      <span key={label} className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
                        {label}
                      </span>
                    ))}

                    {days.map((date, index) => {
                      if (!date) {
                        return <div key={`empty-${month.toISOString()}-${index}`} className="aspect-square" />;
                      }

                      const normalized = normalizeDate(date);
                      const isPast = normalized.getTime() < today.getTime();
                      const isStart = isSameDay(normalized, selectedStart);
                      const isEnd = isSameDay(normalized, selectedEnd);
                      const isBoundary = isStart || isEnd;
                      const isInRange = Boolean(
                        selectedStart && selectedEnd && normalized >= selectedStart && normalized <= selectedEnd,
                      );
                      const isToday = isSameDay(normalized, today);

                      return (
                        <button
                          key={toDateValue(normalized)}
                          type="button"
                          disabled={isPast}
                          onClick={() => handleDateSelection(normalized)}
                          className={`aspect-square rounded-xl border text-sm transition ${
                            isBoundary
                              ? 'border-[#79bfa0] bg-[#79bfa0] font-semibold text-[#02150c]'
                              : isInRange
                                ? 'border-[#79bfa0]/25 bg-[#004D2C]/35 text-[#F6F3EB]'
                                : isToday
                                  ? 'border-[#d6c08e]/45 bg-[#d6c08e]/10 text-[#F6F3EB]'
                                  : 'border-transparent bg-white/[0.03] text-white/80 hover:border-[#d6c08e]/35'
                          } ${isPast ? 'cursor-not-allowed opacity-30' : ''}`}
                        >
                          {normalized.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div ref={budgetRef} className="luxury-panel p-6 sm:p-7">
            <p className="luxury-label">Step 3 · Set your comfort budget</p>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="mt-2 text-3xl italic">How much would you like to spend?</h2>
                <p className="mt-2 text-sm text-white/65">Adjust your range and we’ll keep your trip feeling right for you.</p>
              </div>
              <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#79bfa0]">${selections.budget}</p>
            </div>
            <input
              type="range"
              min={100}
              max={3000}
              step={100}
              value={selections.budget}
              onChange={(event) => onChange({ budget: Number(event.target.value) })}
              onMouseUp={() => scrollTo(paceRef)}
              onTouchEnd={() => scrollTo(paceRef)}
              className="mt-5 w-full accent-[#79bfa0]"
            />
          </div>

          <div className="luxury-panel p-6 sm:p-7">
            <p className="luxury-label">Trip length</p>
            <h2 className="mt-2 text-3xl italic">Built for one day or a longer stay</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Right now your trip covers <span className="text-[#d6c08e]">{tripLengthDays || 1} day{tripLengthDays === 1 || tripLengthDays === 0 ? '' : 's'}</span>, and the planner will treat it as roughly <span className="text-[#79bfa0]">{selections.hours} hours</span> of travel time.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px] xl:items-end">
          <div ref={paceRef} className="luxury-panel p-6 sm:p-7">
            <p className="luxury-label">Step 4 · Set your pace</p>
            <h2 className="mt-2 text-3xl italic">How full do you want your trip to feel?</h2>
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

          <div ref={launchRef} className="luxury-panel p-6 sm:p-7">
            <p className="luxury-label">Final Step · Build my plan</p>
            <h3 className="mt-2 text-3xl italic">You’re ready for your curated itinerary</h3>
            <p className="mt-2 text-sm leading-6 text-white/70">
              We’ll combine your preferences with live city data and reveal your trip in an interactive timeline.
            </p>
            <button
              onClick={onGenerate}
              disabled={!isReadyToGenerate}
              className="mt-6 w-full rounded-full border border-[#79bfa0] bg-[#004D2C]/45 px-7 py-3 font-mono text-[11px] uppercase tracking-[0.23em] hover:bg-[#004D2C]/65"
            >
              {isReadyToGenerate ? 'Build My Charlotte Day' : 'Choose vibe, date, and budget to continue'}
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
