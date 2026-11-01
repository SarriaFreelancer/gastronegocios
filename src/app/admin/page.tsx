'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '@/components/ui/Logo';
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
  AlertCircle,
  QrCode,
  UtensilsCrossed,
  Heart,
  MessageSquare,
  Calendar,
  ChefHat,
  Filter,
  DollarSign,
  Printer,
  Download,
  Clock,
  MapPin,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Star
} from 'lucide-react';

interface OrderItem {
  id?: number | string;
  nombre: string;
  precio: number;
  cantidad: number;
  notas?: string | null;
}

interface Order {
  id: number | string;
  codigo: string;
  cliente: string;
  telefono: string;
  tipo: 'domicilio' | 'recoger' | 'mesa';
  mesaId?: number | string | null;
  numeroMesa?: string | null;
  direccion?: string | null;
  barrio?: string | null;
  subtotal: number;
  propina: number;
  costoEnvio: number;
  total: number;
  estado: string;
  metodoPago: string;
  notasCliente?: string | null;
  createdAt: string;
  items: OrderItem[];
}

interface RestaurantTable {
  id: number | string;
  numero: string;
  capacidad: number;
  estado: 'Libre' | 'Ocupada' | 'Cuenta_Pedida' | 'Reservada';
  ubicacion?: string | null;
  notas?: string | null;
  orders?: Order[];
}

interface Category {
  id: number | string;
  nombre: string;
  slug: string;
  descripcion?: string | null;
  icono: string;
  imagen?: string | null;
  orden: number;
  activo: boolean;
  _count?: { products: number };
}

interface Product {
  id: number | string;
  nombre: string;
  slug: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria: string;
  etiqueta?: string | null;
  disponibilidad: boolean;
}

interface Review {
  id: number | string;
  clienteNombre: string;
  calificacion: number;
  tipoVisita: string;
  mesaNumero?: string | null;
  comentario: string;
  respuesta?: string | null;
  publicado: boolean;
  createdAt: string;
}

interface AdminUser {
  id: number | string;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
  createdAt?: string;
}

const LOCAL_STORAGE_AUTH = 'punto_g_admin_logged_in';

