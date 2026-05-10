import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password || formData.password.length < 8) newErrors.password = 'Password minimum 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords must match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register/', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone
      });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Account created! Welcome to Traveloop');
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data);
        // Show the first error in a toast if it's a general detail error
        if (err.response.data.detail) toast.error(err.response.data.detail);
      } else {
        toast.error('Registration failed. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Helper to get error message (handles both string and array)
  const getError = (field) => {
    const error = errors[field];
    if (!error) return null;
    return Array.isArray(error) ? error[0] : error;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <div className="hidden md:flex md:w-1/2 bg-primary flex-col justify-center items-center text-white p-12">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16z"/>
            </svg>
            <h1 className="text-4xl font-bold">Traveloop</h1>
          </div>
          <p className="text-xl font-medium text-teal-100">Start planning your adventures</p>
        </div>
      </div>
      <div className="flex-1 flex justify-center items-center p-8 overflow-y-auto">
        <div className="w-full max-w-lg bg-card p-8 rounded-2xl shadow-sm border border-border my-8">
          <h2 className="text-2xl font-bold text-primary mb-2">Create Account</h2>
          <p className="text-textSecondary mb-8">Join the community and explore</p>
          
          {errors.non_field_errors && (
            <div className="bg-red-50 border border-red-200 text-error px-4 py-3 rounded-lg mb-6 text-sm">
              {errors.non_field_errors[0]}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-xs font-medium uppercase tracking-wide text-textPrimary mb-1">First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${getError('first_name') || errors.firstName ? 'border-error' : 'border-border'}`} />
                {(getError('first_name') || errors.firstName) && (
                  <p className="text-error text-xs mt-1">{getError('first_name') || errors.firstName}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium uppercase tracking-wide text-textPrimary mb-1">Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${getError('last_name') || errors.lastName ? 'border-error' : 'border-border'}`} />
                {(getError('last_name') || errors.lastName) && (
                  <p className="text-error text-xs mt-1">{getError('last_name') || errors.lastName}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-textPrimary mb-1">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${getError('email') || errors.email ? 'border-error' : 'border-border'}`} />
              {(getError('email') || errors.email) && (
                <p className="text-error text-xs mt-1">{getError('email') || errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-textPrimary mb-1">Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${getError('phone_number') ? 'border-error' : 'border-border'}`} />
              {getError('phone_number') && <p className="text-error text-xs mt-1">{getError('phone_number')}</p>}
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-xs font-medium uppercase tracking-wide text-textPrimary mb-1">Password</label>
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${getError('password') || errors.password ? 'border-error' : 'border-border'}`} />
                {(getError('password') || errors.password) && (
                  <p className="text-error text-xs mt-1">{getError('password') || errors.password}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium uppercase tracking-wide text-textPrimary mb-1">Confirm Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.confirmPassword ? 'border-error' : 'border-border'}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-error text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary-hover text-white py-2 mt-4 rounded-lg font-medium transition-colors disabled:opacity-70 flex justify-center">
              {isLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Create Account'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-textSecondary">
              Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
