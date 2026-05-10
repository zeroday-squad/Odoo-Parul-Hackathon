import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import DatePicker from 'react-datepicker';

const CATEGORIES = ['transport', 'stay', 'food', 'activity', 'other'];

export default function ExpensePage() {
  const { id } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [stopFilter, setStopFilter] = useState('');
  const [newExp, setNewExp] = useState({ category: 'food', label: '', amount: '', date: new Date(), stop: '' });

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [expRes, tripRes] = await Promise.all([api.get(`/trips/${id}/expenses/`), api.get(`/trips/${id}/`)]);
      setExpenses(expRes.data);
      setTrip(tripRes.data);
    } catch { toast.error('Failed to load expenses'); }
    finally { setIsLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newExp.label || !newExp.amount) { toast.error('Fill required fields'); return; }
    try {
      await api.post(`/trips/${id}/expenses/`, { ...newExp, amount: parseFloat(newExp.amount), date: newExp.date.toISOString().split('T')[0], stop: newExp.stop || null });
      setNewExp({ category: 'food', label: '', amount: '', date: new Date(), stop: '' });
      fetchAll();
      toast.success('Expense added!');
    } catch { toast.error('Failed to add expense'); }
  };

  const handleDelete = async (expId) => {
    try {
      await api.delete(`/expenses/${expId}/`);
      setExpenses(expenses.filter(e => e.id !== expId));
    } catch { toast.error('Failed to delete expense'); }
  };

  const handleEditSave = async (expId) => {
    try {
      await api.put(`/expenses/${expId}/`, editData);
      setEditingId(null);
      fetchAll();
      toast.success('Expense updated');
    } catch { toast.error('Failed to update'); }
  };

  const downloadCSV = () => {
    const headers = ['Date,Category,Description,Stop,Amount'];
    const rows = filteredExpenses.map(e => {
      const stop = trip?.stops?.find(s => s.id === e.stop);
      return `${e.date},${e.category},${e.label},${stop?.city_details?.name || ''},${e.amount}`;
    });
    const csvContent = [...headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `expenses_${id}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = !searchTerm || e.label.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = !catFilter || e.category === catFilter;
    const matchesStop = !stopFilter || String(e.stop) === stopFilter;
    return matchesSearch && matchesCat && matchesStop;
  });

  const totalFiltered = filteredExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Expense Tracking" subtitle={trip?.name || ''} />

      {/* Stepper */}
      <div className="flex items-center space-x-3 mb-8 bg-card rounded-xl p-4 border border-border shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">1</span>
          <span className="text-sm font-medium text-primary">Add Expenses</span>
        </div>
        <div className="flex-1 h-px bg-gray-300"></div>
        <div className="flex items-center space-x-2">
          <span className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 text-sm font-bold flex items-center justify-center">2</span>
          <span className="text-sm font-medium text-textSecondary">Review</span>
        </div>
      </div>

      {/* Add Expense Form */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
        <h3 className="text-lg font-bold text-textPrimary mb-4">Add New Expense</h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <select value={newExp.category} onChange={e => setNewExp({...newExp, category: e.target.value})} className="px-4 py-2 border border-border rounded-lg text-sm bg-white">
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <input type="text" placeholder="Description e.g. Flight to Paris" value={newExp.label} onChange={e => setNewExp({...newExp, label: e.target.value})}
            className="px-4 py-2 border border-border rounded-lg text-sm" required />
          <input type="number" placeholder="$Amount" value={newExp.amount} onChange={e => setNewExp({...newExp, amount: e.target.value})}
            className="px-4 py-2 border border-border rounded-lg text-sm" required />
          <DatePicker selected={newExp.date} onChange={d => setNewExp({...newExp, date: d})}
            className="w-full px-4 py-2 border border-border rounded-lg text-sm" dateFormat="yyyy-MM-dd" />
          <select value={newExp.stop} onChange={e => setNewExp({...newExp, stop: e.target.value})} className="px-4 py-2 border border-border rounded-lg text-sm bg-white">
            <option value="">All Stops</option>
            {trip?.stops?.map(s => <option key={s.id} value={s.id}>{s.city_details?.name}</option>)}
          </select>
          <button type="submit" className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover text-sm">Add Expense</button>
        </form>
      </div>

      {/* Filter Bar */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6 flex flex-wrap gap-3">
        <input type="text" placeholder="Search description..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg text-sm flex-1 min-w-[200px]" />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="px-4 py-2 border border-border rounded-lg text-sm bg-white">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <select value={stopFilter} onChange={e => setStopFilter(e.target.value)} className="px-4 py-2 border border-border rounded-lg text-sm bg-white">
          <option value="">All Stops</option>
          {trip?.stops?.map(s => <option key={s.id} value={s.id}>{s.city_details?.name}</option>)}
        </select>
      </div>

      {/* Expense Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                {['#', 'Date', 'Category', 'Description', 'City/Stop', 'Amount', 'Actions'].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-textSecondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredExpenses.map((exp, idx) => {
                const stop = trip?.stops?.find(s => s.id === exp.stop);
                const isEditing = editingId === exp.id;
                return (
                  <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-textSecondary">{idx + 1}</td>
                    <td className="p-4 text-sm text-textPrimary">
                      {isEditing ? <input type="date" value={editData.date || exp.date} onChange={e => setEditData({...editData, date: e.target.value})} className="border border-border rounded px-2 py-1 text-xs" /> : exp.date}
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <select value={editData.category || exp.category} onChange={e => setEditData({...editData, category: e.target.value})} className="border border-border rounded px-2 py-1 text-xs">
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      ) : <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-teal-100 text-primary capitalize">{exp.category}</span>}
                    </td>
                    <td className="p-4 text-sm text-textPrimary">
                      {isEditing ? <input type="text" value={editData.label || exp.label} onChange={e => setEditData({...editData, label: e.target.value})} className="border border-border rounded px-2 py-1 text-xs w-full" /> : exp.label}
                    </td>
                    <td className="p-4 text-sm text-textSecondary">{stop?.city_details?.name || '—'}</td>
                    <td className="p-4 text-sm font-bold text-textPrimary">
                      {isEditing ? <input type="number" value={editData.amount || exp.amount} onChange={e => setEditData({...editData, amount: e.target.value})} className="border border-border rounded px-2 py-1 text-xs w-24" /> : `$${parseFloat(exp.amount).toFixed(2)}`}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {isEditing ? (
                          <>
                            <button onClick={() => handleEditSave(exp.id)} className="text-xs text-success font-medium">Save</button>
                            <button onClick={() => setEditingId(null)} className="text-xs text-error font-medium">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditingId(exp.id); setEditData({...exp}); }} className="text-gray-400 hover:text-primary">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                            </button>
                            <button onClick={() => handleDelete(exp.id)} className="text-gray-400 hover:text-error">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-border">
              <tr>
                <td colSpan="5" className="p-4 text-right text-sm font-bold text-textPrimary">Total:</td>
                <td className="p-4 text-sm font-bold text-primary">${totalFiltered.toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="flex flex-wrap justify-end gap-3 mt-4">
        <button onClick={downloadCSV} className="px-6 py-2 border border-border text-textPrimary bg-white rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Download CSV
        </button>
        <button onClick={() => setShowConfirm(true)} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover text-sm font-medium shadow-sm">Confirm & Submit</button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl text-center">
            <div className="text-5xl mb-3">✅</div>
            <h3 className="text-xl font-bold text-textPrimary mb-2">Expense Report Finalized</h3>
            <p className="text-textSecondary mb-4">Expense report finalized for <strong>{trip?.name}</strong>.</p>
            <button onClick={() => setShowConfirm(false)} className="w-full py-2 bg-primary text-white rounded-lg font-medium">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
