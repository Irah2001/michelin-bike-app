import { Check, BadgeCheck } from 'lucide-react';
import { LiquidGlassCard } from '../../../components/ui/LiquidGlassCard';
import type { AmbassadorProfile } from '../../../types';

interface AmbassadorCardProps {
    ambassador: AmbassadorProfile;
}

export function AmbassadorCard({ ambassador }: AmbassadorCardProps) {
    return (
        <LiquidGlassCard className="p-5 rounded-4xl backdrop-blur-xl bg-white/10 border border-white/20">
            {/* Header: Tags */}
            <div className="flex justify-between items-start mb-3">
                <span className="text-[#FCE500] text-[10px] font-extrabold uppercase tracking-wider">
                    {ambassador.roleLabel}
                </span>
                {ambassador.isStatsVerified && (
                    <div className="flex items-center gap-1.5 bg-[#84BD00]/20 text-[#A0D25A] text-[10px] px-2 py-1 rounded-full border border-[#84BD00]/30 font-semibold">
                        <div className="bg-[#84BD00] rounded-full p-0.5 text-white">
                            <Check size={8} strokeWidth={4} />
                        </div>
                        Stats vérifiées
                    </div>
                )}
            </div>

            {/* Profile Info */}
            <div className="mb-5">
                <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                    {ambassador.name}
                    {ambassador.isVerifiedUser && (
                        <BadgeCheck size={24} className="text-[#FCE500] fill-[#FCE500]/20" />
                    )}
                </h2>
                <p className="text-slate-300 text-sm mt-1">{ambassador.description}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-5">
                <div className="bg-black/25 rounded-2xl p-3 text-center border border-white/5">
                    <div className="text-white font-bold text-lg">{ambassador.stats.seasonKm}</div>
                    <div className="text-slate-400 text-[10px] leading-tight">km saison</div>
                </div>
                <div className="bg-black/25 rounded-2xl p-3 text-center border border-white/5">
                    <div className="text-white font-bold text-lg">{ambassador.stats.seasonElevation}</div>
                    <div className="text-slate-400 text-[10px] leading-tight">m D+ saison</div>
                </div>
                <div className="bg-black/25 rounded-2xl p-3 text-center border border-white/5">
                    <div className="text-white font-bold text-lg">{ambassador.stats.membersCount}</div>
                    <div className="text-slate-400 text-[10px] leading-tight">membres</div>
                </div>
            </div>

            {/* Action Button */}
            <button className="w-full bg-[#FCE500] hover:bg-[#FCE500]/90 text-black font-bold py-3.5 rounded-2xl transition-colors active:scale-[0.98]">
                Rejoindre le groupe
            </button>
        </LiquidGlassCard>
    );
}