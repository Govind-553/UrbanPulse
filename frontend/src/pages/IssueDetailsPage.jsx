import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Calendar, Flag, UserCheck, Clock, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function IssueDetailsPage() {
  const { id } = useParams();
  const issueId = id || 'UP-2024-0089';

  const [status, setStatus] = useState('in-progress');
  const [notes, setNotes] = useState('');
  
  const issueLocation = [12.9716, 77.5946]; // Bengaluru coords for dummy

  const handleUpdate = (e) => {
    e.preventDefault();
    alert(`Status updated to: ${status}\nNotes: ${notes}`);
    setNotes('');
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pt-20 px-4 sm:px-6 pb-12 w-full max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Issue Details: <span className="text-blue-700">#{issueId}</span> - Pothole on M.G. Road
        </h1>
        <Link to="/ward-management" className="text-sm border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg inline-flex items-center transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Ward Management
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Info & Timeline) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="relative">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBatja7AlenuE-9TUpN-Igh7jWoQccfT8B-ZDuAKzyiemTopQOd_G9RMihzV51jMaHLOxoo_cOSd7V9RWLo68pQVQdQZX_DnwwfigWyg42v02aCBCLXmbyD8bE_K3s73-IfK2fIE0EOhRhU3BY42w0342f9wsBkEbSvrT9-6Vv2EyZSHchpVKe5kuiOciyMdjEAh4U6ARPZ0LJ8llt-OoAtWRTd-FZatd8iI9hlh4okNVsS5VyJVHKr8prjU2kOv5gvnya5mrxbDk" 
                  alt="Issue" 
                  className="w-full h-64 object-cover" 
                />
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center shadow-lg">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" /> 24 May 2024, 08:45 AM
                </div>
                <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  Verified by AI
                </div>
             </div>
             <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center">
                   <MapPin className="w-5 h-5 text-slate-400 mr-2" />
                   Ward 12 - Koramangala
                </h3>
                <div className="text-sm text-slate-700 space-y-4">
                  <p>
                    <strong className="text-slate-900 block mb-1">Description:</strong> 
                    Severe pothole forming on the main carriageway of Mahatma Gandhi Road, near the metro station entrance. Causing traffic slowdown and safety hazard for two-wheelers.
                  </p>
                  <div className="flex bg-slate-50 p-3 rounded-lg border border-slate-100">
                     <p><strong className="text-slate-900">Reported by Citizen:</strong> Rajesh K. <span className="text-slate-400 text-xs ml-2">ID: CIT-8892</span></p>
                  </div>
                </div>
             </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Repair Timeline Activity</h2>
            
            <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pb-4">
              
              {/* Timeline Item 1 */}
              <div className="relative flex items-start">
                <div className="absolute -left-[14px] bg-blue-600 rounded-full h-7 w-7 flex items-center justify-center text-white ring-4 ring-white shadow-sm">
                  <Flag className="w-3.5 h-3.5" />
                </div>
                <div className="ml-8">
                  <p className="text-sm font-bold text-slate-900">Issue Reported</p>
                  <p className="text-xs text-slate-500 mt-1">24 May 2024, 08:50 AM</p>
                  <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-100">Citizen submitted via UrbanPulse app. Auto-verified by AI image detection.</p>
                </div>
              </div>

              {/* Timeline Item 2 */}
              <div className="relative flex items-start">
                <div className="absolute -left-[14px] bg-indigo-600 rounded-full h-7 w-7 flex items-center justify-center text-white ring-4 ring-white shadow-sm">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div className="ml-8">
                  <p className="text-sm font-bold text-slate-900">Task Assigned</p>
                  <p className="text-xs text-slate-500 mt-1">24 May 2024, 10:15 AM</p>
                  <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-100">Assigned to <strong className="text-slate-800">Roads & Infrastructure Dept.</strong> (Officer: Priya Sharma)</p>
                </div>
              </div>

              {/* Timeline Item 3 */}
              <div className="relative flex items-start">
                <div className="absolute -left-[14px] bg-orange-500 rounded-full h-7 w-7 flex items-center justify-center text-white ring-4 ring-white shadow-sm">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="ml-8">
                  <p className="text-sm font-bold text-slate-900">In Progress</p>
                  <p className="text-xs text-slate-500 mt-1">24 May 2024, 01:30 PM</p>
                  <p className="text-sm text-slate-600 mt-2 bg-orange-50 p-2 rounded border border-orange-100 text-orange-900">Repair crew dispatched. Expected completion: 25 May 2024</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column (Map & Action Form) */}
        <div className="space-y-6">
          
          {/* Map Location */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100">
               <h3 className="font-bold text-slate-800 text-sm">Incident Location</h3>
            </div>
            <div className="h-48 w-full bg-slate-100 relative z-0">
               <MapContainer center={issueLocation} zoom={15} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  <Marker position={issueLocation}>
                    <Popup>Pothole Location</Popup>
                  </Marker>
               </MapContainer>
            </div>
          </div>

          {/* Action Panel Form */}
          <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-700">
            <div className="p-5 border-b border-slate-700">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Action Panel</h3>
              <h2 className="text-lg font-bold text-white">Update Status & Notes</h2>
            </div>
            
            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="status">Current Status</label>
                <select 
                  id="status" 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
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
                <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="notes">Internal Notes</label>
                <textarea 
                  id="notes" 
                  rows="4" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 text-sm" 
                  placeholder="Add technical details, crew updates, or delays..." 
                />
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm text-sm">
                  Submit Update
                </button>
                <button type="button" className="w-full bg-transparent border border-slate-600 hover:bg-slate-700 text-slate-300 font-medium py-2 rounded-lg transition-colors text-sm">
                  Escalate to Supervisor
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
