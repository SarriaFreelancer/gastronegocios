'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { useTenant } from '@/context/TenantContext';
import {
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  ChefHat,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const LOCAL_STORAGE_AUTH = 'punto_g_admin_logged_in';

/** Official GastroNegocios SaaS Emblem & Wordmark for global /login */
function GastroNegociosBrand({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const iconDim = size === 'lg' ? 'w-14 h-14' : size === 'sm' ? 'w-10 h-10' : 'w-12 h-12';
  const textDim =
    size === 'lg'
      ? 'text-2xl sm:text-3xl'
      : size === 'sm'
      ? 'text-lg'
      : 'text-xl sm:text-2xl';

  return (
    <Link href="/" className="inline-flex items-center gap-3 group">
      <div className={`relative ${iconDim} flex items-center justify-center shrink-0`}>
        <svg
          viewBox="0 0 72 72"
          className="w-full h-full drop-shadow-[0_4px_12px_rgba(250,155,35,0.45)] group-hover:scale-105 transition-transform"
        >
          <defs>
            <linearGradient id="loginGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF099" />
              <stop offset="45%" stopColor="#FA9B23" />
              <stop offset="100%" stopColor="#D96B00" />
            </linearGradient>
            <linearGradient id="loginHatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E5E7EB" />
            </linearGradient>
          </defs>
          <circle cx="36" cy="36" r="30" fill="rgba(250,155,35,0.12)" />
          <g stroke="url(#loginGoldGrad)" strokeLinecap="round" strokeLinejoin="round">
            <path d="M54 58 L22 26" strokeWidth="4.8" />
            <path d="M15 21 L22 28 M18 17 L25 24 M22 15 L29 22" strokeWidth="2.8" />
          </g>
          <g>
            <path
              d="M18 58 L50 26"
              stroke="url(#loginGoldGrad)"
              strokeWidth="4.8"
              strokeLinecap="round"
            />
            <ellipse
              cx="53"
              cy="23"
              rx="6.5"
              ry="4.4"
              transform="rotate(-45 53 23)"
              fill="url(#loginGoldGrad)"
            />
          </g>
          <path
            d="M23 28 C16 27 14 19 20 15 C19 9 27 6 32 10 C35 5 43 6 45 11 C52 9 56 16 51 22 C54 25 51 28 47 28 Z"
            fill="#120705"
            stroke="url(#loginHatGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="24"
            y="28"
            width="24"
            height="5.5"
            rx="2"
            fill="#120705"
            stroke="url(#loginHatGrad)"
            strokeWidth="2.8"
          />
          <path d="M29 28 V33 M36 28 V33 M43 28 V33" stroke="#FA9B23" strokeWidth="1.6" />
        </svg>
      </div>

      <div className="flex flex-col text-left">
        <div className="relative flex items-center">
          <span
            className={`${textDim} font-black tracking-tight uppercase leading-none text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]`}
          >
            GASTRO<span className="text-[#FA9B23]">NEGOCIOS</span>
          </span>
          <span
            className="ml-1.5 -mt-2.5 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest text-white shadow-md"
            style={{
              background: 'linear-gradient(180deg, #FF2A2A 0%, #D90712 100%)',
              border: '1px solid rgba(255,255,255,0.28)',
            }}
          >
            PLATAFORMA
          </span>
        </div>
        <span className="text-[10.5px] text-stone-300 font-medium tracking-wide mt-0.5">
          Software &amp; POS Gastronómico Multi-Restaurante
        </span>
      </div>
    </Link>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenant } = useTenant();
  const redirectPath = searchParams.get('redirect') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentSession, setCurrentSession] = useState<{
    id: number;
    nombre: string;
    email: string;
    rol: string;
    restaurant?: any;
  } | null>(null);

  const isTenantScoped = Boolean(tenant && tenant.slug);
  const brandName = isTenantScoped ? tenant!.nombre : 'GastroNegocios';
  const primaryColor = isTenantScoped ? tenant!.colorPrimario || '#FA9B23' : '#FA9B23';

  // Check if user has an active session or requested logout
  useEffect(() => {
    try {
      const isLogout =
        searchParams.get('logout') === 'true' || searchParams.get('switch') === 'true';
      if (isLogout) {
        localStorage.removeItem(LOCAL_STORAGE_AUTH);
        localStorage.removeItem('puntog_user');
        localStorage.removeItem('punto_g_user');
        localStorage.removeItem('punto_g_active_restaurant');
        setCurrentSession(null);
        setIsCheckingAuth(false);
        return;
      }

      const savedAuth =
        localStorage.getItem(LOCAL_STORAGE_AUTH) || localStorage.getItem('puntog_user');
      if (savedAuth) {
        const user = JSON.parse(savedAuth);
        if (user && user.id) {
          setCurrentSession(user);
          if (redirectPath) {
            const role = (user.rol || user.role || '').toLowerCase();
            if (redirectPath.startsWith('/superadmin') && role !== 'superadmin') {
              // Stay on login page so user can log in with their superadmin account
            } else if (redirectPath === '/admin' && role !== 'superadmin') {
              router.replace(
                user.restaurant?.slug ? `/r/${user.restaurant.slug}/admin` : '/superadmin'
              );
              return;
            } else {
              router.replace(redirectPath);
              return;
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCheckingAuth(false);
    }
  }, [router, redirectPath, searchParams]);

  const handleClearSession = () => {
    localStorage.removeItem(LOCAL_STORAGE_AUTH);
    localStorage.removeItem('puntog_user');
    localStorage.removeItem('punto_g_user');
    localStorage.removeItem('punto_g_active_restaurant');
    setCurrentSession(null);
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          restaurantSlug: tenant?.slug || undefined,
          restaurantId: tenant?.id || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        localStorage.setItem(LOCAL_STORAGE_AUTH, JSON.stringify(data.user));
        localStorage.setItem('puntog_user', JSON.stringify(data.user));
        localStorage.setItem('punto_g_user', JSON.stringify(data.user));
        if (data.user.restaurant) {
          localStorage.setItem('punto_g_active_restaurant', JSON.stringify(data.user.restaurant));
        } else {
          localStorage.removeItem('punto_g_active_restaurant');
        }

        let target = redirectPath;
        const userRole = (data.user.rol || data.user.role || '').toLowerCase();
        const restSlug = data.user.restaurant?.slug || 'punto-g';

        if (userRole === 'superadmin') {
          if (!target || target === '/admin' || target === '/' || !target.includes('/r/')) {
            target = '/superadmin';
          }
        } else {
          if (target && target.startsWith('/superadmin')) {
            target = '';
          }

          if (!target || target === '/admin' || target === '/') {
            if (userRole === 'cocina' || userRole === 'cocinero') {
              target = `/r/${restSlug}/cocina`;
            } else if (userRole === 'mesero') {
              target = `/r/${restSlug}/mesero`;
            } else {
              target = `/r/${restSlug}/admin`;
            }
          }
        }
        router.push(target);
      } else {
        setError(data.error || 'Credenciales inválidas. Verifica tu correo y contraseña.');
      }
    } catch (err) {
      setError('Error al conectar con el servidor. Revisa tu conexión a internet.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#080405] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#FA9B23] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Verificando sesión...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070405] text-white flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Ambient background glowing orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#FA9B23]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Navigation Bar: Back & Live Status */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-6 sm:mb-8 relative z-20">
        <Link
          href={isTenantScoped ? `/r/${tenant!.slug}` : '/'}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#140A08]/90 hover:bg-[#1E100C] border border-[#FA9B23]/30 text-gray-200 hover:text-white text-xs font-bold transition shadow-lg backdrop-blur-md group hover:border-[#FA9B23]"
        >
          <ArrowLeft className="w-4 h-4 text-[#FA9B23] group-hover:-translate-x-1 transition-transform" />
          <span>{isTenantScoped ? `Volver a ${brandName}` : 'Volver a GastroNegocios'}</span>
        </Link>

        <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#140A08]/80 border border-[#FA9B23]/25 text-[11px] font-bold text-gray-300 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{brandName} • Plataforma SaaS &amp; POS</span>
        </div>
      </div>

      {/* Main Glassmorphic Card Container */}
      <div className="w-full max-w-5xl bg-[#110908]/90 backdrop-blur-2xl border border-[#FA9B23]/25 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        {/* Left Side: Branded Visual Showcase */}
        <div className="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-8 xl:p-10 overflow-hidden bg-gradient-to-br from-[#1A0C09] via-[#110806] to-[#080404] border-r border-white/10">
          <div className="absolute inset-0 z-0">
            <img
              src={
                tenant?.bannerHero ||
                '/images/saas/hero-burger-3d.png'
              }
              alt={brandName}
              className="w-full h-full object-cover opacity-20 scale-105 filter contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0605] via-[#0D0605]/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#110908]" />
          </div>

          {/* Top Branding */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              {isTenantScoped ? <Logo size="md" restaurant={tenant} /> : <GastroNegociosBrand size="md" />}
            </div>

            <div className="space-y-2 pt-4">
              <span
                className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border inline-block"
                style={{
                  color: primaryColor,
                  backgroundColor: `${primaryColor}15`,
                  borderColor: `${primaryColor}40`,
                }}
              >
                ECOSISTEMA GASTRONÓMICO SAAS
              </span>
              <h2 className="text-2xl xl:text-3xl font-black uppercase text-white font-display tracking-tight leading-tight">
                {isTenantScoped && tenant?.eslogan ? (
                  tenant.eslogan
                ) : (
                  <>
                    TU NEGOCIO GASTRONÓMICO{' '}
                    <span className="text-[#FA9B23] block">BAJO CONTROL.</span>
                  </>
                )}
              </h2>
              <p className="text-xs text-stone-300 leading-relaxed max-w-xs">
                {tenant?.descripcion ||
                  'Accede a tu consola de administración, punto de venta POS, comandas KDS en vivo, inventario inteligente y multi-sede.'}
              </p>
            </div>
          </div>

          {/* Feature Highlights Badges */}
          <div className="relative z-10 space-y-2.5 pt-6">
            <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold"
                style={{
                  backgroundColor: `${primaryColor}20`,
                  color: primaryColor,
                }}
              >
                <ChefHat className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">Cocina KDS &amp; Mesas QR</p>
                <span className="text-[10px] text-stone-400">Comandas en tiempo real sin comisiones</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">Multi-Restaurante &amp; Multi-Sede</p>
                <span className="text-[10px] text-stone-400">Cada negocio con su marca, carta y caja aislada</span>
              </div>
            </div>
          </div>

          {/* Bottom copyright / version */}
          <div className="relative z-10 pt-4 border-t border-white/[0.08] flex items-center justify-between text-[10px] text-stone-400">
            <span>GastroNegocios Cloud</span>
            <span className="font-bold text-[#FA9B23]">SarriaTech Solutions</span>
          </div>
        </div>

        {/* Right Side: Interactive Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 xl:p-12 flex flex-col justify-between space-y-6">
          {/* Header Mobile Logo & Welcome */}
          <div className="space-y-3 text-center sm:text-left">
            <div className="lg:hidden flex justify-center mb-3">
              {isTenantScoped ? <Logo size="md" restaurant={tenant} /> : <GastroNegociosBrand size="sm" />}
            </div>

            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider"
              style={{
                backgroundColor: `${primaryColor}15`,
                borderColor: `${primaryColor}40`,
                color: primaryColor,
              }}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>ACCESO STAFF &amp; ADMINISTRACIÓN</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase text-white font-display tracking-tight">
                INICIAR SESIÓN EN <span className="text-[#FA9B23]">{brandName.toUpperCase()}</span>
              </h1>
              <p className="text-xs text-stone-300 mt-1">
                {isTenantScoped
                  ? `Ingresa con tus credenciales para administrar ${brandName}.`
                  : 'Ingresa con tu cuenta de Superadmin, Administrador de Restaurante, Cajero, Mesero o Cocina.'}
              </p>
            </div>
          </div>

          {/* Active Session Notification if logged in */}
          {currentSession && (
            <div className="bg-[#FA9B23]/10 border border-[#FA9B23]/30 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FA9B23]/20 text-[#FA9B23] flex items-center justify-center font-black text-xs">
                  {currentSession.nombre ? currentSession.nombre[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    Sesión activa:{' '}
                    <span className="text-[#FA9B23]">{currentSession.nombre}</span> (
                    {currentSession.rol})
                  </p>
                  <p className="text-[10px] text-gray-400">{currentSession.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  href={
                    (currentSession.rol || '').toLowerCase() === 'superadmin'
                      ? '/superadmin'
                      : currentSession.restaurant?.slug
                      ? `/r/${currentSession.restaurant.slug}/admin`
                      : '/admin'
                  }
                  className="px-3 py-1.5 bg-[#FA9B23] text-black font-black text-[11px] rounded-xl uppercase hover:bg-amber-400 transition"
                >
                  Ir al Panel
                </Link>
                <button
                  type="button"
                  onClick={handleClearSession}
                  className="px-3 py-1.5 bg-[#252525] text-gray-300 font-bold text-[11px] rounded-xl hover:bg-red-500/20 hover:text-red-400 transition cursor-pointer"
                >
                  Cambiar cuenta
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="bg-red-500/15 border border-red-500/40 text-red-300 text-xs p-3.5 rounded-2xl flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-1.5">
              <label className="block text-gray-300 font-extrabold uppercase text-[11px] tracking-wider">
                Correo Electrónico
              </label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  autoComplete="username email"
                  placeholder="admin@turestaurante.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#171110] hover:bg-[#1c1412] focus:bg-[#1f1614] border border-[#332420] focus:border-[#FA9B23] rounded-2xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FA9B23]/30 text-xs sm:text-sm font-medium transition-all shadow-inner"
                />
                <div className="w-8 h-8 rounded-xl bg-[#241916] text-gray-400 group-focus-within:text-[#FA9B23] group-focus-within:bg-[#FA9B23]/10 flex items-center justify-center absolute left-2 top-2 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-gray-300 font-extrabold uppercase text-[11px] tracking-wider">
                  Contraseña
                </label>
                <span className="text-[10px] text-gray-500 font-medium">Sensible a mayúsculas</span>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#171110] hover:bg-[#1c1412] focus:bg-[#1f1614] border border-[#332420] focus:border-[#FA9B23] rounded-2xl pl-11 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FA9B23]/30 text-xs sm:text-sm font-medium transition-all shadow-inner"
                />
                <div className="w-8 h-8 rounded-xl bg-[#241916] text-gray-400 group-focus-within:text-[#FA9B23] group-focus-within:bg-[#FA9B23]/10 flex items-center justify-center absolute left-2 top-2 transition-colors">
                  <KeyRound className="w-4 h-4" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="w-8 h-8 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center absolute right-2.5 top-2 transition cursor-pointer"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-[#FA9B23]" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Quick Autofill Access Chips */}
            <div className="bg-[#160E0C] border border-[#2c1d19] rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  Acceso Rápido Demo (1 Clic):
                </span>
                <span className="text-[10px] text-[#FA9B23] font-bold">Auto-completar</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('superadmin@gastronegocios.com');
                    setPassword('admin123');
                  }}
                  className="py-1.5 px-2 rounded-xl bg-[#221614] hover:bg-[#FA9B23] hover:text-black text-gray-200 text-[10px] sm:text-[11px] font-bold border border-[#362420] transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                >
                  <span>👑 Superadmin</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@puntog.com');
                    setPassword('admin123');
                  }}
                  className="py-1.5 px-2 rounded-xl bg-[#221614] hover:bg-[#FA9B23] hover:text-black text-gray-200 text-[10px] sm:text-[11px] font-bold border border-[#362420] transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                >
                  <span>🍔 Demo Punto G</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@salchiricuras.com');
                    setPassword('admin123');
                  }}
                  className="py-1.5 px-2 rounded-xl bg-[#221614] hover:bg-[#FA9B23] hover:text-black text-gray-200 text-[10px] sm:text-[11px] font-bold border border-[#362420] transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                >
                  <span>🍟 Demo Salchi</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('cocina@puntog.com');
                    setPassword('cocina123');
                  }}
                  className="py-1.5 px-2 rounded-xl bg-[#221614] hover:bg-[#FA9B23] hover:text-black text-gray-200 text-[10px] sm:text-[11px] font-bold border border-[#362420] transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                >
                  <span>👨‍🍳 Demo KDS</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              style={{
                background: 'linear-gradient(180deg, #FF2E2E 0%, #D90812 100%)',
                boxShadow: '0 10px 30px rgba(241, 15, 26, 0.45), inset 0 1px 1px rgba(255,255,255,0.35)',
                border: '1px solid rgba(255,110,110,0.45)',
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Validando credenciales...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 stroke-[2.5]" />
                  <span>INGRESAR A LA PLATAFORMA</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Quick Links */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
            <Link
              href="/registro"
              className="hover:text-[#FA9B23] transition flex items-center gap-1.5 font-bold text-stone-200"
            >
              <Sparkles className="w-4 h-4 text-[#FA9B23]" />
              <span>¿No tienes cuenta? Crear Restaurante Gratis</span>
            </Link>

            <Link
              href="/superadmin"
              className="hover:text-[#FA9B23] transition font-semibold"
            >
              Portal Superadmin
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Legal / Credits */}
      <p className="text-center text-[11px] text-stone-400 mt-6 relative z-10">
        <strong>GastroNegocios Plataforma SaaS</strong> — Desarrollado por{' '}
        <a
          href="https://www.sarriatech.tech"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#FA9B23] hover:underline font-bold inline-flex items-center gap-1"
        >
          <span>SarriaTech Solutions S.A.S (www.sarriatech.tech)</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070405] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-[#FA9B23] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
