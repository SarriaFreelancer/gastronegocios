'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Search,
  Share2,
  Code2,
  CheckCircle2,
  ExternalLink,
  Save,
  HelpCircle,
  FileCode,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { showSuccess, showError } from '@/lib/swal';

interface SeoTabProps {
  restaurant: any;
  onUpdate: (updated: any) => void;
}

export function SeoTab({ restaurant, onUpdate }: SeoTabProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    seoTitulo: '',
    seoDescripcion: '',
    seoKeywords: '',
    seoTipoNegocio: 'Restaurant',
    seoImagenCompartir: '',
    seoUrlCanonica: '',
    googleSearchConsoleCode: '',
    googleAnalyticsId: '',
  });

  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    if (restaurant) {
      setFormData({
        seoTitulo:
          restaurant.seoTitulo ||
          `${restaurant.nombre} | Restaurante & Domicilios en ${restaurant.ciudad || 'Cali'}`,
        seoDescripcion:
          restaurant.seoDescripcion ||
          restaurant.descripcion ||
          `Pide en línea en ${restaurant.nombre}. Hamburguesas gourmet, comidas rápidas y domicilios en ${restaurant.ciudad || 'Cali'}.`,
        seoKeywords:
          restaurant.seoKeywords ||
          `${restaurant.nombre}, restaurante ${restaurant.ciudad || 'Cali'}, comidas rápidas, domicilios`,
        seoTipoNegocio: restaurant.seoTipoNegocio || 'FastFoodRestaurant',
        seoImagenCompartir:
          restaurant.seoImagenCompartir ||
          restaurant.bannerHero ||
          restaurant.logo ||
          '',
        seoUrlCanonica:
          restaurant.seoUrlCanonica ||
          (typeof window !== 'undefined'
            ? `${window.location.origin}/r/${restaurant.slug}`
            : `https://tudominio.com/r/${restaurant.slug}`),
        googleSearchConsoleCode: restaurant.googleSearchConsoleCode || '',
        googleAnalyticsId: restaurant.googleAnalyticsId || '',
      });
    }
  }, [restaurant]);

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
        showSuccess(
          'Configuración SEO Guardada',
          'Los metadatos dinámicos, Open Graph y datos estructurados Schema.org han sido actualizados.'
        );
      } else {
        const err = await res.json();
        showError('Error al guardar', err.error || 'No se pudo guardar la configuración SEO');
      }
    } catch (e) {
      showError('Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddKeyword = () => {
    const kw = keywordInput.trim();
    if (!kw) return;
    const currentList = formData.seoKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    if (!currentList.includes(kw)) {
      currentList.push(kw);
      setFormData({ ...formData, seoKeywords: currentList.join(', ') });
    }
    setKeywordInput('');
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    const currentList = formData.seoKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    const updated = currentList.filter((k) => k !== kwToRemove);
    setFormData({ ...formData, seoKeywords: updated.join(', ') });
  };

  const domain =
    typeof window !== 'undefined' ? window.location.origin : 'https://tudominio.com';
  const canonicalPreview =
    formData.seoUrlCanonica || `${domain}/r/${restaurant?.slug || ''}`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#181818] via-[#141414] to-[#101010] border border-[#262626] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            <span>POSICIONAMIENTO EN GOOGLE & SEO TÉCNICO</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-display">
            SEO & Indexación: {restaurant?.nombre}
          </h2>
          <p className="text-xs text-gray-400 max-w-xl">
            Optimiza títulos, descripciones, palabras clave y datos estructurados Schema.org para que Google indexe la carta y platos de tu restaurante en las primeras posiciones.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/sitemap.xml"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-[#222] hover:bg-[#2c2c2c] text-gray-200 text-xs font-bold transition flex items-center gap-2 border border-[#333]"
          >
            <FileCode className="w-3.5 h-3.5 text-brand-yellow" />
            <span>Ver Sitemap.xml</span>
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
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar SEO</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Formulario de Configuración (7 cols) */}
        <div className="lg:col-span-7 bg-[#121212] border border-[#242424] rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-black uppercase text-white font-display border-b border-[#222] pb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-brand-yellow" />
            Metadatos para Buscadores (Google, Bing)
          </h3>

          <div className="space-y-4 text-xs">
            {/* Título SEO */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-gray-300 font-bold uppercase">
                  Título SEO (Meta Title)
                </label>
                <span
                  className={`text-[10px] font-mono ${
                    formData.seoTitulo.length > 60
                      ? 'text-amber-400 font-bold'
                      : 'text-gray-400'
                  }`}
                >
                  {formData.seoTitulo.length} / 60 caracteres
                </span>
              </div>
              <input
                type="text"
                value={formData.seoTitulo}
                onChange={(e) =>
                  setFormData({ ...formData, seoTitulo: e.target.value })
                }
                className="w-full bg-[#181818] border border-[#2d2d2d] focus:border-brand-yellow rounded-xl px-3.5 py-2.5 text-white"
                placeholder="Ej. Salchirricuras | Las Mejores Salchipapas en Cali"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Aparece como el enlace azul en los resultados de búsqueda de Google.
              </p>
            </div>

            {/* Meta Descripción */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-gray-300 font-bold uppercase">
                  Meta Descripción (Snippet de Google)
                </label>
                <span
                  className={`text-[10px] font-mono ${
                    formData.seoDescripcion.length > 160
                      ? 'text-amber-400 font-bold'
                      : 'text-gray-400'
                  }`}
                >
                  {formData.seoDescripcion.length} / 160 caracteres
                </span>
              </div>
              <textarea
                rows={3}
                value={formData.seoDescripcion}
                onChange={(e) =>
                  setFormData({ ...formData, seoDescripcion: e.target.value })
                }
                className="w-full bg-[#181818] border border-[#2d2d2d] focus:border-brand-yellow rounded-xl px-3.5 py-2.5 text-white"
                placeholder="Resumen atractivo para convencer al cliente de hacer clic en Google..."
              />
            </div>

            {/* Palabras Clave */}
            <div>
              <label className="block text-gray-300 font-bold uppercase mb-1">
                Palabras Clave de Referencia (Keywords)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                  placeholder="Escribe una palabra clave (ej. salchipapas gourmet) y presiona Añadir"
                  className="flex-1 bg-[#181818] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-4 py-2 bg-[#222] hover:bg-[#333] text-brand-yellow font-bold text-xs rounded-xl transition"
                >
                  Añadir
                </button>
              </div>

              {/* Chips de keywords */}
              <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-xl bg-[#181818] border border-[#262626]">
                {formData.seoKeywords
                  .split(',')
                  .map((k) => k.trim())
                  .filter(Boolean)
                  .map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#252525] text-gray-300 text-[11px] font-semibold border border-[#333]"
                    >
                      <span>{kw}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(kw)}
                        className="text-gray-500 hover:text-red-400 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            </div>

            {/* Tipo de Negocio Schema.org */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">
                  Tipo Schema.org (Datos Estructurados)
                </label>
                <select
                  value={formData.seoTipoNegocio}
                  onChange={(e) =>
                    setFormData({ ...formData, seoTipoNegocio: e.target.value })
                  }
                  className="w-full bg-[#181818] border border-[#2d2d2d] rounded-xl px-3 py-2.5 text-white font-bold"
                >
                  <option value="FastFoodRestaurant">FastFoodRestaurant (Comidas Rápidas)</option>
                  <option value="Restaurant">Restaurant (Restaurante General)</option>
                  <option value="BarOrPub">BarOrPub (Bar / Cervecería)</option>
                  <option value="CafeOrCoffeeShop">CafeOrCoffeeShop (Cafetería)</option>
                  <option value="Bakery">Bakery (Panadería / Repostería)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">
                  URL Canónica
                </label>
                <input
                  type="url"
                  value={formData.seoUrlCanonica}
                  onChange={(e) =>
                    setFormData({ ...formData, seoUrlCanonica: e.target.value })
                  }
                  className="w-full bg-[#181818] border border-[#2d2d2d] rounded-xl px-3 py-2.5 text-white"
                  placeholder="https://tudominio.com/r/salchirricuras"
                />
              </div>
            </div>

            {/* Imagen Open Graph */}
            <div>
              <label className="block text-gray-300 font-bold uppercase mb-1">
                Imagen para Compartir en Redes (Open Graph / WhatsApp)
              </label>
              <input
                type="url"
                value={formData.seoImagenCompartir}
                onChange={(e) =>
                  setFormData({ ...formData, seoImagenCompartir: e.target.value })
                }
                className="w-full bg-[#181818] border border-[#2d2d2d] rounded-xl px-3 py-2.5 text-white"
                placeholder="https://images.unsplash.com/photo-..."
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Dimensión ideal: 1200 x 630 px. Es la foto que aparece al pegar el link en WhatsApp o Facebook.
              </p>
            </div>

            {/* Código de Google Search Console */}
            <div className="pt-3 border-t border-[#202020]">
              <label className="block text-gray-300 font-bold uppercase mb-1">
                Código de Verificación Google Search Console
              </label>
              <input
                type="text"
                value={formData.googleSearchConsoleCode}
                onChange={(e) =>
                  setFormData({ ...formData, googleSearchConsoleCode: e.target.value })
                }
                className="w-full bg-[#181818] border border-[#2d2d2d] rounded-xl px-3 py-2.5 text-white font-mono"
                placeholder="Ej. google-site-verification=abc123XYZ..."
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Permite verificar la propiedad de tu restaurante en Search Console automáticamente sin editar archivos HTML.
              </p>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Previsualizaciones en Vivo (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Previsualización SERP de Google */}
          <div className="bg-[#121212] border border-[#242424] rounded-3xl p-6 space-y-3">
            <span className="text-[11px] font-black uppercase text-brand-yellow tracking-wider flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              Vista Previa en Resultados de Google
            </span>

            {/* Google Result Card */}
            <div className="bg-[#202124] p-4 rounded-2xl space-y-1.5 font-sans border border-[#303134]">
              <div className="flex items-center gap-2 text-[11px] text-[#bdc1c6] truncate">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[8px]">
                  G
                </span>
                <span className="truncate">{canonicalPreview}</span>
              </div>
              <h4 className="text-[#8ab4f8] text-sm sm:text-base font-medium hover:underline cursor-pointer line-clamp-1">
                {formData.seoTitulo || `${restaurant?.nombre} | Restaurante`}
              </h4>
              <p className="text-[#bdc1c6] text-xs line-clamp-2 leading-relaxed">
                {formData.seoDescripcion ||
                  'Pide en línea comidas rápidas gourmet, consulta la carta en vivo y realiza pedidos por WhatsApp.'}
              </p>
            </div>
          </div>

          {/* Previsualización Open Graph (WhatsApp / Redes) */}
          <div className="bg-[#121212] border border-[#242424] rounded-3xl p-6 space-y-3">
            <span className="text-[11px] font-black uppercase text-brand-yellow tracking-wider flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              Tarjeta al Compartir en WhatsApp & Redes
            </span>

            <div className="bg-[#181818] rounded-2xl overflow-hidden border border-[#282828] space-y-0">
              {formData.seoImagenCompartir ? (
                <img
                  src={formData.seoImagenCompartir}
                  alt="Share preview"
                  className="w-full h-36 object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-36 bg-[#222] flex items-center justify-center text-gray-500 text-xs">
                  Sin imagen para compartir configurada
                </div>
              )}
              <div className="p-3.5 space-y-1 bg-[#151515]">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block">
                  {new URL(canonicalPreview).hostname || 'tudominio.com'}
                </span>
                <h5 className="text-xs font-bold text-white line-clamp-1">
                  {formData.seoTitulo || restaurant?.nombre}
                </h5>
                <p className="text-[11px] text-gray-400 line-clamp-2">
                  {formData.seoDescripcion}
                </p>
              </div>
            </div>
          </div>

          {/* Guía Rápida Google Search Console */}
          <div className="bg-[#181818] border border-[#282828] rounded-3xl p-5 space-y-3 text-xs">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ¿Cómo verificar en Google Search Console?
            </span>
            <ol className="list-decimal pl-4 space-y-1.5 text-gray-400 text-[11px] leading-relaxed">
              <li>Ingresa a <strong className="text-white">search.google.com/search-console</strong>.</li>
              <li>Añade tu dominio o URL: <code className="text-brand-yellow">{canonicalPreview}</code>.</li>
              <li>Elige verificación por etiqueta HTML (HTML Tag).</li>
              <li>Copia el valor del atributo content y pégalo en el campo superior.</li>
              <li>Presiona "Guardar SEO" y luego "Verificar" en Google.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
