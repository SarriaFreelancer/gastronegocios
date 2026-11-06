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
} from 'lucide-react';

const LOCAL_STORAGE_AUTH = 'punto_g_admin_logged_in';

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
  const [currentSession, setCurrentSession] = useState<{ id: number; nombre: string; email: string; rol: string; restaurant?: any } | null>(null);

  // Check if user has an active session or requested logout
  useEffect(() => {
    try {
      const isLogout = searchParams.get('logout') === 'true' || searchParams.get('switch') === 'true';
      if (isLogout) {
        localStorage.removeItem(LOCAL_STORAGE_AUTH);
        localStorage.removeItem('puntog_user');
        localStorage.removeItem('punto_g_user');
        localStorage.removeItem('punto_g_active_restaurant');
        setCurrentSession(null);
        setIsCheckingAuth(false);
        return;
      }

      const savedAuth = localStorage.getItem(LOCAL_STORAGE_AUTH) || localStorage.getItem('puntog_user');
      if (savedAuth) {
        const user = JSON.parse(savedAuth);
        if (user && user.id) {
          setCurrentSession(user);
          // If a redirect was explicitly requested by an auth guard and not directly visiting /login, redirect
          if (redirectPath) {
            const role = (user.rol || user.role || '').toLowerCase();
            // If redirected to /superadmin but current user is not superadmin, do NOT auto-redirect back into restriction!
            if (redirectPath.startsWith('/superadmin') && role !== 'superadmin') {
              // Stay on login page so user can log in with their superadmin account
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
        body: JSON.stringify({ email: email.trim(), password }),
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

        // Smart redirect based on role and tenant
        let target = redirectPath;
        if (!target) {
          if (data.user.rol === 'Superadmin') {
            target = '/superadmin';
          } else if (data.user.rol === 'Cocina') {
            target = data.user.restaurant?.slug ? `/r/${data.user.restaurant.slug}/cocina` : '/cocina';
          } else if (data.user.rol === 'Mesero') {
            target = data.user.restaurant?.slug ? `/r/${data.user.restaurant.slug}/mesero` : '/mesero';
          } else if (data.user.restaurant?.slug) {
            target = `/r/${data.user.restaurant.slug}/admin`;
          } else {
            target = '/admin';
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
      <div className="min-h-screen bg-[#080808] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Verificando sesión...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Ambient background glowing orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-yellow/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-brand-orange/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Floating subtle grid background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* Top Navigation Bar: Back & Live Status */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-6 sm:mb-8 relative z-20">
        <Link
          href={tenant?.slug && tenant.slug !== 'punto-g' ? `/r/${tenant.slug}` : '/'}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#141414]/90 hover:bg-[#1f1f1f] border border-[#2b2b2b] text-gray-300 hover:text-white text-xs font-bold transition shadow-lg backdrop-blur-md group hover:border-brand-yellow/50"
        >
          <ArrowLeft className="w-4 h-4 text-brand-yellow group-hover:-translate-x-1 transition-transform" />
          <span>Volver a la Carta</span>
        </Link>

        <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141414]/80 border border-[#262626] text-[11px] font-bold text-gray-400 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-gray-300">{tenant?.nombre || 'Punto G'} • Sistema Operativo</span>
        </div>
      </div>

      {/* Main Glassmorphic Card Container (Split layout on desktop) */}
      <div className="w-full max-w-5xl bg-[#111111]/80 backdrop-blur-2xl border border-[#242424] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Left Side: Branded Visual Showcase (Desktop & Tablets) */}
        <div className="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-8 xl:p-10 overflow-hidden bg-gradient-to-br from-[#161616] via-[#101010] to-[#0a0a0a] border-r border-[#202020]">
          {/* Background culinary image with dark gradient */}
          <div className="absolute inset-0 z-0">
            <img
              src={tenant?.bannerHero || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&auto=format&fit=crop"}
              alt={tenant?.nombre || "Restaurante"}
              className="w-full h-full object-cover opacity-25 scale-105 filter contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#111111]" />
          </div>

          {/* Top Branding */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <Logo size="md" />
            </div>

            <div className="space-y-1.5 pt-4">
              <span
                className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border inline-block"
                style={{
                  color: tenant?.colorPrimario || '#ffc928',
                  backgroundColor: `${tenant?.colorPrimario || '#ffc928'}15`,
                  borderColor: `${tenant?.colorPrimario || '#ffc928'}40`,
                }}
              >
                GASTRONOMÍA & SISTEMA POS
              </span>
              <h2 className="text-2xl xl:text-3xl font-black uppercase text-white font-display tracking-tight leading-tight">
                {tenant?.eslogan ? (
                  <>
                    {tenant.eslogan.split(' ')[0]}{' '}
                    <span className="italic" style={{ color: tenant?.colorPrimario || '#ffc928' }}>
                      {tenant.eslogan.split(' ').slice(1).join(' ')}
                    </span>
                  </>
                ) : (
                  <>
                    ANTOJOS QUE <span className="italic" style={{ color: tenant?.colorPrimario || '#ffc928' }}>CONECTAN</span>
                  </>
                )}
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
                {tenant?.descripcion || 'Plataforma integral para cocina KDS, mesas QR, domicilios, reportes contables y gestión de menú en tiempo real.'}
              </p>
            </div>
          </div>

          {/* Feature Highlights Badges */}
          <div className="relative z-10 space-y-2.5 pt-6">
            <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold"
                style={{
                  backgroundColor: `${tenant?.colorPrimario || '#ffc928'}20`,
                  color: tenant?.colorPrimario || '#ffc928',
                }}
              >
                <ChefHat className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">Cocina en Vivo (KDS)</p>
                <span className="text-[10px] text-gray-400">Comandas en tiempo real sin recargar</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">Caja & Reportes Oficiales</p>
                <span className="text-[10px] text-gray-400">Exportación a Excel (.xlsx) y PDF</span>
              </div>
            </div>
          </div>

          {/* Bottom copyright / version */}
          <div className="relative z-10 pt-4 border-t border-white/[0.08] flex items-center justify-between text-[10px] text-gray-500">
            <span>Versión 2.0 • Dokploy Production</span>
            <span className="font-bold" style={{ color: tenant?.colorPrimario || '#ffc928' }}>
              {tenant?.ciudad || 'Cali, Colombia'}
            </span>
          </div>
        </div>

        {/* Right Side: Interactive Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 xl:p-12 flex flex-col justify-between space-y-6">
          
          {/* Header Mobile Logo & Welcome */}
          <div className="space-y-3 text-center sm:text-left">
            <div className="lg:hidden flex justify-center mb-2">
              <Logo size="md" />
            </div>

            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider"
              style={{
                backgroundColor: `${tenant?.colorPrimario || '#ffc928'}15`,
                borderColor: `${tenant?.colorPrimario || '#ffc928'}40`,
                color: tenant?.colorPrimario || '#ffc928',
              }}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>TERMINAL DE ACCESO SEGURO</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase text-white font-display tracking-tight">
                INICIAR SESIÓN
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Ingresa con tus credenciales para administrar {tenant?.nombre || 'Punto G'}.
              </p>
            </div>
          </div>

          {/* Active Session Notification if logged in */}
          {currentSession && (
            <div className="bg-brand-yellow/10 border border-brand-yellow/30 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-yellow/20 text-brand-yellow flex items-center justify-center font-black text-xs">
                  {currentSession.nombre ? currentSession.nombre[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    Sesión activa: <span className="text-brand-yellow">{currentSession.nombre}</span> ({currentSession.rol})
                  </p>
                  <p className="text-[10px] text-gray-400">{currentSession.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  href={
                    currentSession.rol === 'Superadmin'
                      ? '/superadmin'
                      : currentSession.restaurant?.slug
                      ? `/r/${currentSession.restaurant.slug}/admin`
                      : '/admin'
                  }
                  className="px-3 py-1.5 bg-brand-yellow text-black font-black text-[11px] rounded-xl uppercase hover:bg-yellow-400 transition"
                >
                  Ir al Panel
                </Link>
                <button
                  type="button"
                  onClick={handleClearSession}
                  className="px-3 py-1.5 bg-[#252525] text-gray-300 font-bold text-[11px] rounded-xl hover:text-white hover:bg-red-500/20 hover:text-red-400 transition"
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
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-gray-300 font-extrabold uppercase text-[11px] tracking-wider">
                Correo Electrónico
              </label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  placeholder="admin@puntog.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#171717] hover:bg-[#1a1a1a] focus:bg-[#1c1c1c] border border-[#2b2b2b] focus:border-brand-yellow rounded-2xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30 text-xs sm:text-sm font-medium transition-all shadow-inner"
                />
                <div className="w-8 h-8 rounded-xl bg-[#222] text-gray-400 group-focus-within:text-brand-yellow group-focus-within:bg-brand-yellow/10 flex items-center justify-center absolute left-2 top-2 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Password Field with Toggle */}
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#171717] hover:bg-[#1a1a1a] focus:bg-[#1c1c1c] border border-[#2b2b2b] focus:border-brand-yellow rounded-2xl pl-11 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30 text-xs sm:text-sm font-medium transition-all shadow-inner"
                />
                <div className="w-8 h-8 rounded-xl bg-[#222] text-gray-400 group-focus-within:text-brand-yellow group-focus-within:bg-brand-yellow/10 flex items-center justify-center absolute left-2 top-2 transition-colors">
                  <KeyRound className="w-4 h-4" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="w-8 h-8 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center absolute right-2.5 top-2 transition"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-brand-yellow" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Quick Autofill Access Chips */}
            <div className="bg-[#161616] border border-[#242424] rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  Acceso Rápido (1 Clic):
                </span>
                <span className="text-[10px] text-brand-yellow font-bold">Auto-completar</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('superadmin@puntog.com');
                    setPassword('admin123');
                  }}
                  className="py-1.5 px-2 rounded-xl bg-[#202020] hover:bg-brand-yellow hover:text-black text-gray-300 text-[10px] sm:text-[11px] font-bold border border-[#2e2e2e] transition-all flex items-center justify-center gap-1 active:scale-95"
                >
                  <span>👑 Superadmin</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@puntog.com');
                    setPassword('admin123');
                  }}
                  className="py-1.5 px-2 rounded-xl bg-[#202020] hover:bg-brand-yellow hover:text-black text-gray-300 text-[10px] sm:text-[11px] font-bold border border-[#2e2e2e] transition-all flex items-center justify-center gap-1 active:scale-95"
                >
                  <span>🛡️ Admin PG</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@salchiricuras.com');
                    setPassword('admin123');
                  }}
                  className="py-1.5 px-2 rounded-xl bg-[#202020] hover:bg-brand-yellow hover:text-black text-gray-300 text-[10px] sm:text-[11px] font-bold border border-[#2e2e2e] transition-all flex items-center justify-center gap-1 active:scale-95"
                >
                  <span>🍟 Admin Salchi</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('cocina@puntog.com');
                    setPassword('cocina123');
                  }}
                  className="py-1.5 px-2 rounded-xl bg-[#202020] hover:bg-brand-yellow hover:text-black text-gray-300 text-[10px] sm:text-[11px] font-bold border border-[#2e2e2e] transition-all flex items-center justify-center gap-1 active:scale-95"
                >
                  <span>👨‍🍳 Cocina</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-yellow via-yellow-400 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-[0_10px_30px_rgba(255,201,40,0.35)] hover:shadow-[0_12px_40px_rgba(255,201,40,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Validando credenciales...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 stroke-[2.5]" />
                  <span>INGRESAR AL PANEL</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Quick Links */}
          <div className="pt-4 border-t border-[#1f1f1f] flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
            <Link
              href="/cocina"
              target="_blank"
              className="hover:text-brand-yellow transition flex items-center gap-1.5 font-bold"
            >
              <ChefHat className="w-4 h-4 text-brand-yellow" />
              <span>Pantalla Cocina</span>
            </Link>

            <Link
              href="/rastreo"
              className="hover:text-brand-yellow transition font-semibold"
            >
              Rastreo en Vivo
            </Link>

            <Link
              href="/calificar"
              className="hover:text-brand-yellow transition text-gray-500"
            >
              Calificaciones QR
            </Link>
          </div>

        </div>

      </div>

      {/* Bottom Legal / Restaurant Slogan */}
      <p className="text-center text-[11px] text-gray-500 mt-6 relative z-10">
        {tenant?.nombre || 'Punto G'} {tenant?.ciudad || 'Cali'} &copy; {new Date().getFullYear()} — Sistema Gastronómico y Punto de Venta
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080808] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
