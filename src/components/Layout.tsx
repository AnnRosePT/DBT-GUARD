import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { UtilityStrip } from './UtilityStrip';
import { BrandBar } from './BrandBar';
import { AccentLine } from './AccentLine';
import { MainNav } from './MainNav';
import { PrototypeBanner } from './PrototypeBanner';
import { Footer } from './Footer';
import { Toast } from './Toast';
import { useAppStore } from '../store/useAppStore';
import { useUIStore } from '../store/useUIStore';

export const Layout: React.FC = () => {
  const { cases, isLoaded, loadDemoData, resetDemo } = useAppStore();
  const { addToast } = useUIStore();

  useEffect(() => {
    if (!isLoaded) {
      loadDemoData();
    }
  }, [isLoaded, loadDemoData]);

  // Compute tasks assigned to current user's office or open tasks
  const openTasksCount = cases.filter(
    (c) =>
      c.status === 'Correction requested' ||
      c.status === 'Issue identified' ||
      c.status === 'Needs verification'
  ).length;

  const handleResetDemo = () => {
    resetDemo();
    addToast({
      type: 'success',
      title: 'Demo Reset Completed',
      message: 'Restored baseline 1,000 cases (720 Ready, 20 Needs verification, 250 Issue identified, 10 Payment pending).',
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-slate text-on-surface antialiased">
      <UtilityStrip onResetDemo={handleResetDemo} />
      <BrandBar />
      <AccentLine />
      <MainNav taskCount={Math.min(openTasksCount, 14)} />
      <PrototypeBanner />

      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-gutter py-space-lg">
        <Outlet />
      </main>

      <Footer />
      <Toast />
    </div>
  );
};
