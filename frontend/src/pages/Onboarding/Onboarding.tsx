import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bluetooth, Trophy, TrendingUp, ChevronRight, Check } from 'lucide-react';
import { users } from '../../services/api';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&q=80',
    icon: <TrendingUp size={32} className="text-[#FCE500]" />,
    title: 'Bienvenue sur Michelin Bike',
    description: 'Transformez chaque kilomètre en progression. Capteur connecté, stats en temps réel, et défis communautaires.',
  },
  {
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    icon: <Bluetooth size={32} className="text-[#FCE500]" />,
    title: 'Appairage capteur BLE',
    description: 'Votre capteur Michelin se connecte automatiquement via Bluetooth pour collecter vos données de roulage.',
    hasBleSimulation: true,
  },
  {
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80',
    icon: <Trophy size={32} className="text-[#FCE500]" />,
    title: 'Prêt à rouler !',
    description: 'Gagnez des XP, débloquez des badges, grimpez dans le classement et rejoignez des défis collectifs.',
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [bleState, setBleState] = useState<'idle' | 'scanning' | 'connected'>('idle');

  const handleNext = async () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      await users.completeOnboarding().catch(() => {});
      navigate('/profile');
    }
  };

  const handleSkip = async () => {
    await users.completeOnboarding().catch(() => {});
    navigate('/profile');
  };

  const handleBleScan = () => {
    setBleState('scanning');
    setTimeout(() => setBleState('connected'), 2000);
  };

  const slide = slides[current];

  return (
    <div className="flex h-screen flex-col bg-[#0B1120] relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 transition-all duration-500"
        style={{ backgroundImage: `url(${slide.image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1120]/40 via-[#0B1120]/70 to-[#0B1120]" />

      {/* Skip */}
      <button onClick={handleSkip} className="absolute top-12 right-6 text-xs text-slate-400 hover:text-white z-20">
        Passer
      </button>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/15 flex items-center justify-center">
          {slide.icon}
        </div>
        <h2 className="text-2xl font-bold text-white">{slide.title}</h2>
        <p className="text-slate-300 text-sm leading-relaxed max-w-xs">{slide.description}</p>

        {/* BLE Simulation */}
        {slide.hasBleSimulation && (
          <div className="mt-4">
            {bleState === 'idle' && (
              <button onClick={handleBleScan} className="bg-[#FCE500] text-black px-6 py-3 rounded-xl font-semibold text-sm">
                Scanner le capteur
              </button>
            )}
            {bleState === 'scanning' && (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-3">
                <div className="w-4 h-4 border-2 border-[#FCE500] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-slate-300">Recherche en cours...</span>
              </div>
            )}
            {bleState === 'connected' && (
              <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl px-5 py-3">
                <Check size={18} className="text-green-400" />
                <span className="text-sm text-green-300">Capteur Michelin connecté !</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="relative z-10 px-8 pb-12 flex flex-col items-center gap-4">
        {/* Dots */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-[#FCE500] w-6' : 'bg-white/20'}`} />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full max-w-xs bg-[#FCE500] text-black py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
        >
          {current === slides.length - 1 ? 'Commencer' : 'Suivant'}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
