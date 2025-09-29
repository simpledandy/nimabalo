"use client";

interface StatsCardProps {
  value: number | string;
  label: string;
  color?: 'primary' | 'secondary' | 'accent';
  loading?: boolean;
  className?: string;
}

export default function StatsCard({ 
  value, 
  label, 
  color = 'primary', 
  loading = false,
  className = ""
}: StatsCardProps) {
  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary', 
    accent: 'text-accent'
  };

  return (
    <div className={`card text-center hover-lift ${className}`}>
      <div className={`text-3xl font-bold ${colorClasses[color]} mb-2`}>
        {loading ? '...' : value}
      </div>
      <div className="text-sm text-neutral">{label}</div>
    </div>
  );
}
