import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ChevronLeft, MapPin, ShieldCheck, Trophy, CircleDot } from 'lucide-react';
import { users } from '../../services/api';

interface PublicTire {
  name: string;
  count: number;
  total_km: number;
  purchase_url?: string | null;
}

interface PublicBadge {
  id: string;
  name: string;
  image_url: string;
}

interface PublicStats {
  total_km: number;
  total_elevation: number;
  max_speed: number;
  total_hours: number;
}

interface PublicProfileData {
  name: string;
  city?: string;
  region?: string;
  level: number;
  level_name: string;
  is_ambassador: boolean;
  stats?: PublicStats;
  tires?: PublicTire[];
  badges?: PublicBadge[];
}

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    users.getPublicProfile(id)
      .then((data) => setProfile(data as unknown as PublicProfileData))
      .catch(() => navigate(-1))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading || !profile) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-[#FCE500]" size={40} /></div>;

  const initials = profile.name?.split(' ').map((n: string) => n[0]?.toUpperCase()).join('').slice(0, 2) || '??';
  const location = [profile.city, profile.region].filter(Boolean).join(' · ') || 'France';

  return (
    <div className="min-h-screen text-white relative overflow-y-auto pb-28">
      <div className="absolute inset-0 bg-gradient-to-b from-[#27509B]/20 via-[#080F22] to-[#080F22]" />

      <div className="relative p-5 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center gap-3 pt-2">
          <button onClick={() => navigate(-1)} className="w-[38px] h-[38px] rounded-[19px] bg-white/12 border border-white/20 backdrop-blur-[7px] flex items-center justify-center">
            <ChevronLeft size={18} />
          </button>
          <span className="text-white/80 font-bold text-[13px]">Profil</span>
        </div>

        {/* User Card */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-[12px] rounded-[24px] p-5 shadow-[0_14px_44px_rgba(0,0,0,0.32)]">
          <div className="flex items-center gap-4">
            <div className="w-[62px] h-[62px] rounded-full bg-gradient-to-br from-[#FCE500] to-[#FDED44] p-[2.5px]">
              <div className="w-full h-full rounded-full bg-[rgba(10,17,36,0.6)] backdrop-blur-[3px] flex items-center justify-center">
                <span className="font-archivo font-bold text-[21px]">{initials}</span>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="font-archivo font-bold text-[19px]">{profile.name}</h2>
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={12} className="text-white/60" />
                <span className="text-white/60 text-[12.5px]">{location}</span>
              </div>
            </div>
            <div className="bg-[#FCE500] rounded-[13px] px-3 py-2 shadow-[0_4px_16px_rgba(252,229,0,0.3)]">
              <p className="font-archivo font-extrabold text-[11px] text-[#11264F] text-center">NIV. {profile.level}</p>
              <p className="font-noto font-bold text-[11px] text-[#11264F] text-center">{profile.level_name}</p>
            </div>
          </div>

          {profile.is_ambassador && (
            <div className="mt-3 bg-[rgba(132,189,0,0.22)] border border-[rgba(160,210,90,0.45)] rounded-full px-3 py-1.5 inline-flex items-center gap-2">
              <ShieldCheck size={12} className="text-[#D6EBA6]" />
              <span className="text-[#D6EBA6] font-bold text-[12px]">Ambassadeur Michelin</span>
            </div>
          )}
        </div>

        {/* Stats */}
        {profile.stats && (
          <div className="grid grid-cols-2 gap-3">
            <StatBox value={profile.stats.total_km.toLocaleString()} unit="km" label="Distance totale" />
            <StatBox value={profile.stats.total_elevation.toLocaleString()} unit="m D+" label="Dénivelé cumulé" />
            <StatBox value={String(profile.stats.max_speed)} unit="km/h" label="Vitesse max" />
            <StatBox value={String(profile.stats.total_hours)} unit="h" label="Temps en selle" />
          </div>
        )}

        {/* Tires */}
        {profile.tires && profile.tires.length > 0 && (
          <div>
            <h3 className="font-archivo font-bold text-[15px] mb-3 flex items-center gap-2">
              <CircleDot size={16} className="text-[#FCE500]" /> Pneus utilisés
            </h3>
            <div className="flex flex-col gap-2">
              {profile.tires.map((t, i) => (
                <div key={i} className="bg-white/8 border border-white/14 backdrop-blur-[10px] rounded-[14px] p-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[13px]">{t.name}</p>
                    <p className="text-white/50 text-[11px]">{t.count > 1 ? `${t.count} pneus utilisés` : '1 pneu'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-archivo font-bold text-[14px] text-[#FCE500]">{t.total_km.toLocaleString()} km</p>
                    <a target="_blank" rel="noopener noreferrer" className="bg-[#FCE500] text-[#11264F] px-2.5 py-1 rounded-[8px] font-bold text-[10px]">
                      Acheter
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        {profile.badges && profile.badges.length > 0 && (
          <div>
            <h3 className="font-archivo font-bold text-[15px] mb-3 flex items-center gap-2">
              <Trophy size={16} className="text-[#FCE500]" /> Badges ({profile.badges.length})
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {profile.badges.map((b) => (
                <div key={b.id} className="bg-white/10 border border-[rgba(252,229,0,0.3)] rounded-[14px] p-3 text-center">
                  <p className="text-lg mb-1">{b.image_url}</p>
                  <p className="text-[10px] font-semibold">{b.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <div className="bg-white/10 border border-white/18 backdrop-blur-[10px] rounded-[18px] p-4 shadow-[0_8px_26px_rgba(0,0,0,0.22)]">
      <div className="flex items-baseline gap-1">
        <span className="font-archivo font-extrabold text-[22px] tracking-tight">{value}</span>
        <span className="text-white/60 font-semibold text-[11px]">{unit}</span>
      </div>
      <p className="text-white/60 text-[11px] mt-0.5">{label}</p>
    </div>
  );
}
