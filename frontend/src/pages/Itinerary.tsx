import React, { useMemo, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import RecommendationCard from '../components/RecommendationCard';
import { useExperienceStore, ItineraryNode, RecommendationItem } from '../state/experienceStore';
import { useAuthStore } from '../state/authStore';
import { RecommendationItemAPI, saveItinerary } from '../services/api';

type PlanItem = RecommendationItemAPI | ItineraryNode;

type SortablePlanItemProps = {
  item: RecommendationItemAPI;
  index: number;
  onRemove: () => void;
};

const SortablePlanItem: React.FC<SortablePlanItemProps> = ({ item, index, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  return (
    <motion.article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-xl border border-white/20 bg-black/30 p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-royal-emerald/20 text-royal-emerald font-semibold">
            {index + 1}
          </div>
          <div>
            <h2 className="text-2xl italic">{item.name}</h2>
            <p className="mt-1 text-xs text-white/60">{item.location || 'Charlotte destination'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white/80 hover:bg-white/10"
          >
            ↕
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-2 text-[11px] text-red-200 hover:bg-red-500/20"
          >
            Remove
          </button>
        </div>
      </div>

      {item.description && <p className="mt-3 text-sm text-white/70">{item.description}</p>}
      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-white/60">
        {item.datetime && <span>{item.datetime.split('T')[0]}</span>}
        {item.price && <span>{item.price}</span>}
      </div>
    </motion.article>
  );
};

const Itinerary: React.FC = () => {
  const {
    itineraryNodes,
    selectedPlaces,
    weather,
    recommendations,
    noResultsMessage,
    addSelectedPlace,
    removeSelectedPlace,
    reorderSelectedPlaces,
  } = useExperienceStore();
  const user = useAuthStore((state) => state.user);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const signedInUser = useMemo(() => {
    if (user?.id) return user;
    const stored = localStorage.getItem('user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }, [user]);

  const activeStops = useMemo(() => itineraryNodes.filter((node) => node.lane === 'active'), [itineraryNodes]);
  const discoveryStops = useMemo(() => itineraryNodes.filter((node) => node.lane === 'discovery'), [itineraryNodes]);
  const events = recommendations?.events ?? [];
  const restaurants = recommendations?.restaurants ?? [];
  const activities = recommendations?.activities ?? [];
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const hasSelectedPlan = selectedPlaces.length > 0;
  const currentPlan: PlanItem[] = hasSelectedPlan ? selectedPlaces : activeStops;

  const itineraryItemsToSave = hasSelectedPlan ? selectedPlaces : activeStops.map((item) => ({
    id: item.id,
    name: item.title,
    type: 'saved',
    api_source: 'manual',
    description: item.description,
    location: item.location,
    price: item.cost,
    image_url: undefined,
    datetime: item.time,
  }));

  const handleSave = async () => {
    if (!signedInUser?.id) {
      setSaveMessage('Sign in first so we can save this itinerary to your account.');
      return;
    }

    if (itineraryItemsToSave.length === 0) {
      setSaveMessage('Please add at least one stop before saving your itinerary.');
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      await saveItinerary({
        trip_name: `Charlotte Itinerary ${new Date().toLocaleDateString()}`,
        user_id: Number(signedInUser.id),
        saved_activities: {
          items: itineraryItemsToSave,
          saved_at: new Date().toISOString(),
        },
      });
      setSaveMessage('Your itinerary has been saved successfully.');
    } catch (error) {
      console.error('[Itinerary] Save failed:', error);
      setSaveMessage('Unable to save itinerary right now. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const mapRecommendationToApi = useCallback((item: RecommendationItem): RecommendationItemAPI => ({
    id: item.id,
    name: item.name,
    type: item.type,
    api_source: item.source,
    description: item.description,
    location: item.location,
    price: item.price ?? undefined,
    image_url: item.image ?? undefined,
    datetime: item.datetime ?? undefined,
    coordinates: undefined,
  }), []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = selectedPlaces.findIndex((item) => item.id === String(active.id));
      const newIndex = selectedPlaces.findIndex((item) => item.id === String(over.id));
      if (oldIndex < 0 || newIndex < 0) return;
      reorderSelectedPlaces(arrayMove(selectedPlaces, oldIndex, newIndex));
    },
    [selectedPlaces, reorderSelectedPlaces],
  );

  const isAdded = useCallback(
    (item: RecommendationItemAPI) => selectedPlaces.some((place) => place.id === item.id),
    [selectedPlaces],
  );

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
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || itineraryItemsToSave.length === 0}
              className="rounded-full border border-[#d6c08e] bg-[#d6c08e]/15 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition hover:bg-[#d6c08e]/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Itinerary'}
            </button>
          </div>
          {saveMessage ? (
            <p className="mt-4 text-sm text-[#f3e8cc]">{saveMessage}</p>
          ) : null}

          {weather?.current_temp ? (
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">
              Current weather: {weather.current_temp}° · {weather.description}
            </p>
          ) : null}
        </header>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <section className="luxury-panel p-5">
            <p className="luxury-label">{hasSelectedPlan ? 'Current Plan' : 'Planned Stops'}</p>
            <div className="mt-3 space-y-3">
              {currentPlan.length === 0 ? (
                <p className="text-sm text-white/60">No planned stops yet. Start in the planner to generate your route.</p>
              ) : hasSelectedPlan ? (
                <div className="space-y-3">
                  <p className="text-xs text-white/50">Drag to reorder your selected stops, or remove any item as needed.</p>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={selectedPlaces.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-3">
                        {selectedPlaces.map((item, index) => (
                          <SortablePlanItem key={item.id} item={item} index={index} onRemove={() => removeSelectedPlace(item.id)} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              ) : (
                currentPlan.map((item, index) => {
                  const title = 'name' in item ? item.name : item.title;
                  const time = 'datetime' in item ? item.datetime : 'time' in item ? item.time : undefined;
                  const location = item.location;
                  const description = item.description;
                  const price = 'price' in item ? item.price : undefined;

                  return (
                    <motion.article
                      key={item.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ delay: index * 0.05 }}
                      className="rounded-xl border border-white/20 bg-black/30 p-4"
                    >
                      <h2 className="text-2xl italic">{title}</h2>
                      {time && (
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/65">{time}</p>
                      )}
                      <p className="mt-1 text-sm text-white/70">{location}</p>
                      {price && <p className="mt-1 text-xs text-white/55">{price}</p>}
                      {description && <p className="mt-2 text-xs text-white/55">{description}</p>}
                    </motion.article>
                  );
                })
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
                      group.items.slice(0, 5).map((item, itemIndex) => {
                        const apiItem = mapRecommendationToApi(item);
                        return (
                          <RecommendationCard
                            key={item.id}
                            item={apiItem}
                            index={itemIndex}
                            variant="compact"
                            onAdd={() => addSelectedPlace(apiItem)}
                            isAdded={isAdded(apiItem)}
                          />
                        );
                      })
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
