import { useState } from 'react';
import { Repeat, Mountain, Gauge, Clock, Trophy, Timer, ShieldCheck, Zap, Settings2, Loader2 } from 'lucide-react';
import { StatCard } from './components/StatCard';
import { BadgeCard } from './components/BadgeCard';
import { UserCard } from './components/UserCard';
import { useProfileData } from '../../hooks/useProfileData';
import { PROFILE_TABS } from '../../constants';

const iconMap: Record<string, React.ReactNode> = {
    Trophy: <Trophy size={24} />,
    Timer: <Timer size={24} />,
    ShieldCheck: <ShieldCheck size={24} />,
    Mountain: <Mountain size={24} />,
    Zap: <Zap size={24} />,
    Repeat: <Repeat size={24} />
};

export default function Profile() {
    const [activeTab, setActiveTab] = useState<(typeof PROFILE_TABS)[number]>('All-time');
    const { user, stats, badges, isLoading } = useProfileData(activeTab);

    if (isLoading || !user || !stats) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="animate-spin text-[#FCE500]" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B1120] text-white font-sans selection:bg-[#FCE500] selection:text-black relative overflow-hidden flex justify-center">
            <div
                className="absolute inset-0 bg-[url('/images/bg-profile.jpg')] bg-cover bg-center opacity-80"
            />
            <div className="absolute inset-0 bg-linear-to-b from-[#0B1120]/30 via-[#0B1120]/60 to-[#0B1120]" />

            <div className="relative w-full max-w-md p-6 flex flex-col gap-6 z-10 overflow-y-auto pb-24">

                {/* Header */}
                <div className="flex items-center justify-between pt-4">
                    <h1 className="text-2xl font-bold">Mon profil</h1>
                    <button className="p-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                        <Settings2 size={20} className="text-white" />
                    </button>
                </div>

                {/* User Card */}
                <UserCard user={user} />

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

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <StatCard icon={<Repeat size={20} />} value={stats.totalDistance} unit="km" label="Distance totale" />
                    <StatCard icon={<Mountain size={20} />} value={stats.totalElevation} unit="m D+" label="Dénivelé cumulé" />
                    <StatCard icon={<Gauge size={20} />} value={stats.maxSpeed} unit="km/h" label="Vitesse max" />
                    <StatCard icon={<Clock size={20} />} value={stats.timeInSaddle} unit="h" label="Temps en selle" />
                </div>

                {/* Badges Section */}
                <div className="mt-2 flex flex-col gap-4">
                    <div className="flex justify-between items-end">
                        <h3 className="text-xl font-bold tracking-tight">Badges</h3>
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
                                description={badge.description}
                                unlocked={badge.unlocked}
                                progress={badge.progress}
                                current={badge.current}
                                target={badge.target}
                                unit={badge.unit}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}