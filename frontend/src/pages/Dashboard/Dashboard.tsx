import { useEffect, useState } from 'react';
import { Trophy, TrendingUp, Route, Loader2 } from 'lucide-react';
import { users, sensorData } from '../../services/api';
import { PageWrapper } from '../../components/ui/PageWrapper';

interface UserProfile {
  level: number;
  level_name: string;
  xp: number;
  best_distance_km: number;
}

interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  level: number;
  xp: number;
}

interface Ride {
  id: string;
  distance_km: number;
  recorded_at: string;
  avg_speed: number;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [recentRides, setRecentRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [lbFilter, setLbFilter] = useState<'global' | 'friends'>('global');

  useEffect(() => {
    Promise.all([
      users.me<UserProfile>(),
      users.leaderboard<LeaderboardUser[]>({ limit: 10, filter: 'global' }),
      sensorData.list<{ data: Ride[] }>({ limit: 5 }),
    ]).then(([p, lb, rides]) => {
      setProfile(p);
      setLeaderboard((Array.isArray(lb) ? (Array.isArray(lb[0]) ? lb[0] : lb) : []) as LeaderboardUser[]);
      setRecentRides(rides?.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    users.leaderboard<LeaderboardUser[]>({ limit: 10, filter: lbFilter })
      .then((data) => {
        setLeaderboard((Array.isArray(data) ? (Array.isArray(data[0]) ? data[0] : data) : []) as LeaderboardUser[]);
      })
      .catch(console.error);
  }, [lbFilter]);

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-[#FCE500]" size={40} /></div>;

  return (
    <PageWrapper>
      <div className="p-6 flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>

        {/* Stats rapides */}
        {profile && (
          <div className="grid grid-cols-3 gap-3">
            <QuickStat icon={<Trophy size={18} />} label="Niveau" value={`${profile.level}`} sub={profile.level_name} />
            <QuickStat icon={<TrendingUp size={18} />} label="XP" value={`${profile.xp}`} />
            <QuickStat icon={<Route size={18} />} label="Best km" value={`${Math.round(profile.best_distance_km || 0)}`} />
          </div>
        )}

        {/* Dernières sorties */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Dernières sorties</h2>
          {recentRides.length === 0 ? (
            <p className="text-slate-400 text-sm">Aucune sortie enregistrée</p>
          ) : (
            <div className="flex flex-col gap-2">
              {recentRides.map((r) => (
                <div key={r.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{r.distance_km?.toFixed(1)} km</p>
                    <p className="text-xs text-slate-400">{new Date(r.recorded_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    {r.avg_speed ? `${r.avg_speed.toFixed(1)} km/h` : '—'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Leaderboard */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">🏆 Classement</h2>
            <div className="flex bg-white/10 rounded-xl p-0.5">
              <button onClick={() => setLbFilter('global')} className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${lbFilter === 'global' ? 'bg-[#FCE500] text-black' : 'text-slate-400'}`}>Global</button>
              <button onClick={() => setLbFilter('friends')} className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${lbFilter === 'friends' ? 'bg-[#FCE500] text-black' : 'text-slate-400'}`}>Amis</button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {leaderboard.map((u) => (
              <div key={u.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                <span className={`text-sm font-bold w-6 text-center ${u.rank <= 3 ? 'text-[#FCE500]' : 'text-slate-400'}`}>
                  {u.rank}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-xs text-slate-400">Niv. {u.level} • {u.xp} XP</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}

function QuickStat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center gap-1">
      <span className="text-[#FCE500]">{icon}</span>
      <span className="text-lg font-bold">{value}</span>
      <span className="text-[10px] text-slate-400">{sub || label}</span>
    </div>
  );
}
