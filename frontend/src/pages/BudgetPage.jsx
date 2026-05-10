import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';

const COLORS = ['#0F6E56', '#F5A623', '#3B82F6', '#8B5CF6', '#10B981'];
const CATEGORIES = ['transport', 'stay', 'food', 'activity', 'other'];

export default function BudgetPage() {
  const { id } = useParams();
  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [confirmModal, setConfirmModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: 'food', label: '', amount: '', date: new Date(), stop: '' });

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [budgetRes, expensesRes, tripRes] = await Promise.all([
        api.get(`/trips/${id}/budget/`),
        api.get(`/trips/${id}/expenses/`),
        api.get(`/trips/${id}/`)
      ]);
      setBudget(budgetRes.data);
      setExpenses(expensesRes.data);
      setTrip(tripRes.data);
    } catch { toast.error('Failed to load budget data'); }
    finally { setIsLoading(false); }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.label || !newExpense.amount) { toast.error('Please fill required fields'); return; }
    try {
      await api.post(`/trips/${id}/expenses/`, {
        category: newExpense.category,
        label: newExpense.label,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date.toISOString().split('T')[0],
        stop: newExpense.stop || null
      });
      toast.success('Expense added');
      fetchAll();
      setNewExpense({ category: 'food', label: '', amount: '', date: new Date(), stop: '' });
    } catch { toast.error('Failed to add expense'); }
  };

  const handleDeleteExpense = async (expId) => {
    try {
      await api.delete(`/expenses/${expId}/`);
      fetchAll();
      toast.success('Expense deleted');
    } catch { toast.error('Failed to delete expense'); }
  };

  const handleEditSave = async (expId) => {
    try {
      await api.put(`/expenses/${expId}/`, editData);
      setEditingId(null);
      fetchAll();
      toast.success('Expense updated');
    } catch { toast.error('Failed to update expense'); }
  };

  if (isLoading) return <LoadingSpinner />;

  const pieData = budget ? CATEGORIES.map((cat, i) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: parseFloat(budget.by_category[cat] || 0)
  })).filter(d => d.value > 0) : [];

  const barData = budget?.by_day || [];
  const remaining = budget ? budget.remaining : 0;

  return (
    <div>
      <PageHeader title="Trip Budget" subtitle={trip?.name || ''} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Budget', value: budget?.total_budget || 0, color: 'bg-primary text-white', icon: '💰' },
          { label: 'Total Spent', value: budget?.total_spent || 0, color: 'bg-accent text-white', icon: '💸' },
          { label: 'Remaining', value: remaining, color: remaining >= 0 ? 'bg-success text-white' : 'bg-error text-white', icon: remaining >= 0 ? '✅' : '⚠️' }
        ].map((card, i) => (
          <div key={i} className={`${card.color} rounded-2xl p-6 shadow-md`}>
            <p className="text-lg opacity-80 mb-1">{card.icon} {card.label}</p>
            <p className="text-3xl font-bold">${parseFloat(card.value).toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <h3 className="text-lg font-bold text-textPrimary mb-4">Spending by Category</h3>
          {pieData.length === 0 ? (
            <p className="text-textSecondary text-center py-8">No expenses yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(val) => `$${val.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <h3 className="text-lg font-bold text-textPrimary mb-4">Daily Spending</h3>
          {barData.length === 0 ? (
            <p className="text-textSecondary text-center py-8">No daily data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => `$${val.toFixed(2)}`} />
                <ReferenceLine y={budget?.average_per_day || 0} stroke="#F5A623" strokeDasharray="5 5" label={{ value: 'Avg', fill: '#F5A623', fontSize: 11 }} />
                <Bar dataKey="amount" fill="#0F6E56" radius={[4, 4, 0, 0]}
                  label={false}
                  cell={barData.map(d => (
                    <Cell key={d.date} fill={budget?.over_budget_days?.includes(d.date) ? '#EF4444' : '#0F6E56'} />
                  ))}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Add Expense Form */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-8">
        <h3 className="text-lg font-bold text-textPrimary mb-4">Add Expense</h3>
        <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} className="px-4 py-2 border border-border rounded-lg text-sm bg-white">
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <input type="text" placeholder="Description e.g. Flight to Paris" value={newExpense.label} onChange={e => setNewExpense({...newExpense, label: e.target.value})} required
            className="px-4 py-2 border border-border rounded-lg text-sm" />
          <input type="number" placeholder="$Amount" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} required
            className="px-4 py-2 border border-border rounded-lg text-sm" />
          <DatePicker selected={newExpense.date} onChange={d => setNewExpense({...newExpense, date: d})}
            className="w-full px-4 py-2 border border-border rounded-lg text-sm" dateFormat="yyyy-MM-dd" />
          <select value={newExpense.stop} onChange={e => setNewExpense({...newExpense, stop: e.target.value})} className="px-4 py-2 border border-border rounded-lg text-sm bg-white">
            <option value="">All Stops</option>
            {trip?.stops?.map(s => <option key={s.id} value={s.id}>{s.city_details?.name}</option>)}
          </select>
          <button type="submit" className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover text-sm">Add Expense</button>
        </form>
      </div>

      {/* Expense Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-bold text-textPrimary">All Expenses <span className="text-textSecondary text-sm font-normal">({expenses.length})</span></h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                {['Date', 'Category', 'Description', 'City/Stop', 'Amount', 'Actions'].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-textSecondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {expenses.map(exp => {
                const isEditing = editingId === exp.id;
                const stop = trip?.stops?.find(s => s.id === exp.stop);
                return (
                  <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-textPrimary">{isEditing ? (
                      <input type="date" value={editData.date || exp.date} onChange={e => setEditData({...editData, date: e.target.value})} className="border border-border rounded px-2 py-1 text-xs w-full" />
                    ) : exp.date}</td>
                    <td className="p-4">
                      {isEditing ? (
                        <select value={editData.category || exp.category} onChange={e => setEditData({...editData, category: e.target.value})} className="border border-border rounded px-2 py-1 text-xs">
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-primary capitalize">{exp.category}</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-textPrimary">{isEditing ? (
                      <input type="text" value={editData.label || exp.label} onChange={e => setEditData({...editData, label: e.target.value})} className="border border-border rounded px-2 py-1 text-xs w-full" />
                    ) : exp.label}</td>
                    <td className="p-4 text-sm text-textSecondary">{stop?.city_details?.name || '—'}</td>
                    <td className="p-4 text-sm font-bold text-textPrimary">
                      {isEditing ? (
                        <input type="number" value={editData.amount || exp.amount} onChange={e => setEditData({...editData, amount: e.target.value})} className="border border-border rounded px-2 py-1 text-xs w-20" />
                      ) : `$${parseFloat(exp.amount).toFixed(2)}`}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {isEditing ? (
                          <>
                            <button onClick={() => handleEditSave(exp.id)} className="text-success hover:text-green-700 text-xs font-medium">Save</button>
                            <button onClick={() => setEditingId(null)} className="text-error hover:text-red-700 text-xs font-medium">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditingId(exp.id); setEditData({...exp}); }} className="text-textSecondary hover:text-primary">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                            </button>
                            <button onClick={() => handleDeleteExpense(exp.id)} className="text-textSecondary hover:text-error">
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
                <td colSpan="4" className="p-4 text-right text-sm font-bold text-textPrimary">Total:</td>
                <td className="p-4 text-sm font-bold text-primary">${expenses.reduce((s, e) => s + parseFloat(e.amount), 0).toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-3">Expense Report Finalized</h3>
            <p className="text-textSecondary text-sm mb-4">Expense report finalized for <strong>{trip?.name}</strong>.</p>
            <button onClick={() => setConfirmModal(false)} className="w-full py-2 bg-primary text-white rounded-lg font-medium">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
