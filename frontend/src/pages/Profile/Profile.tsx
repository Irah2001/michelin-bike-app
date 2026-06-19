import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Repeat, Mountain, Gauge, Clock, Trophy, Timer, ShieldCheck, Zap, Settings2, Loader2, AlertTriangle, ChevronRight } from 'lucide-react';
import { StatCard } from './components/StatCard';
import { BadgeCard } from './components/BadgeCard';
import { UserCard } from './components/UserCard';
import { useProfileData } from '../../hooks/useProfileData';
import { PROFILE_TABS } from '../../constants';
import { users, tires as tiresApi } from '../../services/api';

interface LeaderboardPlayer {
    id: string;
    rank: number;
    name: string;
    total_km: number;
}

interface Tire {
    is_active: boolean;
    wear_score?: number;
}

const iconMap: Record<string, React.ReactNode> = {
    Trophy: <Trophy size={24} />,
    Timer: <Timer size={24} />,
    ShieldCheck: <ShieldCheck size={24} />,
    Mountain: <Mountain size={24} />,
    Zap: <Zap size={24} />,
    Repeat: <Repeat size={24} />
};

export default function Profile() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<(typeof PROFILE_TABS)[number]>('All-time');

    // On garde les données dynamiques de la V1 (dont les vrais badges API)
    const { user, stats, badges, isLoading } = useProfileData(activeTab);

    const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [wornTire, setWornTire] = useState(false);

    useEffect(() => {
        tiresApi.list<Tire[]>().then(response => {
            const tires = Array.isArray(response[0]) ? response[0] : response;
            setWornTire((tires as unknown as Tire[]).some((t) => t.is_active && (t.wear_score ?? 100) < 30));
        });
    }, []);

    const openLeaderboard = () => {
        setShowLeaderboard(true);
        users.leaderboard<LeaderboardPlayer[]>(
            { limit: 20, sort: 'km' } as Record<string, unknown>
        )
            .then((data) => setLeaderboard(data as unknown as LeaderboardPlayer[]))
            .catch(() => { });
    };

    if (isLoading || !user || !stats) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="animate-spin text-[#FCE500]" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B1120] text-white font-sans selection:bg-[#FCE500] selection:text-black relative overflow-hidden flex justify-center">
            {/* Background images */}
            <div className="absolute inset-0 bg-[url('/images/bg-profile.jpg')] bg-cover bg-center opacity-80" />
            <div className="absolute inset-0 bg-linear-to-b from-[#0B1120]/30 via-[#0B1120]/60 to-[#0B1120]" />

            <div className="relative w-full max-w-md p-6 flex flex-col gap-6 z-10 overflow-y-auto pb-28">

                {/* Header */}
                <div className="flex items-center justify-between pt-4">
                    <h1 className="text-2xl font-bold font-archivo drop-shadow-md">Mon profil</h1>
                    <button className="p-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                        <Settings2 size={20} className="text-white" />
                    </button>
                </div>

                {/* User Card (Composant externe) */}
                <UserCard user={user} />

                {/* Alerte Pneu Usé (V1) */}
                {wornTire && (
                    <button
                        onClick={() => navigate('/tires')}
                        className="w-full text-left bg-[#FF5B5B]/10 border border-[#FF5B5B]/25 backdrop-blur-[11px] rounded-[20px] p-4 shadow-[0_8px_24px_rgba(255,91,91,0.15)] flex items-center gap-4 transition-all hover:bg-[#FF5B5B]/15"
                    >
                        <div className="w-10 h-10 shrink-0 rounded-full bg-[#FF5B5B]/20 flex items-center justify-center">
                            <AlertTriangle size={20} className="text-[#FF5B5B]" />
                        </div>
                        <div className="flex-1">
                            <p className="font-archivo font-bold text-[14px] text-[#FF5B5B]">Action requise</p>
                            <p className="text-[#FF5B5B]/70 text-[11.5px] mt-0.5 leading-tight">
                                L'un de vos pneus a un niveau d'usure critique. Pensez à le vérifier.
                            </p>
                        </div>
                        <ChevronRight size={20} className="text-[#FF5B5B]/50" />
                    </button>
                )}

                {/* Tabs */}
                <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-[20px] border border-white/10 shadow-inner">
                    {PROFILE_TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2.5 text-[13px] font-semibold rounded-2xl transition-all duration-300 ${activeTab === tab
                                ? 'bg-[#FCE500] text-black shadow-lg scale-[1.02]'
                                : 'text-slate-300 hover:text-white'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Stats Grid (Composants externes) */}
                <div className="grid grid-cols-2 gap-4">
                    <StatCard icon={<Repeat size={20} />} value={stats.totalDistance} unit="km" label="Distance totale" />
                    <StatCard icon={<Mountain size={20} />} value={stats.totalElevation} unit="m D+" label="Dénivelé cumulé" />
                    <StatCard icon={<Gauge size={20} />} value={stats.maxSpeed} unit="km/h" label="Vitesse max" />
                    <StatCard icon={<Clock size={20} />} value={stats.timeInSaddle} unit={stats.timeUnit || 'h'} label="Temps en selle" />
                </div>

                {/* Badges Section (Composants externes avec data dynamique) */}
                <div className="mt-2 flex flex-col gap-4">
                    <div className="flex justify-between items-end">
                        <h3 className="text-xl font-bold font-archivo tracking-tight">Badges</h3>
                        <span className="text-[#FCE500] text-sm font-semibold">
                            {badges.filter(b => b.unlocked).length} / {badges.length} débloqués
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {badges.map((badge) => (
                            <BadgeCard
                                key={badge.id}
                                icon={iconMap[badge.iconName] || <Trophy size={24} />}
                                label={badge.label}
                                unlocked={badge.unlocked}
                            />
                        ))}
                    </div>
                </div>

                {/* Regional Leaderboard CTA (V1) */}
                <button onClick={openLeaderboard} className="w-full bg-[#FCE500] rounded-[16px] p-4 shadow-[0_10px_30px_rgba(252,229,0,0.3)] flex items-center gap-4 mt-2">
                    <div className="w-[38px] h-[38px] rounded-[11px] bg-[rgba(17,38,79,0.12)] flex items-center justify-center">
                        <Trophy size={20} className="text-[#11264F]" />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-bold text-[14px] text-[#11264F]">Mon classement régional</p>
                        <p className="text-[11.5px] text-[rgba(17,38,79,0.7)]">4ᵉ en {user.location?.split('·')[0]?.trim() || 'Auvergne-Rhône-Alpes'}</p>
                    </div>
                    <ChevronRight size={20} className="text-[#11264F]" />
                </button>
            </div>

            {/* Leaderboard Modal (V1) */}
            {showLeaderboard && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={() => setShowLeaderboard(false)}>
                    <div className="bg-[#1a2235] border border-white/10 rounded-2xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h3 className="font-archivo font-bold text-[16px] mb-4 flex items-center gap-2">
                            <Trophy size={18} className="text-[#FCE500]" /> Classement km
                        </h3>
                        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-2">
                            {leaderboard.map((p) => (
                                <div key={p.id} className={`flex items-center gap-3 bg-white/5 rounded-lg p-2.5 ${p.id === user.id ? 'border border-[#FCE500]/40' : ''}`}>
                                    <span className={`w-6 text-center font-bold text-sm ${p.rank <= 3 ? 'text-[#FCE500]' : 'text-slate-400'}`}>{p.rank}</span>
                                    <span className="text-sm flex-1 truncate">
                                        <div onClick={() => navigate(`/profile/${p.id}`)}>
                                            {p.name}
                                        </div>
                                    </span>
                                    <span className="text-xs text-slate-400 shrink-0">{p.total_km || 0} km</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setShowLeaderboard(false)} className="mt-4 w-full bg-white/10 py-3 rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors">
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}