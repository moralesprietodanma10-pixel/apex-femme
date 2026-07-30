import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'dashboard' | 'full';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'dashboard' }) => {
  if (type === 'full' || type === 'dashboard') {
    return (
      <div 
        role="status" 
        aria-label="Cargando contenido de APEX Femme..." 
        className="space-y-6 max-w-4xl mx-auto p-4 md:p-6 animate-pulse pt-20"
      >
        {/* Banner Skeleton */}
        <div className="h-44 md:h-52 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 space-y-2">
              <div className="h-3 w-1/2 bg-[var(--border-subtle)] rounded" />
              <div className="h-6 w-3/4 bg-[var(--accent-color)]/20 rounded" />
            </div>
          ))}
        </div>

        {/* Action Panel Skeleton */}
        <div className="h-40 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 space-y-3">
          <div className="h-5 w-1/3 bg-[var(--border-subtle)] rounded" />
          <div className="h-4 w-2/3 bg-[var(--border-subtle)] rounded" />
          <div className="h-10 w-36 bg-[var(--accent-color)]/30 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div 
      role="status" 
      aria-label="Cargando módulo..." 
      className="glass-card p-6 rounded-3xl border border-[var(--border-card)] space-y-4 animate-pulse max-w-xl mx-auto my-8"
    >
      <div className="h-6 w-1/3 bg-[var(--border-subtle)] rounded-lg" />
      <div className="h-4 w-2/3 bg-[var(--border-subtle)] rounded-lg" />
      <div className="h-36 w-full bg-[var(--border-subtle)] rounded-2xl" />
    </div>
  );
};
