import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import TripCard from '../components/TripCard';
import { format, parseISO } from 'date-fns';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', phone_number: '', language: 'en', bio: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef();
  const navigate = { push: (p) => window.location.href = p };

  useEffect(() => {
    Promise.all([api.get('/auth/profile/'), api.get('/trips/')]).then(([p, t]) => {
      setProfile(p.data);
      setTrips(t.data);
      setFormData({
        first_name: p.data.first_name || '',
        last_name: p.data.last_name || '',
        email: p.data.email || '',
        phone_number: p.data.profile?.phone_number || '',
        language: p.data.profile?.language || 'en',
        bio: p.data.profile?.bio || ''
      });
    }).catch(() => toast.error('Failed to load profile'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(k => data.append(k, formData[k]));
      if (avatarFile) data.append('avatar', avatarFile);
      const res = await api.put('/auth/profile/', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfile(res.data);
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...res.data }));
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setIsSaving(false); }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') { toast.error('Type DELETE to confirm'); return; }
    try {
      await api.delete('/auth/profile/');
      localStorage.clear();
      window.location.href = '/login';
    } catch { toast.error('Failed to delete account'); }
  };

  const handleDeleteTrip = async (tripId) => {
    if (window.confirm('Delete this trip?')) {
      try {
        await api.delete(`/trips/${tripId}/`);
        setTrips(trips.filter(t => t.id !== tripId));
        toast.success('Trip deleted');
      } catch { toast.error('Failed to delete trip'); }
    }
  };

  const upcomingTrips = trips.filter(t => t.status === 'upcoming');
  const completedTrips = trips.filter(t => t.status === 'completed');
  const memberSince = profile ? format(parseISO(profile.profile?.created_at || new Date().toISOString()), 'MMMM yyyy') : '';

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your account and preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 text-center sticky top-20">
            <div className="relative inline-block group mb-4" onClick={() => fileInputRef.current?.click()}>
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary mx-auto cursor-pointer">
                {avatarPreview || profile?.profile?.avatar ? (
                  <img src={avatarPreview || profile.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center text-white text-3xl font-bold">
                    {profile?.first_name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-white text-xs font-medium">Upload Photo</span>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </div>
            <h2 className="text-lg font-bold text-textPrimary">{profile?.first_name} {profile?.last_name}</h2>
            <p className="text-sm text-textSecondary">{profile?.email}</p>
            <p className="text-xs text-textSecondary mt-2">Member since {memberSince}</p>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Edit Profile */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <h3 className="text-lg font-bold text-textPrimary mb-5">Edit Profile</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-textPrimary mb-1">First Name</label>
                  <input type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-textPrimary mb-1">Last Name</label>
                  <input type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-textPrimary mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-textPrimary mb-1">Phone Number</label>
                <input type="text" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-textPrimary mb-1">Language</label>
                <select value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg text-sm bg-white">
                  {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-textPrimary mb-1">Bio</label>
                <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} rows={3}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
              <button type="submit" disabled={isSaving} className="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover disabled:opacity-70 flex justify-center">
                {isSaving ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* Upcoming Trips */}
          {upcomingTrips.length > 0 && (
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
              <h3 className="text-lg font-bold text-textPrimary mb-4">Upcoming Trips</h3>
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {upcomingTrips.slice(0, 3).map(t => (
                  <div key={t.id} className="min-w-[260px]">
                    <TripCard trip={t} onDelete={handleDeleteTrip} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Previous Trips */}
          {completedTrips.length > 0 && (
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
              <h3 className="text-lg font-bold text-textPrimary mb-4">Previous Trips</h3>
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {completedTrips.slice(0, 3).map(t => (
                  <div key={t.id} className="min-w-[260px]">
                    <TripCard trip={t} onDelete={handleDeleteTrip} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="bg-card rounded-2xl shadow-sm border-2 border-error p-6">
            <h3 className="text-lg font-bold text-error mb-2">⚠️ Danger Zone</h3>
            <p className="text-sm text-textSecondary mb-4">Once you delete your account, all your data will be permanently removed.</p>
            <button onClick={() => setShowDeleteModal(true)} className="px-6 py-2 border-2 border-error text-error rounded-lg hover:bg-red-50 text-sm font-medium">Delete Account</button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-xl font-bold text-error mb-2">Delete Account</h3>
            <p className="text-sm text-textSecondary mb-4">Are you sure? This cannot be undone. Type <strong>DELETE</strong> to confirm.</p>
            <input type="text" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder='Type "DELETE" to confirm'
              className="w-full px-4 py-2 border border-border rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-error" />
            <div className="flex space-x-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2 border border-border rounded-lg text-textSecondary text-sm">Cancel</button>
              <button onClick={handleDeleteAccount} className="flex-1 py-2 bg-error text-white rounded-lg font-medium text-sm">Delete Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
