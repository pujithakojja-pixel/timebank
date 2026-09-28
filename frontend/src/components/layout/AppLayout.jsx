import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

export default function AppLayout() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <main style={{ paddingTop: 'var(--nav-height)' }}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
