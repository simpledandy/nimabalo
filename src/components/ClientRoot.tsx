"use client";
import { ToastProvider, useToast } from '@/components/ToastContext';
import ToastContainer from '@/components/ToastContainer';
import NavBar from '@/components/NavBar';
import { usePathname } from 'next/navigation';

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  return (
    <ToastProvider>
      <BetaBanner />
      <NavBar />
      <ToastPortal />
      <main className={`container ${isHome ? 'pt-0' : 'pt-[104px]'} pb-6 animate-fade-in`}>{children}</main>
    </ToastProvider>
  );
}

function BetaBanner() {
  return (
    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-center py-2 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/80 to-orange-500/80 animate-pulse"></div>
      <div className="relative z-10 flex items-center justify-center gap-2 text-sm font-bold">
        <span className="animate-bounce-slow">⚠️</span>
        <span>Nimabalo Beta - Hozircha sinov rejimida!</span>
        <span className="animate-bounce-slow">🚨</span>
      </div>
      {/* Subtle moving accent line */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-white/50 animate-accent-run"></div>
    </div>
  );
}

function ToastPortal() {
  const { toasts } = useToast();
  return <ToastContainer toasts={toasts} />;
}