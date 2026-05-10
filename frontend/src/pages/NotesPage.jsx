import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import DatePicker from 'react-datepicker';
import { format, parseISO, formatDistanceToNow } from 'date-fns';

export default function NotesPage() {
  const { id } = useParams();
  const [notes, setNotes] = useState([]);
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStop, setFilterStop] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [newContent, setNewContent] = useState('');
  const [newStop, setNewStop] = useState('');
  const [newReminder, setNewReminder] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [notesRes, tripRes] = await Promise.all([api.get(`/trips/${id}/notes/`), api.get(`/trips/${id}/`)]);
      setNotes(notesRes.data);
      setTrip(tripRes.data);
    } catch { toast.error('Failed to load notes'); }
    finally { setIsLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    try {
      await api.post(`/trips/${id}/notes/`, {
        content: newContent,
        stop: newStop || null,
        reminder_time: newReminder ? newReminder.toISOString() : null
      });
      setNewContent('');
      setNewStop('');
      setNewReminder(null);
      fetchAll();
      toast.success('Note saved!');
    } catch { toast.error('Failed to save note'); }
  };

  const handleDelete = async (noteId) => {
    try {
      await api.delete(`/notes/${noteId}/`);
      setNotes(notes.filter(n => n.id !== noteId));
      toast.success('Note deleted');
    } catch { toast.error('Failed to delete note'); }
  };

  const handleEditSave = async (noteId) => {
    try {
      await api.put(`/notes/${noteId}/`, editData);
      setEditingId(null);
      fetchAll();
      toast.success('Note updated');
    } catch { toast.error('Failed to update note'); }
  };

  const filteredNotes = notes.filter(n => !filterStop || String(n.stop) === filterStop)
    .sort((a, b) => sortBy === 'newest'
      ? new Date(b.created_at) - new Date(a.created_at)
      : new Date(a.created_at) - new Date(b.created_at));

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Trip Notes" subtitle={trip?.name || ''} />

      {/* Filter Row */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={filterStop} onChange={e => setFilterStop(e.target.value)} className="px-4 py-2 border border-border rounded-lg text-sm bg-white">
          <option value="">All Stops</option>
          {trip?.stops?.map(s => <option key={s.id} value={s.id}>{s.city_details?.name}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-4 py-2 border border-border rounded-lg text-sm bg-white">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Add Note Form */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-8">
        <h3 className="text-base font-bold text-textPrimary mb-4">Add a New Note</h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            rows={4}
            placeholder="Write a note..."
            required
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={newStop} onChange={e => setNewStop(e.target.value)} className="px-4 py-2 border border-border rounded-lg text-sm bg-white flex-1">
              <option value="">Link to stop (optional)</option>
              {trip?.stops?.map(s => <option key={s.id} value={s.id}>{s.city_details?.name}</option>)}
            </select>
            <div className="flex-1">
              <DatePicker
                selected={newReminder}
                onChange={setNewReminder}
                showTimeSelect
                dateFormat="yyyy-MM-dd HH:mm"
                placeholderText="Set reminder (optional)"
                className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button type="submit" className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover text-sm">Save Note</button>
          </div>
        </form>
      </div>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-dashed border-border">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-textPrimary">No notes yet</h3>
          <p className="text-textSecondary text-sm mt-1">Start writing your trip notes above!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map(note => {
            const linkedStop = trip?.stops?.find(s => s.id === note.stop);
            const isEditing = editingId === note.id;
            return (
              <div key={note.id} className="bg-card rounded-xl shadow-sm border-l-4 border-l-accent border-t border-r border-b border-border p-5 relative">
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button onClick={() => { setEditingId(note.id); setEditData({ content: note.content, stop: note.stop, reminder_time: note.reminder_time }); }} className="text-gray-400 hover:text-primary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  </button>
                  <button onClick={() => handleDelete(note.id)} className="text-gray-400 hover:text-error">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
                {linkedStop && <span className="inline-block bg-teal-100 text-primary text-xs font-medium px-2 py-0.5 rounded-full mb-2">📍 {linkedStop.city_details?.name}</span>}
                {isEditing ? (
                  <div className="space-y-3 pr-16">
                    <textarea value={editData.content} onChange={e => setEditData({...editData, content: e.target.value})}
                      rows={4} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                    <select value={editData.stop || ''} onChange={e => setEditData({...editData, stop: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white">
                      <option value="">No stop linked</option>
                      {trip?.stops?.map(s => <option key={s.id} value={s.id}>{s.city_details?.name}</option>)}
                    </select>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditSave(note.id)} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-2 border border-border rounded-lg text-sm text-textSecondary">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-textPrimary whitespace-pre-wrap pr-16">{note.content}</p>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="text-xs text-textSecondary">
                    {format(parseISO(note.created_at), 'MMM d, yyyy')} at {format(parseISO(note.created_at), 'h:mm a')}
                  </span>
                  {note.reminder_time && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      ⏰ {format(parseISO(note.reminder_time), 'MMM d, h:mm a')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
