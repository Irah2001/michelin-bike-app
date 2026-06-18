import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { users } from '../services/api';

export default function StravaCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      users.me().then(me => {
        navigate(me.has_completed_onboarding ? '/profile' : '/onboarding');
      }).catch(() => navigate('/profile'));
    } else {
      navigate('/');
    }
  }, [params, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#0B1120]">
      <div className="animate-spin h-8 w-8 border-4 border-[#FCE500] border-t-transparent rounded-full" />
    </div>
  );
}
