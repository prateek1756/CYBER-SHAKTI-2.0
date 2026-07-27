import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, Compass, ShieldCheck } from 'lucide-react';

export default function NavBar() {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Home', icon: Compass },
    { path: '/scanner', label: 'AI Scanners', icon: ShieldCheck },
    { path: '/alerts', label: 'Live Alerts', icon: AlertTriangle },
    { path: '/tips', label: 'Safety Tips', icon: ShieldAlert }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/5 px-6 py-4 flex items-center justify-between shadow-lg">
      <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 font-tech">
        <ShieldCheck className="w-6 h-6 text-teal-400 animate-pulse" />
        CYBERSHAKTI
      </Link>
      
      <div className="flex items-center gap-6">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold font-tech transition-all duration-200 py-1 px-2.5 rounded-md ${
                isActive 
                  ? 'text-teal-400 bg-teal-500/10 border border-teal-500/20 shadow-[0_0_10px_rgba(20,184,166,0.1)]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
