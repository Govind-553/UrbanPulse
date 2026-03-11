import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Map, FileText, Bell, User } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isDashboard = ['/dashboard', '/ward-management', '/issue'].some(path => location.pathname.startsWith(path));

  return (
    <header className={`${isDashboard ? 'bg-white border-b border-slate-200' : 'bg-brand-dark text-white'} h-16 shrink-0 fixed w-full top-0 z-50 transition-colors duration-300`}>
      <div className="flex items-center justify-between h-full px-6 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 mr-10">
          <div className="flex items-end space-x-[3px] h-6 text-blue-500">
            <div className="w-[5px] h-3 bg-blue-400 rounded-sm"></div>
            <div className="w-[5px] h-4.5 bg-blue-500 rounded-sm" style={{ height: '18px' }}></div>
            <div className="w-[5px] h-6 bg-blue-600 rounded-sm"></div>
          </div>
          <span className={`text-xl font-bold tracking-tight ${isDashboard ? 'text-slate-900' : 'text-white'} ml-1`}>
            UrbanPulse
          </span>
        </Link>
        
        {/* Main Nav (Desktop) */}
        {!isDashboard ? (
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link to="/" className="text-white hover:text-brand-light border-b-2 border-brand-light pb-1">Home</Link>
            <Link to="/report" className="text-slate-300 hover:text-white transition-colors">Report Issue</Link>
            <Link to="/map" className="text-slate-300 hover:text-white transition-colors">Risk Map</Link>
            <Link to="/dashboard" className="text-slate-300 hover:text-white transition-colors">Municipal Dashboard</Link>
          </nav>
        ) : (
          <nav className="hidden md:flex h-full items-center space-x-1">
            <Link to="/dashboard" className={`px-3 h-full flex items-center text-sm font-medium transition-colors ${location.pathname === '/dashboard' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:text-slate-900'}`}>Dashboard</Link>
            <Link to="/ward-management" className={`px-3 h-full flex items-center text-sm font-medium transition-colors ${location.pathname === '/ward-management' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:text-slate-900'}`}>Ward Management</Link>
            <Link to="/map" className={`px-3 h-full flex items-center text-sm font-medium transition-colors text-slate-600 hover:text-slate-900`}>Live Map</Link>
          </nav>
        )}
        
        {/* Right Actions */}
        <div className="flex items-center space-x-5">
           {!isDashboard ? (
             <Link to="/report" className="hidden md:flex bg-brand-light text-brand-dark px-6 py-2 rounded-full text-sm font-semibold hover:bg-teal-300 transition-colors shadow-lg">
               Report Issue
             </Link>
           ) : (
             <>
               <button className="relative p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-[3px] right-[4px] block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
               </button>
               <div className="flex items-center space-x-3 cursor-pointer select-none">
                  <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-slate-200">
                      <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="h-full w-full object-cover" />
                  </div>
                  <div className="hidden md:flex flex-col">
                      <span className="text-[11px] text-slate-500 font-medium tracking-wide">Ward Official</span>
                      <div className="flex items-center text-sm font-semibold text-slate-900">
                          <span>R. Sharma</span>
                      </div>
                  </div>
               </div>
             </>
           )}
        </div>
      </div>
    </header>
  );
}
