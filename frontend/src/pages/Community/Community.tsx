import { useEffect, useState } from 'react';
import { MoreVertical, Loader2 } from 'lucide-react';
import { AmbassadorCard } from './components/AmbassadorCard';
import { ChallengeCard } from './components/ChallengeCard';
import { challenges, users } from '../../services/api';
import type { AmbassadorProfile, CollectiveChallenge } from '../../types';

function getTimeRemaining(endDate: string): string {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return 'Terminé';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return `${days}j ${hours}h`;
}

export default function Community() {
  const [loading, setLoading] = useState(true);
  const [ambassador, setAmbassador] = useState<AmbassadorProfile | null>(null);
  const [challenge, setChallenge] = useState<CollectiveChallenge | null>(null);

  useEffect(() => {
    challenges.list(1, 1).then(async (res) => {
      const data = res?.data || res || [];
      const active = data[0];
      if (active) {
        const pct = active.target_km > 0 ? Math.min(100, Math.round((active.current_km / active.target_km) * 100)) : 0;
        setChallenge({
          id: active.id,
          typeLabel: 'Défi collectif en cours',
          isLive: true,
          title: active.title,
          currentValue: Math.round(active.current_km),
          targetValue: active.target_km,
          unitLabel: 'kilomètres parcourus collectivement',
          stats: {
            percentage: pct,
            timeLeft: getTimeRemaining(active.end_date),
            ridersCount: active.participant_count || 0,
          },
        });

        if (active.created_by) {
          try {
            const creator = await users.getPublicProfile(active.created_by);
            setAmbassador({
              id: creator.id,
              roleLabel: 'Ambassadeur Michelin',
              isStatsVerified: creator.is_ambassador,
              name: creator.name,
              isVerifiedUser: creator.is_ambassador,
              description: `${creator.level_name} · ${creator.city || creator.region || 'France'}`,
              stats: {
                seasonKm: Math.round(creator.best_distance_km || 0).toLocaleString(),
                seasonElevation: Math.round(creator.best_elevation_m || 0).toLocaleString(),
                membersCount: String(active.participant_count || 0),
              },
            });
          } catch {}
        }
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-[#FCE500]" size={40} /></div>;

  return (
    <div className="min-h-screen bg-black bg-[url('/images/bg-community.png')] bg-cover bg-center bg-no-repeat bg-fixed flex flex-col relative">
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      <header className="relative z-10 flex items-center justify-between p-6 pt-12">
        <h1 className="text-2xl font-bold">Communautés</h1>
        <button className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
          <MoreVertical size={16} />
        </button>
      </header>

      <main className="relative z-10 flex-1 px-4 pb-24 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-4">
          {ambassador && <AmbassadorCard ambassador={ambassador} />}
          {challenge && <ChallengeCard challenge={challenge} />}
        </div>
      </main>
    </div>
  );
}
