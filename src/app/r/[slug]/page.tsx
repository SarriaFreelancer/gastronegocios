'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import {
  UtensilsCrossed,
  MapPin,
  Phone,
  Clock,
  ShoppingBag,
  Sparkles,
  Search,
  Plus,
  Minus,
  Trash2,
  Check,
  X,
  Building2,
  ChevronRight,
  Instagram,
  ArrowRight
} from 'lucide-react';
import { swalCustom, showSuccess, showError } from '@/lib/swal';
import { TableServiceBar } from '@/components/menu/TableServiceBar';

interface RestaurantData {
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
  instagram?: string;
  direccionCentral?: string;
  ciudad: string;
  costoDomicilioBase: number;
  propinaSugeridaPct: number;
  plan?: string;
  activo: boolean;
  branches: Array<{
    id: number;
    nombre: string;
    slug: string;
    direccion?: string;
    telefono?: string;
    ciudad: string;
  }>;
}

export default function RestaurantLandingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = (params?.slug as string) || 'punto-g';

  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Carrito local de la landing del restaurante
  const [cart, setCart] = useState<Array<{ product: any; cantidad: number; notas?: string }>>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'domicilio' | 'recoger' | 'mesa'>('domicilio');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos del restaurante por su slug
  useEffect(() => {
    setLoading(true);
    fetch(`/api/restaurants?slug=${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.id) {
          setRestaurant(data);
          if (data.branches && data.branches.length > 0) {
            setSelectedBranchId(data.branches[0].id);
          }
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [slug]);

  // Cargar categorías y productos de este restaurante
  useEffect(() => {
    if (!restaurant) return;

    fetch(`/api/categories?restaurantId=${restaurant.id}&principales=true`)
      .then((res) => (res.ok ? res.json() : []))
      .then((cats) => setCategories(cats))
      .catch(() => {});

    fetch(`/api/products?restaurantId=${restaurant.id}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((prods) => setProducts(prods))
      .catch(() => {});
  }, [restaurant]);

  // Autodetectar mesa desde query string (?mesa=Mesa 3)
  useEffect(() => {
    const mesaParam = searchParams.get('mesa');
    if (mesaParam) {
      setTableNumber(mesaParam.startsWith('Mesa') ? mesaParam : `Mesa ${mesaParam}`);
      setDeliveryType('mesa');
    }
    const branchParam = searchParams.get('sede');
    if (branchParam && restaurant?.branches) {
      const found = restaurant.branches.find(
        (b) => b.id === Number(branchParam) || b.slug.includes(branchParam)
      );
      if (found) setSelectedBranchId(found.id);
    }
  }, [searchParams, restaurant]);

  const primaryColor = restaurant?.colorPrimario || '#ffc928';
  const formatCOP = (num: number) => '$' + (num || 0).toLocaleString('es-CO');

  // Agregar al carrito
  const addToCart = (product: any) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx >= 0) {
        return prev.map((item, i) =>
          i === idx ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { product, cantidad: 1, notas: '' }];
    });
    setIsCartOpen(true);
  };

  const updateCartQty = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId ? { ...item, cantidad: item.cantidad + delta } : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.precio * item.cantidad, 0);
  }, [cart]);

  const deliveryCost = deliveryType === 'domicilio' ? (restaurant?.costoDomicilioBase || 5000) : 0;
  const tipAmount = Math.round((cartSubtotal * (restaurant?.propinaSugeridaPct || 10)) / 100);
  const cartTotal = cartSubtotal + deliveryCost + (deliveryType === 'mesa' ? tipAmount : 0);

  // Enviar pedido
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || cart.length === 0 || !restaurant) {
      showError('Datos incompletos', 'Por favor ingresa tu nombre, teléfono y productos.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedBranch = restaurant.branches.find((b) => b.id === selectedBranchId);

      const payload = {
        cliente: customerName.trim(),
        telefono: customerPhone.trim(),
        tipo: deliveryType,
        numeroMesa: deliveryType === 'mesa' ? tableNumber : null,
        direccion: deliveryType === 'domicilio' ? customerAddress : null,
        subtotal: cartSubtotal,
        propina: deliveryType === 'mesa' ? tipAmount : 0,
        costoEnvio: deliveryCost,
        total: cartTotal,
        metodoPago: 'Pendiente',
        notasCliente: customerNotes.trim(),
        branchId: selectedBranchId,
        sedeNombre: selectedBranch?.nombre || null,
        restaurantId: restaurant.id,
        items: cart.map((i) => ({
          productoId: i.product.id,
          nombre: i.product.nombre,
          precio: i.product.precio,
          cantidad: i.cantidad,
          notas: i.notas || null,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const orderData = await res.json();
        await swalCustom.fire({
          title: `¡PEDIDO ENVIADO A ${restaurant.nombre.toUpperCase()}!`,
          html: `
            Tu pedido <strong class="text-brand-yellow">#${orderData.codigo}</strong> fue recibido con éxito.<br>
            Sede: <strong>${selectedBranch?.nombre || 'Central'}</strong><br>
            Total: <strong>${formatCOP(cartTotal)}</strong>
          `,
          icon: 'success',
          confirmButtonText: 'Genial',
        });

        // Opción de enviar a WhatsApp del restaurante
        if (restaurant.telefonoWhatsapp) {
          const text = encodeURIComponent(
            `¡Hola ${restaurant.nombre}! Acabo de hacer el pedido #${orderData.codigo} a nombre de ${customerName}. Total: ${formatCOP(cartTotal)}`
          );
          window.open(`https://wa.me/57${restaurant.telefonoWhatsapp}?text=${text}`, '_blank');
        }

        setCart([]);
        setIsCartOpen(false);
      } else {
        const err = await res.json();
        showError('Error al crear pedido', err.error || 'Ocurrió un error');
      }
    } catch (e) {
      showError('Error de conexión', 'No se pudo registrar el pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      if (p.disponibilidad === false) return false;
      if (selectedCategory !== 'todas') {
        if (p.categoria !== selectedCategory && p.subcategoria !== selectedCategory) {
          return false;
        }
      }
      if (!q) return true;
      return (
        p.nombre.toLowerCase().includes(q) ||
        (p.descripcion || '').toLowerCase().includes(q)
      );
    });
  }, [products, selectedCategory, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <UtensilsCrossed className="w-12 h-12 text-brand-yellow mx-auto animate-bounce" />
          <p className="text-sm font-bold text-gray-400">Cargando restaurante...</p>
        </div>
      </div>
    );
  }

  if (!restaurant || !restaurant.activo) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center text-white p-6">
        <div className="bg-[#141414] border border-[#2a2a2a] p-8 rounded-3xl text-center max-w-md w-full space-y-4">
          <UtensilsCrossed className="w-12 h-12 text-gray-600 mx-auto" />
          <h2 className="text-xl font-black uppercase text-white font-display">
            Restaurante no disponible
          </h2>
          <p className="text-xs text-gray-400">
            El restaurante solicitado no se encuentra activo o el enlace no es válido.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-brand-yellow text-black font-black text-xs uppercase rounded-xl"
          >
            Ir a la Página Principal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-white font-sans selection:bg-brand-yellow selection:text-black flex flex-col justify-between"
      style={{ backgroundColor: restaurant.colorFondo || '#080808' }}
    >
      {/* ======================================================== */}
      {/* NAVBAR PERSONALIZADA DEL RESTAURANTE */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-[#121212]/95 backdrop-blur-md border-b border-[#222] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          {restaurant.logo ? (
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-black/50 border border-white/10">
              <Image src={restaurant.logo} alt={restaurant.nombre} fill className="object-contain" />
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-black text-base shadow-md font-display"
              style={{ backgroundColor: primaryColor }}
            >
              <UtensilsCrossed className="w-5 h-5" />
            </div>
          )}

          <div>
            <h1 className="text-base sm:text-lg font-black uppercase tracking-wider font-display text-white">
              {restaurant.nombre}
            </h1>
            <p className="text-[11px] text-gray-400 line-clamp-1">{restaurant.eslogan}</p>
          </div>
        </div>

        {/* Botón Carrito y WhatsApp */}
        <div className="flex items-center gap-2">
          {restaurant.telefonoWhatsapp && (
            <a
              href={`https://wa.me/57${restaurant.telefonoWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-black font-black text-xs uppercase tracking-wider shadow-glow transition active:scale-95"
            style={{ backgroundColor: primaryColor }}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Mi Pedido ({cart.reduce((s, i) => s + i.cantidad, 0)})</span>
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* HERO SECTION CON BRANDING PROPIO */}
      {/* ======================================================== */}
      <section className="relative w-full min-h-[320px] sm:min-h-[400px] flex items-center justify-center overflow-hidden border-b border-[#222]">
        {/* Imagen de Fondo */}
        <div className="absolute inset-0 z-0">
          <Image
            src={restaurant.bannerHero || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1400&auto=format&fit=crop'}
            alt={restaurant.nombre}
            fill
            className="object-cover opacity-35 filter brightness-75 scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-black/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
          <span
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-black shadow-md"
            style={{ backgroundColor: primaryColor }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{restaurant.ciudad} • {restaurant.plan}</span>
          </span>

          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-wider font-display text-white">
            {restaurant.nombre}
          </h2>

          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto font-medium">
            {restaurant.descripcion || restaurant.eslogan}
          </p>

          {/* Información de contacto rápida */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400 pt-2 font-bold">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-yellow" />
              <span>{restaurant.direccionCentral}</span>
            </span>
            {restaurant.telefonoWhatsapp && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{restaurant.telefonoWhatsapp}</span>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SELECTOR DE SEDES (SI EL NEGOCIO TIENE MÁS DE 1 SEDE) */}
      {/* ======================================================== */}
      {restaurant.branches && restaurant.branches.length > 0 && (
        <section className="max-w-7xl mx-auto w-full px-4 pt-6">
          <div className="bg-[#141414] border border-[#262626] rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-black shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-white font-display">
                  SEDE DE ATENCIÓN Y DESPACHO
                </h3>
                <p className="text-xs text-gray-400">
                  Tus pedidos saldrán preparados desde la sede que selecciones.
                </p>
              </div>
            </div>

            {/* Botones de Sedes */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {restaurant.branches.map((branch) => {
                const isSelected = selectedBranchId === branch.id;
                return (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => setSelectedBranchId(branch.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      isSelected
                        ? 'text-black shadow-glow'
                        : 'bg-[#1c1c1c] text-gray-300 hover:text-white border border-[#303030]'
                    }`}
                    style={isSelected ? { backgroundColor: primaryColor } : {}}
                  >
                    <Check className={`w-3.5 h-3.5 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                    <span>{branch.nombre}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* MENÚ DE PLATOS Y CATEGORÍAS DE ESTE NEGOCIO */}
      {/* ======================================================== */}
      <main className="max-w-7xl mx-auto w-full px-4 py-8 space-y-6">
        {/* Barra de Búsqueda y Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Categorías */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('todas')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'todas'
                  ? 'text-black shadow-glow'
                  : 'bg-[#161616] text-gray-400 border border-[#2b2b2b] hover:text-white'
              }`}
              style={selectedCategory === 'todas' ? { backgroundColor: primaryColor } : {}}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.slug
                    ? 'text-black shadow-glow'
                    : 'bg-[#161616] text-gray-400 border border-[#2b2b2b] hover:text-white'
                }`}
                style={selectedCategory === cat.slug ? { backgroundColor: primaryColor } : {}}
              >
                {cat.nombre}
              </button>
            ))}
          </div>

          {/* Input de Búsqueda */}
          <div className="relative w-full sm:w-72 shrink-0">
            <input
              type="text"
              placeholder="Buscar en la carta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161616] border border-[#2e2e2e] focus:border-white text-white text-xs rounded-2xl pl-10 pr-4 py-2.5 outline-none transition"
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Cuadrícula de Platos */}
        {filteredProducts.length === 0 ? (
          <div className="bg-[#121212] border border-[#222] rounded-3xl p-12 text-center space-y-3">
            <UtensilsCrossed className="w-12 h-12 text-gray-600 mx-auto" />
            <h4 className="text-base font-bold text-white">No hay platos disponibles</h4>
            <p className="text-xs text-gray-400">
              Prueba cambiando la categoría o término de búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-[#141414] border border-[#262626] hover:border-white/30 rounded-3xl p-3.5 flex flex-col justify-between space-y-3 transition-all group shadow-xl"
              >
                <div className="space-y-2.5">
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-[#202020]">
                    <Image
                      src={prod.imagen}
                      alt={prod.nombre}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    {prod.etiqueta && (
                      <span
                        className="absolute top-2 left-2 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {prod.etiqueta}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-brand-yellow transition-colors">
                      {prod.nombre}
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                      {prod.descripcion}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#222] flex items-center justify-between">
                  <span
                    className="text-base font-black font-display"
                    style={{ color: primaryColor }}
                  >
                    {formatCOP(prod.precio)}
                  </span>

                  <button
                    type="button"
                    onClick={() => addToCart(prod)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-black font-black text-xs uppercase tracking-wider shadow transition active:scale-95 cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* DRAWER / MODAL DEL CARRITO DE COMPRA */}
      {/* ======================================================== */}
      {isCartOpen && (
        <div
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#121212] border-l border-[#262626] w-full max-w-md h-full flex flex-col justify-between p-5 sm:p-6 shadow-2xl animate-in slide-in-from-right"
          >
            {/* Header del Carrito */}
            <div className="flex items-center justify-between pb-4 border-b border-[#222]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-yellow" />
                <h3 className="text-base font-black uppercase text-white font-display">
                  Mi Pedido en {restaurant.nombre}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full bg-[#1e1e1e] text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector de Tipo de Pedido */}
            <div className="grid grid-cols-3 gap-1.5 bg-[#181818] p-1 rounded-2xl border border-[#2b2b2b] my-3">
              {(['domicilio', 'recoger', 'mesa'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDeliveryType(t)}
                  className={`py-2 rounded-xl text-xs font-black uppercase transition capitalize ${
                    deliveryType === t
                      ? 'text-black shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  style={deliveryType === t ? { backgroundColor: primaryColor } : {}}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Lista de Ítems */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2">
              {cart.length === 0 ? (
                <div className="py-16 text-center text-gray-500 text-xs space-y-2">
                  <ShoppingBag className="w-10 h-10 mx-auto text-gray-600 mb-2" />
                  <p className="font-bold">Tu carrito está vacío</p>
                  <p>Agrega deliciosos platos de la carta para continuar.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-[#181818] border border-[#282828] rounded-2xl p-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-white line-clamp-1">{item.product.nombre}</p>
                      <span
                        className="font-black font-display text-[11px]"
                        style={{ color: primaryColor }}
                      >
                        {formatCOP(item.product.precio * item.cantidad)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#222] rounded-xl p-1 border border-[#333]">
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.product.id, -1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white rounded-lg"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-black text-white">{item.cantidad}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.product.id, 1)}
                        className="w-6 h-6 flex items-center justify-center text-brand-yellow hover:text-yellow-400 rounded-lg"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Formulario de Checkout */}
            {cart.length > 0 && (
              <form onSubmit={handleCheckout} className="space-y-3 pt-3 border-t border-[#222]">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Tu Nombre *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white outline-none"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Tu Teléfono *"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                {deliveryType === 'domicilio' && (
                  <input
                    type="text"
                    required
                    placeholder="Dirección exacta de entrega (con barrio) *"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white text-xs outline-none"
                  />
                )}

                {deliveryType === 'mesa' && (
                  <input
                    type="text"
                    required
                    placeholder="Número de Mesa (ej: Mesa 3) *"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white text-xs outline-none font-bold"
                  />
                )}

                {/* Resumen de Valores */}
                <div className="bg-[#181818] rounded-2xl p-3 space-y-1.5 text-xs border border-[#282828]">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal:</span>
                    <span className="font-bold text-white">{formatCOP(cartSubtotal)}</span>
                  </div>
                  {deliveryType === 'domicilio' && (
                    <div className="flex justify-between text-gray-400">
                      <span>Costo de Envío:</span>
                      <span className="font-bold text-white">{formatCOP(deliveryCost)}</span>
                    </div>
                  )}
                  {deliveryType === 'mesa' && (
                    <div className="flex justify-between text-gray-400">
                      <span>Propina sugerida:</span>
                      <span className="font-bold text-brand-orange">{formatCOP(tipAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-1.5 border-t border-[#333]">
                    <span className="text-sm font-black uppercase text-white font-display">Total:</span>
                    <span
                      className="text-lg font-black font-display"
                      style={{ color: primaryColor }}
                    >
                      {formatCOP(cartTotal)}
                    </span>
                  </div>
                </div>

                {/* Botón de Confirmar Pedido */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl text-black font-black text-xs uppercase tracking-wider shadow-glow transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isSubmitting ? 'Procesando Pedido...' : 'Confirmar Pedido'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FOOTER DEL RESTAURANTE */}
      {/* ======================================================== */}
      <footer className="bg-[#101010] border-t border-[#222] py-8 px-4 text-center text-xs text-gray-400 space-y-2 mt-12">
        <p className="font-bold text-white">
          {restaurant.nombre} • {restaurant.ciudad}
        </p>
        <p className="text-[11px] text-gray-500">{restaurant.direccionCentral}</p>
        <p className="text-[10px] text-gray-600 pt-2">
          Potenciado por SaaS GastroTech • Plataforma Multi-Restaurante
        </p>
      </footer>
    </div>
  );
}
