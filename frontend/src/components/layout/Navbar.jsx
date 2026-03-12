import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Map, FileText, Bell, User, LogOut, Check, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/api';
import { io } from 'socket.io-client';

export default function Navbar() {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const isDashboard = ['/dashboard', '/ward-management', '/issue'].some(path => location.pathname.startsWith(path));

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch(err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const navLinks = !isDashboard ? [
    { to: "/", label: "Home" },
    { to: "/report", label: "Report Issue" },
    { to: "/my-reports", label: "My Reports" },
    { to: "/map", label: "Risk Map" },
    { to: "/completed-projects", label: "Completed Projects" },
    { to: "/dashboard", label: "Municipal Dashboard", authorityOnly: true }
  ] : [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/ward-management", label: "Ward Management" }
  ];

  return (
    <header className={`${isDashboard ? 'bg-white border-b border-slate-200' : 'bg-brand-dark text-white'} h-16 shrink-0 fixed w-full top-0 z-[999] transition-colors duration-300`}>
      <div className="flex items-center justify-between h-full px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 mr-4 md:mr-10">
          <div className="flex items-end space-x-[3px] h-6 text-blue-500">
            <div className="w-[5px] h-3 bg-blue-400 rounded-sm"></div>
            <div className="w-[5px] h-4.5 bg-blue-500 rounded-sm" style={{ height: '18px' }}></div>
            <div className="w-[5px] h-6 bg-blue-600 rounded-sm"></div>
          </div>
          <span className={`text-xl font-bold tracking-tight ${isDashboard ? 'text-slate-900' : 'text-white'} ml-1 whitespace-nowrap`}>
            UrbanPulse
          </span>
        </Link>
        
        {/* Main Nav (Desktop) */}
        <nav className="hidden md:flex items-center space-x-1 h-full">
          {navLinks.map((link) => {
            if (link.authorityOnly && isAuthenticated && user?.role !== 'authority' && user?.role !== 'admin') return null;
            
            const isActive = location.pathname === link.to;
            return (
              <Link 
                key={link.to}
                to={link.to} 
                className={`px-3 h-full flex items-center text-sm font-medium transition-colors ${
                  isDashboard 
                    ? (isActive ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:text-slate-900')
                    : (isActive ? 'text-brand-light border-b-2 border-brand-light' : 'text-slate-300 hover:text-white')
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        
        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-5">
           {!isAuthenticated && !isDashboard ? (
             <div className="flex gap-2 sm:gap-3">
               <Link to="/login" className="hidden sm:flex text-sm font-semibold text-slate-300 hover:text-white items-center px-2">
                 Log In
               </Link>
               <Link to="/register" className="bg-brand-light text-brand-dark px-4 sm:px-6 py-2 rounded-full text-sm font-semibold hover:bg-teal-300 transition-colors shadow-lg">
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
                      <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-[1000]">
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

               <div className="flex items-center space-x-2 sm:space-x-3 select-none">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-slate-200">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <div className="hidden sm:flex flex-col">
                      <span className="text-[10px] text-slate-400 font-medium tracking-wide capitalize">{user?.role}</span>
                      <div className="flex items-center text-sm font-semibold text-slate-800">
                          <span className={isDashboard ? 'text-slate-900' : 'text-slate-200'}>{user?.name?.split(' ')[0]}</span>
                      </div>
                  </div>
                  <button onClick={logout} className="p-1 text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                    <LogOut className="w-5 h-5" />
                  </button>
               </div>
             </>
           )}

           {/* Mobile Menu Toggle */}
           <button 
             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
             className={`md:hidden p-2 rounded-lg transition-colors ${isDashboard ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-brand-light/20'}`}
           >
             {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
           </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-slate-900/50 backdrop-blur-sm z-[998]" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className={`absolute right-4 top-4 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transform transition-transform duration-300 ease-out`}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{user?.name || 'Guest Citizen'}</p>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{user?.role || 'Visitor'}</p>
              </div>
            </div>
            
            <nav className="p-2">
              {navLinks.map((link) => {
                if (link.authorityOnly && isAuthenticated && user?.role !== 'authority' && user?.role !== 'admin') return null;
                const isActive = location.pathname === link.to;
                return (
                  <Link 
                    key={link.to}
                    to={link.to}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {!isAuthenticated && (
              <div className="p-4 mt-auto border-t border-slate-100 flex flex-col gap-2">
                <Link to="/login" className="w-full py-2 text-center text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg">Log In</Link>
                <Link to="/register" className="w-full py-2 text-center text-sm font-bold bg-blue-600 text-white rounded-lg shadow-md">Create Account</Link>
              </div>
            )}
            
            {isAuthenticated && (
              <div className="p-4 mt-auto border-t border-slate-100">
                <button onClick={logout} className="w-full py-2 flex items-center justify-center space-x-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
