import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function StravaCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      navigate('/profile');
    } else {
      navigate('/');
    }
  }, [params, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-900">
      <div className="animate-spin h-8 w-8 border-4 border-[#FCE500] border-t-transparent rounded-full" />
    </div>
  );
}
