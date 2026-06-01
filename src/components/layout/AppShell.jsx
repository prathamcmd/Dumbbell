import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BottomNav from './BottomNav';
import RoutinePage from '../../pages/RoutinePage';
import MyDietPage from '../../pages/MyDietPage';
import TailoringPage from '../../pages/TailoringPage';
import ProfilePage from '../../pages/ProfilePage';

export default function AppShell() {
  return (
    <div className="flex flex-col min-h-dvh bg-[#F2F2F2]">
      <main className="page-content">
        <Routes>
          <Route path="/"        element={<RoutinePage />} />
          <Route path="/mydiet"  element={<MyDietPage />} />
          <Route path="/tailor"  element={<TailoringPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}
