import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, parseISO, eachDayOfInterval } from 'date-fns';

export default function PublicTripPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/trips/${id}/public/`)
      .then(res => setTrip(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied!');
  };

  const shareUrl = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(`Check out this trip: ${trip?.name || 'on Traveloop'}`);

  if (isLoading) return <LoadingSpinner />;
  if (notFound || !trip) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-6xl mb-4">🔒</div>
      <h2 className="text-2xl font-bold text-textPrimary mb-2">Trip Not Available</h2>
      <p className="text-textSecondary mb-6">This trip is private or does not exist.</p>
      <Link to="/login" className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover">Go to Traveloop</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-primary py-16 px-6 text-center text-white">
        <h1 className="text-4xl font-bold mb-3">{trip.name}</h1>
        <p className="text-lg text-teal-200 mb-2">{format(parseISO(trip.start_date), 'MMM d')} – {format(parseISO(trip.end_date), 'MMM d, yyyy')}</p>
        <p className="text-teal-100 text-sm">Shared by {trip.user?.first_name || 'a traveler'}</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Share Card */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-5 flex flex-wrap items-center justify-between gap-4">
          <p className="font-semibold text-textPrimary">Share this trip</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleCopy} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-amber-500">Copy Link</button>
            <a href={`https://wa.me/?text=${shareText}%20${shareUrl}`} target="_blank" rel="noreferrer" className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600">WhatsApp</a>
            <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noreferrer" className="px-4 py-2 bg-sky-400 text-white rounded-lg text-sm font-medium hover:bg-sky-500">Twitter / X</a>
          </div>
        </div>

        {/* Itinerary - read only */}
        {trip.stops?.map((stop, idx) => {
          const days = eachDayOfInterval({ start: parseISO(stop.arrival_date), end: parseISO(stop.departure_date) });
          return (
            <div key={stop.id} className="bg-card rounded-xl shadow-sm border border-l-4 border-l-primary overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-teal-50 to-white border-b border-border">
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">{idx + 1}</span>
                  <div>
                    <h3 className="text-xl font-bold text-textPrimary">{stop.city_details?.name}</h3>
                    <p className="text-sm text-textSecondary">{stop.city_details?.country} • {format(parseISO(stop.arrival_date), 'MMM d')} – {format(parseISO(stop.departure_date), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                {stop.stop_activities?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-textPrimary mb-2 text-sm">Activities</h4>
                    <div className="space-y-2">
                      {stop.stop_activities.map(sa => (
                        <div key={sa.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            <p className="text-sm font-medium text-textPrimary">{sa.activity_details?.name}</p>
                          </div>
                          <span className="text-sm font-bold text-textPrimary">${sa.activity_details?.cost}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* CTA */}
        <div className="bg-primary rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Love this trip? Plan your own!</h2>
          <p className="text-teal-200 mb-6">Join Traveloop — it's free</p>
          <Link to="/register" className="inline-block px-8 py-3 bg-white text-primary font-bold rounded-full hover:bg-teal-50 transition-colors">Sign Up Now</Link>
        </div>
      </div>
    </div>
  );
}
