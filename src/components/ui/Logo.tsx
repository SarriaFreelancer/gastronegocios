import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-3xl sm:text-4xl',
  };

  const sloganSizes = {
    sm: 'text-[7px]',
    md: 'text-[9px] sm:text-[10px]',
    lg: 'text-[11px] sm:text-[12px]',
  };

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
      {/* 100% Crisp Vector Burger & Chef Hat Icon */}
      <div className={`relative flex-shrink-0 ${iconSizes[size]} transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_2px_12px_rgba(255,201,40,0.5)]`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Chef Hat */}
          <path
            d="M50 8C41 8 38 15 37 19C32 19 27 23 29 29C30 32 33 34 36 35H64C67 34 70 32 71 29C73 23 68 19 63 19C62 15 59 8 50 8Z"
            fill="#FFFFFF"
          />
          <path
            d="M36 32H64V36H36V32Z"
            fill="#E2E8F0"
          />

          {/* Top Bun */}
          <path
            d="M20 50C20 38 33 37 50 37C67 37 80 38 80 50C80 52 78 54 75 54H25C22 54 20 52 20 50Z"
            fill="#FFC928"
          />

          {/* Sesame Seeds */}
          <ellipse cx="36" cy="44" rx="2" ry="1.2" transform="rotate(-15 36 44)" fill="#FFFFFF" />
          <ellipse cx="50" cy="41" rx="2" ry="1.2" fill="#FFFFFF" />
          <ellipse cx="64" cy="44" rx="2" ry="1.2" transform="rotate(15 64 44)" fill="#FFFFFF" />
          <ellipse cx="43" cy="48" rx="1.8" ry="1" fill="#FFFFFF" />
          <ellipse cx="57" cy="48" rx="1.8" ry="1" fill="#FFFFFF" />

          {/* Crispy Lettuce Ripples */}
          <path
            d="M17 56C20 53 23 55 27 57C31 59 34 55 38 57C42 59 46 55 50 57C54 59 58 55 62 57C66 59 69 55 73 57C77 59 80 53 83 56C84 57 84 59 81 60C76 61 72 59 68 60C64 61 60 59 56 60C52 61 48 59 44 60C40 61 36 59 32 60C28 61 24 59 19 60C16 59 16 57 17 56Z"
            fill="#22C55E"
          />

          {/* Red Ripe Tomato Slices */}
          <path
            d="M22 62H78C79.5 62 80 63.5 79 64.5C74 66 63 67 50 67C37 67 26 66 21 64.5C20 63.5 20.5 62 22 62Z"
            fill="#EF4444"
          />

          {/* Melted Cheddar Cheese Drips */}
          <path
            d="M21 67L29 74L37 67L47 75L57 67L67 74L79 68V67H21Z"
            fill="#FFC928"
          />

          {/* Grilled Beef Patty */}
          <rect x="20" y="73" width="60" height="9" rx="4.5" fill="#451A03" />

          {/* Bottom Bun */}
          <path
            d="M23 85C23 83 25 83 28 83H72C75 83 77 83 77 85C77 90 66 93 50 93C34 93 23 90 23 85Z"
            fill="#FFC928"
          />
        </svg>
      </div>

      {/* Typography: PUNTO G */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center tracking-wider font-extrabold font-display">
          <span className={`${textSizes[size]} text-white uppercase italic tracking-tighter drop-shadow-md`}>
            PUNTO&nbsp;
          </span>
          <span className={`${textSizes[size]} text-brand-yellow uppercase italic tracking-tighter drop-shadow-[0_2px_12px_rgba(255,201,40,0.6)]`}>
            G
          </span>
        </div>
        <span className={`${sloganSizes[size]} font-black tracking-[0.25em] text-brand-yellow uppercase whitespace-nowrap -mt-0.5 drop-shadow`}>
          ANTOJOS QUE CONECTAN
        </span>
      </div>
    </Link>
  );
};
