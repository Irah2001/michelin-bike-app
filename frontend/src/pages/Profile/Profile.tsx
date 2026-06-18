import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Repeat, Mountain, Gauge, Clock, Trophy, Timer, ShieldCheck, Zap, Settings2, Loader2, AlertTriangle, ChevronRight, MapPin, Check } from 'lucide-react';
import { useProfileData } from '../../hooks/useProfileData';
import { PROFILE_TABS } from '../../constants';
import { users, tires as tiresApi } from '../../services/api';

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
    const { user, stats, badges, isLoading } = useProfileData(activeTab);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [wornTire, setWornTire] = useState(false);

    useEffect(() => {
        tiresApi.list().then(tires => {
            setWornTire(tires.some((t: any) => t.is_active && (t.wear_score ?? 100) < 30));
        }).catch(() => {});
    }, []);

    const openLeaderboard = () => {
        setShowLeaderboard(true);
        users.leaderboard({ limit: 20, sort: 'km' } as any).then(setLeaderboard).catch(() => {});
    };

    if (isLoading || !user || !stats) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="animate-spin text-[#FCE500]" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white relative overflow-hidden">
            {/* Background image */}
            <div className="absolute inset-0 bg-[url('/images/bg-profile.jpg')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#081026]/42 via-[#081026]/30 to-[#081026]/92" />

            <div className="relative w-full p-5 flex flex-col gap-5 overflow-y-auto pb-28">
                {/* Header */}
                <div className="flex items-center justify-between pt-4">
                    <h1 className="font-archivo font-extrabold text-[21px] drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">Mon profil</h1>
                    <button className="w-[38px] h-[38px] rounded-[19px] bg-white/14 border border-white/22 backdrop-blur-[7px] flex items-center justify-center">
                        <Settings2 size={18} />
                    </button>
                </div>

                {/* User Card */}
                <div className="bg-white/10 border border-white/20 backdrop-blur-[11px] rounded-[24px] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="w-[62px] h-[62px] rounded-full bg-gradient-to-br from-[#FCE500] to-[#FDED44] p-[2.5px]">
                                <div className="w-full h-full rounded-full bg-[rgba(10,17,36,0.6)] backdrop-blur-[3px] flex items-center justify-center">
                                    <span className="font-archivo font-bold text-[21px]">{user.initials}</span>
                                </div>
                            </div>
                            <div>
                                <h2 className="font-archivo font-bold text-[19px]">{user.firstName} {user.lastName}</h2>
                                <div className="flex items-center gap-1 mt-1">
                                    <MapPin size={12} className="text-white/72" />
                                    <span className="text-white/72 text-[12.5px]">{user.location}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#FCE500] rounded-[13px] px-3 py-2 shadow-[0_4px_16px_rgba(252,229,0,0.3)]">
                            <p className="font-archivo font-extrabold text-[11px] leading-[11px] text-[#11264F] text-center">NIV. {user.level}</p>
                            <p className="font-noto font-bold text-[11px] text-[#11264F] text-center">{user.title}</p>
                        </div>
                    </div>

                    {user.isCertified && (
                        <div className="mt-3 bg-[rgba(132,189,0,0.22)] border border-[rgba(160,210,90,0.45)] rounded-full px-3 py-1.5 inline-flex items-center gap-2">
                            <div className="w-3.5 h-3.5 rounded-full bg-[#84BD00]/50 flex items-center justify-center">
                                <Check size={8} strokeWidth={4} className="text-white" />
                            </div>
                            <span className="text-[#D6EBA6] font-bold text-[12px]">Rouleur certifié · {user.sensorType}</span>
                        </div>
                    )}

                    {/* XP Progress */}
                    <div className="mt-4 flex items-center justify-between text-[11px]">
                        <span className="font-bold">{user.title}</span>
                        <span className="text-white/60">{user.xpCurrent.toLocaleString()} / {user.xpMax.toLocaleString()} XP</span>
                        <span className="text-white/45">Expert</span>
                    </div>
                    <div className="mt-1.5 h-[9px] bg-white/16 rounded-[6px] overflow-hidden">
                        <div className="h-full bg-white/16 rounded-[6px]" style={{ width: `${Math.min((user.xpCurrent / user.xpMax) * 100, 100)}%` }} />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-white/8 backdrop-blur-[9px] p-1 rounded-[14px] border border-white/14">
                    {PROFILE_TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2.5 text-[12.5px] font-semibold rounded-[10px] transition-all ${activeTab === tab
                                ? 'bg-[#FCE500] text-[#11264F] font-bold'
                                : 'text-white/70 hover:text-white'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <StatCard icon={<Repeat size={18} />} value={stats.totalDistance} unit="km" label="Distance totale" />
                    <StatCard icon={<Mountain size={18} />} value={stats.totalElevation} unit="m D+" label="Dénivelé cumulé" />
                    <StatCard icon={<Gauge size={18} />} value={stats.maxSpeed} unit="km/h" label="Vitesse max" />
                    <StatCard icon={<Clock size={18} />} value={stats.timeInSaddle} unit={stats.timeUnit || 'h'} label="Temps en selle" />
                </div>

                {/* Badges Section */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-archivo font-bold text-[15px]">Badges</h3>
                        <span className="text-[#FCE500] font-semibold text-[12px]">
                            {badges.filter(b => b.unlocked).length} / {badges.length} débloqués
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                        {badges.map((badge) => (
                            <div
                                key={badge.id}
                                className={`flex flex-col items-center justify-center p-3 rounded-[16px] border text-center gap-1.5 aspect-[1.57] backdrop-blur-[8px] ${
                                    badge.unlocked
                                        ? 'bg-white/10 border-[rgba(252,229,0,0.3)]'
                                        : 'bg-white/4 border-white/10'
                                }`}
                            >
                                <div className={badge.unlocked ? 'text-[#FCE500]' : 'text-white/45'}>
                                    {iconMap[badge.iconName] || <Trophy size={24} />}
                                </div>
                                <span className={`text-[10.5px] font-semibold leading-[13px] ${badge.unlocked ? 'text-white' : 'text-white/45'}`}>
                                    {badge.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Regional Leaderboard CTA */}
                <button onClick={openLeaderboard} className="w-full bg-[#FCE500] rounded-[16px] p-4 shadow-[0_10px_30px_rgba(252,229,0,0.3)] flex items-center gap-4">
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

            {/* Leaderboard Modal */}
            {showLeaderboard && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={() => setShowLeaderboard(false)}>
                    <div className="bg-[#1a2235] border border-white/10 rounded-2xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h3 className="font-archivo font-bold text-[16px] mb-4 flex items-center gap-2"><Trophy size={18} className="text-[#FCE500]" /> Classement km</h3>
                        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
                            {leaderboard.map((p: any) => (
                                <div key={p.id} className={`flex items-center gap-3 bg-white/5 rounded-lg p-2.5 ${p.id === user.id ? 'border border-[#FCE500]/40' : ''}`}>
                                    <span className={`w-6 text-center font-bold text-sm ${p.rank <= 3 ? 'text-[#FCE500]' : 'text-slate-400'}`}>{p.rank}</span>
                                    <span className="text-sm flex-1">{p.name}</span>
                                    <span className="text-xs text-slate-400">{p.total_km || 0} km</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setShowLeaderboard(false)} className="mt-4 w-full bg-white/10 py-2 rounded-xl text-sm">Fermer</button>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, value, unit, label }: { icon: React.ReactNode; value: string | number; unit: string; label: string }) {
    return (
        <div className="bg-white/10 border border-white/18 backdrop-blur-[10px] rounded-[18px] p-4 shadow-[0_8px_26px_rgba(0,0,0,0.22)]">
            <div className="w-[34px] h-[34px] rounded-[10px] bg-[rgba(157,180,224,0.22)] border border-white/16 mb-4 flex items-center justify-center text-white/70">
                {icon}
            </div>
            <div className="flex items-baseline gap-1">
                <span className="font-archivo font-extrabold text-[25px] tracking-tight">{value}</span>
                <span className="text-white/60 font-semibold text-[11.5px]">{unit}</span>
            </div>
            <p className="text-white/62 text-[11.5px] mt-0.5">{label}</p>
        </div>
    );
}
