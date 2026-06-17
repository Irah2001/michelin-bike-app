import { SensorDashboard } from './components/SensorDashboard';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function App() {
  const handleStravaLogin = () => {
    window.location.href = `${BACKEND_URL}/strava/login`;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Michelin Bike App</h1>
        <button
          onClick={handleStravaLogin}
          className="flex items-center gap-2 rounded-lg bg-[#FC4C02] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#e04400] active:scale-95 transition-all"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
          </svg>
          Connecter avec Strava
        </button>
      </div>
      <SensorDashboard />
    </div>
  );
}

export default App;
