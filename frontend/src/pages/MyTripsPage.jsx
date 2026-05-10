import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import TripCard from '../components/TripCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MyTripsPage() {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOption, setSortOption] = useState('Newest First');
  const [expanded, setExpanded] = useState({ ongoing: true, upcoming: true, completed: true });
  const [deleteModal, setDeleteModal] = useState(null); // trip object

  useEffect(() => { fetchTrips(); }, []);

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/trips/');
      setTrips(res.data);
    } catch {
      toast.error('Failed to load trips');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!deleteModal) return;
    try {
      await api.delete(`/trips/${deleteModal.id}/`);
      setTrips(prev => prev.filter(t => t.id !== deleteModal.id));
      toast.success('Trip deleted');
    } catch {
      toast.error('Failed to delete trip');
    } finally {
      setDeleteModal(null);
    }
  };

  const toggleSection = (section) => setExpanded({ ...expanded, [section]: !expanded[section] });

  const filteredAndSortedTrips = trips.filter(trip => {
    const matchesSearch = trip.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || trip.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortOption === 'Newest First') return new Date(b.created_at) - new Date(a.created_at);
    if (sortOption === 'Oldest First') return new Date(a.created_at) - new Date(b.created_at);
    if (sortOption === 'Name A-Z') return a.name.localeCompare(b.name);
    return 0;
  });

  const getTripsByStatus = (status) => filteredAndSortedTrips.filter(t => t.status === status);
  const ongoingTrips = getTripsByStatus('ongoing');
  const upcomingTrips = getTripsByStatus('upcoming');
  const completedTrips = getTripsByStatus('completed');

  if (isLoading) return <LoadingSpinner />;

  const TripSection = ({ title, data, statusKey, colorClass }) => (
    <div className="mb-8 bg-white rounded-xl shadow-sm border border-border overflow-hidden">
      <button
        onClick={() => toggleSection(statusKey)}
        className={`w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors border-l-4 ${colorClass}`}
      >
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-bold text-textPrimary">{title}</h3>
          <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-full">{data.length}</span>
        </div>
        <svg className={`w-5 h-5 text-gray-500 transform transition-transform ${expanded[statusKey] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded[statusKey] && (
        <div className="p-4">
          {data.length === 0 ? (
            <p className="text-sm text-textSecondary py-4 text-center">No {title.toLowerCase()} trips found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.map(trip => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onDelete={(id) => setDeleteModal(trips.find(t => t.id === id))}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      <PageHeader
        title="My Trips"
        action={
          <Link to="/trips/new" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover shadow-sm flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            New Trip
          </Link>
        }
      />

      {/* Filter Bar */}
      <div className="bg-card p-4 rounded-xl shadow-sm border border-border mb-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="Search trips..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white">
          <option value="All">All Statuses</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Completed">Completed</option>
        </select>
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white">
          <option>Newest First</option>
          <option>Oldest First</option>
          <option>Name A-Z</option>
        </select>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-textSecondary mb-4">You haven't created any trips yet.</p>
          <Link to="/trips/new" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg">Plan your first trip</Link>
        </div>
      ) : (
        <>
          <TripSection title="Ongoing" data={ongoingTrips} statusKey="ongoing" colorClass="border-accent" />
          <TripSection title="Upcoming" data={upcomingTrips} statusKey="upcoming" colorClass="border-primary" />
          <TripSection title="Completed" data={completedTrips} statusKey="completed" colorClass="border-gray-400" />
        </>
      )}

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
              <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 border border-border rounded-lg text-textSecondary text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleDeleteTrip} className="flex-1 py-2.5 bg-error text-white rounded-lg text-sm font-semibold hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
