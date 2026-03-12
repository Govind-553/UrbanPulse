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
        <h1 className="text-2xl font-bold text-slate-900">Ward Management Panel</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Manage and assign tasks for reported civic issues.</p>
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
              placeholder="Search complaints, issue types, or location..." 
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {['Status', 'Date Range', 'Issue Type', 'Sort By'].map((filter) => (
              <button key={filter} className="flex items-center space-x-2 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors bg-white shadow-sm">
                <span>{filter}</span>
                <Filter className="w-3 h-3 text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider w-1/4">Issue Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">Photo</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider w-1/5">Reported Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-slate-500">Loading issues...</td>
                </tr>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-slate-500">No issues found.</td>
                </tr>
              ) : (
                issues.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <Link to={`/issue/${row._id}`} className="block">
                        <span className="text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors">{row.title || row.category}</span>
                        <p className="text-xs text-slate-500 mt-1">{row.ward}</p>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.images && row.images.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {row.images.slice(0, 2).map((img, idx) => (
                            <img
                              key={idx}
                              src={`http://localhost:5000/${img.replace(/\\/g, '/')}`}
                              alt={`Photo ${idx + 1}`}
                              className="h-14 w-20 object-cover rounded-md border border-slate-200 shadow-sm bg-slate-100"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="h-14 w-20 bg-slate-200 rounded-md flex items-center justify-center text-xs text-slate-500">No Image</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyles[row.status] || 'bg-slate-100 text-slate-800'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                       <div className="flex space-x-2">
                          <button 
                            onClick={() => assignTask(row._id)}
                            disabled={row.status !== 'reported'}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg shadow-sm transition-colors text-xs font-medium"
                          >
                            {row.status === 'assigned' ? 'Assigned ✓' : 'Assign Task'}
                          </button>
                          <Link to={`/issue/${row._id}`} className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg shadow-sm transition-colors text-xs font-medium">Update Status</Link>
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
          <div className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">1-5</span> of <span className="font-semibold text-slate-900">50</span> records
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded border border-blue-600 bg-blue-50 text-blue-700 font-semibold text-sm">1</button>
            <button className="w-8 h-8 rounded border border-transparent hover:bg-slate-100 text-slate-600 font-medium text-sm transition-colors">2</button>
            <button className="w-8 h-8 rounded border border-transparent hover:bg-slate-100 text-slate-600 font-medium text-sm transition-colors">3</button>
            <span className="px-2 text-slate-400">...</span>
            <button className="p-2 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
