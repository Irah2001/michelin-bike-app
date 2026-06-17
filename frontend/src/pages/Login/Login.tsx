const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default function Login() {
    const handleStravaLogin = () => {
        window.location.href = `${BACKEND_URL}/strava/login`;
    };

    return (
        <div className="flex h-screen flex-col items-center justify-center gap-6 bg-slate-900">
            <h1 className="text-3xl font-bold text-[#FCE500]">Michelin Bike App</h1>
            <button
                onClick={handleStravaLogin}
                className="flex items-center gap-2 rounded-xl bg-[#FC4C02] px-6 py-3 font-semibold text-white shadow-lg hover:bg-[#e04400] active:scale-95 transition-all"
            >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                </svg>
                Connecter avec Strava
            </button>
        </div>
    );
}