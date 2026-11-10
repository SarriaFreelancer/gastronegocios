'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UtensilsCrossed,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Store,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Flame,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Globe,
  ExternalLink
} from 'lucide-react';
import { showSuccess, showError } from '@/lib/swal';

interface CategoryPreset {
  id: string;
  name: string;
  slogan: string;
  image: string;
  color: string;
  description: string;
}

const CATEGORY_PRESETS: CategoryPreset[] = [
  {
    id: 'burger',
    name: 'Hamburguesas Gourmet',
    slogan: 'Hamburguesas Artesanales al Carbón',
    image: '/images/assets/burger-hero-transparent.png',
    color: '#FFC928',
    description: 'Perfecto para negocios de burgers artesanales, smash burgers y combos.',
  },
  {
    id: 'salchipapa',
    name: 'Salchipapas & Mazorcadas',
    slogan: 'El Auténtico Sabor Callejero',
    image: '/images/assets/salchipapa-3d.png',
    color: '#E53E3E',
    description: 'Ideal para salchipaperías, mazorcadas y comida rápida abundante.',
  },
  {
    id: 'parrilla',
    name: 'Parrilladas & Asados',
    slogan: 'Cortes Finos y Parrilla al Carbón',
    image: '/images/assets/parrilla-3d.png',
    color: '#F97316',
    description: 'Especial para asaderos, steak houses y picadas familiares.',
  },
  {
    id: 'hotdog',
    name: 'Perros Calientes & Fast Food',
    slogan: 'Hot Dogs Especiales Americanos',
    image: '/images/assets/hotdog-3d.png',
    color: '#10B981',
    description: 'Para negocios de perros calientes, sándwiches y antojos rápidos.',
  },
  {
    id: 'drinks',
    name: 'Bar, Cócteles & Bebidas',
    slogan: 'Coctelería de Autor & Licores',
    image: '/images/assets/drinks-3d.png',
    color: '#06B6D4',
    description: 'Bares, gastropubs, licoreras y discotecas con carta de tragos.',
  },
];

