'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useTenant } from '@/context/TenantContext';
import {
  User,
  ShoppingBag,
  Clock,
  MapPin,
  Sparkles,
  LogOut,
  Phone,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Calendar,
  RotateCcw,
  Receipt,
  Home,
  Edit2,
  Save,
  ShieldCheck,
  Mail,
  Eye,
  EyeOff,
  ChevronRight
} from 'lucide-react';
import { ThermalReceiptModal } from '@/components/pos/ThermalReceiptModal';

export default function TenantCustomerLoginPage() {
  const params = useParams();
  const router = useRouter();
  const slug = ((params?.slug as string) || 'punto-g').toLowerCase().trim();

  const {
    currentCustomer,
    loginCustomer,
    logoutCustomer,
    addToCart,
    setIsCartOpen,
    setCustomerAddress,
  } = useCart();
  const { restaurant } = useTenant();

  const primaryColor = restaurant?.colorPrimario || '#ffc928';
  const restaurantName = restaurant?.nombre || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Active view: 'orders' | 'addresses' | 'favorites' | 'login' | 'register' | 'staff'
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'favorites' | 'login' | 'register' | 'staff'>('login');

  // Staff / Admin Login state
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffShowPassword, setStaffShowPassword] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search);
      if (q.get('tab') === 'staff') {
        setActiveTab('staff');
      }
    }
  }, []);

  // Form states
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regBarrio, setRegBarrio] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Orders & Favorites
  const [orders, setOrders] = useState<any[]>([]);
  const [habitualProducts, setHabitualProducts] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Address editing states
  const [editAddress, setEditAddress] = useState(currentCustomer?.direccion || '');
  const [editBarrio, setEditBarrio] = useState(currentCustomer?.barrio || '');
  const [editCiudad, setEditCiudad] = useState(currentCustomer?.ciudad || 'Cali');
  const [editNotas, setEditNotas] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressSuccess, setAddressSuccess] = useState('');
  const [addressError, setAddressError] = useState('');

  // Thermal receipt modal
  const [receiptOrder, setReceiptOrder] = useState<any | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Sync address form when customer changes
  useEffect(() => {
    if (currentCustomer) {
      setEditAddress(currentCustomer.direccion || '');
      setEditBarrio(currentCustomer.barrio || '');
      setEditCiudad(currentCustomer.ciudad || 'Cali');
    }
  }, [currentCustomer]);

  useEffect(() => {
    if (currentCustomer) {
      setActiveTab('orders');
      fetchCustomerOrders();
    } else {
      setActiveTab('login');
    }
  }, [currentCustomer, slug]);

  const fetchCustomerOrders = async () => {
    if (!currentCustomer) return;
    setLoadingOrders(true);
    try {
      const res = await fetch(
        `/api/customer-auth/orders?customerId=${currentCustomer.id}&telefono=${encodeURIComponent(
          currentCustomer.telefono
        )}&restaurantSlug=${slug}`
      );
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setHabitualProducts(data.habitualProducts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/customer-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginPhone,
          password: loginPassword,
          restaurantSlug: slug,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        loginCustomer(data.customer);
        setActiveTab('orders');
      } else {
        setLoginError(data.error || 'Credenciales inválidas.');
      }
    } catch (err) {
      setLoginError('Error al iniciar sesión.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError('');
    setStaffLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: staffEmail.trim(),
          password: staffPassword,
          restaurantSlug: slug,
        }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        localStorage.setItem('punto_g_admin_logged_in', JSON.stringify(data.user));
        localStorage.setItem('puntog_user', JSON.stringify(data.user));
        localStorage.setItem('punto_g_user', JSON.stringify(data.user));
        if (data.user.restaurant) {
          localStorage.setItem('punto_g_active_restaurant', JSON.stringify(data.user.restaurant));
        }

        const role = (data.user.rol || data.user.role || '').toLowerCase();
        if (role === 'superadmin') {
          router.push('/superadmin');
        } else if (role === 'cocina' || role === 'cocinero') {
          router.push(`/r/${slug}/cocina`);
        } else if (role === 'mesero') {
          router.push(`/r/${slug}/mesero`);
        } else {
          router.push(`/r/${slug}/admin`);
        }
      } else {
        setStaffError(data.error || 'Credenciales de acceso no válidas para este restaurante.');
      }
    } catch (err: any) {
      setStaffError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setStaffLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    setRegLoading(true);

    try {
      const res = await fetch('/api/customer-auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: regName,
          telefono: regPhone,
          email: regEmail,
          direccion: regAddress,
          barrio: regBarrio,
          password: regPassword,
          restaurantSlug: slug,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRegSuccess('¡Cuenta creada con éxito!');
        loginCustomer(data.customer);
        setTimeout(() => setActiveTab('orders'), 800);
      } else {
        setRegError(data.error || 'No se pudo crear la cuenta.');
      }
    } catch (err) {
      setRegError('Error de conexión al registrarse.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) return;

    setAddressLoading(true);
    setAddressError('');
    setAddressSuccess('');

    try {
      const res = await fetch('/api/customer-auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentCustomer.id,
          direccion: editAddress,
          barrio: editBarrio,
          ciudad: editCiudad,
          notas: editNotas,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const updated = {
          ...currentCustomer,
          direccion: editAddress,
          barrio: editBarrio,
          ciudad: editCiudad,
        };
        loginCustomer(updated);
        setCustomerAddress(editAddress);
        setAddressSuccess('¡Dirección de entrega actualizada!');
        setIsEditingAddress(false);
        setTimeout(() => setAddressSuccess(''), 3000);
      } else {
        setAddressError(data.error || 'No se pudo actualizar la dirección.');
      }
    } catch (err) {
      setAddressError('Error al guardar la dirección.');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleRepeatOrder = (order: any) => {
    if (!order.items || order.items.length === 0) return;

    order.items.forEach((item: any) => {
      let parsedAddons = undefined;
      if (item.adicionales) {
        try {
          parsedAddons = typeof item.adicionales === 'string' ? JSON.parse(item.adicionales) : item.adicionales;
        } catch (e) {
          parsedAddons = undefined;
        }
      }

      addToCart(
        {
          id: item.productId || Math.floor(Math.random() * 100000),
          nombre: item.nombre,
          precio: item.precio,
          slug: item.nombre.toLowerCase().replace(/\s+/g, '-'),
          imagen: item.imagen || '/images/default-food.jpg',
          categoria: 'plato',
          descripcion: '',
          disponibilidad: true,
        },
        item.cantidad || 1,
        item.notas || '',
        parsedAddons
      );
    });

    setIsCartOpen(true);
  };

  const handleViewReceipt = (order: any) => {
    setReceiptOrder({
      codigo: order.codigo,
      cliente: order.cliente,
      telefono: order.telefono,
      tipo: order.tipo,
      numeroMesa: order.numeroMesa,
      direccion: order.direccion,
      subtotal: order.subtotal,
      propina: order.propina,
      total: order.total,
      metodoPago: order.metodoPago,
      notasCliente: order.notasCliente,
      createdAt: order.createdAt,
      items: order.items || [],
      invoices: order.invoices || [],
    });
    setIsReceiptOpen(true);
  };

  const formatCOP = (val: number) => '$' + Number(val || 0).toLocaleString('es-CO');

  return (
    <div className="min-h-screen bg-[#070707] text-white pt-24 pb-16 px-4 sm:px-6 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto w-full">
        
        {/* Back Link to Restaurant Menu */}
        <div className="mb-6">
          <Link
            href={`/r/${slug}/menu`}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Carta de {restaurantName}</span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-[#121212] border border-[#252525] rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Card Header */}
          <div className="p-6 sm:p-8 border-b border-[#222] bg-[#161616] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-black shadow-glow shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                <User className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/40">
                    Portal de Clientes
                  </span>
                  <span className="text-xs text-gray-400">• {restaurantName}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {currentCustomer ? `Hola, ${currentCustomer.nombre}` : 'Tu Cuenta de Cliente'}
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  {currentCustomer
                    ? 'Gestiona tus pedidos, consulta tu historial y guarda tus direcciones de entrega.'
                    : `Inicia sesión o crea tu cuenta para pedir en 1 clic en ${restaurantName}.`}
                </p>
              </div>
            </div>

            {/* If logged in: logout action */}
            {currentCustomer && (
              <button
                type="button"
                onClick={() => {
                  logoutCustomer();
                  setActiveTab('login');
                }}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs font-bold border border-red-900/60 transition flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            )}
          </div>

          {/* If Logged In: Navigation Tabs */}
          {currentCustomer ? (
            <div className="flex border-b border-[#222] bg-[#151515] text-xs font-bold overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`flex-1 py-3.5 px-4 flex items-center justify-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'orders'
                    ? 'border-brand-yellow text-brand-yellow bg-black/25'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
                style={activeTab === 'orders' ? { borderColor: primaryColor, color: primaryColor } : {}}
              >
                <Clock className="w-4 h-4" />
                <span>Mis Pedidos ({orders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('addresses')}
                className={`flex-1 py-3.5 px-4 flex items-center justify-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'addresses'
                    ? 'border-brand-yellow text-brand-yellow bg-black/25'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
                style={activeTab === 'addresses' ? { borderColor: primaryColor, color: primaryColor } : {}}
              >
                <MapPin className="w-4 h-4" />
                <span>Direcciones Guardadas</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('favorites')}
                className={`flex-1 py-3.5 px-4 flex items-center justify-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'favorites'
                    ? 'border-brand-yellow text-brand-yellow bg-black/25'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
                style={activeTab === 'favorites' ? { borderColor: primaryColor, color: primaryColor } : {}}
              >
                <Sparkles className="w-4 h-4" />
                <span>Pedidos Habituales</span>
              </button>
            </div>
          ) : (
            <div className="flex border-b border-[#222] bg-[#151515] text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-3.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
                  activeTab === 'login'
                    ? 'border-brand-yellow text-brand-yellow bg-black/25'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
                style={activeTab === 'login' ? { borderColor: primaryColor, color: primaryColor } : {}}
              >
                <Lock className="w-4 h-4" />
                <span>Cliente</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-3.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
                  activeTab === 'register'
                    ? 'border-brand-yellow text-brand-yellow bg-black/25'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
                style={activeTab === 'register' ? { borderColor: primaryColor, color: primaryColor } : {}}
              >
                <User className="w-4 h-4" />
                <span>Registrarme</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('staff')}
                className={`flex-1 py-3.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
                  activeTab === 'staff'
                    ? 'border-brand-yellow text-brand-yellow bg-black/25'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
                style={activeTab === 'staff' ? { borderColor: primaryColor, color: primaryColor } : {}}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Staff / Admin</span>
              </button>
            </div>
          )}

          {/* Card Body */}
          <div className="p-6 sm:p-8">

            {/* TAB: INICIAR SESIÓN */}
            {!currentCustomer && activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto py-2">
                <div className="text-center space-y-1 mb-4">
                  <h3 className="text-lg font-bold text-white">Ingresa a tu cuenta</h3>
                  <p className="text-xs text-gray-400">
                    Accede para ver tu historial de pedidos, direcciones guardadas y pedir rápidamente.
                  </p>
                </div>

                {loginError && (
                  <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Teléfono celular o WhatsApp *:
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="Ej: 315 123 4567"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#303030] focus:border-brand-yellow text-white text-xs rounded-xl pl-9 pr-3 py-3 outline-none transition"
                    />
                    <Phone className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Contraseña *:
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="Tu contraseña secreta"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#303030] focus:border-brand-yellow text-white text-xs rounded-xl pl-9 pr-3 py-3 outline-none transition"
                    />
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider text-black shadow-lg transition active:scale-98 disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  {loginLoading ? 'Ingresando...' : 'Iniciar Sesión'}
                </button>

                <div className="pt-2 text-center text-xs text-gray-400">
                  ¿Aún no tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="font-bold underline cursor-pointer"
                    style={{ color: primaryColor }}
                  >
                    Crear mi cuenta gratis aquí
                  </button>
                </div>
              </form>
            )}

            {/* TAB: STAFF / ADMIN LOGIN */}
            {!currentCustomer && activeTab === 'staff' && (
              <form onSubmit={handleStaffLogin} className="space-y-4 max-w-md mx-auto py-2">
                <div className="text-center space-y-1 mb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Acceso para Empleados y Administradores</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">Iniciar Sesión de Colaborador</h3>
                  <p className="text-xs text-gray-400">
                    Ingresa con tu correo institucional y contraseña para acceder al panel de {restaurantName}.
                  </p>
                </div>

                {staffError && (
                  <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{staffError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Correo electrónico *:
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="admin@gastronegocios.com"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#303030] focus:border-brand-yellow text-white text-xs rounded-xl pl-9 pr-3 py-3 outline-none transition"
                    />
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Contraseña *:
                  </label>
                  <div className="relative">
                    <input
                      type={staffShowPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#303030] focus:border-brand-yellow text-white text-xs rounded-xl pl-9 pr-10 py-3 outline-none transition"
                    />
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setStaffShowPassword(!staffShowPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {staffShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={staffLoading}
                  className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider text-black shadow-lg transition active:scale-98 disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  {staffLoading ? 'Verificando credenciales...' : 'Entrar al Panel de Control'}
                </button>

                <div className="pt-2 text-center text-xs text-gray-500">
                  ¿Eres cliente y quieres pedir comida?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="font-bold underline cursor-pointer text-gray-300 hover:text-white"
                  >
                    Ingresar como Cliente
                  </button>
                </div>
              </form>
            )}

            {/* TAB: CREAR CUENTA */}
            {!currentCustomer && activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3 max-w-md mx-auto py-1">
                <div className="text-center space-y-1 mb-3">
                  <h3 className="text-lg font-bold text-white">Regístrate en {restaurantName}</h3>
                  <p className="text-xs text-gray-400">
                    Crea tu cuenta de cliente para guardar tu dirección y hacer pedidos fácilmente.
                  </p>
                </div>

                {regError && (
                  <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                {regSuccess && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{regSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Tu Nombre Completo *:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: David Sarria"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#303030] focus:border-brand-yellow text-white text-xs rounded-xl px-3 py-2.5 outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Teléfono / WhatsApp *:
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej: 315 123 4567"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#303030] focus:border-brand-yellow text-white text-xs rounded-xl px-3 py-2.5 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Contraseña *:
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#303030] focus:border-brand-yellow text-white text-xs rounded-xl px-3 py-2.5 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Correo electrónico (opcional):
                  </label>
                  <input
                    type="email"
                    placeholder="cliente@ejemplo.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#303030] focus:border-brand-yellow text-white text-xs rounded-xl px-3 py-2.5 outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Dirección de entrega habitual:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Calle 5 # 66-24 Apto 302"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#303030] focus:border-brand-yellow text-white text-xs rounded-xl px-3 py-2.5 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Barrio:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Granada"
                      value={regBarrio}
                      onChange={(e) => setRegBarrio(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#303030] focus:border-brand-yellow text-white text-xs rounded-xl px-3 py-2.5 outline-none transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3.5 mt-2 rounded-xl font-black text-xs uppercase tracking-wider text-black shadow-lg transition active:scale-98 disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  {regLoading ? 'Creando cuenta...' : 'Crear Mi Cuenta'}
                </button>

                <div className="pt-2 text-center text-xs text-gray-400">
                  ¿Ya tienes cuenta registrada?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="font-bold underline cursor-pointer"
                    style={{ color: primaryColor }}
                  >
                    Iniciar sesión aquí
                  </button>
                </div>
              </form>
            )}

            {/* TAB: HISTORIAL DE PEDIDOS */}
            {currentCustomer && activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#252525]">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4" style={{ color: primaryColor }} />
                      <span>Tus Pedidos en {restaurantName}</span>
                    </h3>
                    <p className="text-xs text-gray-400">Historial de órdenes realizadas y facturas emitidas.</p>
                  </div>

                  <Link
                    href={`/r/${slug}/menu`}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-black flex items-center gap-1.5 shadow"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Pedir a Domicilio</span>
                  </Link>
                </div>

                {loadingOrders ? (
                  <div className="py-12 text-center text-gray-400 text-xs">
                    <div className="w-8 h-8 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Cargando tu historial de pedidos...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 space-y-3">
                    <ShoppingBag className="w-12 h-12 mx-auto text-gray-600" />
                    <div>
                      <p className="font-bold text-white text-sm">Aún no has realizado pedidos</p>
                      <p className="text-xs text-gray-500 mt-0.5">Explora el menú y haz tu primer pedido en línea.</p>
                    </div>
                    <Link
                      href={`/r/${slug}/menu`}
                      className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold text-black uppercase"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Ver la Carta
                    </Link>
                  </div>
                ) : (
                  orders.map((ord) => {
                    const statusColors: any = {
                      Pendiente: 'bg-amber-950/60 text-amber-300 border-amber-800/80',
                      'En Preparación': 'bg-blue-950/60 text-blue-300 border-blue-800/80',
                      Listo: 'bg-purple-950/60 text-purple-300 border-purple-800/80',
                      Despachado: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/80',
                      Entregado: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80',
                      Cancelado: 'bg-red-950/60 text-red-300 border-red-800/80',
                    };

                    return (
                      <div
                        key={ord.id}
                        className="bg-[#181818] border border-[#272727] rounded-2xl p-4 space-y-3 hover:border-[#383838] transition"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-black text-white">#{ord.codigo}</span>
                            <span
                              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                                statusColors[ord.estado] || 'bg-gray-800 text-gray-300 border-gray-700'
                              }`}
                            >
                              {ord.estado}
                            </span>
                          </div>

                          <span className="text-sm font-black" style={{ color: primaryColor }}>
                            {formatCOP(ord.total)}
                          </span>
                        </div>

                        <div className="text-xs text-gray-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-500" />
                            {new Date(ord.createdAt).toLocaleDateString('es-CO', {
                              day: 'numeric',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>•</span>
                          <span>{ord.tipo === 'domicilio' ? '🛵 Domicilio' : ord.tipo === 'mesa' ? `🍽️ Mesa ${ord.numeroMesa || ''}` : '🏪 Para Llevar'}</span>
                          <span>•</span>
                          <span>{ord.metodoPago}</span>
                        </div>

                        {/* Items */}
                        <div className="bg-[#131313] rounded-xl p-3 text-xs space-y-1.5 border border-[#222]">
                          {(ord.items || []).map((it: any, iIdx: number) => (
                            <div key={iIdx} className="flex justify-between text-gray-300">
                              <span>
                                {it.cantidad}x {it.nombre}
                              </span>
                              <span className="text-gray-400 font-mono">{formatCOP(it.precio * it.cantidad)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleRepeatOrder(ord)}
                            className="flex-1 py-2.5 px-3 rounded-xl text-xs font-black text-black flex items-center justify-center gap-1.5 shadow transition active:scale-95 cursor-pointer"
                            style={{ backgroundColor: primaryColor }}
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Pedir de nuevo</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleViewReceipt(ord)}
                            className="py-2.5 px-4 rounded-xl text-xs font-bold text-gray-300 bg-[#222] hover:bg-[#2c2c2c] border border-[#333] flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                          >
                            <Receipt className="w-4 h-4" />
                            <span>Factura</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB: DIRECCIONES GUARDADAS */}
            {currentCustomer && activeTab === 'addresses' && (
              <div className="space-y-4 max-w-xl mx-auto py-2">
                <div className="flex items-center justify-between pb-3 border-b border-[#252525]">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4" style={{ color: primaryColor }} />
                      <span>Tus Direcciones de Entrega</span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      Esta dirección se seleccionará automáticamente cada vez que pidas en {restaurantName}.
                    </p>
                  </div>
                  {!isEditingAddress && (
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#222] hover:bg-[#2e2e2e] text-xs font-bold text-white border border-[#333] transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                      <span>Editar</span>
                    </button>
                  )}
                </div>

                {addressSuccess && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{addressSuccess}</span>
                  </div>
                )}

                {addressError && (
                  <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{addressError}</span>
                  </div>
                )}

                {!isEditingAddress ? (
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-[#181818] border border-[#2b2b2b] space-y-4">
                      <div className="flex items-start gap-3.5">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center font-bold shrink-0 text-black"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Home className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider text-white">
                              Dirección Principal
                            </span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Guardada
                            </span>
                          </div>
                          <p className="text-base font-black text-white mt-1">
                            {currentCustomer.direccion || 'Sin dirección guardada aún'}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-1">
                            {currentCustomer.barrio && (
                              <span className="font-semibold text-gray-300">
                                📍 Barrio: {currentCustomer.barrio}
                              </span>
                            )}
                            <span>• Ciudad: {currentCustomer.ciudad || 'Cali'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#252525] flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-500" />
                          <span>Teléfono de contacto: <strong className="text-white">{currentCustomer.telefono}</strong></span>
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link
                        href={`/r/${slug}/menu`}
                        className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition active:scale-98 text-black"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Hacer Pedido a Domicilio con esta Dirección</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveAddress} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Dirección Completa (Calle, Carrera, Número) *:
                      </label>
                      <input
                        type="text"
                        required
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="Ej: Calle 5 # 66-24 Apto 302"
                        className="w-full bg-[#1c1c1c] border border-[#303030] focus:border-brand-yellow text-white text-xs rounded-xl px-3 py-3 outline-none transition"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">
                          Barrio o Sector:
                        </label>
                        <input
                          type="text"
                          value={editBarrio}
                          onChange={(e) => setEditBarrio(e.target.value)}
                          placeholder="Ej: Granada / El Peñón"
                          className="w-full bg-[#1c1c1c] border border-[#303030] focus:border-brand-yellow text-white text-xs rounded-xl px-3 py-3 outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">
                          Ciudad:
                        </label>
                        <input
                          type="text"
                          value={editCiudad}
                          onChange={(e) => setEditCiudad(e.target.value)}
                          placeholder="Ej: Cali"
                          className="w-full bg-[#1c1c1c] border border-[#303030] focus:border-brand-yellow text-white text-xs rounded-xl px-3 py-3 outline-none transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Instrucciones de Entrega (opcional):
                      </label>
                      <textarea
                        rows={2}
                        value={editNotas}
                        onChange={(e) => setEditNotas(e.target.value)}
                        placeholder="Ej: Dejar en portería, edificio blanco reja negra..."
                        className="w-full bg-[#1c1c1c] border border-[#303030] focus:border-brand-yellow text-white text-xs rounded-xl px-3 py-2 outline-none transition resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(false)}
                        className="flex-1 py-3 bg-[#202020] hover:bg-[#282828] text-gray-300 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={addressLoading}
                        className="flex-1 py-3 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 shadow-md active:scale-98 cursor-pointer text-black"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Save className="w-4 h-4" />
                        <span>{addressLoading ? 'Guardando...' : 'Guardar Dirección'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB: PEDIDOS HABITUALES */}
            {currentCustomer && activeTab === 'favorites' && (
              <div className="space-y-3">
                <div className="text-xs text-gray-400 bg-[#171717] p-3 rounded-xl border border-[#252525]">
                  ⭐ <strong>Tus platos favoritos:</strong> Platos que más has ordenado en {restaurantName}. Agrégalos en 1 clic.
                </div>

                {habitualProducts.length === 0 ? (
                  <div className="py-8 text-center text-gray-500 text-xs">
                    Realiza pedidos para que aparezcan tus platos habituales aquí.
                  </div>
                ) : (
                  habitualProducts.map((prod, idx) => (
                    <div
                      key={idx}
                      className="bg-[#181818] border border-[#272727] rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-[#383838] transition"
                    >
                      <div>
                        <h5 className="text-sm font-bold text-white">{prod.nombre}</h5>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Pedido <strong style={{ color: primaryColor }}>{prod.pedidosCount} veces</strong> ({prod.cantidadTotal} unidades)
                        </p>
                        <p className="text-xs font-black mt-1" style={{ color: primaryColor }}>
                          {formatCOP(prod.precio)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          addToCart(
                            {
                              id: Math.floor(Math.random() * 100000),
                              nombre: prod.nombre,
                              precio: prod.precio,
                              slug: prod.nombre.toLowerCase().replace(/\s+/g, '-'),
                              imagen: '/images/default-food.jpg',
                              categoria: 'plato',
                              descripcion: '',
                              disponibilidad: true,
                            },
                            1
                          );
                          setIsCartOpen(true);
                        }}
                        className="py-2 px-3.5 rounded-xl text-xs font-black text-black flex items-center gap-1.5 shadow transition active:scale-95 cursor-pointer whitespace-nowrap"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Agregar</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>

          {/* Footer note */}
          <div className="p-4 border-t border-[#202020] bg-[#141414] text-center text-xs text-gray-500">
            {restaurantName} • Sistema Gastronómico y Punto de Venta
          </div>
        </div>

        {/* Dedicated Admin Portal Separation */}
        <div className="mt-8 text-center border-t border-[#1c1c1c] pt-6">
          <p className="text-xs text-gray-500">
            ¿Eres administrador o colaborador de este restaurante?{' '}
            <button
              type="button"
              onClick={() => setActiveTab('staff')}
              className="text-gray-400 hover:text-brand-yellow font-bold underline transition cursor-pointer"
            >
              Ingresa al Panel Administrativo aquí
            </button>
          </p>
        </div>

      </div>

      {/* Modal Factura Térmica */}
      {receiptOrder && (
        <ThermalReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          order={receiptOrder}
        />
      )}
    </div>
  );
}
