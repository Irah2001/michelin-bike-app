import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { CircleDot, Swords, User, Lightbulb } from 'lucide-react';
import { useEffect } from 'react';

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export function MainLayout() {
  const hasToken = Boolean(localStorage.getItem('token'));

  // Auto-start simulator on app open, stop on close
  useEffect(() => {
    if (!hasToken) return;

    const token = localStorage.getItem('token');
    let userId: string | undefined;
    if (token) {
      try { userId = JSON.parse(atob(token.split('.')[1])).sub; }
      catch { /* */ }
    }

    fetch(`${API}/simulator/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    }).catch(() => { /* */ });

    const stopSim = () => {
      if (navigator.sendBeacon) navigator.sendBeacon(`${API}/simulator/stop`);
      else fetch(`${API}/simulator/stop`, { method: 'POST', keepalive: true }).catch(() => { });
    };

    window.addEventListener('beforeunload', stopSim);
    return () => {
      window.removeEventListener('beforeunload', stopSim);
      fetch(`${API}/simulator/stop`, { method: 'POST' }).catch(() => { /* */ });
    };
  }, [hasToken]);

  if (!hasToken) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-[#080F22] text-white flex justify-center selection:bg-[#FCE500] selection:text-black">
      <div className="w-full max-w-md relative flex flex-col h-[100dvh] overflow-hidden shadow-2xl bg-[#0B1120]">

        <div className="flex-1 overflow-y-auto pb-28 relative">
          <Outlet />
        </div>

        <div className="absolute bottom-0 w-full px-4 pb-6 pt-12 bg-gradient-to-t from-[#080F22] via-[#0B1120]/90 to-transparent z-50 pointer-events-none">
          <div className="flex w-full justify-between items-center bg-[#1A233A]/80 backdrop-blur-2xl border border-white/10 p-2 rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.5)] pointer-events-auto relative">
            <NavItem to="/tips" icon={<Lightbulb size={24} />} label="Conseils" />
            <NavItem to="/tires" icon={<CircleDot size={24} />} label="Pneus" />
            <NavItem to="/challenges" icon={<Swords size={24} />} label="Défis" />
            <NavItem to="/profile" icon={<User size={24} />} label="Profil" />
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink to={to} className="relative flex-1 flex justify-center h-14">
      {({ isActive }) => (
        <div className="relative w-full h-full flex items-center justify-center">
          <div
            className={`absolute inset-0 mx-2 bg-[#FCE500]/10 rounded-xl transition-all duration-300 ease-out ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
              }`}
          />
          <div
            className={`relative z-10 flex flex-col items-center gap-1 transition-all duration-300 ease-out ${isActive ? 'text-[#FCE500] -translate-y-1' : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <div className={`transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_8px_rgba(252,229,0,0.5)]' : ''}`}>
              {icon}
            </div>

            <span className="text-[10px] font-medium tracking-wide">
              {label}
            </span>
            <div
              className={`absolute -bottom-2 w-1 h-1 rounded-full bg-[#FCE500] transition-all duration-300 delay-75 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                }`}
            />
          </div>
        </div>
      )}
    </NavLink>
  );
}