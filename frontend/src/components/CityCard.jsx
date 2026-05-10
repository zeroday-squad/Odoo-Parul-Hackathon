import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function CityCard({ city }) {
  const navigate = useNavigate();

  return (
    <div 
      className="bg-card min-w-[200px] w-64 rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-all cursor-pointer group"
      onClick={() => navigate(`/search/activities?city=${city.id}`)}
    >
      <div className="h-32 w-full bg-gradient-to-br from-primary to-teal-800 relative">
        {city.cover_image ? (
          <img src={city.cover_image} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold opacity-50">
            {city.name.charAt(0)}
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 text-xs font-bold rounded bg-accent text-white shadow-sm">
            Top {city.popularity}%
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-textPrimary truncate">{city.name}</h3>
        <p className="text-sm text-textSecondary truncate">{city.country}</p>
        <div className="mt-2 flex items-center space-x-1">
          {[1, 2, 3].map((val) => (
            <span key={val} className={`text-sm ${val <= city.cost_index ? 'text-textPrimary font-bold' : 'text-gray-300'}`}>$</span>
          ))}
        </div>
      </div>
    </div>
  );
}
