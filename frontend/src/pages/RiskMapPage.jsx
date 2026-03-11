import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Layers, Droplet, CloudRain, AlertTriangle } from 'lucide-react';

// Custom icons based on risk
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const icons = {
  safe: createCustomIcon('#22c55e'),     // Green
  moderate: createCustomIcon('#eab308'), // Yellow
  critical: createCustomIcon('#ef4444')  // Red
};

export default function RiskMapPage() {
  const [showMonsoonLayer, setShowMonsoonLayer] = useState(false);
  const [filterType, setFilterType] = useState('All');

  // Mumbai Coordinates
  const center = [19.0760, 72.8777];

  const dummyIssues = [
    { id: 1, pos: [19.040, 72.840], type: 'Pothole', status: 'safe', label: 'Fixed Pothole' },
    { id: 2, pos: [19.055, 72.841], type: 'Waterlogging', status: 'moderate', label: 'Moderate Drainage Block' },
    { id: 3, pos: [19.065, 72.845], type: 'Pothole', status: 'critical', label: 'Severe Road Cave-in' },
    { id: 4, pos: [19.065, 72.868], type: 'Broken Streetlight', status: 'critical', label: 'Dark intersection' },
    { id: 5, pos: [19.070, 72.868], type: 'Garbage Overflow', status: 'safe', label: 'Cleared Garbage' },
    { id: 6, pos: [19.045, 72.860], type: 'Waterlogging', status: 'moderate', label: 'Slow drainage' },
  ];

  const filteredIssues = filterType === 'All' 
    ? dummyIssues 
    : dummyIssues.filter(i => i.type === filterType);

  return (
    <div className="flex flex-col h-screen pt-16">
      
      {/* Header Panel */}
      <div className="bg-white px-6 py-4 shrink-0 border-b border-slate-200 shadow-sm z-10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Infrastructure Risk & Monsoon Map</h1>
          <p className="text-sm text-slate-500 font-medium">Real-time data for smarter city management.</p>
        </div>
        
        {/* Toggle Monsoon Layer */}
        <button 
          onClick={() => setShowMonsoonLayer(!showMonsoonLayer)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            showMonsoonLayer ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <CloudRain className="w-5 h-5" />
          <span>Monsoon Risk Layer</span>
        </button>
      </div>

      <div className="flex-1 relative flex">
        
        {/* Sidebar Controls */}
        <div className="absolute left-6 top-6 z-[400] w-72 bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center">
            <Layers className="w-4 h-4 mr-2 text-blue-600" /> Filters
          </h3>
          
          <div className="mb-5">
            <p className="text-sm font-semibold text-slate-700 mb-2">Issue Type</p>
            <select 
              value={filterType} 
              onChange={e => setFilterType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            >
              <option value="All">All Issues</option>
              <option value="Pothole">Pothole</option>
              <option value="Waterlogging">Waterlogging</option>
              <option value="Drainage Blockage">Drainage Blockage</option>
              <option value="Broken Streetlight">Broken Streetlight</option>
              <option value="Garbage Overflow">Garbage Overflow</option>
            </select>
          </div>

          <div className="mb-5">
            <p className="text-sm font-semibold text-slate-700 mb-2">Legend</p>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div> Critical Risk</div>
              <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div> Moderate Risk</div>
              <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div> Safe / Resolved</div>
            </div>
          </div>

          {showMonsoonLayer && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 flex items-start">
               <AlertTriangle className="w-5 h-5 text-blue-600 mr-2 shrink-0 mt-0.5" />
               <p>Monsoon layer is active. Blue zones indicate simulated high-risk flooding areas based on topography.</p>
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="w-full h-full z-[1]">
          <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            
            {/* Render Issues */}
            {filteredIssues.map((issue) => (
              <Marker key={issue.id} position={issue.pos} icon={icons[issue.status]}>
                <Popup>
                  <div className="font-sans">
                    <p className="font-bold text-slate-800 text-sm mb-1">{issue.type}</p>
                    <p className="text-xs text-slate-600 mb-2">{issue.label}</p>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white ${
                      issue.status === 'safe' ? 'bg-green-500' : issue.status === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      {issue.status}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Render Monsoon Risk Layer (Simulated via overlay circles for now) */}
            {showMonsoonLayer && (
              <>
                <Circle center={[19.070, 72.860]} pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.2, color: 'transparent' }} radius={2500} />
                <Circle center={[19.055, 72.845]} pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.15, color: 'transparent' }} radius={3000} />
                <Circle center={[19.050, 72.870]} pathOptions={{ fillColor: '#8b5cf6', fillOpacity: 0.15, color: 'transparent' }} radius={2000} />
              </>
            )}
          </MapContainer>
        </div>

      </div>
    </div>
  );
}
