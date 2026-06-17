import React from 'react';
import { LiquidGlassCard } from '../../../components/ui/LiquidGlassCard';

interface StatCardProps {
    icon: React.ReactNode;
    value: string | number;
    unit: string;
    label: string;
}

export function StatCard({ icon, value, unit, label }: StatCardProps) {
    return (
        <LiquidGlassCard className="p-5 rounded-3xl h-32.5 flex flex-col justify-between">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-300">
                {icon}
            </div>
            <div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">{value}</span>
                    <span className="text-sm font-medium text-slate-300">{unit}</span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">{label}</p>
            </div>
        </LiquidGlassCard>
    );
}