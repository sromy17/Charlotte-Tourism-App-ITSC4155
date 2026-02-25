import React from 'react';

interface TimelineItemProps {
  time: string;
  activity: string;
  location: string;
  cost: string;
  description: string;
  isLast?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ time, activity, location, cost, description, isLast }) => {
  return (
    <div className="relative pl-10 group">
      {/* The Vertical Line Segment */}
      {!isLast && (
        <div className="absolute left-[7px] top-4 w-[2px] h-full bg-gradient-to-b from-uncc-green/40 to-transparent"></div>
      )}

      {/* The Animated Dot */}
      <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-[#080808] border-2 border-uncc-green group-hover:bg-uncc-green group-hover:shadow-[0_0_15px_#00703C] transition-all duration-300 z-10"></div>

      {/* The Card */}
      <div className="glass p-6 rounded-2xl mb-8 group-hover:bg-white/10 transition-all duration-500 transform group-hover:-translate-y-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-uncc-green font-black text-sm tracking-widest font-inter">{time}</span>
            <span className="text-white/20">|</span>
            <span className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold">{location}</span>
          </div>
          <span className="text-uncc-gold font-bold text-sm tracking-widest">{cost}</span>
        </div>

        <h3 className="text-2xl font-serif text-[#F9F8F3] mb-2">{activity}</h3>
        <p className="text-slate-400 text-sm leading-relaxed font-inter max-w-xl">
          {description}
        </p>

        <div className="mt-4 flex gap-3">
          <button className="text-[10px] font-black uppercase tracking-widest text-uncc-green hover:text-white transition-colors">
            View Details
          </button>
          <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-uncc-gold transition-colors">
            Get Directions
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimelineItem;