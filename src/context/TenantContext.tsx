'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { usePathname, useParams } from 'next/navigation';

export interface TenantData {
  id: number;
  nombre: string;
  slug: string;
  subdominio?: string | null;
  dominio?: string | null;
  eslogan?: string | null;
  descripcion?: string | null;
  logo?: string | null;
  favicon?: string | null;
  bannerHero?: string | null;

  // Extended color tokens
  colorPrimario: string;
  colorSecundario: string;
  colorTerciario?: string | null;
  colorAcento?: string | null;
  colorFondo: string;
  colorSuperficie?: string | null;
  colorTexto?: string | null;
  colorTextoSecundario?: string | null;
  colorBorde?: string | null;
  colorBoton?: string | null;
  colorBotonTexto?: string | null;
  colorNavegacion?: string | null;
  colorExito?: string | null;
  colorAlerta?: string | null;
  colorError?: string | null;

  // Template & Section customization
  plantilla?: string | null;
  tituloHero?: string | null;
  subtituloHero?: string | null;
  descripcionHero?: string | null;
  textoBotonHero?: string | null;
  bannerPromocional?: string | null;
  textoPromocional?: string | null;
  tituloSeccionMenu?: string | null;
  tituloSeccionDestacados?: string | null;
  mostrarHero?: boolean;
  mostrarCategorias?: boolean;
  mostrarDestacados?: boolean;
  mostrarPromociones?: boolean;
  mostrarResenas?: boolean;
  mostrarHorarios?: boolean;
  ordenSecciones?: string | null;
  horarioAtencion?: string | null;
  redesSociales?: string | null;

  // Typography & Styling
  tipografia?: string | null;
  radioBordes?: string | null;
  estiloTarjetas?: string | null;
  columnasMenu?: number;
  aparienciaMenu?: string | null;
  aparienciaAdmin?: string | null;
  politicaStockNegativo?: string | null;

  // Contact info
  telefono?: string | null;
  telefonoWhatsapp?: string | null;
  mensajeWhatsappDefault?: string | null;
  email?: string | null;
  correoRemitente?: string | null;
  correoDestinatario?: string | null;
  imagenHero?: string | null;
  instagram?: string | null;
  direccionCentral?: string | null;
  ciudad: string;
  costoDomicilioBase: number;
  propinaSugeridaPct: number;
  plan?: string;
  activo: boolean;

  // SEO
  seoTitulo?: string | null;
  seoDescripcion?: string | null;
  seoKeywords?: string | null;
  seoTipoNegocio?: string | null;
  seoImagenCompartir?: string | null;
  seoUrlCanonica?: string | null;
  googleSearchConsoleCode?: string | null;
  googleAnalyticsId?: string | null;

  branches?: Array<{
    id: number;
    nombre: string;
    slug: string;
    direccion?: string | null;
    telefono?: string | null;
    ciudad: string;
    activo: boolean;
  }>;
}

interface TenantContextValue {
  tenant: TenantData | null;
  restaurant: TenantData | null;
  isTenant: boolean;
  tenantSlug: string | null;
  isLoading: boolean;
  loading: boolean;
  refreshTenant: () => Promise<void>;
  setTenantData: (data: TenantData | null) => void;
}

const defaultTenantPuntoG: TenantData = {
  id: 1,
  nombre: 'Punto G',
  slug: 'punto-g',
  subdominio: 'puntog',
  eslogan: 'Tu Máximo Placer',
  descripcion: 'Restaurante de comidas rápidas gourmet en Cali: hamburguesas artesanales, picadas, salchipapas, perros calientes y parrillas al carbón.',
  logo: null,
  bannerHero: null,
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
  plantilla: 'plantilla-actual',
  tituloHero: 'ANTOJOS QUE CONECTAN',
  subtituloHero: 'Comidas Rápidas Gourmet al Carbón',
  descripcionHero: 'Hamburguesas artesanales, picadas para compartir, salchipapas crocantes y la mejor parrilla de Cali.',
  textoBotonHero: 'Ver la Carta Completa',
  tituloSeccionMenu: 'NUESTRA CARTA GOURMET',
  tituloSeccionDestacados: 'LOS MÁS PEDIDOS DE LA CASA',
  mostrarHero: true,
  mostrarCategorias: true,
  mostrarDestacados: true,
  mostrarPromociones: true,
  mostrarResenas: true,
  mostrarHorarios: true,
  aparienciaMenu: 'clasico',
  aparienciaAdmin: 'lateral',
  politicaStockNegativo: 'BLOQUEAR',
  telefonoWhatsapp: '3229088736',
  direccionCentral: 'Calle 9 # 45-12, Granada, Cali',
  ciudad: 'Cali',
  costoDomicilioBase: 5000,
  propinaSugeridaPct: 10,
  plan: 'Enterprise',
  activo: true,
};

const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  restaurant: null,
  isTenant: false,
  tenantSlug: null,
  isLoading: false,
  loading: false,
  refreshTenant: async () => {},
  setTenantData: () => {},
});

// Cache for in-flight requests to avoid duplicate fetches
const tenantCache: Record<string, TenantData> = {};

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const params = useParams();

  // Detect slug from URL /r/[slug]...
  const detectedSlug = useMemo(() => {
    if (params?.slug && typeof params.slug === 'string') {
      return params.slug.toLowerCase().trim();
    }
    const match = pathname.match(/^\/r\/([^\/]+)/);
    if (match && match[1]) {
      return match[1].toLowerCase().trim();
    }
    return null;
  }, [pathname, params]);

  const [tenant, setTenant] = useState<TenantData | null>(() => {
    if (detectedSlug && tenantCache[detectedSlug]) {
      return tenantCache[detectedSlug];
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Apply CSS Variables to Document Root
  const applyThemeTokens = (t: TenantData | null) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    const prim = t?.colorPrimario || '#ffc928';
    const sec = t?.colorSecundario || '#E94B24';
    const tert = t?.colorTerciario || '#1a1a1a';
    const accent = t?.colorAcento || prim;
    const bg = t?.colorFondo || '#080808';
    const surf = t?.colorSuperficie || '#121212';
    const txt = t?.colorTexto || '#ffffff';
    const txtMuted = t?.colorTextoSecundario || '#9ca3af';
    const border = t?.colorBorde || '#262626';
    const btn = t?.colorBoton || prim;
    const btnTxt = t?.colorBotonTexto || '#000000';
    const nav = t?.colorNavegacion || '#0a0a0a';
    const succ = t?.colorExito || '#10b981';
    const warn = t?.colorAlerta || '#f59e0b';
    const err = t?.colorError || '#ef4444';

    root.style.setProperty('--tenant-primary', prim);
    root.style.setProperty('--tenant-secondary', sec);
    root.style.setProperty('--tenant-tertiary', tert);
    root.style.setProperty('--tenant-accent', accent);
    root.style.setProperty('--tenant-background', bg);
    root.style.setProperty('--tenant-surface', surf);
    root.style.setProperty('--tenant-text', txt);
    root.style.setProperty('--tenant-text-muted', txtMuted);
    root.style.setProperty('--tenant-border', border);
    root.style.setProperty('--tenant-button', btn);
    root.style.setProperty('--tenant-button-text', btnTxt);
    root.style.setProperty('--tenant-navigation', nav);
    root.style.setProperty('--tenant-success', succ);
    root.style.setProperty('--tenant-warning', warn);
    root.style.setProperty('--tenant-error', err);

    // Apply border radius
    const radiusMap: Record<string, string> = {
      'rounded-none': '0px',
      'rounded-sm': '0.25rem',
      'rounded-md': '0.375rem',
      'rounded-lg': '0.5rem',
      'rounded-xl': '0.75rem',
      'rounded-2xl': '1rem',
      'rounded-3xl': '1.5rem',
      'rounded-full': '9999px',
    };
    root.style.setProperty('--tenant-radius', radiusMap[t?.radioBordes || 'rounded-2xl'] || '1rem');
  };

  const fetchTenant = async (slugToFetch: string, force = false) => {
    if (!force && tenantCache[slugToFetch]) {
      setTenant(tenantCache[slugToFetch]);
      applyThemeTokens(tenantCache[slugToFetch]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/restaurants?slug=${slugToFetch}&_t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          tenantCache[slugToFetch] = data;
          setTenant(data);
          applyThemeTokens(data);
          return;
        }
      }
      // If not found or error, set null
      setTenant(null);
      applyThemeTokens(null);
    } catch (e) {
      console.error('Error fetching tenant:', e);
      setTenant(null);
      applyThemeTokens(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (detectedSlug) {
      fetchTenant(detectedSlug);
    } else if (
      pathname === '/' ||
      pathname.startsWith('/registro') ||
      pathname.startsWith('/superadmin') ||
      pathname.startsWith('/login')
    ) {
      // Global GastroNegocios SaaS routes: do not inject Punto G tenant branding
      setTenant(null);
      applyThemeTokens(null);
    } else {
      // Legacy root client routes (/menu, /checkout, etc.)
      if (!tenant) {
        setTenant(defaultTenantPuntoG);
        applyThemeTokens(defaultTenantPuntoG);
      }
      fetchTenant('punto-g');
    }
  }, [detectedSlug, pathname]);

  // Listen for global tenant updates (e.g. when configurations are updated in admin)
  useEffect(() => {
    const handleTenantUpdate = (e: any) => {
      const targetSlug = e?.detail?.slug || detectedSlug || 'punto-g';
      delete tenantCache[targetSlug];
      delete tenantCache['punto-g'];
      fetchTenant(targetSlug, true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('punto-g:tenant-updated', handleTenantUpdate);
      return () => window.removeEventListener('punto-g:tenant-updated', handleTenantUpdate);
    }
  }, [detectedSlug]);

  const refreshTenant = async () => {
    const slugToRefresh = detectedSlug || 'punto-g';
    delete tenantCache[slugToRefresh];
    await fetchTenant(slugToRefresh, true);
  };

  const setTenantData = (data: TenantData | null) => {
    setTenant(data);
    if (data && data.slug) {
      tenantCache[data.slug] = data;
    }
    applyThemeTokens(data);
  };

  const isTenant = Boolean(detectedSlug && detectedSlug !== 'punto-g' && detectedSlug !== 'puntog');

  const value = useMemo(
    () => ({
      tenant,
      restaurant: tenant,
      isTenant,
      tenantSlug: detectedSlug,
      isLoading,
      loading: isLoading,
      refreshTenant,
      setTenantData,
    }),
    [tenant, isTenant, detectedSlug, isLoading]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
