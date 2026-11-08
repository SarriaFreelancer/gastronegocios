'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '@/context/CartContext';
import { useTenant } from '@/context/TenantContext';
import {
  User,
  ShoppingBag,
  Receipt,
  RotateCcw,
  LogOut,
  X,
  Phone,
  Lock,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Calendar,
  DollarSign,
  Home,
  Edit2,
  Save,
  Check
} from 'lucide-react';
import { ThermalReceiptModal } from '@/components/pos/ThermalReceiptModal';

interface CustomerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerPortalModal: React.FC<CustomerPortalModalProps> = ({ isOpen, onClose }) => {
  const {
    currentCustomer,
    loginCustomer,
    logoutCustomer,
    addToCart,
    setIsCartOpen,
    setCustomerAddress,
    setCustomerPhone,
    setCustomerName,
  } = useCart();
  const { restaurant } = useTenant();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const primaryColor = restaurant?.colorPrimario || '#EAA622';
  const restaurantSlug = restaurant?.slug || 'punto-g';
  const restaurantName = restaurant?.nombre || 'Restaurante';

  // Vista activa: 'login', 'register', 'orders', 'favorites', 'addresses'
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'orders' | 'favorites' | 'addresses'>('login');

  // Estados de formularios
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

  // Estados de historial y favoritos
  const [orders, setOrders] = useState<any[]>([]);
  const [habitualProducts, setHabitualProducts] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Estados para Direcciones Guardadas & Perfil
  const [editAddress, setEditAddress] = useState(currentCustomer?.direccion || '');
  const [editBarrio, setEditBarrio] = useState(currentCustomer?.barrio || '');
  const [editCiudad, setEditCiudad] = useState(currentCustomer?.ciudad || 'Cali');
  const [editNotas, setEditNotas] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressSuccess, setAddressSuccess] = useState('');
  const [addressError, setAddressError] = useState('');

  // Modal de ticket/factura térmica
  const [receiptOrder, setReceiptOrder] = useState<any | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Sincronizar datos de cliente cuando cambia
  useEffect(() => {
    if (currentCustomer) {
      setEditAddress(currentCustomer.direccion || '');
      setEditBarrio(currentCustomer.barrio || '');
      setEditCiudad(currentCustomer.ciudad || 'Cali');
    }
  }, [currentCustomer]);

  // Formato de moneda
  const formatCOP = (val: number) => '$' + Number(val || 0).toLocaleString('es-CO');

  // Si hay cliente activo, abrir en 'orders'
  useEffect(() => {
    if (currentCustomer) {
      if (activeTab === 'login' || activeTab === 'register') {
        setActiveTab('orders');
      }
      fetchCustomerOrders();
    } else {
      setActiveTab('login');
    }
  }, [currentCustomer, isOpen]);

  // Consultar pedidos del cliente
  const fetchCustomerOrders = async () => {
    if (!currentCustomer) return;
    setLoadingOrders(true);
    try {
      const res = await fetch(
        `/api/customer-auth/orders?customerId=${currentCustomer.id}&telefono=${encodeURIComponent(
          currentCustomer.telefono
        )}&restaurantSlug=${restaurantSlug}`
      );
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setHabitualProducts(data.habitualProducts || []);
      }
    } catch (err) {
      console.error('Error cargando pedidos de cliente:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Manejo de inicio de sesión
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
          restaurantSlug,
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
      setLoginError('Error de conexión al iniciar sesión.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Manejo de registro
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
          restaurantSlug,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRegSuccess('¡Cuenta creada exitosamente!');
        loginCustomer(data.customer);
        setTimeout(() => {
          setActiveTab('orders');
        }, 800);
      } else {
        setRegError(data.error || 'No se pudo crear la cuenta.');
      }
    } catch (err) {
      setRegError('Error de conexión al registrarse.');
    } finally {
      setRegLoading(false);
    }
  };

  // Guardar dirección actualizada
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
        setAddressSuccess('¡Dirección actualizada correctamente!');
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

  // Repetir pedido (Cargar todos los items al carrito y abrirlo)
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

    onClose();
    setIsCartOpen(true);
  };

  // Ver factura / recibo
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

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[99999] overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
        <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl text-white overflow-hidden my-auto">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#222] flex items-center justify-between bg-[#181818] shrink-0">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-black shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold uppercase font-display tracking-wider text-white">
                  {currentCustomer ? `Hola, ${currentCustomer.nombre}` : 'Portal de Clientes'}
                </h3>
                <p className="text-xs text-gray-400">
                  {currentCustomer
                    ? `${restaurantName} • Tu cuenta, pedidos y direcciones`
                    : `Inicia sesión o regístrate en ${restaurantName}`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#252525] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Bar if Logged In */}
          {currentCustomer && (
            <div className="flex border-b border-[#222] bg-[#151515] text-xs font-bold overflow-x-auto shrink-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`flex-1 py-3 px-3.5 flex items-center justify-center gap-1.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
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
                className={`flex-1 py-3 px-3.5 flex items-center justify-center gap-1.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
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
                className={`flex-1 py-3 px-3.5 flex items-center justify-center gap-1.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'favorites'
                    ? 'border-brand-yellow text-brand-yellow bg-black/25'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
                style={activeTab === 'favorites' ? { borderColor: primaryColor, color: primaryColor } : {}}
              >
                <Sparkles className="w-4 h-4" />
                <span>Habituales</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  logoutCustomer();
                  setActiveTab('login');
                }}
                className="py-3 px-4 flex items-center justify-center gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/20 transition whitespace-nowrap border-b-2 border-transparent cursor-pointer"
                title="Cerrar sesión de cliente"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            
            {/* ======================================================== */}
            {/* VISTA 1: INICIAR SESIÓN                                 */}
            {/* ======================================================== */}
            {!currentCustomer && activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto py-2">
                <div className="text-center space-y-1 mb-4">
                  <h4 className="text-lg font-bold text-white">Ingresa a tu cuenta de cliente</h4>
                  <p className="text-xs text-gray-400">
                    Revisa tus pedidos anteriores, tus direcciones de domicilio y pide en 1 clic.
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
                  className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider text-black shadow-lg transition active:scale-98 disabled:opacity-50 cursor-pointer"
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

            {/* ======================================================== */}
            {/* VISTA 2: REGISTRO DE NUEVO CLIENTE                      */}
            {/* ======================================================== */}
            {!currentCustomer && activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3 max-w-md mx-auto py-1">
                <div className="text-center space-y-1 mb-3">
                  <h4 className="text-lg font-bold text-white">Crea tu cuenta en {restaurantName}</h4>
                  <p className="text-xs text-gray-400">
                    Guarda tu dirección de entrega y disfruta de pedidos rápidos.
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
                  className="w-full py-3 mt-2 rounded-xl font-black text-xs uppercase tracking-wider text-black shadow-lg transition active:scale-98 disabled:opacity-50 cursor-pointer"
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

            {/* ======================================================== */}
            {/* VISTA 3: HISTORIAL DE PEDIDOS                           */}
            {/* ======================================================== */}
            {currentCustomer && activeTab === 'orders' && (
              <div className="space-y-3">
                {/* Loyalty Tier & Reward Badge */}
                {(() => {
                  const spent = currentCustomer.totalComprado || 0;
                  const ordersCount = currentCustomer.totalPedidos || orders.length || 0;
                  const points = Math.floor(spent / 1000);
                  const isGold = spent >= 200000 || ordersCount >= 5;
                  const isSilver = !isGold && (spent >= 70000 || ordersCount >= 2);
                  const tierName = isGold ? 'Cliente Oro VIP' : isSilver ? 'Cliente Plata' : 'Cliente Bronce';
                  const tierColor = isGold ? '#ffd700' : isSilver ? '#c0c0c0' : '#cd7f32';

                  return (
                    <div className="bg-gradient-to-r from-[#1c1a14] via-[#141416] to-[#1c1a14] border border-amber-500/30 rounded-2xl p-4 space-y-2.5 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{isGold ? '🥇' : isSilver ? '🥈' : '🥉'}</span>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Nivel de Fidelización</span>
                            <span className="text-sm font-black text-white" style={{ color: tierColor }}>{tierName}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Puntos Acumulados</span>
                          <span className="text-sm font-black text-brand-yellow">{points} Puntos</span>
                        </div>
                      </div>

                      <div className="bg-black/50 p-2.5 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
                        <span className="text-gray-300 font-medium text-[11px]">
                          {isGold
                            ? '🎉 Tienes 10% de descuento VIP activo usando:'
                            : isSilver
                            ? '⭐ Tienes $5.000 de descuento activo usando:'
                            : '🍔 En tu próximo pedido obtén descuento con:'}
                        </span>
                        <code className="px-2 py-0.5 rounded bg-brand-yellow/20 text-brand-yellow font-black border border-brand-yellow/40 text-xs">
                          {isGold ? 'VIP10' : isSilver ? 'PROMO5' : 'BIENVENIDO'}
                        </code>
                      </div>
                    </div>
                  );
                })()}
                {loadingOrders ? (
                  <div className="py-12 text-center text-gray-400 text-xs">
                    <div className="w-8 h-8 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Cargando tus pedidos anteriores...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 space-y-3">
                    <ShoppingBag className="w-12 h-12 mx-auto text-gray-600" />
                    <div>
                      <p className="font-bold text-white text-sm">Aún no tienes pedidos registrados</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Agrega tus platos favoritos al carrito y confirma tu primer domicilio.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        setIsCartOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-black uppercase cursor-pointer"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Ir al Carrito
                    </button>
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
                        className="bg-[#181818] border border-[#272727] rounded-xl p-3.5 space-y-2.5 hover:border-[#383838] transition"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-white">
                              #{ord.codigo}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                statusColors[ord.estado] || 'bg-gray-800 text-gray-300 border-gray-700'
                              }`}
                            >
                              {ord.estado}
                            </span>
                          </div>

                          <span className="text-xs font-black" style={{ color: primaryColor }}>
                            {formatCOP(ord.total)}
                          </span>
                        </div>

                        <div className="text-[11px] text-gray-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-500" />
                            {new Date(ord.createdAt).toLocaleDateString('es-CO', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>•</span>
                          <span>{ord.tipo === 'domicilio' ? '🛵 Domicilio' : ord.tipo === 'mesa' ? `🍽️ Mesa ${ord.numeroMesa || ''}` : '🏪 Para Llevar'}</span>
                          <span>•</span>
                          <span>{ord.metodoPago}</span>
                        </div>

                        {/* Detalle de ítems */}
                        <div className="bg-[#131313] rounded-lg p-2 text-xs space-y-1 border border-[#202020]">
                          {(ord.items || []).map((it: any, iIdx: number) => (
                            <div key={iIdx} className="flex justify-between text-gray-300 text-[11px]">
                              <span>
                                {it.cantidad}x {it.nombre}
                              </span>
                              <span className="text-gray-400">{formatCOP(it.precio * it.cantidad)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleRepeatOrder(ord)}
                            className="flex-1 py-2 px-3 rounded-lg text-xs font-extrabold text-black flex items-center justify-center gap-1.5 shadow transition active:scale-95 cursor-pointer"
                            style={{ backgroundColor: primaryColor }}
                            title="Volver a poner estos platos en el carrito"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Pedir de nuevo</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleViewReceipt(ord)}
                            className="py-2 px-3 rounded-lg text-xs font-bold text-gray-300 bg-[#222] hover:bg-[#2c2c2c] border border-[#333] flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                            title="Ver factura o recibo generado"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Factura / Recibo</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* VISTA 4: DIRECCIONES GUARDADAS & PERFIL                 */}
            {/* ======================================================== */}
            {currentCustomer && activeTab === 'addresses' && (
              <div className="space-y-4 max-w-lg mx-auto py-2">
                <div className="flex items-center justify-between pb-3 border-b border-[#252525]">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4" style={{ color: primaryColor }} />
                      <span>Tus Direcciones de Entrega</span>
                    </h4>
                    <p className="text-xs text-gray-400">
                      Esta dirección se seleccionará automáticamente cada vez que pidas en {restaurantName}.
                    </p>
                  </div>
                  {!isEditingAddress && (
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(true)}
                      className="px-3 py-1.5 rounded-xl bg-[#222] hover:bg-[#2e2e2e] text-xs font-bold text-white border border-[#333] transition flex items-center gap-1.5 cursor-pointer"
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
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-[#181818] border border-[#2b2b2b] space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 mt-0.5 text-black"
                            style={{ backgroundColor: primaryColor }}
                          >
                            <Home className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                                Dirección Principal
                              </span>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Guardada
                              </span>
                            </div>
                            <p className="text-sm font-black text-white mt-1">
                              {currentCustomer.direccion || 'Sin dirección guardada aún'}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-1">
                              {currentCustomer.barrio && (
                                <span className="flex items-center gap-1 font-semibold text-gray-300">
                                  📍 Barrio: {currentCustomer.barrio}
                                </span>
                              )}
                              <span>• {currentCustomer.ciudad || 'Cali'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-[#252525] flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-500" />
                          <span>Contacto: <strong className="text-white">{currentCustomer.telefono}</strong></span>
                        </span>
                      </div>
                    </div>

                    {/* Quick action to order */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          setIsCartOpen(true);
                        }}
                        className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition active:scale-98 cursor-pointer text-black"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Hacer un Pedido con esta Dirección</span>
                      </button>
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

            {/* ======================================================== */}
            {/* VISTA 5: PEDIDOS HABITUALES / FAVORITOS                 */}
            {/* ======================================================== */}
            {currentCustomer && activeTab === 'favorites' && (
              <div className="space-y-3">
                <div className="text-xs text-gray-400 bg-[#171717] p-3 rounded-xl border border-[#252525]">
                  ⭐ <strong>Tus delicias más pedidas:</strong> Estos son los platos que has ordenado con mayor frecuencia en {restaurantName}. Agrégalos en 1 clic para seguir pidiendo.
                </div>

                {habitualProducts.length === 0 ? (
                  <div className="py-8 text-center text-gray-500 text-xs">
                    Realiza tu primer pedido para que aparezcan tus platos habituales aquí.
                  </div>
                ) : (
                  habitualProducts.map((prod, idx) => (
                    <div
                      key={idx}
                      className="bg-[#181818] border border-[#272727] rounded-xl p-3 flex items-center justify-between gap-3 hover:border-[#383838] transition"
                    >
                      <div>
                        <h5 className="text-xs font-bold text-white">{prod.nombre}</h5>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Has pedido este plato <strong className="font-bold" style={{ color: primaryColor }}>{prod.pedidosCount} vez/veces</strong> ({prod.cantidadTotal} unidades)
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
                          onClose();
                          setIsCartOpen(true);
                        }}
                        className="py-2 px-3 rounded-lg text-xs font-bold text-black flex items-center gap-1.5 shadow transition active:scale-95 cursor-pointer whitespace-nowrap"
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

          {/* Footer */}
          <div className="p-3 border-t border-[#222] bg-[#141414] text-center text-[10px] text-gray-500 shrink-0">
            PUNTO G SaaS • Tus datos y pedidos se gestionan de forma segura en este restaurante.
          </div>
        </div>
      </div>

      {/* Modal de Factura Térmica */}
      {receiptOrder && (
        <ThermalReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          order={receiptOrder}
        />
      )}
    </>,
    document.body
  );
};
