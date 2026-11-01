'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { products as initialProducts } from '@/data/products';
import { categories } from '@/data/categories';
import { restaurantInfo as initialInfo } from '@/data/restaurant-info';
import { Product } from '@/types';
import { 
  ShoppingBag, 
  Layers, 
  Settings, 
  TrendingUp, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Store, 
  Phone, 
  MapPin, 
  Save, 
  ArrowLeft, 
  Check, 
  AlertCircle
} from 'lucide-react';

interface MockOrder {
  id: string;
  cliente: string;
  telefono: string;
  direccion: string;
  tipo: 'domicilio' | 'recoger';
  items: { nombre: string; cantidad: number; precio: number }[];
  total: number;
  estado: 'Pendiente' | 'En Preparación' | 'Despachado' | 'Entregado';
  hora: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'pedidos' | 'productos' | 'configuracion'>('pedidos');
  
  // Products State
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedCat, setSelectedCat] = useState('todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State for new/edit product
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'hamburguesas',
    precio: '',
    descripcion: '',
    imagen: '',
    etiqueta: '',
    disponibilidad: true,
  });

  // Settings State
  const [config, setConfig] = useState({
    nombre: initialInfo.name,
    whatsapp: initialInfo.phone,
    direccion: initialInfo.address,
    horario: initialInfo.schedule,
    costoEnvio: 5000,
    abierto: true,
  });
  const [savedSettings, setSavedSettings] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<MockOrder[]>([
    {
      id: 'PG-1042',
      cliente: 'Andrés Felipe Morales',
      telefono: '315 456 7890',
      direccion: 'Calle 15 # 45-20, San Fernando',
      tipo: 'domicilio',
      items: [
        { nombre: 'Hamburguesa Doble Carne', cantidad: 2, precio: 26000 },
        { nombre: 'Porción de Papas Francesas', cantidad: 1, precio: 8000 },
        { nombre: 'Coca-Cola 400ml', cantidad: 2, precio: 5500 },
      ],
      total: 76000,
      estado: 'En Preparación',
      hora: '12:45 p.m.',
    },
    {
      id: 'PG-1041',
      cliente: 'Valentina Restrepo',
      telefono: '320 123 9876',
      direccion: 'Para recoger en tienda',
      tipo: 'recoger',
      items: [
        { nombre: 'Salchipapa Monstruo Punto G', cantidad: 1, precio: 26000 },
        { nombre: 'Soda Artesanal Frutos Rojos', cantidad: 1, precio: 12000 },
      ],
      total: 38000,
      estado: 'Pendiente',
      hora: '12:50 p.m.',
    },
    {
      id: 'PG-1040',
      cliente: 'Camilo Torres',
      telefono: '318 765 4321',
      direccion: 'Cra. 66 # 10-30, Ciudad Jardín',
      tipo: 'domicilio',
      items: [
        { nombre: 'Parrillada Mixta Punto G', cantidad: 1, precio: 45000 },
        { nombre: 'Jugo de Lulo Valluno', cantidad: 2, precio: 9500 },
      ],
      total: 69000,
      estado: 'Despachado',
      hora: '12:20 p.m.',
    },
    {
      id: 'PG-1039',
      cliente: 'María José Gómez',
      telefono: '311 234 5678',
      direccion: 'Calle 9 # 32-15, Tequendama',
      tipo: 'domicilio',
      items: [
        { nombre: 'Combo Punto G', cantidad: 2, precio: 28900 },
      ],
      total: 62800,
      estado: 'Entregado',
      hora: '11:40 a.m.',
    },
  ]);

  // Toggle availability
  const toggleAvailability = (id: string) => {
    setProductList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, disponibilidad: !p.disponibilidad } : p))
    );
  };

  // Delete product
  const deleteProduct = (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este producto del menú?')) {
      setProductList((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Change order status
  const updateOrderStatus = (orderId: string, newStatus: MockOrder['estado']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, estado: newStatus } : o))
    );
  };

  // Open modal for new product
  const handleOpenNew = () => {
    setEditingProduct(null);
    setFormData({
      nombre: '',
      categoria: 'hamburguesas',
      precio: '',
      descripcion: '',
      imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop',
      etiqueta: '',
      disponibilidad: true,
    });
    setIsModalOpen(true);
  };

  // Open modal for editing product
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      nombre: p.nombre,
      categoria: p.categoria,
      precio: String(p.precio),
      descripcion: p.descripcion,
      imagen: p.imagen,
      etiqueta: p.etiqueta || '',
      disponibilidad: p.disponibilidad,
    });
    setIsModalOpen(true);
  };

  // Save Product (create or edit)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.precio) return;

    if (editingProduct) {
      setProductList((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                nombre: formData.nombre,
                categoria: formData.categoria,
                precio: Number(formData.precio),
                descripcion: formData.descripcion,
                imagen: formData.imagen,
                etiqueta: formData.etiqueta ? (formData.etiqueta as any) : undefined,
                disponibilidad: formData.disponibilidad,
              }
            : p
        )
      );
    } else {
      const newP: Product = {
        id: `prod-${Date.now()}`,
        nombre: formData.nombre,
        slug: formData.nombre.toLowerCase().replace(/\s+/g, '-'),
        descripcion: formData.descripcion,
        precio: Number(formData.precio),
        imagen: formData.imagen,
        categoria: formData.categoria,
        etiqueta: formData.etiqueta ? (formData.etiqueta as any) : undefined,
        disponibilidad: formData.disponibilidad,
      };
      setProductList((prev) => [newP, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2500);
  };

  // Filtered Products
  const filteredProducts = productList.filter((p) => {
    const matchesCat = selectedCat === 'todas' || p.categoria === selectedCat;
    const matchesSearch =
      p.nombre.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(searchProduct.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111111] border border-[#242424] rounded-3xl p-6 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-whatsapp animate-ping" />
              <span className="text-xs font-bold text-brand-yellow uppercase tracking-wider">
                Panel de Control Punto G
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-white font-display">
              ADMINISTRACIÓN DEL RESTAURANTE
            </h1>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#1c1c1c] hover:bg-[#252525] text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-[#333] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Tienda</span>
          </Link>
        </div>

        {/* Analytics Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#121212] border border-[#242424] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase">
              <span>Ventas de Hoy</span>
              <TrendingUp className="w-4 h-4 text-brand-yellow" />
            </div>
            <p className="text-2xl font-black text-brand-yellow font-display">$845.800 COP</p>
            <p className="text-[11px] text-green-400 font-semibold">+18% vs. ayer</p>
          </div>

          <div className="bg-[#121212] border border-[#242424] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase">
              <span>Pedidos Activos</span>
              <ShoppingBag className="w-4 h-4 text-brand-whatsapp" />
            </div>
            <p className="text-2xl font-black text-white font-display">24 Pedidos</p>
            <p className="text-[11px] text-gray-400">3 pendientes por despachar</p>
          </div>

          <div className="bg-[#121212] border border-[#242424] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase">
              <span>Productos en Carta</span>
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-black text-white font-display">{productList.length} Platos</p>
            <p className="text-[11px] text-gray-400">En 9 categorías activas</p>
          </div>

          <div className="bg-[#121212] border border-[#242424] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase">
              <span>Línea WhatsApp</span>
              <Phone className="w-4 h-4 text-brand-whatsapp" />
            </div>
            <p className="text-2xl font-black text-brand-whatsapp font-display">322 908 8736</p>
            <p className="text-[11px] text-green-400">En línea y recibiendo pedidos</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#222] pb-3">
          <button
            onClick={() => setActiveTab('pedidos')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'pedidos'
                ? 'bg-brand-yellow text-black shadow-glow'
                : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Pedidos en Tiempo Real ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('productos')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'productos'
                ? 'bg-brand-yellow text-black shadow-glow'
                : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Gestión de Productos ({productList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('configuracion')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'configuracion'
                ? 'bg-brand-yellow text-black shadow-glow'
                : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configuración del Local</span>
          </button>
        </div>

        {/* TAB 1: PEDIDOS */}
        {activeTab === 'pedidos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white uppercase font-display">
                Pedidos Recientes de Clientes
              </h2>
              <span className="text-xs text-gray-400">Actualizado automáticamente</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[#121212] border border-[#242424] rounded-2xl p-5 space-y-4 hover:border-brand-yellow/40 transition-colors shadow-lg"
                >
                  <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-black text-brand-yellow text-base">
                          {order.id}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          order.tipo === 'domicilio' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}>
                          {order.tipo}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white mt-0.5">{order.cliente}</p>
                      <p className="text-[11px] text-gray-400">{order.telefono} • {order.direccion}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-gray-400">{order.hora}</span>
                      <p className="text-lg font-black text-brand-yellow font-display">
                        ${order.total.toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-1.5 text-xs text-gray-300 bg-[#161616] p-3 rounded-xl border border-[#222]">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{it.cantidad}x {it.nombre}</span>
                        <span className="font-semibold text-gray-400">${(it.precio * it.cantidad).toLocaleString('es-CO')}</span>
                      </div>
                    ))}
                  </div>

                  {/* Status buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-bold text-gray-400 uppercase">Cambiar estado:</span>
                    <div className="flex items-center gap-1.5">
                      {(['Pendiente', 'En Preparación', 'Despachado', 'Entregado'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => updateOrderStatus(order.id, st)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                            order.estado === st
                              ? 'bg-brand-yellow text-black font-black shadow-glow'
                              : 'bg-[#1e1e1e] text-gray-400 hover:text-white'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTOS */}
        {activeTab === 'productos' && (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="bg-[#121212] border border-[#242424] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Search */}
                <div className="relative flex-1 md:w-64">
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow"
                  />
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                </div>

                {/* Category select */}
                <select
                  value={selectedCat}
                  onChange={(e) => setSelectedCat(e.target.value)}
                  className="bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-yellow cursor-pointer"
                >
                  <option value="todas">Todas las categorías</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleOpenNew}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs px-5 py-2.5 rounded-xl shadow-glow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>NUEVO PRODUCTO</span>
              </button>
            </div>

            {/* Product Table */}
            <div className="bg-[#121212] border border-[#242424] rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#181818] border-b border-[#252525] text-gray-400 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="py-3 px-4">Plato</th>
                      <th className="py-3 px-4">Categoría</th>
                      <th className="py-3 px-4">Precio</th>
                      <th className="py-3 px-4">Etiqueta</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e1e]">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-[#161616] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden relative flex-shrink-0 bg-black">
                              <Image src={p.imagen} alt={p.nombre} fill className="object-cover" sizes="40px" />
                            </div>
                            <div>
                              <p className="font-bold text-white">{p.nombre}</p>
                              <p className="text-[11px] text-gray-400 line-clamp-1">{p.descripcion}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 capitalize text-gray-300 font-semibold">{p.categoria}</td>
                        <td className="py-3 px-4 font-bold text-brand-yellow font-display text-sm">
                          ${p.precio.toLocaleString('es-CO')}
                        </td>
                        <td className="py-3 px-4">
                          {p.etiqueta ? (
                            <span className="bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/40 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                              {p.etiqueta}
                            </span>
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleAvailability(p.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                              p.disponibilidad
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {p.disponibilidad ? 'Disponible' : 'Agotado'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 rounded-lg bg-[#202020] text-gray-300 hover:text-brand-yellow hover:bg-[#282828] transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteProduct(p.id)}
                              className="p-1.5 rounded-lg bg-[#202020] text-gray-300 hover:text-red-400 hover:bg-[#282828] transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONFIGURACIÓN */}
        {activeTab === 'configuracion' && (
          <div className="max-w-2xl bg-[#121212] border border-[#242424] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div>
              <h2 className="text-xl font-bold uppercase text-white font-display">
                Datos del Establecimiento
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Ajusta el número de WhatsApp para pedidos, horarios y tarifa de entrega.
              </p>
            </div>

            {savedSettings && (
              <div className="bg-green-500/20 border border-green-500/40 rounded-xl p-3 flex items-center gap-2 text-green-400 text-xs font-bold">
                <Check className="w-4 h-4" />
                <span>Configuración guardada exitosamente.</span>
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  value={config.nombre}
                  onChange={(e) => setConfig({ ...config, nombre: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-yellow"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                  WhatsApp Oficial para Pedidos (3229088736)
                </label>
                <input
                  type="text"
                  value={config.whatsapp}
                  onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-yellow font-bold text-brand-whatsapp"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Dirección del Local</label>
                <input
                  type="text"
                  value={config.direccion}
                  onChange={(e) => setConfig({ ...config, direccion: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-yellow"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Horario de Servicio</label>
                <input
                  type="text"
                  value={config.horario}
                  onChange={(e) => setConfig({ ...config, horario: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-yellow"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Costo Domicilio ($ COP)</label>
                <input
                  type="number"
                  value={config.costoEnvio}
                  onChange={(e) => setConfig({ ...config, costoEnvio: Number(e.target.value) })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-yellow"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-glow transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>GUARDAR CAMBIOS</span>
              </button>
            </form>
          </div>
        )}

        {/* Modal for Product Add / Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#141414] border border-[#2c2c2c] rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
              <h3 className="text-lg font-bold uppercase text-white font-display">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>

              <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-[#2f2f2f] rounded-lg p-2 text-white focus:outline-none focus:border-brand-yellow"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Categoría</label>
                    <select
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      className="w-full bg-[#1e1e1e] border border-[#2f2f2f] rounded-lg p-2 text-white focus:outline-none focus:border-brand-yellow"
                    >
                      {categories.map((c) => (
                        <option key={c.slug} value={c.slug}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Precio ($ COP)</label>
                    <input
                      type="number"
                      required
                      value={formData.precio}
                      onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                      className="w-full bg-[#1e1e1e] border border-[#2f2f2f] rounded-lg p-2 text-white focus:outline-none focus:border-brand-yellow"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1">Descripción</label>
                  <textarea
                    rows={2}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-[#2f2f2f] rounded-lg p-2 text-white focus:outline-none focus:border-brand-yellow resize-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1">URL de Imagen</label>
                  <input
                    type="text"
                    value={formData.imagen}
                    onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-[#2f2f2f] rounded-lg p-2 text-white focus:outline-none focus:border-brand-yellow"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1">Etiqueta (opcional)</label>
                  <select
                    value={formData.etiqueta}
                    onChange={(e) => setFormData({ ...formData, etiqueta: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-[#2f2f2f] rounded-lg p-2 text-white focus:outline-none focus:border-brand-yellow"
                  >
                    <option value="">Ninguna</option>
                    <option value="MÁS VENDIDO">MÁS VENDIDO</option>
                    <option value="RECOMENDADO">RECOMENDADO</option>
                    <option value="NUEVO">NUEVO</option>
                    <option value="PICANTE">PICANTE</option>
                    <option value="VEGETARIANA">VEGETARIANA</option>
                    <option value="BBQ">BBQ</option>
                    <option value="INFANTIL">INFANTIL</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-[#222] text-gray-300 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-brand-yellow text-black font-black shadow-glow"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
