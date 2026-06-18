import { MoreVertical } from 'lucide-react';
import { AmbassadorCard } from './components/AmbassadorCard';
import { ChallengeCard } from './components/ChallengeCard';

// TODO: Replace with real data fetching logic
const MOCK_AMBASSADOR = {
    id: '1',
    roleLabel: 'Ambassadeur Michelin',
    isStatsVerified: true,
    name: 'Paul Seixas',
    isVerifiedUser: true,
    description: 'Coureur professionnel • Mont Ventoux',
    stats: {
        seasonKm: '28 400',
        seasonElevation: '412 k',
        membersCount: '1284',
    }
};

const MOCK_CHALLENGE = {
    id: '1',
    typeLabel: 'Défi collectif en cours',
    isLive: true,
    title: '100 000 km en 7 jours',
    currentValue: 67466,
    targetValue: 100000,
    unitLabel: 'kilomètres parcourus collectivement',
    stats: {
        percentage: 67,
        timeLeft: '3j 14h',
        ridersCount: 1284,
    }
};

export default function Community() {
    return (
        <div className="min-h-screen bg-black bg-[url('/images/bg-community.jpg')] bg-cover bg-center bg-no-repeat bg-fixed flex flex-col relative">
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />

            {/* Top Navigation */}
            <header className="relative z-10 flex items-center justify-between p-6 pt-12">
                <h1 className="text-2xl font-bold">Communautés</h1>
                <button className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-colors">
                    <MoreVertical size={16} />
                </button>
            </header>

            {/* Scrollable Content */}
            <main className="relative z-10 flex-1 px-4 pb-24 overflow-y-auto">
                <div className="max-w-md mx-auto space-y-4">
                    <AmbassadorCard ambassador={MOCK_AMBASSADOR} />
                    <ChallengeCard challenge={MOCK_CHALLENGE} />
                </div>
            </main>
        </div>
    );
}