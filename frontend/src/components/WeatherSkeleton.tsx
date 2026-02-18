import React from 'react';

const WeatherSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 transition-all animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-10 w-32 bg-gray-200 rounded mb-4" />
          <div className="h-6 w-40 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </div>
        <div>
          <div className="w-24 h-24 bg-gray-200 rounded-full" />
        </div>
      </div>
      <div className="mt-6 h-6 w-3/4 bg-gray-200 rounded" />
    </div>
  );
};

export default WeatherSkeleton;
