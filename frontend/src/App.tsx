import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Profile from './pages/Profile/Profile';
import { MainLayout } from './layout/MainLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<MainLayout />}>
          <Route path="/profile" element={<Profile />} />
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          {/* <Route path="/ride" element={<Ride />} /> */}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
