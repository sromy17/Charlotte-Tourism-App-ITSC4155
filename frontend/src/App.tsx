import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-[#080808] selection:bg-uncc-green/30 text-white">
        <Navbar />
        <main className="pt-24 md:pt-28">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/plan" element={<ExperienceShell />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/itinerary" element={<Itinerary />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/safari" element={<Safari />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;