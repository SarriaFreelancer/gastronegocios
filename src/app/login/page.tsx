'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
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
  const redirectPath = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('admin@puntog.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem(LOCAL_STORAGE_AUTH);
      if (savedAuth) {
        const user = JSON.parse(savedAuth);
        if (user && user.id) {
          router.replace(redirectPath);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCheckingAuth(false);
    }
  }, [router, redirectPath]);

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
        router.push(redirectPath);
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
    <div className="min-h-screen bg-[#080808] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-yellow/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-brand-orange/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141414] border border-[#242424] text-gray-300 hover:text-white hover:border-gray-500 text-xs font-bold transition shadow-md"
        >
          <ArrowLeft className="w-4 h-4 text-brand-yellow" />
          <span>Volver al Menú</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        {/* Logo and Welcome Banner */}
        <div className="text-center space-y-3 mb-6">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-brand-yellow/10 border border-brand-yellow/30 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-yellow" />
            <span className="text-[10px] font-black uppercase text-brand-yellow tracking-widest">
              ACCESO ADMINISTRATIVO & CAJA
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase text-white font-display tracking-wide">
            INICIAR SESIÓN
          </h1>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            Ingresa con tus credenciales autorizadas para gestionar pedidos, caja, menú y usuarios de Punto G.
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#121212] border border-[#242424] py-7 px-5 sm:px-8 rounded-2xl shadow-2xl space-y-5">
          {error && (
            <div className="bg-red-500/15 border border-red-500/40 text-red-400 text-xs p-3 rounded-xl flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-gray-300 font-bold uppercase text-[11px] mb-1.5 tracking-wider">
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@puntog.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2c2c2c] rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow text-xs transition"
                />
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Password Field with Eye Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-gray-300 font-bold uppercase text-[11px] tracking-wider">
                  Contraseña
                </label>
                <span className="text-[10px] text-gray-500">Sensible a mayúsculas</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2c2c2c] rounded-xl pl-10 pr-10 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow text-xs transition"
                />
                <KeyRound className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-gray-400 hover:text-white transition p-0.5"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-brand-yellow" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Demo Credentials Box */}
            <div className="bg-[#181818] border border-[#282828] p-3 rounded-xl text-[11px] text-gray-400 flex items-center justify-between">
              <div>
                <span className="font-bold text-brand-yellow block text-[10px] uppercase">
                  Acceso Administrador:
                </span>
                <span className="text-white text-xs font-mono">admin@puntog.com</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-500 block text-[10px] uppercase">Clave:</span>
                <span className="text-white text-xs font-mono">admin123</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-glow transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Validando credenciales...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>INGRESAR AL PANEL</span>
                </>
              )}
            </button>
          </form>

          {/* Quick links */}
          <div className="pt-2 border-t border-[#1e1e1e] flex items-center justify-between text-[11px] text-gray-400">
            <Link
              href="/cocina"
              target="_blank"
              className="hover:text-brand-yellow transition flex items-center gap-1 font-bold"
            >
              <ChefHat className="w-3.5 h-3.5 text-brand-yellow" />
              <span>Pantalla Cocina</span>
            </Link>
            <Link
              href="/rastreo"
              className="hover:text-brand-yellow transition"
            >
              Rastreo de Pedidos
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-gray-500 mt-6">
          Punto G &copy; {new Date().getFullYear()} — Antojos que conectan
        </p>
      </div>
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
