import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Calendar, Flag, Clock, MapPin, CheckCircle, AlertCircle, User } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { reportService } from '../services/api';

// Fix for default marker icon
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const statusStyles = {
  'reported': 'bg-red-100 text-red-700 border-red-200',
  'assigned': 'bg-orange-100 text-orange-700 border-orange-200',
  'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
  'resolved': 'bg-green-100 text-green-700 border-green-200',
  'closed': 'bg-slate-200 text-slate-700 border-slate-300'
};

export default function IssueDetailsPage() {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const res = await reportService.getIssueById(id);
        if (res.success) {
          setIssue(res.data);
          setNewStatus(res.data.status);
        }
      } catch (err) {
        setError('Could not load issue details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssue();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await reportService.updateIssue(id, { status: newStatus, notes });
      if (res.success) {
        setIssue(res.data);
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
        setNotes('');
      }
    } catch (err) {
      alert('Failed to update the issue. Check your permissions.');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-slate-50 min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="flex-1 bg-slate-50 min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-slate-600">{error || 'Issue not found.'}</p>
          <Link to="/ward-management" className="mt-4 inline-block text-blue-600 hover:underline">← Back to Ward Management</Link>
        </div>
      </div>
    );
  }

  const issueLocation = issue.latitude && issue.longitude ? [issue.latitude, issue.longitude] : null;

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pt-20 px-4 sm:px-6 pb-12 w-full max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Issue Details: <span className="text-blue-700">#{id.substring(id.length - 8).toUpperCase()}</span> — {issue.title}
        </h1>
        <Link to="/ward-management" className="text-sm border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg inline-flex items-center transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Ward Management
        </Link>
      </div>

      {updateSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium">
          <CheckCircle className="w-4 h-4" /> Status updated successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Info & Photos) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Photos gallery */}
            {issue.images && issue.images.length > 0 ? (
              <div className={`grid ${issue.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-1`}>
                {issue.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={`http://localhost:5000/${img.replace(/\\/g, '/')}`}
                    alt={`Issue photo ${idx + 1}`}
                    className="w-full h-56 object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ))}
              </div>
            ) : (
              <div className="h-40 bg-slate-100 flex items-center justify-center text-slate-400 text-sm">No photos attached</div>
            )}

            <div className="p-6">
              <div className="flex flex-wrap justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{issue.title}</h3>
                  <p className="text-sm text-slate-500 capitalize">{issue.category?.replace('-', ' ')}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusStyles[issue.status] || 'bg-slate-100 text-slate-800'}`}>
                  {issue.status?.replace('-', ' ')}
                </span>
              </div>

              <p className="text-sm text-slate-700 mb-4">{issue.description}</p>

              <div className="space-y-2 text-sm border-t border-slate-100 pt-4">
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                  <span>{issue.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Reported: {new Date(issue.createdAt).toLocaleString()}</span>
                </div>
                {issue.reportedBy && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>By: <strong>{issue.reportedBy.name}</strong> ({issue.reportedBy.email})</span>
                  </div>
                )}
                {issue.ward && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Flag className="w-4 h-4 text-slate-400" />
                    <span>Ward: {issue.ward}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Map & Action Form) */}
        <div className="space-y-6">
          
          {/* Map Location */}
          {issueLocation && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" /> Incident Location
                </h3>
              </div>
              <div className="h-[220px] w-full z-0">
                <MapContainer center={issueLocation} zoom={15} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  <Marker position={issueLocation}>
                    <Popup>{issue.title}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}

          {/* Action Panel Form */}
          <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-700">
            <div className="p-5 border-b border-slate-700">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Action Panel</h3>
              <h2 className="text-lg font-bold text-white">Update Status</h2>
            </div>
            
            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">New Status</label>
                <select 
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 text-sm"
                >
                  <option value="reported">Reported</option>
                  <option value="assigned">Assigned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Internal Notes (optional)</label>
                <textarea 
                  rows="3" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 text-sm" 
                  placeholder="Add crew updates, delays, or technical details..." 
                />
              </div>

              <div className="pt-1 flex flex-col gap-3">
                <button 
                  type="submit" 
                  disabled={updating}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm text-sm"
                >
                  {updating ? 'Updating...' : 'Submit Update'}
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
