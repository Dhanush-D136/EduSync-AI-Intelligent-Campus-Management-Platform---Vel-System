import React from 'react';
import { Download, FileText, CheckCircle, Clock } from 'lucide-react';

export const Reports = () => {
  const handleExport = () => {
    // Trigger file download directly from backend endpoint
    window.location.href = 'http://localhost:8000/api/reports/export';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center bg-white/40 p-4 rounded-2xl glass-panel">
        <div>
          <h2 className="text-xl font-bold text-dark-800 flex items-center gap-2">
            <FileText className="text-gold-500" size={24} /> 
            Attendance Reports
          </h2>
          <p className="text-sm text-silver-500 mt-1">Export complete attendance records and history.</p>
        </div>
        
        <button 
          onClick={handleExport}
          className="bg-gold-500 hover:bg-gold-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-md shadow-gold-500/20 flex items-center gap-2 transition-transform active:scale-95"
        >
          <Download size={18} /> Export Full CSV
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 border-2 border-green-200">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h3 className="text-4xl font-bold text-dark-800">100%</h3>
          <p className="text-silver-500 text-sm mt-1">Accuracy Today</p>
        </div>

        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center col-span-2">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 border-2 border-blue-200">
             <Clock className="text-blue-600" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-dark-800">System Logs</h3>
          <p className="text-silver-500 text-sm mt-1 max-w-sm">All entries are timestamped and logged via DeepSORT AI tracking directly to the configured PostgreSQL endpoint. Click the export button above to retrieve raw datasets for analytics.</p>
        </div>
      </div>
    </div>
  );
};
