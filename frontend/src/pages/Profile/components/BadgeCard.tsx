// BadgeCard.tsx
import React from 'react';
import { Lock } from 'lucide-react';

interface BadgeCardProps {
    icon: React.ReactNode;
    label: string;
    unlocked: boolean;
}

export function BadgeCard({ icon, label, unlocked }: BadgeCardProps) {
    return (
        <div
            data-testid="badge-card-container"
            className={`relative flex flex-col items-center justify-center p-3 rounded-[20px] border text-center gap-2.5 aspect-square transition-all ${unlocked
                ? 'bg-white/5 backdrop-blur-md border-[#FCE500]/40 text-[#FCE500] shadow-[0_0_15px_rgba(252,229,0,0.05)]'
                : 'bg-white/5 backdrop-blur-md border-white/10 text-slate-500 opacity-60'
                }`}
        >
            {!unlocked && (
                <Lock data-testid="lock-icon" size={12} className="absolute top-2.5 right-2.5 text-slate-500" />
            )}
            <div className={`${unlocked ? 'text-[#FCE500]' : 'text-slate-500'} drop-shadow-md`}>
                {icon}
            </div>
            <span className={`text-[10px] font-semibold leading-tight px-1 ${unlocked ? 'text-white' : 'text-slate-400'}`}>
                {label}
            </span>
        </div>
    );
}