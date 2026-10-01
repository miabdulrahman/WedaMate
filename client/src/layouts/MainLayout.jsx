import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import MobileBottomNav from '../components/layout/MobileBottomNav.jsx';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface)] text-[var(--ink)] pb-16 md:pb-0">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;
