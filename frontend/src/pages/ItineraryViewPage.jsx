import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, parseISO, eachDayOfInterval } from 'date-fns';

export default function ItineraryViewPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    api.get(`/trips/${id}/`)
      .then(res => setTrip(res.data))
      .catch(() => toast.error('Failed to load trip'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleShareClick = () => {
    const url = `${window.location.origin}/public/trip/${id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied!');
  };

  const handleTogglePublic = async () => {
    try {
      const res = await api.put(`/trips/${id}/`, { ...trip, is_public: !trip.is_public });
      setTrip(res.data);
      toast.success(`Trip is now ${res.data.is_public ? 'public' : 'private'}`);
    } catch {
      toast.error('Failed to update trip');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!trip) return <div className="text-center py-12 text-textSecondary">Trip not found.</div>;

  const statusColors = { ongoing: 'bg-success text-white', upcoming: 'bg-blue-500 text-white', completed: 'bg-gray-500 text-white' };
  const totalCost = trip.stops?.reduce((sum, stop) => {
    return sum + (stop.stop_activities?.reduce((a, sa) => a + parseFloat(sa.activity_details?.cost || 0), 0) || 0);
  }, 0) || 0;

  return (
    <div>
      <PageHeader
        title={trip.name}
        action={
          <div className="flex flex-wrap gap-2">
            <Link to={`/trips/${id}/budget`} className="px-4 py-2 border border-accent text-accent text-sm font-medium rounded-lg hover:bg-amber-50">Budget</Link>
            <Link to={`/trips/${id}/builder`} className="px-4 py-2 border border-primary text-primary text-sm font-medium rounded-lg hover:bg-teal-50">Edit Trip</Link>
          </div>
        }
      />

      {/* Trip Summary Card */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[trip.status]}`}>{trip.status}</span>
              {trip.is_public && <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-700">Public</span>}
            </div>
            <p className="text-textSecondary text-sm">{format(parseISO(trip.start_date), 'MMM d, yyyy')} — {format(parseISO(trip.end_date), 'MMM d, yyyy')}</p>
            {trip.description && <p className="text-textSecondary text-sm mt-2">{trip.description}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleTogglePublic} className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${trip.is_public ? 'border-red-300 text-error hover:bg-red-50' : 'border-green-300 text-success hover:bg-green-50'}`}>
              {trip.is_public ? 'Make Private' : 'Make Public'}
            </button>
            <button onClick={handleShareClick} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
              Share
            </button>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex space-x-2 mb-6">
        <button onClick={() => setViewMode('list')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white border border-border text-textSecondary hover:text-textPrimary'}`}>List View</button>
        <button onClick={() => setViewMode('calendar')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${viewMode === 'calendar' ? 'bg-primary text-white' : 'bg-white border border-border text-textSecondary hover:text-textPrimary'}`}>Calendar View</button>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-8">
          {trip.stops?.map((stop, idx) => {
            const days = eachDayOfInterval({ start: parseISO(stop.arrival_date), end: parseISO(stop.departure_date) });
            return (
              <div key={stop.id} className="bg-card rounded-xl shadow-sm border border-l-4 border-l-primary overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-teal-50 to-white border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">{idx + 1}</span>
                      <div>
                        <h3 className="text-xl font-bold text-textPrimary">{stop.city_details?.name}</h3>
                        <p className="text-sm text-textSecondary">{stop.city_details?.country} • {format(parseISO(stop.arrival_date), 'MMM d')} – {format(parseISO(stop.departure_date), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium bg-teal-100 text-primary px-3 py-1 rounded-full">{days.length} day{days.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  {days.map((day, di) => (
                    <div key={di}>
                      <div className="text-xs font-semibold uppercase tracking-wider text-textSecondary bg-gray-100 rounded px-3 py-1 mb-2 inline-block">
                        Day {di + 1} — {format(day, 'MMMM d, yyyy')}
                      </div>
                      {stop.stop_activities?.length > 0 ? (
                        <div className="space-y-2 ml-2">
                          {stop.stop_activities.map(sa => (
                            <div key={sa.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                              <div className="flex items-center space-x-3">
                                <span className={`w-2 h-2 rounded-full ${sa.activity_details?.type === 'food' ? 'bg-amber-400' : sa.activity_details?.type === 'adventure' ? 'bg-red-400' : 'bg-blue-400'}`}></span>
                                <div>
                                  <p className="text-sm font-semibold text-textPrimary">{sa.activity_details?.name}</p>
                                  <p className="text-xs text-textSecondary capitalize">{sa.activity_details?.type} • {sa.activity_details?.duration_hours}h</p>
                                </div>
                              </div>
                              <span className="text-sm font-bold text-textPrimary">${sa.activity_details?.cost}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-textSecondary italic ml-2">No activities planned for this day.</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {idx => idx !== undefined && idx < (trip.stops?.length || 0) - 1 && (
            <div className="flex items-center justify-center py-2 text-textSecondary text-sm">→ Travel to next city</div>
          )}

          {/* Total Cost Summary */}
          <div className="bg-primary rounded-xl p-6 text-white">
            <h3 className="text-lg font-bold mb-1">Total Activity Cost</h3>
            <p className="text-3xl font-bold">${totalCost.toFixed(2)}</p>
            <p className="text-teal-200 text-sm mt-1">Across {trip.stops?.length || 0} stop{(trip.stops?.length || 0) !== 1 ? 's' : ''}</p>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-sm border border-border p-6 overflow-x-auto">
          <p className="text-textSecondary text-center py-8">Calendar view shows day-by-day breakdown across your trip dates.</p>
          <div className="grid grid-cols-7 gap-2 min-w-[700px]">
            {trip.stops?.flatMap(stop =>
              eachDayOfInterval({ start: parseISO(stop.arrival_date), end: parseISO(stop.departure_date) }).map(day => (
                <div key={day.toISOString()} className="border border-border rounded-lg p-2 min-h-[80px]">
                  <p className="text-xs font-bold text-textSecondary">{format(day, 'MMM d')}</p>
                  <p className="text-xs text-primary truncate">{stop.city_details?.name}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
