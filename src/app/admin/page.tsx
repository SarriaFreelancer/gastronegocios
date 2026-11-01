'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '@/components/ui/Logo';
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
  Phone, 
  Save, 
  ArrowLeft, 
  Check, 
  Users, 
  Lock, 
  LogOut, 
  ShieldCheck, 
  UserPlus, 
  KeyRound, 
  Mail, 
  User as UserIcon,
  Eye,
  EyeOff,
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

interface AdminUser {
  id: string;
  nombre: string;
  email: string;
  rol: 'Administrador' | 'Supervisor' | 'Cajero' | 'Cocinero';
  estado: 'Activo' | 'Inactivo';
  fecha: string;
}

const LOCAL_STORAGE_USERS = 'punto_g_admin_users_v1';
const LOCAL_STORAGE_AUTH = 'punto_g_admin_logged_in';

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState('admin@puntog.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'pedidos' | 'productos' | 'usuarios' | 'configuracion'>('pedidos');
  
  // Users Management State
  const [userList, setUserList] = useState<AdminUser[]>([
    {
      id: 'usr-1',
      nombre: 'David Sarria',
      email: 'admin@puntog.com',
      rol: 'Administrador',
      estado: 'Activo',
      fecha: '2025-01-10',
    },
    {
      id: 'usr-2',
      nombre: 'Carlos Gómez',
      email: 'carlos.caja@puntog.com',
      rol: 'Cajero',
      estado: 'Activo',
      fecha: '2025-02-15',
    },
    {
      id: 'usr-3',
      nombre: 'María Rodríguez',
      email: 'maria.cocina@puntog.com',
      rol: 'Cocinero',
      estado: 'Activo',
      fecha: '2025-03-01',
    },
  ]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userFormData, setUserFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'Cajero' as AdminUser['rol'],
    estado: 'Activo' as AdminUser['estado'],
  });

  // Products State
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedCat, setSelectedCat] = useState('todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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
  ]);

  // Load auth & users from localStorage on client
  useEffect(() => {
    try {
      const auth = localStorage.getItem(LOCAL_STORAGE_AUTH);
      if (auth) {
        setIsAuthenticated(true);
        setCurrentUser(JSON.parse(auth));
      }
      const savedUsers = localStorage.getItem(LOCAL_STORAGE_USERS);
      if (savedUsers) {
        setUserList(JSON.parse(savedUsers));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(userList));
    } catch (e) {
      console.error(e);
    }
  }, [userList]);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Check credentials against registered users
    const matched = userList.find(
      (u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase()
    );

    if ((matched && loginPassword === 'admin123') || (loginEmail === 'admin@puntog.com' && loginPassword === 'admin123')) {
      const user = matched || {
        id: 'usr-admin',
        nombre: 'David Sarria (Admin)',
        email: loginEmail,
        rol: 'Administrador' as const,
        estado: 'Activo' as const,
        fecha: '2025-01-01',
      };
      setIsAuthenticated(true);
      setCurrentUser(user);
      localStorage.setItem(LOCAL_STORAGE_AUTH, JSON.stringify(user));
    } else {
      setLoginError('Credenciales incorrectas. Usa admin@puntog.com y admin123 para ingresar.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem(LOCAL_STORAGE_AUTH);
  };

  // User Actions
  const handleOpenNewUser = () => {
    setEditingUser(null);
    setUserFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'Cajero',
      estado: 'Activo',
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (u: AdminUser) => {
    setEditingUser(u);
    setUserFormData({
      nombre: u.nombre,
      email: u.email,
      password: '',
      rol: u.rol,
      estado: u.estado,
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.nombre || !userFormData.email) return;

    if (editingUser) {
      setUserList((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                nombre: userFormData.nombre,
                email: userFormData.email,
                rol: userFormData.rol,
                estado: userFormData.estado,
              }
            : u
        )
      );
    } else {
      const newUser: AdminUser = {
        id: `usr-${Date.now()}`,
        nombre: userFormData.nombre,
        email: userFormData.email,
        rol: userFormData.rol,
        estado: userFormData.estado,
        fecha: new Date().toISOString().split('T')[0],
      };
      setUserList((prev) => [...prev, newUser]);
    }
    setIsUserModalOpen(false);
  };

  const handleDeleteUser = (id: string) => {
    if (userList.length <= 1) {
      alert('Debe existir al menos un usuario administrador.');
      return;
    }
    if (confirm('¿Seguro que deseas eliminar este usuario?')) {
      setUserList((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const toggleUserStatus = (id: string) => {
    setUserList((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, estado: u.estado === 'Activo' ? 'Inactivo' : 'Activo' } : u
      )
    );
  };

  // Product Actions
  const toggleAvailability = (id: string) => {
    setProductList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, disponibilidad: !p.disponibilidad } : p))
    );
  };

  const deleteProduct = (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este producto del menú?')) {
      setProductList((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: MockOrder['estado']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, estado: newStatus } : o))
    );
  };

  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setFormData({
      nombre: '',
      categoria: 'hamburguesas',
      precio: '',
      descripcion: '',
      imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=900&auto=format&fit=crop',
      etiqueta: '',
      disponibilidad: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
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

  const filteredProducts = productList.filter((p) => {
    const matchesCat = selectedCat === 'todas' || p.categoria === selectedCat;
    const matchesSearch =
      p.nombre.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(searchProduct.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // ==================== LOGIN VIEW ====================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#121212] border border-[#252525] rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle yellow ambient background glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center space-y-3">
            <div className="flex justify-center mb-2">
              <Logo size="lg" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-xs font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>Acceso Administrativo</span>
            </div>
            <h1 className="text-2xl font-black uppercase text-white font-display">
              INICIAR SESIÓN
            </h1>
            <p className="text-xs text-gray-400">
              Ingresa tus credenciales para administrar pedidos, menú y usuarios de Punto G.
            </p>
          </div>

          {loginError && (
            <div className="bg-red-500/20 border border-red-500/40 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-300 font-bold uppercase mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@puntog.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow text-xs"
                />
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 font-bold uppercase mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow text-xs"
                />
                <KeyRound className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Demo access hint */}
            <div className="bg-[#181818] border border-[#2b2b2b] p-3 rounded-xl text-[11px] text-gray-400">
              <span className="font-bold text-brand-yellow block mb-0.5">Credenciales demo:</span>
              <span>Usuario: <strong className="text-white">admin@puntog.com</strong> | Clave: <strong className="text-white">admin123</strong></span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-glow transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-2"
            >
              INGRESAR AL PANEL
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-gray-400 hover:text-brand-yellow transition-colors inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Regresar al restaurante</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==================== DASHBOARD VIEW ====================
  return (
    <div className="min-h-screen bg-[#080808] text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header Row with User Session info & Logout */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#111111] border border-[#242424] rounded-3xl p-6 shadow-xl">
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

          <div className="flex items-center gap-3">
            {/* User Profile Badge */}
            <div className="flex items-center gap-2.5 bg-[#181818] border border-[#2a2a2a] px-3.5 py-2 rounded-xl">
              <div className="w-7 h-7 rounded-full bg-brand-yellow text-black flex items-center justify-center font-bold text-xs">
                {currentUser?.nombre ? currentUser.nombre.charAt(0) : 'A'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-none">
                  {currentUser?.nombre || 'Administrador'}
                </p>
                <span className="text-[10px] text-brand-yellow font-medium">
                  {currentUser?.rol || 'Administrador'}
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>

            {/* Back to store */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#1c1c1c] hover:bg-[#252525] text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-[#333] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Ver Tienda</span>
            </Link>
          </div>
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
              <span>Productos en Menú</span>
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-black text-white font-display">{productList.length} Platos</p>
            <p className="text-[11px] text-gray-400">En 9 categorías activas</p>
          </div>

          <div className="bg-[#121212] border border-[#242424] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase">
              <span>Usuarios del Sistema</span>
              <Users className="w-4 h-4 text-brand-yellow" />
            </div>
            <p className="text-2xl font-black text-white font-display">{userList.length} Registrados</p>
            <p className="text-[11px] text-brand-whatsapp font-semibold">Staff activo</p>
          </div>
        </div>

        {/* Tab Navigation (with New Users Tab) */}
        <div className="flex items-center gap-2 border-b border-[#222] pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('pedidos')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'pedidos'
                ? 'bg-brand-yellow text-black shadow-glow'
                : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Pedidos ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('productos')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'productos'
                ? 'bg-brand-yellow text-black shadow-glow'
                : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Productos ({productList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('usuarios')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'usuarios'
                ? 'bg-brand-yellow text-black shadow-glow'
                : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuarios ({userList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('configuracion')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'configuracion'
                ? 'bg-brand-yellow text-black shadow-glow'
                : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configuración</span>
          </button>
        </div>

        {/* TAB 1: PEDIDOS */}
        {activeTab === 'pedidos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white uppercase font-display">
                Pedidos Recientes de Clientes
              </h2>
              <span className="text-xs text-gray-400">Actualizado en vivo</span>
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
                onClick={handleOpenNewProduct}
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
                              onClick={() => handleOpenEditProduct(p)}
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

        {/* TAB 3: USUARIOS (NUEVO REQUERIMIENTO) */}
        {activeTab === 'usuarios' && (
          <div className="space-y-6">
            <div className="bg-[#121212] border border-[#242424] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold uppercase text-white font-display">
                  Usuarios del Sistema Punto G
                </h2>
                <p className="text-xs text-gray-400">
                  Crea y administra el personal con acceso al panel administrativo y toma de pedidos.
                </p>
              </div>

              <button
                onClick={handleOpenNewUser}
                className="inline-flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs px-5 py-2.5 rounded-xl shadow-glow transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>NUEVO USUARIO</span>
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-[#121212] border border-[#242424] rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#181818] border-b border-[#252525] text-gray-400 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="py-3.5 px-4">Usuario</th>
                      <th className="py-3.5 px-4">Correo Electrónico</th>
                      <th className="py-3.5 px-4">Rol Asignado</th>
                      <th className="py-3.5 px-4">Estado</th>
                      <th className="py-3.5 px-4">Fecha Creación</th>
                      <th className="py-3.5 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e1e]">
                    {userList.map((user) => (
                      <tr key={user.id} className="hover:bg-[#161616] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/40 flex items-center justify-center font-bold">
                              {user.nombre.charAt(0)}
                            </div>
                            <span className="font-bold text-white">{user.nombre}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-300 font-mono text-[11px]">{user.email}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                            user.rol === 'Administrador'
                              ? 'bg-yellow-500/20 text-brand-yellow border border-yellow-500/30'
                              : user.rol === 'Supervisor'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : user.rol === 'Cajero'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          }`}>
                            {user.rol}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                              user.estado === 'Activo'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {user.estado}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-gray-400">{user.fecha}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditUser(user)}
                              className="p-1.5 rounded-lg bg-[#202020] text-gray-300 hover:text-brand-yellow hover:bg-[#282828] transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
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

        {/* TAB 4: CONFIGURACIÓN */}
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

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  value={config.nombre}
                  onChange={(e) => setConfig({ ...config, nombre: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-yellow"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">
                  WhatsApp Oficial para Pedidos (3229088736)
                </label>
                <input
                  type="text"
                  value={config.whatsapp}
                  onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-brand-whatsapp font-bold focus:outline-none focus:border-brand-yellow"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Dirección del Local</label>
                <input
                  type="text"
                  value={config.direccion}
                  onChange={(e) => setConfig({ ...config, direccion: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-yellow"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Horario de Servicio</label>
                <input
                  type="text"
                  value={config.horario}
                  onChange={(e) => setConfig({ ...config, horario: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-yellow"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Costo Domicilio ($ COP)</label>
                <input
                  type="number"
                  value={config.costoEnvio}
                  onChange={(e) => setConfig({ ...config, costoEnvio: Number(e.target.value) })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-yellow"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black uppercase tracking-wider rounded-xl shadow-glow transition-all flex items-center justify-center gap-2"
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

        {/* Modal for User Add / Edit (NUEVO REQUERIMIENTO) */}
        {isUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#141414] border border-[#2c2c2c] rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
              <h3 className="text-lg font-bold uppercase text-white font-display">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario Staff'}
              </h3>

              <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Daniel Restrepo"
                    value={userFormData.nombre}
                    onChange={(e) => setUserFormData({ ...userFormData, nombre: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-[#2f2f2f] rounded-lg p-2 text-white focus:outline-none focus:border-brand-yellow"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    placeholder="daniel@puntog.com"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-[#2f2f2f] rounded-lg p-2 text-white focus:outline-none focus:border-brand-yellow"
                  />
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Contraseña Inicial</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={userFormData.password}
                      onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                      className="w-full bg-[#1e1e1e] border border-[#2f2f2f] rounded-lg p-2 text-white focus:outline-none focus:border-brand-yellow"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Rol</label>
                    <select
                      value={userFormData.rol}
                      onChange={(e) => setUserFormData({ ...userFormData, rol: e.target.value as any })}
                      className="w-full bg-[#1e1e1e] border border-[#2f2f2f] rounded-lg p-2 text-white focus:outline-none focus:border-brand-yellow"
                    >
                      <option value="Administrador">Administrador</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Cajero">Cajero</option>
                      <option value="Cocinero">Cocinero</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Estado</label>
                    <select
                      value={userFormData.estado}
                      onChange={(e) => setUserFormData({ ...userFormData, estado: e.target.value as any })}
                      className="w-full bg-[#1e1e1e] border border-[#2f2f2f] rounded-lg p-2 text-white focus:outline-none focus:border-brand-yellow"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsUserModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-[#222] text-gray-300 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-brand-yellow text-black font-black shadow-glow"
                  >
                    {editingUser ? 'Actualizar' : 'Crear Usuario'}
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
