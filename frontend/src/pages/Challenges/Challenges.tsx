import { useEffect, useState } from 'react';
import { Loader2, Users, ShieldCheck, Plus } from 'lucide-react';
import { challenges, users } from '../../services/api';

export default function Challenges() {
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<any>(null);
  const [creator, setCreator] = useState<any>(null);
  const [challengeLb, setChallengeLb] = useState<any[]>([]);
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    Promise.all([challenges.list(), users.me()])
      .then(([ch, profile]) => {
        setMe(profile);
        const data = ch?.data || ch || [];
        const active = data[0];
        if (active) {
          setChallenge(active);
          challenges.leaderboard(active.id).then(setChallengeLb).catch(() => {});
          if (active.created_by) {
            users.getPublicProfile(active.created_by).then(setCreator).catch(() => {});
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = () => {
    if (!challenge || challenge.is_participant) return;
    challenges.join(challenge.id).then(() => {
      setChallenge((c: any) => ({ ...c, is_participant: true }));
    }).catch(console.error);
  };

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-[#FCE500]" size={40} /></div>;

  const progress = challenge?.target_km > 0 ? Math.min(100, Math.round((challenge.current_km / challenge.target_km) * 100)) : 0;
  const currentKm = Math.round(challenge?.current_km || 0);
  const remaining = challenge?.end_date ? getTimeRemaining(challenge.end_date) : '—';
  const memberCount = challenge?.participant_count || challengeLb.length || 0;

  const initials = me?.name?.split(' ').map((n: string) => n[0]?.toUpperCase()).join('').slice(0, 2) || '??';
  const myEntry = challengeLb.find((e: any) => e.user_id === me?.id);
  const myRank = myEntry?.rank || (challengeLb.length + 1);
  const myKm = Math.round(myEntry?.contributed_km || 0);

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/bg-community.png')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#081026]/32 via-[#081026]/18 to-[#081026]/94" />

      <div className="relative w-full p-5 flex flex-col gap-5 overflow-y-auto pb-28">
        {/* Header */}
        <div className="flex items-center justify-between pt-4">
          <div className="bg-white/12 border border-white/20 backdrop-blur-[7px] rounded-full px-4 py-2 inline-flex items-center gap-2">
            <Users size={15} />
            <span className="font-semibold text-[12px]">Communautés</span>
          </div>
          <button className="w-[38px] h-[38px] rounded-[19px] bg-white/14 border border-white/22 backdrop-blur-[7px] flex items-center justify-center">
            <Plus size={18} />
          </button>
        </div>

        {/* Collective Challenge */}
        {challenge && (
          <div className="bg-[rgba(10,17,38,0.5)] border border-white/16 backdrop-blur-[12px] rounded-[22px] p-5 shadow-[0_14px_44px_rgba(0,0,0,0.34)] relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-[130px] h-[130px] rounded-full bg-[radial-gradient(circle,rgba(252,229,0,0.22)_0%,transparent_70%)]" />

            <div className="flex items-center justify-between mb-3">
              <p className="text-[#FCE500] font-bold text-[10px] uppercase tracking-[0.14em]">Défi collectif en cours</p>
              <div className="flex items-center gap-1.5">
                <div className="w-[7px] h-[7px] rounded-full bg-[#FF5B5B] opacity-40 animate-pulse" />
                <span className="text-white/75 font-bold text-[10.5px]">LIVE</span>
              </div>
            </div>

            <h2 className="font-archivo font-extrabold text-[20px] mb-4">{challenge.title}</h2>

            <div className="text-center mb-1">
              <span className="font-archivo font-extrabold text-[46px] leading-[46px] tracking-tight text-[#FCE500] drop-shadow-[0_4px_22px_rgba(252,229,0,0.3)]">
                {currentKm.toLocaleString()}
              </span>
            </div>
            <p className="text-center text-white/55 text-[11.5px] mb-4">kilomètres parcourus collectivement</p>

            <div className="h-[12px] bg-white/14 rounded-[7px] overflow-hidden mb-4">
              <div className="h-full bg-[#FCE500] rounded-[7px]" style={{ width: `${progress}%` }} />
            </div>

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

            <button onClick={handleJoin} className="mt-5 w-full bg-[#FCE500] rounded-[14px] py-3.5 font-bold text-[15px] text-[#11264F] shadow-[0_8px_24px_rgba(252,229,0,0.32)]">
              {challenge.is_participant ? 'Contribuer au défi' : 'Rejoindre le défi'}
            </button>
          </div>
        )}

        {/* Ambassador Card - from challenge creator */}
        {creator && (
          <div className="bg-white/10 border border-white/20 backdrop-blur-[12px] rounded-[24px] p-5 shadow-[0_14px_44px_rgba(0,0,0,0.32)]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[#FCE500] font-bold text-[10px] uppercase tracking-[0.16em]">Ambassadeur Michelin</p>
              {creator.is_ambassador && (
                <div className="bg-[rgba(132,189,0,0.24)] border border-[rgba(160,210,90,0.45)] rounded-full px-2.5 py-1 inline-flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-[#D6EBA6]" />
                  <span className="text-[#D6EBA6] font-bold text-[10.5px]">Stats vérifiées</span>
                </div>
              )}
            </div>

            <h3 className="font-archivo font-extrabold text-[27px] tracking-tight">{creator.name}</h3>
            <p className="text-white/70 text-[12.5px] mt-1">
              {creator.level_name} · {creator.city || creator.region || 'France'}
            </p>

            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-white/8 border border-white/14 rounded-[12px] p-2.5 text-center">
                <p className="font-archivo font-extrabold text-[15px]">{Math.round(creator.best_distance_km || 0).toLocaleString()}</p>
                <p className="text-white/60 text-[10px]">km record</p>
              </div>
              <div className="bg-white/8 border border-white/14 rounded-[12px] p-2.5 text-center">
                <p className="font-archivo font-extrabold text-[15px]">{Math.round(creator.best_elevation_m || 0).toLocaleString()}</p>
                <p className="text-white/60 text-[10px]">m D+ record</p>
              </div>
              <div className="bg-white/8 border border-white/14 rounded-[12px] p-2.5 text-center">
                <p className="font-archivo font-extrabold text-[15px]">{memberCount.toLocaleString()}</p>
                <p className="text-white/60 text-[10px]">membres</p>
              </div>
            </div>

            <button className="mt-4 w-full bg-[#FCE500] rounded-[14px] py-3.5 font-bold text-[15px] text-[#11264F] shadow-[0_8px_24px_rgba(252,229,0,0.32)]">
              Rejoindre le groupe
            </button>
          </div>
        )}

        {/* Member Leaderboard */}
        {challengeLb.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="font-archivo font-bold text-[15px]">Classement des membres</h3>
              <span className="text-white/55 text-[12px]">km du défi</span>
            </div>

            <div className="bg-white/8 border border-white/16 backdrop-blur-[10px] rounded-[18px] p-4 shadow-[0_10px_32px_rgba(0,0,0,0.26)]">
              <div className="flex flex-col gap-4">
                {challengeLb.slice(0, 5).map((member: any, i: number) => {
                  const memberInitials = member.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '??';
                  const rankColor = i === 0 ? '#FCE500' : i === 1 ? '#D7DEEC' : i === 2 ? '#E0A977' : 'rgba(255,255,255,0.6)';
                  return (
                    <div key={member.user_id} className="flex items-center gap-3">
                      <span className="font-archivo font-extrabold text-[15px] w-5 text-center" style={{ color: rankColor }}>{member.rank}</span>
                      <div className="w-[38px] h-[38px] rounded-full bg-white/15 border border-white/20 flex items-center justify-center">
                        <span className="font-archivo font-bold text-[13px]">{memberInitials}</span>
                      </div>
                      <span className="font-semibold text-[13.5px] flex-1">{member.name}</span>
                      {i < 2 && <ShieldCheck size={13} className="text-[#D6EBA6]" />}
                      <span className="font-archivo font-bold text-[14px]">{Math.round(member.contributed_km)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Current user row */}
              <div className="mt-4 bg-[rgba(252,229,0,0.16)] border border-[rgba(252,229,0,0.4)] rounded-[13px] px-4 py-3 flex items-center gap-3">
                <span className="font-archivo font-extrabold text-[14px] text-[#FCE500] w-5 text-center">{myRank}</span>
                <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-[#FCE500] to-[#FDED44] p-[2px]">
                  <div className="w-full h-full rounded-full bg-[rgba(10,17,36,0.7)] flex items-center justify-center">
                    <span className="font-archivo font-bold text-[12px]">{initials}</span>
                  </div>
                </div>
                <span className="font-bold text-[13.5px] flex-1">{me?.name || 'Vous'} · vous</span>
                <span className="font-archivo font-bold text-[14px] text-[#FCE500]">{myKm} km</span>
              </div>
            </div>
          </>
        )}
      </div>
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
