import React from 'react';

interface LiquidGlassCardProps {
    children: React.ReactNode;
    className?: string; // Pour les espacements spécifiques
}

export function LiquidGlassCard({ children, className = '' }: LiquidGlassCardProps) {
    return (
        <div className={`
            relative overflow-hidden

            bg-white/5 backdrop-blur-xl

            border border-white/15

            shadow-[0_20px_40px_rgba(0,0,0,0.5)]

            before:content-[''] before:absolute before:inset-0
            before:bg-[linear-gradient(135deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0.05)_20%,rgba(255,255,255,0.01)_100%)]
            before:mask-[linear-gradient(0deg,rgba(255,255,255,0.8)_0%,rgba(255,255,255,1)_100%)]
            before:opacity-90 before:z-1

            after:content-[''] after:absolute 
            after:w-75 after:h-75 after:-top-40 after:-left-40
            after:bg-white/4 after:rounded-full after:blur-[60px]
            after:z-0 after:pointer-events-none

            transition-all duration-300 hover:border-white/30

            ${className}
        `}>
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
}