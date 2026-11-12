'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Store,
  Sparkles,
  Check,
  ArrowRight,
  ArrowLeft,
  Palette,
  User,
  Lock,
  Mail,
  Phone,
  MapPin,
  Globe,
  ShieldCheck,
  Rocket,
  Crown,
  Gem,
  Eye,
  EyeOff,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { showSuccess, showError } from '@/lib/swal';
import { DEFAULT_SAAS_PLANS, formatCopPrice, type SaasPlanItem } from '@/lib/saas-plans';

const TEMPLATES = [
  {
    id: 'urbana-gourmet',
    name: 'Urbana & Fuego',
    desc: 'Oscura y vibrante, ideal para hamburgueserías, parrillas y gastrobares.',
    primary: '#F10F1A',
    secondary: '#FA9B23',
  },
  {
    id: 'alta-cocina',
    name: 'Alta Cocina',
    desc: 'Sofisticada y minimalista para restaurantes de autor y parrillas premium.',
    primary: '#f59e0b',
    secondary: '#fbbf24',
  },
  {
    id: 'minimal-clara',
    name: 'Fresco & Artesanal',
    desc: 'Moderna y cálida para cafeterías, pizzerías, brunches y pastelerías.',
    primary: '#10b981',
    secondary: '#059669',
  },
];

const PLAN_ICON_MAP: Record<string, any> = {
  Basico: Rocket,
  Pro: Crown,
  Enterprise: Gem,
};

function mapInitialPlanCode(raw: string | null): string {
  const clean = (raw || '').toLowerCase().trim();
  if (clean === 'basico') return 'Basico';
  if (clean === 'enterprise') return 'Enterprise';
  return 'Pro';
}

function RegistroFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlan = mapInitialPlanCode(searchParams.get('plan'));

  const [plans, setPlans] = useState<SaasPlanItem[]>(DEFAULT_SAAS_PLANS);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    fetch(`/api/saas/plans?active=true&_t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.plans) && data.plans.length > 0) {
          setPlans(data.plans);
        }
      })
      .catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    nombre: '',
    slug: '',
    eslogan: '',
    ciudad: 'Cali',
    direccionCentral: '',
    telefonoWhatsapp: '',
    plan: initialPlan,
    plantilla: 'urbana-gourmet',
    colorPrimario: '#F10F1A',
    colorSecundario: '#FA9B23',
    adminNombre: '',
    adminEmail: '',
    adminPassword: '',
  });

  useEffect(() => {
    if (!slugManuallyEdited && formData.nombre) {
      const generated = formData.nombre
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData((prev) => ({ ...prev, slug: generated }));
    }
  }, [formData.nombre, slugManuallyEdited]);

  const handleSelectTemplate = (tpl: typeof TEMPLATES[0]) => {
    setFormData((prev) => ({
      ...prev,
      plantilla: tpl.id,
      colorPrimario: tpl.primary,
      colorSecundario: tpl.secondary,
    }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.nombre.trim() || !formData.slug.trim()) {
        showError('Datos incompletos', 'Por favor ingresa el nombre de tu restaurante.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.adminEmail.trim() || !formData.adminPassword.trim()) {
      showError('Datos incompletos', 'Ingresa tu correo de administrador y una contraseña segura.');
      return;
    }

    if (formData.adminPassword.trim().length < 5) {
      showError('Contraseña corta', 'La contraseña debe tener al menos 5 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register-restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        showError('No se pudo crear el restaurante', data.error || 'Verifica los datos e intenta nuevamente.');
        setLoading(false);
        return;
      }

      // Guardar sesión automática para entrar directo al panel del nuevo restaurante
      if (data.user) {
        localStorage.setItem('punto_g_admin_logged_in', JSON.stringify(data.user));
        localStorage.setItem('puntog_user', JSON.stringify(data.user));
      }
      if (data.restaurant) {
        localStorage.setItem('punto_g_active_restaurant', JSON.stringify(data.restaurant));
      }

      await showSuccess(
        '¡Restaurante y Sede Principal Creados!',
        `Bienvenido a GastroNegocios. Tu restaurante "${data.restaurant.nombre}" y su Sede Principal ya están activos con 14 días de prueba gratis.`
      );

      router.push(`/r/${data.restaurant.slug}/admin`);
    } catch {
      showError('Error de conexión', 'No pudimos conectar con el servidor. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070303] text-white font-sans relative overflow-hidden flex flex-col justify-between">
      {/* Ambient SaaS Crimson & Amber Bokeh Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full blur-[150px]"
          style={{ background: 'radial-gradient(circle, rgba(241,15,26,0.22) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] rounded-full blur-[150px]"
          style={{ background: 'radial-gradient(circle, rgba(250,155,35,0.18) 0%, transparent 70%)' }}
        />
      </div>

      {/* GastroNegocios SaaS Isolated Header */}
      <header className="relative z-20 border-b border-[#FA9B23]/20 bg-[#0A0403]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg viewBox="0 0 64 64" className="w-12 h-12 drop-shadow-[0_2px_10px_rgba(250,155,35,0.45)]">
                <path
                  d="M20 26 C14 26 12 18 17 14 C16 9 23 6 27 10 C30 6 38 6 40 11 C46 9 50 15 46 21 C49 24 46 28 42 28 Z"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect x="21" y="27" width="22" height="5" rx="1.5" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
                <path d="M16 54 L46 24" stroke="#FA9B23" strokeWidth="4.2" strokeLinecap="round" />
                <ellipse cx="47" cy="23" rx="5.5" ry="3.8" transform="rotate(-45 47 23)" fill="#FA9B23" />
                <path d="M48 54 L18 24" stroke="#FA9B23" strokeWidth="4.2" strokeLinecap="round" />
                <path d="M14 20 L20 26 M16 17 L22 23 M19 15 L25 21" stroke="#FA9B23" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[19px] sm:text-[21px] font-black tracking-tight uppercase leading-none text-white">
                  GASTRO<span className="text-[#FA9B23]">NEGOCIOS</span>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#E50914] text-[8px] font-black uppercase tracking-widest text-white shadow-sm">
                  PLATAFORMA
                </span>
              </div>
              <span className="text-[10px] text-stone-300 font-medium tracking-wide mt-0.5">
                Software &amp; POS Gastronómico Multi-Sede
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/15 text-xs font-bold text-stone-200 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#FA9B23]" />
              <span className="hidden sm:inline">Volver al Inicio</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#160B08] hover:bg-[#22100B] border border-[#FA9B23]/40 text-xs font-bold text-white transition"
            >
              <User className="w-3.5 h-3.5 text-[#FA9B23]" />
              <span>Ya tengo cuenta</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 flex-1">
        {/* Title & Trial Badge */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 shadow-lg"
            style={{
              background: 'linear-gradient(90deg, rgba(229,9,20,0.88) 0%, rgba(168,12,20,0.82) 100%)',
              border: '1px solid rgba(255,120,90,0.45)',
            }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E]" />
            <span className="text-xs font-extrabold text-white tracking-wide">
              14 Días de Prueba Gratis • Sede Principal Automática • 0% Comisiones
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Crea tu Restaurante en{' '}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(180deg, #FFE169 0%, #FA9B23 65%, #E87A00 100%)' }}
            >
              GastroNegocios
            </span>
          </h1>
          <p className="text-stone-300 text-sm sm:text-base mt-2">
            Configura tu marca, tu Sede Principal, tu carta QR y tu panel administrativo en menos de 2 minutos.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
          {[
            { num: 1, label: 'Datos y Sede Principal' },
            { num: 2, label: 'Estilo & Plan' },
            { num: 3, label: 'Cuenta Administrador' },
          ].map((s) => {
            const active = step === s.num;
            const completed = step > s.num;
            return (
              <React.Fragment key={s.num}>
                <button
                  type="button"
                  onClick={() => {
                    if (s.num < step) setStep(s.num as 1 | 2 | 3);
                  }}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border text-xs font-bold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-[#F10F1A]/25 to-[#FA9B23]/20 border-[#FA9B23] text-white shadow-[0_0_20px_rgba(250,155,35,0.25)]'
                      : completed
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 cursor-pointer'
                      : 'bg-white/[0.03] border-white/10 text-stone-500'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                      active
                        ? 'bg-[#FA9B23] text-black'
                        : completed
                        ? 'bg-emerald-500 text-black'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {completed ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {s.num < 3 && <div className="w-6 sm:w-10 h-px bg-white/15" />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Wizard Card */}
        <div className="bg-[#120907]/95 border border-[#FA9B23]/25 rounded-3xl p-6 sm:p-10 shadow-[0_24px_70px_rgba(0,0,0,0.85)]">
          {/* STEP 1: DATOS DEL NEGOCIO Y SEDE PRINCIPAL */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#F10F1A]/20 border border-[#F10F1A]/40 flex items-center justify-center text-[#FA9B23]">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">Información del Restaurante y Sede Principal</h2>
                    <p className="text-xs text-stone-400">
                      Se creará automáticamente tu <strong className="text-[#FA9B23]">Sede Principal</strong> lista para operar y agregar más sedes cuando quieras.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-2">
                    Nombre del Restaurante *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: La Brasa Dorada"
                    className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-[#FA9B23] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-2">
                    Enlace Web Exclusivo (URL) *
                  </label>
                  <div className="flex items-center rounded-xl bg-black/60 border border-white/15 focus-within:border-[#FA9B23] overflow-hidden">
                    <span className="px-3 py-3.5 bg-white/[0.04] text-stone-400 text-xs font-mono border-r border-white/10 select-none">
                      /r/
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => {
                        setSlugManuallyEdited(true);
                        setFormData({
                          ...formData,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                        });
                      }}
                      placeholder="la-brasa-dorada"
                      className="w-full px-3 py-3.5 bg-transparent text-[#FA9B23] font-mono text-sm focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-[#FA9B23]" />
                    <span>Tu carta pública quedará en:</span>
                    <strong className="text-stone-200">/r/{formData.slug || 'tu-restaurante'}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-2">
                    Eslogan o Especialidad
                  </label>
                  <input
                    type="text"
                    value={formData.eslogan}
                    onChange={(e) => setFormData({ ...formData, eslogan: e.target.value })}
                    placeholder="Ej: Hamburguesas Artesanales & Parrilla"
                    className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-[#FA9B23] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-2">
                    WhatsApp de Pedidos *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={formData.telefonoWhatsapp}
                      onChange={(e) => setFormData({ ...formData, telefonoWhatsapp: e.target.value })}
                      placeholder="Ej: 3001234567"
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-[#FA9B23] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-2">
                    Ciudad (Sede Principal) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    placeholder="Ej: Cali, Bogotá, Medellín..."
                    className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-[#FA9B23] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-2">
                    Dirección de la Sede Principal
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.direccionCentral}
                      onChange={(e) => setFormData({ ...formData, direccionCentral: e.target.value })}
                      placeholder="Ej: Calle 9 # 45-12, Barrio Granada"
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-[#FA9B23] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FA9B23]/10 border border-[#FA9B23]/30 flex items-center gap-3 text-xs text-stone-200">
                <Building2 className="w-5 h-5 text-[#FA9B23] shrink-0" />
                <span>
                  <strong className="text-[#FA9B23]">Sede Principal preconfigurada:</strong> Al finalizar el registro se creará automáticamente la <strong>Sede Principal - {formData.nombre || 'Tu Restaurante'}</strong> con 6 mesas QR y carta base.
                </span>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-extrabold text-sm text-white transition-all hover:scale-[1.02] cursor-pointer"
                  style={{
                    background: 'linear-gradient(180deg, #FF2A2A 0%, #D80812 100%)',
                    boxShadow: '0 10px 28px rgba(241,15,26,0.45)',
                  }}
                >
                  <span>Continuar a Estilo y Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: PLANTILLA VISUAL Y PLAN */}
          {step === 2 && (
            <form onSubmit={handleNextStep} className="space-y-7">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="w-11 h-11 rounded-2xl bg-[#FA9B23]/15 border border-[#FA9B23]/40 flex items-center justify-center text-[#FA9B23]">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Elige tu Plantilla y Plan</h2>
                  <p className="text-xs text-stone-400">
                    Podrás cambiar colores, fotos, sedes y textos en cualquier momento desde tu panel.
                  </p>
                </div>
              </div>

              {/* Selección de Plantilla */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-3">
                  1. Plantilla Visual para tu Carta Digital
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {TEMPLATES.map((tpl) => {
                    const selected = formData.plantilla === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => handleSelectTemplate(tpl)}
                        className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                          selected
                            ? 'bg-white/[0.08] border-[#FA9B23] shadow-lg'
                            : 'bg-black/40 border-white/10 hover:border-white/25'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-5 h-5 rounded-full border border-white/20"
                              style={{ backgroundColor: tpl.primary }}
                            />
                            <span
                              className="w-5 h-5 rounded-full border border-white/20"
                              style={{ backgroundColor: tpl.secondary }}
                            />
                          </div>
                          {selected && (
                            <span className="px-2 py-0.5 rounded-full bg-[#FA9B23]/20 text-[#FA9B23] text-[10px] font-black uppercase">
                              Activa
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-white text-sm mb-1">{tpl.name}</div>
                        <p className="text-xs text-stone-400 leading-relaxed">{tpl.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Primario Personalizado */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-black/50 border border-white/10">
                <div>
                  <div className="text-xs font-bold text-white">Color Principal de tu Marca</div>
                  <div className="text-[11px] text-stone-400">
                    Se aplicará a los botones, íconos y destaques de tu menú digital.
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.colorPrimario}
                    onChange={(e) => setFormData({ ...formData, colorPrimario: e.target.value })}
                    className="w-10 h-10 rounded-xl bg-transparent border border-white/20 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.colorPrimario}
                    onChange={(e) => setFormData({ ...formData, colorPrimario: e.target.value })}
                    className="w-28 px-3 py-2 rounded-xl bg-black border border-white/15 text-xs font-mono text-white"
                  />
                </div>
              </div>

              {/* Selección de Plan */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-3">
                  2. Plan SaaS (14 días gratis sin tarjeta)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {plans.map((p) => {
                    const Icon = PLAN_ICON_MAP[p.codigo] || Rocket;
                    const selected = formData.plan === p.codigo;
                    return (
                      <button
                        key={p.codigo}
                        type="button"
                        onClick={() => setFormData({ ...formData, plan: p.codigo })}
                        className={`text-left p-4 rounded-2xl border transition-all relative cursor-pointer ${
                          selected
                            ? 'bg-gradient-to-b from-[#FA9B23]/20 to-black/60 border-[#FA9B23] shadow-lg'
                            : 'bg-black/40 border-white/10 hover:border-white/25'
                        }`}
                      >
                        {p.badgeTexto && (
                          <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FFE082] to-[#FA9B23] text-black text-[9px] font-black uppercase">
                            {p.badgeTexto}
                          </span>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`w-4 h-4 ${selected ? 'text-[#FA9B23]' : 'text-stone-400'}`} />
                          <span className="font-bold text-white text-sm">Plan {p.nombre}</span>
                        </div>
                        <div className="text-base font-black text-[#FA9B23] mb-1">
                          {formatCopPrice(p.precioMensual)}/mes
                        </div>
                        <p className="text-[11px] text-stone-400">
                          {p.subtitulo} • {(p.caracteristicas || []).slice(0, 2).join(' • ')}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 font-bold text-xs transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver</span>
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-extrabold text-sm text-white transition-all hover:scale-[1.02] cursor-pointer"
                  style={{
                    background: 'linear-gradient(180deg, #FF2A2A 0%, #D80812 100%)',
                    boxShadow: '0 10px 28px rgba(241,15,26,0.45)',
                  }}
                >
                  <span>Último Paso: Credenciales</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: CUENTA DE ADMINISTRADOR */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Credenciales del Administrador</h2>
                  <p className="text-xs text-stone-400">
                    Con este correo y contraseña entrarás a administrar tu restaurante <strong className="text-white">{formData.nombre}</strong>.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-2">
                    Tu Nombre Completo *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.adminNombre}
                      onChange={(e) => setFormData({ ...formData, adminNombre: e.target.value })}
                      placeholder="Ej: Carlos Rodríguez"
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-[#FA9B23] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-2">
                    Correo Electrónico de Acceso *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={formData.adminEmail}
                      onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                      placeholder="admin@turestaurante.com"
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-[#FA9B23] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-2">
                    Contraseña de Administrador *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.adminPassword}
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-10 pr-12 py-3.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-[#FA9B23] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Resumen de lo que se creará automáticamente */}
              <div className="p-4 rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/25 space-y-2">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Tu plataforma se desplegará al instante con:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-stone-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Carta Digital: <strong>/r/{formData.slug}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Panel Admin: <strong>/r/{formData.slug}/admin</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Sede Principal</strong> activa por defecto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>6 Mesas con QR + Cocina KDS en vivo</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 font-bold text-xs transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-extrabold text-sm text-white transition-all hover:scale-[1.02] disabled:opacity-60 cursor-pointer"
                  style={{
                    background: 'linear-gradient(180deg, #FF2A2A 0%, #D80812 100%)',
                    boxShadow: '0 12px 32px rgba(241,15,26,0.5)',
                  }}
                >
                  <Rocket className="w-4 h-4" />
                  <span>{loading ? 'Creando tu Restaurante y Sede Principal...' : 'Lanzar Mi Restaurante Ahora'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* GastroNegocios SaaS Isolated Footer */}
      <footer className="relative z-10 border-t border-white/10 py-5 px-4 text-center text-xs text-stone-400 bg-[#050202]/90">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} GastroNegocios SaaS • Todos los derechos reservados</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-[#FA9B23] transition">Inicio</Link>
            <Link href="/login" className="hover:text-[#FA9B23] transition">Acceso Staff</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function RegistroRestaurantePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070303] flex items-center justify-center text-white text-sm">
          Cargando creador de restaurantes GastroNegocios...
        </div>
      }
    >
      <RegistroFormContent />
    </Suspense>
  );
}
