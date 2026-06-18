import { LiquidGlassCard } from '../../../components/ui/LiquidGlassCard';
import type { CollectiveChallenge } from '../../../types';

interface ChallengeCardProps {
    challenge: CollectiveChallenge;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
    const formattedValue = new Intl.NumberFormat('fr-FR').format(challenge.currentValue);

    return (
        <LiquidGlassCard className="p-6 rounded-4xl backdrop-blur-xl bg-slate-900/60 border border-white/10 mt-4">
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <span className="text-[#FCE500] text-[10px] font-extrabold uppercase tracking-wider">
                    {challenge.typeLabel}
                </span>
                {challenge.isLive && (
                    <div className="flex items-center gap-1.5 text-white/80 text-[10px] font-bold tracking-widest">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        LIVE
                    </div>
                )}
            </div>

            <h3 className="text-xl font-bold text-white mb-6">{challenge.title}</h3>

            {/* Big Numbers */}
            <div className="text-center mb-6">
                <div className="text-5xl font-extrabold text-[#FCE500] drop-shadow-[0_0_25px_rgba(252,229,0,0.4)] tracking-tight">
                    {formattedValue}
                </div>
                <div className="text-slate-400 text-xs mt-2">{challenge.unitLabel}</div>
            </div>

            {/* Progress Bar */}
            <div className="mb-5">
                <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden mb-4">
                    <div
                        className="h-full rounded-full bg-linear-to-r from-blue-500 to-[#FCE500]"
                        style={{ width: `${Math.min(challenge.stats.percentage, 100)}%` }}
                    />
                </div>

                {/* Progress Stats */}
                <div className="grid grid-cols-3 gap-4 text-center divide-x divide-white/10">
                    <div>
                        <div className="text-white font-bold text-lg">{challenge.stats.percentage}%</div>
                        <div className="text-slate-400 text-[10px]">atteint</div>
                    </div>
                    <div>
                        <div className="text-white font-bold text-lg">{challenge.stats.timeLeft}</div>
                        <div className="text-slate-400 text-[10px]">restantes</div>
                    </div>
                    <div>
                        <div className="text-white font-bold text-lg">{challenge.stats.ridersCount}</div>
                        <div className="text-slate-400 text-[10px]">rouleurs</div>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <button className="w-full bg-[#FCE500] hover:bg-[#FCE500]/90 text-black font-bold py-3.5 rounded-2xl transition-colors active:scale-[0.98]">
                Contribuer au défi
            </button>
        </LiquidGlassCard>
    );
}