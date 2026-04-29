import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, UploadCloud, Search } from 'lucide-react';

export const StudentsList = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/students');
      setStudents(res.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center bg-matte-blue-800 p-4 rounded-2xl glass-panel">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-matte-silver-400" size={18} />
          <input 
            type="text" 
            placeholder="Search students..." 
            className="w-full pl-10 pr-4 py-2 bg-matte-blue-900 border border-matte-blue-700 rounded-lg focus:outline-none focus:border-matte-gold-500 focus:ring-1 focus:ring-matte-gold-500/20 text-matte-silver-300 transition-colors font-medium text-sm"
          />
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-matte-gold-500 hover:bg-matte-gold-400 text-matte-blue-900 px-5 py-2.5 rounded-lg font-bold shadow-matte flex items-center gap-2 transition-transform active:scale-95"
        >
          <Plus size={18} /> Add Student
        </button>
      </div>

      <div className="glass-panel overflow-hidden bg-matte-blue-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-matte-blue-900 text-matte-silver-400 text-xs font-bold uppercase tracking-wider border-b border-matte-blue-700">
              <th className="p-4 rounded-tl-2xl">Register No.</th>
              <th className="p-4">Name</th>
              <th className="p-4">Department</th>
              <th className="p-4">Year</th>
              <th className="p-4">Section</th>
              <th className="p-4 text-center rounded-tr-2xl">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, i) => (
              <tr key={i} className="border-b border-matte-blue-700 hover:bg-matte-blue-900/50 transition-colors">
                <td className="p-4 text-matte-silver-300 font-bold">{student.register_number}</td>
                <td className="p-4 text-matte-silver-300 font-medium">{student.name}</td>
                <td className="p-4 text-matte-silver-400 font-medium">{student.department}</td>
                <td className="p-4 text-matte-silver-400 font-medium">{student.year}</td>
                <td className="p-4 text-matte-silver-400 font-medium">{student.section}</td>
                <td className="p-4 text-center text-matte-emerald-500 font-bold text-sm bg-matte-blue-900/30">Active</td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-matte-silver-500 font-medium tracking-wide">
                  No students registered yet. Add a student to begin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && <AddStudentModal onClose={() => { setModalOpen(false); fetchStudents(); }} />}
    </div>
  );
};

const AddStudentModal = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    name: '', register_number: '', department: 'AI & DS', year: 2, section: 'A'
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) return alert('Please upload at least 1 photo.');
    if (files.length > 6) return alert('Maximum 6 photos allowed.');

    setLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, String(v)));
    Array.from(files).forEach((f) => data.append('photos', f));

    try {
      await axios.post('http://localhost:8000/api/students/', data);
      onClose();
      alert('Student successfully enrolled and mapped by AI!');
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.detail || 'Database or Server Error. Check console.';
      alert(`Error enrolling student: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-matte-blue-900/80 backdrop-blur-md p-4">
      <div className="bg-matte-blue-800 p-8 w-full max-w-xl animate-fade-in relative shadow-2xl rounded-2xl border border-matte-blue-700">
        <h2 className="text-xl font-bold text-matte-silver-300 mb-6">Register New Student</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-xs font-bold text-matte-silver-400 mb-1 uppercase tracking-wider">Full Name</label>
               <input required type="text" className="w-full p-2.5 rounded-lg border border-matte-blue-700 bg-matte-blue-900 focus:bg-matte-blue-900 focus:outline-matte-gold-500 text-matte-silver-300 font-medium transition-colors shadow-inner" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
               <label className="block text-xs font-bold text-matte-silver-400 mb-1 uppercase tracking-wider">Register No</label>
               <input required type="text" className="w-full p-2.5 rounded-lg border border-matte-blue-700 bg-matte-blue-900 focus:bg-matte-blue-900 focus:outline-matte-gold-500 text-matte-silver-300 font-medium transition-colors shadow-inner" value={formData.register_number} onChange={e => setFormData({...formData, register_number: e.target.value})} />
            </div>
            <div>
               <label className="block text-xs font-bold text-matte-silver-400 mb-1 uppercase tracking-wider">Department</label>
               <input required type="text" className="w-full p-2.5 rounded-lg border border-matte-blue-700 bg-matte-blue-900 focus:bg-matte-blue-900 focus:outline-matte-gold-500 text-matte-silver-300 font-medium transition-colors shadow-inner" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                   <label className="block text-xs font-bold text-matte-silver-400 mb-1 uppercase tracking-wider">Year</label>
                   <input required type="number" min="1" max="4" className="w-full p-2.5 rounded-lg border border-matte-blue-700 bg-matte-blue-900 focus:bg-matte-blue-900 focus:outline-matte-gold-500 text-matte-silver-300 font-medium transition-colors shadow-inner" value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} />
                </div>
                <div>
                   <label className="block text-xs font-bold text-matte-silver-400 mb-1 uppercase tracking-wider">Section</label>
                   <input required type="text" className="w-full p-2.5 rounded-lg border border-matte-blue-700 bg-matte-blue-900 focus:bg-matte-blue-900 focus:outline-matte-gold-500 text-matte-silver-300 font-medium transition-colors shadow-inner" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} />
                </div>
            </div>
          </div>

          <div className="mt-6 border-2 border-dashed border-matte-blue-700 rounded-xl p-8 text-center bg-matte-blue-900 hover:bg-matte-blue-900/80 transition-colors relative cursor-pointer group">
             <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFiles(e.target.files)} />
             <UploadCloud className="mx-auto text-matte-silver-500 mb-2 group-hover:scale-110 transition-transform" size={32} />
             <p className="text-sm font-bold text-matte-silver-300">Drop face photos here or click to browse</p>
             <p className="text-xs text-matte-silver-500 mt-1 font-medium">Upload exactly 6 images (Front, Side, Varying angles)</p>
             {files && files.length > 0 && (
                <div className="mt-3 text-sm text-matte-blue-900 font-bold bg-matte-gold-500 inline-block px-3 py-1 rounded-full">{files.length} file(s) selected</div>
             )}
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-matte-silver-400 font-bold hover:bg-matte-blue-700 transition-colors border border-matte-blue-700">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg bg-matte-gold-500 text-matte-blue-900 font-bold hover:bg-matte-gold-400 shadow-matte disabled:opacity-50 transition-colors">
              {loading ? 'Processing AI...' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
