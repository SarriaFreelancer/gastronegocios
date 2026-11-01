import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const heights = {
    sm: 'h-8',
    md: 'h-11',
    lg: 'h-14',
  };

  return (
    <Link href="/" className={`inline-flex items-center group select-none ${className}`}>
      <div className={`relative ${heights[size]} w-44 sm:w-52 transition-transform duration-300 group-hover:scale-105`}>
        <Image
          src="/images/punto_g_logo.png"
          alt="PUNTO G - Antojos que conectan"
          fill
          priority
          className="object-contain object-left"
          sizes="220px"
        />
      </div>
    </Link>
  );
};