export default function RegisterRestaurantPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [createdData, setCreatedData] = useState<any>(null);
  const [selectedPreset, setSelectedPreset] = useState<CategoryPreset>(CATEGORY_PRESETS[0]);

  // Form State
  const [nombreRestaurante, setNombreRestaurante] = useState('');
  const [ciudad, setCiudad] = useState('Cali');
  const [telefonoWhatsapp, setTelefonoWhatsapp] = useState('');
  const [eslogan, setEslogan] = useState('');

  // Admin Account State
  const [nombreAdmin, setNombreAdmin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate live preview slug
  const previewSlug = nombreRestaurante
    ? nombreRestaurante
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
    : 'tu-restaurante';

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreRestaurante.trim()) {
      setErrorMsg('Por favor ingresa el nombre de tu restaurante.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleStep2Submit = () => {
    setStep(3);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nombreAdmin.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Todos los campos del administrador son requeridos.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register-restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreRestaurante,
          ciudad,
          telefonoWhatsapp,
          eslogan: eslogan || selectedPreset.slogan,
          colorPrimario: selectedPreset.color,
          bannerHero: selectedPreset.image,
          nombreAdmin,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear el restaurante.');
      }

      // Guardar sesión automática completa en localStorage
      if (data.user) {
        localStorage.setItem('punto_g_admin_logged_in', JSON.stringify(data.user));
        localStorage.setItem('puntog_auth', JSON.stringify(data.user));
        localStorage.setItem('puntog_user', JSON.stringify(data.user));
        localStorage.setItem('punto_g_user', JSON.stringify(data.user));
        if (data.restaurant) {
          localStorage.setItem('punto_g_active_restaurant', JSON.stringify(data.restaurant));
        }
      }

      setCreatedData(data);
      setStep(4);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error de conexión. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col justify-between selection:bg-brand-yellow selection:text-black font-sans">
      
      {/* Top Header */}
      <header className="border-b border-[#1c1c1c] bg-[#0a0a0a]/90 backdrop-blur-md px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-brand-yellow flex items-center justify-center font-black text-black shadow-glow group-hover:scale-105 transition-transform duration-300">
              <UtensilsCrossed className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-black tracking-wider text-white font-display flex items-center gap-1.5 leading-none">
                GASTRONEGOCIOS <span className="text-[10px] bg-brand-yellow text-black font-black px-1.5 py-0.5 rounded tracking-normal">PLATAFORMA</span>
              </span>
              <span className="text-[10px] text-gray-400 block tracking-widest uppercase font-semibold mt-0.5">
                Software & POS Gastronómico
              </span>
            </div>
          </Link>

          <Link
            href="/login"
            className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition"
          >
            ¿Ya tienes cuenta? <span className="text-brand-yellow font-black">Iniciar Sesión</span>
          </Link>
        </div>
      </header>

      {/* Main Registration Wizard */}
      <main className="max-w-4xl mx-auto px-4 py-10 sm:py-14 w-full">
        
        {/* Progress Tracker */}
        <div className="mb-10 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-xs font-black uppercase tracking-widest shadow-glow">
            <Sparkles className="w-3.5 h-3.5" />
            <span>14 Días de Prueba Gratis • Sin Tarjeta</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase text-white font-display tracking-tight">
            Activa tu Restaurante en <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-brand-yellow to-yellow-500">60 Segundos</span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
            Obtén tu menú digital QR interactivo, pantalla táctil de cocina (KDS), comanderas móviles para meseros y facturación POS térmica con 0% comisiones.
          </p>

          {/* Stepper Pills */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 pt-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              step >= 1 ? 'bg-brand-yellow text-black shadow-glow' : 'bg-[#181818] text-gray-500 border border-[#2b2b2b]'
            }`}>
              <span>1. Tu Negocio</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              step >= 2 ? 'bg-brand-yellow text-black shadow-glow' : 'bg-[#181818] text-gray-500 border border-[#2b2b2b]'
            }`}>
              <span>2. Identidad 3D</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              step === 3 ? 'bg-brand-yellow text-black shadow-glow' : 'bg-[#181818] text-gray-500 border border-[#2b2b2b]'
            }`}>
              <span>3. Acceso Admin</span>
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {/* Wizard Card Container */}
        <div className="bg-[#111111] border-2 border-[#222222] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          
          {/* STEP 1: Datos del Restaurante */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div className="border-b border-[#222] pb-4">
                <h2 className="text-xl font-black uppercase text-white font-display flex items-center gap-2">
                  <Store className="w-5 h-5 text-brand-yellow" />
                  <span>Paso 1: Información de tu Restaurante</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Configura el nombre y la ciudad de tu negocio gastronómico.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-300 mb-2">
                    Nombre del Restaurante *
                  </label>
                  <input
                    type="text"
                    required
                    value={nombreRestaurante}
                    onChange={(e) => setNombreRestaurante(e.target.value)}
                    placeholder="Ej. Burger Master House, Asados Don Pedro, Salchipapas La 14"
                    className="w-full bg-[#181818] border border-[#333] focus:border-brand-yellow rounded-2xl px-4 py-3.5 text-white text-sm font-bold focus:outline-none transition shadow-inner"
                  />
                  <p className="text-[11px] text-gray-500 mt-1 font-mono">
                    Tu dirección web será:{' '}
                    <span className="text-brand-yellow font-bold">
                      https://gastronegocios.com/r/{previewSlug}
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-300 mb-2">
                      Ciudad Principal *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={ciudad}
                        onChange={(e) => setCiudad(e.target.value)}
                        placeholder="Ej. Cali, Bogotá, Medellín, Palmira"
                        className="w-full bg-[#181818] border border-[#333] focus:border-brand-yellow rounded-2xl pl-11 pr-4 py-3.5 text-white text-sm font-bold focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-300 mb-2">
                      WhatsApp para Pedidos
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-emerald-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={telefonoWhatsapp}
                        onChange={(e) => setTelefonoWhatsapp(e.target.value)}
                        placeholder="Ej. 3229088736"
                        className="w-full bg-[#181818] border border-[#333] focus:border-brand-yellow rounded-2xl pl-11 pr-4 py-3.5 text-white text-sm font-bold focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-300 mb-2">
                    Eslogan o Frase Característica (Opcional)
                  </label>
                  <input
                    type="text"
                    value={eslogan}
                    onChange={(e) => setEslogan(e.target.value)}
                    placeholder="Ej. El placer de comer bien • Sabor que enamora"
                    className="w-full bg-[#181818] border border-[#333] focus:border-brand-yellow rounded-2xl px-4 py-3.5 text-white text-sm font-bold focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-brand-yellow to-yellow-500 hover:brightness-110 text-black font-black text-sm uppercase tracking-wider shadow-glow flex items-center gap-2 transition hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Continuar a Estilo 3D</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Selección de Especialidad y Asset 3D */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-[#222] pb-4">
                <h2 className="text-xl font-black uppercase text-white font-display flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <span>Paso 2: Especialidad y Render 3D de Portada</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Selecciona la comida insignia de tu negocio. Tu landing page se generará automáticamente con este modelo 3D y su paleta de colores.
                </p>
              </div>

              {/* Grid de Especialidades 3D */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CATEGORY_PRESETS.map((preset) => {
                  const isSelected = selectedPreset.id === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                        isSelected
                          ? 'bg-[#181818] border-brand-yellow shadow-glow scale-[1.02]'
                          : 'bg-[#131313] border-[#252525] hover:border-gray-600'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-brand-yellow text-black flex items-center justify-center shadow">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}

                      <div className="w-full h-32 relative flex items-center justify-center">
                        <img
                          src={preset.image}
                          alt={preset.name}
                          className="w-full h-full object-contain drop-shadow-[0_12px_18px_rgba(0,0,0,0.8)] transition-transform duration-300 hover:scale-110"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: preset.color }}
                          />
                          <h3 className="font-black text-sm uppercase text-white font-display">
                            {preset.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                          {preset.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botones de navegación */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3.5 rounded-2xl bg-[#181818] hover:bg-[#222] text-gray-300 font-bold text-xs uppercase tracking-wider border border-[#2d2d2d] transition flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>

                <button
                  type="button"
                  onClick={handleStep2Submit}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-brand-yellow to-yellow-500 hover:brightness-110 text-black font-black text-sm uppercase tracking-wider shadow-glow flex items-center gap-2 transition hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Continuar a Crear Cuenta</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Cuenta del Administrador */}
          {step === 3 && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div className="border-b border-[#222] pb-4">
                <h2 className="text-xl font-black uppercase text-white font-display flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Paso 3: Crea tus Credenciales de Administrador</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Con estos datos iniciarás sesión para gestionar tu menú, mesas, cocina y pedidos.
                </p>
              </div>

              {/* Resumen del restaurante a crear */}
              <div className="p-4 rounded-2xl bg-[#181818] border border-[#2b2b2b] flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-black border border-[#333] flex items-center justify-center p-1 shrink-0">
                  <img
                    src={selectedPreset.image}
                    alt={nombreRestaurante}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-yellow block">
                    Restaurante a Registrar:
                  </span>
                  <h4 className="text-base font-black text-white uppercase font-display truncate">
                    {nombreRestaurante}
                  </h4>
                  <span className="text-xs text-gray-400 block font-mono">
                    /r/{previewSlug} • {ciudad}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-300 mb-2">
                    Nombre del Propietario o Administrador *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={nombreAdmin}
                      onChange={(e) => setNombreAdmin(e.target.value)}
                      placeholder="Ej. Juan Carlos Pérez"
                      className="w-full bg-[#181818] border border-[#333] focus:border-brand-yellow rounded-2xl pl-11 pr-4 py-3.5 text-white text-sm font-bold focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-300 mb-2">
                    Correo Electrónico de Acceso *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@turestaurante.com"
                      className="w-full bg-[#181818] border border-[#333] focus:border-brand-yellow rounded-2xl pl-11 pr-4 py-3.5 text-white text-sm font-bold focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-300 mb-2">
                    Contraseña de Acceso *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={4}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Crea una contraseña segura"
                      className="w-full bg-[#181818] border border-[#333] focus:border-brand-yellow rounded-2xl pl-11 pr-4 py-3.5 text-white text-sm font-bold focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3.5 rounded-2xl bg-[#181818] hover:bg-[#222] text-gray-300 font-bold text-xs uppercase tracking-wider border border-[#2d2d2d] transition flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:brightness-110 text-black font-black text-sm uppercase tracking-wider shadow-glow flex items-center gap-2 transition hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Creando Restaurante...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      <span>¡Activar mi Restaurante Gratis!</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: CELEBRACIÓN Y ACCESO DIRECTO */}
          {step === 4 && createdData && (
            <div className="space-y-6 text-center py-4">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-glow">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> 14 Días de Prueba Activos (0% Comisiones)
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-wide">
                  ¡Felicitaciones, {createdData.restaurant.nombre}!
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto">
                  Tu restaurante y carta digital han sido creados correctamente en GastroNegocios. Tu sesión de administrador ya está activa.
                </p>
              </div>

              {/* Tarjeta con Credenciales y Enlaces */}
              <div className="bg-[#141414] border border-[#262626] rounded-3xl p-5 sm:p-6 text-left max-w-xl mx-auto space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#222] pb-3">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block">Restaurante</span>
                    <strong className="text-white text-base font-black">{createdData.restaurant.nombre}</strong>
                  </div>
                  <span className="text-xs bg-brand-yellow/15 text-brand-yellow font-black px-2.5 py-1 rounded-lg border border-brand-yellow/30 font-mono">
                    /r/{createdData.restaurant.slug}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#1a1a1a] p-3 rounded-2xl border border-[#2a2a2a] space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Usuario Administrador</span>
                    <div className="font-mono text-emerald-400 font-bold truncate select-all">{createdData.user.email}</div>
                  </div>
                  <div className="bg-[#1a1a1a] p-3 rounded-2xl border border-[#2a2a2a] space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Contraseña Asignada</span>
                    <div className="font-mono text-emerald-400 font-black select-all">{password || '••••••••'}</div>
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 bg-black/40 p-3 rounded-xl border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-300 font-bold">
                    <Globe className="w-3.5 h-3.5 text-brand-yellow" /> Enlace de tu Menú Digital:
                  </div>
                  <code className="text-brand-yellow font-mono text-xs block break-all select-all">
                    https://gastronegocios.sarriatech.tech/r/{createdData.restaurant.slug}
                  </code>
                </div>
              </div>

              {/* Botones de Acción Directa */}
              <div className="max-w-xl mx-auto space-y-3 pt-2">
                <Link
                  href={`/r/${createdData.restaurant.slug}/admin`}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-brand-yellow to-yellow-500 hover:brightness-110 text-black font-black text-sm uppercase tracking-wider shadow-glow flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-95"
                >
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                  <span>🚀 Ir a Administrar mi Restaurante (Panel POS & Carta)</span>
                  <ArrowRight className="w-5 h-5 ml-auto stroke-[2.5]" />
                </Link>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link
                    href={`/r/${createdData.restaurant.slug}/login?tab=staff`}
                    className="py-3 px-4 rounded-xl bg-[#181818] hover:bg-[#222] text-white font-bold text-xs uppercase tracking-wider border border-[#2d2d2d] flex items-center justify-center gap-2 transition hover:scale-105"
                  >
                    <Lock className="w-4 h-4 text-brand-yellow" />
                    <span>Iniciar Sesión Admin</span>
                  </Link>

                  <Link
                    href={`/r/${createdData.restaurant.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 rounded-xl bg-[#181818] hover:bg-[#222] text-white font-bold text-xs uppercase tracking-wider border border-[#2d2d2d] flex items-center justify-center gap-2 transition hover:scale-105"
                  >
                    <Store className="w-4 h-4 text-emerald-400" />
                    <span>Ver Menú Digital</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Benefits Trust Footer */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs text-gray-400">
          <div className="p-3 rounded-2xl bg-[#121212] border border-[#1e1e1e] flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>0% Comisiones por Pedidos</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#121212] border border-[#1e1e1e] flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Base de Datos y Dominio Aislado</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#121212] border border-[#1e1e1e] flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Soporte Técnico en Español</span>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#1c1c1c] py-6 text-center text-xs text-gray-500">
        <p>
          GastroNegocios • Desarrollado por{' '}
          <a
            href="https://sarriatech.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-brand-yellow font-bold transition-colors underline decoration-brand-yellow/50 underline-offset-2"
          >
            SarriaTech Solutions S.A.S
          </a>{' '}
          Todos los derechos reservados;
        </p>
      </footer>

    </div>
  );
}
