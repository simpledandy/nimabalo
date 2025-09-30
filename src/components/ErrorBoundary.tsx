"use client";

import { Component, ReactNode } from 'react';
import { strings } from '@/lib/strings';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="card animate-scale-in hover-lift text-center">
          <div className="text-4xl mb-4">😵</div>
          <h2 className="text-xl font-bold text-primary mb-2">Xatolik yuz berdi</h2>
          <p className="text-neutral mb-4">Kechirasiz, kutilmagan xatolik sodir bo'ldi.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn"
          >
            Sahifani yangilash
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
