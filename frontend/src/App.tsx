import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MapView from './pages/MapView';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Itinerary from './pages/Itinerary'; 
import Safari from './pages/Safari'; // 1. ADD THIS IMPORT

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-[#080808] selection:bg-uncc-green/30 text-white">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/itinerary" element={<Itinerary />} />
            
            {/* 2. ADD THIS ROUTE */}
            <Route path="/safari" element={<Safari />} /> 
            
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;