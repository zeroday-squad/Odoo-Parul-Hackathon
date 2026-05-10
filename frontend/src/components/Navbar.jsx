import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      await api.post('/auth/logout/', { refresh: refreshToken });
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'My Trips', path: '/trips' },
    { name: 'Community', path: '/community' },
    { name: 'Profile', path: '/profile' },
  ];

  const exploreLinks = [
    { name: '🏙️ Search Cities', path: '/search/cities', desc: 'Browse destinations' },
    { name: '🎯 Search Activities', path: '/search/activities', desc: 'Find things to do' },
  ];

  const isActive = (path) => location.pathname.startsWith(path);
  const isExploreActive = location.pathname.startsWith('/search');

  return (
    <nav className="bg-white border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16z"/>
              </svg>
              <span className="text-xl font-bold text-primary">Traveloop</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden sm:flex sm:items-center sm:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'border-primary text-primary'
                    : 'border-transparent text-textSecondary hover:text-textPrimary hover:border-gray-300'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Explore dropdown */}
            <div className="relative" onMouseLeave={() => setExploreOpen(false)}>
              <button
                onMouseEnter={() => setExploreOpen(true)}
                onClick={() => setExploreOpen(o => !o)}
                className={`inline-flex items-center gap-1 px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isExploreActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-textSecondary hover:text-textPrimary hover:border-gray-300'
                }`}
              >
                Explore
                <svg
                  className={`w-4 h-4 transition-transform ${exploreOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {exploreOpen && (
                <div className="absolute top-full right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-border py-1 z-50">
                  {exploreLinks.map(link => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setExploreOpen(false)}
                      className="flex flex-col px-4 py-3 hover:bg-teal-50 transition-colors"
                    >
                      <span className="text-sm font-semibold text-textPrimary">{link.name}</span>
                      <span className="text-xs text-textSecondary">{link.desc}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="text-textSecondary hover:text-error text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(o => !o)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden border-t border-border bg-white shadow-lg">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-teal-50 border-primary text-primary'
                    : 'border-transparent text-textSecondary hover:bg-gray-50 hover:border-gray-300 hover:text-textPrimary'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <p className="pl-3 pr-4 pt-3 pb-1 text-xs font-bold uppercase tracking-widest text-gray-400">Explore</p>
            {exploreLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block pl-6 pr-4 py-2 border-l-4 text-sm font-medium ${
                  isActive(link.path)
                    ? 'bg-teal-50 border-primary text-primary'
                    : 'border-transparent text-textSecondary hover:bg-gray-50 hover:border-gray-300 hover:text-textPrimary'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <button
              onClick={() => { setIsOpen(false); handleLogout(); }}
              className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-textSecondary hover:bg-red-50 hover:border-error hover:text-error"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
