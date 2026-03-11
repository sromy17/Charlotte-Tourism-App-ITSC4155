import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MapView from './pages/MapView';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Itinerary from './pages/Itinerary';
import Safari from './pages/Safari';
import { ExperienceShell } from './experience/ExperienceShell';
import Landing from './pages/Landing';
import { Preloader } from './components/Preloader';

const App: React.FC = () => {
  const [preloaderDone, setPreloaderDone] = useState(false);

  return (
    <>
      {/* Full app renders in background so Mapbox / assets initialise early */}
      <Router>
        <div className="min-h-screen bg-[#080808] selection:bg-uncc-green/30 text-white">
          <Navbar />
          <main>
            <Routes>
              <Route path="/"               element={<Landing />} />
              <Route path="/plan"           element={<ExperienceShell />} />
              <Route path="/home"           element={<Home />} />
              <Route path="/login"          element={<Login />} />
              <Route path="/register"       element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/map"            element={<MapView />} />
              <Route path="/itinerary"      element={<Itinerary />} />
              <Route path="/profile"        element={<Profile />} />
              <Route path="/safari"         element={<Safari />} />
            </Routes>
          </main>
        </div>
      </Router>

      {/* Preloader sits on top as a fixed overlay; unmounts after its exit fade */}
      <AnimatePresence>
        {!preloaderDone && (
          <Preloader
            key="preloader"
            onComplete={() => setPreloaderDone(true)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default App;