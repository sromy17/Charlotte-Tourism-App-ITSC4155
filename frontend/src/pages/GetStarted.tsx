import React from 'react';
import { useNavigate } from 'react-router-dom';

const GetStarted: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#00703C]/10 via-[#B3A369]/10 to-[#fff] text-gray-900">
      <div className="bg-white/90 rounded-3xl shadow-2xl px-10 py-16 flex flex-col items-center max-w-xl w-full border border-[#e0e0e0]">
        <span className="text-[5rem] font-black tracking-tight text-center block leading-none select-none mb-2" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.04em' }}>
          <span className="text-[#00703C]">CLT</span><span className="text-[#B3A369]">ourism</span>
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-[#222] text-center">Welcome to Charlotte's Premier Tourism App</h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-md">Plan, reserve, and explore the Queen City with real-time recommendations and seamless reservations. Your Charlotte adventure starts here.</p>
        <button
          className="bg-[#00703C] hover:bg-[#005c2c] text-white font-bold py-3 px-10 rounded-full text-lg shadow-lg transition-colors"
          onClick={() => navigate('/')}
        >
          Get Started
        </button>
      </div>
      <footer className="text-center text-xs text-gray-400 py-8 mt-8">&copy; {new Date().getFullYear()} CLTourism. All rights reserved.</footer>
    </div>
  );
};

export default GetStarted;
