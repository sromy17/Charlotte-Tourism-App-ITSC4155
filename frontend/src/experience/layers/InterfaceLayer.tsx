import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SelectionPayload } from '../../state/experienceMachine';
import { useExperienceStore } from '../../state/experienceStore';
import RecommendationCard from '../../components/RecommendationCard';
import { RecommendationItemAPI } from '../../services/api';

type Props = {
  selections: SelectionPayload;
  onReset: () => void;
};

type SortablePlanItemProps = {
  item: RecommendationItemAPI;
  index: number;
  onRemove: () => void;
};

const SortablePlanItem: React.FC<SortablePlanItemProps> = ({ item, index, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="rounded-3xl border border-white/10 bg-[#081311]/95 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-3xl bg-royal-emerald/20 text-royal-emerald font-semibold">
            {index + 1}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white line-clamp-2">{item.name}</p>
            <p className="text-xs text-white/50">{item.location || 'Charlotte destination'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            {...listeners}
            {...attributes}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[12px] text-white/70 hover:bg-white/10"
          >
            ☰
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-full border border-white/10 bg-red-500/10 px-3 py-2 text-[12px] text-red-300 hover:bg-red-500/20"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export const InterfaceLayer: React.FC<Props> = ({ selections, onReset }) => {
  const {
    itineraryNodes,
    activeTaskId,
    setActiveTask,
    completeTask,
    weather,
    recommendations,
    noResultsMessage,
    selectedPlaces,
    addSelectedPlace,
    removeSelectedPlace,
    reorderSelectedPlaces,
  } = useExperienceStore();

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

  const events = recommendations?.events ?? [];
  const restaurants = recommendations?.restaurants ?? [];
  const activities = recommendations?.activities ?? [];

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const availableItems = useMemo<RecommendationItemAPI[]>(
    () =>
      [...events, ...restaurants, ...activities].map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        api_source: item.source,
        description: item.description,
        location: item.location,
        price: item.price ?? undefined,
        image_url: item.image ?? undefined,
        datetime: item.datetime ?? undefined,
        coordinates: (item as any).coordinates ?? undefined,
      })),
    [events, restaurants, activities],
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = selectedPlaces.findIndex((item) => item.id === String(active.id));
    const newIndex = selectedPlaces.findIndex((item) => item.id === String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    reorderSelectedPlaces(arrayMove(selectedPlaces, oldIndex, newIndex));
  };

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

      <section className="luxury-panel luxury-scroll min-h-0 overflow-auto p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="luxury-label text-[#79bfa0]">Filtered Results</p>
            <h3 className="mt-1 text-2xl italic">Build your itinerary from the recommendations below</h3>
          </div>
          {recommendations && (
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
              {recommendations.category} · {recommendations.date} · ${recommendations.budget}
            </p>
          )}
        </div>

        {noResultsMessage ? (
          <div className="mt-4 rounded-2xl border border-[#d6c08e]/35 bg-[#1a1404]/45 p-5">
            <p className="text-lg italic text-[#f3e8cc]">No perfect matches found yet</p>
            <p className="mt-2 text-sm text-[#e7ddc5]/85">{noResultsMessage}</p>
            <p className="mt-2 text-xs text-[#d6c08e]">Tip: Try a nearby date, a broader vibe, or a slightly higher budget limit.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#79bfa0]">Available Picks</p>
                    <p className="mt-2 text-sm text-white/70">Add attractions to your itinerary directly from the recommendation list.</p>
                  </div>
                  <span className="rounded-full bg-white/5 px-3 py-2 text-[11px] text-white/70">{availableItems.length} options</span>
                </div>

                <div className="mt-4 grid gap-4">
                  {availableItems.length === 0 ? (
                    <div className="rounded-3xl border border-white/10 bg-black/25 p-4 text-sm text-white/60">
                      No recommendations available yet. Generate a new plan to start building.
                    </div>
                  ) : (
                    availableItems.map((item) => (
                      <RecommendationCard
                        key={item.id}
                        item={item}
                        onAdd={() => addSelectedPlace(item)}
                        isAdded={selectedPlaces.some((selected) => selected.id === item.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#020202]/95 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="luxury-label text-[#79bfa0]">My Itinerary</p>
                  <p className="mt-2 text-sm text-white/70">Drag to reorder the stops and lock in the order you want.</p>
                </div>
                <span className="rounded-full bg-white/5 px-3 py-2 text-[11px] text-white/70">{selectedPlaces.length} stops</span>
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={selectedPlaces.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                  <div className="mt-4 space-y-3">
                    {selectedPlaces.length === 0 ? (
                      <div className="rounded-3xl border border-white/10 bg-black/25 p-6 text-sm text-white/60">
                        Add items from the recommendation cards to start building your day.
                      </div>
                    ) : (
                      selectedPlaces.map((item, idx) => (
                        <SortablePlanItem
                          key={item.id}
                          item={item}
                          index={idx}
                          onRemove={() => removeSelectedPlace(item.id)}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        )}
      </section>
    </motion.section>
  );
};
