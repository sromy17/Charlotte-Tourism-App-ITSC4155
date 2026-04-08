import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Interest, ProfileUser } from '../types';

const defaultUser: ProfileUser = {
  name: 'Your Name',
  email: 'you@example.com',
  profilePicture: null,
  preferences: {
    interests: [],
    indoorOutdoor: 'no-preference',
    budgetAmount: 500,
    radiusMiles: 3,
    weatherTolerance: { avoidRain: false, avoidExtremeHeat: false },
  },
  savedEvents: [],
  savedRestaurants: [],
};

const ALL_INTERESTS: Interest[] = [
  'Sports',
  'Food',
  'Breweries',
  'Nightlife',
  'Concerts',
  'Museums',
  'Parks',
  'Hotels',
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatPreferenceLabel = (value: ProfileUser['preferences']['indoorOutdoor']) => {
  if (value === 'no-preference') return 'No preference';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const getInitials = (value: string) => {
  const initials = value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return initials || 'CL';
};

const Profile: React.FC = () => {
  const [user, setUser] = useState<ProfileUser>(defaultUser);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [prefs, setPrefs] = useState(defaultUser.preferences);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as ProfileUser;
        const merged: ProfileUser = { ...defaultUser, ...parsed };
        merged.preferences = { ...defaultUser.preferences, ...(parsed.preferences || {}) };
        setUser(merged);
        setName(merged.name);
        setEmail(merged.email);
        setPicturePreview(merged.profilePicture || null);
        setPrefs(merged.preferences);
      } catch {
        setUser(defaultUser);
        setName(defaultUser.name);
        setEmail(defaultUser.email);
        setPicturePreview(defaultUser.profilePicture || null);
        setPrefs(defaultUser.preferences);
      }
    } else {
      setUser(defaultUser);
      setName(defaultUser.name);
      setEmail(defaultUser.email);
      setPicturePreview(defaultUser.profilePicture || null);
      setPrefs(defaultUser.preferences);
    }
  }, []);

  const cancelEdit = () => {
    setEditing(false);
    setName(user.name);
    setEmail(user.email);
    setPicturePreview(user.profilePicture || null);
    setPrefs(user.preferences);
  };

  const handleFile = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPicturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const toggleInterest = (interest: Interest) => {
    const next = prefs.interests.includes(interest)
      ? prefs.interests.filter((item) => item !== interest)
      : [...prefs.interests, interest];

    setPrefs({ ...prefs, interests: next });
  };

  const setIndoorOutdoor = (value: ProfileUser['preferences']['indoorOutdoor']) => {
    setPrefs({ ...prefs, indoorOutdoor: value });
  };

  const setBudgetAmount = (amount: number) => {
    setPrefs({ ...prefs, budgetAmount: amount });
  };

  const setRadius = (miles: number) => {
    setPrefs({ ...prefs, radiusMiles: miles });
  };

  const handleBudgetChange = (rawValue: number) => {
    const rounded = rawValue <= 1000 ? Math.round(rawValue / 50) * 50 : Math.round(rawValue / 1000) * 1000;
    setBudgetAmount(Math.max(0, Math.min(50000, rounded)));
  };

  const adjustBudget = (deltaSign: 1 | -1) => {
    const current = prefs.budgetAmount || 0;
    const step = current < 1000 ? 50 : 1000;
    let next = current + deltaSign * step;

    if (deltaSign < 0 && current > 1000 && next < 1000) {
      next = Math.max(0, Math.round(next / 50) * 50);
    }

    setBudgetAmount(Math.max(0, Math.min(50000, next)));
  };

  const adjustRadius = (deltaSign: 1 | -1) => {
    const current = prefs.radiusMiles || 1;
    setRadius(Math.max(1, Math.min(50, current + deltaSign)));
  };

  const toggleWeather = (key: keyof ProfileUser['preferences']['weatherTolerance']) => {
    setPrefs({
      ...prefs,
      weatherTolerance: {
        ...prefs.weatherTolerance,
        [key]: !prefs.weatherTolerance[key],
      },
    });
  };

  const saveAll = () => {
    const updated: ProfileUser = {
      ...user,
      name: name.trim() || 'Unnamed',
      email: email.trim() || 'no-reply@example.com',
      profilePicture: picturePreview,
      preferences: prefs,
    };

    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
    setEditing(false);
  };

  const removeSavedEvent = (id: string) => {
    const next = user.savedEvents.filter((item) => item.id !== id);
    const updated = { ...user, savedEvents: next };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  const removeSavedRestaurant = (id: string) => {
    const next = user.savedRestaurants.filter((item) => item.id !== id);
    const updated = { ...user, savedRestaurants: next };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  const displayName = (editing ? name : user.name).trim() || 'Your Name';
  const displayEmail = (editing ? email : user.email).trim() || 'you@example.com';
  const displayPicture = picturePreview || user.profilePicture;
  const displayPrefs = editing ? prefs : user.preferences;
  const totalSaved = user.savedEvents.length + user.savedRestaurants.length;

  const summaryItems = [
    {
      label: 'Interests',
      value: displayPrefs.interests.length ? displayPrefs.interests.join(', ') : 'Not selected yet',
    },
    {
      label: 'Style',
      value: formatPreferenceLabel(displayPrefs.indoorOutdoor),
    },
    {
      label: 'Budget range',
      value: formatCurrency(displayPrefs.budgetAmount),
    },
    {
      label: 'Travel radius',
      value: `${displayPrefs.radiusMiles} miles`,
    },
    {
      label: 'Avoid rain',
      value: displayPrefs.weatherTolerance.avoidRain ? 'Enabled' : 'Flexible',
    },
    {
      label: 'Avoid heat',
      value: displayPrefs.weatherTolerance.avoidExtremeHeat ? 'Enabled' : 'Flexible',
    },
  ];

  const profileStats = [
    { label: 'Selected interests', value: `${displayPrefs.interests.length}` },
    { label: 'Saved places', value: `${totalSaved}` },
    { label: 'Preferred radius', value: `${displayPrefs.radiusMiles} mi` },
  ];

  return (
    <div className="min-h-[calc(100vh-7rem)] bg-[#020202] px-6 pb-20 text-[#F6F3EB]">
      <div className="mx-auto max-w-6xl">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="luxury-panel relative overflow-hidden p-7 sm:p-8"
        >
          <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-[#79bfa0]/10 blur-3xl" />
          <div className="absolute -bottom-10 left-16 h-32 w-32 rounded-full bg-[#d6c08e]/10 blur-3xl" />

          <div className="relative">
            <p className="luxury-label text-[#79bfa0]">Account Studio</p>
            <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[#d6c08e]/35 bg-white/[0.05] text-2xl font-semibold text-[#F6F3EB] shadow-[0_0_35px_rgba(121,191,160,0.08)]">
                  {displayPicture ? (
                    <img src={displayPicture} alt="Profile avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span>{getInitials(displayName)}</span>
                  )}
                </div>

                <div>
                  <h1 className="text-4xl italic sm:text-5xl">{displayName}</h1>
                  <p className="mt-2 text-sm text-white/70">{displayEmail}</p>
                  <p className="mt-3 max-w-2xl text-sm text-white/60">
                    Keep your Charlotte recommendations aligned with your mood, budget, and comfort preferences.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="rounded-full border border-[#79bfa0] bg-[#004D2C]/40 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[#F6F3EB] transition hover:bg-[#004D2C]/65"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <span className="rounded-full border border-[#d6c08e]/35 bg-[#d6c08e]/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#F6F3EB]">
                    Editing Mode
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {profileStats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">{item.label}</p>
                  <p className="mt-2 text-2xl italic text-[#F6F3EB]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.header>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr,0.8fr]">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.35 }}
            className="luxury-panel p-5 sm:p-6"
          >
            <p className="luxury-label text-[#79bfa0]">Preferences</p>
            <h2 className="mt-3 text-3xl italic">{editing ? 'Refine your profile' : 'Your travel settings at a glance'}</h2>

            {!editing ? (
              <>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {summaryItems.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">{item.label}</p>
                      <p className="mt-2 text-sm text-white/80">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-[#d6c08e]/20 bg-[#d6c08e]/5 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#d6c08e]">Profile tip</p>
                  <p className="mt-2 text-sm text-white/75">
                    Update your interests and comfort settings before generating a new itinerary for more polished suggestions.
                  </p>
                </div>
              </>
            ) : (
              <form
                className="mt-5 space-y-6"
                onSubmit={(event) => {
                  event.preventDefault();
                  saveAll();
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">Display name</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-white/15 bg-black/35 px-4 py-3 text-sm text-[#F6F3EB] outline-none transition focus:border-[#79bfa0]/80"
                    />
                  </label>

                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">Email</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-white/15 bg-black/35 px-4 py-3 text-sm text-[#F6F3EB] outline-none transition focus:border-[#79bfa0]/80"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">Profile picture</span>
                  <input
                    className="mt-3 block w-full rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-3 text-sm text-white/75 file:mr-4 file:rounded-full file:border-0 file:bg-[#004D2C]/55 file:px-4 file:py-2 file:text-[11px] file:uppercase file:tracking-[0.18em] file:text-[#F6F3EB]"
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                  />
                </label>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">Activity interests</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ALL_INTERESTS.map((interest) => {
                      const active = prefs.interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleInterest(interest)}
                          className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition ${
                            active
                              ? 'border-[#79bfa0]/70 bg-[#004D2C]/45 text-[#F6F3EB]'
                              : 'border-white/15 bg-white/[0.03] text-white/70 hover:border-[#d6c08e]/35'
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">Indoor or outdoor</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      { label: 'Indoor', value: 'indoor' },
                      { label: 'Outdoor', value: 'outdoor' },
                      { label: 'No preference', value: 'no-preference' },
                    ].map((option) => {
                      const active = prefs.indoorOutdoor === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setIndoorOutdoor(option.value as ProfileUser['preferences']['indoorOutdoor'])}
                          className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition ${
                            active
                              ? 'border-[#d6c08e]/60 bg-[#d6c08e]/10 text-[#F6F3EB]'
                              : 'border-white/15 bg-white/[0.03] text-white/70 hover:border-[#79bfa0]/40'
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">Budget</p>
                      <p className="mt-2 text-2xl italic">{formatCurrency(prefs.budgetAmount)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => adjustBudget(-1)}
                        aria-label="Decrease budget"
                        className="rounded-full border border-white/15 px-3 py-1 text-lg text-white/80 hover:border-[#79bfa0]/45"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustBudget(1)}
                        aria-label="Increase budget"
                        className="rounded-full border border-white/15 px-3 py-1 text-lg text-white/80 hover:border-[#79bfa0]/45"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50000}
                    value={prefs.budgetAmount}
                    onChange={(e) => handleBudgetChange(Number(e.target.value))}
                    className="mt-4 w-full accent-[#79bfa0]"
                  />
                  <p className="mt-2 text-xs text-white/55">Uses $50 steps up to $1,000, then $1,000 steps after that.</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">Travel radius</p>
                      <p className="mt-2 text-2xl italic">{prefs.radiusMiles} mi</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => adjustRadius(-1)}
                        aria-label="Decrease radius"
                        className="rounded-full border border-white/15 px-3 py-1 text-lg text-white/80 hover:border-[#79bfa0]/45"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustRadius(1)}
                        aria-label="Increase radius"
                        className="rounded-full border border-white/15 px-3 py-1 text-lg text-white/80 hover:border-[#79bfa0]/45"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={prefs.radiusMiles}
                    onChange={(e) => setRadius(parseInt(e.target.value, 10))}
                    className="mt-4 w-full accent-[#79bfa0]"
                  />
                </div>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">Weather tolerance</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {[
                      { label: 'Avoid Rain', key: 'avoidRain' },
                      { label: 'Avoid Extreme Heat', key: 'avoidExtremeHeat' },
                    ].map((item) => {
                      const active = prefs.weatherTolerance[item.key as keyof ProfileUser['preferences']['weatherTolerance']];
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => toggleWeather(item.key as keyof ProfileUser['preferences']['weatherTolerance'])}
                          className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                            active
                              ? 'border-[#79bfa0]/65 bg-[#004D2C]/35 text-[#F6F3EB]'
                              : 'border-white/10 bg-black/20 text-white/75 hover:border-[#d6c08e]/30'
                          }`}
                        >
                          <span>{item.label}</span>
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em]">{active ? 'On' : 'Off'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    className="rounded-full border border-[#79bfa0] bg-[#004D2C]/45 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[#F6F3EB] hover:bg-[#004D2C]/65"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-full border border-white/20 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-white/80 hover:border-[#d6c08e]/45"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </motion.section>

          <div className="grid gap-5">
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.35 }}
              className="luxury-panel p-5"
            >
              <p className="luxury-label text-[#79bfa0]">Saved Events</p>
              <h3 className="mt-3 text-2xl italic">Your lineup</h3>

              {user.savedEvents.length === 0 ? (
                <p className="mt-3 text-sm text-white/60">No saved events yet. When you bookmark experiences, they’ll show up here.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {user.savedEvents.map((event) => (
                    <li key={event.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 p-4">
                      <span className="text-sm text-white/85">{event.name}</span>
                      <button
                        onClick={() => removeSavedEvent(event.id)}
                        className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#d6c08e] hover:text-white"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.35 }}
              className="luxury-panel p-5"
            >
              <p className="luxury-label text-[#79bfa0]">Saved Restaurants</p>
              <h3 className="mt-3 text-2xl italic">Dining picks</h3>

              {user.savedRestaurants.length === 0 ? (
                <p className="mt-3 text-sm text-white/60">No saved restaurants yet. Your food favorites will appear here.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {user.savedRestaurants.map((restaurant) => (
                    <li key={restaurant.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 p-4">
                      <span className="text-sm text-white/85">{restaurant.name}</span>
                      <button
                        onClick={() => removeSavedRestaurant(restaurant.id)}
                        className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#d6c08e] hover:text-white"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
