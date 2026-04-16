import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom'; 
import { SelectionPayload } from '../../state/experienceMachine';
import { useExperienceStore } from '../../state/experienceStore';
import { useAuthStore } from '../../state/authStore';
import RecommendationCard from '../../components/RecommendationCard';
import { RecommendationItemAPI, saveItinerary } from '../../services/api';

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
  const navigate = useNavigate(); 
  const {
    itineraryNodes,
    weather,
    recommendations,
    selectedPlaces,
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

const itineraryItemsToSave = useMemo(() => {
  return selectedPlaces.map((item: any) => ({
    id: String(item.id),
    name: item.name || 'Unnamed Spot',
    type: item.type || 'activity',
    api_source: item.api_source || 'manual',
    description: item.description || '',
    location: item.location || item.address || 'Charlotte, NC',
    price: String(item.price || '0'),
    image_url: item.image_url || undefined,
    datetime: item.datetime || new Date().toISOString(),
    latitude: Number(item.latitude || item.coordinates?.latitude || 35.2271),
    longitude: Number(item.longitude || item.coordinates?.longitude || -80.8431), // ✅ FIXED SPELING
    time: item.time || '12:00'
  }));
}, [selectedPlaces]); 

const handleSaveItinerary = async () => {
  if (!signedInUser?.id) {
    setSaveMessage('Sign in first so your itinerary is saved to your account.');
    return;
  }

  if (itineraryItemsToSave.length === 0) {
    setSaveMessage('Add stops before saving your itinerary.');
    return;
  }

  setIsSaving(true);
  setSaveMessage(null);

  try {
    await saveItinerary({
      trip_name: `Charlotte Journey`,
      user_id: Number(signedInUser.id),
      saved_activities: {
        items: itineraryItemsToSave as any, 
        saved_at: new Date().toISOString(),
      },
    });

    setSaveMessage('Success! Transporting to your itinerary...');
    setTimeout(() => navigate('/itinerary'), 600); 

  } catch (error) {
    console.error('[InterfaceLayer] Save failed', error);
    setSaveMessage('Unable to save itinerary. Please try again.');
  } finally {
    setIsSaving(false);
  }
};

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  
  // Fixed the dependency issue by moving logic inside useMemo
  const availableItems = useMemo<RecommendationItemAPI[]>(() => {
    const events = recommendations?.events ?? [];
    const restaurants = recommendations?.restaurants ?? [];
    const activities = recommendations?.activities ?? [];

    return [...events, ...restaurants, ...activities].map((item: any) => ({
      id: String(item.id), // Ensure ID is a string
      name: item.name,
      type: item.type,
      api_source: item.source || 'api',
      description: item.description || '',
      location: item.location || '',
      price: String(item.price ?? '0'), // Ensure price is a string
      image_url: item.image ?? item.image_url ?? undefined,
      datetime: item.datetime ?? undefined,
      // ✅ Explicitly set these here
      latitude: Number(item.latitude || item.coordinates?.latitude || 35.2271),
      longitude: Number(item.longitude || item.coordinates?.longitude || -80.8431),
    }));
  }, [recommendations]);

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
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onReset}
            className="rounded-lg border border-white/30 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.25em] hover:border-[#d6c08e]/65 transition-colors"
          >
            Start Over
          </button>
        </div>
      </header>

      <div className="grid min-h-0 gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="luxury-panel luxury-scroll min-h-0 overflow-auto p-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <p className="luxury-label text-[#79bfa0]">Available Picks</p>
            <span className="rounded-full bg-white/5 px-3 py-2 text-[11px] text-white/70">{availableItems.length} options</span>
          </div>
          <div className="grid gap-4">
            {availableItems.map((item) => (
              <RecommendationCard
                key={item.id}
                item={item}
                onAdd={() => addSelectedPlace(item)}
                isAdded={selectedPlaces.some((selected) => selected.id === item.id)}
              />
            ))}
          </div>
        </div>

        <div className="luxury-panel flex flex-col min-h-0 overflow-hidden bg-[#020202]/95 border-white/10">
          <div className="p-4 border-b border-white/10 flex items-start justify-between">
            <p className="luxury-label text-[#79bfa0]">My Itinerary</p>
            <span className="rounded-full bg-white/5 px-3 py-2 text-[11px] text-white/70">{selectedPlaces.length} stops</span>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-3 luxury-scroll">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={selectedPlaces.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                {selectedPlaces.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-black/25 p-6 text-sm text-white/60">
                    Add items to start building.
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
              </SortableContext>
            </DndContext>
          </div>

          <div className="p-4 bg-black/40 border-t border-white/10 flex flex-col gap-3">
            {saveMessage && (
              <p className="text-[10px] text-center text-[#79bfa0] animate-pulse font-mono tracking-wider">
                {saveMessage}
              </p>
            )}
            <button
              onClick={handleSaveItinerary}
              disabled={isSaving}
              className="w-full rounded-xl border border-[#79bfa0] bg-[#79bfa0]/10 py-4 font-mono text-xs uppercase tracking-[0.3em] text-[#79bfa0] transition-all hover:bg-[#79bfa0] hover:text-black shadow-[0_0_20px_rgba(121,191,160,0.1)] active:scale-[0.98]"
            >
              {isSaving ? 'Locking In...' : 'Save & View Itinerary'}
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
};