// Helper to get local date in YYYY-MM-DD
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState('admin@puntog.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'pedidos' | 'mesas' | 'categorias' | 'productos' | 'resenas' | 'usuarios' | 'configuracion'
  >('pedidos');

  // Loading States
  const [isLoading, setIsLoading] = useState(false);

  // ==================== 1. PEDIDOS STATE & FILTERS ====================
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderMetrics, setOrderMetrics] = useState({
    totalVentas: 0,
    totalPropinas: 0,
    totalPedidos: 0,
    ticketPromedio: 0,
  });
  const [activeDatePreset, setActiveDatePreset] = useState<'hoy' | 'ayer' | 'semana' | 'mes' | 'todos'>('hoy');
  const [filterDesde, setFilterDesde] = useState(getTodayDateString());
  const [filterHasta, setFilterHasta] = useState(getTodayDateString());
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterMesa, setFilterMesa] = useState('todas');
  const [searchOrder, setSearchOrder] = useState('');

  // ==================== 2. MESAS STATE ====================
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableFormData, setTableFormData] = useState({
    id: '',
    numero: '',
    capacidad: 4,
    ubicacion: 'Salón Principal',
    notas: '',
  });
  const [selectedTableQr, setSelectedTableQr] = useState<{
    mesa: string;
    orderUrl: string;
    orderQr: string;
    feedbackUrl: string;
    feedbackQr: string;
  } | null>(null);

  // ==================== 3. CATEGORÍAS STATE ====================
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catFormData, setCatFormData] = useState({
    nombre: '',
    slug: '',
    descripcion: '',
    icono: 'Utensils',
    imagen: '',
    orden: 0,
    activo: true,
  });

  // ==================== 4. PRODUCTOS STATE ====================
  const [productList, setProductList] = useState<Product[]>([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedProductCat, setSelectedProductCat] = useState('todas');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState({
    nombre: '',
    categoriaSlug: 'hamburguesas',
    precio: '',
    descripcion: '',
    imagen: '',
    etiqueta: '',
    disponibilidad: true,
  });

  // ==================== 5. RESEÑAS STATE ====================
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replyReviewId, setReplyReviewId] = useState<number | string | null>(null);
  const [replyText, setReplyText] = useState('');

  // ==================== 6. USUARIOS STATE ====================
  const [userList, setUserList] = useState<AdminUser[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userFormData, setUserFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'Cajero',
    estado: 'Activo',
  });

  // ==================== 7. CONFIGURACIÓN STATE ====================
  const [config, setConfig] = useState({
    nombre: 'PUNTO G',
    eslogan: 'ANTOJOS QUE CONECTAN',
    telefonoWhatsapp: '3229088736',
    direccion: 'Calle 9 # 45-12, Barrio Granada, Cali',
    horario: 'Lunes a Domingo: 12:00 m. a 11:30 p.m.',
    costoDomicilioBase: 5000,
    propinaSugeridaPct: 10,
  });
  const [savedSettings, setSavedSettings] = useState(false);

  // Check auth from localStorage
  useEffect(() => {
    try {
      const auth = localStorage.getItem(LOCAL_STORAGE_AUTH);
      if (auth) {
        setIsAuthenticated(true);
        setCurrentUser(JSON.parse(auth));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Fetch initial data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const loadAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchOrders(),
      fetchTables(),
      fetchCategories(),
      fetchProducts(),
      fetchReviews(),
      fetchUsers(),
      fetchConfig(),
    ]);
    setIsLoading(false);
  };

  // ==================== API FETCHERS ====================
  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (filterDesde) params.append('desde', filterDesde);
      if (filterHasta) params.append('hasta', filterHasta);
      if (filterTipo !== 'todos') params.append('tipo', filterTipo);
      if (filterEstado !== 'todos') params.append('estado', filterEstado);
      if (filterMesa !== 'todas') params.append('mesaId', filterMesa);
      if (searchOrder) params.append('search', searchOrder);

      const res = await fetch(`/api/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        if (data.metrics) setOrderMetrics(data.metrics);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables');
      if (res.ok) {
        const data = await res.json();
        setTables(data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategoryList(data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProductList(data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUserList(data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        if (data) setConfig(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Re-fetch orders when filters change
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [filterDesde, filterHasta, filterTipo, filterEstado, filterMesa, searchOrder]);

  // Handle Login via /api/auth/login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        localStorage.setItem(LOCAL_STORAGE_AUTH, JSON.stringify(data.user));
      } else {
        setLoginError(data.error || 'Credenciales inválidas');
      }
    } catch (err) {
      setLoginError('Error de conexión con la base de datos MySQL');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem(LOCAL_STORAGE_AUTH);
  };

  // Quick Date Preset Filters
  const applyDatePreset = (preset: 'hoy' | 'ayer' | 'semana' | 'mes' | 'todos') => {
    setActiveDatePreset(preset);
    const today = new Date();
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (preset === 'hoy') {
      const d = formatDate(today);
      setFilterDesde(d);
      setFilterHasta(d);
    } else if (preset === 'ayer') {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      const d = formatDate(y);
      setFilterDesde(d);
      setFilterHasta(d);
    } else if (preset === 'semana') {
      const w = new Date(today);
      w.setDate(w.getDate() - 7);
      setFilterDesde(formatDate(w));
      setFilterHasta(formatDate(today));
    } else if (preset === 'mes') {
      const m = new Date(today.getFullYear(), today.getMonth(), 1);
      setFilterDesde(formatDate(m));
      setFilterHasta(formatDate(today));
    } else {
      setFilterDesde('');
      setFilterHasta('');
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: number | string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus }),
      });
      if (res.ok) {
        fetchOrders();
        fetchTables();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Release Table
  const handleReleaseTable = async (tableId: number | string) => {
    if (!confirm('¿Deseas cobrar y liberar esta mesa?')) return;
    try {
      const res = await fetch(`/api/tables/${tableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'liberar' }),
      });
      if (res.ok) {
        fetchTables();
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Open Table QR Modal
  const handleOpenTableQr = async (tableId: number | string) => {
    try {
      const res = await fetch(`/api/tables/${tableId}/qr`);
      if (res.ok) {
        const data = await res.json();
        setSelectedTableQr(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save / Update Table
  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tableFormData),
      });
      if (res.ok) {
        setIsTableModalOpen(false);
        setTableFormData({ id: '', numero: '', capacidad: 4, ubicacion: 'Salón Principal', notas: '' });
        fetchTables();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Category Actions
  const handleOpenNewCategory = () => {
    setEditingCat(null);
    setCatFormData({
      nombre: '',
      slug: '',
      descripcion: '',
      icono: 'Utensils',
      imagen: '',
      orden: categoryList.length + 1,
      activo: true,
    });
    setIsCatModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCat(cat);
    setCatFormData({
      nombre: cat.nombre,
      slug: cat.slug,
      descripcion: cat.descripcion || '',
      icono: cat.icono,
      imagen: cat.imagen || '',
      orden: cat.orden,
      activo: cat.activo,
    });
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await fetch(`/api/categories/${editingCat.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(catFormData),
        });
      } else {
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(catFormData),
        });
      }
      setIsCatModalOpen(false);
      fetchCategories();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCategory = async (id: number | string) => {
    if (!confirm('¿Eliminar esta categoría? Los productos asociados podrían verse afectados.')) return;
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      fetchCategories();
    } catch (e) {
      console.error(e);
    }
  };

  // Product Actions
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setProductFormData({
      nombre: '',
      categoriaSlug: categoryList[0]?.slug || 'hamburguesas',
      precio: '',
      descripcion: '',
      imagen: '',
      etiqueta: '',
      disponibilidad: true,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductFormData({
      nombre: p.nombre,
      categoriaSlug: p.categoria,
      precio: String(p.precio),
      descripcion: p.descripcion,
      imagen: p.imagen,
      etiqueta: p.etiqueta || '',
      disponibilidad: p.disponibilidad,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productFormData),
        });
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productFormData),
        });
      }
      setIsProductModalOpen(false);
      fetchProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProduct = async (id: number | string) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (e) {
      console.error(e);
    }
  };

  // Review Actions
  const handleSaveReply = async (reviewId: number | string) => {
    if (!replyText.trim()) return;
    try {
      await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respuesta: replyText.trim() }),
      });
      setReplyReviewId(null);
      setReplyText('');
      fetchReviews();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteReview = async (reviewId: number | string) => {
    if (!confirm('¿Eliminar este comentario?')) return;
    try {
      await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
      fetchReviews();
    } catch (e) {
      console.error(e);
    }
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

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userFormData),
        });
      } else {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userFormData),
        });
      }
      setIsUserModalOpen(false);
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (id: number | string) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  // Save Settings
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      setSavedSettings(true);
      setTimeout(() => setSavedSettings(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const formatPrice = (val: number) => '$' + Number(val || 0).toLocaleString('es-CO');

  // ==================== LOGIN VIEW ====================
  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-[#080808] flex items-center justify-center pt-24 sm:pt-28 pb-12 px-4">
        <div className="w-full max-w-[380px] bg-[#121212] border border-[#252525] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-4 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-brand-yellow/10 rounded-full blur-2xl pointer-events-none" />

          <div className="text-center space-y-2">
            <div className="flex justify-center mb-1">
              <Logo size="sm" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-[10px] font-bold uppercase tracking-wider">
              <Lock className="w-3 h-3" />
              <span>Acceso Administrativo MySQL</span>
            </div>
            <h1 className="text-xl font-black uppercase text-white font-display tracking-wide">
              INICIAR SESIÓN
            </h1>
            <p className="text-[11px] text-gray-400">
              Ingresa tus credenciales para administrar Punto G.
            </p>
          </div>

          {loginError && (
            <div className="bg-red-500/20 border border-red-500/40 text-red-400 text-xs p-2.5 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-gray-300 font-bold uppercase text-[11px] mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@puntog.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow text-xs transition-colors"
                />
                <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 font-bold uppercase text-[11px] mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl pl-9 pr-9 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow text-xs transition-colors"
                />
                <KeyRound className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="bg-[#181818] border border-[#282828] p-2.5 rounded-xl text-[10px] text-gray-400">
              <span className="font-bold text-brand-yellow block">Credenciales demo:</span>
              <span>Usuario: <strong className="text-white">admin@puntog.com</strong> | Clave: <strong className="text-white">admin123</strong></span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-glow transition-all transform hover:scale-[1.01] active:scale-[0.99] mt-1"
            >
              INGRESAR AL PANEL
            </button>
          </form>

          <div className="text-center pt-1">
            <Link href="/" className="text-[11px] text-gray-400 hover:text-brand-yellow transition-colors inline-flex items-center gap-1">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#111111] border border-[#242424] rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-whatsapp animate-ping" />
              <span className="text-[11px] font-bold text-brand-yellow uppercase tracking-wider">
                Sistema Operativo Punto G (MySQL Conectado)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-white font-display">
              ADMINISTRACIÓN DEL RESTAURANTE
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/cocina"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-glow hover:scale-105 active:scale-95"
            >
              <ChefHat className="w-4 h-4" />
              <span>Pantalla Cocina (KDS) 👨‍🍳</span>
            </Link>

            <div className="flex items-center gap-2.5 bg-[#181818] border border-[#2a2a2a] px-3.5 py-1.5 rounded-xl">
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

            <button
              onClick={handleLogout}
              className="p-2 bg-[#1c1c1c] hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-[#2e2e2e] rounded-xl transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#222] scrollbar-none">
          {[
            { id: 'pedidos', label: 'Pedidos & Filtros', icon: ShoppingBag, count: orders.length },
            { id: 'mesas', label: 'Mesas / Comandas (QR)', icon: UtensilsCrossed, count: tables.length },
            { id: 'categorias', label: 'Categorías', icon: Layers, count: categoryList.length },
            { id: 'productos', label: 'Menú & Platos', icon: TrendingUp, count: productList.length },
            { id: 'resenas', label: 'Calificaciones QR', icon: Star, count: reviews.length },
            { id: 'usuarios', label: 'Usuarios / Staff', icon: Users, count: userList.length },
            { id: 'configuracion', label: 'Configuración', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                  active
                    ? 'bg-brand-yellow text-black border-brand-yellow shadow-glow font-black'
                    : 'bg-[#121212] text-gray-400 border-[#222222] hover:text-white hover:bg-[#181818]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      active ? 'bg-black text-brand-yellow' : 'bg-[#222] text-gray-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* TAB 1: PEDIDOS CON FILTROS DE FECHAS, PROPINAS Y MESAS */}
        {/* ======================================================== */}
        {activeTab === 'pedidos' && (
          <div className="space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#121212] border border-[#222] rounded-2xl p-4 space-y-1">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-brand-yellow" />
                  <span>Ventas Período</span>
                </span>
                <p className="text-xl sm:text-2xl font-black text-brand-yellow font-display">
                  {formatPrice(orderMetrics.totalVentas)}
                </p>
                <span className="text-[10px] text-gray-500">Monto total facturado</span>
              </div>

              <div className="bg-[#121212] border border-[#222] rounded-2xl p-4 space-y-1">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-brand-orange fill-brand-orange" />
                  <span>Propinas Recaudadas</span>
                </span>
                <p className="text-xl sm:text-2xl font-black text-white font-display">
                  {formatPrice(orderMetrics.totalPropinas)}
                </p>
                <span className="text-[10px] text-brand-orange">100% para el equipo</span>
              </div>

              <div className="bg-[#121212] border border-[#222] rounded-2xl p-4 space-y-1">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
                  <span>Total Pedidos</span>
                </span>
                <p className="text-xl sm:text-2xl font-black text-white font-display">
                  {orderMetrics.totalPedidos}
                </p>
                <span className="text-[10px] text-gray-500">Órdenes registradas</span>
              </div>

              <div className="bg-[#121212] border border-[#222] rounded-2xl p-4 space-y-1">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                  <span>Ticket Promedio</span>
                </span>
                <p className="text-xl sm:text-2xl font-black text-brand-yellow font-display">
                  {formatPrice(orderMetrics.ticketPromedio)}
                </p>
                <span className="text-[10px] text-gray-500">Promedio por orden</span>
              </div>
            </div>

            {/* Filter Bar with Presets & Date Inputs */}
            <div className="bg-[#121212] border border-[#222] rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-brand-yellow" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Filtros de Pedidos y Fechas
                  </h3>
                </div>

                {/* Quick Date Presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto">
                  <span className="text-[10px] text-gray-500 uppercase font-bold mr-1 hidden sm:inline">
                    Preajustes:
                  </span>
                  {[
                    { id: 'hoy', label: 'Hoy ⚡' },
                    { id: 'ayer', label: 'Ayer' },
                    { id: 'semana', label: '7 Días' },
                    { id: 'mes', label: 'Este Mes' },
                    { id: 'todos', label: 'Histórico' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyDatePreset(p.id as any)}
                      className={`px-3 py-1 border text-[10px] font-black uppercase rounded-lg transition-all ${
                        activeDatePreset === p.id
                          ? 'bg-brand-yellow text-black border-brand-yellow shadow-glow'
                          : 'bg-[#1a1a1a] text-gray-300 border-[#2e2e2e] hover:bg-brand-yellow hover:text-black'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Filter Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                {/* Search */}
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">
                    Buscar cliente / código / cel
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ej: PG-1045, Juan..."
                      value={searchOrder}
                      onChange={(e) => setSearchOrder(e.target.value)}
                      className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl pl-8 pr-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow text-xs"
                    />
                    <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                {/* Tipo de Pedido */}
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">
                    Modalidad
                  </label>
                  <select
                    value={filterTipo}
                    onChange={(e) => setFilterTipo(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-yellow text-xs"
                  >
                    <option value="todos">Todas las modalidades</option>
                    <option value="domicilio">🛵 Domicilio</option>
                    <option value="recoger">🏪 Para Recoger</option>
                    <option value="mesa">🍽️ En Mesa (Comanda)</option>
                  </select>
                </div>

                {/* Mesa Filter */}
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">
                    Filtrar por Mesa
                  </label>
                  <select
                    value={filterMesa}
                    onChange={(e) => setFilterMesa(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-yellow text-xs"
                  >
                    <option value="todas">Todas las mesas</option>
                    {tables.map((t) => (
                      <option key={t.id} value={t.numero}>
                        {t.numero} ({t.ubicacion})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Desde */}
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">
                    Fecha Desde
                  </label>
                  <input
                    type="date"
                    value={filterDesde}
                    onChange={(e) => {
                      setFilterDesde(e.target.value);
                      setActiveDatePreset('todos');
                    }}
                    className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-yellow text-xs"
                  />
                </div>

                {/* Date Hasta */}
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">
                    Fecha Hasta
                  </label>
                  <input
                    type="date"
                    value={filterHasta}
                    onChange={(e) => {
                      setFilterHasta(e.target.value);
                      setActiveDatePreset('todos');
                    }}
                    className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-yellow text-xs"
                  />
                </div>

                {/* Date Hasta */}
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">
                    Fecha Hasta
                  </label>
                  <input
                    type="date"
                    value={filterHasta}
                    onChange={(e) => setFilterHasta(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-yellow text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Orders List */}
            {orders.length === 0 ? (
              <div className="bg-[#121212] border border-[#222] rounded-2xl p-12 text-center text-gray-500">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40 text-brand-yellow" />
                <p className="text-sm font-bold text-gray-300">No se encontraron pedidos con estos filtros</p>
                <p className="text-xs text-gray-500 mt-1">Prueba seleccionando otro rango de fechas o modalidad.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="bg-[#121212] border border-[#242424] hover:border-brand-yellow/40 rounded-2xl p-4 sm:p-5 space-y-3 transition-colors"
                  >
                    {/* Top Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#202020]">
                      <div className="flex items-center gap-3">
                        <span className="text-base sm:text-lg font-black text-brand-yellow font-display">
                          #{o.codigo}
                        </span>
                        
                        {/* Tipo Badge */}
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            o.tipo === 'mesa'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : o.tipo === 'domicilio'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {o.tipo === 'mesa' ? `🍽️ ${o.numeroMesa || 'En Mesa'}` : o.tipo === 'domicilio' ? '🛵 Domicilio' : '🏪 Recoger'}
                        </span>

                        <span className="text-[11px] text-gray-400">
                          {new Date(o.createdAt).toLocaleString('es-CO', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Estado:</span>
                        <select
                          value={o.estado}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                          className={`text-xs font-black uppercase px-3 py-1.5 rounded-xl border focus:outline-none transition-colors ${
                            o.estado === 'Pendiente'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : o.estado === 'En Preparación'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              : o.estado === 'Listo'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : o.estado === 'Despachado'
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                              : o.estado === 'Entregado'
                              ? 'bg-green-500/20 text-green-300 border-green-500/40'
                              : 'bg-red-500/20 text-red-300 border-red-500/40'
                          }`}
                        >
                          <option value="Pendiente">🟡 Pendiente</option>
                          <option value="En Preparación">🔵 En Preparación</option>
                          <option value="Listo">🟢 Listo para Entrega</option>
                          <option value="Despachado">🟣 En Camino / Despachado</option>
                          <option value="Entregado">✅ Entregado</option>
                          <option value="Cancelado">❌ Cancelado</option>
                        </select>
                      </div>
                    </div>

                    {/* Customer & Address Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase font-bold block">Cliente:</span>
                        <span className="font-bold text-white">{o.cliente}</span>
                        <span className="text-gray-400 block text-[11px]">{o.telefono}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase font-bold block">
                          {o.tipo === 'mesa' ? 'Ubicación Mesa:' : 'Dirección:'}
                        </span>
                        <span className="text-gray-300">
                          {o.tipo === 'mesa'
                            ? `${o.numeroMesa || 'Mesa en restaurante'}`
                            : o.direccion || 'Recoge en restaurante'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase font-bold block">Método de Pago:</span>
                        <span className="font-bold text-brand-yellow">{o.metodoPago}</span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-[#181818] rounded-xl p-3 space-y-1.5 text-xs">
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Productos:</span>
                      {o.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-gray-300">
                          <span>
                            <strong className="text-brand-yellow">{item.cantidad}x</strong> {item.nombre}
                            {item.notas && <span className="text-[10px] text-gray-400 italic ml-1.5">({item.notas})</span>}
                          </span>
                          <span className="font-medium text-white">{formatPrice(item.precio * item.cantidad)}</span>
                        </div>
                      ))}

                      {o.notasCliente && (
                        <div className="mt-2 pt-2 border-t border-[#252525] text-[11px] text-amber-300/90 italic">
                          💬 Observación cliente: "{o.notasCliente}"
                        </div>
                      )}
                    </div>

                    {/* Breakdown & Totals */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                      <div className="flex items-center gap-4 text-gray-400 text-[11px]">
                        <span>Subtotal: {formatPrice(o.subtotal)}</span>
                        {o.costoEnvio > 0 && <span>Envío: {formatPrice(o.costoEnvio)}</span>}
                        {o.propina > 0 && (
                          <span className="text-brand-orange font-bold flex items-center gap-1">
                            <Heart className="w-3 h-3 fill-brand-orange" />
                            Propina: {formatPrice(o.propina)}
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-gray-400 mr-2">Total Orden:</span>
                        <span className="text-base sm:text-lg font-black text-brand-yellow font-display">
                          {formatPrice(o.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MESAS / COMANDAS Y GENERACIÓN DE QR               */}
        {/* ======================================================== */}
        {activeTab === 'mesas' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black uppercase text-white font-display">
                  MÓDULO DE MESAS Y COMANDAS EN SITIO
                </h3>
                <p className="text-xs text-gray-400">
                  Monitorea mesas en tiempo real, genera códigos QR para pedidos automáticos y califica el servicio.
                </p>
              </div>

              <button
                onClick={() => setIsTableModalOpen(true)}
                className="px-4 py-2.5 bg-brand-yellow hover:bg-brand-yellowHover text-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-glow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Nueva Mesa</span>
              </button>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {tables.map((t) => {
                const activeOrder = t.orders && t.orders[0];
                const isOccupied = t.estado === 'Ocupada' || !!activeOrder;

                return (
                  <div
                    key={t.id}
                    className={`bg-[#121212] border rounded-2xl p-5 space-y-4 transition-all relative overflow-hidden ${
                      isOccupied ? 'border-brand-yellow/60 shadow-[0_0_15px_rgba(255,201,40,0.15)]' : 'border-[#222]'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                            isOccupied ? 'bg-brand-yellow text-black' : 'bg-[#1e1e1e] text-gray-300'
                          }`}
                        >
                          <UtensilsCrossed className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white uppercase">{t.numero}</h4>
                          <span className="text-[10px] text-gray-500">{t.ubicacion || 'Salón'} • {t.capacidad} puestos</span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isOccupied
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {isOccupied ? '🔴 Ocupada' : '🟢 Libre'}
                      </span>
                    </div>

                    {/* Active Order Details */}
                    {activeOrder ? (
                      <div className="bg-[#181818] rounded-xl p-3 space-y-2 text-xs">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-white">Comanda: #{activeOrder.codigo}</span>
                          <span className="text-brand-yellow font-black">{formatPrice(activeOrder.total)}</span>
                        </div>
                        <p className="text-[10px] text-gray-400">Cliente: {activeOrder.cliente}</p>
                        <p className="text-[10px] text-gray-400">
                          {activeOrder.items?.length || 0} platos • Estado: <strong className="text-white">{activeOrder.estado}</strong>
                        </p>
                        {activeOrder.propina > 0 && (
                          <p className="text-[10px] text-brand-orange font-bold">
                            Propina: {formatPrice(activeOrder.propina)}
                          </p>
                        )}
                        <button
                          onClick={() => handleReleaseTable(t.id)}
                          className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors"
                        >
                          Cobrar y Liberar Mesa
                        </button>
                      </div>
                    ) : (
                      <div className="py-4 text-center text-xs text-gray-500">
                        <span>Sin comanda activa</span>
                      </div>
                    )}

                    {/* Table Actions */}
                    <div className="pt-2 border-t border-[#1e1e1e] flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenTableQr(t.id)}
                        className="flex-1 py-1.5 bg-[#1c1c1c] hover:bg-brand-yellow hover:text-black text-gray-300 text-[11px] font-bold rounded-lg border border-[#2c2c2c] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Ver Códigos QR</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: CATEGORÍAS (CRUD COMPLETO)                        */}
        {/* ======================================================== */}
        {activeTab === 'categorias' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black uppercase text-white font-display">
                  GESTIÓN DE CATEGORÍAS DEL MENÚ
                </h3>
                <p className="text-xs text-gray-400">
                  Crea, modifica o reordena las categorías principales de la tienda en MySQL.
                </p>
              </div>

              <button
                onClick={handleOpenNewCategory}
                className="px-4 py-2.5 bg-brand-yellow hover:bg-brand-yellowHover text-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-glow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Categoría</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryList.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-[#121212] border border-[#222] hover:border-brand-yellow/50 rounded-2xl p-5 space-y-4 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-gray-500 uppercase">
                        Orden #{cat.orden}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          cat.activo ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {cat.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-white uppercase font-display">
                      {cat.nombre}
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {cat.descripcion || 'Sin descripción'}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-brand-yellow">
                      <span>Slug: <code>/menu/{cat.slug}</code></span>
                      {cat._count?.products !== undefined && (
                        <span className="text-gray-400">• {cat._count.products} platos</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1e1e1e] flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditCategory(cat)}
                      className="p-2 bg-[#1a1a1a] hover:bg-[#252525] text-gray-300 hover:text-white rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-2 bg-[#1a1a1a] hover:bg-red-500/20 text-gray-300 hover:text-red-400 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: PRODUCTOS (MENÚ Y PLATOS)                         */}
        {/* ======================================================== */}
        {activeTab === 'productos' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black uppercase text-white font-display">
                  PLATOS Y PRODUCTOS ({productList.length})
                </h3>
                <p className="text-xs text-gray-400">
                  Administra precios, descripciones, fotos y disponibilidad en tiempo real.
                </p>
              </div>

              <button
                onClick={handleOpenNewProduct}
                className="px-4 py-2.5 bg-brand-yellow hover:bg-brand-yellowHover text-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-glow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Producto</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Buscar por nombre o ingrediente..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="w-full bg-[#141414] border border-[#252525] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow"
                />
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              </div>

              <select
                value={selectedProductCat}
                onChange={(e) => setSelectedProductCat(e.target.value)}
                className="bg-[#141414] border border-[#252525] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-yellow"
              >
                <option value="todas">Todas las categorías</option>
                {categoryList.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {productList
                .filter((p) => {
                  const matchesCat = selectedProductCat === 'todas' || p.categoria === selectedProductCat;
                  const matchesSearch =
                    p.nombre.toLowerCase().includes(searchProduct.toLowerCase()) ||
                    p.descripcion.toLowerCase().includes(searchProduct.toLowerCase());
                  return matchesCat && matchesSearch;
                })
                .map((p) => (
                  <div
                    key={p.id}
                    className="bg-[#121212] border border-[#222] hover:border-brand-yellow/40 rounded-2xl p-4 space-y-3 transition-colors flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="relative w-full h-40 rounded-xl overflow-hidden bg-[#1e1e1e]">
                        <Image src={p.imagen} alt={p.nombre} fill className="object-cover" />
                        {p.etiqueta && (
                          <span className="absolute top-2 left-2 bg-brand-yellow text-black text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
                            {p.etiqueta}
                          </span>
                        )}
                        <span
                          className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded ${
                            p.disponibilidad ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'
                          }`}
                        >
                          {p.disponibilidad ? 'Disponible' : 'Agotado'}
                        </span>
                      </div>

                      <div>
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-sm font-bold text-white truncate">{p.nombre}</h4>
                          <span className="text-sm font-black text-brand-yellow ml-2">
                            {formatPrice(p.precio)}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500 uppercase">{p.categoria}</span>
                        <p className="text-xs text-gray-400 line-clamp-2 mt-1">{p.descripcion}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#1e1e1e] flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditProduct(p)}
                        className="p-2 bg-[#1a1a1a] hover:bg-[#252525] text-gray-300 hover:text-white rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-2 bg-[#1a1a1a] hover:bg-red-500/20 text-gray-300 hover:text-red-400 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: RESEÑAS Y CALIFICACIONES CON QR                   */}
        {/* ======================================================== */}
        {activeTab === 'resenas' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black uppercase text-white font-display">
                  COMENTARIOS Y CALIFICACIONES DE CLIENTES ({reviews.length})
                </h3>
                <p className="text-xs text-gray-400">
                  Opiniones dejadas por clientes escaneando el código QR en mesa o desde la web.
                </p>
              </div>

              <Link
                href="/calificar"
                target="_blank"
                className="px-4 py-2.5 bg-[#1c1c1c] hover:bg-[#252525] text-white border border-[#2e2e2e] rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4 text-brand-yellow" />
                <span>Abrir Página Pública de Reseñas</span>
              </Link>
            </div>

            <div className="grid gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-[#121212] border border-[#222] rounded-2xl p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white">{rev.clienteNombre}</h4>
                      <span className="text-[11px] text-gray-500">
                        {rev.tipoVisita} {rev.mesaNumero ? `• ${rev.mesaNumero}` : ''} •{' '}
                        {new Date(rev.createdAt).toLocaleDateString('es-CO')}
                      </span>
                    </div>

                    <div className="flex items-center text-brand-yellow">
                      {[...Array(rev.calificacion)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-brand-yellow" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 italic bg-[#181818] p-3 rounded-xl border border-[#222]">
                    "{rev.comentario}"
                  </p>

                  {rev.respuesta && (
                    <div className="bg-[#1a1a1a] border-l-2 border-brand-yellow p-3 rounded-r-xl text-xs text-gray-300">
                      <strong className="text-brand-yellow block text-[11px]">Respuesta de Punto G:</strong>
                      {rev.respuesta}
                    </div>
                  )}

                  {replyReviewId === rev.id ? (
                    <div className="space-y-2 pt-2">
                      <textarea
                        rows={2}
                        placeholder="Escribe la respuesta oficial del restaurante..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-yellow resize-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setReplyReviewId(null)}
                          className="px-3 py-1.5 bg-[#252525] text-gray-300 rounded-lg text-xs"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleSaveReply(rev.id)}
                          className="px-3 py-1.5 bg-brand-yellow text-black font-bold rounded-lg text-xs"
                        >
                          Guardar Respuesta
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => {
                          setReplyReviewId(rev.id);
                          setReplyText(rev.respuesta || '');
                        }}
                        className="px-3 py-1.5 bg-[#1e1e1e] hover:bg-[#282828] text-gray-300 text-xs font-bold rounded-lg transition-colors"
                      >
                        {rev.respuesta ? 'Editar Respuesta' : 'Responder'}
                      </button>
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                        title="Eliminar comentario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: USUARIOS / STAFF                                  */}
        {/* ======================================================== */}
        {activeTab === 'usuarios' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black uppercase text-white font-display">
                  GESTIÓN DE USUARIOS Y ROLES ({userList.length})
                </h3>
                <p className="text-xs text-gray-400">
                  Controla accesos para administradores, cajeros, cocina y meseros en MySQL.
                </p>
              </div>

              <button
                onClick={handleOpenNewUser}
                className="px-4 py-2.5 bg-brand-yellow hover:bg-brand-yellowHover text-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-glow transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Crear Nuevo Usuario</span>
              </button>
            </div>

            <div className="bg-[#121212] border border-[#222] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#181818] text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-[#222]">
                    <tr>
                      <th className="p-4">Nombre</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Rol</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e1e]">
                    {userList.map((u) => (
                      <tr key={u.id} className="hover:bg-[#161616] transition-colors">
                        <td className="p-4 font-bold text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-yellow/20 text-brand-yellow flex items-center justify-center font-bold text-xs">
                            {u.nombre.charAt(0)}
                          </div>
                          <span>{u.nombre}</span>
                        </td>
                        <td className="p-4 text-gray-400">{u.email}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1e1e1e] text-brand-yellow border border-[#2d2d2d]">
                            {u.rol}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.estado === 'Activo'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}
                          >
                            {u.estado}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: CONFIGURACIÓN                                     */}
        {/* ======================================================== */}
        {activeTab === 'configuracion' && (
          <div className="max-w-2xl bg-[#121212] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-black uppercase text-white font-display">
                CONFIGURACIÓN DEL RESTAURANTE
              </h3>
              <p className="text-xs text-gray-400">
                Ajusta teléfonos, propinas sugeridas y costo de domicilio en MySQL.
              </p>
            </div>

            {savedSettings && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Configuración guardada exitosamente en la base de datos MySQL.</span>
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  value={config.nombre}
                  onChange={(e) => setConfig({ ...config, nombre: e.target.value })}
                  className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-yellow text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">WhatsApp de Pedidos</label>
                <input
                  type="text"
                  value={config.telefonoWhatsapp}
                  onChange={(e) => setConfig({ ...config, telefonoWhatsapp: e.target.value })}
                  className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-yellow text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Dirección del Restaurante</label>
                <input
                  type="text"
                  value={config.direccion}
                  onChange={(e) => setConfig({ ...config, direccion: e.target.value })}
                  className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-yellow text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Horario de Atención</label>
                <input
                  type="text"
                  value={config.horario}
                  onChange={(e) => setConfig({ ...config, horario: e.target.value })}
                  className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-yellow text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Costo Domicilio Base (COP)</label>
                  <input
                    type="number"
                    value={config.costoDomicilioBase}
                    onChange={(e) => setConfig({ ...config, costoDomicilioBase: Number(e.target.value) })}
                    className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-yellow text-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Propina Sugerida (%)</label>
                  <input
                    type="number"
                    value={config.propinaSugeridaPct}
                    onChange={(e) => setConfig({ ...config, propinaSugeridaPct: Number(e.target.value) })}
                    className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-yellow text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-glow transition-all"
              >
                GUARDAR CAMBIOS EN BD
              </button>
            </form>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL: QR CODES DE MESA (PEDIDO + RESEÑA)                */}
      {/* ======================================================== */}
      {selectedTableQr && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative">
            <div className="flex justify-between items-center pb-3 border-b border-[#252525]">
              <div>
                <span className="text-[10px] font-black uppercase text-brand-yellow tracking-wider">
                  Códigos QR Oficiales
                </span>
                <h3 className="text-xl font-black text-white uppercase font-display">
                  {selectedTableQr.mesa}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTableQr(null)}
                className="text-gray-400 hover:text-white p-2"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* QR 1: Pedir en Mesa */}
              <div className="bg-[#1b1b1b] border border-[#282828] rounded-2xl p-4 text-center space-y-2">
                <span className="text-[10px] font-black uppercase text-brand-yellow block">
                  🍔 Para Pedir en Mesa
                </span>
                <div className="bg-white p-2 rounded-xl inline-block">
                  <img src={selectedTableQr.orderQr} alt="QR Pedido" className="w-36 h-36" />
                </div>
                <p className="text-[10px] text-gray-400">
                  El cliente escanea y abre el menú con la {selectedTableQr.mesa} preseleccionada.
                </p>
                <a
                  href={selectedTableQr.orderQr}
                  download={`QR_Pedido_${selectedTableQr.mesa}.png`}
                  className="w-full py-1.5 bg-[#252525] hover:bg-[#333] text-white text-[10px] font-bold rounded-lg inline-flex items-center justify-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Descargar PNG</span>
                </a>
              </div>

              {/* QR 2: Calificar en Sitio */}
              <div className="bg-[#1b1b1b] border border-[#282828] rounded-2xl p-4 text-center space-y-2">
                <span className="text-[10px] font-black uppercase text-brand-orange block">
                  ⭐ Para Calificar el Servicio
                </span>
                <div className="bg-white p-2 rounded-xl inline-block">
                  <img src={selectedTableQr.feedbackQr} alt="QR Reseña" className="w-36 h-36" />
                </div>
                <p className="text-[10px] text-gray-400">
                  El cliente califica la comida y atención directo desde la mesa.
                </p>
                <a
                  href={selectedTableQr.feedbackQr}
                  download={`QR_Resena_${selectedTableQr.mesa}.png`}
                  className="w-full py-1.5 bg-[#252525] hover:bg-[#333] text-white text-[10px] font-bold rounded-lg inline-flex items-center justify-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Descargar PNG</span>
                </a>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-3 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-glow transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>IMPRIMIR FICHA DE MESA CON CÓDIGOS QR</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREAR MESA                                        */}
      {/* ======================================================== */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-black uppercase text-white font-display">
              CREAR NUEVA MESA
            </h3>
            <form onSubmit={handleSaveTable} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Nombre / Número de Mesa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Mesa 9, Terraza 3, Barra 4"
                  value={tableFormData.numero}
                  onChange={(e) => setTableFormData({ ...tableFormData, numero: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Capacidad de Personas</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={tableFormData.capacidad}
                  onChange={(e) => setTableFormData({ ...tableFormData, capacidad: Number(e.target.value) })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Ubicación</label>
                <select
                  value={tableFormData.ubicacion}
                  onChange={(e) => setTableFormData({ ...tableFormData, ubicacion: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-white text-xs"
                >
                  <option value="Salón Principal">Salón Principal</option>
                  <option value="Terraza">Terraza</option>
                  <option value="Barra">Barra</option>
                  <option value="Salón VIP">Salón VIP</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTableModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#202020] text-gray-400 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-yellow text-black font-black uppercase rounded-xl"
                >
                  Guardar Mesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CATEGORÍA                                         */}
      {/* ======================================================== */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-black uppercase text-white font-display">
              {editingCat ? 'EDITAR CATEGORÍA' : 'NUEVA CATEGORÍA'}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Hamburguesas Artesanales"
                  value={catFormData.nombre}
                  onChange={(e) => setCatFormData({ ...catFormData, nombre: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Descripción breve..."
                  value={catFormData.descripcion}
                  onChange={(e) => setCatFormData({ ...catFormData, descripcion: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2 text-white text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">URL Fotografía</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={catFormData.imagen}
                  onChange={(e) => setCatFormData({ ...catFormData, imagen: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Orden</label>
                  <input
                    type="number"
                    value={catFormData.orden}
                    onChange={(e) => setCatFormData({ ...catFormData, orden: Number(e.target.value) })}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Estado</label>
                  <select
                    value={catFormData.activo ? 'true' : 'false'}
                    onChange={(e) => setCatFormData({ ...catFormData, activo: e.target.value === 'true' })}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white text-xs"
                  >
                    <option value="true">Activa</option>
                    <option value="false">Inactiva</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#202020] text-gray-400 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-yellow text-black font-black uppercase rounded-xl"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PRODUCTO                                          */}
      {/* ======================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-black uppercase text-white font-display">
              {editingProduct ? 'EDITAR PRODUCTO' : 'AGREGAR PRODUCTO'}
            </h3>
            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Hamburguesa Suprema"
                  value={productFormData.nombre}
                  onChange={(e) => setProductFormData({ ...productFormData, nombre: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Categoría</label>
                  <select
                    value={productFormData.categoriaSlug}
                    onChange={(e) => setProductFormData({ ...productFormData, categoriaSlug: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white text-xs"
                  >
                    {categoryList.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Precio (COP) *</label>
                  <input
                    type="number"
                    required
                    placeholder="25000"
                    value={productFormData.precio}
                    onChange={(e) => setProductFormData({ ...productFormData, precio: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Ingredientes, términos..."
                  value={productFormData.descripcion}
                  onChange={(e) => setProductFormData({ ...productFormData, descripcion: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2 text-white text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">URL Imagen</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={productFormData.imagen}
                  onChange={(e) => setProductFormData({ ...productFormData, imagen: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Etiqueta</label>
                  <input
                    type="text"
                    placeholder="MÁS VENDIDO, NUEVO..."
                    value={productFormData.etiqueta}
                    onChange={(e) => setProductFormData({ ...productFormData, etiqueta: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Disponibilidad</label>
                  <select
                    value={productFormData.disponibilidad ? 'true' : 'false'}
                    onChange={(e) => setProductFormData({ ...productFormData, disponibilidad: e.target.value === 'true' })}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white text-xs"
                  >
                    <option value="true">Disponible</option>
                    <option value="false">Agotado</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#202020] text-gray-400 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-yellow text-black font-black uppercase rounded-xl"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: USUARIO                                           */}
      {/* ======================================================== */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-black uppercase text-white font-display">
              CREAR USUARIO / STAFF
            </h3>
            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laura Castro"
                  value={userFormData.nombre}
                  onChange={(e) => setUserFormData({ ...userFormData, nombre: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  placeholder="laura@puntog.com"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Contraseña *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Rol</label>
                  <select
                    value={userFormData.rol}
                    onChange={(e) => setUserFormData({ ...userFormData, rol: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white text-xs"
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Cajero">Cajero</option>
                    <option value="Cocinero">Cocinero</option>
                    <option value="Mesero">Mesero</option>
                    <option value="Supervisor">Supervisor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Estado</label>
                  <select
                    value={userFormData.estado}
                    onChange={(e) => setUserFormData({ ...userFormData, estado: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white text-xs"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#202020] text-gray-400 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-yellow text-black font-black uppercase rounded-xl"
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
