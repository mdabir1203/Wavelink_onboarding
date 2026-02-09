
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "h-8" }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="relative w-10 h-10 flex items-center justify-center">
      {/* Abstract Wave representation matching user image */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#245180" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
        <path 
          d="M10,50 C20,30 40,30 50,50 C60,70 80,70 90,50" 
          fill="none" 
          stroke="url(#waveGrad)" 
          strokeWidth="12" 
          strokeLinecap="round" 
        />
        <path 
          d="M10,65 C20,45 40,45 50,65 C60,85 80,85 90,65" 
          fill="none" 
          stroke="url(#waveGrad)" 
          strokeWidth="4" 
          strokeOpacity="0.5" 
          strokeLinecap="round" 
        />
      </svg>
      {/* Radio Wave Icon */}
      <div className="absolute -top-1 -right-1">
        <svg className="w-4 h-4 text-[#3b82f6]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16.36 10.3a6.99 6.99 0 0 0-8.72 0 1 1 0 0 0 1.25 1.56 5 5 0 0 1 6.22 0 1 1 0 0 0 1.25-1.56zM19.48 7.18a11.38 11.38 0 0 0-14.96 0 1 1 0 0 0 1.31 1.51 9.38 9.38 0 0 1 12.34 0 1 1 0 0 0 1.31-1.51z"/>
        </svg>
      </div>
    </div>
    <span className="text-xl font-black tracking-tighter text-[#0f2d4d]">wavelink</span>
  </div>
);

export default Logo;
