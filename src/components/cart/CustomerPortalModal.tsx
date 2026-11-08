'use client';

import React, { useState, useEffect } from 'react';
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
  DollarSign
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
  } = useCart();
  const { restaurant } = useTenant();

  const primaryColor = restaurant?.colorPrimario || '#EAA622';
  const restaurantSlug = restaurant?.slug || 'punto-g';
  const restaurantName = restaurant?.nombre || 'Restaurante';

  // Vista activa: 'login', 'register', 'orders', 'favorites'
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'orders' | 'favorites'>('login');

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

  // Modal de ticket/factura térmica
  const [receiptOrder, setReceiptOrder] = useState<any | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Formato de moneda
  const formatCOP = (val: number) => '$' + Number(val || 0).toLocaleString('es-CO');

  // Si hay cliente activo, abrir en 'orders'
  useEffect(() => {
    if (currentCustomer) {
      setActiveTab('orders');
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

  // Repetir pedido (Cargar todos los items al carrito y abrirlo)
  const handleRepeatOrder = (order: any) => {
    if (!order.items || order.items.length === 0) return;

    order.items.forEach((item: any) => {
      let parsedAddons: any[] = [];
      try {
        if (item.adicionales) {
          parsedAddons = typeof item.adicionales === 'string' ? JSON.parse(item.adicionales) : item.adicionales;
        }
      } catch (e) {}

      addToCart(
        {
          id: item.productId || Math.floor(Math.random() * 100000),
          nombre: item.nombre,
          precio: item.precio,
          slug: item.nombre.toLowerCase().replace(/\s+/g, '-'),
          imagen: '/images/default-food.jpg',
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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
        <div className="bg-[#121212] border border-[#262626] rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl text-white overflow-hidden">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#222] flex items-center justify-between bg-[#181818]">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-black"
                style={{ backgroundColor: primaryColor }}
              >
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold uppercase font-display tracking-wider">
                  {currentCustomer ? `Hola, ${currentCustomer.nombre}` : 'Portal de Clientes'}
                </h3>
                <p className="text-xs text-gray-400">
                  {currentCustomer
                    ? `${restaurantName} • Tu historial y pedidos favoritos`
                    : `Inicia sesión o regístrate en ${restaurantName}`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#252525] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Bar if Logged In */}
          {currentCustomer && (
            <div className="flex border-b border-[#222] bg-[#151515] text-xs font-bold overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition whitespace-nowrap ${
                  activeTab === 'orders'
                    ? 'border-brand-yellow text-brand-yellow bg-black/20'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
                style={activeTab === 'orders' ? { borderColor: primaryColor, color: primaryColor } : {}}
              >
                <Clock className="w-4 h-4" />
                <span>Mis Pedidos ({orders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('favorites')}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition whitespace-nowrap ${
                  activeTab === 'favorites'
                    ? 'border-brand-yellow text-brand-yellow bg-black/20'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
                style={activeTab === 'favorites' ? { borderColor: primaryColor, color: primaryColor } : {}}
              >
                <Sparkles className="w-4 h-4" />
                <span>Pedidos Habituales</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  logoutCustomer();
                  setActiveTab('login');
                }}
                className="py-3 px-4 flex items-center justify-center gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/20 transition whitespace-nowrap border-b-2 border-transparent"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            
            {/* ======================================================== */}
            {/* VISTA 1: INICIAR SESIÓN */}
            {/* ======================================================== */}
            {!currentCustomer && activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto py-2">
                <div className="text-center space-y-1 mb-4">
                  <h4 className="text-lg font-bold text-white">Ingresa a tu cuenta</h4>
                  <p className="text-xs text-gray-400">
                    Revisa tus pedidos anteriores, descarga facturas y repite tus pedidos en 1 clic.
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
                    <Phone className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
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
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#303030] focus:border-brand-yellow text-white text-xs rounded-xl pl-9 pr-3 py-3 outline-none transition"
                    />
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-black transition shadow-lg flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  {loginLoading ? 'Ingresando...' : 'Iniciar Sesión'}
                </button>

                <div className="pt-3 border-t border-[#222] text-center text-xs text-gray-400">
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
            {/* VISTA 2: REGISTRO DE CLIENTE */}
            {/* ======================================================== */}
            {!currentCustomer && activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5 max-w-md mx-auto py-1">
                <div className="text-center space-y-1 mb-2">
                  <h4 className="text-lg font-bold text-white">Crea tu cuenta de cliente</h4>
                  <p className="text-xs text-gray-400">
                    Guarda tus direcciones favoritas y gestiona tus pedidos fácilmente.
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
                    Nombre completo *:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Laura Gómez"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#303030] text-white text-xs rounded-xl px-3 py-2.5 outline-none focus:border-brand-yellow transition"
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
                      placeholder="Ej: 310 987 6543"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#303030] text-white text-xs rounded-xl px-3 py-2.5 outline-none focus:border-brand-yellow transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Correo (opcional):
                    </label>
                    <input
                      type="email"
                      placeholder="laura@ejemplo.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#303030] text-white text-xs rounded-xl px-3 py-2.5 outline-none focus:border-brand-yellow transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Dirección de entrega habitual:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Calle 15 # 23-45"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#303030] text-white text-xs rounded-xl px-3 py-2.5 outline-none focus:border-brand-yellow transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Barrio:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: San Antonio"
                      value={regBarrio}
                      onChange={(e) => setRegBarrio(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#303030] text-white text-xs rounded-xl px-3 py-2.5 outline-none focus:border-brand-yellow transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Crea una contraseña *:
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 4 caracteres"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#303030] text-white text-xs rounded-xl px-3 py-2.5 outline-none focus:border-brand-yellow transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-black transition shadow-lg flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer mt-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  {regLoading ? 'Registrando...' : 'Completar Registro'}
                </button>

                <div className="pt-2 border-t border-[#222] text-center text-xs text-gray-400">
                  ¿Ya tienes cuenta?{' '}
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
            {/* VISTA 3: HISTORIAL DE PEDIDOS */}
            {/* ======================================================== */}
            {currentCustomer && activeTab === 'orders' && (
              <div className="space-y-3">
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
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-black uppercase"
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

                          <span className="text-xs font-black text-brand-yellow" style={{ color: primaryColor }}>
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
            {/* VISTA 4: PEDIDOS HABITUALES / FAVORITOS */}
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
                          Has pedido este plato <strong className="text-brand-yellow font-bold" style={{ color: primaryColor }}>{prod.pedidosCount} vez/veces</strong> ({prod.cantidadTotal} unidades)
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
          <div className="p-3 border-t border-[#222] bg-[#141414] text-center text-[10px] text-gray-500">
            PUNTO G SaaS • Tus datos se guardan de forma segura en este restaurante.
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
    </>
  );
};
