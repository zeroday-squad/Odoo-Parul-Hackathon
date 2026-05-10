import React from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

export default function TripCard({ trip, onDelete }) {
  const statusColors = {
    ongoing: 'bg-success text-white',
    upcoming: 'bg-blue-500 text-white',
    completed: 'bg-gray-500 text-white'
  };

  const statusLabels = {
    ongoing: 'Ongoing',
    upcoming: 'Upcoming',
    completed: 'Completed'
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="h-40 w-full bg-gradient-to-br from-teal-400 to-primary relative">
        {trip.cover_photo && (
          <img src={trip.cover_photo} alt={trip.name} className="w-full h-full object-cover" />
        )}
        <div className="absolute top-2 right-2 flex space-x-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full shadow-sm ${statusColors[trip.status]}`}>
            {statusLabels[trip.status]}
          </span>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-textPrimary truncate">{trip.name}</h3>
        {trip.description && (
          <p className="text-sm text-textSecondary line-clamp-2 mt-1">{trip.description}</p>
        )}
        <div className="mt-3 flex items-center text-xs text-textSecondary font-medium">
          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          {format(parseISO(trip.start_date), 'MMM d, yyyy')} - {format(parseISO(trip.end_date), 'MMM d, yyyy')}
        </div>
        <div className="mt-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
            {trip.stop_count} Stop{trip.stop_count !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="mt-auto pt-4 flex space-x-2">
          <Link to={`/trips/${trip.id}/view`} className="flex-1 text-center px-3 py-1.5 border border-primary text-primary text-sm font-medium rounded hover:bg-teal-50 transition-colors">
            View
          </Link>
          <Link to={`/trips/${trip.id}/builder`} className="flex-1 text-center px-3 py-1.5 border border-border text-textSecondary text-sm font-medium rounded hover:bg-gray-50 transition-colors">
            Edit
          </Link>
          <button onClick={() => onDelete(trip.id)} className="px-3 py-1.5 border border-red-200 text-error text-sm font-medium rounded hover:bg-red-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
