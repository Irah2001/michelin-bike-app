import React from 'react';
import { Lock } from 'lucide-react';

interface BadgeCardProps {
    icon: React.ReactNode;
    label: string;
    description?: string;
    unlocked: boolean;
    progress?: number;
    current?: number;
    target?: number;
    unit?: string;
}

export function BadgeCard({ icon, label, description, unlocked, progress = 0, current, target, unit }: BadgeCardProps) {
    return (
        <div
            data-testid="badge-card-container"
            className={`group relative flex flex-col items-center justify-center p-3 rounded-[20px] border text-center gap-1.5 aspect-square transition-all ${unlocked
                ? 'bg-white/5 backdrop-blur-md border-[#FCE500]/40 text-[#FCE500] shadow-[0_0_15px_rgba(252,229,0,0.05)]'
                : 'bg-white/5 backdrop-blur-md border-white/10 text-slate-500 opacity-60'
                }`}
        >
            {/* Tooltip */}
            {description && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 border border-slate-600 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                    {description}
                </div>
            )}

            {!unlocked && (
                <Lock data-testid="lock-icon" size={12} className="absolute top-2.5 right-2.5 text-slate-500" />
            )}
            <div className={`${unlocked ? 'text-[#FCE500]' : 'text-slate-500'} drop-shadow-md`}>
                {icon}
            </div>
            <span className={`text-[10px] font-semibold leading-tight px-1 ${unlocked ? 'text-white' : 'text-slate-400'}`}>
                {label}
            </span>
            {!unlocked && (
                <div className="w-full px-1">
                    <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#FCE500]/60 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    {current !== undefined && target !== undefined && (
                        <span className="text-[8px] text-slate-500 mt-0.5">
                            {current}/{target} {unit}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
