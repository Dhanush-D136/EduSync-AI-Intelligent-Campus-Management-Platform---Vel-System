import React from 'react';
import { Camera, Maximize } from 'lucide-react';

export const LiveCamera = () => {
  return (
    <div className="space-y-6 animate-fade-in pb-10 h-full flex flex-col">
      <div className="flex justify-between items-center bg-white/40 p-5 rounded-2xl glass-panel">
        <div>
          <h2 className="text-xl font-bold text-dark-800 flex items-center gap-2">
            <Camera className="text-gold-500" />
            Active Classroom Monitoring
          </h2>
          <p className="text-silver-500 text-sm mt-1">
             Tracking 60+ individuals automatically using YOLOv8 & ArcFace
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-xl uppercase tracking-wider flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Recording & Tracking
          </span>
          <button className="p-3 bg-white/70 hover:bg-gold-500 hover:text-white rounded-xl text-silver-600 transition-colors shadow-sm">
            <Maximize size={20} />
          </button>
        </div>
      </div>

      <div className="glass-panel p-2 flex-1 flex flex-col items-center justify-center bg-dark-900/90 overflow-hidden relative rounded-2xl shadow-inner min-h-[60vh] border border-silver-400/20">
        <img 
          src="http://localhost:8000/api/camera/stream" 
          alt="Live Stream"
          className="w-full h-full object-contain rounded-xl"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center -z-10 bg-dark-800 flex-col gap-4">
            <div className="p-6 rounded-full bg-dark-900 shadow-inner">
               <Camera size={56} className="text-silver-600 opacity-60 animate-pulse-slow" />
            </div>
            <span className="text-silver-300 font-bold tracking-widest uppercase text-lg premium-gradient-text">Camera Feed Offline</span>
            <span className="text-silver-500 text-xs text-center max-w-md tracking-wider">Ensure the FastAPI backend is running and the camera device (index 0) is accessible.</span>
        </div>
      </div>
    </div>
  );
};
