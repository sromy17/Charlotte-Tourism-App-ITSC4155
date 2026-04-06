import React, { useEffect, useState } from 'react';
import { ProfileUser, Interest } from '../types';

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

// Activity interests used in profile (keeps app consistent)
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
        // merge safely with defaults
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
        setPrefs(defaultUser.preferences);
      }
    } else {
      setUser(defaultUser);
      setName(defaultUser.name);
      setEmail(defaultUser.email);
      setPrefs(defaultUser.preferences);
    }
  }, []);

  const startEdit = () => {
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setName(user.name);
    setEmail(user.email);
    setPicturePreview(user.profilePicture || null);
  };

  const handleFile = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPicturePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const toggleInterest = (interest: Interest) => {
    const next = prefs.interests.includes(interest)
      ? prefs.interests.filter((i) => i !== interest)
      : [...prefs.interests, interest];
    const updated = { ...prefs, interests: next };
    setPrefs(updated);
  };

  const setIndoorOutdoor = (value: ProfileUser['preferences']['indoorOutdoor']) => {
    setPrefs({ ...prefs, indoorOutdoor: value });
  };

  // budgetAmount handled via slider with adaptive stepping
  const setBudgetAmount = (amount: number) => {
    setPrefs({ ...prefs, budgetAmount: amount });
  };

  const setRadius = (miles: number) => {
    setPrefs({ ...prefs, radiusMiles: miles });
  };

  const handleBudgetChange = (rawValue: number) => {
    // Round to nearest 50 up to 1000, then to nearest 1000 thereafter
    const rounded = rawValue <= 1000 ? Math.round(rawValue / 50) * 50 : Math.round(rawValue / 1000) * 1000;
    setBudgetAmount(Math.max(0, Math.min(50000, rounded)));
  };

  const adjustBudget = (deltaSign: 1 | -1) => {
    const current = prefs.budgetAmount || 0;
    const step = current < 1000 ? 50 : 1000;
    let next = current + deltaSign * step;
    // If crossing the 1000 boundary downward, snap appropriately
    if (deltaSign < 0 && current > 1000 && next < 1000) {
      next = Math.max(0, Math.round(next / 50) * 50);
    }
    next = Math.max(0, Math.min(50000, next));
    setBudgetAmount(next);
  };

  const adjustRadius = (deltaSign: 1 | -1) => {
    const current = prefs.radiusMiles || 1;
    const next = Math.max(1, Math.min(50, current + deltaSign));
    setRadius(next);
  };

  const toggleWeather = (key: keyof ProfileUser['preferences']['weatherTolerance']) => {
    setPrefs({ ...prefs, weatherTolerance: { ...prefs.weatherTolerance, [key]: !prefs.weatherTolerance[key] } });
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
    const next = user.savedEvents.filter((s) => s.id !== id);
    const updated = { ...user, savedEvents: next };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  const removeSavedRestaurant = (id: string) => {
    const next = user.savedRestaurants.filter((s) => s.id !== id);
    const updated = { ...user, savedRestaurants: next };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white/5 rounded-lg backdrop-blur-sm">
      <h1 className="text-2xl font-bold mb-6 text-white">Profile</h1>

      <div className="flex gap-8 items-start">
        <div className="w-36 h-36 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
          {picturePreview ? (
            <img src={picturePreview} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="text-gray-700">No Photo</div>
          )}
        </div>

        <div className="flex-1 text-white">
          {!editing ? (
            <>
              <p className="text-lg font-semibold">{user.name}</p>
              <p className="text-sm text-slate-300">{user.email}</p>

              <div className="mt-4">
                <h3 className="text-sm text-slate-300">Preferences</h3>
                <div className="text-xs text-slate-400 mt-1">
                  Interests: {user.preferences.interests.join(', ') || '—'}
                </div>
                <div className="text-xs text-slate-400">Indoor/Outdoor: {user.preferences.indoorOutdoor}</div>
                <div className="text-xs text-slate-400">Budget: {user.preferences.budgetAmount ? new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(user.preferences.budgetAmount) : '—'}</div>
                <div className="text-xs text-slate-400">Radius: {user.preferences.radiusMiles} miles</div>
                <div className="text-xs text-slate-400">Avoid Rain: {user.preferences.weatherTolerance.avoidRain ? 'Yes' : 'No'}</div>
                <div className="text-xs text-slate-400">Avoid Extreme Heat: {user.preferences.weatherTolerance.avoidExtremeHeat ? 'Yes' : 'No'}</div>
              </div>

              <div className="mt-4">
                <button
                  onClick={startEdit}
                  className="px-4 py-2 bg-uncc-green rounded text-white font-semibold"
                >
                  Edit Profile
                </button>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2 text-white">Saved Events</h3>
                {user.savedEvents.length === 0 ? (
                  <div className="text-slate-400">No saved events</div>
                ) : (
                  <ul className="space-y-2">
                    {user.savedEvents.map((e) => (
                      <li key={e.id} className="flex justify-between items-center bg-white/5 p-2 rounded">
                        <span className="text-white">{e.name}</span>
                        <button onClick={() => removeSavedEvent(e.id)} className="text-sm text-red-400">Remove</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2 text-white">Saved Restaurants</h3>
                {user.savedRestaurants.length === 0 ? (
                  <div className="text-slate-400">No saved restaurants</div>
                ) : (
                  <ul className="space-y-2">
                    {user.savedRestaurants.map((r) => (
                      <li key={r.id} className="flex justify-between items-center bg-white/5 p-2 rounded">
                        <span className="text-white">{r.name}</span>
                        <button onClick={() => removeSavedRestaurant(r.id)} className="text-sm text-red-400">Remove</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4 text-white">
              <label className="block">
                <div className="text-sm font-medium mb-1">Name</div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded px-3 py-2 bg-white text-black"
                />
              </label>

              <label className="block">
                <div className="text-sm font-medium mb-1">Email</div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded px-3 py-2 bg-white text-black"
                />
              </label>

              <label className="block">
                <div className="text-sm font-medium mb-1">Profile Picture</div>
                <input className="text-white" type="file" accept="image/*" onChange={handleFile} />
              </label>

              <div className="pt-2">
                <h4 className="font-semibold">Activity interests</h4>
                <div className="flex gap-2 flex-wrap mt-2">
                  {ALL_INTERESTS.map((i) => (
                    <label key={i} className={`px-3 py-1 rounded border ${prefs.interests.includes(i) ? 'bg-uncc-green text-white' : 'bg-white/10 text-white'}`}>
                      <input className="mr-2" type="checkbox" checked={prefs.interests.includes(i)} onChange={() => toggleInterest(i)} />
                      {i}
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <h4 className="font-semibold">Indoor vs Outdoor</h4>
                <div className="flex gap-3 mt-2">
                  <label>
                    <input type="radio" name="indoorOutdoor" checked={prefs.indoorOutdoor === 'indoor'} onChange={() => setIndoorOutdoor('indoor')} /> Indoor
                  </label>
                  <label>
                    <input type="radio" name="indoorOutdoor" checked={prefs.indoorOutdoor === 'outdoor'} onChange={() => setIndoorOutdoor('outdoor')} /> Outdoor
                  </label>
                  <label>
                    <input type="radio" name="indoorOutdoor" checked={prefs.indoorOutdoor === 'no-preference'} onChange={() => setIndoorOutdoor('no-preference')} /> No preference
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <h4 className="font-semibold">Budget</h4>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => adjustBudget(-1)}
                    aria-label="decrease budget"
                    className="px-3 py-1 rounded bg-white/10 text-white"
                  >
                    −
                  </button>

                  <input
                    type="range"
                    min={0}
                    max={50000}
                    value={prefs.budgetAmount}
                    onChange={(e) => handleBudgetChange(Number(e.target.value))}
                    className="flex-1"
                  />

                  <button
                    type="button"
                    onClick={() => adjustBudget(1)}
                    aria-label="increase budget"
                    className="px-3 py-1 rounded bg-white/10 text-white"
                  >
                    +
                  </button>

                  <div className="w-40 text-sm text-white text-right">
                    {new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(prefs.budgetAmount)}
                  </div>
                </div>
                <div className="text-xs text-slate-400 mt-2">Tip: increments are $50 up to $1,000, then $1,000 increments thereafter.</div>
              </div>

              <div className="pt-4">
                <h4 className="font-semibold">Preferred travel radius</h4>
                <div className="mt-2 flex items-center gap-4">
                  <button type="button" onClick={() => adjustRadius(-1)} aria-label="decrease radius" className="px-3 py-1 rounded bg-white/10 text-white">−</button>

                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={prefs.radiusMiles}
                    onChange={(e) => setRadius(parseInt(e.target.value, 10))}
                    className="flex-1"
                  />

                  <button type="button" onClick={() => adjustRadius(1)} aria-label="increase radius" className="px-3 py-1 rounded bg-white/10 text-white">+</button>

                  <div className="w-20 text-sm text-white text-right">{prefs.radiusMiles} mi</div>
                </div>
              </div>

              <div className="pt-4">
                <h4 className="font-semibold">Weather tolerance</h4>
                <div className="flex gap-4 mt-2 items-center">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={prefs.weatherTolerance.avoidRain} onChange={() => toggleWeather('avoidRain')} /> Avoid Rain</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={prefs.weatherTolerance.avoidExtremeHeat} onChange={() => toggleWeather('avoidExtremeHeat')} /> Avoid Extreme Heat</label>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={saveAll} className="px-4 py-2 bg-uncc-green rounded text-white font-semibold">Save</button>
                <button onClick={cancelEdit} className="px-4 py-2 bg-gray-300 rounded font-medium">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
