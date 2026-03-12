import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { reportService } from '../services/api';

const dummyData = [
  { id: 'UP-001', type: 'Broken Streetlight', loc: '4th Cross Road', date: '18 Oct 2023, 09:30 AM', status: 'Pending', img: 'https://placehold.co/200x120/e2e8f0/475569?text=Streetlight' },
  { id: 'UP-002', type: 'Garbage Overflow', loc: 'Park Entrance', date: '17 Oct 2023, 14:15 PM', status: 'Assigned', img: 'https://placehold.co/200x120/e2e8f0/475569?text=Garbage' },
  { id: 'UP-003', type: 'Pothole on Main Road', loc: 'Near School', date: '16 Oct 2023, 10:00 AM', status: 'In Progress', img: 'https://placehold.co/200x120/e2e8f0/475569?text=Pothole' },
  { id: 'UP-004', type: 'Water Leakage', loc: 'Pipeline Junction', date: '15 Oct 2023, 08:45 AM', status: 'Resolved', img: 'https://placehold.co/200x120/e2e8f0/475569?text=Water+Leak' },
  { id: 'UP-005', type: 'Illegal Parking', loc: 'Market Area', date: '14 Oct 2023, 11:20 AM', status: 'Pending', img: 'https://placehold.co/200x120/e2e8f0/475569?text=Parking' },
];

const statusStyles = {
  'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Assigned': 'bg-orange-100 text-orange-800 border-orange-200',
  'In Progress': 'bg-green-100 text-green-800 border-green-200',
  'Resolved': 'bg-slate-200 text-slate-800 border-slate-300'
};

export default function WardManagementPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const assignTask = async (issueId) => {
    try {
      const res = await reportService.updateIssue(issueId, { status: 'assigned' });
      if (res.success) {
        setIssues(prev => prev.map(i => i._id === issueId ? { ...i, status: 'assigned' } : i));
      }
    } catch (err) {
      alert('Failed to assign task. Check your permissions.');
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await reportService.getIssues();
        setIssues(response.data || []);
      } catch (error) {
        console.error("Failed to fetch issues", error);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pt-20 px-4 sm:px-6 lg:px-8 pb-12 w-full max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Ward Management Panel</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Manage and assign tasks for reported civic issues.</p>
      </div>

      {/* Main Panel Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row gap-4 justify-between items-center bg-white">
          <div className="relative w-full lg:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input 
              type="text" 
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-shadow" 
              placeholder="Search complaints..." 
            />
          </div>

          <div className="flex overflow-x-auto lg:overflow-visible items-center gap-2 w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide">
            {['Status', 'Type', 'Ward', 'Date'].map((filter) => (
              <button key={filter} className="flex-shrink-0 flex items-center space-x-2 px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors bg-white shadow-sm whitespace-nowrap">
                <span>{filter}</span>
                <Filter className="w-3 h-3 text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Table Wrapper for Horizontal Scroll */}
        <div className="overflow-x-auto relative">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50 font-bold">
              <tr>
                <th className="px-6 py-4 text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider min-w-[200px]">Issue Details</th>
                <th className="px-6 py-4 text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider min-w-[120px]">Photo Proof</th>
                <th className="px-6 py-4 text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">Reported</th>
                <th className="px-6 py-4 text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-sm text-slate-500">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-4 w-48 bg-slate-200 rounded mb-2"></div>
                      <p>Loading city issues...</p>
                    </div>
                  </td>
                </tr>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-sm text-slate-500">No issues found.</td>
                </tr>
              ) : (
                issues.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <Link to={`/issue/${row._id}`} className="block">
                        <span className="text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors line-clamp-1">{row.title || row.category}</span>
                        <div className="flex items-center gap-2 mt-1">
                           <p className="text-[10px] text-slate-400 font-semibold uppercase">{row.ward}</p>
                           <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                           <p className="text-[10px] text-slate-500 capitalize">{row.category?.replace('-', ' ')}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.images && row.images.length > 0 ? (
                        <div className="flex -space-x-4">
                          {row.images.slice(0, 2).map((img, idx) => (
                            <img
                              key={idx}
                              src={`http://localhost:5000/${img.replace(/\\/g, '/')}`}
                              alt={`Photo ${idx + 1}`}
                              className="h-10 w-14 object-cover rounded border-2 border-white shadow-sm bg-slate-100"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ))}
                          {row.images.length > 2 && (
                             <div className="h-10 w-10 rounded bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">+{row.images.length - 2}</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-[10px] italic text-slate-400">No Image</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-xs font-medium text-slate-600">{new Date(row.createdAt).toLocaleDateString()}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyles[row.status] || 'bg-slate-100 text-slate-800'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                       <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => assignTask(row._id)}
                            disabled={row.status !== 'reported'}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg shadow-sm transition-colors text-[10px] font-bold uppercase"
                          >
                            {row.status === 'assigned' ? 'Assigned' : 'Assign'}
                          </button>
                          <Link to={`/issue/${row._id}`} className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 p-1.5 rounded-lg transition-colors">
                             <MoreVertical className="w-4 h-4" />
                          </Link>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="text-slate-900">1-5</span> of <span className="text-slate-900">{issues.length}</span> issues
          </div>
          <div className="flex items-center space-x-1">
            <button className="p-1.5 rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-7 h-7 rounded border border-blue-600 bg-blue-50 text-blue-700 font-bold text-xs transition-colors">1</button>
            <button className="w-7 h-7 rounded border border-transparent hover:bg-slate-100 text-slate-500 font-semibold text-xs transition-colors">2</button>
            <button className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
