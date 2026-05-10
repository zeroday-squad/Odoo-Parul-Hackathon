import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const REGION_COLORS = ['#0F6E56', '#F5A623', '#3B82F6', '#8B5CF6', '#10B981', '#F97316'];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Redirect non-admin users after mount (not during render)
  useEffect(() => {
    if (!user.is_staff) {
      navigate('/dashboard');
    }
  }, []);

  useEffect(() => {
    if (!user.is_staff) return;
    api.get('/admin/stats/')
      .then(res => setStats(res.data))
      .catch(() => toast.error('Failed to load admin stats'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingSpinner />;
  if (!stats) return <div className="text-center py-12 text-textSecondary">Failed to load stats.</div>;

  const filteredRecent = stats.recent_trips?.filter(t =>
    t.user.toLowerCase().includes(search.toLowerCase()) || t.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const statCards = [
    { label: 'Total Users', value: stats.total_users, color: 'border-t-primary', iconBg: 'bg-teal-100', icon: '👥' },
    { label: 'Total Trips', value: stats.total_trips, color: 'border-t-accent', iconBg: 'bg-amber-100', icon: '✈️' },
    { label: 'Active Trips', value: stats.active_trips, color: 'border-t-success', iconBg: 'bg-green-100', icon: '🌍' },
    { label: 'Total Cities', value: stats.total_cities, color: 'border-t-purple-500', iconBg: 'bg-purple-100', icon: '🏙️' },
  ];

  return (
    <div>
      <PageHeader title="Admin Analytics Dashboard" subtitle="Platform-wide statistics and insights" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className={`bg-card rounded-xl shadow-sm border-t-4 ${card.color} p-5`}>
            <div className={`w-10 h-10 rounded-full ${card.iconBg} flex items-center justify-center text-lg mb-3`}>{card.icon}</div>
            <p className="text-3xl font-bold text-textPrimary">{card.value}</p>
            <p className="text-sm text-textSecondary mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <h3 className="text-lg font-bold text-textPrimary mb-4">Trips Created per Month</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.trips_per_month} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0F6E56" radius={[4, 4, 0, 0]} name="Trips" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <h3 className="text-lg font-bold text-textPrimary mb-4">Trips by Destination Region</h3>
          {stats.top_cities && stats.top_cities.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-textSecondary">No trip data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.top_cities?.slice(0, 6) || []}
                  dataKey="trip_count"
                  nameKey="city_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ city_name, percent }) => `${city_name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(stats.top_cities?.slice(0, 6) || []).map((_, i) => <Cell key={i} fill={REGION_COLORS[i % REGION_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Cities Bar Chart */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-8">
        <h3 className="text-lg font-bold text-textPrimary mb-4">Top Cities by Trip Count</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.top_cities || []} layout="vertical" margin={{ top: 5, right: 40, left: 60, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="city_name" tick={{ fontSize: 12 }} width={80} />
            <Tooltip />
            <Bar dataKey="trip_count" fill="#F5A623" radius={[0, 4, 4, 0]} name="Trip Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Trips Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-textPrimary">Recent Trips</h3>
          <input type="text" placeholder="Search by user or trip name..." value={search} onChange={e => setSearch(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-72" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                {['User Email', 'Trip Name', 'Start Date', 'End Date', 'Status', 'Stops'].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-textSecondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRecent.map((t, i) => {
                const statusColors = { ongoing: 'bg-success text-white', upcoming: 'bg-blue-500 text-white', completed: 'bg-gray-500 text-white' };
                return (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-textSecondary">{t.user}</td>
                    <td className="p-4 text-sm font-medium text-textPrimary">{t.name}</td>
                    <td className="p-4 text-sm text-textSecondary">{t.start_date}</td>
                    <td className="p-4 text-sm text-textSecondary">{t.end_date}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${statusColors[t.status] || 'bg-gray-100 text-gray-600'}`}>{t.status}</span>
                    </td>
                    <td className="p-4 text-sm text-textPrimary">{t.stops_count}</td>
                  </tr>
                );
              })}
              {filteredRecent.length === 0 && (
                <tr><td colSpan="6" className="p-8 text-center text-textSecondary">No trips found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
