import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Settings, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const monthlyTrends = [
  { month: 'Jan', complaints: 120, resolved: 90 },
  { month: 'Feb', complaints: 140, resolved: 110 },
  { month: 'Mar', complaints: 200, resolved: 140 }, // pre-monsoon start
  { month: 'Apr', complaints: 280, resolved: 210 },
  { month: 'May', complaints: 450, resolved: 320 }, // monsoon peak
  { month: 'Jun', complaints: 410, resolved: 380 },
];

const issueDistribution = [
  { name: 'Potholes', value: 45 },
  { name: 'Waterlogging', value: 30 },
  { name: 'Drainage', value: 15 },
  { name: 'Lighting', value: 10 },
];
const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#eab308'];

const wardComplaints = [
  { ward: 'Ward 1', count: 125 },
  { ward: 'Ward 2', count: 85 },
  { ward: 'Ward 3', count: 210 },
  { ward: 'Ward 4', count: 145 },
  { ward: 'Ward 5', count: 90 },
];

export default function DashboardPage() {
  return (
    <div className="flex-1 bg-slate-50 min-h-screen pt-20 px-4 sm:px-6 lg:px-8 pb-12 w-full max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Municipal Authority Dashboard</h1>
          <p className="text-sm text-slate-500 font-medium">Overview of city infrastructure issues and resolution metrics.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center space-x-2 bg-white border border-slate-300 text-slate-700 font-medium px-4 py-2 rounded-lg hover:bg-slate-50 shadow-sm text-sm">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>Live Sync: Active</span>
          </button>
          <button className="bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm text-sm flex items-center">
            <FileText className="w-4 h-4 mr-2" /> Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center">
          <div className="bg-blue-100 p-3 rounded-xl mr-4">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Complaints</p>
            <h3 className="text-2xl font-bold text-slate-900">12,450</h3>
            <p className="text-xs text-green-600 font-medium mt-1">+14% vs last month</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center">
          <div className="bg-red-100 p-3 rounded-xl mr-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">High-Risk Zones</p>
            <h3 className="text-2xl font-bold text-slate-900">34</h3>
            <p className="text-xs text-red-600 font-medium mt-1">Requires immediate attention</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center">
          <div className="bg-green-100 p-3 rounded-xl mr-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Resolution Rate</p>
            <h3 className="text-2xl font-bold text-slate-900">86.2%</h3>
            <p className="text-xs text-green-600 font-medium mt-1">+2.4% vs last month</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center">
          <div className="bg-purple-100 p-3 rounded-xl mr-4">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Avg Repair Time</p>
            <h3 className="text-2xl font-bold text-slate-900">2.4 Days</h3>
            <p className="text-xs text-green-600 font-medium mt-1">-0.5 Days vs last month</p>
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Trend Area Chart (Spans 2 columns) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-base font-bold text-slate-800 mb-6">Monthly Infrastructure Risk Trends</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" dataKey="complaints" name="New Complaints" stroke="#ef4444" fillOpacity={1} fill="url(#colorComplaints)" />
                <Area type="monotone" dataKey="resolved" name="Resolved Issues" stroke="#22c55e" fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart (Issue Type Distribution) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-800 mb-6">Issue Type Distribution</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={issueDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  labelLine={false}
                >
                  {issueDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`${value}%`, 'Share']}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bar Chart (Ward Comparison) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-base font-bold text-slate-800 mb-6">Complaints Volume by Ward</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wardComplaints} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="ward" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <RechartsTooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
              />
              <Bar dataKey="count" name="Total Issues" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
