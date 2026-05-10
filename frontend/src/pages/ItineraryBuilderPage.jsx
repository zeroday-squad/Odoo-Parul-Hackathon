import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import DatePicker from 'react-datepicker';
import { format, parseISO } from 'date-fns';

const typeColorMap = {
  food: 'bg-amber-400', adventure: 'bg-red-400', sightseeing: 'bg-blue-400',
  culture: 'bg-purple-400', physical: 'bg-green-400',
};

export default function ItineraryBuilderPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Add Stop Modal ────────────────────────────────────────────────
  const [showAddStopModal, setShowAddStopModal] = useState(false);
  const [cityQuery, setCityQuery] = useState('');
  const [cityResults, setCityResults] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [newStopArrival, setNewStopArrival] = useState(null);
  const [newStopDeparture, setNewStopDeparture] = useState(null);
  const [newStopBudget, setNewStopBudget] = useState(0);
  const [newStopNotes, setNewStopNotes] = useState('');

  // ── Delete Confirmation Modal ───────────────────────────────────
  const [confirmDeleteStopId, setConfirmDeleteStopId] = useState(null);

  // ── Inline Stop Edit ─────────────────────────────────────────────
  const [editingStopId, setEditingStopId] = useState(null);
  const [editStopData, setEditStopData] = useState({});

  // ── Activity Panel ────────────────────────────────────────────────
  const [activeStopForActivity, setActiveStopForActivity] = useState(null);
  const [activityQuery, setActivityQuery] = useState('');
  const [activityResults, setActivityResults] = useState([]);

  useEffect(() => { fetchTrip(); }, [id]);

  const fetchTrip = async () => {
    try {
      const res = await api.get(`/trips/${id}/`);
      setTrip(res.data);
    } catch {
      toast.error('Failed to load trip');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Stop CRUD ─────────────────────────────────────────────────────
  const handleDeleteStop = async () => {
    const stopId = confirmDeleteStopId;
    setConfirmDeleteStopId(null);
    try {
      await api.delete(`/stops/${stopId}/`);
      fetchTrip();
      toast.success('Stop deleted');
    } catch { toast.error('Failed to delete stop'); }
  };

  const startEditStop = (stop) => {
    setEditingStopId(stop.id);
    setEditStopData({
      arrival_date: parseISO(stop.arrival_date),
      departure_date: parseISO(stop.departure_date),
      budget: stop.budget,
      notes: stop.notes || '',
    });
  };

  const cancelEditStop = () => {
    setEditingStopId(null);
    setEditStopData({});
  };

  const handleSaveStop = async (stopId) => {
    if (!editStopData.arrival_date || !editStopData.departure_date) {
      toast.error('Please set both arrival and departure dates');
      return;
    }
    if (editStopData.departure_date < editStopData.arrival_date) {
      toast.error('Departure must be after arrival');
      return;
    }
    try {
      await api.patch(`/stops/${stopId}/`, {
        arrival_date: editStopData.arrival_date.toISOString().split('T')[0],
        departure_date: editStopData.departure_date.toISOString().split('T')[0],
        budget: parseFloat(editStopData.budget) || 0,
        notes: editStopData.notes,
      });
      cancelEditStop();
      fetchTrip();
      toast.success('Stop updated');
    } catch { toast.error('Failed to update stop'); }
  };

  // ── Add Stop ──────────────────────────────────────────────────────
  const handleCitySearch = async (query) => {
    setCityQuery(query);
    if (query.length > 2) {
      try {
        const res = await api.get(`/cities/?search=${query}`);
        setCityResults(res.data);
      } catch { /* silent */ }
    } else {
      setCityResults([]);
    }
  };

  const handleAddStop = async () => {
    if (!selectedCity || !newStopArrival || !newStopDeparture) {
      toast.error('Please fill required fields');
      return;
    }
    if (newStopDeparture < newStopArrival) {
      toast.error('Departure must be after arrival');
      return;
    }
    try {
      await api.post(`/trips/${id}/stops/`, {
        city: selectedCity.id,
        arrival_date: newStopArrival.toISOString().split('T')[0],
        departure_date: newStopDeparture.toISOString().split('T')[0],
        budget: parseFloat(newStopBudget) || 0,
        notes: newStopNotes,
      });
      setShowAddStopModal(false);
      setSelectedCity(null); setNewStopArrival(null); setNewStopDeparture(null);
      setNewStopBudget(0); setNewStopNotes(''); setCityQuery(''); setCityResults([]);
      fetchTrip();
      toast.success('Stop added');
    } catch { toast.error('Failed to add stop'); }
  };

  // ── Activities ────────────────────────────────────────────────────
  const handleActivitySearch = async (stop, query) => {
    setActivityQuery(query);
    try {
      const res = await api.get(`/activities/?city=${stop.city_details?.id}&search=${query}`);
      setActivityResults(res.data);
    } catch { /* silent */ }
  };

  const handleAddActivity = async (stopId, activityId) => {
    try {
      await api.post(`/stops/${stopId}/activities/`, { activity: activityId });
      fetchTrip();
      toast.success('Activity added');
    } catch { toast.error('Failed to add activity'); }
  };

  const handleRemoveActivity = async (stopId, stopActivityId) => {
    try {
      await api.delete(`/stops/${stopId}/activities/${stopActivityId}/`);
      fetchTrip();
      toast.success('Activity removed');
    } catch { toast.error('Failed to remove activity'); }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!trip) return <div className="text-center py-12 text-textSecondary">Trip not found</div>;

  return (
    <div>
      <PageHeader
        title={trip.name}
        subtitle={`${format(parseISO(trip.start_date), 'MMM d, yyyy')} - ${format(parseISO(trip.end_date), 'MMM d, yyyy')}`}
        action={
          <div className="flex space-x-3">
            <Link to={`/trips/${id}/budget`} className="px-4 py-2 border border-accent text-accent hover:bg-amber-50 text-sm font-medium rounded-lg">Budget</Link>
            <Link to={`/trips/${id}/view`} className="px-4 py-2 border border-primary text-primary hover:bg-teal-50 text-sm font-medium rounded-lg">View Itinerary</Link>
          </div>
        }
      />

      <div className="max-w-4xl mx-auto">
        <div className="relative border-l-4 border-primary pl-6 ml-4 space-y-10 pb-12">
          {trip.stops && trip.stops.map((stop, index) => {
            const isEditing = editingStopId === stop.id;
            return (
              <div key={stop.id} className="relative">
                {/* Timeline dot */}
                <div className="absolute -left-[35px] top-4 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold border-4 border-background">
                  {index + 1}
                </div>

                <div className="bg-card rounded-xl shadow-sm border-l-4 border-l-primary border-t border-r border-b border-border overflow-hidden">
                  {/* Stop Header */}
                  <div className="p-4 bg-gray-50 flex justify-between items-center border-b border-border">
                    <div>
                      <h3 className="text-xl font-bold text-textPrimary">{stop.city_details?.name || 'Unknown City'}</h3>
                      <p className="text-textSecondary text-sm">{stop.city_details?.country}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <>
                          <button onClick={() => handleSaveStop(stop.id)}
                            className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover">
                            Save
                          </button>
                          <button onClick={cancelEditStop}
                            className="px-3 py-1.5 border border-border text-textSecondary text-xs rounded-lg hover:bg-gray-100">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEditStop(stop)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-teal-50 rounded-lg transition-colors" title="Edit stop">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => setConfirmDeleteStopId(stop.id)}
                            className="p-2 text-gray-400 hover:text-error hover:bg-red-50 rounded-lg transition-colors" title="Delete stop">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* ── Inline Edit Form ── */}
                    {isEditing ? (
                      <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-primary mb-1">Arrival Date</label>
                            <DatePicker
                              selected={editStopData.arrival_date}
                              onChange={(d) => setEditStopData({ ...editStopData, arrival_date: d })}
                              className="w-full px-3 py-2 border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                              dateFormat="yyyy-MM-dd"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-primary mb-1">Departure Date</label>
                            <DatePicker
                              selected={editStopData.departure_date}
                              onChange={(d) => setEditStopData({ ...editStopData, departure_date: d })}
                              className="w-full px-3 py-2 border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                              dateFormat="yyyy-MM-dd"
                              minDate={editStopData.arrival_date}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wide text-primary mb-1">Budget ($)</label>
                          <input
                            type="number" min="0"
                            value={editStopData.budget}
                            onChange={(e) => setEditStopData({ ...editStopData, budget: e.target.value })}
                            className="w-full px-3 py-2 border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wide text-primary mb-1">Notes</label>
                          <textarea
                            rows={3}
                            value={editStopData.notes}
                            onChange={(e) => setEditStopData({ ...editStopData, notes: e.target.value })}
                            placeholder="Notes for this stop..."
                            className="w-full px-3 py-2 border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white resize-none"
                          />
                        </div>
                      </div>
                    ) : (
                      /* ── Read-only view ── */
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm">
                          <div className="flex items-center text-textPrimary font-medium">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {format(parseISO(stop.arrival_date), 'MMM d, yyyy')}
                            <span className="mx-2 text-gray-400">→</span>
                            {format(parseISO(stop.departure_date), 'MMM d, yyyy')}
                          </div>
                          <div className="mt-1 sm:mt-0 text-textSecondary">
                            Budget: <span className="font-semibold text-textPrimary">${stop.budget}</span>
                          </div>
                        </div>
                        {stop.notes && (
                          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-textPrimary">
                            {stop.notes}
                          </div>
                        )}
                      </>
                    )}

                    {/* ── Activities ── */}
                    <div className="pt-2 border-t border-border">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-textPrimary flex items-center text-sm">
                          Activities
                          <span className="ml-2 bg-gray-200 text-gray-700 py-0.5 px-2 rounded-full text-xs">{stop.stop_activities?.length || 0}</span>
                        </h4>
                        <button
                          onClick={() => {
                            const isOpen = activeStopForActivity === stop.id;
                            setActiveStopForActivity(isOpen ? null : stop.id);
                            if (!isOpen) { setActivityQuery(''); handleActivitySearch(stop, ''); }
                          }}
                          className="text-primary border border-primary px-3 py-1 text-xs font-medium rounded hover:bg-teal-50 transition-colors"
                        >
                          {activeStopForActivity === stop.id ? 'Close' : '+ Add Activity'}
                        </button>
                      </div>

                      {/* Activity Search Panel */}
                      {activeStopForActivity === stop.id && (
                        <div className="bg-white border border-border rounded-lg p-4 mb-3 shadow-sm">
                          <input
                            type="text"
                            placeholder={`Search activities in ${stop.city_details?.name}...`}
                            value={activityQuery}
                            onChange={(e) => handleActivitySearch(stop, e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary mb-2"
                          />
                          <div className="max-h-52 overflow-y-auto space-y-1">
                            {activityResults.length === 0 ? (
                              <p className="text-sm text-textSecondary text-center py-3">No activities found. Try a shorter search term.</p>
                            ) : activityResults.map(act => (
                              <div key={act.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200">
                                <div className="flex items-center space-x-2">
                                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${typeColorMap[act.type] || 'bg-gray-400'}`} />
                                  <div>
                                    <p className="text-sm font-semibold text-textPrimary leading-tight">{act.name}</p>
                                    <p className="text-xs text-textSecondary capitalize">{act.type} • ${parseFloat(act.cost).toFixed(0)} • {act.duration_hours}h</p>
                                  </div>
                                </div>
                                <button onClick={() => handleAddActivity(stop.id, act.id)}
                                  className="ml-3 flex-shrink-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover text-lg leading-none">
                                  +
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Activity List */}
                      <div className="space-y-2">
                        {stop.stop_activities && stop.stop_activities.map(sa => (
                          <div key={sa.id} className="flex justify-between items-center p-3 bg-white border border-border rounded-lg shadow-sm hover:shadow transition-shadow">
                            <div className="flex items-center space-x-3">
                              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${typeColorMap[sa.activity_details?.type] || 'bg-gray-400'}`} />
                              <div>
                                <p className="text-sm font-semibold text-textPrimary">{sa.activity_details?.name}</p>
                                <p className="text-xs text-textSecondary capitalize">{sa.activity_details?.type} • ${parseFloat(sa.activity_details?.cost || 0).toFixed(0)} • {sa.activity_details?.duration_hours}h</p>
                              </div>
                            </div>
                            <button onClick={() => handleRemoveActivity(stop.id, sa.id)}
                              className="p-1 text-gray-400 hover:text-error hover:bg-red-50 rounded transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Stop CTA */}
          <div className="relative pt-2">
            <button
              onClick={() => setShowAddStopModal(true)}
              className="w-full border-2 border-dashed border-primary text-primary hover:bg-teal-50 py-6 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Add Stop / Destination
            </button>
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {confirmDeleteStopId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-lg font-bold text-textPrimary mb-2">Delete this stop?</h3>
            <p className="text-sm text-textSecondary mb-6">All activities linked to this stop will also be removed. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteStopId(null)} className="flex-1 py-2.5 border border-border rounded-lg text-textSecondary text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleDeleteStop} className="flex-1 py-2.5 bg-error text-white rounded-lg text-sm font-semibold hover:bg-red-600">Delete Stop</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Stop Modal ── */}
      {showAddStopModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="p-5 border-b border-border flex justify-between items-center">
              <h3 className="text-xl font-bold text-textPrimary">Add New Stop</h3>
              <button onClick={() => setShowAddStopModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-5 space-y-4">
              {!selectedCity ? (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-textPrimary mb-1">Search City</label>
                  <input
                    type="text" placeholder="Type a city name..."
                    value={cityQuery} onChange={(e) => handleCitySearch(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <div className="mt-2 max-h-48 overflow-y-auto border border-border rounded-lg bg-gray-50">
                    {cityResults.length > 0 ? cityResults.map(city => (
                      <div key={city.id} onClick={() => setSelectedCity(city)}
                        className="flex justify-between items-center p-3 hover:bg-white border-b border-border last:border-0 cursor-pointer">
                        <div>
                          <p className="font-semibold text-textPrimary text-sm">{city.name}</p>
                          <p className="text-xs text-textSecondary">{city.country}</p>
                        </div>
                        <span className="text-primary text-sm font-medium">Select</span>
                      </div>
                    )) : (
                      <p className="text-center py-4 text-sm text-textSecondary">
                        {cityQuery.length > 2 ? 'No cities found.' : 'Type at least 3 characters to search.'}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-teal-50 p-3 rounded-lg border border-teal-100">
                    <div>
                      <p className="font-bold text-primary">{selectedCity.name}</p>
                      <p className="text-xs text-teal-700">{selectedCity.country}</p>
                    </div>
                    <button onClick={() => setSelectedCity(null)} className="text-xs text-primary underline">Change</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-textPrimary mb-1">Arrival Date</label>
                      <DatePicker selected={newStopArrival} onChange={setNewStopArrival}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        dateFormat="yyyy-MM-dd" placeholderText="Pick date" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-textPrimary mb-1">Departure Date</label>
                      <DatePicker selected={newStopDeparture} onChange={setNewStopDeparture}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        dateFormat="yyyy-MM-dd" minDate={newStopArrival} placeholderText="Pick date" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-textPrimary mb-1">Budget ($)</label>
                    <input type="number" min="0" value={newStopBudget}
                      onChange={(e) => setNewStopBudget(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-textPrimary mb-1">Notes (optional)</label>
                    <textarea rows={3} value={newStopNotes}
                      onChange={(e) => setNewStopNotes(e.target.value)}
                      placeholder="Add notes for this stop..."
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-border bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setShowAddStopModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm text-textSecondary hover:bg-gray-100">Cancel</button>
              <button onClick={handleAddStop}
                disabled={!selectedCity || !newStopArrival || !newStopDeparture}
                className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50 text-sm">
                Add Stop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
