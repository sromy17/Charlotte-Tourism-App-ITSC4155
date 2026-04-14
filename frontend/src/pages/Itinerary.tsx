import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useExperienceStore } from '../state/experienceStore';

const Itinerary: React.FC = () => {
  const { itineraryNodes, weather, recommendations, noResultsMessage } = useExperienceStore();

  const activeStops = useMemo(() => itineraryNodes.filter((node) => node.lane === 'active'), [itineraryNodes]);
  const discoveryStops = useMemo(() => itineraryNodes.filter((node) => node.lane === 'discovery'), [itineraryNodes]);
  const events = recommendations?.events ?? [];
  const restaurants = recommendations?.restaurants ?? [];
  const activities = recommendations?.activities ?? [];

  return (
    <div className="min-h-[calc(100vh-7rem)] bg-[#020202] px-6 pb-20 text-[#F6F3EB]">
      <div className="mx-auto max-w-6xl">
        <header className="luxury-panel p-7">
          <p className="luxury-label text-[#79bfa0]">Itinerary Overview</p>
          <h1 className="mt-3 text-5xl italic">Your Charlotte day, beautifully organized</h1>
          <p className="mt-2 max-w-3xl text-white/70">
            This view keeps your schedule and flexible discoveries in one place, with a premium layout built for quick decisions.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/plan"
              className="rounded-full border border-[#79bfa0] bg-[#004D2C]/40 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-[#004D2C]/6"
            >
              Open Live Planner
            </Link>
            <Link
              to="/map"
              className="rounded-full border border-white/30 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] hover:border-[#d6c08e]/60"
            >
              View Map
            </Link>
          </div>

          {weather?.current_temp ? (
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">
              Current weather: {weather.current_temp}° · {weather.description}
            </p>
          ) : null}
        </header>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <section className="luxury-panel p-5">
            <p className="luxury-label">Planned Stops</p>
            <div className="mt-3 space-y-3">
              {activeStops.length === 0 ? (
                <p className="text-sm text-white/60">No planned stops yet. Start in the planner to generate your route.</p>
              ) : (
                activeStops.map((node, index) => (
                  <motion.article
                    key={node.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-xl border border-white/20 bg-black/30 p-4"
                  >
                    <h2 className="text-2xl italic">{node.title}</h2>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/65">{node.time}</p>
                    <p className="mt-1 text-sm text-white/70">{node.location}</p>
                    <p className="mt-2 text-xs text-white/55">{node.description}</p>
                  </motion.article>
                ))
              )}
            </div>
          </section>

          <section className="luxury-panel p-5">
            <p className="luxury-label">Optional Discoveries</p>
            <div className="mt-3 space-y-3">
              {discoveryStops.length === 0 ? (
                <p className="text-sm text-white/60">No discovery suggestions yet. Generate your plan to unlock nearby extras.</p>
              ) : (
                discoveryStops.map((node, index) => (
                  <motion.article
                    key={node.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-xl border border-white/20 bg-black/30 p-4"
                  >
                    <h2 className="text-2xl italic">{node.title}</h2>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/65">{node.time} · {node.driveTime}</p>
                    <p className="mt-1 text-sm text-white/70">{node.location}</p>
                    <p className="mt-2 text-xs text-white/55">{node.description}</p>
                  </motion.article>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="luxury-panel mt-6 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="luxury-label text-[#79bfa0]">Discovery Results</p>
            {recommendations && (
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                {recommendations.category} · {recommendations.date} · ${recommendations.budget}
              </p>
            )}
          </div>

          {noResultsMessage ? (
            <div className="mt-3 rounded-2xl border border-[#d6c08e]/35 bg-[#1a1404]/45 p-4">
              <p className="text-lg italic text-[#f3e8cc]">No matching recommendations right now</p>
              <p className="mt-2 text-sm text-[#e7ddc5]/85">{noResultsMessage}</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {[
                { title: 'Events', items: events },
                { title: 'Food / Restaurants', items: restaurants },
                { title: 'Activities / Places', items: activities },
              ].map((group) => (
                <article key={group.title} className="rounded-xl border border-white/20 bg-black/30 p-4">
                  <h2 className="text-xl italic">{group.title}</h2>
                  <div className="mt-3 space-y-2">
                    {group.items.length === 0 ? (
                      <p className="text-xs text-white/55">No results in this section for the selected budget/date.</p>
                    ) : (
                      group.items.slice(0, 5).map((item) => (
                        <div key={item.id} className="rounded-lg border border-white/10 bg-black/25 p-3">
                          <p className="text-sm text-white/90">{item.name}</p>
                          <p className="mt-1 text-xs text-white/60">{item.location}</p>
                          <p className="mt-1 text-xs text-white/60">{item.datetime || 'Time TBD'} · {item.price || 'Price unavailable'}</p>
                        </div>
                      ))
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Itinerary;
