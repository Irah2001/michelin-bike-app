import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Trophy, MapPin, Shield, Target } from 'lucide-react';
import { users } from '../../services/api';

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    users.getPublicProfile(id).then(setProfile).catch(() => navigate('/challenges')).finally(() => setLoading(false));
  }, [id]);

  if (loading || !profile) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-[#FCE500]" size={40} /></div>;
  }

  return (
    <div className="p-6 flex flex-col gap-6 pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm">
        <ArrowLeft size={16} /> Retour
      </button>

      {/* Profile Header */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/15 rounded-3xl p-5 flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-[#FCE500]/20 border-2 border-[#FCE500] flex items-center justify-center text-2xl font-bold text-[#FCE500]">
          {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" /> : profile.name?.charAt(0)}
        </div>
        <h2 className="text-xl font-bold">{profile.name}</h2>
        {profile.is_ambassador && (
          <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
            <Shield size={12} /> Ambassadeur
          </span>
        )}
        {(profile.city || profile.region) && (
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <MapPin size={12} /> {[profile.city, profile.region].filter(Boolean).join(', ')}
          </span>
        )}
        <div className="flex gap-4 mt-2">
          <div className="text-center">
            <p className="text-lg font-bold text-[#FCE500]">{profile.level}</p>
            <p className="text-[10px] text-slate-400">Niveau</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{profile.xp?.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">XP</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{Math.round(profile.best_distance_km || 0)}</p>
            <p className="text-[10px] text-slate-400">Best km</p>
          </div>
        </div>
      </div>

      {/* Badges */}
      {profile.badges?.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Trophy size={18} className="text-[#FCE500]" /> Badges</h3>
          <div className="flex flex-wrap gap-2">
            {profile.badges.map((b: any) => (
              <span key={b.id} className="text-xs bg-[#FCE500]/10 border border-[#FCE500]/30 text-[#FCE500] px-3 py-1.5 rounded-full">
                {b.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Challenges Created */}
      {profile.challenges_created?.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Target size={18} className="text-[#FCE500]" /> Défis créés</h3>
          <div className="flex flex-col gap-2">
            {profile.challenges_created.map((c: any) => (
              <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-sm font-semibold">{c.title}</p>
                <p className="text-xs text-slate-400">{c.target_km} km • {c.current_km?.toFixed(0) || 0} km atteints</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
