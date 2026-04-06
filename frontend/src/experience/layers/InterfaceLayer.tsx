import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SelectionPayload } from '../../state/experienceMachine';
import { useExperienceStore } from '../../state/experienceStore';

type Props = {
  selections: SelectionPayload;
  onReset: () => void;
};

export const InterfaceLayer: React.FC<Props> = ({ selections, onReset }) => {
  const { itineraryNodes, activeTaskId, setActiveTask, completeTask, weather } = useExperienceStore();

  const activeTasks = itineraryNodes.filter((node) => node.lane === 'active');
  const discoveryNodes = itineraryNodes.filter((node) => node.lane === 'discovery');

  const focusedNode = useMemo(
    () => itineraryNodes.find((node) => node.id === activeTaskId) ?? itineraryNodes[0],
    [itineraryNodes, activeTaskId],
  );

  const mapPoints = useMemo(
    () =>
      itineraryNodes.map((node, index) => ({
        id: node.id,
        top: `${18 + (index % 4) * 18}%`,
        left: `${12 + ((index * 17) % 72)}%`,
      })),
    [itineraryNodes],
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.45 }}
      className="grid h-full w-full grid-rows-[auto_1fr] gap-5"
    >
      <header className="luxury-panel flex items-center justify-between px-5 py-4">
        <div>
          <p className="luxury-label text-[#79bfa0]">Phase 3 · Your Day at a Glance</p>
          <p className="mt-1 text-sm text-white/80">
            {selections.persona || 'Your style'} · Budget ${selections.budget} · {selections.protocol} pace
          </p>
          {weather?.current_temp && (
            <p className="mt-1 font-mono text-[10px] tracking-[0.12em] text-white/60">
              Today in Charlotte: {weather.current_temp}° · {weather.description}
            </p>
          )}
        </div>
        <button
          onClick={onReset}
          className="rounded-lg border border-white/30 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.25em] hover:border-[#d6c08e]/65"
        >
          Start Over
        </button>
      </header>

      <div className="grid min-h-0 gap-5 lg:grid-cols-[300px_1fr_320px]">
        <aside className="luxury-panel luxury-scroll min-h-0 overflow-auto p-4">
          <h3 className="luxury-label">On Your Schedule</h3>
          <div className="mt-3 space-y-3">
            {activeTasks.map((task, index) => (
              <motion.button
                key={task.id}
                onClick={() => setActiveTask(task.id)}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: index * 0.05, duration: 0.35 }}
                className={`w-full rounded-xl border px-3 py-3 text-left ${
                  activeTaskId === task.id ? 'border-[#79bfa0] bg-[#004D2C]/30' : 'border-white/15 hover:border-[#d6c08e]/35'
                }`}
              >
                <p className="text-sm italic text-[#F6F3EB]">{task.title}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/65">{task.time}</p>
                <p className="mt-1 text-xs text-white/50">{task.location}</p>
              </motion.button>
            ))}
          </div>
        </aside>

        <div className="luxury-panel relative p-5">
          <div className="absolute inset-0 rounded-[28px] thin-border border border-white/15" />
          <p className="luxury-label">Living Map Canvas</p>

          <div className="relative mt-4 h-[calc(100%-28px)] overflow-hidden rounded-3xl border border-[#79bfa0]/25 bg-gradient-to-br from-[#0f2a1f] via-[#081510] to-[#020202] p-4">
            <div
              className="absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.2) 0.5px, transparent 0.5px), linear-gradient(90deg, rgba(255,255,255,0.2) 0.5px, transparent 0.5px)',
                backgroundSize: '42px 42px',
              }}
            />

            <div className="relative z-10 flex h-full flex-col">
              <p className="text-sm text-white/80">
                {focusedNode ? `Now highlighting: ${focusedNode.title}` : 'Choose a stop to preview your route'}
              </p>
              <p className="mt-1 text-xs text-white/55">Smooth transitions between your planned highlights and optional discoveries.</p>

              <div className="relative mt-5 flex-1">
                {mapPoints.map((point, index) => {
                  const active = point.id === focusedNode?.id;
                  return (
                    <motion.button
                      key={point.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: active ? 1.14 : 1 }}
                      transition={{ delay: index * 0.05, duration: 0.35 }}
                      style={{ top: point.top, left: point.left }}
                      onClick={() => setActiveTask(point.id)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-2 py-1 text-[10px] ${
                        active
                          ? 'border-[#d6c08e] bg-[#d6c08e]/25 text-[#F6F3EB] shadow-[0_0_22px_rgba(214,192,142,0.4)]'
                          : 'border-white/35 bg-black/35 text-white/80 hover:border-[#79bfa0]'
                      }`}
                    >
                      ●
                    </motion.button>
                  );
                })}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {itineraryNodes.slice(0, 4).map((node, index) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-lg border border-white/20 bg-black/35 px-3 py-2"
                  >
                    <p className="text-sm text-[#F6F3EB]">{node.title}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/60">{node.time}</p>
                    <p className="mt-1 text-xs text-white/50">{node.driveTime} · {node.cost}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="luxury-panel luxury-scroll min-h-0 overflow-auto p-4">
          <h3 className="luxury-label">Nice Extras Nearby</h3>
          <div className="mt-3 space-y-3">
            {discoveryNodes.map((node, index) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: index * 0.05, duration: 0.35 }}
                className="rounded-xl border border-white/15 px-3 py-3"
              >
                <p className="text-sm italic">{node.title}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/65">{node.time}</p>
                <p className="mt-1 text-xs text-white/50">{node.location}</p>
                <p className="mt-2 text-xs text-white/45">{node.description}</p>
                <button
                  onClick={() => completeTask(node.id)}
                  className="mt-2 rounded-md border border-white/25 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] hover:border-[#79bfa0]"
                >
                  Add to Done
                </button>
              </motion.div>
            ))}
          </div>
        </aside>
      </div>
    </motion.section>
  );
};
