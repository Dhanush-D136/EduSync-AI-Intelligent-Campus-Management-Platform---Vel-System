import React, { useEffect, useState } from 'react';
import { Users, CheckCircle, XCircle, Activity, Camera } from 'lucide-react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data until historical API is built
const mockChartData = [
  { name: 'Mon', attendance: 85 },
  { name: 'Tue', attendance: 89 },
  { name: 'Wed', attendance: 92 },
  { name: 'Thu', attendance: 90 },
  { name: 'Fri', attendance: 88 },
];

export const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    accuracy: "0%",
    active_classes: 0
  });

  useEffect(() => {
    // In dev, assuming FastAPI is on port 8000
    axios.get('http://localhost:8000/api/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget title="Total Students" value={stats.total} icon={<Users className="text-matte-silver-400" size={24} />} />
        <StatWidget title="Present Today" value={stats.present} icon={<CheckCircle className="text-matte-emerald-500" size={24} />} trend='+2%' />
        <StatWidget title="Absent Today" value={stats.absent} icon={<XCircle className="text-red-400" size={24} />} />
        <StatWidget title="Accuracy" value={stats.accuracy} icon={<Activity className="text-matte-gold-500" size={24} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Camera Widget */}
        <div className="lg:col-span-2 glass-panel p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-matte-silver-300 flex items-center gap-2">
              <Camera size={20} className="text-matte-gold-500"/>
              Live Classroom Feed
            </h3>
            <span className="px-3 py-1 bg-matte-blue-900 border border-matte-emerald-500/40 text-matte-emerald-500 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-2 shadow-matte">
              <span className="w-2 h-2 rounded-full bg-matte-emerald-500 animate-pulse"></span>
              Live Tracking
            </span>
          </div>
          
          <div className="flex-1 bg-matte-blue-900 rounded-xl overflow-hidden relative shadow-inner min-h-[300px] border border-matte-blue-700">
            {/* The Image Stream connected directly to FastAPI MJPEG hook */}
            <img 
              src="http://localhost:8000/api/camera/stream" 
              alt="Live Camera Stream Offline"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center -z-10 flex-col gap-3">
               <Camera size={40} className="text-matte-silver-500 opacity-60 animate-pulse" />
               <span className="text-matte-silver-400 font-semibold tracking-wide">Stream Offline / Reconnecting...</span>
               <span className="text-matte-silver-500 text-xs uppercase tracking-widest max-w-[200px] text-center">Ensure backend is active & camera is connected</span>
            </div>
          </div>
        </div>

        {/* Weekly Trend Chart */}
        <div className="glass-panel p-6 text-matte-silver-300">
          <h3 className="font-bold text-lg text-matte-silver-300 mb-6 flex items-center gap-2"><Activity size={18} className="text-matte-gold-400"/> Attendance Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 13, fontWeight: 500}} />
                <Tooltip 
                   contentStyle={{backgroundColor: '#1E293B', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                   itemStyle={{color: '#D4AF37', fontWeight: 600}}
                />
                <Area type="monotone" dataKey="attendance" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorAtt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Sub-Component
const StatWidget = ({ title, value, icon, trend }: { title: string, value: string | number, icon: React.ReactNode, trend?: string }) => (
  <div className="glass-panel p-6 flex flex-col justify-between group relative overflow-hidden text-matte-silver-300">
    <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-matte-gold-500/5 rounded-full blur-2xl group-hover:bg-matte-gold-500/10 transition-colors duration-700"></div>
    <div className="flex justify-between items-start relative z-10">
      <div className="p-3.5 bg-matte-blue-900 rounded-2xl shadow-inner border border-matte-blue-700 group-hover:border-matte-gold-500/30 transition-colors duration-300">
        {icon}
      </div>
      {trend && <span className="text-[11px] font-bold text-matte-emerald-500 bg-matte-blue-900 px-2.5 py-1 rounded-lg border border-matte-emerald-500/30 shadow-matte uppercase tracking-wider">{trend}</span>}
    </div>
    <div className="mt-5 relative z-10">
      <h4 className="text-matte-silver-400 text-[13px] font-bold tracking-widest uppercase">{title}</h4>
      <p className="text-4xl font-extrabold text-matte-silver-300 mt-1 tracking-tight drop-shadow-sm">{value}</p>
    </div>
  </div>
);
