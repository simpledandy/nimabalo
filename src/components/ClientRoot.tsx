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
      <NavBar />
      <ToastPortal />
      <main className={`container ${isHome ? 'pt-0' : 'pt-[72px]'} pb-6 animate-fade-in`}>{children}</main>
    </ToastProvider>
  );
}

function ToastPortal() {
  const { toasts } = useToast();
  return <ToastContainer toasts={toasts} />;
}
