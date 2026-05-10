import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import CityCard from '../components/CityCard';
import TripCard from '../components/TripCard';

export default function DashboardPage() {
  const [trips, setTrips] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRegion, setActiveRegion] = useState('All');
  const [citySearch, setCitySearch] = useState('');
  const [deleteModal, setDeleteModal] = useState(null); // trip object to delete

  const regions = ['All', 'India', 'Asia', 'Europe', 'Americas', 'Middle East'];
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripsRes, citiesRes] = await Promise.all([
          api.get('/trips/'),
          api.get('/cities/?ordering=-popularity')
        ]);
        setTrips(tripsRes.data);
        setAllCities(citiesRes.data);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteTrip = async () => {
    if (!deleteModal) return;
    try {
      await api.delete(`/trips/${deleteModal.id}/`);
      setTrips(trips.filter(t => t.id !== deleteModal.id));
      toast.success('Trip deleted');
    } catch {
      toast.error('Failed to delete trip');
    } finally {
      setDeleteModal(null);
    }
  };

  // Filter cities by region first, then by search text
  const filteredCities = allCities.filter(c => {
    const matchesRegion = activeRegion === 'All' || c.region === activeRegion;
    const matchesSearch = !citySearch || c.name.toLowerCase().includes(citySearch.toLowerCase()) || c.country.toLowerCase().includes(citySearch.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="w-full rounded-2xl bg-gradient-to-r from-teal-700 to-primary p-8 md:p-12 shadow-md flex flex-col md:flex-row items-center justify-between">
        <div className="text-white mb-6 md:mb-0">
          <h1 className="text-3xl font-bold mb-2">Hello, {user.first_name || 'Traveler'}! 👋</h1>
          <p className="text-lg opacity-90">Where are you going next?</p>
        </div>
        <Link to="/trips/new" className="px-6 py-3 bg-accent hover:bg-amber-500 text-gray-900 font-bold rounded-full shadow-lg transition-transform hover:scale-105 inline-block">
          Plan New Trip
        </Link>
      </div>

      {/* Explore Destinations */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
          <h2 className="text-xl font-bold text-textPrimary">Explore Destinations</h2>
          <div className="flex flex-wrap items-center gap-2">
            {/* Region tabs */}
            {regions.map(region => (
              <button
                key={region}
                onClick={() => { setActiveRegion(region); setCitySearch(''); }}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeRegion === region
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {region}
              </button>
            ))}
            {/* Live search input */}
            <div className="relative ml-2">
              <svg className="w-4 h-4 absolute left-3 top-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search cities..."
                value={citySearch}
                onChange={e => { setCitySearch(e.target.value); setActiveRegion('All'); }}
                className="pl-9 pr-3 py-1.5 text-sm border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary w-40"
              />
            </div>
          </div>
        </div>

        {/* City cards horizontal scroll */}
        <div className="flex overflow-x-auto space-x-4 pb-4 snap-x">
          {filteredCities.length === 0 ? (
            <p className="text-textSecondary py-8 text-sm">No cities found.</p>
          ) : filteredCities.map(city => (
            <div key={city.id} className="snap-start flex-shrink-0">
              <CityCard city={city} />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Trips */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-textPrimary">My Recent Trips</h2>
          <Link to="/trips" className="text-primary text-sm font-medium hover:underline">View All</Link>
        </div>

        {trips.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-textPrimary mb-1">No trips yet</h3>
            <p className="text-textSecondary mb-4">Start planning your first adventure!</p>
            <Link to="/trips/new" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors">
              Create Trip
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trips.slice(0, 4).map(trip => (
              <TripCard key={trip.id} trip={trip} onDelete={(id) => setDeleteModal(trips.find(t => t.id === id))} />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-textPrimary mb-1">Delete Trip?</h3>
            <p className="text-sm text-textSecondary mb-5">
              "<span className="font-semibold">{deleteModal.name}</span>" and all its stops will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 border border-border rounded-lg text-textSecondary text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleDeleteTrip} className="flex-1 py-2.5 bg-error text-white rounded-lg text-sm font-semibold hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
