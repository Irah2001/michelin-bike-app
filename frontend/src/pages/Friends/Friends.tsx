import { useEffect, useState } from 'react';
import { Loader2, Users, ShieldCheck, ChevronRight } from 'lucide-react';
import { friends, users, challenges } from '../../services/api';

interface UserProfile {
  id: string;
  name: string;
}

interface Friend {
  id: string;
  name: string;
  rank?: number;
  km?: number;
  distance?: number;
}

interface LeaderboardEntry {
  user_id: string;
  rank: number;
  km: number;
}

interface Challenge {
  id: string;
  title: string;
  current_progress: number;
  goal: number;
  end_date: string;
}

export default function Friends() {
  const [loading, setLoading] = useState(true);
  const [friendList, setFriendList] = useState<Friend[]>([]);
  const [me, setMe] = useState<UserProfile | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [challengeLb, setChallengeLb] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    Promise.all([
      friends.list<Friend[]>(),
      users.me<UserProfile>(),
      challenges.list<{ data: Challenge[] }>(1, 1),
    ]).then(([fl, profile, ch]) => {
      setFriendList(fl as unknown as Friend[]);
      setMe(profile);

      const data = ch?.data || (Array.isArray(ch) ? ch : []);
      const active = data[0];

      if (active) {
        setChallenge(active);
        challenges.leaderboard<LeaderboardEntry[]>(active.id)
          .then((lb) => setChallengeLb(lb as unknown as LeaderboardEntry[]))
          .catch(() => { });
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-[#FCE500]" size={40} /></div>;

  const progress = challenge ? Math.min(Math.round((challenge.current_progress / challenge.goal) * 100), 100) : 67;
  const currentKm = challenge?.current_progress || 67466;
  const remaining = challenge?.end_date ? getTimeRemaining(challenge.end_date) : '3j 14h';
  const memberCount = challengeLb.length || friendList.length || 1284;

  // Build leaderboard from challenge lb or friends
  const leaderboard: Friend[] = challengeLb.length > 0
    ? challengeLb.slice(0, 5).map(lb => ({ id: lb.user_id, name: `User ${lb.user_id}`, rank: lb.rank, km: lb.km }))
    : friendList.slice(0, 5).map((f, i) => ({ ...f, rank: i + 1, km: 500 - (i * 75) }));

  const myRank = challengeLb.find(e => e.user_id === me?.id)?.rank || 41;
  const myKm = challengeLb.find(e => e.user_id === me?.id)?.km || 184;
  const initials = me?.name?.split(' ').map(n => n[0]?.toUpperCase()).join('').slice(0, 2) || 'CR';

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 bg-[url('/images/bg-community.png')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-linear-to-b from-[#081026]/32 via-[#081026]/18 to-[#081026]/94" />

      <div className="relative w-full p-5 flex flex-col gap-5 overflow-y-auto pb-28">
        {/* Header pill */}
        <div className="flex items-center justify-between pt-4">
          <div className="bg-white/12 border border-white/20 backdrop-blur-[7px] rounded-full px-4 py-2 inline-flex items-center gap-2">
            <Users size={15} />
            <span className="font-semibold text-[12px]">Communautés</span>
          </div>
          <button className="w-9.5 h-9.5 rounded-[19px] bg-white/14 border border-white/22 backdrop-blur-[7px] flex items-center justify-center">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Collective Challenge Card */}
        <div className="bg-[rgba(10,17,38,0.5)] border border-white/16 backdrop-blur-md rounded-[22px] p-5 shadow-[0_14px_44px_rgba(0,0,0,0.34)] relative overflow-hidden">
          {/* Glow */}
          <div className="absolute -top-10 -right-10 w-32.5 h-32.5 rounded-full bg-[radial-gradient(circle,rgba(252,229,0,0.22)_0%,transparent_70%)]" />

          <div className="flex items-center justify-between mb-3">
            <p className="text-[#FCE500] font-bold text-[10px] uppercase tracking-[0.14em]">Défi collectif en cours</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.75 h-1.75 rounded-full bg-[#FF5B5B] opacity-40 animate-pulse" />
              <span className="text-white/75 font-bold text-[10.5px]">LIVE</span>
            </div>
          </div>

          <h2 className="font-archivo font-extrabold text-[20px] mb-4">
            {challenge?.title || '100 000 km en 7 jours'}
          </h2>

          {/* Big number */}
          <div className="text-center mb-1">
            <span className="font-archivo font-extrabold text-[46px] leading-[46px] tracking-tight text-[#FCE500] drop-shadow-[0_4px_22px_rgba(252,229,0,0.3)]">
              {currentKm.toLocaleString()}
            </span>
          </div>
          <p className="text-center text-white/55 text-[11.5px] mb-4">kilomètres parcourus collectivement</p>

          {/* Progress bar */}
          <div className="h-[12px] bg-white/14 rounded-[7px] overflow-hidden mb-4">
            <div className="h-full bg-[#FCE500] rounded-[7px]" style={{ width: `${progress}%` }} />
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="font-archivo font-extrabold text-[16px]">{progress}%</p>
              <p className="text-white/50 text-[10px]">atteint</p>
            </div>
            <div className="w-px h-[31px] bg-white/14" />
            <div className="text-center flex-1">
              <p className="font-archivo font-extrabold text-[16px]">{remaining}</p>
              <p className="text-white/50 text-[10px]">restantes</p>
            </div>
            <div className="w-px h-[31px] bg-white/14" />
            <div className="text-center flex-1">
              <p className="font-archivo font-extrabold text-[16px]">{memberCount.toLocaleString()}</p>
              <p className="text-white/50 text-[10px]">rouleurs</p>
            </div>
          </div>

          {/* CTA */}
          <button className="mt-5 w-full bg-[#FCE500] rounded-[14px] py-3.5 font-bold text-[15px] text-[#11264F] shadow-[0_8px_24px_rgba(252,229,0,0.32)]">
            Contribuer au défi
          </button>
        </div>

        {/* Ambassador Card */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-[12px] rounded-[24px] p-5 shadow-[0_14px_44px_rgba(0,0,0,0.32)]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[#FCE500] font-bold text-[10px] uppercase tracking-[0.16em]">Ambassadeur Michelin</p>
            <div className="bg-[rgba(132,189,0,0.24)] border border-[rgba(160,210,90,0.45)] rounded-full px-2.5 py-1 inline-flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-[#D6EBA6]" />
              <span className="text-[#D6EBA6] font-bold text-[10.5px]">Stats vérifiées</span>
            </div>
          </div>

          <h3 className="font-archivo font-extrabold text-[27px] tracking-tight">Paul Seixas</h3>
          <p className="text-white/70 text-[12.5px] mt-1">Coureur professionnel · Mont Ventoux</p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-white/8 border border-white/14 rounded-[12px] p-2.5 text-center">
              <p className="font-archivo font-extrabold text-[15px]">28 400</p>
              <p className="text-white/60 text-[10px]">km saison</p>
            </div>
            <div className="bg-white/8 border border-white/14 rounded-[12px] p-2.5 text-center">
              <p className="font-archivo font-extrabold text-[15px]">412 k</p>
              <p className="text-white/60 text-[10px]">m D+ saison</p>
            </div>
            <div className="bg-white/8 border border-white/14 rounded-[12px] p-2.5 text-center">
              <p className="font-archivo font-extrabold text-[15px]">1 284</p>
              <p className="text-white/60 text-[10px]">membres</p>
            </div>
          </div>

          <button className="mt-4 w-full bg-[#FCE500] rounded-[14px] py-3.5 font-bold text-[15px] text-[#11264F] shadow-[0_8px_24px_rgba(252,229,0,0.32)]">
            Rejoindre le groupe
          </button>
        </div>

        {/* Member Leaderboard */}
        <div className="flex items-center justify-between">
          <h3 className="font-archivo font-bold text-[15px]">Classement des membres</h3>
          <span className="text-white/55 text-[12px]">km du défi</span>
        </div>

        <div className="bg-white/8 border border-white/16 backdrop-blur-[10px] rounded-[18px] p-4 shadow-[0_10px_32px_rgba(0,0,0,0.26)]">
          <div className="flex flex-col gap-3">
            {leaderboard.map((member, i) => (
              <LeaderRow
                key={member.id || i}
                rank={member.rank || i + 1}
                name={member.name || `Membre ${i + 1}`}
                initials={member.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '??'}
                km={member.km || member.distance || 0}
                verified={i < 2}
                rankColor={i === 0 ? '#FCE500' : i === 1 ? '#D7DEEC' : i === 2 ? '#E0A977' : undefined}
              />
            ))}
          </div>

          {/* Current user row */}
          <div className="mt-3 bg-[rgba(252,229,0,0.16)] border border-[rgba(252,229,0,0.4)] rounded-[13px] px-4 py-3 flex items-center gap-3">
            <span className="font-archivo font-extrabold text-[14px] text-[#FCE500] w-6 text-center">{myRank}</span>
            <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-[#FCE500] to-[#FDED44] p-[2px]">
              <div className="w-full h-full rounded-full bg-[rgba(10,17,36,0.7)] flex items-center justify-center">
                <span className="font-archivo font-bold text-[12px]">{initials}</span>
              </div>
            </div>
            <span className="font-bold text-[13.5px] flex-1">{me?.name || 'Vous'} · vous</span>
            <span className="font-archivo font-bold text-[14px] text-[#FCE500]">{myKm} km</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaderRow({ rank, name, initials, km, verified, rankColor }: { rank: number; name: string; initials: string; km: number; verified?: boolean; rankColor?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-archivo font-extrabold text-[15px] w-5 text-center" style={{ color: rankColor || 'rgba(255,255,255,0.6)' }}>{rank}</span>
      <div className="w-[38px] h-[38px] rounded-full bg-white/18 border border-white/20 flex items-center justify-center">
        <span className="font-archivo font-bold text-[13px]">{initials}</span>
      </div>
      <span className="font-semibold text-[13.5px] flex-1">{name}</span>
      {verified && <ShieldCheck size={13} className="text-[#D6EBA6]" />}
      <span className="font-archivo font-bold text-[14px]">{km}</span>
    </div>
  );
}

function getTimeRemaining(endDate: string): string {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return 'Terminé';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return `${days}j ${hours}h`;
}
