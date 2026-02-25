import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MapView from './pages/MapView';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-obsidian selection:bg-uncc-green/30">
        <Navbar />
        <Routes>
          {/* We point the root path directly to Home.tsx now */}
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </div>
    </Router>
  );
};

// This export default is what fixed that 'no default export' error
export default App;