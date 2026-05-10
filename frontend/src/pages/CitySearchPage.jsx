import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CitySearchPage() {
  const [cities, setCities] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('All');
  const [region, setRegion] = useState('All');
  const [sortBy, setSortBy] = useState('popularity');
  const [page, setPage] = useState(1);
  const [trips, setTrips] = useState([]);
  const [addToTripModal, setAddToTripModal] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState('');
  const [selectedStop, setSelectedStop] = useState('');
  const debounceRef = useRef(null);
  const navigate = useNavigate();
  const PAGE_SIZE = 12;
  const regions = ['All', 'India', 'Asia', 'Europe', 'Americas', 'Middle East'];

  useEffect(() => {
    Promise.all([api.get('/cities/'), api.get('/trips/')]).then(([c, t]) => {
      setAllCities(c.data);
      setCities(c.data);
      setTrips(t.data);
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSearch = () => {
    let result = [...allCities];
    if (search) result = result.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.country.toLowerCase().includes(search.toLowerCase()));
    if (country !== 'All') result = result.filter(c => c.country === country);
    if (region !== 'All') result = result.filter(c => c.region === region);
    if (sortBy === 'popularity') result.sort((a, b) => b.popularity - a.popularity);
    else if (sortBy === 'cost_asc') result.sort((a, b) => a.cost_index - b.cost_index);
    else if (sortBy === 'cost_desc') result.sort((a, b) => b.cost_index - a.cost_index);
    setCities(result);
    setPage(1);
  };

  const handleSearchInput = (val) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(), 400);
  };

  const handleAddToTrip = async () => {
    if (!selectedTrip) { toast.error('Please select a trip'); return; }
    const trip = trips.find(t => t.id === parseInt(selectedTrip));
    if (!trip) return;
    try {
      await api.post(`/trips/${selectedTrip}/stops/`, {
        city: addToTripModal.id,
        arrival_date: trip.start_date,
        departure_date: trip.end_date,
        budget: 0
      });
      toast.success(`${addToTripModal.name} added to your trip!`);
      setAddToTripModal(null);
    } catch { toast.error('Failed to add city to trip'); }
  };

  const countries = ['All', ...new Set(allCities.map(c => c.country))];
  const visibleCities = cities.slice(0, page * PAGE_SIZE);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Explore Cities" subtitle="Find your next destination" />

      <div className="bg-card rounded-xl shadow-sm border border-border p-5 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <input
          type="text" value={search} onChange={e => handleSearchInput(e.target.value)}
          placeholder="Search cities..." 
          className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm col-span-full sm:col-span-1 lg:col-span-2"
        />
        <select value={country} onChange={e => setCountry(e.target.value)} className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white">
          {countries.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={region} onChange={e => setRegion(e.target.value)} className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white">
          {regions.map(r => <option key={r}>{r}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white">
          <option value="popularity">Popularity</option>
          <option value="cost_asc">Cost (Low to High)</option>
          <option value="cost_desc">Cost (High to Low)</option>
        </select>
        <button onClick={handleSearch} className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover text-sm col-span-full sm:col-span-1">Search</button>
      </div>

      <p className="text-sm text-textSecondary mb-4">Showing {visibleCities.length} of {cities.length} cities</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {visibleCities.map(city => (
          <div key={city.id} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-all group">
            <div className="h-44 bg-gradient-to-br from-primary to-teal-800 relative overflow-hidden">
              {city.cover_image ? (
                <img src={city.cover_image} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold opacity-20">{city.name.charAt(0)}</div>
              )}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <h3 className="text-white text-xl font-bold">{city.name}</h3>
                <p className="text-white/80 text-sm">{city.country} • {city.region}</p>
              </div>
              <div className="absolute top-3 right-3 bg-accent text-white text-xs font-bold px-2 py-1 rounded-full">Top {city.popularity}%</div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  {[1,2,3].map(v => <span key={v} className={`text-base ${v <= Math.round(city.cost_index) ? 'text-textPrimary font-bold' : 'text-gray-300'}`}>$</span>)}
                </div>
                <div className="flex-1 mx-3">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${city.popularity}%` }}></div>
                  </div>
                </div>
                <span className="text-xs text-textSecondary">{city.popularity}/100</span>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => navigate(`/search/activities?city=${city.id}`)} className="flex-1 px-3 py-2 border border-primary text-primary text-sm font-medium rounded-lg hover:bg-teal-50">View Activities</button>
                <button onClick={() => setAddToTripModal(city)} className="flex-1 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover">Add to Trip</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleCities.length < cities.length && (
        <div className="text-center">
          <button onClick={() => setPage(p => p + 1)} className="px-8 py-3 bg-white border border-border text-textPrimary font-medium rounded-lg hover:bg-gray-50 shadow-sm">
            Load More Cities
          </button>
        </div>
      )}

      {addToTripModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6">
            <h3 className="text-xl font-bold mb-4">Add {addToTripModal.name} to Trip</h3>
            <label className="block text-xs font-medium uppercase tracking-wide text-textPrimary mb-1">Select Trip</label>
            <select value={selectedTrip} onChange={e => setSelectedTrip(e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg mb-4">
              <option value="">-- Choose a trip --</option>
              {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <div className="flex space-x-3">
              <button onClick={() => setAddToTripModal(null)} className="flex-1 py-2 border border-border rounded-lg text-textSecondary">Cancel</button>
              <button onClick={handleAddToTrip} className="flex-1 py-2 bg-primary text-white rounded-lg font-medium">Add Stop</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
