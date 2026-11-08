'use client';

import React, { useState, useEffect } from 'react';
import {
  Palette,
  Layout,
  Image as ImageIcon,
  Type,
  Sliders,
  Check,
  RotateCcw,
  ExternalLink,
  Eye,
  Monitor,
  Smartphone,
  Sparkles,
  Layers,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info
} from 'lucide-react';
import { showSuccess, showError, showConfirm } from '@/lib/swal';
import { FoodImagePresetSelector } from '@/components/admin/FoodImagePresetSelector';
import { LogoPresetSelector } from '@/components/admin/LogoPresetSelector';

interface PersonalizacionTabProps {
  restaurant: any;
  onUpdate: (updated: any) => void;
}

export function PersonalizacionTab({ restaurant, onUpdate }: PersonalizacionTabProps) {
  const [activeSubSection, setActiveSubSection] = useState<'identidad' | 'plantillas' | 'colores' | 'secciones' | 'estilo'>('identidad');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    eslogan: '',
    descripcion: '',
    logo: '',
    favicon: '',
    bannerHero: '',
    telefonoWhatsapp: '',
    instagram: '',
    direccionCentral: '',
    ciudad: 'Cali',
    horarioAtencion: '',

    // Plantilla
    plantilla: 'plantilla-actual',
    aparienciaMenu: 'clasico',

    // Design Tokens - Colores
    colorPrimario: '#ffc928',
    colorSecundario: '#E94B24',
    colorTerciario: '#1a1a1a',
    colorAcento: '#ffc928',
    colorFondo: '#080808',
    colorSuperficie: '#121212',
    colorTexto: '#ffffff',
    colorTextoSecundario: '#9ca3af',
    colorBorde: '#262626',
    colorBoton: '#ffc928',
    colorBotonTexto: '#000000',
    colorNavegacion: '#0a0a0a',
    colorExito: '#10b981',
    colorAlerta: '#f59e0b',
    colorError: '#ef4444',

    // Textos Comerciales y Secciones
    tituloHero: '',
    subtituloHero: '',
    descripcionHero: '',
    textoBotonHero: 'Ver la Carta',
    bannerPromocional: '',
    textoPromocional: '',
    tituloSeccionMenu: 'Nuestra Carta',
    tituloSeccionDestacados: 'Los Más Populares',
    mostrarHero: true,
    mostrarCategorias: true,
    mostrarDestacados: true,
    mostrarPromociones: true,
    mostrarResenas: true,
    mostrarHorarios: true,

    // Estilo Avanzado
    tipografia: 'system',
    radioBordes: 'rounded-2xl',
    estiloTarjetas: 'card-glass',
    columnasMenu: 3,
  });

  useEffect(() => {
    if (restaurant) {
      setFormData({
        nombre: restaurant.nombre || '',
        eslogan: restaurant.eslogan || '',
        descripcion: restaurant.descripcion || '',
        logo: restaurant.logo || '',
        favicon: restaurant.favicon || '',
        bannerHero: restaurant.bannerHero || '',
        telefonoWhatsapp: restaurant.telefonoWhatsapp || '',
        instagram: restaurant.instagram || '',
        direccionCentral: restaurant.direccionCentral || '',
        ciudad: restaurant.ciudad || 'Cali',
        horarioAtencion: restaurant.horarioAtencion || 'Lunes a Domingo: 12:00 m. a 11:30 p.m.',

        plantilla: restaurant.plantilla || 'plantilla-actual',
        aparienciaMenu: restaurant.aparienciaMenu || 'clasico',

        colorPrimario: restaurant.colorPrimario || '#ffc928',
        colorSecundario: restaurant.colorSecundario || '#E94B24',
        colorTerciario: restaurant.colorTerciario || '#1a1a1a',
        colorAcento: restaurant.colorAcento || restaurant.colorPrimario || '#ffc928',
        colorFondo: restaurant.colorFondo || '#080808',
        colorSuperficie: restaurant.colorSuperficie || '#121212',
        colorTexto: restaurant.colorTexto || '#ffffff',
        colorTextoSecundario: restaurant.colorTextoSecundario || '#9ca3af',
        colorBorde: restaurant.colorBorde || '#262626',
        colorBoton: restaurant.colorBoton || restaurant.colorPrimario || '#ffc928',
        colorBotonTexto: restaurant.colorBotonTexto || '#000000',
        colorNavegacion: restaurant.colorNavegacion || '#0a0a0a',
        colorExito: restaurant.colorExito || '#10b981',
        colorAlerta: restaurant.colorAlerta || '#f59e0b',
        colorError: restaurant.colorError || '#ef4444',

        tituloHero: restaurant.tituloHero || '',
        subtituloHero: restaurant.subtituloHero || '',
        descripcionHero: restaurant.descripcionHero || '',
        textoBotonHero: restaurant.textoBotonHero || 'Ver la Carta',
        bannerPromocional: restaurant.bannerPromocional || '',
        textoPromocional: restaurant.textoPromocional || '',
        tituloSeccionMenu: restaurant.tituloSeccionMenu || 'Nuestra Carta',
        tituloSeccionDestacados: restaurant.tituloSeccionDestacados || 'Los Más Populares',
        mostrarHero: restaurant.mostrarHero ?? true,
        mostrarCategorias: restaurant.mostrarCategorias ?? true,
        mostrarDestacados: restaurant.mostrarDestacados ?? true,
        mostrarPromociones: restaurant.mostrarPromociones ?? true,
        mostrarResenas: restaurant.mostrarResenas ?? true,
        mostrarHorarios: restaurant.mostrarHorarios ?? true,

        tipografia: restaurant.tipografia || 'system',
        radioBordes: restaurant.radioBordes || 'rounded-2xl',
        estiloTarjetas: restaurant.estiloTarjetas || 'card-glass',
        columnasMenu: restaurant.columnasMenu || 3,
      });
    }
  }, [restaurant]);

  // Guardar cambios
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!restaurant?.id) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/restaurants/${restaurant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('punto-g:tenant-updated', {
              detail: {
                restaurantId: restaurant.id,
                slug: updated.slug,
                aparienciaMenu: updated.aparienciaMenu,
              },
            })
          );
        }
        showSuccess(
          'Personalización Publicada',
          'Los cambios de diseño, colores y textos fueron aplicados y están visibles públicamente.'
        );
      } else {
        const err = await res.json();
        showError('Error al guardar', err.error || 'No se pudo actualizar la personalización');
      }
    } catch (e) {
      showError('Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setSaving(false);
    }
  };

  // Restaurar valores por defecto
  const handleResetDefaults = async () => {
    const confirm = await showConfirm({
      title: '¿Restaurar valores de fábrica?',
      text: 'Se restablecerán los colores estándar, plantilla actual y textos recomendados para este restaurante.',
      confirmButtonText: 'Sí, restaurar',
    });
    if (!confirm) return;

    setFormData((prev) => ({
      ...prev,
      plantilla: 'plantilla-actual',
      colorPrimario: '#ffc928',
      colorSecundario: '#E94B24',
      colorTerciario: '#1a1a1a',
      colorAcento: '#ffc928',
      colorFondo: '#080808',
      colorSuperficie: '#121212',
      colorTexto: '#ffffff',
      colorTextoSecundario: '#9ca3af',
      colorBorde: '#262626',
      colorBoton: '#ffc928',
      colorBotonTexto: '#000000',
      colorNavegacion: '#0a0a0a',
      colorExito: '#10b981',
      colorAlerta: '#f59e0b',
      colorError: '#ef4444',
      tipografia: 'system',
      radioBordes: 'rounded-2xl',
      estiloTarjetas: 'card-glass',
      columnasMenu: 3,
      mostrarHero: true,
      mostrarCategorias: true,
      mostrarDestacados: true,
      mostrarPromociones: true,
      mostrarResenas: true,
      mostrarHorarios: true,
    }));

    showSuccess('Valores Restablecidos', 'Presiona "Guardar y Publicar" para aplicar la configuración.');
  };

  const storeUrl = restaurant?.slug ? `/r/${restaurant.slug}` : '/';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#181818] via-[#141414] to-[#101010] border border-[#262626] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-xs font-bold uppercase tracking-wider">
            <Palette className="w-3.5 h-3.5" />
            <span>WHITE-LABEL & APARIENCIA DINÁMICA</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-display">
            Personalización de {restaurant?.nombre || 'Restaurante'}
          </h2>
          <p className="text-xs text-gray-400 max-w-xl">
            Modifica la identidad de marca, plantilla visual, paleta de colores, tipografías y textos comerciales de tu tienda pública sin tocar código.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-[#222] hover:bg-[#2c2c2c] text-gray-200 text-xs font-bold transition flex items-center gap-2 border border-[#333]"
          >
            <ExternalLink className="w-3.5 h-3.5 text-brand-yellow" />
            <span>Ver Tienda Pública</span>
          </a>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-brand-yellow hover:bg-yellow-400 text-black text-xs font-black uppercase tracking-wider transition shadow-glow flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Publicando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar y Publicar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#222]">
        {[
          { id: 'identidad', label: '1. Identidad de Marca', icon: ImageIcon },
          { id: 'plantillas', label: '2. Selector de Plantillas (3 Diseños)', icon: Layout },
          { id: 'colores', label: '3. Paleta de Colores & Tokens', icon: Palette },
          { id: 'secciones', label: '4. Textos & Secciones', icon: Sliders },
          { id: 'estilo', label: '5. Tipografía & Estilos', icon: Type },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeSubSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubSection(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                active
                  ? 'bg-brand-yellow text-black shadow-glow font-black'
                  : 'bg-[#151515] text-gray-400 hover:text-white hover:bg-[#1f1f1f] border border-[#252525]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-SECTION 1: IDENTIDAD DE MARCA */}
      {activeSubSection === 'identidad' && (
        <div className="bg-[#121212] border border-[#242424] rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#222]">
            <div>
              <h3 className="text-base font-black uppercase text-white font-display">
                IDENTIDAD Y DATOS COMERCIALES
              </h3>
              <p className="text-xs text-gray-400">
                Logotipo, eslogan, horarios e información de contacto propia de este negocio.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block text-gray-300 font-bold uppercase mb-1.5">
                Nombre Comercial del Restaurante
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full bg-[#181818] border border-[#2d2d2d] focus:border-brand-yellow rounded-xl px-3.5 py-2.5 text-white"
                placeholder="Ej. Salchirricuras Gourmet"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-bold uppercase mb-1.5">
                Eslogan Comercial / Lema
              </label>
              <input
                type="text"
                value={formData.eslogan}
                onChange={(e) => setFormData({ ...formData, eslogan: e.target.value })}
                className="w-full bg-[#181818] border border-[#2d2d2d] focus:border-brand-yellow rounded-xl px-3.5 py-2.5 text-white"
                placeholder="Ej. Las mejores salchipapas de Cali"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-300 font-bold uppercase mb-1.5">
                Descripción del Restaurante (Sobre Nosotros & Footer)
              </label>
              <textarea
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full bg-[#181818] border border-[#2d2d2d] focus:border-brand-yellow rounded-xl px-3.5 py-2.5 text-white"
                placeholder="Breve reseña sobre la propuesta gastronómica, historia o ingredientes especiales..."
              />
            </div>

            {/* Logo Preset Selector */}
            <LogoPresetSelector
              value={formData.logo}
              onChange={(url) => setFormData({ ...formData, logo: url })}
              label="Logotipo Oficial de la Marca"
            />

            {/* Banner Hero 3D / Preset Selector */}
            <FoodImagePresetSelector
              value={formData.bannerHero}
              onChange={(url) => setFormData({ ...formData, bannerHero: url })}
              label="Imagen Principal de la Landing (Formato 3D o Fotografía)"
              helpText="Escoge un render 3D gastronómico predeterminado para tu restaurante, sube un archivo con fondo transparente o pega un enlace web."
            />

            {/* Contacto & Ubicación */}
            <div>
              <label className="block text-gray-300 font-bold uppercase mb-1.5">
                WhatsApp Oficial para Pedidos
              </label>
              <input
                type="tel"
                value={formData.telefonoWhatsapp}
                onChange={(e) => setFormData({ ...formData, telefonoWhatsapp: e.target.value })}
                className="w-full bg-[#181818] border border-[#2d2d2d] focus:border-brand-yellow rounded-xl px-3.5 py-2.5 text-white"
                placeholder="3229088736"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-bold uppercase mb-1.5">
                Ciudad
              </label>
              <input
                type="text"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                className="w-full bg-[#181818] border border-[#2d2d2d] focus:border-brand-yellow rounded-xl px-3.5 py-2.5 text-white"
                placeholder="Cali"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-bold uppercase mb-1.5">
                Dirección Principal
              </label>
              <input
                type="text"
                value={formData.direccionCentral}
                onChange={(e) => setFormData({ ...formData, direccionCentral: e.target.value })}
                className="w-full bg-[#181818] border border-[#2d2d2d] focus:border-brand-yellow rounded-xl px-3.5 py-2.5 text-white"
                placeholder="Calle 9 # 45-12, Granada"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-bold uppercase mb-1.5">
                Horario de Atención
              </label>
              <input
                type="text"
                value={formData.horarioAtencion}
                onChange={(e) => setFormData({ ...formData, horarioAtencion: e.target.value })}
                className="w-full bg-[#181818] border border-[#2d2d2d] focus:border-brand-yellow rounded-xl px-3.5 py-2.5 text-white"
                placeholder="Lunes a Domingo: 12:00 m. a 11:30 p.m."
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 2: SELECTOR DE PLANTILLAS */}
      {activeSubSection === 'plantillas' && (
        <div className="bg-[#121212] border border-[#242424] rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#222]">
            <div>
              <h3 className="text-base font-black uppercase text-white font-display">
                SISTEMA DE PLANTILLAS VISUALES
              </h3>
              <p className="text-xs text-gray-400">
                Selecciona la arquitectura visual que mejor represente la personalidad de tu restaurante.
              </p>
            </div>
            <span className="text-xs text-brand-yellow font-bold">
              Plantilla Activa: <strong className="uppercase">{formData.plantilla}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Plantilla 1 */}
            <div
              onClick={() => setFormData({ ...formData, plantilla: 'plantilla-actual' })}
              className={`rounded-3xl border-2 p-5 cursor-pointer transition-all space-y-4 relative ${
                formData.plantilla === 'plantilla-actual'
                  ? 'border-brand-yellow bg-brand-yellow/5 shadow-[0_0_30px_rgba(255,201,40,0.2)]'
                  : 'border-[#262626] bg-[#161616] hover:border-gray-500'
              }`}
            >
              {formData.plantilla === 'plantilla-actual' && (
                <span className="absolute top-4 right-4 bg-brand-yellow text-black px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shadow-glow flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" /> Activa
                </span>
              )}

              {/* Wireframe Mockup */}
              <div className="bg-[#0a0a0a] rounded-2xl p-3 border border-[#202020] space-y-2">
                <div className="h-14 bg-gradient-to-r from-amber-500/30 to-red-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-[10px] font-black text-brand-yellow uppercase">Hero Gourmet & Grill</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <div className="h-6 bg-[#1f1f1f] rounded-lg" />
                  <div className="h-6 bg-[#1f1f1f] rounded-lg" />
                  <div className="h-6 bg-[#1f1f1f] rounded-lg" />
                  <div className="h-6 bg-[#1f1f1f] rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="h-12 bg-[#181818] rounded-xl border border-[#262626]" />
                  <div className="h-12 bg-[#181818] rounded-xl border border-[#262626]" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-black uppercase text-white font-display">
                  Plantilla 1: Actual / Urbana
                </h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Estructura dinámica de alta conversión con categorías destacadas, vitrina de platos insignia y carrusel de combos.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  className={`w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                    formData.plantilla === 'plantilla-actual'
                      ? 'bg-brand-yellow text-black shadow-glow'
                      : 'bg-[#222] text-gray-300 hover:bg-[#333]'
                  }`}
                >
                  {formData.plantilla === 'plantilla-actual' ? 'Plantilla Seleccionada' : 'Elegir esta Plantilla'}
                </button>
              </div>
            </div>

            {/* Plantilla 2 */}
            <div
              onClick={() => setFormData({ ...formData, plantilla: 'plantilla-minimalista' })}
              className={`rounded-3xl border-2 p-5 cursor-pointer transition-all space-y-4 relative ${
                formData.plantilla === 'plantilla-minimalista'
                  ? 'border-brand-yellow bg-brand-yellow/5 shadow-[0_0_30px_rgba(255,201,40,0.2)]'
                  : 'border-[#262626] bg-[#161616] hover:border-gray-500'
              }`}
            >
              {formData.plantilla === 'plantilla-minimalista' && (
                <span className="absolute top-4 right-4 bg-brand-yellow text-black px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shadow-glow flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" /> Activa
                </span>
              )}

              {/* Wireframe Mockup */}
              <div className="bg-[#070707] rounded-2xl p-3 border border-[#202020] space-y-2">
                <div className="h-16 bg-[#111] border border-white/10 rounded-xl flex flex-col items-center justify-center p-2 text-center">
                  <div className="w-12 h-1 bg-white/40 rounded-full mb-1" />
                  <span className="text-[9px] text-gray-400 uppercase tracking-widest">Elegancia & Espacio</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="h-16 bg-[#0f0f0f] rounded-xl border border-white/5" />
                  <div className="h-16 bg-[#0f0f0f] rounded-xl border border-white/5" />
                  <div className="h-16 bg-[#0f0f0f] rounded-xl border border-white/5" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-black uppercase text-white font-display">
                  Plantilla 2: Moderna & Minimalista
                </h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Diseño sobrio y espacioso. Fotografías de gran formato, tipografía elegante y una carta limpia sin sobrecargar al cliente.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  className={`w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                    formData.plantilla === 'plantilla-minimalista'
                      ? 'bg-brand-yellow text-black shadow-glow'
                      : 'bg-[#222] text-gray-300 hover:bg-[#333]'
                  }`}
                >
                  {formData.plantilla === 'plantilla-minimalista' ? 'Plantilla Seleccionada' : 'Elegir esta Plantilla'}
                </button>
              </div>
            </div>

            {/* Plantilla 3 */}
            <div
              onClick={() => setFormData({ ...formData, plantilla: 'plantilla-comercial' })}
              className={`rounded-3xl border-2 p-5 cursor-pointer transition-all space-y-4 relative ${
                formData.plantilla === 'plantilla-comercial'
                  ? 'border-brand-yellow bg-brand-yellow/5 shadow-[0_0_30px_rgba(255,201,40,0.2)]'
                  : 'border-[#262626] bg-[#161616] hover:border-gray-500'
              }`}
            >
              {formData.plantilla === 'plantilla-comercial' && (
                <span className="absolute top-4 right-4 bg-brand-yellow text-black px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shadow-glow flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" /> Activa
                </span>
              )}

              {/* Wireframe Mockup */}
              <div className="bg-[#0d0d0d] rounded-2xl p-3 border border-[#202020] space-y-2">
                <div className="h-12 bg-gradient-to-r from-red-600 to-amber-500 rounded-xl flex items-center justify-between px-3 text-white">
                  <span className="text-[10px] font-black uppercase">¡OFERTAS DEL DÍA!</span>
                  <span className="text-[8px] bg-black/40 px-1.5 py-0.5 rounded font-bold">20% OFF</span>
                </div>
                <div className="h-8 bg-[#1a1a1a] rounded-lg border border-red-500/30 flex items-center justify-center">
                  <span className="text-[9px] text-red-400 font-bold">Combos Familiares & Bebidas</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="h-12 bg-[#141414] rounded-xl border border-amber-500/30" />
                  <div className="h-12 bg-[#141414] rounded-xl border border-amber-500/30" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-black uppercase text-white font-display">
                  Plantilla 3: Comercial & Promocional
                </h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Enfoque en alta rotación y conversión. Banners de ofertas destacados, combos en primera plana y botones directos de compra.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  className={`w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                    formData.plantilla === 'plantilla-comercial'
                      ? 'bg-brand-yellow text-black shadow-glow'
                      : 'bg-[#222] text-gray-300 hover:bg-[#333]'
                  }`}
                >
                  {formData.plantilla === 'plantilla-comercial' ? 'Plantilla Seleccionada' : 'Elegir esta Plantilla'}
                </button>
              </div>
            </div>
          </div>

          {/* Selector de Apariencia del Menú Digital */}
          <div className="pt-6 border-t border-[#222] space-y-4">
            <div>
              <h4 className="text-sm font-black uppercase text-white font-display flex items-center gap-2">
                <Layout className="w-4 h-4 text-brand-yellow" />
                <span>Apariencia del Menú Digital (Modo de Navegación)</span>
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                Escoge cómo deseas que los clientes exploren los platos de tu carta digital.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setFormData({ ...formData, aparienciaMenu: 'clasico' })}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${
                  formData.aparienciaMenu === 'clasico'
                    ? 'border-brand-yellow bg-brand-yellow/10 shadow-glow'
                    : 'border-[#262626] bg-[#161616] hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-white">Opción A — Menú Actual</span>
                  {formData.aparienciaMenu === 'clasico' && (
                    <span className="bg-brand-yellow text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Activo</span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  Diseño clásico con hero banner dinámico, barra superior de categorías y filtros interactivos.
                </p>
              </div>

              <div
                onClick={() => setFormData({ ...formData, aparienciaMenu: 'lateral' })}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${
                  formData.aparienciaMenu === 'lateral'
                    ? 'border-brand-yellow bg-brand-yellow/10 shadow-glow'
                    : 'border-[#262626] bg-[#161616] hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-white">Opción B — Menú Lateral</span>
                  {formData.aparienciaMenu === 'lateral' && (
                    <span className="bg-brand-yellow text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Activo</span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  Barra lateral con categorías fijas en escritorio, barra chip en móviles, fotos completas y navegación por secciones.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 3: PALETA DE COLORES & TOKENS */}
      {activeSubSection === 'colores' && (
        <div className="bg-[#121212] border border-[#242424] rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#222]">
            <div>
              <h3 className="text-base font-black uppercase text-white font-display">
                SISTEMA GLOBAL DE COLORES (DESIGN TOKENS)
              </h3>
              <p className="text-xs text-gray-400">
                Personaliza la paleta visual completa. Estos colores se inyectan automáticamente en todas las páginas, modales, botones y tablas.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs text-brand-yellow hover:underline flex items-center gap-1 font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restablecer paleta
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            {/* Color Primario */}
            <div className="bg-[#181818] p-3.5 rounded-2xl border border-[#262626] space-y-2">
              <label className="block text-gray-300 font-bold uppercase text-[11px]">
                Color Primario (Marca / Acentos)
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={formData.colorPrimario}
                  onChange={(e) => setFormData({ ...formData, colorPrimario: e.target.value })}
                  className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.colorPrimario}
                  onChange={(e) => setFormData({ ...formData, colorPrimario: e.target.value })}
                  className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2 text-white font-mono text-xs uppercase"
                />
              </div>
            </div>

            {/* Color Secundario */}
            <div className="bg-[#181818] p-3.5 rounded-2xl border border-[#262626] space-y-2">
              <label className="block text-gray-300 font-bold uppercase text-[11px]">
                Color Secundario (Contrastes)
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={formData.colorSecundario}
                  onChange={(e) => setFormData({ ...formData, colorSecundario: e.target.value })}
                  className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.colorSecundario}
                  onChange={(e) => setFormData({ ...formData, colorSecundario: e.target.value })}
                  className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2 text-white font-mono text-xs uppercase"
                />
              </div>
            </div>

            {/* Color de Fondo */}
            <div className="bg-[#181818] p-3.5 rounded-2xl border border-[#262626] space-y-2">
              <label className="block text-gray-300 font-bold uppercase text-[11px]">
                Color de Fondo General (App)
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={formData.colorFondo}
                  onChange={(e) => setFormData({ ...formData, colorFondo: e.target.value })}
                  className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.colorFondo}
                  onChange={(e) => setFormData({ ...formData, colorFondo: e.target.value })}
                  className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2 text-white font-mono text-xs uppercase"
                />
              </div>
            </div>

            {/* Color Superficie */}
            <div className="bg-[#181818] p-3.5 rounded-2xl border border-[#262626] space-y-2">
              <label className="block text-gray-300 font-bold uppercase text-[11px]">
                Color de Superficie / Tarjetas
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={formData.colorSuperficie}
                  onChange={(e) => setFormData({ ...formData, colorSuperficie: e.target.value })}
                  className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.colorSuperficie}
                  onChange={(e) => setFormData({ ...formData, colorSuperficie: e.target.value })}
                  className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2 text-white font-mono text-xs uppercase"
                />
              </div>
            </div>

            {/* Color Botón */}
            <div className="bg-[#181818] p-3.5 rounded-2xl border border-[#262626] space-y-2">
              <label className="block text-gray-300 font-bold uppercase text-[11px]">
                Color de Botones de Compra (CTA)
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={formData.colorBoton}
                  onChange={(e) => setFormData({ ...formData, colorBoton: e.target.value })}
                  className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.colorBoton}
                  onChange={(e) => setFormData({ ...formData, colorBoton: e.target.value })}
                  className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2 text-white font-mono text-xs uppercase"
                />
              </div>
            </div>

            {/* Color Texto Botón */}
            <div className="bg-[#181818] p-3.5 rounded-2xl border border-[#262626] space-y-2">
              <label className="block text-gray-300 font-bold uppercase text-[11px]">
                Color de Texto en Botones
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={formData.colorBotonTexto}
                  onChange={(e) => setFormData({ ...formData, colorBotonTexto: e.target.value })}
                  className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.colorBotonTexto}
                  onChange={(e) => setFormData({ ...formData, colorBotonTexto: e.target.value })}
                  className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2 text-white font-mono text-xs uppercase"
                />
              </div>
            </div>

            {/* Color Bordes */}
            <div className="bg-[#181818] p-3.5 rounded-2xl border border-[#262626] space-y-2">
              <label className="block text-gray-300 font-bold uppercase text-[11px]">
                Color de Bordes & Separadores
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={formData.colorBorde}
                  onChange={(e) => setFormData({ ...formData, colorBorde: e.target.value })}
                  className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.colorBorde}
                  onChange={(e) => setFormData({ ...formData, colorBorde: e.target.value })}
                  className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2 text-white font-mono text-xs uppercase"
                />
              </div>
            </div>

            {/* Color Éxito */}
            <div className="bg-[#181818] p-3.5 rounded-2xl border border-[#262626] space-y-2">
              <label className="block text-gray-300 font-bold uppercase text-[11px]">
                Color Éxito / Entregado
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={formData.colorExito}
                  onChange={(e) => setFormData({ ...formData, colorExito: e.target.value })}
                  className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.colorExito}
                  onChange={(e) => setFormData({ ...formData, colorExito: e.target.value })}
                  className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2 text-white font-mono text-xs uppercase"
                />
              </div>
            </div>

            {/* Color Advertencia */}
            <div className="bg-[#181818] p-3.5 rounded-2xl border border-[#262626] space-y-2">
              <label className="block text-gray-300 font-bold uppercase text-[11px]">
                Color Advertencia / Pendiente
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={formData.colorAlerta}
                  onChange={(e) => setFormData({ ...formData, colorAlerta: e.target.value })}
                  className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.colorAlerta}
                  onChange={(e) => setFormData({ ...formData, colorAlerta: e.target.value })}
                  className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2 text-white font-mono text-xs uppercase"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 4: TEXTOS Y SECCIONES */}
      {activeSubSection === 'secciones' && (
        <div className="bg-[#121212] border border-[#242424] rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#222]">
            <div>
              <h3 className="text-base font-black uppercase text-white font-display">
                TEXTOS COMERCIALES Y VISIBILIDAD DE SECCIONES
              </h3>
              <p className="text-xs text-gray-400">
                Personaliza los títulos principales y controla qué módulos mostrar en la portada pública.
              </p>
            </div>
          </div>

          {/* Textos del Hero */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-brand-yellow tracking-wider">
              1. Cabecera Principal (Hero)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">
                  Título Principal del Hero
                </label>
                <input
                  type="text"
                  value={formData.tituloHero}
                  onChange={(e) => setFormData({ ...formData, tituloHero: e.target.value })}
                  placeholder="Ej. ANTOJOS QUE CONECTAN"
                  className="w-full bg-[#181818] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">
                  Subtítulo del Hero
                </label>
                <input
                  type="text"
                  value={formData.subtituloHero}
                  onChange={(e) => setFormData({ ...formData, subtituloHero: e.target.value })}
                  placeholder="Ej. Comidas Rápidas Gourmet al Carbón"
                  className="w-full bg-[#181818] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-300 font-bold uppercase mb-1">
                  Descripción Comercial del Hero
                </label>
                <textarea
                  rows={2}
                  value={formData.descripcionHero}
                  onChange={(e) => setFormData({ ...formData, descripcionHero: e.target.value })}
                  placeholder="Hamburguesas artesanales, picadas para compartir, salchipapas crocantes y la mejor parrilla de Cali..."
                  className="w-full bg-[#181818] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">
                  Texto del Botón Principal
                </label>
                <input
                  type="text"
                  value={formData.textoBotonHero}
                  onChange={(e) => setFormData({ ...formData, textoBotonHero: e.target.value })}
                  placeholder="Ver la Carta"
                  className="w-full bg-[#181818] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Títulos de Secciones */}
          <div className="space-y-4 pt-4 border-t border-[#202020]">
            <h4 className="text-xs font-black uppercase text-brand-yellow tracking-wider">
              2. Títulos de Secciones del Menú
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">
                  Título de la Sección Carta / Menú
                </label>
                <input
                  type="text"
                  value={formData.tituloSeccionMenu}
                  onChange={(e) => setFormData({ ...formData, tituloSeccionMenu: e.target.value })}
                  placeholder="Nuestra Carta"
                  className="w-full bg-[#181818] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">
                  Título de la Sección Más Vendidos / Destacados
                </label>
                <input
                  type="text"
                  value={formData.tituloSeccionDestacados}
                  onChange={(e) => setFormData({ ...formData, tituloSeccionDestacados: e.target.value })}
                  placeholder="Los Más Populares"
                  className="w-full bg-[#181818] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Switches de Visibilidad */}
          <div className="space-y-4 pt-4 border-t border-[#202020]">
            <h4 className="text-xs font-black uppercase text-brand-yellow tracking-wider">
              3. Visibilidad de Módulos en la Portada
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: 'mostrarHero', label: 'Cabecera Hero' },
                { key: 'mostrarCategorias', label: 'Barra de Categorías' },
                { key: 'mostrarDestacados', label: 'Platos Más Vendidos' },
                { key: 'mostrarPromociones', label: 'Banner de Promociones' },
                { key: 'mostrarResenas', label: 'Calificaciones de Clientes' },
                { key: 'mostrarHorarios', label: 'Horarios y Ubicación' },
              ].map((sw) => {
                const checked = (formData as any)[sw.key];
                return (
                  <label
                    key={sw.key}
                    className="flex items-center justify-between p-3.5 bg-[#181818] border border-[#262626] rounded-2xl cursor-pointer hover:border-gray-500 transition"
                  >
                    <span className="text-xs font-bold text-gray-300">{sw.label}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setFormData({ ...formData, [sw.key]: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-brand-yellow focus:ring-0 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 5: TIPOGRAFÍA & ESTILOS AVANZADOS */}
      {activeSubSection === 'estilo' && (
        <div className="bg-[#121212] border border-[#242424] rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#222]">
            <div>
              <h3 className="text-base font-black uppercase text-white font-display">
                TIPOGRAFÍA Y BORDES AVANZADOS
              </h3>
              <p className="text-xs text-gray-400">
                Ajusta las curvas, estilo de tarjetas y fuente tipográfica general de la tienda.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Tipografía */}
            <div className="bg-[#181818] p-4 rounded-2xl border border-[#262626] space-y-3">
              <label className="block text-gray-300 font-bold uppercase">
                Familia Tipográfica
              </label>
              <select
                value={formData.tipografia}
                onChange={(e) => setFormData({ ...formData, tipografia: e.target.value })}
                className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2.5 text-white font-bold"
              >
                <option value="system">Sistema Predeterminado (Poppins / Bebas)</option>
                <option value="inter">Inter (Moderna & Tecnológica)</option>
                <option value="montserrat">Montserrat (Urbana & Fuerte)</option>
                <option value="playfair">Playfair Display (Elegante & Gourmet)</option>
              </select>
              <p className="text-[10px] text-gray-400">
                Se aplica armónicamente a títulos y párrafos respetando la jerarquía visual.
              </p>
            </div>

            {/* Radio de Bordes */}
            <div className="bg-[#181818] p-4 rounded-2xl border border-[#262626] space-y-3">
              <label className="block text-gray-300 font-bold uppercase">
                Estilo de Bordes y Curvatura
              </label>
              <select
                value={formData.radioBordes}
                onChange={(e) => setFormData({ ...formData, radioBordes: e.target.value })}
                className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2.5 text-white font-bold"
              >
                <option value="rounded-none">Sin bordes / Rectangular (0px)</option>
                <option value="rounded-lg">Curvatura Ligera (rounded-lg - 8px)</option>
                <option value="rounded-2xl">Moderna Equilibrada (rounded-2xl - 16px)</option>
                <option value="rounded-full">Estilo Píldora Completa (rounded-full)</option>
              </select>
              <p className="text-[10px] text-gray-400">
                Afecta botones, tarjetas de productos y contenedores principales.
              </p>
            </div>

            {/* Columnas del Menú */}
            <div className="bg-[#181818] p-4 rounded-2xl border border-[#262626] space-y-3">
              <label className="block text-gray-300 font-bold uppercase">
                Columnas en Menú Escritorio
              </label>
              <select
                value={formData.columnasMenu}
                onChange={(e) => setFormData({ ...formData, columnasMenu: Number(e.target.value) })}
                className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2.5 text-white font-bold"
              >
                <option value={2}>2 Columnas (Tarjetas grandes con fotos destacadas)</option>
                <option value={3}>3 Columnas (Equilibrada estándar)</option>
                <option value={4}>4 Columnas (Catálogo compacto)</option>
              </select>
              <p className="text-[10px] text-gray-400">
                En dispositivos móviles se adapta automáticamente a 1 columna para máxima legibilidad.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Actions Bar */}
      <div className="sticky bottom-4 z-30 bg-[#161616]/95 backdrop-blur-md border border-[#2c2c2c] p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Info className="w-4 h-4 text-brand-yellow flex-shrink-0" />
          <span>Los cambios se guardan directamente en MySQL y se reflejan en tiempo real.</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2 bg-[#222] hover:bg-[#2a2a2a] text-gray-300 font-bold text-xs rounded-xl transition"
          >
            Restaurar
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="px-6 py-2.5 bg-brand-yellow hover:bg-yellow-400 text-black font-black uppercase text-xs rounded-xl shadow-glow transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Guardar y Publicar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
