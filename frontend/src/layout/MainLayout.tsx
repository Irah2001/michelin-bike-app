import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { CircleDot, Swords, User, Lightbulb } from 'lucide-react';
import { useEffect } from 'react';

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export function MainLayout() {
  // Auto-start simulator on app open, stop on close
  useEffect(() => {
    const token = localStorage.getItem('token');
    let userId: string | undefined;
    if (token) {
      try { userId = JSON.parse(atob(token.split('.')[1])).sub; } catch (e) { console.warn('Token illisible', e); }
    }
    fetch(`${API}/simulator/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    }).catch((error) => console.warn("Erreur démarrage simulateur", error));

    const stopSim = () => { navigator.sendBeacon?.(`${API}/simulator/stop`); };
    window.addEventListener('beforeunload', stopSim);
    return () => {
      window.removeEventListener('beforeunload', stopSim);
      fetch(`${API}/simulator/stop`, { method: 'POST' })
        .catch((error) => console.warn("Erreur arrêt simulateur", error));
    };
  }, []);

  if (!localStorage.getItem('token')) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-[#0B1120] text-white flex justify-center selection:bg-[#FCE500] selection:text-black">
      <div className="w-full max-w-md relative flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-24 relative">
          <Outlet />
        </div>

        <div className="absolute bottom-0 w-full px-4 pb-5 pt-2 bg-linear-to-t from-[#0B1120] via-[#0B1120]/90 to-transparent z-50">
          <div className="flex justify-between items-center bg-white/10 backdrop-blur-xl border border-white/15 px-4 py-3 rounded-3xl shadow-2xl">
            <NavItem to="/tips" icon={<Lightbulb size={20} />} label="Conseils" />
            <NavItem to="/tires" icon={<CircleDot size={20} />} label="Pneus" />
            <NavItem to="/challenges" icon={<Swords size={20} />} label="Défis" />
            <NavItem to="/profile" icon={<User size={20} />} label="Profil" />
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label, isCenter = false }: { to: string; icon: React.ReactNode; label: string; isCenter?: boolean }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex flex-col items-center gap-0.5 transition-all duration-300
        ${isActive ? 'text-[#FCE500] scale-110' : 'text-slate-500 hover:text-slate-300'}
        ${isCenter ? '-mt-7 bg-[#FCE500] text-black p-3.5 rounded-full shadow-[0_10px_20px_rgba(252,229,0,0.3)] scale-100!' : ''}
      `}
    >
      {icon}
      {!isCenter && <span className="text-[9px] font-semibold">{label}</span>}
    </NavLink>
  );
}
