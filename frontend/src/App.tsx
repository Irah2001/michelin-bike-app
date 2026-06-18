import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layout/MainLayout';
import Login from './pages/Login/Login';
import Profile from './pages/Profile/Profile';
import Community from './pages/Community/Community';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<MainLayout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/community" element={<Community />} />
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          {/* <Route path="/ride" element={<Ride />} /> */}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
