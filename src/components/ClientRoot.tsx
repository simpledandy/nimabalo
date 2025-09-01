"use client";
import { ToastProvider, useToast } from '@/components/ToastContext';
import ToastContainer from '@/components/ToastContainer';
import NavBar from '@/components/NavBar';

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <NavBar />
      <ToastPortal />
      <main className="container py-6">{children}</main>
    </ToastProvider>
  );
}

function ToastPortal() {
  const { toasts } = useToast();
  return <ToastContainer toasts={toasts} />;
}
