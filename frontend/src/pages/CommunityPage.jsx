import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDistanceToNow, parseISO } from 'date-fns';

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [trips, setTrips] = useState([]);
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState('');
  const [selectedTrip, setSelectedTrip] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    Promise.all([
      api.get('/community/'),
      api.get('/trips/'),
      api.get('/cities/?ordering=-popularity')
    ]).then(([p, t, c]) => {
      setPosts(p.data);
      setTrips(t.data);
      setCities(c.data.slice(0, 5));
    }).catch(() => toast.error('Failed to load community feed'))
      .finally(() => setIsLoading(false));
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsPosting(true);
    try {
      const res = await api.post('/community/', { content, trip: selectedTrip || null });
      setPosts([res.data, ...posts]);
      setContent('');
      setSelectedTrip('');
      toast.success('Post shared!');
    } catch { toast.error('Failed to post'); }
    finally { setIsPosting(false); }
  };

  const handleLike = async (postId) => {
    // Optimistically update
    setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    try {
      await api.patch(`/community/${postId}/like/`);
    } catch {
      // Revert
      setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes - 1 } : p));
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
  <div>
    <PageHeader title="Community" subtitle="Discover trips shared by other travelers" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Share post card */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-5">
            <form onSubmit={handlePost} className="space-y-3">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="What's on your mind? Share a trip experience..."
                rows={3}
                required
                className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <div className="flex flex-wrap items-center gap-3">
                <select value={selectedTrip} onChange={e => setSelectedTrip(e.target.value)} className="px-3 py-2 border border-border rounded-lg text-sm bg-white flex-1 min-w-0">
                  <option value="">No trip linked</option>
                  {trips.filter(t => t.is_public).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <button type="submit" disabled={isPosting} className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover text-sm disabled:opacity-70 flex items-center gap-2">
                  {isPosting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : null}
                  Post
                </button>
              </div>
            </form>
          </div>

          {/* Posts Feed */}
          {posts.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
              <div className="text-5xl mb-3">🌍</div>
              <p className="text-textPrimary font-medium">No posts yet. Be the first to share!</p>
            </div>
          ) : posts.map(post => {
            const user_details = post.user_details;
            const trip_details = post.trip_details;
            const timeAgo = formatDistanceToNow(parseISO(post.created_at), { addSuffix: true });
            return (
              <div key={post.id} className="bg-card rounded-xl shadow-sm border border-border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-teal-400 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {user_details?.first_name?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-textPrimary text-sm">{user_details?.first_name} {user_details?.last_name}</p>
                    <p className="text-xs text-textSecondary">{timeAgo}</p>
                  </div>
                </div>
                {trip_details && (
                  <div className="mb-3">
                    <span className="inline-block bg-teal-100 text-primary text-xs font-medium px-3 py-1 rounded-full">✈️ {trip_details.name}</span>
                  </div>
                )}
                <p className="text-sm text-textPrimary leading-relaxed">{post.content}</p>
                <div className="flex items-center mt-4 pt-3 border-t border-border">
                  <button onClick={() => handleLike(post.id)} className="flex items-center space-x-2 text-textSecondary hover:text-error transition-colors group">
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    <span className="text-sm font-medium">{post.likes}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-5">
            <h3 className="font-bold text-textPrimary mb-3">About Community</h3>
            <p className="text-sm text-textSecondary">Share your travel experiences, discover trips from fellow travelers, and get inspired for your next adventure.</p>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border p-5">
            <h3 className="font-bold text-textPrimary mb-3">Popular Destinations</h3>
            <div className="space-y-2">
              {cities.map((city, i) => (
                <div key={city.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => window.location.href = `/search/activities?city=${city.id}`}>
                  <span className="text-sm font-medium text-textPrimary">
                    {['🗼', '🗾', '🗽', '🏛️', '🌊'][i] || '🌍'} {city.name}
                  </span>
                  <span className="text-xs text-textSecondary">{city.country}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
