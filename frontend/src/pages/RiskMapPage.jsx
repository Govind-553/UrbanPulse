import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import {
  Layers, CloudRain, AlertTriangle, Thermometer, Activity,
  Wind, Droplets, Eye, Gauge, X, RefreshCw
} from 'lucide-react';
import { reportService } from '../services/api';

// Custom icons based on risk level
const createCustomIcon = (color) =>
  L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color:${color};width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const icons = {
  safe: createCustomIcon('#22c55e'),
  moderate: createCustomIcon('#eab308'),
  critical: createCustomIcon('#ef4444'),
};

// These are real topographically low-lying areas in Mumbai known to flood during monsoon
const MUMBAI_FLOOD_ZONES = [
  { center: [19.0170, 72.8509], name: 'Sion–Kurla Low Pocket',    severity: 'high',   baseRadius: 1800 },
  { center: [19.0440, 72.8690], name: 'Dharavi Creek Basin',       severity: 'high',   baseRadius: 2000 },
  { center: [19.0660, 72.8350], name: 'Bandra Reclamation Area',   severity: 'medium', baseRadius: 1500 },
  { center: [18.9780, 72.8330], name: 'Worli Sea Face',            severity: 'medium', baseRadius: 1200 },
  { center: [19.1150, 72.8800], name: 'Andheri East Subway',       severity: 'high',   baseRadius: 2200 },
  { center: [19.0968, 72.8396], name: 'Jogeshwari Metro Drain',    severity: 'medium', baseRadius: 1600 },
  { center: [19.1350, 72.9150], name: 'Vikhroli Creek',            severity: 'low',    baseRadius: 1300 },
  { center: [18.9960, 72.8400], name: 'Prabhadevi Coastal',        severity: 'low',    baseRadius: 1000 },
];

// Severity → color mapping
const SEVERITY_COLORS = {
  high:   { fill: '#ef4444', stroke: '#b91c1c' },
  medium: { fill: '#f59e0b', stroke: '#d97706' },
  low:    { fill: '#3b82f6', stroke: '#2563eb' },
};

// Rain intensity → radius multiplier
function getRainMultiplier(rainMmPerHour) {
  if (!rainMmPerHour || rainMmPerHour === 0) return 0.5;  // dry → small indicator circles
  if (rainMmPerHour < 2.5)  return 0.8;   // light rain
  if (rainMmPerHour < 7.5)  return 1.2;   // moderate rain
  if (rainMmPerHour < 15)   return 1.8;   // heavy rain
  if (rainMmPerHour < 30)   return 2.5;   // very heavy
  return 3.5;                              // extreme
}

