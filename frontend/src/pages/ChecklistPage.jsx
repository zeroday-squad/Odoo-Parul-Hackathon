import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = ['clothing', 'documents', 'electronics', 'other'];
const catColors = { clothing: 'bg-blue-100 text-blue-700', documents: 'bg-yellow-100 text-yellow-700', electronics: 'bg-purple-100 text-purple-700', other: 'bg-gray-100 text-gray-700' };

export default function ChecklistPage() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('clothing');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [expanded, setExpanded] = useState({ clothing: true, documents: true, electronics: true, other: true });

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [itemsRes, tripRes] = await Promise.all([api.get(`/trips/${id}/checklist/`), api.get(`/trips/${id}/`)]);
      setItems(itemsRes.data);
      setTrip(tripRes.data);
    } catch { toast.error('Failed to load checklist'); }
    finally { setIsLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await api.post(`/trips/${id}/checklist/`, { name: newName, category: newCat });
      setNewName('');
      fetchAll();
      toast.success('Item added');
    } catch { toast.error('Failed to add item'); }
  };

  const handleToggle = async (item) => {
    try {
      await api.patch(`/checklist/${item.id}/`, { is_packed: !item.is_packed });
      setItems(items.map(i => i.id === item.id ? { ...i, is_packed: !i.is_packed } : i));
    } catch { toast.error('Failed to update item'); }
  };

  const handleDelete = async (itemId) => {
    try {
      await api.delete(`/checklist/${itemId}/`);
      setItems(items.filter(i => i.id !== itemId));
    } catch { toast.error('Failed to delete item'); }
  };

  const handleEditSave = async (itemId) => {
    if (!editName.trim()) return;
    try {
      await api.patch(`/checklist/${itemId}/`, { name: editName });
      setEditingId(null);
      fetchAll();
    } catch { toast.error('Failed to update item'); }
  };

  const handleReset = async () => {
    try {
      await api.post(`/trips/${id}/checklist/reset/`);
      fetchAll();
      toast.success('Checklist reset!');
    } catch { toast.error('Failed to reset checklist'); }
  };

  if (isLoading) return <LoadingSpinner />;

  const packed = items.filter(i => i.is_packed).length;
  const total = items.length;
  const progress = total > 0 ? (packed / total) * 100 : 0;

  return (
    <div>
      <PageHeader title="Packing Checklist" subtitle={trip?.name || ''} />

      {/* Progress Bar */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-5 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-textPrimary">{packed} of {total} items packed</span>
          <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="bg-primary h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Add Item Form */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-5 mb-6">
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Add new item..." required
            className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <select value={newCat} onChange={e => setNewCat(e.target.value)} className="px-4 py-2 border border-border rounded-lg text-sm bg-white">
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <button type="submit" className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover text-sm">Add</button>
        </form>
      </div>

      {/* Categories */}
      {CATEGORIES.map(cat => {
        const catItems = items.filter(i => i.category === cat);
        const catPacked = catItems.filter(i => i.is_packed).length;
        return (
          <div key={cat} className="bg-card rounded-xl shadow-sm border border-border mb-4 overflow-hidden">
            <button
              onClick={() => setExpanded({ ...expanded, [cat]: !expanded[cat] })}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${catColors[cat]}`}>{cat}</span>
                <span className="text-sm text-textSecondary">{catPacked} packed / {catItems.length} total</span>
              </div>
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${expanded[cat] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {expanded[cat] && (
              <div className="divide-y divide-border">
                {catItems.length === 0 ? (
                  <p className="text-sm text-textSecondary text-center py-4">No items in this category.</p>
                ) : catItems.map(item => (
                  <div key={item.id} className="flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={item.is_packed} onChange={() => handleToggle(item)}
                      className="w-5 h-5 rounded accent-primary cursor-pointer" />
                    {editingId === item.id ? (
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                        onBlur={() => handleEditSave(item.id)}
                        onKeyDown={e => e.key === 'Enter' && handleEditSave(item.id)}
                        autoFocus
                        className="flex-1 px-2 py-1 border border-primary rounded text-sm focus:outline-none"
                      />
                    ) : (
                      <span className={`flex-1 text-sm ${item.is_packed ? 'line-through text-textSecondary' : 'text-textPrimary font-medium'}`}>{item.name}</span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${catColors[item.category]}`}>{item.category}</span>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => { setEditingId(item.id); setEditName(item.name); }} className="text-gray-400 hover:text-primary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-error">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Bottom Buttons */}
      <div className="flex justify-end mt-4">
        <button onClick={handleReset} className="px-6 py-2 border border-error text-error rounded-lg hover:bg-red-50 text-sm font-medium">Reset All</button>
      </div>
    </div>
  );
}
