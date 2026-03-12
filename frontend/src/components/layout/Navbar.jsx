import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Map, FileText, Bell, User, LogOut, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/api';
import { io } from 'socket.io-client';

export default function Navbar() {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const isDashboard = ['/dashboard', '/ward-management', '/issue'].some(path => location.pathname.startsWith(path));

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    let socket;
    
    if (isAuthenticated && user) {
      // Fetch initial log of notifications
      notificationService.getNotifications().then(res => {
        if (res.success) setNotifications(res.data);
      }).catch(err => console.error("Error fetching notifications:", err));

      // Init socket
      socket = io('http://localhost:5000');
      
      socket.on('connect', () => {
        socket.emit('join', user.id);
      });

      socket.on('new_notification', (data) => {
        setNotifications(prev => [data.notification, ...prev]);
      });
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch(err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  return (
    <header className={`${isDashboard ? 'bg-white border-b border-slate-200' : 'bg-brand-dark text-white'} h-16 shrink-0 fixed w-full top-0 z-[999] transition-colors duration-300`}>
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
            <Link to="/my-reports" className="text-slate-300 hover:text-white transition-colors">My Reports</Link>
            <Link to="/map" className="text-slate-300 hover:text-white transition-colors">Risk Map</Link>
            <Link to="/completed-projects" className="text-slate-300 hover:text-white transition-colors">Completed Projects</Link>
            {(!isAuthenticated || user?.role === 'authority') && (
              <Link to="/dashboard" className="text-slate-300 hover:text-white transition-colors">Municipal Dashboard</Link>
            )}
          </nav>
        ) : (
          <nav className="hidden md:flex h-full items-center space-x-1">
            <Link to="/dashboard" className={`px-3 h-full flex items-center text-sm font-medium transition-colors ${location.pathname === '/dashboard' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:text-slate-900'}`}>Dashboard</Link>
            <Link to="/ward-management" className={`px-3 h-full flex items-center text-sm font-medium transition-colors ${location.pathname === '/ward-management' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:text-slate-900'}`}>Ward Management</Link>
          </nav>
        )}
        
        {/* Right Actions */}
        <div className="flex items-center space-x-5">
           {!isAuthenticated && !isDashboard ? (
             <div className="flex gap-3">
               <Link to="/login" className="hidden md:flex text-sm font-semibold text-slate-300 hover:text-white items-center">
                 Log In
               </Link>
               <Link to="/register" className="hidden md:flex bg-brand-light text-brand-dark px-6 py-2 rounded-full text-sm font-semibold hover:bg-teal-300 transition-colors shadow-lg">
                 Sign Up
               </Link>
             </div>
           ) : (
             <>
               {!isDashboard && (
                 <div className="relative" ref={dropdownRef}>
                   <button 
                     onClick={() => setShowDropdown(!showDropdown)}
                     className={`relative p-2 rounded-full transition-colors ${isDashboard ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-brand-light/20'}`}
                   >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 block w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                      )}
                   </button>
                   
                   {showDropdown && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-[1000]">
                        <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                          <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                          {unreadCount > 0 && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{unreadCount} New</span>}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-sm text-slate-500">No notifications yet.</div>
                          ) : (
                            <div className="divide-y divide-slate-100">
                              {notifications.map(notif => (
                                <div 
                                  key={notif._id} 
                                  onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                                  className={`p-4 transition-colors cursor-pointer ${notif.isRead ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50'}`}
                                >
                                  <p className={`text-sm ${notif.isRead ? 'text-slate-600' : 'text-slate-800 font-medium'}`}>{notif.message}</p>
                                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{new Date(notif.createdAt).toLocaleDateString()}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                   )}
                 </div>
               )}

               <div className="flex items-center space-x-3 select-none">
                  <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-slate-200">
                      <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="hidden md:flex flex-col">
                      <span className="text-[11px] text-slate-400 font-medium tracking-wide capitalize">{user?.role}</span>
                      <div className="flex items-center text-sm font-semibold text-slate-800">
                          <span className={isDashboard ? 'text-slate-900' : 'text-slate-200'}>{user?.name}</span>
                      </div>
                  </div>
                  <button onClick={logout} className="ml-2 text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                    <LogOut className="w-5 h-5" />
                  </button>
               </div>
             </>
           )}
        </div>
      </div>
    </header>
  );
}
