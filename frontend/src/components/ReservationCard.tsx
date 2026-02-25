import React, { useState } from 'react';

const partySizes = [1, 2, 3, 4, 5, 6, 7, 8];
const times = [
  '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
  '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM',
];

export default function ReservationCard() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState(times[0]);
  const [partySize, setPartySize] = useState(partySizes[0]);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Find a Table</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <select
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            value={time}
            onChange={e => setTime(e.target.value)}
          >
            {times.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Party Size</label>
          <select
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            value={partySize}
            onChange={e => setPartySize(Number(e.target.value))}
          >
            {partySizes.map(size => (
              <option key={size} value={size}>{size} {size === 1 ? 'person' : 'people'}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors text-lg mt-2 shadow-md"
        >
          Find a Table
        </button>
      </form>
    </div>
  );
}
