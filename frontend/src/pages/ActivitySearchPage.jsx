import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';

const typeColors = {
  sightseeing: 'bg-blue-100 text-blue-700',
  food: 'bg-amber-100 text-amber-700',
  adventure: 'bg-red-100 text-red-700',
  culture: 'bg-purple-100 text-purple-700',
  physical: 'bg-green-100 text-green-700'
};

export default function ActivitySearchPage() {
  const [searchParams] = useSearchParams();
  const [activities, setActivities] = useState([]);
  const [cities, setCities] = useState([]);
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '', city: searchParams.get('city') || '', type: '', maxCost: 500, duration: ''
  });
  const [addModal, setAddModal] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState('');
  const [selectedStop, setSelectedStop] = useState('');
  const [tripsWithStops, setTripsWithStops] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/activities/' + (filters.city ? `?city=${filters.city}` : '')),
      api.get('/cities/'),
      api.get('/trips/')
    ]).then(([a, c, t]) => {
      setActivities(a.data);
      setCities(c.data);
      setTrips(t.data);
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      let url = '/activities/?';
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.city) params.append('city', filters.city);
      if (filters.type) params.append('type', filters.type);
      if (filters.maxCost < 500) params.append('max_cost', filters.maxCost);
      if (filters.duration) params.append('duration', filters.duration);
      const res = await api.get(url + params.toString());
      setActivities(res.data);
    } catch { toast.error('Search failed'); }
    finally { setIsLoading(false); }
  };

  const loadStopsForTrip = async (tripId) => {
    setSelectedTrip(tripId);
    if (!tripId) { setTripsWithStops([]); return; }
    try {
      const res = await api.get(`/trips/${tripId}/stops/`);
      setTripsWithStops(res.data);
    } catch { setTripsWithStops([]); }
  };

  const handleAddToStop = async () => {
    if (!selectedStop) { toast.error('Please select a stop'); return; }
    try {
      await api.post(`/stops/${selectedStop}/activities/`, { activity: addModal.id });
      toast.success('Activity added to stop!');
      setAddModal(null);
    } catch { toast.error('Failed to add activity'); }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Browse Activities" subtitle="Discover things to do around the world" />

      <div className="bg-card rounded-xl shadow-sm border border-border p-5 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <input
          type="text" placeholder="Search activities..." value={filters.search}
          onChange={e => setFilters({...filters, search: e.target.value})}
          className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm col-span-full"
        />
        <select value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})} className="px-4 py-2 border border-border rounded-lg text-sm bg-white">
          <option value="">All Cities</option>
          {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})} className="px-4 py-2 border border-border rounded-lg text-sm bg-white">
          <option value="">All Types</option>
          <option value="sightseeing">Sightseeing</option>
          <option value="food">Food</option>
          <option value="adventure">Adventure</option>
          <option value="culture">Culture</option>
          <option value="physical">Physical</option>
        </select>
        <select value={filters.duration} onChange={e => setFilters({...filters, duration: e.target.value})} className="px-4 py-2 border border-border rounded-lg text-sm bg-white">
          <option value="">Any Duration</option>
          <option value="Under 2h">Under 2h</option>
          <option value="2-4h">2–4h</option>
          <option value="4h+">4h+</option>
        </select>
        <div className="col-span-full">
          <label className="text-xs font-medium text-textSecondary mb-1 block">Max Cost: ${filters.maxCost}</label>
          <input type="range" min="0" max="500" value={filters.maxCost}
            onChange={e => setFilters({...filters, maxCost: parseInt(e.target.value)})}
            className="w-full accent-primary"
          />
        </div>
        <button onClick={handleSearch} className="col-span-full sm:col-span-1 px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover text-sm">Search</button>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-12 text-textSecondary">No activities found. Try adjusting your filters.</div>
        ) : activities.map(act => (
          <div key={act.id} className="bg-card rounded-xl shadow-sm border border-border p-5 flex items-start space-x-4 hover:shadow-md transition-shadow">
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap ${typeColors[act.type] || 'bg-gray-100 text-gray-700'}`}>
              {act.type}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-textPrimary">{act.name}</h3>
                  <p className="text-sm text-textSecondary">{cities.find(c => c.id === act.city)?.name || 'Unknown City'}</p>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <p className="text-lg font-bold text-textPrimary">${parseFloat(act.cost).toFixed(2)}</p>
                  <p className="text-xs text-textSecondary">per person</p>
                </div>
              </div>
              {act.description && <p className="text-sm text-textSecondary mt-2 line-clamp-2">{act.description}</p>}
              <div className="flex items-center space-x-4 mt-3">
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">⏱ {act.duration_hours}h</span>
                <button onClick={() => setAddModal(act)} className="text-xs bg-primary text-white px-4 py-1.5 rounded-lg hover:bg-primary-hover font-medium">+ Add to Stop</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {addModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6">
            <h3 className="text-xl font-bold mb-1">Add Activity to Stop</h3>
            <p className="text-sm text-textSecondary mb-4">{addModal.name}</p>
            <label className="block text-xs font-medium uppercase tracking-wide text-textPrimary mb-1">Select Trip</label>
            <select value={selectedTrip} onChange={e => loadStopsForTrip(e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg mb-3 text-sm">
              <option value="">-- Choose a trip --</option>
              {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {tripsWithStops.length > 0 && (
              <>
                <label className="block text-xs font-medium uppercase tracking-wide text-textPrimary mb-1">Select Stop</label>
                <select value={selectedStop} onChange={e => setSelectedStop(e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg mb-4 text-sm">
                  <option value="">-- Choose a stop --</option>
                  {tripsWithStops.map(s => <option key={s.id} value={s.id}>{s.city_details?.name}</option>)}
                </select>
              </>
            )}
            <div className="flex space-x-3">
              <button onClick={() => setAddModal(null)} className="flex-1 py-2 border border-border rounded-lg text-textSecondary text-sm">Cancel</button>
              <button onClick={handleAddToStop} className="flex-1 py-2 bg-primary text-white rounded-lg font-medium text-sm">Add Activity</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
