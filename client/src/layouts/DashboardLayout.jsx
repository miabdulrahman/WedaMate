import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Sidebar from '../components/layout/Sidebar.jsx';
import MobileBottomNav from '../components/layout/MobileBottomNav.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const DashboardLayout = ({ role }) => {
  const { user } = useAuth();
  const activeRole = role || user?.role || 'customer';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface)] text-[var(--ink)] pb-16 md:pb-0">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar role={activeRole} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default DashboardLayout;
