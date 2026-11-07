'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Upload,
  Link as LinkIcon,
  Check,
  Image as ImageIcon,
  ShieldCheck,
  Crown
} from 'lucide-react';

export interface LogoPreset {
  id: string;
  name: string;
  category: string;
  url: string;
  badge: string;
}

export const LOGO_PRESETS: LogoPreset[] = [
  {
    id: 'logo-puntog',
    name: 'Punto G Original',
    category: 'Oficial',
    url: '/images/punto_g_logo.png',
    badge: 'Oficial',
  },
  {
    id: 'logo-burger',
    name: 'Burger Gourmet Badge',
    category: 'Hamburguesería',
    url: '/images/logos/logo-burger.png',
    badge: 'Popular',
  },
  {
    id: 'logo-grill',
    name: 'Parrilla & Fuego Crest',
    category: 'Asados & Carnes',
    url: '/images/logos/logo-grill.png',
    badge: 'Al Fuego',
  },
  {
    id: 'logo-salchipapa',
    name: 'Salchipapa Especial Badge',
    category: 'Comidas Rápidas',
    url: '/images/logos/logo-salchipapa.png',
    badge: 'Especial',
  },
  {
    id: 'logo-crown',
    name: 'Fast Food Kingdom Crown',
    category: 'Fast Food',
    url: '/images/logos/logo-crown.png',
    badge: 'Premium',
  },
  {
    id: 'logo-chef',
    name: 'Chef Hat Artisan Seal',
    category: 'Restaurante',
    url: '/images/logos/logo-chef.png',
    badge: 'Gourmet',
  },
  {
    id: 'logo-hotdog',
    name: 'Hot Dog American Retro',
    category: 'Perros Calientes',
    url: '/images/logos/logo-hotdog.png',
    badge: 'Clásico',
  },
  {
    id: 'logo-pizza',
    name: 'Pizzería al Forno Badge',
    category: 'Pizzería',
    url: '/images/logos/logo-pizza.png',
    badge: 'Artesanal',
  },
  {
    id: 'logo-drinks',
    name: 'Bebidas & Lounge Seal',
    category: 'Bebidas & Bar',
    url: '/images/logos/logo-drinks.png',
    badge: 'Coctelería',
  },
];

interface LogoPresetSelectorProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export const LogoPresetSelector: React.FC<LogoPresetSelectorProps> = ({
  value = '',
  onChange,
  label = 'Logo del Restaurante',
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [customUrl, setCustomUrl] = useState(value);
  const [uploadError, setUploadError] = useState('');

  // Handle preset selection
  const handleSelectPreset = (url: string) => {
    onChange(url);
    setCustomUrl(url);
  };

  // Handle URL change
  const handleUrlBlur = () => {
    if (customUrl.trim()) {
      onChange(customUrl.trim());
    }
  };

  // Handle local file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor selecciona un archivo de imagen válido (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('La imagen no debe superar los 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
        setCustomUrl(reader.result);
      }
    };
    reader.onerror = () => {
      setUploadError('Error al leer el archivo.');
    };
    reader.readAsDataURL(file);
  };

  const selectedPreset = LOGO_PRESETS.find((p) => p.url === value);

  return (
    <div className="space-y-3.5 bg-[#0e0e0e] border border-[#222] rounded-2xl p-4 sm:p-5">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1c1c1c]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow flex items-center justify-center">
            <Crown className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              {label}
            </h4>
            <p className="text-[11px] text-gray-400">
              Escoge un logo prediseñado, sube tu archivo o pega una URL
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-[#171717] border border-[#262626] rounded-xl p-1 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-brand-yellow text-black shadow-glow font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Galería ({LOGO_PRESETS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-brand-yellow text-black shadow-glow font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Subir Archivo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'url'
                ? 'bg-brand-yellow text-black shadow-glow font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Pegar URL</span>
          </button>
        </div>
      </div>

      {/* Current Preview Card */}
      {value && (
        <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#141414] border border-[#242424]">
          <div className="relative w-12 h-12 rounded-xl bg-black border border-[#333] overflow-hidden flex items-center justify-center p-1 shrink-0">
            <Image
              src={value}
              alt="Logo Seleccionado"
              fill
              className="object-contain p-1"
              unoptimized
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Logo Activo
              </span>
              {selectedPreset && (
                <span className="text-xs font-bold text-white truncate">
                  {selectedPreset.name}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400 truncate mt-0.5 font-mono">
              {value}
            </p>
          </div>
        </div>
      )}

      {/* TAB 1: PRESET GALLERY */}
      {activeTab === 'presets' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {LOGO_PRESETS.map((preset) => {
              const isSelected = value === preset.url;
              return (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.url)}
                  className={`relative p-3 rounded-2xl border text-left transition-all group flex items-center gap-3 ${
                    isSelected
                      ? 'bg-brand-yellow/10 border-brand-yellow shadow-glow'
                      : 'bg-[#141414] border-[#242424] hover:border-[#444] hover:bg-[#191919]'
                  }`}
                >
                  <div className="relative w-10 h-10 rounded-xl bg-black border border-[#2d2d2d] overflow-hidden flex items-center justify-center p-1 shrink-0">
                    <Image
                      src={preset.url}
                      alt={preset.name}
                      fill
                      className="object-contain p-0.5 group-hover:scale-105 transition-transform"
                      unoptimized
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-black uppercase tracking-tight truncate ${
                      isSelected ? 'text-brand-yellow' : 'text-white group-hover:text-brand-yellow'
                    }`}>
                      {preset.name}
                    </p>
                    <span className="text-[10px] text-gray-400 block truncate">
                      {preset.category}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-brand-yellow text-black flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: FILE UPLOAD */}
      {activeTab === 'upload' && (
        <div className="space-y-3">
          <label className="border-2 border-dashed border-[#333] hover:border-brand-yellow rounded-2xl p-6 text-center flex flex-col items-center justify-center cursor-pointer transition group bg-[#121212]">
            <Upload className="w-8 h-8 text-gray-400 group-hover:text-brand-yellow mb-2 transition" />
            <span className="text-xs font-black uppercase text-white group-hover:text-brand-yellow transition">
              Haz clic para seleccionar tu logo
            </span>
            <span className="text-[11px] text-gray-400 mt-1">
              PNG transparente, SVG, JPG o WebP (Máx. 5 MB)
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {uploadError && (
            <p className="text-xs text-red-400 font-medium">{uploadError}</p>
          )}
        </div>
      )}

      {/* TAB 3: URL INPUT */}
      {activeTab === 'url' && (
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
              Dirección URL pública de la imagen
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://tudominio.com/logo.png"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                onBlur={handleUrlBlur}
                className="flex-1 bg-[#161616] border border-[#333] focus:border-brand-yellow rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleUrlBlur}
                className="px-4 py-2 bg-brand-yellow text-black rounded-xl text-xs font-black uppercase tracking-wider shadow-glow hover:scale-105 transition"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
