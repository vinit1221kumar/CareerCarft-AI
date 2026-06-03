import React from 'react';

export default function Stat({ label, value, className = '' }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-2xl font-bold mt-1">{value}</span>
    </div>
  );
}
