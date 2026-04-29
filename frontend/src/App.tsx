import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Users, Camera, BarChart3, Settings } from 'lucide-react';
import { Dashboard } from './pages/Dashboard';
import { StudentsList } from './pages/StudentsList';
import { LiveCamera } from './pages/LiveCamera';
import { Reports } from './pages/Reports';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen overflow-hidden selection:bg-matte-gold-500/30">
      {/* Sidebar */}
      <aside className="w-64 glass-panel m-4 flex flex-col p-6 shadow-matte">
        <div className="flex items-center space-x-3 mb-10">
          <div className="w-10 h-10 rounded-full bg-matte-gold-500 flex items-center justify-center text-matte-blue-900 font-bold text-xl shadow-md border-2 border-matte-blue-800 shadow-matte-gold-500/20">
            V
          </div>
          <div>
            <h1 className="font-extrabold text-matte-silver-300 leading-tight text-xl tracking-tight">VSASS</h1>
            <p className="text-xs text-matte-silver-500 font-semibold tracking-wide">Vel Attendance Matte</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem to="/" icon={<Home size={20} />} label="Dashboard" />
          <NavItem to="/students" icon={<Users size={20} />} label="Students" />
          <NavItem to="/camera" icon={<Camera size={20} />} label="Live Camera" />
          <NavItem to="/reports" icon={<BarChart3 size={20} />} label="Reports" />
        </nav>

        <div className="mt-auto">
          <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 pl-0 relative z-0">
        <header className="glass-panel px-8 py-4 mb-6 flex justify-between items-center sticky top-0 z-10 shadow-matte">
          <h2 className="text-xl font-bold text-matte-silver-300 tracking-tight">Live Dashboard</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold text-matte-silver-500">Welcome, Admin</span>
            <div className="w-9 h-9 rounded-full bg-matte-blue-900 border-2 border-matte-gold-500 cursor-pointer shadow-sm"></div>
          </div>
        </header>
        
        <div className="px-4">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link to={to} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 font-semibold group hover:shadow-matte ${isActive ? 'bg-matte-gold-500 text-matte-blue-900 shadow-md shadow-matte-gold-500/20' : 'text-matte-silver-500 hover:bg-matte-blue-900/50 hover:text-matte-gold-500'}`}>
      <span className={`${isActive ? 'text-matte-blue-900' : 'text-matte-silver-600 group-hover:text-matte-gold-500'} transition-colors`}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<StudentsList />} />
          <Route path="/camera" element={<LiveCamera />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<div className="glass-panel p-8 animate-fade-in"><h3 className="font-bold text-lg text-dark-800">Settings Widget</h3></div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
