import React from 'react';
import { 
  Flame, 
  UtensilsCrossed, 
  Sparkles, 
  Wine, 
  Citrus, 
  GlassWater,
  CupSoda
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  name, 
  className = "w-5 h-5", 
  size = 20 
}) => {
  switch (name.toLowerCase()) {
    case 'burger':
    case 'hamburguesas':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4 11a8 8 0 0 1 16 0H4z" />
          <path d="M3 14h18" />
          <path d="M5 17h14a2 2 0 0 1 2 2H3a2 2 0 0 1 2-2z" />
          <circle cx="9" cy="7" r="0.5" fill="currentColor" />
          <circle cx="15" cy="7" r="0.5" fill="currentColor" />
        </svg>
      );
    case 'meat':
    case 'picadas':
      return <UtensilsCrossed size={size} className={className} />;
    case 'fries':
    case 'salchipapas':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M5 11l2 11h10l2-11H5z" />
          <path d="M8 11V4" />
          <path d="M12 11V3" />
          <path d="M16 11V5" />
        </svg>
      );
    case 'hotdog':
    case 'perros-calientes':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="2" y="9" width="20" height="6" rx="3" />
          <path d="M5 12h14" />
        </svg>
      );
    case 'flame':
    case 'parrillas':
      return <Flame size={size} className={className} />;
    case 'cup':
    case 'bebidas':
      return <CupSoda size={size} className={className} />;
    case 'cocktail':
    case 'cocteles':
      return <Wine size={size} className={className} />;
    case 'glass':
    case 'jugos-naturales':
      return <Citrus size={size} className={className} />;
    case 'bottle':
    case 'sodas':
      return <GlassWater size={size} className={className} />;
    default:
      return <Sparkles size={size} className={className} />;
  }
};
