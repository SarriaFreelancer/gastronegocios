'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Upload,
  Link as LinkIcon,
  Check,
  Image as ImageIcon,
  Flame,
  Utensils
} from 'lucide-react';

export interface FoodPreset {
  id: string;
  name: string;
  category: string;
  url: string;
  badge: string;
}

export const FOOD_PRESETS_3D: FoodPreset[] = [
  {
    id: 'burger-3d',
    name: 'Hamburguesa Gourmet 3D',
    category: 'Hamburguesas & Smash',
    url: '/images/assets/burger-hero-transparent.png',
    badge: '★ Más Popular',
  },
  {
    id: 'salchipapa-3d',
    name: 'Salchipapa Suprema 3D',
    category: 'Salchipapas & Desgranados',
    url: '/images/assets/salchipapa-3d.png',
    badge: 'Especialidad',
  },
  {
    id: 'hotdog-3d',
    name: 'Perro Caliente Americano 3D',
    category: 'Perros & Sandwiches',
    url: '/images/assets/hotdog-3d.png',
    badge: 'Clásico',
  },
  {
    id: 'parrilla-3d',
    name: 'Parrilla & Asado al Carbón 3D',
    category: 'Parrillas & Carnes',
    url: '/images/assets/parrilla-3d.png',
    badge: 'Al Fuego',
  },
  {
    id: 'pizza-3d',
    name: 'Pizza Artesanal al Horno 3D',
    category: 'Pizzas & Calzones',
    url: '/images/assets/pizza-3d.png',
    badge: 'Crujiente',
  },
  {
    id: 'chicken-3d',
    name: 'Pollo Crispy Broaster 3D',
    category: 'Pollo Frito & Alitas',
    url: '/images/assets/chicken-3d.png',
    badge: 'Dorado',
  },
  {
    id: 'tacos-3d',
    name: 'Tacos & Tex-Mex 3D',
    category: 'Comida Mexicana',
    url: '/images/assets/tacos-3d.png',
    badge: 'Sabor Latino',
  },
  {
    id: 'drinks-3d',
    name: 'Cócteles & Bebidas Frutales 3D',
    category: 'Bebidas & Refrescos',
    url: '/images/assets/drinks-3d.png',
    badge: 'Refrescante',
  },
];

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helpText?: string;
}

export function FoodImagePresetSelector({
  value,
  onChange,
  label = 'Imagen Principal del Restaurante (Formato 3D o Fotografía)',
  helpText = 'Escoge una imagen 3D predeterminada con fondo transparente, sube un archivo desde tu dispositivo o ingresa un enlace web.'
}: Props) {
  const [tab, setTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [customUrl, setCustomUrl] = useState(value || '');

  const handleSelectPreset = (url: string) => {
    onChange(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const isCurrentPreset = FOOD_PRESETS_3D.some((p) => p.url === value);

  return (
    <div className="bg-[#141414] border border-[#262626] rounded-2xl p-4 sm:p-5 space-y-4 text-xs">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-brand-yellow" />
          <label className="text-white font-extrabold uppercase tracking-wide text-xs">
            {label}
          </label>
        </div>
        {helpText && <p className="text-[11px] text-gray-400">{helpText}</p>}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#1a1a1a] rounded-xl border border-[#2d2d2d] max-w-md">
        <button
          type="button"
          onClick={() => setTab('presets')}
          className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition ${
            tab === 'presets'
              ? 'bg-brand-yellow text-black shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Galería 3D</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('upload')}
          className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition ${
            tab === 'upload'
              ? 'bg-brand-yellow text-black shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Subir Imagen</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('url')}
          className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition ${
            tab === 'url'
              ? 'bg-brand-yellow text-black shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Enlace URL</span>
        </button>
      </div>

      {/* Tab 1: 3D Gallery Grid */}
      {tab === 'presets' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
            {FOOD_PRESETS_3D.map((preset) => {
              const isSelected = value === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.url)}
                  className={`group relative p-2 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer ${
                    isSelected
                      ? 'bg-brand-yellow/15 border-brand-yellow ring-1 ring-brand-yellow/40 shadow-md'
                      : 'bg-[#1b1b1b] border-[#2c2c2c] hover:border-gray-500 hover:bg-[#222]'
                  }`}
                >
                  {/* Badge */}
                  <span
                    className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full inline-block mb-1 w-fit ${
                      isSelected
                        ? 'bg-brand-yellow text-black'
                        : 'bg-[#292929] text-gray-300 group-hover:bg-[#333]'
                    }`}
                  >
                    {preset.badge}
                  </span>

                  {/* 3D Asset Preview */}
                  <div className="relative w-full h-14 my-0.5 flex items-center justify-center">
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Caption */}
                  <div className="pt-1 border-t border-[#2a2a2a]/60">
                    <p className={`font-bold text-[10px] leading-tight truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                      {preset.name}
                    </p>
                    <p className="text-[8.5px] text-gray-500 truncate">{preset.category}</p>
                  </div>

                  {/* Selected Tick */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-yellow text-black flex items-center justify-center font-black shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: File Upload */}
      {tab === 'upload' && (
        <div className="space-y-3">
          <label className="border-2 border-dashed border-[#333] hover:border-brand-yellow rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-[#181818]/60 hover:bg-[#181818]">
            <Upload className="w-8 h-8 text-brand-yellow animate-bounce" />
            <div className="text-center">
              <span className="text-xs font-bold text-white block">
                Haz clic para subir una imagen o arrástrala aquí
              </span>
              <span className="text-[10px] text-gray-500">
                Formatos recomendados: PNG con fondo transparente, WEBP o JPG (Máx. 5MB)
              </span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Tab 3: URL Input */}
      {tab === 'url' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://ejemplo.com/mi-hamburguesa-3d.png"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 bg-[#1a1a1a] border border-[#2d2d2d] rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow text-xs"
            />
            <button
              type="button"
              onClick={() => {
                if (customUrl.trim()) onChange(customUrl.trim());
              }}
              className="px-4 py-2 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black uppercase text-xs rounded-xl shadow-md transition"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}

      {/* Live Preview Card */}
      {value && (
        <div className="bg-[#0b0b0b] border border-[#222] rounded-xl p-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 relative bg-[#181818] rounded-lg border border-[#292929] overflow-hidden flex items-center justify-center p-1 flex-shrink-0">
              <img
                src={value}
                alt="Vista previa"
                className="w-full h-full object-contain drop-shadow-md"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold block">
                ● Imagen Activa Seleccionada
              </span>
              <p className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                {value}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase underline"
          >
            Quitar
          </button>
        </div>
      )}
    </div>
  );
}