// Rain → flood risk label
function getFloodRiskLabel(rain, humidity) {
  const combo = (rain || 0) + (humidity || 0) / 10;
  if (combo > 30) return { label: '🔴 Extreme Flood Risk', color: 'text-red-700',    bg: 'bg-red-50 border-red-200' };
  if (combo > 15) return { label: '🟠 High Flood Risk',    color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' };
  if (combo > 5)  return { label: '🟡 Moderate Risk',      color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' };
  return           { label: '🟢 Low Risk (Dry Conditions)', color: 'text-green-700',  bg: 'bg-green-50 border-green-200' };
}

const MUMBAI_CENTER = [19.0760, 72.8777];

export default function RiskMapPage() {
  const [showMonsoonLayer, setShowMonsoonLayer] = useState(false);
  const [filterType, setFilterType] = useState('All');

  // Full weather state (stores raw OpenWeatherMap payload)
  const [weatherFull, setWeatherFull] = useState(null);
  const [riskScore, setRiskScore]     = useState(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState(false);

  // Issues from DB
  const [issues, setIssues] = useState([]);

  // ── Fetch weather + risk score from AI service ─────────────────────────────
  const fetchWeatherAndRisk = async () => {
    setIsLoadingWeather(true);
    setWeatherError(false);
    try {
      const res = await fetch(
        `http://localhost:8000/ai/weather?lat=${MUMBAI_CENTER[0]}&lon=${MUMBAI_CENTER[1]}`
      );
      if (!res.ok) throw new Error('Weather API failed');
      const json = await res.json();
      const wd = json.weather_data || {};

      setWeatherFull({
        temp:        wd.main?.temp ? (wd.main.temp - 273.15).toFixed(1) : null,
        feelsLike:   wd.main?.feels_like ? (wd.main.feels_like - 273.15).toFixed(1) : null,
        humidity:    wd.main?.humidity ?? null,
        windSpeed:   wd.wind?.speed ?? null,
        windDir:     wd.wind?.deg ?? null,
        clouds:      wd.clouds?.all ?? null,
        visibility:  wd.visibility ? (wd.visibility / 1000).toFixed(1) : null,
        condition:   wd.weather?.[0]?.description ?? 'N/A',
        conditionId: wd.weather?.[0]?.id ?? 800,
        rain1h:      json.rainfall_last_hour ?? 0,
        cityName:    wd.name ?? 'Mumbai',
        fetchedAt:   new Date(),
      });

      // Compute AI risk score using real rainfall
      const riskRes = await fetch('http://localhost:8000/ai/risk-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rainfall:     json.rainfall_last_hour || 0,
          complaints:   issues.length || 50,
          road_density: 0.85
        })
      });
      if (riskRes.ok) {
        const riskData = await riskRes.json();
        setRiskScore((riskData.risk_score * 100).toFixed(1));
      }
    } catch (e) {
      console.error('Weather fetch failed:', e);
      setWeatherError(true);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  useEffect(() => { fetchWeatherAndRisk(); }, []);

  // ── Fetch live issues ──────────────────────────────────────────────────────
  useEffect(() => {
    reportService.getIssues({ public: true })
      .then(r => r?.data && setIssues(r.data))
      .catch(e => console.error('Failed to load issues', e));
  }, []);

  // ── Derive waterlogging/drainage cluster zones from real DB data ───────────
  const waterlogClusters = useMemo(() => {
    return issues
      .filter(i =>
        (i.category === 'waterlogging' || i.category === 'drainage') &&
        i.latitude && i.longitude &&
        (i.status === 'reported' || i.status === 'in-progress')
      )
      .map(i => ({
        center: [i.latitude, i.longitude],
        title: i.title,
        category: i.category,
        status: i.status,
      }));
  }, [issues]);

  const categoryToType = {
    pothole: 'Pothole',
    waterlogging: 'Waterlogging',
    drainage: 'Drainage Blockage',
    streetlight: 'Broken Streetlight',
    garbage: 'Garbage Overflow',
    other: 'Other'
  };

  const mapStatusToColorStatus = (status) => {
    if (status === 'resolved' || status === 'closed') return 'safe';
    if (status === 'reported') return 'critical';
    return 'moderate';
  };

  const filteredIssues = filterType === 'All'
    ? issues
    : issues.filter(i => categoryToType[i.category] === filterType);

  const rainMulitplier   = getRainMultiplier(weatherFull?.rain1h);
  const floodRisk        = getFloodRiskLabel(weatherFull?.rain1h, weatherFull?.humidity);
  const riskPct          = parseFloat(riskScore) || 0;
  const riskColor        = riskPct >= 70 ? 'text-red-600' : riskPct >= 40 ? 'text-yellow-600' : 'text-green-600';

  // Wind direction → compass
  const windCompass = (deg) => {
    if (deg == null) return 'N/A';
    const dirs = ['N','NE','E','SE','S','SW','W','NW'];
    return dirs[Math.round(deg / 45) % 8];
  };

  return (
    <div className="flex flex-col h-screen pt-16">

      {/* ── Top Header Bar ── */}
      <div className="bg-white px-6 py-3 shrink-0 border-b border-slate-200 shadow-sm z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Infrastructure Risk &amp; Monsoon Map</h1>
          <p className="text-xs text-slate-500 font-medium">Real-time AI weather + citizen-reported flood risk · Mumbai</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Live header stats */}
          {weatherFull && (
            <div className="hidden lg:flex bg-slate-50 border border-slate-200 rounded-xl p-2 gap-4 divide-x divide-slate-200">
              <div className="flex items-center px-3 gap-2">
                <Thermometer className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Mumbai</p>
                  <p className="text-sm font-bold text-slate-800">{weatherFull.temp}°C · {weatherFull.condition}</p>
                </div>
              </div>
              <div className="flex items-center px-3 gap-2">
                <CloudRain className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Rainfall</p>
                  <p className="text-sm font-bold text-blue-700">{weatherFull.rain1h > 0 ? `${weatherFull.rain1h} mm/hr` : 'No rain'}</p>
                </div>
              </div>
              <div className="flex items-center px-3 gap-2">
                <Activity className={`w-4 h-4 ${riskPct >= 70 ? 'text-red-500' : riskPct >= 40 ? 'text-yellow-500' : 'text-green-500'}`} />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">AI Risk Score</p>
                  <p className={`text-sm font-bold ${riskColor}`}>{riskScore}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Monsoon toggle button */}
          <button
            onClick={() => setShowMonsoonLayer(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
              showMonsoonLayer
                ? 'bg-blue-600 text-white shadow-blue-200 shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CloudRain className="w-4 h-4" />
            Monsoon Risk Layer
            {showMonsoonLayer && weatherFull?.rain1h > 0 && (
              <span className="ml-1 bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">LIVE</span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 relative flex overflow-hidden">

        {/* ── Left Sidebar ── */}
        <div className="absolute left-4 top-4 z-[400] w-68 space-y-3" style={{ width: '17rem' }}>

          {/* Filters card */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> Filters
            </h3>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
            >
              <option value="All">All Issues</option>
              <option value="Pothole">Pothole</option>
              <option value="Waterlogging">Waterlogging</option>
              <option value="Drainage Blockage">Drainage Blockage</option>
              <option value="Broken Streetlight">Broken Streetlight</option>
              <option value="Garbage Overflow">Garbage Overflow</option>
            </select>

            <div className="mt-3 space-y-1.5 text-xs text-slate-600">
              <p className="font-semibold text-slate-700 mb-1">Legend</p>
              {[['bg-red-500','Critical / Unresolved'],['bg-yellow-500','In Progress'],['bg-green-500','Resolved']].map(([bg,lbl])=>(
                <div key={lbl} className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full ${bg}`}></div>{lbl}</div>
              ))}
              {showMonsoonLayer && (
                <>
                  <div className="border-t border-slate-100 my-2"></div>
                  <p className="font-semibold text-slate-700 mb-1">Flood Risk Zones</p>
                  {[['bg-red-400','High severity'],['bg-amber-400','Medium severity'],['bg-blue-400','Low / Preventive']].map(([bg,lbl])=>(
                    <div key={lbl} className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full ${bg}`}></div>{lbl}</div>
                  ))}
                  {waterlogClusters.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-pink-500"></div>
                      Live waterlogging reports
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Live Monsoon Panel (only when layer is active) ── */}
          {showMonsoonLayer && (
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
              {/* Panel header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-white" />
                  <span className="text-sm font-bold text-white">Monsoon Intelligence</span>
                  <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-bold">LIVE</span>
                </div>
                {weatherFull?.fetchedAt && (
                  <span className="text-[10px] text-blue-100">
                    {weatherFull.fetchedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>

              {isLoadingWeather ? (
                <div className="p-4 text-center">
                  <RefreshCw className="w-5 h-5 text-blue-400 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Fetching live weather…</p>
                </div>
              ) : weatherError ? (
                <div className="p-4 text-center">
                  <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
                  <p className="text-xs text-red-500">Couldn't reach weather service. Is the AI server running?</p>
                  <button onClick={fetchWeatherAndRisk} className="mt-2 text-xs text-blue-600 underline">Retry</button>
                </div>
              ) : weatherFull ? (
                <div className="p-4 space-y-3">

                  {/* Flood risk badge */}
                  <div className={`flex items-center gap-2 text-xs font-bold p-2 rounded-lg border ${floodRisk.bg}`}>
                    <span className={floodRisk.color}>{floodRisk.label}</span>
                  </div>

                  {/* Weather metrics grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: <Thermometer className="w-3.5 h-3.5 text-orange-500"/>, label:'Temp', value:`${weatherFull.temp}°C` },
                      { icon: <Droplets className="w-3.5 h-3.5 text-blue-500"/>, label:'Humidity', value:`${weatherFull.humidity}%` },
                      { icon: <Wind className="w-3.5 h-3.5 text-slate-500"/>, label:'Wind', value:`${weatherFull.windSpeed} m/s ${windCompass(weatherFull.windDir)}` },
                      { icon: <CloudRain className="w-3.5 h-3.5 text-blue-600"/>, label:'Rainfall', value: weatherFull.rain1h > 0 ? `${weatherFull.rain1h} mm/hr` : 'None' },
                      { icon: <Eye className="w-3.5 h-3.5 text-slate-500"/>, label:'Visibility', value: weatherFull.visibility ? `${weatherFull.visibility} km` : 'N/A' },
                      { icon: <Gauge className="w-3.5 h-3.5 text-purple-500"/>, label:'Cloud Cover', value:`${weatherFull.clouds}%` },
                    ].map(({ icon, label, value }) => (
                      <div key={label} className="bg-slate-50 rounded-lg p-2 flex items-start gap-1.5">
                        {icon}
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase font-bold">{label}</p>
                          <p className="text-xs font-bold text-slate-800 leading-tight">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Rainfall scale indicator */}
                  <div>
                    <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                      <span>Rainfall Intensity</span>
                      <span>{weatherFull.rain1h > 0
                        ? weatherFull.rain1h < 2.5 ? 'Light' : weatherFull.rain1h < 7.5 ? 'Moderate' : weatherFull.rain1h < 15 ? 'Heavy' : 'Very Heavy'
                        : 'Dry'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((weatherFull.rain1h / 30) * 100, 100)}%`,
                          background: weatherFull.rain1h > 15 ? '#ef4444' : weatherFull.rain1h > 7.5 ? '#f59e0b' : '#3b82f6'
                        }}
                      />
                    </div>
                  </div>

                  {/* Zone count summary */}
                  <div className="border-t border-slate-100 pt-2">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Flood Zone Summary</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-bold">
                        {MUMBAI_FLOOD_ZONES.filter(z=>z.severity==='high').length} High
                      </span>
                      <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                        {MUMBAI_FLOOD_ZONES.filter(z=>z.severity==='medium').length} Medium
                      </span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                        {MUMBAI_FLOOD_ZONES.filter(z=>z.severity==='low').length} Low
                      </span>
                      {waterlogClusters.length > 0 && (
                        <span className="text-[10px] bg-pink-50 text-pink-700 border border-pink-200 px-2 py-0.5 rounded-full font-bold">
                          {waterlogClusters.length} Live Reports
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-slate-400 mt-2 leading-relaxed">
                      Zone radii expand dynamically with rainfall. Currently at <strong>{rainMulitplier.toFixed(1)}×</strong> base size.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* ── Map ── */}
        <div className="w-full h-full z-[1]">
          <MapContainer center={MUMBAI_CENTER} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {/* ── Render issue markers ── */}
            {filteredIssues.map(issue => {
              if (!issue.latitude || !issue.longitude) return null;
              const label       = categoryToType[issue.category] || issue.category;
              const colorStatus = mapStatusToColorStatus(issue.status);
              return (
                <Marker key={issue._id} position={[issue.latitude, issue.longitude]} icon={icons[colorStatus]}>
                  <Popup>
                    <div className="font-sans w-48">
                      <p className="font-bold text-slate-800 text-sm mb-1">{label}</p>
                      <p className="text-xs text-slate-600 mb-2">{issue.title}</p>
                      {issue.images?.length > 0 && (
                        <div className={`mb-2 gap-1 grid ${issue.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {issue.images.map((img, idx) => (
                            <img key={idx} src={`http://localhost:5000/${img.replace(/\\/g, '/')}`}
                              alt={`${label} ${idx + 1}`} className="w-full h-24 object-cover rounded border border-slate-200 shadow-sm" />
                          ))}
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-100 rounded px-1 w-max">
                          {issue.latitude.toFixed(5)}, {issue.longitude.toFixed(5)}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white w-max ${
                          colorStatus === 'safe' ? 'bg-green-500' : colorStatus === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}>{issue.status}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* ── Monsoon Risk Layer ── */}
            {showMonsoonLayer && (
              <>
                {/* Known flood-prone zones — size scales with live rainfall */}
                {MUMBAI_FLOOD_ZONES.map((zone, idx) => {
                  const { fill, stroke } = SEVERITY_COLORS[zone.severity];
                  const radius          = zone.baseRadius * rainMulitplier;
                  const fillOpacity     = zone.severity === 'high' ? 0.25 : zone.severity === 'medium' ? 0.18 : 0.12;
                  return (
                    <Circle
                      key={idx}
                      center={zone.center}
                      radius={radius}
                      pathOptions={{ fillColor: fill, fillOpacity, color: stroke, weight: 1.5, dashArray: '6 4' }}
                    >
                      <Popup>
                        <div className="font-sans">
                          <p className="font-bold text-slate-800 text-sm">🌊 {zone.name}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Severity: <span className={`font-bold ${zone.severity === 'high' ? 'text-red-600' : zone.severity === 'medium' ? 'text-amber-600' : 'text-blue-600'}`}>
                              {zone.severity.toUpperCase()}
                            </span>
                          </p>
                          <p className="text-xs text-slate-500">Risk radius: <strong>{Math.round(radius)}m</strong></p>
                          <p className="text-xs text-slate-500">Rainfall now: <strong>{weatherFull?.rain1h > 0 ? `${weatherFull.rain1h} mm/hr` : 'Dry'}</strong></p>
                          <p className="text-[10px] text-slate-400 mt-1">Zone radius expands dynamically with live rainfall data.</p>
                        </div>
                      </Popup>
                    </Circle>
                  );
                })}

                {/* Live waterlogging/drainage issue clusters from real DB */}
                {waterlogClusters.map((wl, idx) => (
                  <Circle
                    key={`wl-${idx}`}
                    center={wl.center}
                    radius={400 * Math.max(rainMulitplier, 1)}
                    pathOptions={{ fillColor: '#ec4899', fillOpacity: 0.35, color: '#be185d', weight: 2 }}
                  >
                    <Popup>
                      <div className="font-sans">
                        <p className="font-bold text-pink-700 text-sm">🚨 Active {wl.category === 'waterlogging' ? 'Waterlogging' : 'Drainage'} Report</p>
                        <p className="text-xs text-slate-600 mt-1">{wl.title}</p>
                        <p className="text-xs text-slate-500">Status: <strong className="text-yellow-600">{wl.status}</strong></p>
                        <p className="text-[10px] text-slate-400 mt-1">This is a citizen-reported water issue at this location.</p>
                      </div>
                    </Popup>
                  </Circle>
                ))}
              </>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
