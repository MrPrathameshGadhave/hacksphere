'use client';

import React from 'react';

export const AnimatedGradient = () => (
  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 800">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A01C33" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#7E1428" stopOpacity="0.05" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect width="1200" height="800" fill="url(#grad1)" />
  </svg>
);

export const FloatingOrbs = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 800">
    <defs>
      <filter id="blur">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
      </filter>
    </defs>
    <circle cx="150" cy="100" r="80" fill="#A01C33" opacity="0.08" filter="url(#blur)">
      <animate attributeName="cy" values="100;150;100" dur="8s" repeatCount="indefinite" />
    </circle>
    <circle cx="1050" cy="650" r="100" fill="#A01C33" opacity="0.06" filter="url(#blur)">
      <animate attributeName="cx" values="1050;1100;1050" dur="10s" repeatCount="indefinite" />
    </circle>
    <circle cx="600" cy="400" r="60" fill="#7E1428" opacity="0.05" filter="url(#blur)">
      <animate attributeName="r" values="60;80;60" dur="7s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export const CodeLines = () => (
  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
    <defs>
      <pattern id="code-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <line x1="0" y1="10" x2="100" y2="10" stroke="#A01C33" strokeWidth="0.5" opacity="0.1" />
        <line x1="0" y1="30" x2="100" y2="30" stroke="#A01C33" strokeWidth="0.5" opacity="0.08" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#A01C33" strokeWidth="0.5" opacity="0.1" />
        <line x1="0" y1="70" x2="100" y2="70" stroke="#A01C33" strokeWidth="0.5" opacity="0.08" />
        <line x1="0" y1="90" x2="100" y2="90" stroke="#A01C33" strokeWidth="0.5" opacity="0.1" />
      </pattern>
    </defs>
    <rect width="100" height="100" fill="url(#code-pattern)" />
  </svg>
);

export const AnimatedTechIcons = () => (
  <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
      </filter>
    </defs>
    
    {/* Code Bracket Icon */}
    <g fill="#A01C33" opacity="0.2">
      <path d="M30 25 L20 50 L30 75" stroke="currentColor" strokeWidth="3" fill="none" filter="url(#shadow)" />
      <path d="M70 25 L80 50 L70 75" stroke="currentColor" strokeWidth="3" fill="none" />
    </g>
  </svg>
);

export const ParticleAnimation = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 800">
    <defs>
      <filter id="particle-glow">
        <feGaussianBlur stdDeviation="2" />
      </filter>
    </defs>
    
    {/* Animated particles */}
    {[...Array(8)].map((_, i) => {
      const x = (i % 4) * 300 + 100;
      const y = Math.floor(i / 4) * 400 + 100;
      const delay = i * 0.5;

      return (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="3"
          fill="#A01C33"
          opacity="0.5"
          filter="url(#particle-glow)"
        >
          <animate
            attributeName="opacity"
            values="0.5;0;0.5"
            dur="3s"
            repeatCount="indefinite"
            begin={`${delay}s`}
          />
          <animate
            attributeName="cy"
            values={`${y};${y - 50};${y}`}
            dur="4s"
            repeatCount="indefinite"
            begin={`${delay}s`}
          />
        </circle>
      );
    })}
  </svg>
);

export const GradientText = ({ children }: { children: React.ReactNode }) => (
  <span className="bg-gradient-to-r from-[#A01C33] via-[#c92e4d] to-[#A01C33] bg-clip-text text-transparent animate-pulse">
    {children}
  </span>
);

export const HexagonPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 1200 800">
    <defs>
      <pattern id="hexagon-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <polygon
          points="50,0 100,25 100,75 50,100 0,75 0,25"
          fill="none"
          stroke="#A01C33"
          strokeWidth="1"
        />
      </pattern>
    </defs>
    <rect width="1200" height="800" fill="url(#hexagon-pattern)" />
  </svg>
);

export const AnimatedDots = () => (
  <svg className="w-12 h-12 text-[#A01C33]" viewBox="0 0 120 120" fill="none">
    <circle cx="20" cy="60" r="4" fill="currentColor">
      <animate attributeName="cy" values="60;40;60" dur="1.4s" repeatCount="indefinite" begin="0s" />
    </circle>
    <circle cx="60" cy="60" r="4" fill="currentColor">
      <animate attributeName="cy" values="60;40;60" dur="1.4s" repeatCount="indefinite" begin="0.2s" />
    </circle>
    <circle cx="100" cy="60" r="4" fill="currentColor">
      <animate attributeName="cy" values="60;40;60" dur="1.4s" repeatCount="indefinite" begin="0.4s" />
    </circle>
  </svg>
);

export const ComplexShapeAnimation = () => (
  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="shape-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A01C33" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#7E1428" stopOpacity="0.05" />
      </linearGradient>
    </defs>
    
    {/* Animated background shapes */}
    <rect x="50" y="50" width="300" height="300" fill="url(#shape-grad)" rx="20">
      <animate attributeName="x" values="50;100;50" dur="10s" repeatCount="indefinite" />
      <animate attributeName="y" values="50;80;50" dur="12s" repeatCount="indefinite" />
    </rect>
    
    <circle cx="900" cy="650" r="150" fill="url(#shape-grad)">
      <animate attributeName="r" values="150;200;150" dur="8s" repeatCount="indefinite" />
    </circle>
  </svg>
);
