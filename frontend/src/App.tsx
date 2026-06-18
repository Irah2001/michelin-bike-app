import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Profile from './pages/Profile/Profile';
import PublicProfile from './pages/PublicProfile/PublicProfile';
import Onboarding from './pages/Onboarding/Onboarding';
import StravaCallback from './pages/StravaCallback';
import Dashboard from './pages/Dashboard/Dashboard';
import Ride from './pages/Ride/Ride';
import Challenges from './pages/Challenges/Challenges';
import Tires from './pages/Tires/Tires';
import Tips from './pages/Tips/Tips';
import Friends from './pages/Friends/Friends';
import Community from './pages/Community/Community';
import { MainLayout } from './layout/MainLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/strava/callback" element={<StravaCallback />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ride" element={<Ride />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/community" element={<Community />} />
          <Route path="/tires" element={<Tires />} />
          <Route path="/tips" element={<Tips />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<PublicProfile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
