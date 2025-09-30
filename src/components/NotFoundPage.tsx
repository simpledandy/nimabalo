"use client";

import Link from 'next/link';
import { strings } from '@/lib/strings';

interface NotFoundPageProps {
  title?: string;
  message?: string;
  showGoHome?: boolean;
  icon?: string;
}

export default function NotFoundPage({ 
  title = strings.errors.userNotFound,
  message = strings.errors.userNotFoundMessage,
  showGoHome = true,
  icon = "😕"
}: NotFoundPageProps) {
  return (
    <div className="card animate-scale-in hover-lift text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h2 className="text-xl font-bold text-primary mb-2">{title}</h2>
      <p className="text-neutral mb-4">{message}</p>
      {showGoHome && (
        <Link href="/" className="btn">{strings.errors.goHome}</Link>
      )}
    </div>
  );
}
