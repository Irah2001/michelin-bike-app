import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, strava, users } from '../../services/api';

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      users.me().then(me => {
        navigate(me.has_completed_onboarding ? '/tires' : '/onboarding', { replace: true });
      }).catch(() => localStorage.removeItem('token'));
    }
  }, []);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = mode === 'register'
        ? await auth.register(form.email, form.password, form.name)
        : await auth.login(form.email, form.password);
      localStorage.setItem('token', res.access_token);
      const me = await users.me();
      navigate(me.has_completed_onboarding ? '/profile' : '/onboarding');
    } catch {
      setError(mode === 'login' ? 'Email ou mot de passe incorrect' : 'Inscription échouée (email déjà utilisé ?)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-[#0B1120] px-6">
      <h1 className="text-3xl font-bold text-[#FCE500]">Michelin Bike</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-3">
        {mode === 'register' && (
          <input placeholder="Nom" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-400" />
        )}
        <input type="email" placeholder="Email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-400" />
        <input type="password" placeholder="Mot de passe" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-400" />
        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        <button type="submit" disabled={loading} className="bg-[#FCE500] text-black rounded-xl py-3 font-semibold text-sm disabled:opacity-50">
          {loading ? '...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
        </button>
        <button type="button" onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }} className="text-xs text-slate-400 hover:text-white">
          {mode === 'login' ? "Pas de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
        </button>
      </form>

      <div className="flex items-center gap-3 w-full max-w-xs">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-slate-500">ou</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <button
        onClick={() => { window.location.href = strava.loginUrl(); }}
        className="flex items-center gap-2 rounded-xl bg-[#FC4C02] px-6 py-3 font-semibold text-white shadow-lg hover:bg-[#e04400] active:scale-95 transition-all text-sm"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
        </svg>
        Connecter avec Strava
      </button>
    </div>
  );
}
