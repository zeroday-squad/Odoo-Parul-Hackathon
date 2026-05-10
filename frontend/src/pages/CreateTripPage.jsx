import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import CityCard from '../components/CityCard';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function CreateTripPage() {
  const [formData, setFormData] = useState({
    name: '',
    short_name: '',
    description: '',
    start_date: null,
    end_date: null,
    is_public: false,
    cover_photo: null
  });
  const [cities, setCities] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/cities/?ordering=-popularity')
      .then(res => setCities(res.data.slice(0, 6)))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      setFormData({ ...formData, cover_photo: file });
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result);
        reader.readAsDataURL(file);
      }
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const toggleCitySelection = (city) => {
    if (selectedCities.find(c => c.id === city.id)) {
      setSelectedCities(selectedCities.filter(c => c.id !== city.id));
    } else {
      setSelectedCities([...selectedCities, city]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.start_date || !formData.end_date) {
      toast.error('Please fill required fields');
      return;
    }
    if (formData.end_date < formData.start_date) {
      toast.error('End date must be after start date');
      return;
    }

    setIsLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('short_name', formData.short_name);
      data.append('description', formData.description);
      data.append('start_date', formData.start_date.toISOString().split('T')[0]);
      data.append('end_date', formData.end_date.toISOString().split('T')[0]);
      data.append('is_public', formData.is_public);
      if (formData.cover_photo) {
        data.append('cover_photo', formData.cover_photo);
      }

      const res = await api.post('/trips/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newTripId = res.data.id;

      // Add pre-selected stops
      for (const city of selectedCities) {
        await api.post(`/trips/${newTripId}/stops/`, {
          city: city.id, // Changed to `city` instead of `city_id` based on DRF serialization unless overridden
          arrival_date: formData.start_date.toISOString().split('T')[0],
          departure_date: formData.end_date.toISOString().split('T')[0],
          budget: 0
        });
      }

      toast.success('Trip created!');
      navigate(`/trips/${newTripId}/builder`);
    } catch (err) {
      toast.error('Failed to create trip');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Plan a New Trip" subtitle="Tell us about your journey" />
      
      <div className="max-w-3xl mx-auto bg-card p-6 md:p-8 rounded-xl shadow-sm border border-border">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-textPrimary mb-1">Trip Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Summer Europe Adventure"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-textPrimary mb-1">Short Name</label>
            <input type="text" name="short_name" value={formData.short_name} onChange={handleChange} placeholder="e.g. Europe Trip"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            <p className="text-xs text-textSecondary mt-1">Used as a short display label</p>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-textPrimary mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Describe your trip..."
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
          </div>
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <div className="flex-1">
              <label className="block text-xs font-medium uppercase tracking-wide text-textPrimary mb-1">Start Date *</label>
              <DatePicker 
                selected={formData.start_date} 
                onChange={(date) => setFormData({...formData, start_date: date})} 
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                dateFormat="yyyy-MM-dd"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium uppercase tracking-wide text-textPrimary mb-1">End Date *</label>
              <DatePicker 
                selected={formData.end_date} 
                onChange={(date) => setFormData({...formData, end_date: date})} 
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                dateFormat="yyyy-MM-dd"
                minDate={formData.start_date}
                required
              />
            </div>
          </div>
          <div className="flex items-center space-x-3 py-2">
            <input type="checkbox" id="is_public" name="is_public" checked={formData.is_public} onChange={handleChange} 
              className="w-4 h-4 text-primary rounded focus:ring-primary" />
            <label htmlFor="is_public" className="text-sm font-medium text-textPrimary">Make this trip public so others can discover it</label>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-textPrimary mb-1">Cover Photo</label>
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer bg-white py-2 px-4 border border-border rounded-lg shadow-sm text-sm font-medium text-textPrimary hover:bg-gray-50 focus-within:ring-2 focus-within:ring-primary">
                <span>Upload Cover Photo</span>
                <input type="file" name="cover_photo" onChange={handleChange} className="sr-only" accept="image/*" />
              </label>
              {photoPreview && <img src={photoPreview} alt="Preview" className="h-12 w-12 object-cover rounded-lg" />}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-border">
            <h3 className="text-lg font-bold text-textPrimary mb-4">Suggested Destinations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cities.map(city => {
                const isSelected = selectedCities.find(c => c.id === city.id);
                return (
                  <div key={city.id} className="relative group">
                    <CityCard city={city} />
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleCitySelection(city); }}
                      className={`absolute top-2 left-2 p-1 rounded-full shadow-sm ${isSelected ? 'bg-success text-white' : 'bg-white text-gray-500 hover:text-primary'}`}
                    >
                      {isSelected ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                      )}
                    </button>
                    {isSelected && <div className="absolute inset-0 bg-success opacity-10 rounded-xl pointer-events-none"></div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-bold shadow-md transition-colors disabled:opacity-70 flex justify-center">
              {isLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
