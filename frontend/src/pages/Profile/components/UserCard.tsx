import { useState } from 'react';
import { MapPin, Check, Camera } from 'lucide-react';
import { LiquidGlassCard } from '../../../components/ui/LiquidGlassCard';
import type { UserProfile } from '../../../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export function UserCard({ user }: { user: UserProfile }) {
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);

    const handleAvatarChange = () => {
        const url = prompt('URL de votre nouvelle photo de profil :', avatarUrl || '');
        if (url === null) return;
        const token = localStorage.getItem('token');
        fetch(`${BACKEND_URL}/users/me`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ avatar_url: url }),
        })
            .then(r => r.json())
            .then(() => setAvatarUrl(url));
    };

    return (
        <LiquidGlassCard className="rounded-4xl p-5">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                    <button onClick={handleAvatarChange} className="relative group w-15 h-15 shrink-0">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="avatar" className="w-15 h-15 rounded-full border-[3px] border-[#FCE500] object-cover" />
                        ) : (
                            <div className="w-15 h-15 rounded-full border-[3px] border-[#FCE500] flex items-center justify-center bg-[#FCE500]/30 text-white font-extrabold text-2xl tracking-tight shadow-inner">
                                {user.initials}
                            </div>
                        )}
                        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera size={16} className="text-white" />
                        </div>
                    </button>
                    <div>
                        <h2 className="font-bold text-lg leading-tight">
                            {user.firstName} {user.lastName}
                        </h2>
                        <div className="flex items-center text-xs text-slate-300 mt-1">
                            <MapPin size={12} className="mr-1" />
                            {user.location}
                        </div>
                    </div>
                </div>
                <div className="bg-[#FCE500] text-black font-bold text-xs px-3 py-2 rounded-xl text-center leading-tight">
                    NIV. {user.level}<br />{user.title}
                </div>
            </div>

            {user.isCertified && (
                <div className="font-bold inline-flex items-center gap-1.5 bg-[#84BD00]/22 text-[#D6EBA6] text-xs px-3 py-1.5 rounded-full mb-6 border border-[#A0D25A]/45">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#84BD00] text-white shadow-sm">
                        <Check size={10} strokeWidth={4} />
                    </div>
                    Rouleur certifié • {user.sensorType}
                </div>
            )}

            <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                    <span className="text-white">{user.title}</span>
                    <span className="text-slate-300">{user.xpCurrent} / {user.xpMax} XP</span>
                    <span className="text-slate-300">Expert</span>
                </div>
                <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#FCE500] rounded-full"
                        style={{ width: `${Math.min((user.xpCurrent / user.xpMax) * 100, 100)}%` }}
                    />
                </div>
            </div>
        </LiquidGlassCard>
    );
}
