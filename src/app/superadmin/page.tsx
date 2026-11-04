'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  Check,
  X,
  DollarSign,
  ShoppingBag,
  Users,
  ShieldCheck,
  Sparkles,
  Phone,
  MapPin,
  RefreshCw,
  Palette,
  Power,
  Layers,
  ArrowRight
} from 'lucide-react';
import { swalCustom, showSuccess, showError, showConfirm } from '@/lib/swal';

interface RestaurantItem {
  id: number;
  nombre: string;
  slug: string;
  subdominio?: string;
  eslogan?: string;
  descripcion?: string;
  logo?: string;
  bannerHero?: string;
  colorPrimario: string;
  colorSecundario: string;
  colorFondo: string;
  telefonoWhatsapp?: string;
  direccionCentral?: string;
  ciudad: string;
  plan: string;
  activo: boolean;
  createdAt: string;
  branches: Array<{ id: number; nombre: string; slug: string; activo: boolean }>;
  _count: {
    branches: number;
    products: number;
    categories: number;
    orders: number;
    tables: number;
    users: number;
  };
}

export default function SuperadminPage() {
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>([]);
  const [metrics, setMetrics] = useState({
    totalRestaurantes: 0,
    activos: 0,
    totalVentasPlataforma: 0,
    totalPedidosPlataforma: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantItem | null>(null);

  // Formulario de creación
  const [formData, setFormData] = useState({
    nombre: '',
    slug: '',
    subdominio: '',
    eslogan: '',
    descripcion: '',
    logo: '',
    bannerHero: '',
    colorPrimario: '#ffc928',
    colorSecundario: '#E94B24',
    colorFondo: '#080808',
    telefonoWhatsapp: '',
    direccionCentral: '',
    ciudad: 'Cali',
    plan: 'Pro',
    adminNombre: '',
    adminEmail: '',
    adminPassword: '',
  });

  const formatCOP = (num: number) => '$' + (num || 0).toLocaleString('es-CO');

  const loadRestaurants = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/restaurants');
      if (res.ok) {
        const data = await res.json();
        setRestaurants(data.restaurants || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  // Crear nuevo restaurante cliente SaaS
  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;

    try {
      const res = await fetch('/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await swalCustom.fire({
          title: '🏢 ¡RESTAURANTE CREADO CON ÉXITO!',
          html: `
            El negocio <strong class="text-brand-yellow">${formData.nombre}</strong> fue registrado.<br>
            Su Landing Page ya está disponible en:<br>
            <code class="text-xs text-brand-yellow bg-black/60 px-2 py-1 rounded block mt-2">/r/${formData.slug || formData.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-')}</code>
          `,
          icon: 'success',
          confirmButtonText: 'Genial',
        });
        setIsCreateModalOpen(false);
        setFormData({
          nombre: '',
          slug: '',
          subdominio: '',
          eslogan: '',
          descripcion: '',
          logo: '',
          bannerHero: '',
          colorPrimario: '#ffc928',
          colorSecundario: '#E94B24',
          colorFondo: '#080808',
          telefonoWhatsapp: '',
          direccionCentral: '',
          ciudad: 'Cali',
          plan: 'Pro',
          adminNombre: '',
          adminEmail: '',
          adminPassword: '',
        });
        loadRestaurants();
      } else {
        const err = await res.json();
        showError('Error al crear', err.error || 'No se pudo registrar');
      }
    } catch (e) {
      showError('Error de conexión', 'Fallo al comunicarse con el servidor');
    }
  };

  // Abrir modal de edición
  const handleOpenEdit = (rest: RestaurantItem) => {
    setSelectedRestaurant(rest);
    setFormData({
      nombre: rest.nombre,
      slug: rest.slug,
      subdominio: rest.subdominio || '',
      eslogan: rest.eslogan || '',
      descripcion: rest.descripcion || '',
      logo: rest.logo || '',
      bannerHero: rest.bannerHero || '',
      colorPrimario: rest.colorPrimario || '#ffc928',
      colorSecundario: rest.colorSecundario || '#E94B24',
      colorFondo: rest.colorFondo || '#080808',
      telefonoWhatsapp: rest.telefonoWhatsapp || '',
      direccionCentral: rest.direccionCentral || '',
      ciudad: rest.ciudad || 'Cali',
      plan: rest.plan || 'Pro',
      adminNombre: '',
      adminEmail: '',
      adminPassword: '',
    });
    setIsEditModalOpen(true);
  };

  // Guardar edición
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant) return;

    try {
      const res = await fetch(`/api/restaurants/${selectedRestaurant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showSuccess('Restaurante Actualizado', 'Los cambios en la landing y marca fueron guardados.');
        setIsEditModalOpen(false);
        setSelectedRestaurant(null);
        loadRestaurants();
      } else {
        const err = await res.json();
        showError('Error al guardar', err.error || 'No se pudo actualizar');
      }
    } catch (e) {
      showError('Error de conexión', 'No se pudo conectar con el servidor');
    }
  };

  // Alternar estado activo / suspendido
  const handleToggleActive = async (rest: RestaurantItem) => {
    const newState = !rest.activo;
    try {
      const res = await fetch(`/api/restaurants/${rest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: newState }),
      });
      if (res.ok) {
        showSuccess(
          newState ? 'Restaurante Activado' : 'Restaurante Suspendido',
          `El negocio ${rest.nombre} ahora está ${newState ? 'en línea' : 'suspendido'}.`
        );
        loadRestaurants();
      }
    } catch (e) {
      showError('Error', 'No se pudo cambiar el estado');
    }
  };

  // Filtrar restaurantes
  const filtered = restaurants.filter(
    (r) =>
      r.nombre.toLowerCase().includes(search.toLowerCase()) ||
      r.slug.toLowerCase().includes(search.toLowerCase()) ||
      r.ciudad.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans pb-16">
      {/* Header Superior */}
      <header className="sticky top-0 z-30 bg-[#121212]/95 backdrop-blur-md border-b border-[#222] px-6 py-4 flex items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-brand-yellow flex items-center justify-center font-black text-black shadow-glow">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase text-white font-display tracking-wider flex items-center gap-2">
              <span>PANEL SUPERADMIN</span>
              <span className="text-[10px] bg-brand-yellow text-black font-black px-2 py-0.5 rounded-md">
                SAAS MULTI-RESTAURANTE
              </span>
            </h1>
            <p className="text-[11px] text-gray-400">
              Control centralizado de clientes, landing pages, planes y sedes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadRestaurants}
            className="p-2.5 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] text-gray-300 hover:text-white transition"
            title="Recargar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-yellow' : ''}`} />
          </button>

          <Link
            href="/admin"
            className="px-3.5 py-2 bg-[#1e1e1e] hover:bg-[#282828] text-gray-300 hover:text-white rounded-xl text-xs font-bold border border-[#333] transition"
          >
            ← Ir al Admin Restaurante
          </Link>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-yellow hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-glow transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Crear Restaurante</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ======================================================== */}
        {/* TARJETAS DE MÉTRICAS GLOBALES DEL SAAS */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#121212] border border-[#222] rounded-3xl p-5 space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold uppercase">Restaurantes Clientes</span>
              <Building2 className="w-5 h-5 text-brand-yellow" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-display">
                {metrics.totalRestaurantes}
              </span>
              <span className="text-xs text-emerald-400 font-bold">
                ({metrics.activos} en línea)
              </span>
            </div>
            <p className="text-[10px] text-gray-500">Negocios con landing propia activa</p>
          </div>

          <div className="bg-[#121212] border border-[#222] rounded-3xl p-5 space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold uppercase">Ventas Plataforma</span>
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-3xl font-black text-brand-yellow font-display block">
              {formatCOP(metrics.totalVentasPlataforma)}
            </span>
            <p className="text-[10px] text-gray-500">Monto transaccionado acumulado</p>
          </div>

          <div className="bg-[#121212] border border-[#222] rounded-3xl p-5 space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold uppercase">Pedidos Procesados</span>
              <ShoppingBag className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-3xl font-black text-white font-display block">
              {metrics.totalPedidosPlataforma}
            </span>
            <p className="text-[10px] text-gray-500">Comandas y domicilios en el sistema</p>
          </div>

          <div className="bg-[#121212] border border-[#222] rounded-3xl p-5 space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold uppercase">Total Sedes Registradas</span>
              <MapPin className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-3xl font-black text-white font-display block">
              {restaurants.reduce((acc, r) => acc + (r._count?.branches || 0), 0)}
            </span>
            <p className="text-[10px] text-gray-500">Puntos de venta físicos / cocinas</p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* LISTADO DE RESTAURANTES (TENANTS) */}
        {/* ======================================================== */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black uppercase text-white font-display flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand-yellow" />
                <span>Restaurantes Registrados ({filtered.length})</span>
              </h2>
              <p className="text-xs text-gray-400">
                Cada restaurante cuenta con su propia Landing Page, sedes, menú y comandas aisladas.
              </p>
            </div>

            {/* Buscador */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Buscar por nombre o slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#141414] border border-[#2b2b2b] focus:border-brand-yellow rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white outline-none"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Cuadrícula de Restaurantes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((rest) => (
              <div
                key={rest.id}
                className={`bg-[#121212] border-2 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xl transition-all ${
                  rest.activo ? 'border-[#222] hover:border-brand-yellow/50' : 'border-red-950/60 opacity-60'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Encabezado */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-black text-lg shadow-md shrink-0"
                        style={{ backgroundColor: rest.colorPrimario || '#ffc928' }}
                      >
                        {rest.logo ? (
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden">
                            <Image src={rest.logo} alt={rest.nombre} fill className="object-contain" />
                          </div>
                        ) : (
                          rest.nombre.charAt(0)
                        )}
                      </div>

                      <div>
                        <h3 className="text-base font-black text-white font-display">{rest.nombre}</h3>
                        <span className="text-[11px] text-gray-400 block line-clamp-1">{rest.eslogan}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        rest.activo
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}
                    >
                      {rest.activo ? 'En Línea' : 'Suspendido'}
                    </span>
                  </div>

                  {/* Enlace a su Landing Page Exclusiva */}
                  <div className="bg-[#181818] border border-[#262626] rounded-2xl p-3 space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">
                      Landing Page Exclusiva:
                    </span>
                    <Link
                      href={`/r/${rest.slug}`}
                      target="_blank"
                      className="text-xs font-black text-brand-yellow hover:underline flex items-center gap-1.5 group"
                    >
                      <span>/r/{rest.slug}</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <p className="text-[10px] text-gray-500">{rest.direccionCentral} • {rest.ciudad}</p>
                  </div>

                  {/* Estadísticas de este restaurante */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-[#161616] p-2 rounded-xl border border-[#222]">
                      <span className="text-gray-400 text-[10px] block font-bold">Sedes</span>
                      <span className="font-black text-white">{rest._count?.branches || 0}</span>
                    </div>
                    <div className="bg-[#161616] p-2 rounded-xl border border-[#222]">
                      <span className="text-gray-400 text-[10px] block font-bold">Platos</span>
                      <span className="font-black text-white">{rest._count?.products || 0}</span>
                    </div>
                    <div className="bg-[#161616] p-2 rounded-xl border border-[#222]">
                      <span className="text-gray-400 text-[10px] block font-bold">Pedidos</span>
                      <span className="font-black text-brand-yellow">{rest._count?.orders || 0}</span>
                    </div>
                  </div>

                  {/* Paleta de Color */}
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-gray-400 font-bold">
                    <span>Color Primario:</span>
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 inline-block shadow"
                      style={{ backgroundColor: rest.colorPrimario }}
                    />
                    <span className="font-mono text-[10px]">{rest.colorPrimario}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="pt-2 border-t border-[#1e1e1e] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(rest)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
                      rest.activo
                        ? 'bg-[#1c1c1c] hover:bg-red-950/40 text-gray-400 hover:text-red-400 border border-[#2e2e2e]'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{rest.activo ? 'Suspender' : 'Activar'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/r/${rest.slug}`}
                      target="_blank"
                      className="p-2 bg-[#1c1c1c] hover:bg-[#282828] text-brand-yellow rounded-xl border border-brand-yellow/30 transition"
                      title="Ver Landing Page del Negocio"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(rest)}
                      className="p-2 bg-[#1c1c1c] hover:bg-[#282828] text-gray-300 hover:text-white rounded-xl border border-[#333] transition cursor-pointer"
                      title="Editar Branding y Colores"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ======================================================== */}
      {/* MODAL: CREAR NUEVO RESTAURANTE (TENANT) */}
      {/* ======================================================== */}
      {isCreateModalOpen && (
        <div
          onClick={() => setIsCreateModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#141414] border-2 border-brand-yellow/60 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#252525]">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand-yellow" />
                <h3 className="text-base font-black uppercase text-white font-display">
                  DAR DE ALTA NUEVO RESTAURANTE (SAAS)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-full bg-[#202020] text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRestaurant} className="space-y-4 text-xs">
              {/* Información General */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">
                    Nombre del Restaurante *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Burger Master Cali"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">
                    Slug / URL Landing *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="burgermaster (quedará /r/burgermaster)"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3.5 py-2.5 text-brand-yellow font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">
                  Eslogan / Slogan
                </label>
                <input
                  type="text"
                  placeholder="Ej: Las mejores hamburguesas al carbón"
                  value={formData.eslogan}
                  onChange={(e) => setFormData({ ...formData, eslogan: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              {/* Colores y Branding */}
              <div className="bg-[#181818] border border-[#282828] rounded-2xl p-3.5 space-y-3">
                <h4 className="font-bold text-white uppercase text-xs flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-brand-yellow" />
                  <span>Personalización Visual de la Landing</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold uppercase text-[10px] mb-1">
                      Color Primario (Botones)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.colorPrimario}
                        onChange={(e) => setFormData({ ...formData, colorPrimario: e.target.value })}
                        className="w-9 h-9 rounded-xl bg-transparent border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.colorPrimario}
                        onChange={(e) => setFormData({ ...formData, colorPrimario: e.target.value })}
                        className="w-full bg-[#121212] border border-[#333] rounded-lg px-2 py-1 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold uppercase text-[10px] mb-1">
                      URL del Logo
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.logo}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      className="w-full bg-[#121212] border border-[#333] rounded-lg px-2.5 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold uppercase text-[10px] mb-1">
                      Banner Hero (Foto Fondo)
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.bannerHero}
                      onChange={(e) => setFormData({ ...formData, bannerHero: e.target.value })}
                      className="w-full bg-[#121212] border border-[#333] rounded-lg px-2.5 py-2 text-white"
                    />
                  </div>
                </div>

                {/* Presets Rápidos de Colores */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-gray-400 font-bold">Presets:</span>
                  {[
                    { name: 'Amarillo Dorado', col: '#ffc928' },
                    { name: 'Rojo Fuego', col: '#E53E3E' },
                    { name: 'Verde Gourmet', col: '#38A169' },
                    { name: 'Naranja Asador', col: '#DD6B20' },
                    { name: 'Púrpura Bistro', col: '#805AD5' },
                  ].map((preset) => (
                    <button
                      key={preset.col}
                      type="button"
                      onClick={() => setFormData({ ...formData, colorPrimario: preset.col })}
                      className="w-5 h-5 rounded-full border border-white/30 shadow transition hover:scale-110"
                      style={{ backgroundColor: preset.col }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              {/* Contacto y Ubicación */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">
                    WhatsApp para Pedidos
                  </label>
                  <input
                    type="tel"
                    placeholder="3229088736"
                    value={formData.telefonoWhatsapp}
                    onChange={(e) => setFormData({ ...formData, telefonoWhatsapp: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">
                    Dirección Principal
                  </label>
                  <input
                    type="text"
                    placeholder="Calle 9 # 45-12"
                    value={formData.direccionCentral}
                    onChange={(e) => setFormData({ ...formData, direccionCentral: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Plan SaaS</label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="Basico">Plan Básico</option>
                    <option value="Pro">Plan Pro (Recomendado)</option>
                    <option value="Enterprise">Plan Enterprise</option>
                  </select>
                </div>
              </div>

              {/* Administrador Inicial del Negocio */}
              <div className="bg-[#181818] border border-[#282828] rounded-2xl p-3.5 space-y-3">
                <h4 className="font-bold text-white uppercase text-xs flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Usuario Administrador del Restaurante (Opcional)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold uppercase text-[10px] mb-1">
                      Nombre Dueño / Admin
                    </label>
                    <input
                      type="text"
                      placeholder="Carlos Pérez"
                      value={formData.adminNombre}
                      onChange={(e) => setFormData({ ...formData, adminNombre: e.target.value })}
                      className="w-full bg-[#121212] border border-[#333] rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold uppercase text-[10px] mb-1">
                      Email de Acceso
                    </label>
                    <input
                      type="email"
                      placeholder="carlos@burgermaster.com"
                      value={formData.adminEmail}
                      onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                      className="w-full bg-[#121212] border border-[#333] rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold uppercase text-[10px] mb-1">
                      Contraseña Inicial
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={formData.adminPassword}
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      className="w-full bg-[#121212] border border-[#333] rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-3 bg-[#202020] text-gray-400 font-bold rounded-2xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand-yellow text-black font-black uppercase tracking-wider rounded-2xl shadow-glow cursor-pointer"
                >
                  Crear y Activar Landing Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDITAR BRANDING / COLORES DE UN RESTAURANTE */}
      {/* ======================================================== */}
      {isEditModalOpen && selectedRestaurant && (
        <div
          onClick={() => setIsEditModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#141414] border-2 border-brand-yellow/60 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#252525]">
              <h3 className="text-base font-black uppercase text-white font-display">
                EDITAR BRANDING: {selectedRestaurant.nombre}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-full bg-[#202020] text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Eslogan</label>
                <input
                  type="text"
                  value={formData.eslogan}
                  onChange={(e) => setFormData({ ...formData, eslogan: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Color Primario</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.colorPrimario}
                      onChange={(e) => setFormData({ ...formData, colorPrimario: e.target.value })}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.colorPrimario}
                      onChange={(e) => setFormData({ ...formData, colorPrimario: e.target.value })}
                      className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-2 py-1.5 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Plan</label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="Basico">Plan Básico</option>
                    <option value="Pro">Plan Pro</option>
                    <option value="Enterprise">Plan Enterprise</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">URL Banner Hero</label>
                <input
                  type="url"
                  value={formData.bannerHero}
                  onChange={(e) => setFormData({ ...formData, bannerHero: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#202020] text-gray-400 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-yellow text-black font-black uppercase rounded-xl shadow-glow cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
