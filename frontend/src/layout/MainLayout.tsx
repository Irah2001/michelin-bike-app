import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Bike, User } from 'lucide-react';

export function MainLayout() {
    return (
        <div className="min-h-screen bg-[#0B1120] text-white flex justify-center selection:bg-[#FCE500] selection:text-black">
            <div className="w-full max-w-md relative flex flex-col h-screen overflow-hidden">
                <div className="flex-1 overflow-y-auto pb-24 relative">
                    <Outlet />
                </div>

                <div className="absolute bottom-0 w-full px-6 pb-6 pt-2 bg-linear-to-t from-[#0B1120] via-[#0B1120]/90 to-transparent z-50">
                    <div className="flex justify-between items-center bg-white/10 backdrop-blur-xl border border-white/15 px-6 py-4 rounded-3xl shadow-2xl">
                        <NavItem to="/dashboard" icon={<LayoutDashboard size={22} />} label="Bord" />
                        <NavItem to="/ride" icon={<Bike size={24} />} label="Ride" isCenter />
                        <NavItem to="/profile" icon={<User size={22} />} label="Profil" />
                    </div>
                </div>

            </div>
        </div>
    );
}

function NavItem({ to, icon, label, isCenter = false }: { to: string, icon: React.ReactNode, label: string, isCenter?: boolean }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => `
        flex flex-col items-center gap-1 transition-all duration-300
        ${isActive ? 'text-[#FCE500] scale-110' : 'text-slate-500 hover:text-slate-300'}
        ${isCenter ? '-mt-8 bg-[#FCE500] text-black p-4 rounded-full shadow-[0_10px_20px_rgba(252,229,0,0.3)] scale-100!' : ''}
      `}
        >
            {icon}
            {!isCenter && <span className="text-[10px] font-semibold">{label}</span>}
        </NavLink>
    );
}