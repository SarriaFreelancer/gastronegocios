'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
  AlertTriangle,
  Power,
  QrCode,
  UtensilsCrossed,
  Bell,
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
  Star,
  Sparkles,
  Receipt,
  Wallet,
  Coins,
  FileText,
  FileSpreadsheet,
  BarChart3,
  PieChart,
  MessageCircle,
  Bike,
  Send,
  FolderTree,
  GitFork,
  Building2,
  BellRing,
  X
} from 'lucide-react';
import { ThermalReceiptModal } from '@/components/pos/ThermalReceiptModal';
import { ProductAddon } from '@/types';
import { exportSalesReportToExcel, exportSalesReportToPDF } from '@/lib/reports';
import { showConfirm, showAlert, showSuccess, showError, showWarning } from '@/lib/swal';

interface OrderItem {
  id?: number | string;
  nombre: string;
  precio: number;
  cantidad: number;
  notas?: string | null;
  adicionales?: string | null;
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
  repartidor?: string | null;
  repartidorTel?: string | null;
  branchId?: number | null;
  sedeNombre?: string | null;
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
  branchId?: number | null;
  branch?: { id: number; nombre: string; slug: string } | null;
  llamandoMesero?: boolean;
  llamadoEn?: string | null;
  solicitudCuenta?: boolean;
  solicitudCuentaEn?: string | null;
  metodoPagoCuenta?: string | null;
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
  parentId?: number | string | null;
  parent?: { id: number | string; nombre: string; slug: string } | null;
  children?: Category[];
  _count?: { products?: number; subProducts?: number; children?: number };
}

interface Product {
  id: number | string;
  nombre: string;
  slug: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria: string;
  categoriaId?: number;
  categoriaNombre?: string;
  subcategoria?: string | null;
  subcategoriaId?: number | null;
  subcategoriaNombre?: string | null;
  etiqueta?: string | null;
  disponibilidad: boolean;
  costo?: number | null;
  stock?: number | null;
  stockMinimo?: number | null;
  controlarStock?: boolean;
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

interface Branch {
  id: number;
  nombre: string;
  slug: string;
  direccion?: string | null;
  telefono?: string | null;
  ciudad: string;
  activo: boolean;
}

interface AdminUser {
  id: number | string;
  nombre: string;
  email: string;
  password?: string;
  rol: string;
  estado: string;
  branchId?: number | null;
  branch?: { id: number; nombre: string; slug: string } | null;
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
  const router = useRouter();
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState('admin@puntog.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'pedidos' | 'reportes' | 'caja' | 'toppings' | 'mesas' | 'categorias' | 'subcategorias' | 'productos' | 'resenas' | 'usuarios' | 'sedes' | 'configuracion'
  >('pedidos');

  // Loading States
  const [isLoading, setIsLoading] = useState(false);

  // ==================== 0. MULTI-SEDE STATE ====================
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');

  // ==================== 1. PEDIDOS STATE & FILTERS ====================
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderMetrics, setOrderMetrics] = useState({
    totalVentas: 0,
    totalPropinas: 0,
    totalPedidos: 0,
    ticketPromedio: 0,
  });
  const [activeDatePreset, setActiveDatePreset] = useState<'hoy' | 'ayer' | 'semana' | 'mes' | 'mes_ant' | 'ano' | 'todos'>('hoy');
  const [filterDesde, setFilterDesde] = useState(getTodayDateString());
  const [filterHasta, setFilterHasta] = useState(getTodayDateString());
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterMetodoPago, setFilterMetodoPago] = useState('todos');
  const [filterMesa, setFilterMesa] = useState('todas');
  const [searchOrder, setSearchOrder] = useState('');

  // Orders Table View & Pagination
  const [ordersViewMode, setOrdersViewMode] = useState<'tabla' | 'tarjetas'>('tabla');
  const [ordersPage, setOrdersPage] = useState<number>(1);
  const [ordersPerPage, setOrdersPerPage] = useState<number>(10);
  const [showInventorySummary, setShowInventorySummary] = useState(false);

  // Derived calculations for Orders & Inventory Sales
  const productSalesSummary = useMemo(() => {
    const map: Record<string, { nombre: string; cantidad: number; total: number }> = {};
    orders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const key = item.nombre;
        if (!map[key]) {
          map[key] = { nombre: item.nombre, cantidad: 0, total: 0 };
        }
        map[key].cantidad += item.cantidad;
        map[key].total += item.precio * item.cantidad;
      });
    });
    return Object.values(map).sort((a, b) => b.cantidad - a.cantidad);
  }, [orders]);

  const totalItemsSold = useMemo(() => {
    return productSalesSummary.reduce((sum, p) => sum + p.cantidad, 0);
  }, [productSalesSummary]);

  // Derived Payment breakdown for report analytics
  const reportPaymentBreakdown = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    orders.forEach((o) => {
      const m = o.metodoPago || 'Efectivo';
      if (!map[m]) map[m] = { count: 0, total: 0 };
      map[m].count += 1;
      map[m].total += Number(o.total || 0);
    });
    return Object.entries(map)
      .map(([metodo, data]) => ({
        metodo,
        count: data.count,
        total: data.total,
        pct: orderMetrics.totalVentas > 0 ? (data.total / orderMetrics.totalVentas) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [orders, orderMetrics.totalVentas]);

  // Derived Delivery type breakdown for report analytics
  const reportTypeBreakdown = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    orders.forEach((o) => {
      const t = o.tipo === 'mesa' ? 'En Mesa (Comanda)' : o.tipo === 'domicilio' ? 'Domicilio' : 'Para Llevar / Retiro';
      if (!map[t]) map[t] = { count: 0, total: 0 };
      map[t].count += 1;
      map[t].total += Number(o.total || 0);
    });
    return Object.entries(map)
      .map(([tipo, data]) => ({
        tipo,
        count: data.count,
        total: data.total,
        pct: orderMetrics.totalVentas > 0 ? (data.total / orderMetrics.totalVentas) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [orders, orderMetrics.totalVentas]);

  const totalOrderPages = Math.ceil(orders.length / ordersPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (ordersPage - 1) * ordersPerPage;
    return orders.slice(start, start + ordersPerPage);
  }, [orders, ordersPage, ordersPerPage]);

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
  const [searchCategory, setSearchCategory] = useState('');
  const [filterCategoryStatus, setFilterCategoryStatus] = useState<'todas' | 'activas' | 'inactivas'>('todas');
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
    parentId: '',
  });

  // ==================== 3.1 SUBCATEGORÍAS STATE ====================
  const [searchSubcat, setSearchSubcat] = useState('');
  const [filterSubcatStatus, setFilterSubcatStatus] = useState<'todas' | 'activas' | 'inactivas'>('todas');
  const [filterSubcatParent, setFilterSubcatParent] = useState<string>('todas');
  const [isSubcatModalOpen, setIsSubcatModalOpen] = useState(false);
  const [editingSubcat, setEditingSubcat] = useState<Category | null>(null);
  const [subcatFormData, setSubcatFormData] = useState({
    nombre: '',
    slug: '',
    descripcion: '',
    icono: 'Utensils',
    imagen: '',
    orden: 0,
    activo: true,
    parentId: '',
  });

  // ==================== 4. PRODUCTOS STATE ====================
  const [productList, setProductList] = useState<Product[]>([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [filterProductStatus, setFilterProductStatus] = useState<'todos' | 'activos' | 'inactivos'>('todos');
  const [selectedProductCat, setSelectedProductCat] = useState('todas');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState({
    nombre: '',
    categoriaSlug: 'comidas-rapidas',
    subcategoriaSlug: '',
    precio: '',
    costo: '',
    descripcion: '',
    imagen: '',
    etiqueta: '',
    disponibilidad: true,
    controlarStock: false,
    stock: '',
    stockMinimo: '5',
  });

  // ==================== 5. RESEÑAS STATE ====================
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replyReviewId, setReplyReviewId] = useState<number | string | null>(null);
  const [replyText, setReplyText] = useState('');

  // ==================== 6. USUARIOS STATE ====================
  const [userList, setUserList] = useState<AdminUser[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userFormData, setUserFormData] = useState<{
    nombre: string;
    email: string;
    password: string;
    rol: string;
    estado: string;
    branchId: number | null;
  }>({
    nombre: '',
    email: '',
    password: '',
    rol: 'Cajero',
    estado: 'Activo',
    branchId: null,
  });
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string | number, boolean>>({});
  const [showUserModalPassword, setShowUserModalPassword] = useState(false);

  // ==================== 6.1 SEDES / SUCURSALES STATE ====================
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchFormData, setBranchFormData] = useState({
    nombre: '',
    slug: '',
    direccion: '',
    telefono: '',
    ciudad: 'Cali',
    activo: true,
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

  // ==================== 8. CAJA & TURNOS STATE ====================
  const [activeShift, setActiveShift] = useState<any | null>(null);
  const [shiftHistory, setShiftHistory] = useState<any[]>([]);
  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState(false);
  const [openShiftData, setOpenShiftData] = useState({ cajero: 'Admin', baseInicial: 100000, notas: '' });
  const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false);
  const [closeShiftData, setCloseShiftData] = useState({ efectivoReal: '', notas: '' });
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseFormData, setExpenseFormData] = useState({ descripcion: '', monto: '', categoria: 'Insumos' });

  // ==================== 9. TOPPINGS & ADICIONALES STATE ====================
  const [addonsList, setAddonsList] = useState<ProductAddon[]>([]);
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<ProductAddon | null>(null);
  const [addonFormData, setAddonFormData] = useState({
    nombre: '',
    precio: '',
    categoria: 'Toppings',
    activo: true,
  });

  // ==================== 10. THERMAL RECEIPT STATE ====================
  const [receiptOrder, setReceiptOrder] = useState<any | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptType, setReceiptType] = useState<'factura' | 'comanda'>('factura');

  const openReceipt = (order: any, type: 'factura' | 'comanda' = 'factura') => {
    setReceiptOrder(order);
    setReceiptType(type);
    setIsReceiptModalOpen(true);
  };

  const notifyCustomerWhatsApp = (order: Order) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3005';
    const cleanPhone = (order.telefono || '').replace(/\D/g, '');
    const phone = cleanPhone.length === 10 ? `57${cleanPhone}` : cleanPhone;
    const msg = `¡Hola ${order.cliente}! 🔥 Te escribimos de *PUNTO G*.\nTu pedido *#${order.codigo}* está en estado: *${order.estado.toUpperCase()}* 🍔✨\n\nPuedes ver el estado de preparación y rastreo en vivo aquí:\n👉 ${origin}/pedido/${order.codigo}\n\n¡Muchas gracias por elegirnos!`;
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  const dispatchDeliveryWhatsApp = (order: Order) => {
    const addressQuery = encodeURIComponent(`${order.direccion || ''}, Cali, Colombia`);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;
    const msg = `🛵 *PEDIDO PARA DOMICILIO - PUNTO G* 🛵\n\n` +
      `📦 Orden: *#${order.codigo}*\n` +
      `👤 Cliente: *${order.cliente}*\n` +
      `📱 Teléfono: *${order.telefono}*\n` +
      `📍 Dirección: *${order.direccion || 'No especificada'}* ${order.barrio ? `(${order.barrio})` : ''}\n` +
      `💳 Método de Pago: *${order.metodoPago || 'Efectivo'}*\n` +
      `💵 Total a Cobrar: *$${(order.total || 0).toLocaleString('es-CO')}*\n` +
      `${order.notasCliente ? `⚠️ Nota: ${order.notasCliente}\n` : ''}\n` +
      `🗺️ Enlace a Google Maps:\n${mapsUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Check auth from localStorage; redirect to /login if not authenticated
  useEffect(() => {
    try {
      const auth = localStorage.getItem(LOCAL_STORAGE_AUTH);
      if (auth) {
        const userObj = JSON.parse(auth);
        setIsAuthenticated(true);
        setCurrentUser(userObj);
        if (userObj.branchId) {
          setSelectedBranchId(String(userObj.branchId));
        }
      } else {
        router.replace('/login');
      }
    } catch (e) {
      console.error(e);
      router.replace('/login');
    }
  }, [router]);

  // Fetch initial data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const loadAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchBranches(),
      fetchOrders(),
      fetchTables(),
      fetchCategories(),
      fetchProducts(),
      fetchReviews(),
      fetchUsers(),
      fetchConfig(),
      fetchCurrentShift(),
      fetchShiftHistory(),
      fetchAddons(),
    ]);
    setIsLoading(false);
  };

  const fetchBranches = async () => {
    try {
      const res = await fetch('/api/branches');
      if (res.ok) {
        const data = await res.json();
        setBranches(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCurrentShift = async () => {
    try {
      let url = '/api/shifts?current=true';
      if (selectedBranchId && selectedBranchId !== 'all') {
        url += `&branchId=${selectedBranchId}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setActiveShift(data.shift);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchShiftHistory = async () => {
    try {
      let url = '/api/shifts';
      if (selectedBranchId && selectedBranchId !== 'all') {
        url += `?branchId=${selectedBranchId}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setShiftHistory(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAddons = async () => {
    try {
      const res = await fetch('/api/addons');
      if (res.ok) {
        const data = await res.json();
        setAddonsList(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Re-fetch orders, tables, and shifts whenever selected branch changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchTables();
      fetchCurrentShift();
      fetchShiftHistory();
    }
  }, [selectedBranchId]);

  // ==================== API FETCHERS ====================
  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (filterDesde) params.append('desde', filterDesde);
      if (filterHasta) params.append('hasta', filterHasta);
      if (filterTipo !== 'todos') params.append('tipo', filterTipo);
      if (filterEstado !== 'todos') params.append('estado', filterEstado);
      if (filterMetodoPago !== 'todos') params.append('metodoPago', filterMetodoPago);
      if (filterMesa !== 'todas') params.append('mesaId', filterMesa);
      if (searchOrder) params.append('search', searchOrder);
      if (selectedBranchId && selectedBranchId !== 'all') {
        params.append('branchId', selectedBranchId);
      }

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
      let url = '/api/tables';
      if (selectedBranchId && selectedBranchId !== 'all') {
        url += `?branchId=${selectedBranchId}`;
      }
      const res = await fetch(url);
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
      const res = await fetch('/api/categories?all=true');
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
  }, [filterDesde, filterHasta, filterTipo, filterEstado, filterMetodoPago, filterMesa, searchOrder]);

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
    router.push('/login');
  };

  // Quick Date Preset Filters
  const applyDatePreset = (preset: 'hoy' | 'ayer' | 'semana' | 'mes' | 'mes_ant' | 'ano' | 'todos') => {
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
    } else if (preset === 'mes_ant') {
      const startLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      setFilterDesde(formatDate(startLastMonth));
      setFilterHasta(formatDate(endLastMonth));
    } else if (preset === 'ano') {
      const startYear = new Date(today.getFullYear(), 0, 1);
      setFilterDesde(formatDate(startYear));
      setFilterHasta(formatDate(today));
    } else {
      setFilterDesde('');
      setFilterHasta('');
    }
  };

  // Export Sales Report Handlers
  const handleExportExcel = () => {
    exportSalesReportToExcel({
      orders,
      filters: {
        desde: filterDesde,
        hasta: filterHasta,
        tipo: filterTipo !== 'todos' ? filterTipo : 'Todas',
        estado: filterEstado !== 'todos' ? filterEstado : 'Todos',
        metodoPago: filterMetodoPago !== 'todos' ? filterMetodoPago : 'Todos',
        mesa: filterMesa !== 'todas' ? filterMesa : 'Todas',
        search: searchOrder || undefined,
      },
      metrics: orderMetrics,
      productSalesSummary,
      userName: currentUser?.nombre || 'Superadmin',
    });
  };

  const handleExportPDF = () => {
    exportSalesReportToPDF({
      orders,
      filters: {
        desde: filterDesde,
        hasta: filterHasta,
        tipo: filterTipo !== 'todos' ? filterTipo : 'Todas',
        estado: filterEstado !== 'todos' ? filterEstado : 'Todos',
        metodoPago: filterMetodoPago !== 'todos' ? filterMetodoPago : 'Todos',
        mesa: filterMesa !== 'todas' ? filterMesa : 'Todas',
        search: searchOrder || undefined,
      },
      metrics: orderMetrics,
      productSalesSummary,
      userName: currentUser?.nombre || 'Superadmin',
    });
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
  const handleReleaseTable = async (tableId: number | string, tableNum?: string | number) => {
    const ok = await showConfirm({
      title: '¿Liberar Mesa?',
      text: tableNum ? `¿Deseas liberar la Mesa #${tableNum} y marcarla como libre?` : '¿Deseas liberar esta mesa y desocuparla?',
      confirmButtonText: 'Sí, liberar mesa',
      cancelButtonText: 'Cancelar',
      icon: 'question',
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/tables/${tableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'liberar' }),
      });
      if (res.ok) {
        await Promise.all([fetchTables(), fetchOrders()]);
        showSuccess('Mesa Liberada', 'La mesa ha sido desocupada y marcada como libre.');
      } else {
        showError('Error', 'No se pudo liberar la mesa');
      }
    } catch (e) {
      console.error(e);
      showError('Error de conexión', 'No se pudo conectar con el servidor');
    }
  };

  // Change Table Status directly
  const handleUpdateTableStatus = async (tableId: number | string, newStatus: string) => {
    try {
      const isAction = ['atender_llamado', 'atender_cuenta', 'liberar'].includes(newStatus);
      const res = await fetch(`/api/tables/${tableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: isAction ? undefined : newStatus,
          action: isAction ? newStatus : newStatus === 'Libre' ? 'liberar' : undefined,
        }),
      });
      if (res.ok) {
        await Promise.all([fetchTables(), fetchOrders()]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Release All Occupied Tables
  const handleReleaseAllTables = async () => {
    const occupied = tables.filter((t) => t.estado !== 'Libre' || (t.orders && t.orders.length > 0));
    if (occupied.length === 0) {
      showWarning('Mesas Libres', 'Todas las mesas ya se encuentran libres.');
      return;
    }
    const ok = await showConfirm({
      title: '¿Liberar Todas las Mesas?',
      text: `¿Deseas liberar todas las ${occupied.length} mesas ocupadas? Se marcarán inmediatamente como libres.`,
      confirmButtonText: 'Sí, liberar todas',
      cancelButtonText: 'Cancelar',
      icon: 'warning',
    });
    if (!ok) return;

    try {
      await Promise.all(
        occupied.map((t) =>
          fetch(`/api/tables/${t.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'liberar' }),
          })
        )
      );
      await Promise.all([fetchTables(), fetchOrders()]);
      showSuccess('Mesas Liberadas', `Se liberaron ${occupied.length} mesas exitosamente.`);
    } catch (e) {
      console.error(e);
      showError('Error', 'Ocurrió un error al liberar las mesas');
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
      parentId: '',
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
      activo: cat.activo ?? true,
      parentId: cat.parentId ? String(cat.parentId) : '',
    });
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...catFormData,
        parentId: catFormData.parentId ? Number(catFormData.parentId) : null,
      };

      let res: Response;
      if (editingCat) {
        res = await fetch(`/api/categories/${editingCat.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showError('No se pudo guardar la categoría', err.error || 'Error en el servidor');
        return;
      }

      setIsCatModalOpen(false);
      await fetchCategories();
      showSuccess('Categoría Guardada', 'La categoría se guardó correctamente.');
    } catch (e) {
      console.error(e);
      showError('Error de conexión', 'No se pudo conectar con el servidor al guardar la categoría');
    }
  };

  const handleDeleteCategory = async (id: number | string) => {
    const ok = await showConfirm({
      title: '¿Eliminar Categoría?',
      text: 'Los productos y subcategorías asociadas podrían verse afectados. ¿Deseas continuar?',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      icon: 'warning',
    });
    if (!ok) return;
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      fetchCategories();
      showSuccess('Categoría Eliminada', 'La categoría fue eliminada con éxito.');
    } catch (e) {
      console.error(e);
      showError('Error', 'No se pudo eliminar la categoría');
    }
  };

  const handleToggleCategoryActive = async (cat: Category) => {
    // Si la categoría está activa y es principal, advertir al usuario con SweetAlert
    if (cat.activo && !cat.parentId) {
      const ok = await showConfirm({
        title: '¿Desactivar Categoría Principal?',
        text: `Al inactivar "${cat.nombre}", sus subcategorías y platos dejarán de aparecer en el menú principal y público. ¿Deseas continuar?`,
        confirmButtonText: 'Sí, ocultar categoría',
        cancelButtonText: 'Cancelar',
        icon: 'warning',
      });
      if (!ok) return;
    }
    // Si ya está inactiva o es una subcategoría, activar/desactivar directamente
    await executeToggleCategory(cat.id, !cat.activo);
  };

  const executeToggleCategory = async (id: number | string, nuevoEstado: boolean) => {
    try {
      await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: nuevoEstado }),
      });
      fetchCategories();
    } catch (e) {
      console.error('Error al actualizar estado de categoría:', e);
    }
  };

  const handleToggleBranchActive = async (b: Branch) => {
    try {
      await fetch('/api/branches', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: b.id, activo: !b.activo }),
      });
      fetchBranches();
    } catch (e) {
      console.error('Error al actualizar estado de sede:', e);
    }
  };

  // ==================== SUBCATEGORÍAS ACTIONS ====================
  const handleOpenNewSubcategory = (preselectedParentId?: string | number) => {
    setEditingSubcat(null);
    const mainCats = categoryList.filter((c) => !c.parentId);
    const defaultParentId = preselectedParentId
      ? String(preselectedParentId)
      : filterSubcatParent !== 'todas'
      ? filterSubcatParent
      : (mainCats[0] ? String(mainCats[0].id) : '');

    setSubcatFormData({
      nombre: '',
      slug: '',
      descripcion: '',
      icono: 'Utensils',
      imagen: '',
      orden: 0,
      activo: true,
      parentId: defaultParentId,
    });
    setIsSubcatModalOpen(true);
  };

  const handleOpenEditSubcategory = (subcat: Category) => {
    setEditingSubcat(subcat);
    setSubcatFormData({
      nombre: subcat.nombre,
      slug: subcat.slug,
      descripcion: subcat.descripcion || '',
      icono: subcat.icono || 'Utensils',
      imagen: subcat.imagen || '',
      orden: subcat.orden || 0,
      activo: subcat.activo ?? true,
      parentId: subcat.parentId ? String(subcat.parentId) : '',
    });
    setIsSubcatModalOpen(true);
  };

  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subcatFormData.parentId) {
      showWarning('Campo obligatorio', 'Debes seleccionar la Categoría Principal obligatoriamente');
      return;
    }
    try {
      const payload = {
        ...subcatFormData,
        parentId: Number(subcatFormData.parentId),
        orden: Number(subcatFormData.orden) || 0,
      };

      let res: Response;
      if (editingSubcat) {
        res = await fetch(`/api/categories/${editingSubcat.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showError('No se pudo guardar la subcategoría', err.error || 'Error en el servidor');
        return;
      }

      setIsSubcatModalOpen(false);
      await fetchCategories();
      showSuccess('Subcategoría Guardada', 'La subcategoría se guardó correctamente.');
    } catch (e) {
      console.error(e);
      showError('Error de conexión', 'No se pudo conectar con el servidor al guardar la subcategoría');
    }
  };

  const handleDeleteSubcategory = async (id: number | string) => {
    const ok = await showConfirm({
      title: '¿Eliminar Subcategoría?',
      text: '¿Seguro que deseas eliminar esta subcategoría?',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      icon: 'warning',
    });
    if (!ok) return;
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      fetchCategories();
      showSuccess('Subcategoría Eliminada', 'La subcategoría fue eliminada con éxito.');
    } catch (e) {
      console.error(e);
      showError('Error', 'No se pudo eliminar la subcategoría');
    }
  };

  // Product Actions
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    const defaultMain = categoryList.find(c => !c.parentId)?.slug || 'comidas-rapidas';
    setProductFormData({
      nombre: '',
      categoriaSlug: defaultMain,
      subcategoriaSlug: '',
      precio: '',
      costo: '',
      descripcion: '',
      imagen: '',
      etiqueta: '',
      disponibilidad: true,
      controlarStock: false,
      stock: '',
      stockMinimo: '5',
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductFormData({
      nombre: p.nombre,
      categoriaSlug: p.categoria,
      subcategoriaSlug: p.subcategoria || '',
      precio: String(p.precio),
      costo: p.costo !== null && p.costo !== undefined ? String(p.costo) : '',
      descripcion: p.descripcion,
      imagen: p.imagen,
      etiqueta: p.etiqueta || '',
      disponibilidad: p.disponibilidad,
      controlarStock: Boolean(p.controlarStock),
      stock: p.stock !== null && p.stock !== undefined ? String(p.stock) : '',
      stockMinimo: p.stockMinimo !== null && p.stockMinimo !== undefined ? String(p.stockMinimo) : '5',
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...productFormData,
        precio: Number(productFormData.precio),
        costo: productFormData.costo ? Number(productFormData.costo) : null,
        stock: productFormData.controlarStock && productFormData.stock !== '' ? Number(productFormData.stock) : null,
        stockMinimo: productFormData.controlarStock && productFormData.stockMinimo !== '' ? Number(productFormData.stockMinimo) : 5,
        controlarStock: Boolean(productFormData.controlarStock),
      };

      let res: Response;
      if (editingProduct) {
        res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showError('No se pudo guardar el producto', err.error || 'Error en el servidor');
        return;
      }

      setIsProductModalOpen(false);
      await fetchProducts();
      showSuccess('Producto Guardado', 'El plato se guardó exitosamente.');
    } catch (e) {
      console.error(e);
      showError('Error de conexión', 'No se pudo conectar con el servidor al guardar el producto');
    }
  };

  const handleDeleteProduct = async (id: number | string) => {
    const ok = await showConfirm({
      title: '¿Eliminar Producto?',
      text: '¿Seguro que deseas eliminar este producto del menú?',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      icon: 'warning',
    });
    if (!ok) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
      showSuccess('Producto Eliminado', 'El producto ha sido eliminado correctamente.');
    } catch (e) {
      console.error(e);
      showError('Error', 'No se pudo eliminar el producto');
    }
  };

  const handleToggleDisponibilidad = async (p: Product) => {
    try {
      const nextStatus = p.disponibilidad === false ? true : false;
      await fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disponibilidad: nextStatus }),
      });
      fetchProducts();
    } catch (e) {
      console.error('Error al actualizar disponibilidad', e);
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
    const ok = await showConfirm({
      title: '¿Eliminar Comentario?',
      text: '¿Deseas eliminar permanentemente esta reseña?',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      icon: 'warning',
    });
    if (!ok) return;
    try {
      await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
      fetchReviews();
      showSuccess('Comentario Eliminado', 'La reseña fue eliminada.');
    } catch (e) {
      console.error(e);
      showError('Error', 'No se pudo eliminar la reseña');
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
      branchId: selectedBranchId !== 'all' ? Number(selectedBranchId) : null,
    });
    setShowUserModalPassword(false);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setUserFormData({
      nombre: user.nombre,
      email: user.email,
      password: user.password || '',
      rol: user.rol,
      estado: user.estado,
      branchId: user.branchId || null,
    });
    setShowUserModalPassword(false);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res: Response;
      if (editingUser) {
        res = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userFormData),
        });
      } else {
        res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userFormData),
        });
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showError('No se pudo guardar usuario', err.error || 'Error en el servidor');
        return;
      }
      setIsUserModalOpen(false);
      fetchUsers();
      showSuccess('Usuario Guardado', 'Los datos del usuario fueron actualizados.');
    } catch (e) {
      console.error(e);
      showError('Error de conexión', 'No se pudo guardar el usuario');
    }
  };

  const handleDeleteUser = async (id: number | string) => {
    const ok = await showConfirm({
      title: '¿Eliminar Usuario?',
      text: '¿Seguro que deseas eliminar este usuario del sistema?',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      icon: 'warning',
    });
    if (!ok) return;
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      fetchUsers();
      showSuccess('Usuario Eliminado', 'El usuario ha sido eliminado.');
    } catch (e) {
      console.error(e);
      showError('Error', 'No se pudo eliminar el usuario');
    }
  };

  // ==================== BRANCH ACTIONS ====================
  const handleOpenNewBranch = () => {
    setEditingBranch(null);
    setBranchFormData({
      nombre: '',
      slug: '',
      direccion: '',
      telefono: '',
      ciudad: 'Cali',
      activo: true,
    });
    setIsBranchModalOpen(true);
  };

  const handleOpenEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    setBranchFormData({
      nombre: branch.nombre,
      slug: branch.slug,
      direccion: branch.direccion || '',
      telefono: branch.telefono || '',
      ciudad: branch.ciudad || 'Cali',
      activo: branch.activo,
    });
    setIsBranchModalOpen(true);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res: Response;
      if (editingBranch) {
        res = await fetch('/api/branches', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingBranch.id, ...branchFormData }),
        });
      } else {
        res = await fetch('/api/branches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(branchFormData),
        });
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showError('No se pudo guardar la sede', err.error || 'Error en el servidor');
        return;
      }
      setIsBranchModalOpen(false);
      fetchBranches();
      showSuccess('Sede Guardada', 'La información de la sede fue guardada correctamente.');
    } catch (e) {
      console.error(e);
      showError('Error de conexión', 'No se pudo guardar la sede');
    }
  };

  const handleDeleteBranch = async (id: number) => {
    const ok = await showConfirm({
      title: '¿Eliminar Sede?',
      text: '¿Seguro que deseas eliminar esta sede del restaurante?',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      icon: 'warning',
    });
    if (!ok) return;
    try {
      await fetch('/api/branches', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchBranches();
      showSuccess('Sede Eliminada', 'La sede fue eliminada.');
    } catch (e) {
      console.error(e);
      showError('Error', 'No se pudo eliminar la sede');
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
      showSuccess('Configuración Guardada', 'Los ajustes del restaurante se actualizaron exitosamente.');
    } catch (e) {
      console.error(e);
      showError('Error de conexión', 'No se pudo guardar la configuración');
    }
  };

  // ==================== CASH SHIFT ACTIONS ====================
  const handleOpenShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cajero: openShiftData.cajero || currentUser?.nombre || 'Admin',
          baseInicial: Number(openShiftData.baseInicial) || 0,
          notas: openShiftData.notas,
        }),
      });
      if (res.ok) {
        setIsOpenShiftModalOpen(false);
        setOpenShiftData({ cajero: 'Admin', baseInicial: 100000, notas: '' });
        fetchCurrentShift();
        fetchShiftHistory();
        showSuccess('Turno Abierto', 'El turno de caja se abrió correctamente.');
      } else {
        const data = await res.json();
        showError('Error de Caja', data.error || 'Error al abrir turno');
      }
    } catch (e) {
      console.error(e);
      showError('Error', 'No se pudo conectar con el servidor para abrir el turno');
    }
  };

  const handleCloseShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;
    try {
      const res = await fetch('/api/shifts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeShift.id,
          efectivoReal: Number(closeShiftData.efectivoReal) || 0,
          notas: closeShiftData.notas,
        }),
      });
      if (res.ok) {
        setIsCloseShiftModalOpen(false);
        setCloseShiftData({ efectivoReal: '', notas: '' });
        fetchCurrentShift();
        fetchShiftHistory();
        showSuccess('Turno Cerrado', 'El turno de caja ha sido cerrado.');
      } else {
        const data = await res.json();
        showError('Error al cerrar turno', data.error || 'No se pudo cerrar el turno');
      }
    } catch (e) {
      console.error(e);
      showError('Error', 'No se pudo cerrar el turno');
    }
  };

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;
    try {
      const res = await fetch(`/api/shifts/${activeShift.id}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion: expenseFormData.descripcion,
          monto: Number(expenseFormData.monto),
          categoria: expenseFormData.categoria,
          creadoPor: currentUser?.nombre || 'Admin',
        }),
      });
      if (res.ok) {
        setIsExpenseModalOpen(false);
        setExpenseFormData({ descripcion: '', monto: '', categoria: 'Insumos' });
        fetchCurrentShift();
        showSuccess('Egreso Registrado', 'El egreso de caja se registró exitosamente.');
      } else {
        const data = await res.json();
        showError('Error', data.error || 'No se pudo registrar el egreso');
      }
    } catch (e) {
      console.error(e);
      showError('Error', 'No se pudo registrar el egreso');
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (!activeShift) return;
    const ok = await showConfirm({
      title: '¿Eliminar Egreso?',
      text: '¿Seguro que deseas eliminar este registro de egreso de caja?',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      icon: 'warning',
    });
    if (!ok) return;
    try {
      const res = await fetch(`/api/shifts/${activeShift.id}/expenses?id=${expenseId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchCurrentShift();
        showSuccess('Egreso Eliminado', 'El egreso fue eliminado con éxito.');
      } else {
        showError('Error', 'No se pudo eliminar el egreso');
      }
    } catch (e) {
      console.error(e);
      showError('Error', 'No se pudo eliminar el egreso');
    }
  };

  // ==================== TOPPINGS / ADDONS ACTIONS ====================
  const handleOpenNewAddon = () => {
    setEditingAddon(null);
    setAddonFormData({
      nombre: '',
      precio: '',
      categoria: 'Toppings',
      activo: true,
    });
    setIsAddonModalOpen(true);
  };

  const handleOpenEditAddon = (addon: ProductAddon) => {
    setEditingAddon(addon);
    setAddonFormData({
      nombre: addon.nombre,
      precio: String(addon.precio),
      categoria: addon.categoria,
      activo: addon.activo,
    });
    setIsAddonModalOpen(true);
  };

  const handleSaveAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res: Response;
      if (editingAddon) {
        res = await fetch('/api/addons', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingAddon.id,
            nombre: addonFormData.nombre,
            precio: Number(addonFormData.precio) || 0,
            categoria: addonFormData.categoria,
            activo: addonFormData.activo,
          }),
        });
      } else {
        res = await fetch('/api/addons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: addonFormData.nombre,
            precio: Number(addonFormData.precio) || 0,
            categoria: addonFormData.categoria,
          }),
        });
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showError('No se pudo guardar el adicional', err.error || 'Error en el servidor');
        return;
      }
      setIsAddonModalOpen(false);
      fetchAddons();
      showSuccess('Adicional Guardado', 'El topping/adicional fue guardado con éxito.');
    } catch (e) {
      console.error(e);
      showError('Error de conexión', 'No se pudo guardar el adicional');
    }
  };

  const handleToggleAddonActive = async (addon: ProductAddon) => {
    try {
      await fetch('/api/addons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: addon.id,
          activo: !addon.activo,
        }),
      });
      fetchAddons();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAddon = async (id: number) => {
    const ok = await showConfirm({
      title: '¿Eliminar Adicional?',
      text: '¿Deseas eliminar este adicional o topping del catálogo?',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      icon: 'warning',
    });
    if (!ok) return;
    try {
      await fetch(`/api/addons?id=${id}`, { method: 'DELETE' });
      fetchAddons();
      showSuccess('Adicional Eliminado', 'El adicional ha sido eliminado.');
    } catch (e) {
      console.error(e);
      showError('Error', 'No se pudo eliminar el adicional');
    }
  };

  const handleAssignRepartidor = async (orderId: number | string, repartidorNombre: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repartidor: repartidorNombre }),
      });
      fetchOrders();
    } catch (e) {
      console.error(e);
    }
  };

  const formatPrice = (val: number) => '$' + Number(val || 0).toLocaleString('es-CO');

  // ==================== REDIRECT TO /login IF NOT AUTHENTICATED ====================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#121212] border border-[#242424] rounded-2xl p-8 text-center space-y-4 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-brand-yellow/10 rounded-full blur-2xl pointer-events-none" />

          <div className="w-14 h-14 bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow rounded-2xl flex items-center justify-center mx-auto shadow-glow">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black uppercase text-white font-display tracking-wide">
              ACCESO ADMINISTRATIVO PROTEGIDO
            </h2>
            <p className="text-xs text-gray-400">
              Debes iniciar sesión con tus credenciales de Punto G para acceder a este panel. Redirigiendo a la ruta de inicio de sesión...
            </p>
          </div>

          <div className="pt-2 space-y-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-glow transition-all transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <Lock className="w-4 h-4" />
              <span>INICIAR SESIÓN EN /login</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-[#181818] hover:bg-[#202020] border border-[#2b2b2b] text-gray-300 hover:text-white rounded-xl text-xs font-bold transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Regresar al Sitio Principal</span>
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
            {/* Sede Switcher */}
            <div className="flex items-center gap-2 bg-[#181818] border border-[#2a2a2a] px-3 py-1.5 rounded-xl">
              <Building2 className="w-4 h-4 text-brand-yellow" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold leading-none">
                  Sede:
                </span>
                {currentUser?.rol === 'Superadmin' || !currentUser?.branchId ? (
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="bg-transparent text-white font-black text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-[#181818] text-white">Todas las Sedes (Consolidado)</option>
                    {branches.map((b) => (
                      <option key={b.id} value={String(b.id)} className="bg-[#181818] text-white">
                        {b.nombre}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs font-black text-brand-yellow leading-tight">
                    {currentUser?.branch?.nombre || branches.find(b => b.id === currentUser.branchId)?.nombre || `Sede #${currentUser.branchId}`}
                  </span>
                )}
              </div>
            </div>

            <Link
              href="/pedidos-listos"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-glow hover:scale-105 active:scale-95"
            >
              <BellRing className="w-4 h-4" />
              <span>Turnero Listos 🔔</span>
            </Link>

            <Link
              href="/cocina"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-glow hover:scale-105 active:scale-95"
            >
              <ChefHat className="w-4 h-4" />
              <span>Pantalla Cocina (KDS) 👨‍🍳</span>
            </Link>

            <Link
              href="/mesero"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-brand-yellow hover:opacity-90 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-glow hover:scale-105 active:scale-95"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>📱 Mesero POS (Tablet)</span>
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
        {(() => {
          const isMesero = currentUser?.rol === 'Mesero';
          const allTabs = [
            { id: 'pedidos', label: 'Pedidos & Filtros', icon: ShoppingBag, count: orders.length },
            { id: 'reportes', label: 'Reportes de Ventas', icon: BarChart3, badge: 'Excel / PDF' },
            { id: 'caja', label: 'Caja & Turnos', icon: DollarSign, badge: activeShift?.estado === 'Abierto' ? '🟢' : '🔴' },
            { id: 'toppings', label: 'Toppings & Adicionales', icon: Sparkles, count: addonsList.length },
            { id: 'mesas', label: 'Mesas / Comandas (QR)', icon: UtensilsCrossed, count: tables.length },
            { id: 'categorias', label: 'Categorías Principales', icon: Layers, count: categoryList.filter(c => !c.parentId).length },
            { id: 'subcategorias', label: 'Subcategorías', icon: FolderTree, count: categoryList.filter(c => !!c.parentId).length },
            { id: 'productos', label: 'Menú & Platos', icon: TrendingUp, count: productList.length },
            { id: 'resenas', label: 'Calificaciones QR', icon: Star, count: reviews.length },
            { id: 'usuarios', label: 'Usuarios / Staff', icon: Users, count: userList.length },
            { id: 'sedes', label: 'Sedes / Sucursales', icon: Building2, count: branches.length },
            { id: 'configuracion', label: 'Configuración', icon: Settings },
          ];

          const allowedForMesero = ['mesas', 'productos', 'toppings'];
          const visibleTabs = isMesero
            ? allTabs.filter((t) => allowedForMesero.includes(t.id))
            : allTabs;

          return (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#222] scrollbar-none">
              {visibleTabs.map((tab: any) => {
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
                    {tab.badge && (
                      <span className="text-[10px] ml-0.5">{tab.badge}</span>
                    )}
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
          );
        })()}

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
                <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 sm:pb-0">
                  <span className="text-[10px] text-gray-500 uppercase font-bold mr-1 hidden sm:inline">
                    Preajustes:
                  </span>
                  {[
                    { id: 'hoy', label: 'Hoy ⚡' },
                    { id: 'ayer', label: 'Ayer' },
                    { id: 'semana', label: '7 Días' },
                    { id: 'mes', label: 'Este Mes' },
                    { id: 'mes_ant', label: 'Mes Pasado' },
                    { id: 'ano', label: 'Este Año' },
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 text-xs">
                {/* Search */}
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">
                    Buscar cliente / cel
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

                {/* Estado */}
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">
                    Estado
                  </label>
                  <select
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-yellow text-xs"
                  >
                    <option value="todos">Todos los Estados</option>
                    <option value="Pendiente">⏳ Pendiente</option>
                    <option value="En Preparación">🍳 En Preparación</option>
                    <option value="Listo">🔔 Listo</option>
                    <option value="Despachado">🛵 En Camino</option>
                    <option value="Entregado">✅ Entregado</option>
                    <option value="Cancelado">❌ Cancelado</option>
                  </select>
                </div>

                {/* Método de Pago */}
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">
                    Método Pago
                  </label>
                  <select
                    value={filterMetodoPago}
                    onChange={(e) => setFilterMetodoPago(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-yellow text-xs"
                  >
                    <option value="todos">Todos los Pagos</option>
                    <option value="Efectivo">💵 Efectivo</option>
                    <option value="Nequi">📱 Nequi</option>
                    <option value="Daviplata">📱 Daviplata</option>
                    <option value="Datáfono">💳 Datáfono / Tarjeta</option>
                    <option value="Transferencia">🏦 Transferencia</option>
                  </select>
                </div>

                {/* Mesa Filter */}
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">
                    Mesa
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
              </div>

              {/* View Mode Toolbar, Total Inventory Button & Export Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#1e1e1e]">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center bg-[#181818] border border-[#262626] rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setOrdersViewMode('tabla')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                        ordersViewMode === 'tabla'
                          ? 'bg-brand-yellow text-black shadow-sm font-black'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Tabla Detallada & Inventario</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrdersViewMode('tarjetas')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                        ordersViewMode === 'tarjetas'
                          ? 'bg-brand-yellow text-black shadow-sm font-black'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Tarjetas</span>
                    </button>
                  </div>

                  {/* Toggle Inventory Sold Summary */}
                  <button
                    type="button"
                    onClick={() => setShowInventorySummary(!showInventorySummary)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
                      showInventorySummary
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-[#181818] text-gray-300 border-[#262626] hover:border-gray-600'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-brand-yellow" />
                    <span>Inventario Vendido ({totalItemsSold} platos)</span>
                  </button>

                  {/* Export Buttons */}
                  <div className="flex items-center gap-1.5 pl-2 sm:border-l border-[#262626]">
                    <button
                      type="button"
                      onClick={handleExportExcel}
                      disabled={orders.length === 0}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition bg-emerald-950/40 text-emerald-300 border border-emerald-600/40 hover:bg-emerald-800/40 disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Exportar pedidos filtrados a Excel (.xlsx)"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Excel (.xlsx)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportPDF}
                      disabled={orders.length === 0}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition bg-rose-950/40 text-rose-300 border border-rose-600/40 hover:bg-rose-800/40 disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Exportar informe de pedidos a PDF (.pdf)"
                    >
                      <FileText className="w-3.5 h-3.5 text-rose-400" />
                      <span>PDF (.pdf)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('reportes')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/30 hover:bg-brand-yellow/20"
                      title="Ir al módulo completo de Reportes & Analítica"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span className="hidden xl:inline">Módulo Reportes</span>
                    </button>
                  </div>
                </div>

                {/* Pagination Size Selector */}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>Filas por página:</span>
                  <select
                    value={ordersPerPage}
                    onChange={(e) => {
                      setOrdersPerPage(Number(e.target.value));
                      setOrdersPage(1);
                    }}
                    className="bg-[#181818] border border-[#262626] rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-brand-yellow"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              {/* Expandable Inventory Summary Drawer */}
              {showInventorySummary && (
                <div className="bg-[#121212] border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black uppercase text-white tracking-wide">
                        RESUMEN DE PRODUCTOS / INVENTARIO VENDIDO EN ESTE PERÍODO
                      </h4>
                      <p className="text-xs text-gray-400">
                        Total de unidades despachadas ordenadas por mayor demanda.
                      </p>
                    </div>
                    <span className="text-xs font-black text-brand-yellow font-display bg-brand-yellow/10 border border-brand-yellow/30 px-3 py-1 rounded-full">
                      {totalItemsSold} unidades en total
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
                    {productSalesSummary.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-[#181818] border border-[#282828] rounded-xl p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-brand-yellow text-black font-black text-xs flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-xs text-white truncate max-w-[150px]">
                            {item.nombre}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-brand-yellow font-display">
                            {item.cantidad}x
                          </span>
                          <span className="text-[10px] text-gray-400 block font-mono">
                            {formatPrice(item.total)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Orders Display */}
            {orders.length === 0 ? (
              <div className="bg-[#121212] border border-[#222] rounded-2xl p-12 text-center text-gray-500">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40 text-brand-yellow" />
                <p className="text-sm font-bold text-gray-300">No se encontraron pedidos con estos filtros</p>
                <p className="text-xs text-gray-500 mt-1">Prueba seleccionando otro rango de fechas o modalidad.</p>
              </div>
            ) : ordersViewMode === 'tabla' ? (
              /* ================= TABULAR VIEW WITH PAGINATION & ITEM INVENTORY ================= */
              <div className="space-y-4">
                <div className="bg-[#121212] border border-[#242424] rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#181818] text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-[#242424]">
                        <tr>
                          <th className="p-3.5"># Orden</th>
                          <th className="p-3.5">Cliente</th>
                          <th className="p-3.5">Modalidad</th>
                          <th className="p-3.5 min-w-[280px]">Inventario / Productos del Pedido</th>
                          <th className="p-3.5">Pago</th>
                          <th className="p-3.5 text-right">Total</th>
                          <th className="p-3.5">Estado</th>
                          <th className="p-3.5 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e1e1e]">
                        {paginatedOrders.map((o) => {
                          const totalItemsInOrder = o.items.reduce((s, i) => s + i.cantidad, 0);

                          return (
                            <tr key={o.id} className="hover:bg-[#161616] transition-colors">
                              {/* Order Code & Date */}
                              <td className="p-3.5 align-top font-mono">
                                <span className="font-black text-brand-yellow text-sm block">
                                  #{o.codigo}
                                </span>
                                <span className="text-[10px] text-gray-400 block mt-0.5">
                                  {new Date(o.createdAt).toLocaleDateString('es-CO', { dateStyle: 'short' })}{' '}
                                  {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </td>

                              {/* Customer Info */}
                              <td className="p-3.5 align-top">
                                <span className="font-bold text-white block">{o.cliente}</span>
                                <span className="text-[11px] text-gray-400 block">{o.telefono}</span>
                                {o.repartidor && (
                                  <span className="text-[10px] text-blue-400 font-bold block mt-1">
                                    🛵 Rep: {o.repartidor}
                                  </span>
                                )}
                              </td>

                              {/* Modality */}
                              <td className="p-3.5 align-top">
                                <span
                                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block ${
                                    o.tipo === 'mesa'
                                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                      : o.tipo === 'domicilio'
                                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  }`}
                                >
                                  {o.tipo === 'mesa' ? `🍽️ ${o.numeroMesa || 'Mesa'}` : o.tipo === 'domicilio' ? '🛵 Domicilio' : '🏪 Recoger'}
                                </span>
                                {o.direccion && (
                                  <p className="text-[10px] text-gray-400 max-w-[140px] truncate mt-1">
                                    {o.direccion}
                                  </p>
                                )}
                              </td>

                              {/* Products Breakdown / Inventory Details */}
                              <td className="p-3.5 align-top space-y-1">
                                <div className="flex items-center gap-1.5 pb-1">
                                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                                    Contenido ({totalItemsInOrder} {totalItemsInOrder === 1 ? 'ítem' : 'ítems'}):
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  {o.items.map((item, idx) => {
                                    let itemAddons: any[] = [];
                                    if (item.adicionales) {
                                      try {
                                        const parsed = JSON.parse(item.adicionales);
                                        if (Array.isArray(parsed)) itemAddons = parsed;
                                      } catch {}
                                    }

                                    return (
                                      <div key={idx} className="bg-[#181818] border border-[#262626] rounded-lg p-1.5 text-[11px]">
                                        <div className="flex justify-between items-start">
                                          <span>
                                            <strong className="text-brand-yellow font-black">{item.cantidad}x</strong>{' '}
                                            <span className="text-white font-semibold">{item.nombre}</span>
                                          </span>
                                          <span className="font-mono text-gray-300 text-[10px]">
                                            {formatPrice(item.precio * item.cantidad)}
                                          </span>
                                        </div>

                                        {/* Toppings in table */}
                                        {itemAddons.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-0.5 pl-3">
                                            {itemAddons.map((ad, aIdx) => (
                                              <span
                                                key={aIdx}
                                                className="text-[9px] bg-brand-yellow/15 text-brand-yellow font-bold px-1.5 rounded"
                                              >
                                                +{ad.nombre}
                                              </span>
                                            ))}
                                          </div>
                                        )}

                                        {item.notas && (
                                          <p className="text-[9px] text-gray-400 italic pl-3 mt-0.5">
                                            👉 {item.notas}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>

                                {o.notasCliente && (
                                  <p className="text-[10px] text-amber-300/90 italic pt-0.5">
                                    💬 "{o.notasCliente}"
                                  </p>
                                )}
                              </td>

                              {/* Payment Method */}
                              <td className="p-3.5 align-top">
                                <span className="font-bold text-brand-yellow text-xs">{o.metodoPago}</span>
                              </td>

                              {/* Totals */}
                              <td className="p-3.5 align-top text-right">
                                <span className="font-black text-white text-sm font-display block">
                                  {formatPrice(o.total)}
                                </span>
                                <span className="text-[9px] text-gray-500 block">
                                  Sub: {formatPrice(o.subtotal)}
                                </span>
                                {o.propina > 0 && (
                                  <span className="text-[9px] text-amber-400 block">
                                    +Prop: {formatPrice(o.propina)}
                                  </span>
                                )}
                              </td>

                              {/* Status Selector */}
                              <td className="p-3.5 align-top">
                                <select
                                  value={o.estado}
                                  onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                  className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border focus:outline-none transition-colors ${
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
                                  <option value="Listo">🟢 Listo</option>
                                  <option value="Despachado">🟣 En Camino</option>
                                  <option value="Entregado">✅ Entregado</option>
                                  <option value="Cancelado">❌ Cancelado</option>
                                </select>
                              </td>

                              {/* Action Buttons */}
                              <td className="p-3.5 align-top text-right space-x-1 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => openReceipt(o, 'factura')}
                                  className="p-1.5 rounded-lg bg-[#1c1c1c] hover:bg-[#282828] text-white border border-[#303030] transition"
                                  title="Imprimir Ticket POS"
                                >
                                  <Printer className="w-3.5 h-3.5 text-brand-yellow" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openReceipt(o, 'comanda')}
                                  className="p-1.5 rounded-lg bg-[#1c1c1c] hover:bg-[#282828] text-neutral-300 border border-[#303030] transition"
                                  title="Imprimir Comanda de Cocina"
                                >
                                  <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => notifyCustomerWhatsApp(o)}
                                  className="p-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-800/40 transition"
                                  title="Notificar cliente por WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </button>
                                {o.tipo === 'domicilio' && (
                                  <button
                                    type="button"
                                    onClick={() => dispatchDeliveryWhatsApp(o)}
                                    className="p-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 text-blue-400 border border-blue-800/40 transition"
                                    title="Enviar ruta a repartidor"
                                  >
                                    <Bike className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {o.tipo === 'mesa' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const found = tables.find(t => t.numero === o.numeroMesa || t.id === o.mesaId);
                                      if (found) {
                                        handleReleaseTable(found.id, found.numero);
                                      } else {
                                        showWarning('Mesa no encontrada', `No se encontró mesa registrada con el número ${o.numeroMesa}`);
                                      }
                                    }}
                                    className="p-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/40 transition"
                                    title={`Liberar ${o.numeroMesa || 'Mesa'}`}
                                  >
                                    <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-400" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              /* ================= CARD VIEW (PAGINATED) ================= */
              <div className="grid gap-4">
                {paginatedOrders.map((o) => (
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
                      {o.items.map((item, idx) => {
                        let itemAddons: any[] = [];
                        if (item.adicionales) {
                          try {
                            const parsed = JSON.parse(item.adicionales);
                            if (Array.isArray(parsed)) itemAddons = parsed;
                          } catch {}
                        }

                        return (
                          <div key={idx} className="border-b border-[#222] pb-1.5 last:border-0 last:pb-0">
                            <div className="flex justify-between items-center text-gray-300">
                              <span>
                                <strong className="text-brand-yellow">{item.cantidad}x</strong> {item.nombre}
                                {item.notas && <span className="text-[10px] text-gray-400 italic ml-1.5">({item.notas})</span>}
                              </span>
                              <span className="font-medium text-white">{formatPrice(item.precio * item.cantidad)}</span>
                            </div>

                            {/* Toppings in admin */}
                            {itemAddons.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1 pl-4">
                                {itemAddons.map((ad, aIdx) => (
                                  <span
                                    key={aIdx}
                                    className="text-[10px] bg-brand-yellow/15 text-brand-yellow font-bold px-1.5 py-0.5 rounded border border-brand-yellow/30"
                                  >
                                    + {ad.nombre}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}

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

                    {/* Quick POS & Messaging Toolbar */}
                    <div className="pt-2.5 border-t border-[#222] flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openReceipt(o, 'factura')}
                          className="py-1.5 px-3 rounded-lg bg-[#1c1c1c] hover:bg-[#282828] text-white border border-[#303030] font-bold text-[11px] flex items-center gap-1.5 transition"
                          title="Imprimir ticket de venta / pre-cuenta en 58mm/80mm"
                        >
                          <Printer className="w-3.5 h-3.5 text-brand-yellow" />
                          <span>Ticket POS</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openReceipt(o, 'comanda')}
                          className="py-1.5 px-3 rounded-lg bg-[#1c1c1c] hover:bg-[#282828] text-neutral-300 hover:text-white border border-[#303030] font-bold text-[11px] flex items-center gap-1.5 transition"
                          title="Imprimir comanda para cocina"
                        >
                          <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                          <span>Comanda</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => notifyCustomerWhatsApp(o)}
                          className="py-1.5 px-3 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-800/40 font-bold text-[11px] flex items-center gap-1.5 transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Cliente</span>
                        </button>

                        {o.tipo === 'domicilio' && (
                          <button
                            type="button"
                            onClick={() => dispatchDeliveryWhatsApp(o)}
                            className="py-1.5 px-3 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 text-blue-400 border border-blue-800/40 font-bold text-[11px] flex items-center gap-1.5 transition"
                          >
                            <Bike className="w-3.5 h-3.5" />
                            <span>Ruta Repartidor</span>
                          </button>
                        )}

                        {o.tipo === 'mesa' && (
                          <button
                            type="button"
                            onClick={() => {
                              const found = tables.find(t => t.numero === o.numeroMesa || t.id === o.mesaId);
                              if (found) {
                                handleReleaseTable(found.id, found.numero);
                              } else {
                                showWarning('Mesa no encontrada', `No se encontró mesa registrada con el número ${o.numeroMesa}`);
                              }
                            }}
                            className="py-1.5 px-3 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/40 font-bold text-[11px] flex items-center gap-1.5 transition"
                          >
                            <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Liberar {o.numeroMesa || 'Mesa'}</span>
                          </button>
                        )}
                      </div>

                      {/* Repartidor Assignment (if delivery) */}
                      {o.tipo === 'domicilio' && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 uppercase font-bold">Repartidor:</span>
                          <input
                            type="text"
                            placeholder="Ej: Carlos Moto 1"
                            defaultValue={o.repartidor || ''}
                            onBlur={(e) => {
                              if (e.target.value !== (o.repartidor || '')) {
                                handleAssignRepartidor(o.id, e.target.value.trim());
                              }
                            }}
                            className="bg-[#181818] border border-[#2d2d2d] rounded-lg px-2 py-1 text-white text-[11px] focus:outline-none focus:border-brand-yellow w-36"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ================= PAGINATION CONTROLS BAR ================= */}
            {orders.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111] border border-[#222] p-4 rounded-2xl text-xs">
                <div className="text-gray-400 text-xs">
                  Mostrando <strong className="text-white">{(ordersPage - 1) * ordersPerPage + 1}</strong> a{' '}
                  <strong className="text-white">{Math.min(ordersPage * ordersPerPage, orders.length)}</strong> de{' '}
                  <strong className="text-brand-yellow">{orders.length} pedidos</strong>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={ordersPage === 1}
                    onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#262626] text-gray-300 hover:text-white disabled:opacity-40 disabled:hover:text-gray-300 font-bold text-xs transition"
                  >
                    ← Anterior
                  </button>

                  {Array.from({ length: totalOrderPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setOrdersPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                        ordersPage === pageNum
                          ? 'bg-brand-yellow text-black font-black shadow-sm'
                          : 'bg-[#181818] text-gray-400 hover:bg-[#222] hover:text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={ordersPage === totalOrderPages}
                    onClick={() => setOrdersPage((p) => Math.min(totalOrderPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#262626] text-gray-300 hover:text-white disabled:opacity-40 disabled:hover:text-gray-300 font-bold text-xs transition"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB REPORTES: REPORTES DE VENTAS EN EXCEL Y PDF          */}
        {/* ======================================================== */}
        {activeTab === 'reportes' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header & Quick Export Actions */}
            <div className="bg-[#121212] border border-[#222] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-brand-yellow" />
                  <h2 className="text-lg font-black uppercase text-white tracking-wide">
                    MÓDULO DE REPORTES DE VENTAS E INVENTARIO
                  </h2>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Genera balances ejecutivos, analiza ingresos por método de pago y exporta informes oficiales a Excel y PDF con filtros dinámicos.
                </p>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  disabled={orders.length === 0}
                  className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition bg-emerald-600 hover:bg-emerald-500 text-black shadow-lg shadow-emerald-900/30 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Descargar Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  disabled={orders.length === 0}
                  className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FileText className="w-4 h-4" />
                  <span>Descargar PDF (.pdf)</span>
                </button>
              </div>
            </div>

            {/* Filter Card for Reports */}
            <div className="bg-[#121212] border border-[#222] rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-brand-yellow" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Filtros de Período y Criterios del Reporte
                  </h3>
                </div>

                {/* Preajustes */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 sm:pb-0">
                  <span className="text-[10px] text-gray-500 uppercase font-bold mr-1 hidden sm:inline">
                    Período Rápido:
                  </span>
                  {[
                    { id: 'hoy', label: 'Hoy ⚡' },
                    { id: 'ayer', label: 'Ayer' },
                    { id: 'semana', label: 'Últimos 7 Días' },
                    { id: 'mes', label: 'Este Mes' },
                    { id: 'mes_ant', label: 'Mes Pasado' },
                    { id: 'ano', label: 'Este Año' },
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

              {/* Form Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                {/* Fecha Desde */}
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

                {/* Fecha Hasta */}
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

                {/* Estado */}
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">
                    Estado del Pedido
                  </label>
                  <select
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-yellow text-xs"
                  >
                    <option value="todos">Todos los Estados</option>
                    <option value="Entregado">✅ Solo Entregados / Facturados</option>
                    <option value="Pendiente">⏳ Pendientes</option>
                    <option value="En Preparación">🍳 En Preparación</option>
                    <option value="Listo">🔔 Listos para Despacho</option>
                    <option value="Despachado">🛵 En Camino</option>
                    <option value="Cancelado">❌ Cancelados</option>
                  </select>
                </div>

                {/* Modalidad */}
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">
                    Modalidad / Servicio
                  </label>
                  <select
                    value={filterTipo}
                    onChange={(e) => setFilterTipo(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-yellow text-xs"
                  >
                    <option value="todos">Todas las modalidades</option>
                    <option value="mesa">🍽️ En Mesa (Comanda)</option>
                    <option value="domicilio">🛵 Domicilio</option>
                    <option value="recoger">🏪 Para Llevar / Retiro</option>
                  </select>
                </div>

                {/* Método de Pago */}
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={filterMetodoPago}
                    onChange={(e) => setFilterMetodoPago(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-yellow text-xs"
                  >
                    <option value="todos">Todos los Métodos</option>
                    <option value="Efectivo">💵 Efectivo</option>
                    <option value="Nequi">📱 Nequi</option>
                    <option value="Daviplata">📱 Daviplata</option>
                    <option value="Datáfono">💳 Datáfono / Tarjeta</option>
                    <option value="Transferencia">🏦 Transferencia Bancaria</option>
                  </select>
                </div>

                {/* Mesa */}
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">
                    Mesa
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
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-[#121212] border border-[#222] rounded-2xl p-4 space-y-1 shadow-lg">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-brand-yellow" />
                  <span>Ventas Período</span>
                </span>
                <p className="text-xl sm:text-2xl font-black text-brand-yellow font-display">
                  {formatPrice(orderMetrics.totalVentas)}
                </p>
                <span className="text-[10px] text-gray-500">Total facturado</span>
              </div>

              <div className="bg-[#121212] border border-[#222] rounded-2xl p-4 space-y-1 shadow-lg">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-brand-orange fill-brand-orange" />
                  <span>Propinas</span>
                </span>
                <p className="text-xl sm:text-2xl font-black text-white font-display">
                  {formatPrice(orderMetrics.totalPropinas)}
                </p>
                <span className="text-[10px] text-brand-orange">Propinas voluntarias</span>
              </div>

              <div className="bg-[#121212] border border-[#222] rounded-2xl p-4 space-y-1 shadow-lg">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
                  <span>N° Pedidos</span>
                </span>
                <p className="text-xl sm:text-2xl font-black text-white font-display">
                  {orderMetrics.totalPedidos}
                </p>
                <span className="text-[10px] text-gray-500">Órdenes registradas</span>
              </div>

              <div className="bg-[#121212] border border-[#222] rounded-2xl p-4 space-y-1 shadow-lg">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                  <span>Ticket Promedio</span>
                </span>
                <p className="text-xl sm:text-2xl font-black text-brand-yellow font-display">
                  {formatPrice(orderMetrics.ticketPromedio)}
                </p>
                <span className="text-[10px] text-gray-500">Promedio por orden</span>
              </div>

              <div className="bg-[#121212] border border-[#222] rounded-2xl p-4 space-y-1 col-span-2 lg:col-span-1 shadow-lg">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Platos Vendidos</span>
                </span>
                <p className="text-xl sm:text-2xl font-black text-purple-300 font-display">
                  {totalItemsSold}
                </p>
                <span className="text-[10px] text-gray-500">Unidades despachadas</span>
              </div>
            </div>

            {/* Multi-Sede Breakdown Card */}
            {branches.length > 0 && (
              <div className="bg-[#121212] border border-[#222] rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#222] pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-brand-yellow" />
                    <h4 className="text-xs font-black uppercase text-white tracking-wider">
                      Ventas y Rendimiento por Sede
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-gray-400">
                    {branches.length} sedes registradas
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {branches.map((branch) => {
                    const branchOrders = orders.filter((o) => o.branchId === branch.id || (o.sedeNombre && o.sedeNombre.toLowerCase().includes(branch.slug)));
                    const totalBranch = branchOrders.reduce((acc, o) => acc + (o.total || 0), 0);
                    const pct = orderMetrics.totalVentas > 0 ? ((totalBranch / orderMetrics.totalVentas) * 100).toFixed(1) : '0';

                    return (
                      <div key={branch.id} className="bg-[#171717] border border-[#262626] rounded-xl p-4 space-y-2 hover:border-brand-yellow/40 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-brand-yellow"></span>
                            {branch.nombre}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-yellow/10 text-brand-yellow font-black">
                            {pct}%
                          </span>
                        </div>
                        <div className="text-2xl font-black text-brand-yellow font-display">
                          {formatPrice(totalBranch)}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-[#222] pt-2">
                          <span>{branchOrders.length} órdenes</span>
                          <span>{branch.ciudad}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Breakdowns Grid: Métodos de Pago & Tipos de Entrega */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Methods Breakdown */}
              <div className="bg-[#121212] border border-[#222] rounded-2xl p-5 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-[#222] pb-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-black uppercase text-white tracking-wider">
                      Ventas por Método de Pago
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-gray-400">
                    {reportPaymentBreakdown.length} métodos utilizados
                  </span>
                </div>

                <div className="space-y-3">
                  {reportPaymentBreakdown.length === 0 ? (
                    <p className="text-xs text-gray-500 py-4 text-center">No hay ventas registradas en este período</p>
                  ) : (
                    reportPaymentBreakdown.map((item) => (
                      <div key={item.metodo} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <span>{item.metodo}</span>
                            <span className="text-[10px] text-gray-500">({item.count} pedidos)</span>
                          </span>
                          <span className="font-mono font-bold text-emerald-400">
                            {formatPrice(item.total)}{' '}
                            <span className="text-[10px] text-gray-500">({item.pct.toFixed(1)}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-[#1f1f1f] rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(3, item.pct))}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Delivery Types Breakdown */}
              <div className="bg-[#121212] border border-[#222] rounded-2xl p-5 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-[#222] pb-3">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-brand-orange" />
                    <h4 className="text-xs font-black uppercase text-white tracking-wider">
                      Ventas por Modalidad de Servicio
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-gray-400">
                    {orders.length} pedidos totales
                  </span>
                </div>

                <div className="space-y-3">
                  {reportTypeBreakdown.length === 0 ? (
                    <p className="text-xs text-gray-500 py-4 text-center">No hay ventas registradas en este período</p>
                  ) : (
                    reportTypeBreakdown.map((item) => (
                      <div key={item.tipo} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <span>{item.tipo}</span>
                            <span className="text-[10px] text-gray-500">({item.count} pedidos)</span>
                          </span>
                          <span className="font-mono font-bold text-brand-orange">
                            {formatPrice(item.total)}{' '}
                            <span className="text-[10px] text-gray-500">({item.pct.toFixed(1)}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-[#1f1f1f] rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-brand-orange h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(3, item.pct))}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Top 10 Platos Más Vendidos */}
            <div className="bg-[#121212] border border-[#222] rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-[#222] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-yellow" />
                  <h4 className="text-xs font-black uppercase text-white tracking-wider">
                    Top Platos / Inventario Vendido en el Período
                  </h4>
                </div>
                <span className="text-xs font-black text-brand-yellow bg-brand-yellow/10 border border-brand-yellow/30 px-2.5 py-0.5 rounded-full">
                  {totalItemsSold} platos despachados
                </span>
              </div>

              {productSalesSummary.length === 0 ? (
                <p className="text-xs text-gray-500 py-6 text-center">No hay datos de platos vendidos en el rango seleccionado</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#181818] text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-[#242424]">
                      <tr>
                        <th className="p-3"># Ranking</th>
                        <th className="p-3">Plato / Producto</th>
                        <th className="p-3 text-center">Unidades Vendidas</th>
                        <th className="p-3 text-right">Total Facturado</th>
                        <th className="p-3 text-right">Precio Promedio</th>
                        <th className="p-3 text-right">% de Ventas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e1e1e]">
                      {productSalesSummary.slice(0, 15).map((p, idx) => {
                        const avg = p.cantidad > 0 ? Math.round(p.total / p.cantidad) : 0;
                        const pct = orderMetrics.totalVentas > 0 ? ((p.total / orderMetrics.totalVentas) * 100).toFixed(1) : '0';
                        return (
                          <tr key={idx} className="hover:bg-[#181818]/50 transition">
                            <td className="p-3 font-mono font-bold text-gray-400">
                              <span className="w-5 h-5 rounded-md bg-[#222] text-brand-yellow inline-flex items-center justify-center text-[10px] font-black">
                                #{idx + 1}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-white">{p.nombre}</td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 rounded-full bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/30 font-black">
                                {p.cantidad} und
                              </span>
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-white">{formatPrice(p.total)}</td>
                            <td className="p-3 text-right font-mono text-gray-400">{formatPrice(avg)}</td>
                            <td className="p-3 text-right font-mono font-bold text-emerald-400">{pct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Listado de Pedidos Incluidos en el Reporte (Previsualización) */}
            <div className="bg-[#121212] border border-[#222] rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222] pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-blue-400" />
                  <h4 className="text-xs font-black uppercase text-white tracking-wider">
                    Órdenes Incluidas en el Reporte ({orders.length} pedidos)
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    disabled={orders.length === 0}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-emerald-950/40 text-emerald-300 border border-emerald-600/40 hover:bg-emerald-800/40 disabled:opacity-40 transition"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Exportar Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    disabled={orders.length === 0}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-rose-950/40 text-rose-300 border border-rose-600/40 hover:bg-rose-800/40 disabled:opacity-40 transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Exportar PDF</span>
                  </button>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <p className="text-xs">No hay pedidos que coincidan con los filtros seleccionados.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#181818] text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-[#242424]">
                      <tr>
                        <th className="p-3">Código</th>
                        <th className="p-3">Fecha/Hora</th>
                        <th className="p-3">Cliente</th>
                        <th className="p-3">Modalidad</th>
                        <th className="p-3">Pago</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e1e1e]">
                      {paginatedOrders.map((o) => {
                        const d = new Date(o.createdAt);
                        const dateStr = d.toLocaleDateString('es-CO');
                        const timeStr = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
                        return (
                          <tr key={o.id} className="hover:bg-[#181818]/50 transition">
                            <td className="p-3 font-mono font-black text-brand-yellow">{o.codigo}</td>
                            <td className="p-3 text-gray-400 text-[11px]">{dateStr} {timeStr}</td>
                            <td className="p-3 font-bold text-white">{o.cliente}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-md bg-[#222] text-gray-300 text-[10px] font-bold">
                                {o.tipo === 'mesa' ? `Mesa ${o.numeroMesa || ''}` : o.tipo === 'domicilio' ? 'Domicilio' : 'Retiro'}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-md bg-[#1f2937] text-blue-300 text-[10px] font-bold">
                                {o.metodoPago || 'Efectivo'}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                o.estado === 'Entregado' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                o.estado === 'Cancelado' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                              }`}>
                                {o.estado}
                              </span>
                            </td>
                            <td className="p-3 text-right font-mono font-black text-brand-yellow text-sm">
                              {formatPrice(o.total)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination controls */}
              {totalOrderPages > 1 && (
                <div className="flex items-center justify-between pt-3 border-t border-[#1e1e1e] text-xs">
                  <span className="text-gray-400">
                    Página {ordersPage} de {totalOrderPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                      disabled={ordersPage === 1}
                      className="px-3 py-1 bg-[#181818] border border-[#262626] rounded-lg text-white disabled:opacity-40 hover:border-gray-500"
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrdersPage((p) => Math.min(totalOrderPages, p + 1))}
                      disabled={ordersPage === totalOrderPages}
                      className="px-3 py-1 bg-[#181818] border border-[#262626] rounded-lg text-white disabled:opacity-40 hover:border-gray-500"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PESTAÑA: CAJA & TURNOS (ARQUEO Y CUADRE DIARIO)           */}
        {/* ======================================================== */}
        {activeTab === 'caja' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111] border border-[#222] p-5 rounded-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      activeShift?.estado === 'Abierto' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                    }`}
                  />
                  <h3 className="text-lg font-black uppercase text-white font-display">
                    CONTROL DE CAJA Y ARQUEO DE TURNOS
                  </h3>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {activeShift?.estado === 'Abierto'
                    ? `Turno actual abierto por ${activeShift.cajero} el ${new Date(activeShift.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'No hay un turno de caja abierto en este momento.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {activeShift?.estado === 'Abierto' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsExpenseModalOpen(true)}
                      className="px-3.5 py-2.5 bg-[#202020] hover:bg-[#2b2b2b] text-neutral-200 border border-[#333] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-4 h-4 text-red-400" />
                      <span>Registrar Egreso / Salida</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCloseShiftData({
                          efectivoReal: String(activeShift.totalEfectivoEsperado || activeShift.baseInicial || 0),
                          notas: '',
                        });
                        setIsCloseShiftModalOpen(true);
                      }}
                      className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition shadow-lg shadow-red-600/20"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Cerrar Turno & Cuadre</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsOpenShiftModalOpen(true)}
                    className="px-4 py-2.5 bg-brand-yellow hover:bg-brand-yellowHover text-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition shadow-glow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Abrir Nuevo Turno de Caja</span>
                  </button>
                )}
              </div>
            </div>

            {/* Shift Metrics */}
            {activeShift && activeShift.estado === 'Abierto' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Base */}
                  <div className="bg-[#121212] border border-[#222] rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Base Inicial en Caja</span>
                    <span className="text-xl font-black text-white font-display">
                      {formatPrice(activeShift.baseInicial)}
                    </span>
                    <span className="text-[10px] text-gray-400 block">Cambio al iniciar turno</span>
                  </div>

                  {/* Efectivo */}
                  <div className="bg-[#121212] border border-[#222] rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">Ventas en Efectivo</span>
                    <span className="text-xl font-black text-emerald-400 font-display">
                      {formatPrice(activeShift.ventasEfectivo || 0)}
                    </span>
                    <span className="text-[10px] text-gray-400 block">Ingresado en caja física</span>
                  </div>

                  {/* Transferencia */}
                  <div className="bg-[#121212] border border-[#222] rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-blue-400 block">Nequi / Daviplata</span>
                    <span className="text-xl font-black text-blue-400 font-display">
                      {formatPrice(activeShift.ventasTransfer || 0)}
                    </span>
                    <span className="text-[10px] text-gray-400 block">Transferencias verificadas</span>
                  </div>

                  {/* Datáfono */}
                  <div className="bg-[#121212] border border-[#222] rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-purple-400 block">Datáfono / Tarjetas</span>
                    <span className="text-xl font-black text-purple-400 font-display">
                      {formatPrice(activeShift.ventasDatafono || 0)}
                    </span>
                    <span className="text-[10px] text-gray-400 block">Comprobantes terminal</span>
                  </div>

                  {/* Propinas */}
                  <div className="bg-[#121212] border border-[#222] rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block">Propinas del Personal</span>
                    <span className="text-xl font-black text-amber-400 font-display">
                      {formatPrice(activeShift.propinasTotal || 0)}
                    </span>
                    <span className="text-[10px] text-gray-400 block">Recaudadas voluntarias</span>
                  </div>

                  {/* Egresos */}
                  <div className="bg-[#121212] border border-red-900/30 rounded-2xl p-4 space-y-1 bg-red-950/10">
                    <span className="text-[10px] uppercase font-bold text-red-400 block">Egresos / Salidas</span>
                    <span className="text-xl font-black text-red-400 font-display">
                      - {formatPrice(activeShift.totalEgresos || 0)}
                    </span>
                    <span className="text-[10px] text-gray-400 block">Gastos menores de caja</span>
                  </div>

                  {/* Total Ventas Turno */}
                  <div className="bg-[#121212] border border-[#222] rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Ventas Turno</span>
                    <span className="text-xl font-black text-white font-display">
                      {formatPrice(activeShift.totalVentas || 0)}
                    </span>
                    <span className="text-[10px] text-gray-400 block">Todos los medios de pago</span>
                  </div>

                  {/* Efectivo Esperado en Caja (Hero) */}
                  <div className="bg-brand-yellow/15 border border-brand-yellow rounded-2xl p-4 space-y-1 shadow-lg shadow-brand-yellow/10">
                    <span className="text-[10px] uppercase font-black text-brand-yellow block">
                      💵 EFECTIVO ESPERADO EN GAVETA
                    </span>
                    <span className="text-2xl font-black text-white font-display">
                      {formatPrice(activeShift.totalEfectivoEsperado || (activeShift.baseInicial + (activeShift.ventasEfectivo || 0) - (activeShift.totalEgresos || 0)))}
                    </span>
                    <span className="text-[10px] text-neutral-300 block">Base + Efectivo - Egresos</span>
                  </div>
                </div>

                {/* Egresos / Gastos Menores Section */}
                <div className="bg-[#121212] border border-[#242424] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold uppercase text-white tracking-wide">
                        Egresos y Salidas de Caja del Turno
                      </h4>
                      <p className="text-xs text-gray-400">
                        Registro de gastos rápidos (hielo, domiciliarios, anticipos, insumos de emergencia).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsExpenseModalOpen(true)}
                      className="py-1.5 px-3 bg-[#202020] hover:bg-[#2b2b2b] text-neutral-200 border border-[#333] rounded-xl text-xs font-bold flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5 text-brand-yellow" />
                      <span>Agregar Gasto</span>
                    </button>
                  </div>

                  {(!activeShift.egresos || activeShift.egresos.length === 0) ? (
                    <div className="p-6 text-center text-xs text-neutral-500 border border-dashed border-[#282828] rounded-xl">
                      No hay egresos registrados en este turno de caja.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#222] text-gray-500 text-[10px] uppercase">
                            <th className="py-2 px-3">Hora</th>
                            <th className="py-2 px-3">Descripción</th>
                            <th className="py-2 px-3">Categoría</th>
                            <th className="py-2 px-3">Registrado Por</th>
                            <th className="py-2 px-3 text-right">Monto</th>
                            <th className="py-2 px-3 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e1e1e]">
                          {activeShift.egresos.map((egreso: any) => (
                            <tr key={egreso.id} className="hover:bg-[#161616]">
                              <td className="py-2.5 px-3 text-gray-400 font-mono">
                                {new Date(egreso.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-white">{egreso.descripcion}</td>
                              <td className="py-2.5 px-3">
                                <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded border border-neutral-700">
                                  {egreso.categoria}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-gray-400">{egreso.creadoPor || 'Admin'}</td>
                              <td className="py-2.5 px-3 text-right font-black text-red-400">
                                - {formatPrice(egreso.monto)}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteExpense(egreso.id)}
                                  className="text-gray-500 hover:text-red-400 p-1 transition"
                                  title="Eliminar egreso"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-[#121212] border border-[#222] rounded-2xl p-10 text-center space-y-3">
                <Coins className="w-12 h-12 mx-auto text-brand-yellow/60" />
                <h4 className="text-base font-extrabold text-white">No hay turno activo</h4>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  Abre un nuevo turno de caja ingresando la base inicial de efectivo para comenzar a registrar pedidos y cuadres.
                </p>
                <button
                  type="button"
                  onClick={() => setIsOpenShiftModalOpen(true)}
                  className="px-5 py-2.5 bg-brand-yellow hover:bg-brand-yellowHover text-black rounded-xl text-xs font-black uppercase tracking-wider transition shadow-glow"
                >
                  Abrir Turno de Caja Ahora
                </button>
              </div>
            )}

            {/* Historial de Turnos Cerrados */}
            <div className="bg-[#121212] border border-[#242424] rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-extrabold uppercase text-white tracking-wide">
                Historial de Cierres de Caja Anteriores
              </h4>

              {shiftHistory.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">No hay historial de turnos previos.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#222] text-gray-500 text-[10px] uppercase">
                        <th className="py-2 px-3">Fecha y Hora</th>
                        <th className="py-2 px-3">Cajero</th>
                        <th className="py-2 px-3">Estado</th>
                        <th className="py-2 px-3 text-right">Base</th>
                        <th className="py-2 px-3 text-right">Total Ventas</th>
                        <th className="py-2 px-3 text-right">Efectivo Real</th>
                        <th className="py-2 px-3 text-right">Diferencia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e1e1e]">
                      {shiftHistory.map((s: any) => (
                        <tr key={s.id} className="hover:bg-[#161616]">
                          <td className="py-2.5 px-3 text-gray-300 font-mono">
                            {new Date(s.createdAt).toLocaleDateString('es-CO', { dateStyle: 'short' })}{' '}
                            {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-white">{s.cajero}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                s.estado === 'Abierto'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                              }`}
                            >
                              {s.estado}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-gray-300">{formatPrice(s.baseInicial)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-white">{formatPrice(s.totalVentas)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-brand-yellow">
                            {s.efectivoReal !== null ? formatPrice(s.efectivoReal) : '--'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black">
                            {s.diferencia !== null ? (
                              s.diferencia >= 0 ? (
                                <span className="text-emerald-400">+{formatPrice(s.diferencia)} (Sobrante)</span>
                              ) : (
                                <span className="text-red-400">{formatPrice(s.diferencia)} (Faltante)</span>
                              )
                            ) : (
                              '--'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PESTAÑA: TOPPINGS & ADICIONALES (CONFIGURACIÓN)           */}
        {/* ======================================================== */}
        {activeTab === 'toppings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black uppercase text-white font-display">
                  TOPPINGS, SALSAS Y ADICIONALES
                </h3>
                <p className="text-xs text-gray-400">
                  Configura los ingredientes extras que tus clientes pueden agregar al menú (tocineta, queso, salsas especiales, papas).
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenNewAddon}
                className="px-4 py-2.5 bg-brand-yellow hover:bg-brand-yellowHover text-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-glow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Adicional</span>
              </button>
            </div>

            {/* Addons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {addonsList.map((addon) => (
                <div
                  key={addon.id}
                  className={`bg-[#121212] border rounded-2xl p-4 flex flex-col justify-between transition-all ${
                    addon.activo ? 'border-[#262626] hover:border-brand-yellow/40' : 'border-neutral-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-brand-yellow tracking-wider">
                        {addon.categoria}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{addon.nombre}</h4>
                    </div>

                    <span className="text-base font-black text-brand-yellow font-display">
                      {formatPrice(addon.precio)}
                    </span>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#1e1e1e] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleAddonActive(addon)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded transition ${
                        addon.activo ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {addon.activo ? '✓ Activo' : '✕ Desactivado'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditAddon(addon)}
                        className="p-1.5 rounded-lg bg-[#1c1c1c] text-gray-400 hover:text-white transition"
                        title="Editar"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAddon(addon.id)}
                        className="p-1.5 rounded-lg bg-[#1c1c1c] text-gray-400 hover:text-red-400 transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {activeTab === 'mesas' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111] border border-[#222] p-4 sm:p-5 rounded-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-brand-yellow" />
                  <h3 className="text-lg font-black uppercase text-white font-display">
                    MÓDULO DE MESAS Y COMANDAS EN SITIO
                  </h3>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Monitorea mesas en tiempo real, libera mesas ocupadas tras pagar, genera códigos QR y gestiona reservas.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-0.5 rounded-full">
                    🟢 {tables.filter(t => t.estado === 'Libre' && (!t.orders || t.orders.length === 0)).length} Libres
                  </span>
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2.5 py-0.5 rounded-full">
                    🔴 {tables.filter(t => t.estado === 'Ocupada' || (t.orders && t.orders.length > 0)).length} Ocupadas
                  </span>
                  <span className="text-[11px] font-bold text-gray-400 bg-[#1c1c1c] border border-[#2c2c2c] px-2.5 py-0.5 rounded-full">
                    Total: {tables.length} mesas
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleReleaseAllTables}
                  className="px-3.5 py-2.5 bg-[#1c1c1c] hover:bg-emerald-950/50 text-emerald-300 hover:text-emerald-200 border border-emerald-700/40 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
                  title="Liberar todas las mesas que figuren como ocupadas"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Liberar Todas Ocupadas</span>
                </button>

                <button
                  onClick={() => setIsTableModalOpen(true)}
                  className="px-4 py-2.5 bg-brand-yellow hover:bg-brand-yellowHover text-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-glow transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Nueva Mesa</span>
                </button>
              </div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tables.map((t) => {
                const activeOrder = t.orders && t.orders[0];
                const isOccupied = t.estado === 'Ocupada' || !!activeOrder;
                const isReserved = t.estado === 'Reservada';

                return (
                  <div
                    key={t.id}
                    className={`bg-[#121212] border rounded-2xl p-5 space-y-3.5 transition-all relative overflow-hidden shadow-lg ${
                      isOccupied
                        ? 'border-brand-yellow/60 shadow-[0_0_15px_rgba(255,201,40,0.15)]'
                        : isReserved
                        ? 'border-purple-500/50'
                        : 'border-[#222]'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                            isOccupied
                              ? 'bg-brand-yellow text-black'
                              : isReserved
                              ? 'bg-purple-600 text-white'
                              : 'bg-[#1e1e1e] text-gray-300'
                          }`}
                        >
                          <UtensilsCrossed className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white uppercase">{t.numero}</h4>
                          <span className="text-[10px] text-gray-400">{t.ubicacion || 'Salón'} • {t.capacidad} puestos</span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          isOccupied
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                            : isReserved
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {isOccupied ? '🔴 Ocupada' : isReserved ? '🟡 Reservada' : '🟢 Libre'}
                      </span>
                    </div>

                    {/* Alertas en Tiempo Real de la Mesa */}
                    {t.llamandoMesero && (
                      <div className="bg-red-950/60 border border-red-500/80 rounded-xl p-2.5 flex items-center justify-between gap-2 animate-pulse">
                        <div className="flex items-center gap-1.5 text-xs font-black text-red-200">
                          <Bell className="w-3.5 h-3.5 text-red-400 animate-bounce" />
                          <span>¡Cliente solicita mesero!</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUpdateTableStatus(t.id, 'atender_llamado')}
                          className="px-2.5 py-1 bg-red-500 hover:bg-red-400 text-white text-[10px] font-black uppercase rounded-lg shadow transition active:scale-95 cursor-pointer"
                        >
                          Atender
                        </button>
                      </div>
                    )}

                    {t.solicitudCuenta && (
                      <div className="bg-amber-950/60 border border-brand-yellow/80 rounded-xl p-2.5 flex items-center justify-between gap-2 animate-pulse">
                        <div className="text-xs">
                          <div className="flex items-center gap-1 text-brand-yellow font-black">
                            <Receipt className="w-3.5 h-3.5" />
                            <span>¡Pidiendo la cuenta!</span>
                          </div>
                          <span className="text-[10px] text-gray-300 font-bold block mt-0.5">
                            Medio: {t.metodoPagoCuenta || 'Efectivo'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUpdateTableStatus(t.id, 'atender_cuenta')}
                          className="px-2.5 py-1 bg-brand-yellow hover:bg-yellow-400 text-black text-[10px] font-black uppercase rounded-lg shadow transition active:scale-95 cursor-pointer"
                        >
                          Atender
                        </button>
                      </div>
                    )}

                    {/* Active Order Details or Occupied Status Banner */}
                    {activeOrder ? (
                      <div className="bg-[#181818] rounded-xl p-3 space-y-2 text-xs border border-[#282828]">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-white">Comanda: #{activeOrder.codigo}</span>
                          <span className="text-brand-yellow font-black font-display">{formatPrice(activeOrder.total)}</span>
                        </div>
                        <p className="text-[10px] text-gray-400">Cliente: <strong className="text-white">{activeOrder.cliente}</strong></p>
                        <p className="text-[10px] text-gray-400">
                          {activeOrder.items?.length || 0} platos • Estado: <strong className="text-amber-400">{activeOrder.estado}</strong>
                        </p>
                        {activeOrder.propina > 0 && (
                          <p className="text-[10px] text-brand-orange font-bold">
                            Propina: {formatPrice(activeOrder.propina)}
                          </p>
                        )}
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <Link
                            href="/mesero"
                            target="_blank"
                            className="py-2 bg-[#252525] hover:bg-[#303030] text-brand-yellow border border-brand-yellow/30 text-center rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>Dividir Cuenta</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleReleaseTable(t.id, t.numero)}
                            className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Cobrar y Liberar</span>
                          </button>
                        </div>
                      </div>
                    ) : isOccupied ? (
                      <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3 text-center space-y-2">
                        <p className="text-[11px] text-amber-300 font-bold">
                          ⚠️ Mesa marcada como Ocupada
                        </p>
                        <p className="text-[10px] text-gray-400">
                          No tiene comanda pendiente activa. Puedes liberarla con un clic:
                        </p>
                        <button
                          type="button"
                          onClick={() => handleReleaseTable(t.id, t.numero)}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Liberar Mesa Ahora (Marcar Libre)</span>
                        </button>
                      </div>
                    ) : (
                      <div className="py-2.5 text-center text-xs text-gray-500 bg-[#161616] rounded-xl border border-[#222]">
                        <span className="text-emerald-400 font-semibold text-[11px]">✓ Mesa lista para nuevos clientes</span>
                      </div>
                    )}

                    {/* Quick State Selector Buttons for Admin */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">
                        Cambiar Estado Rápido:
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateTableStatus(t.id, 'Libre')}
                          className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition ${
                            t.estado === 'Libre' && !activeOrder
                              ? 'bg-emerald-600 text-white border-emerald-500 font-black shadow-sm'
                              : 'bg-[#181818] text-gray-400 border-[#2a2a2a] hover:text-white hover:bg-[#202020]'
                          }`}
                        >
                          🟢 Libre
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateTableStatus(t.id, 'Ocupada')}
                          className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition ${
                            isOccupied
                              ? 'bg-amber-600 text-black border-amber-500 font-black shadow-sm'
                              : 'bg-[#181818] text-gray-400 border-[#2a2a2a] hover:text-white hover:bg-[#202020]'
                          }`}
                        >
                          🔴 Ocupar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateTableStatus(t.id, 'Reservada')}
                          className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition ${
                            isReserved
                              ? 'bg-purple-600 text-white border-purple-500 font-black shadow-sm'
                              : 'bg-[#181818] text-gray-400 border-[#2a2a2a] hover:text-white hover:bg-[#202020]'
                          }`}
                        >
                          🟡 Reservar
                        </button>
                      </div>
                    </div>

                    {/* Table Actions */}
                    <div className="pt-2 border-t border-[#1e1e1e] flex items-center justify-between gap-2">
                      <button
                        type="button"
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
        {/* TAB 3: CATEGORÍAS PRINCIPALES                            */}
        {/* ======================================================== */}
        {activeTab === 'categorias' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black uppercase text-white font-display">
                  CATEGORÍAS PRINCIPALES DEL MENÚ ({categoryList.filter((c) => !c.parentId).length})
                </h3>
                <p className="text-xs text-gray-400">
                  Las grandes secciones del menú (Comidas Rápidas, Bebidas, Platos Fuertes). Agrupa subcategorías dentro de ellas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('subcategorias')}
                  className="px-3.5 py-2.5 bg-[#1e1e1e] hover:bg-[#282828] text-brand-yellow border border-brand-yellow/30 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
                >
                  <FolderTree className="w-4 h-4" />
                  <span>Ir a Subcategorías 👉</span>
                </button>

                <button
                  onClick={handleOpenNewCategory}
                  className="px-4 py-2.5 bg-brand-yellow hover:bg-brand-yellowHover text-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-glow transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nueva Categoría Principal</span>
                </button>
              </div>
            </div>

            {/* Buscador y Filtro de Estado para Categorías Principales */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#111] border border-[#222] p-4 rounded-2xl">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Buscar categoría por nombre, descripción, slug o subcategorías..."
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2d2d2d] focus:border-brand-yellow rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition"
                />
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                {searchCategory && (
                  <button
                    type="button"
                    onClick={() => setSearchCategory('')}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterCategoryStatus('todas')}
                  className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                    filterCategoryStatus === 'todas'
                      ? 'bg-brand-yellow text-black font-black'
                      : 'bg-[#181818] text-gray-400 hover:text-white border border-[#2d2d2d]'
                  }`}
                >
                  Todas ({categoryList.filter((c) => !c.parentId).length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategoryStatus('activas')}
                  className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap flex items-center gap-1.5 transition ${
                    filterCategoryStatus === 'activas'
                      ? 'bg-emerald-500 text-black font-black'
                      : 'bg-[#181818] text-emerald-400 hover:text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Activas ({categoryList.filter((c) => !c.parentId && c.activo).length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategoryStatus('inactivas')}
                  className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap flex items-center gap-1.5 transition ${
                    filterCategoryStatus === 'inactivas'
                      ? 'bg-red-500 text-white font-black'
                      : 'bg-[#181818] text-red-400 hover:text-red-300 border border-red-500/30'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  Inactivas ({categoryList.filter((c) => !c.parentId && !c.activo).length})
                </button>
              </div>
            </div>

            {(() => {
              const query = searchCategory.toLowerCase().trim();
              const filteredMainCats = categoryList
                .filter((cat) => !cat.parentId)
                .filter((cat) => {
                  if (filterCategoryStatus === 'activas' && !cat.activo) return false;
                  if (filterCategoryStatus === 'inactivas' && cat.activo) return false;

                  if (!query) return true;

                  const subcategoriesOfThis = categoryList.filter(
                    (c) => c.parentId === cat.id || c.parentId === cat.slug
                  );
                  const matchesSub = subcategoriesOfThis.some(
                    (s) =>
                      s.nombre.toLowerCase().includes(query) ||
                      s.slug.toLowerCase().includes(query)
                  );

                  return (
                    cat.nombre.toLowerCase().includes(query) ||
                    (cat.descripcion && cat.descripcion.toLowerCase().includes(query)) ||
                    cat.slug.toLowerCase().includes(query) ||
                    matchesSub
                  );
                });

              if (filteredMainCats.length === 0) {
                return (
                  <div className="bg-[#121212] border border-[#222] rounded-2xl p-10 text-center space-y-3">
                    <Search className="w-10 h-10 mx-auto text-gray-600" />
                    <h4 className="text-base font-bold text-white">No se encontraron categorías principales</h4>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      No hay categorías principales que coincidan con los filtros aplicados.
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      {(searchCategory || filterCategoryStatus !== 'todas') && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchCategory('');
                            setFilterCategoryStatus('todas');
                          }}
                          className="px-4 py-2 bg-[#222] hover:bg-[#333] text-gray-300 font-bold text-xs rounded-xl"
                        >
                          Limpiar Búsqueda
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleOpenNewCategory}
                        className="px-4 py-2 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs uppercase rounded-xl shadow-glow"
                      >
                        + Crear Categoría
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMainCats.map((cat) => {
                    const subcategoriesOfThis = categoryList.filter(
                      (c) => c.parentId === cat.id || c.parentId === cat.slug
                    );

                    return (
                      <div
                        key={cat.id}
                        className="bg-[#121212] border border-[#2d2d2d] hover:border-brand-yellow/60 rounded-2xl p-5 space-y-4 transition-all flex flex-col justify-between shadow-md"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-gray-500 uppercase">
                              Orden #{cat.orden}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/30">
                                ⭐ Principal
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleCategoryActive(cat)}
                                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                  cat.activo
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                    : 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                                }`}
                                title={cat.activo ? 'Clic para desactivar categoría principal' : 'Clic para activar en el menú'}
                              >
                                <span className={`w-2 h-2 rounded-full ${cat.activo ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                                <span>{cat.activo ? 'Activa en Menú' : 'Inactiva / Oculta'}</span>
                              </button>
                            </div>
                          </div>

                          <h4 className="text-base font-black text-white uppercase font-display">
                            {cat.nombre}
                          </h4>
                          <p className="text-xs text-gray-400 line-clamp-2">
                            {cat.descripcion || 'Sin descripción'}
                          </p>

                          {/* Subcategories list pills */}
                          <div className="pt-1 border-t border-[#1e1e1e] space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-gray-400 font-bold uppercase text-[10px]">
                                Subcategorías vinculadas ({subcategoriesOfThis.length}):
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenNewSubcategory(cat.id)}
                                className="text-[10px] text-brand-yellow hover:underline font-bold"
                              >
                                + Añadir Sub
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {subcategoriesOfThis.length === 0 ? (
                                <span className="text-[10px] text-gray-600 italic">Sin subcategorías aún</span>
                              ) : (
                                subcategoriesOfThis.map((sub) => (
                                  <span
                                    key={sub.id}
                                    className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded border border-neutral-700"
                                  >
                                    {sub.nombre}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-brand-yellow pt-1">
                            <span>Slug: <code>/menu/{cat.slug}</code></span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#1e1e1e] flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setFilterSubcatParent(String(cat.id));
                              setActiveTab('subcategorias');
                            }}
                            className="py-1.5 px-3 bg-[#1c1c1c] hover:bg-[#282828] text-brand-yellow font-bold text-[11px] rounded-lg transition border border-[#2a2a2a] flex items-center gap-1"
                          >
                            <FolderTree className="w-3.5 h-3.5" />
                            <span>Ver Subcategorías</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleCategoryActive(cat)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 border ${
                                cat.activo
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                                  : 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25'
                              }`}
                              title={cat.activo ? 'Desactivar esta categoría principal' : 'Activar en el menú'}
                            >
                              <Power className="w-3.5 h-3.5" />
                              <span>{cat.activo ? 'Visible' : 'Oculta'}</span>
                            </button>
                            <button
                              onClick={() => handleOpenEditCategory(cat)}
                              className="p-2 bg-[#1a1a1a] hover:bg-[#252525] text-gray-300 hover:text-white rounded-lg transition-colors"
                              title="Editar Categoría Principal"
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
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3.1: NUEVO MENÚ DE SUBCATEGORÍAS ASOCIADAS           */}
        {/* ======================================================== */}
        {activeTab === 'subcategorias' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111] border border-[#222] p-5 rounded-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-brand-yellow" />
                  <h3 className="text-lg font-black uppercase text-white font-display">
                    MÓDULO DE SUBCATEGORÍAS
                  </h3>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Crea subcategorías y organízalas vinculándolas directamente a su categoría principal (ej: Bebidas ➔ Gaseosas, Cócteles).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('categorias')}
                  className="px-3.5 py-2.5 bg-[#202020] hover:bg-[#2b2b2b] text-neutral-300 border border-[#333] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
                >
                  <Layers className="w-4 h-4 text-brand-yellow" />
                  <span>Categorías Principales</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenNewSubcategory()}
                  className="px-4 py-2.5 bg-brand-yellow hover:bg-brand-yellowHover text-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-glow transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Nueva Subcategoría</span>
                </button>
              </div>
            </div>

            {/* Buscador y Filtro de Estado para Subcategorías */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#111] border border-[#222] p-4 rounded-2xl">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Buscar subcategoría por nombre, slug o categoría padre..."
                  value={searchSubcat}
                  onChange={(e) => setSearchSubcat(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2d2d2d] focus:border-brand-yellow rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition"
                />
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                {searchSubcat && (
                  <button
                    type="button"
                    onClick={() => setSearchSubcat('')}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterSubcatStatus('todas')}
                  className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                    filterSubcatStatus === 'todas'
                      ? 'bg-brand-yellow text-black font-black'
                      : 'bg-[#181818] text-gray-400 hover:text-white border border-[#2d2d2d]'
                  }`}
                >
                  Todas ({categoryList.filter((c) => !!c.parentId).length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterSubcatStatus('activas')}
                  className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap flex items-center gap-1.5 transition ${
                    filterSubcatStatus === 'activas'
                      ? 'bg-emerald-500 text-black font-black'
                      : 'bg-[#181818] text-emerald-400 hover:text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Activas ({categoryList.filter((c) => !!c.parentId && c.activo).length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterSubcatStatus('inactivas')}
                  className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap flex items-center gap-1.5 transition ${
                    filterSubcatStatus === 'inactivas'
                      ? 'bg-red-500 text-white font-black'
                      : 'bg-[#181818] text-red-400 hover:text-red-300 border border-red-500/30'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  Inactivas ({categoryList.filter((c) => !!c.parentId && !c.activo).length})
                </button>
              </div>
            </div>

            {/* Filter by Parent Category */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#141414] border border-[#222] p-4 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-brand-yellow" />
                <span className="font-bold text-gray-300 uppercase">Filtrar por Categoría Principal:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterSubcatParent('todas')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                    filterSubcatParent === 'todas'
                      ? 'bg-brand-yellow text-black shadow-sm font-black'
                      : 'bg-[#202020] text-gray-400 hover:text-white'
                  }`}
                >
                  Todas ({categoryList.filter((c) => !!c.parentId).length})
                </button>

                {categoryList
                  .filter((c) => !c.parentId)
                  .map((mainCat) => {
                    const count = categoryList.filter(
                      (c) => c.parentId === mainCat.id || c.parentId === mainCat.slug
                    ).length;

                    return (
                      <button
                        key={mainCat.id}
                        type="button"
                        onClick={() => setFilterSubcatParent(String(mainCat.id))}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                          filterSubcatParent === String(mainCat.id)
                            ? 'bg-brand-yellow text-black shadow-sm font-black'
                            : 'bg-[#202020] text-gray-400 hover:text-white'
                        }`}
                      >
                        {mainCat.nombre} ({count})
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Subcategories Grid with Search & Status filtering */}
            {(() => {
              const query = searchSubcat.toLowerCase().trim();
              const filteredSubcats = categoryList
                .filter((c) => !!c.parentId)
                .filter((subcat) => {
                  // Filter by parent
                  if (filterSubcatParent !== 'todas') {
                    const matchParent =
                      String(subcat.parentId) === filterSubcatParent ||
                      subcat.parent?.slug === filterSubcatParent;
                    if (!matchParent) return false;
                  }

                  // Filter by status
                  if (filterSubcatStatus === 'activas' && !subcat.activo) return false;
                  if (filterSubcatStatus === 'inactivas' && subcat.activo) return false;

                  // Filter by search query
                  if (!query) return true;

                  const parentCat =
                    categoryList.find(
                      (c) => c.id === subcat.parentId || c.slug === subcat.parentId
                    ) || subcat.parent;

                  return (
                    subcat.nombre.toLowerCase().includes(query) ||
                    (subcat.descripcion && subcat.descripcion.toLowerCase().includes(query)) ||
                    subcat.slug.toLowerCase().includes(query) ||
                    (parentCat?.nombre && parentCat.nombre.toLowerCase().includes(query))
                  );
                });

              if (filteredSubcats.length === 0) {
                return (
                  <div className="bg-[#121212] border border-[#222] rounded-2xl p-10 text-center space-y-3">
                    <FolderTree className="w-12 h-12 mx-auto text-gray-600" />
                    <h4 className="text-base font-bold text-white">No se encontraron subcategorías</h4>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      No hay subcategorías que coincidan con la búsqueda o la categoría principal seleccionada.
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      {(searchSubcat || filterSubcatStatus !== 'todas' || filterSubcatParent !== 'todas') && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchSubcat('');
                            setFilterSubcatStatus('todas');
                            setFilterSubcatParent('todas');
                          }}
                          className="px-4 py-2 bg-[#222] hover:bg-[#333] text-gray-300 font-bold text-xs rounded-xl"
                        >
                          Limpiar Filtros
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenNewSubcategory()}
                        className="px-4 py-2 bg-brand-yellow text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-glow"
                      >
                        + Crear Subcategoría
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSubcats.map((subcat) => {
                    const parentCat =
                      categoryList.find(
                        (c) => c.id === subcat.parentId || c.slug === subcat.parentId
                      ) || subcat.parent;

                    return (
                      <div
                        key={subcat.id}
                        className="bg-[#121212] border border-[#262626] hover:border-brand-yellow/50 rounded-2xl p-5 space-y-4 transition-all flex flex-col justify-between shadow-lg"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-gray-500 uppercase">
                              Orden #{subcat.orden || 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => executeToggleCategory(subcat.id, !subcat.activo)}
                              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                subcat.activo
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                  : 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                              }`}
                              title={subcat.activo ? 'Clic para desactivar del submenú' : 'Clic para activar en el submenú'}
                            >
                              <span className={`w-2 h-2 rounded-full ${subcat.activo ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                              <span>{subcat.activo ? '✓ Activa en Submenú' : '✕ Inactiva / Oculta'}</span>
                            </button>
                          </div>

                          {/* Parent Category Badge */}
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-yellow/15 border border-brand-yellow/40 text-brand-yellow text-xs font-black">
                            <Layers className="w-3.5 h-3.5" />
                            <span>Categoría Padre: {parentCat?.nombre || 'Principal'}</span>
                          </div>

                          <h4 className="text-base font-black text-white uppercase font-display">
                            {subcat.nombre}
                          </h4>

                          <p className="text-xs text-gray-400 line-clamp-2">
                            {subcat.descripcion || 'Sin descripción'}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400 pt-1 border-t border-[#1e1e1e]">
                            <span>Slug: <code className="text-brand-yellow">{subcat.slug}</code></span>
                            {subcat._count?.subProducts !== undefined && (
                              <span>• {subcat._count.subProducts} platos asociados</span>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#1e1e1e] flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => executeToggleCategory(subcat.id, !subcat.activo)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 border ${
                              subcat.activo
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                                : 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25'
                            }`}
                            title={subcat.activo ? 'Ocultar esta subcategoría del menú' : 'Mostrar esta subcategoría en el menú'}
                          >
                            <Power className="w-3.5 h-3.5" />
                            <span>{subcat.activo ? 'Visible' : 'Oculta'}</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditSubcategory(subcat)}
                              className="p-2 bg-[#1c1c1c] hover:bg-[#252525] text-gray-300 hover:text-white rounded-lg transition-colors"
                              title="Editar Subcategoría"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubcategory(subcat.id)}
                              className="p-2 bg-[#1c1c1c] hover:bg-red-500/20 text-gray-300 hover:text-red-400 rounded-lg transition-colors"
                              title="Eliminar Subcategoría"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
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

            {/* Banner Informativo de Promociones */}
            <div className="bg-gradient-to-r from-amber-500/10 via-[#161616] to-[#121212] border border-brand-yellow/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-yellow/15 border border-brand-yellow/40 flex items-center justify-center text-brand-yellow shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs uppercase flex items-center gap-1.5">
                    <span>Configuración de Promociones y Combos</span>
                    <span className="text-[10px] bg-brand-yellow text-black font-black px-1.5 py-0.2 rounded">Página /promociones</span>
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Los platos que asignes a la categoría <strong className="text-brand-yellow">"Combos y Promociones"</strong> o que tengan la etiqueta <strong className="text-brand-yellow">PROMO</strong>, <strong className="text-brand-yellow">COMBO</strong> u <strong className="text-brand-yellow">OFERTA</strong> aparecerán automáticamente en la página de Promociones de la web.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProductCat('combos')}
                className="px-3 py-1.5 bg-[#202020] hover:bg-[#2c2c2c] text-brand-yellow border border-brand-yellow/30 font-bold text-[11px] rounded-xl whitespace-nowrap transition"
              >
                Ver Combos y Promos ({productList.filter(p => (p.categoria || '').includes('combo') || (p.etiqueta || '').includes('PROMO') || (p.etiqueta || '').includes('COMBO')).length})
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col gap-3 bg-[#111] border border-[#222] p-4 rounded-2xl">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Buscar plato por nombre, descripción, ingredientes, etiqueta o precio..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2d2d2d] focus:border-brand-yellow rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition"
                  />
                  <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  {searchProduct && (
                    <button
                      type="button"
                      onClick={() => setSearchProduct('')}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <select
                  value={selectedProductCat}
                  onChange={(e) => setSelectedProductCat(e.target.value)}
                  className="bg-[#181818] border border-[#2d2d2d] focus:border-brand-yellow rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="todas">Todas las categorías</option>
                  {categoryList
                    .filter((c) => !c.parentId)
                    .map((main) => (
                      <optgroup key={main.id} label={`⭐ ${main.nombre}`}>
                        <option value={main.slug}>Toda: {main.nombre}</option>
                        {categoryList
                          .filter((sub) => sub.parentId === main.id || sub.parentId === main.slug)
                          .map((sub) => (
                            <option key={sub.id} value={sub.slug}>
                              &nbsp;&nbsp;↳ {sub.nombre}
                            </option>
                          ))}
                      </optgroup>
                    ))}
                </select>
              </div>

              {/* Status Chips for Products */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1e1e1e] text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-gray-400 uppercase mr-1">Estado:</span>
                  <button
                    type="button"
                    onClick={() => setFilterProductStatus('todos')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                      filterProductStatus === 'todos'
                        ? 'bg-brand-yellow text-black font-black'
                        : 'bg-[#181818] text-gray-400 hover:text-white border border-[#252525]'
                    }`}
                  >
                    Todos ({productList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterProductStatus('activos')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition ${
                      filterProductStatus === 'activos'
                        ? 'bg-emerald-500 text-black font-black'
                        : 'bg-[#181818] text-emerald-400 hover:text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Activos ({productList.filter((p) => p.disponibilidad !== false).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterProductStatus('inactivos')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition ${
                      filterProductStatus === 'inactivos'
                        ? 'bg-red-500 text-white font-black'
                        : 'bg-[#181818] text-red-400 hover:text-red-300 border border-red-500/30'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    Apagados / Agotados ({productList.filter((p) => p.disponibilidad === false).length})
                  </button>
                </div>

                {(searchProduct || selectedProductCat !== 'todas' || filterProductStatus !== 'todos') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchProduct('');
                      setSelectedProductCat('todas');
                      setFilterProductStatus('todos');
                    }}
                    className="text-[11px] text-gray-400 hover:text-brand-yellow underline transition"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>

            {/* Products Grid with Enhanced Filtering & Empty State */}
            {(() => {
              const query = searchProduct.toLowerCase().trim();
              const filteredProducts = productList.filter((p) => {
                const matchesCat =
                  selectedProductCat === 'todas' ||
                  p.categoria === selectedProductCat ||
                  p.subcategoria === selectedProductCat;
                if (!matchesCat) return false;

                if (filterProductStatus === 'activos' && p.disponibilidad === false) return false;
                if (filterProductStatus === 'inactivos' && p.disponibilidad !== false) return false;

                if (!query) return true;

                const nameMatch = p.nombre.toLowerCase().includes(query);
                const descMatch = (p.descripcion || '').toLowerCase().includes(query);
                const badgeMatch = (p.etiqueta || '').toLowerCase().includes(query);
                const priceMatch = String(p.precio).includes(query);
                const catMatch = (p.categoria || '').toLowerCase().includes(query) || (p.categoriaNombre || '').toLowerCase().includes(query);
                const subcatMatch = (p.subcategoria || '').toLowerCase().includes(query) || (p.subcategoriaNombre || '').toLowerCase().includes(query);
                const ingredMatch = Array.isArray((p as any).ingredientes)
                  ? (p as any).ingredientes.some((ing: string) => typeof ing === 'string' && ing.toLowerCase().includes(query))
                  : false;

                return nameMatch || descMatch || badgeMatch || priceMatch || catMatch || subcatMatch || ingredMatch;
              });

              if (filteredProducts.length === 0) {
                return (
                  <div className="bg-[#121212] border border-[#222] rounded-2xl p-10 text-center space-y-3">
                    <Search className="w-10 h-10 mx-auto text-gray-600" />
                    <h4 className="text-base font-bold text-white">No se encontraron productos</h4>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      No hay platos que coincidan con los filtros o término de búsqueda seleccionado.
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSearchProduct('');
                          setSelectedProductCat('todas');
                          setFilterProductStatus('todos');
                        }}
                        className="px-4 py-2 bg-[#222] hover:bg-[#333] text-gray-300 font-bold text-xs rounded-xl"
                      >
                        Limpiar Filtros
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenNewProduct}
                        className="px-4 py-2 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs uppercase rounded-xl shadow-glow"
                      >
                        + Agregar Producto
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((p) => (
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
                          <button
                            type="button"
                            onClick={() => handleToggleDisponibilidad(p)}
                            className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded shadow cursor-pointer transition-all hover:scale-105 ${
                              p.disponibilidad !== false ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'
                            }`}
                            title={p.disponibilidad !== false ? 'Clic para apagar plato' : 'Clic para activar plato'}
                          >
                            {p.disponibilidad !== false ? 'Disponible' : 'Agotado'}
                          </button>
                        </div>

                        <div>
                          <div className="flex justify-between items-baseline">
                            <h4 className="text-sm font-bold text-white truncate">{p.nombre}</h4>
                            <span className="text-sm font-black text-brand-yellow ml-2">
                              {formatPrice(p.precio)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase mt-0.5">
                            <span className="text-brand-yellow">{p.categoriaNombre || p.categoria}</span>
                            {p.subcategoria && (
                              <>
                                <span className="text-gray-600">➔</span>
                                <span className="text-blue-400">{p.subcategoriaNombre || p.subcategoria}</span>
                              </>
                            )}
                          </div>
                          
                          {/* Stock e Inventario Info */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            {p.controlarStock ? (
                              (p.stock ?? 0) <= 0 || p.disponibilidad === false ? (
                                <span className="text-[10px] bg-red-950/60 text-red-400 border border-red-800 font-bold px-1.5 py-0.5 rounded">
                                  🔴 AGOTADO (0 uds)
                                </span>
                              ) : (p.stock ?? 0) <= (p.stockMinimo ?? 5) ? (
                                <span className="text-[10px] bg-amber-950/60 text-amber-300 border border-amber-800 font-bold px-1.5 py-0.5 rounded">
                                  ⚠️ Stock Bajo ({p.stock} uds)
                                </span>
                              ) : (
                                <span className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800 font-bold px-1.5 py-0.5 rounded">
                                  📦 Stock: {p.stock} uds
                                </span>
                              )
                            ) : (
                              <span className="text-[10px] bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a] px-1.5 py-0.5 rounded font-bold">
                                Stock Ilimitado
                              </span>
                            )}
                            {p.costo !== null && p.costo !== undefined && (
                              <span className="text-[10px] text-gray-400 font-bold bg-[#1a1a1a] px-1.5 py-0.5 rounded border border-[#2a2a2a]">
                                Costo: {formatPrice(p.costo)}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-400 line-clamp-2 mt-1">{p.descripcion}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#1e1e1e] flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleToggleDisponibilidad(p)}
                          type="button"
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                            p.disponibilidad !== false
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/25'
                              : 'bg-red-500/15 text-red-400 border border-red-500/40 hover:bg-red-500/25'
                          }`}
                          title={p.disponibilidad !== false ? 'Clic para apagar este plato del menú' : 'Clic para activar este plato en el menú'}
                        >
                          <span className={`w-2 h-2 rounded-full ${p.disponibilidad !== false ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                          <span>{p.disponibilidad !== false ? 'Activo en Menú' : 'Apagado / Oculto'}</span>
                        </button>

                        <div className="flex items-center gap-1.5">
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
                    </div>
                  ))}
                </div>
              );
            })()}
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
                      <th className="p-4">Contraseña</th>
                      <th className="p-4">Rol</th>
                      <th className="p-4">Sede Asignada</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e1e]">
                    {userList.map((u) => {
                      const isPwdVisible = !!visiblePasswords[u.id];
                      return (
                        <tr key={u.id} className="hover:bg-[#161616] transition-colors">
                          <td className="p-4 font-bold text-white flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-brand-yellow/20 text-brand-yellow flex items-center justify-center font-bold text-xs">
                              {u.nombre.charAt(0)}
                            </div>
                            <span>{u.nombre}</span>
                          </td>
                          <td className="p-4 text-gray-400">{u.email}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-mono text-xs ${
                                  isPwdVisible
                                    ? 'text-brand-yellow font-extrabold bg-[#1a1a1a] px-2 py-0.5 rounded border border-brand-yellow/30'
                                    : 'text-gray-500 tracking-widest'
                                }`}
                              >
                                {isPwdVisible ? (u.password || 'admin123') : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setVisiblePasswords((prev) => ({
                                    ...prev,
                                    [u.id]: !prev[u.id],
                                  }))
                                }
                                className="p-1 rounded-lg bg-[#1c1c1c] hover:bg-[#252525] text-gray-400 hover:text-white transition"
                                title={isPwdVisible ? 'Ocultar contraseña' : 'Ver contraseña'}
                              >
                                {isPwdVisible ? <EyeOff className="w-3.5 h-3.5 text-brand-yellow" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1e1e1e] text-brand-yellow border border-[#2d2d2d]">
                              {u.rol}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1e1e1e] text-gray-300 border border-[#2d2d2d] flex items-center gap-1 w-fit">
                              <Building2 className="w-3 h-3 text-brand-yellow" />
                              <span>{u.branch?.nombre || 'Global (Todas las Sedes)'}</span>
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
                          <td className="p-4 text-right space-x-1.5">
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className="p-1.5 bg-[#1c1c1c] hover:bg-[#282828] text-gray-300 hover:text-brand-yellow rounded-lg transition-colors"
                              title="Editar usuario"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1.5 bg-[#1c1c1c] hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: SEDES / SUCURSALES (MULTI-SEDE)                     */}
        {/* ======================================================== */}
        {activeTab === 'sedes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121212] border border-[#222] rounded-2xl p-5 shadow-xl">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-brand-yellow" />
                  <h3 className="text-lg font-black uppercase text-white font-display">
                    SEDES Y SUCURSALES DEL NEGOCIO ({branches.length})
                  </h3>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Crea nuevas sedes, edita sus datos de contacto y administra los accesos para cada punto de venta en MySQL.
                </p>
              </div>

              <button
                onClick={handleOpenNewBranch}
                className="px-4 py-2.5 bg-brand-yellow hover:bg-brand-yellowHover text-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-glow transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Crear Nueva Sede</span>
              </button>
            </div>

            {/* Branches Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((b) => (
                <div
                  key={b.id}
                  className="bg-[#121212] border border-[#242424] hover:border-brand-yellow/50 rounded-2xl p-5 space-y-4 shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/30">
                        SEDE ID #{b.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleBranchActive(b)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          b.activo
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                        }`}
                        title={b.activo ? 'Clic para desactivar sede' : 'Clic para activar sede'}
                      >
                        {b.activo ? '● Sede Activa' : '○ Sede Inactiva'}
                      </button>
                    </div>

                    <div>
                      <h4 className="text-base font-black text-white uppercase">{b.nombre}</h4>
                      <p className="text-[11px] font-mono text-gray-400">slug: {b.slug}</p>
                    </div>

                    {/* Branch Quick Stats */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#181818] p-2.5 rounded-xl border border-[#262626]">
                      <div>
                        <span className="text-gray-400 block text-[9px] uppercase font-bold">Personal Asignado:</span>
                        <span className="text-white font-black">{userList.filter(u => u.branchId === b.id).length} Usuarios</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[9px] uppercase font-bold">Mesas / Zonas:</span>
                        <span className="text-white font-black">{tables.filter(t => t.branchId === b.id).length} Mesas</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-300 border-t border-[#1e1e1e] pt-3">
                      {b.direccion && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-brand-yellow flex-shrink-0 mt-0.5" />
                          <span>{b.direccion}</span>
                        </div>
                      )}
                      {b.telefono && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>{b.telefono}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-gray-500">Ciudad:</span>
                        <span className="text-white font-bold">{b.ciudad}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#1e1e1e] pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBranchId(String(b.id));
                        setActiveTab('pedidos');
                      }}
                      className="px-2.5 py-1.5 bg-brand-yellow/15 hover:bg-brand-yellow/25 text-brand-yellow border border-brand-yellow/30 rounded-xl text-xs font-black transition flex items-center gap-1"
                      title="Gestionar pedidos de esta sede"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Gestionar Sede 👉</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditBranch(b)}
                        className="px-3 py-1.5 bg-[#1c1c1c] hover:bg-[#282828] text-gray-300 hover:text-brand-yellow rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-[#2d2d2d]"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDeleteBranch(b.id)}
                        className="p-1.5 bg-[#1c1c1c] hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-xl transition border border-[#2d2d2d]"
                        title="Eliminar sede"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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

            {/* Módulo Preparado: Pasarela de Pagos en Línea (Superadmin) */}
            <div className="pt-6 border-t border-[#222] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-brand-yellow/15 border border-brand-yellow/30 flex items-center justify-center text-brand-yellow">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase text-white font-display">
                      Pasarela de Pagos en Línea (Wompi / Bold / PSE)
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      Módulo para cobro automático con Tarjeta de Crédito, PSE, Nequi y Bancolombia.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-[#202020] text-gray-400 border border-[#333]">
                  🔒 Próximamente (Control Superadmin)
                </span>
              </div>

              <div className="bg-[#181818] border border-[#2b2b2b] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Estado de Pagos en Línea</span>
                    <span className="text-[11px] text-gray-400">
                      Actualmente los clientes pagan contra entrega (Efectivo, Nequi, Daviplata o Datáfono físico).
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 font-black text-[10px] uppercase">
                    Inactivo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#252525] text-[11px]">
                  <div className="p-2.5 rounded-xl bg-[#131313] border border-[#262626]">
                    <strong className="text-brand-yellow block mb-0.5">Wompi / Bancolombia</strong>
                    <span className="text-gray-400 text-[10px]">Tarjetas, Nequi QR y Botón Bancolombia automático.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#131313] border border-[#262626]">
                    <strong className="text-brand-yellow block mb-0.5">Bold Datafono & Link</strong>
                    <span className="text-gray-400 text-[10px]">Links PSE y cobro directo desde datáfonos Bold.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#131313] border border-[#262626]">
                    <strong className="text-brand-yellow block mb-0.5">Mercado Pago / ePayco</strong>
                    <span className="text-gray-400 text-[10px]">Cobros con checkout seguro y webhook instantáneo.</span>
                  </div>
                </div>

                <p className="text-[10px] text-gray-500 italic">
                  ℹ️ Cuando desees activar los pagos en línea, el Superadmin podrá habilitar la pasarela con su Llave Pública y Secreta sin necesidad de modificar el código de la aplicación.
                </p>
              </div>
            </div>
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
        <div 
          onClick={() => setIsTableModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#141414] border border-[#2a2a2a] rounded-3xl max-w-md w-full p-6 space-y-4 relative"
          >
            <div className="flex justify-between items-center pb-2 border-b border-[#252525]">
              <h3 className="text-lg font-black uppercase text-white font-display">
                CREAR NUEVA MESA
              </h3>
              <button
                type="button"
                aria-label="Cerrar modal"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsTableModalOpen(false);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsTableModalOpen(false);
                }}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-full bg-[#1c1c1c] hover:bg-[#252525] active:scale-90 transition border border-[#333] cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
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
        <div 
          onClick={() => setIsCatModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#141414] border border-[#2a2a2a] rounded-3xl max-w-md w-full p-6 space-y-4 relative"
          >
            <div className="flex justify-between items-center pb-2 border-b border-[#252525]">
              <h3 className="text-lg font-black uppercase text-white font-display">
                {editingCat ? 'EDITAR CATEGORÍA' : 'NUEVA CATEGORÍA'}
              </h3>
              <button
                type="button"
                aria-label="Cerrar modal"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsCatModalOpen(false);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsCatModalOpen(false);
                }}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-full bg-[#1c1c1c] hover:bg-[#252525] active:scale-90 transition border border-[#333] cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
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

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">
                  Categoría Padre (Si es una subcategoría)
                </label>
                <select
                  value={catFormData.parentId}
                  onChange={(e) => setCatFormData({ ...catFormData, parentId: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white text-xs"
                >
                  <option value="">⭐ Ninguna (Es Categoría Principal)</option>
                  {categoryList
                    .filter((c) => !c.parentId && c.id !== editingCat?.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        ↳ Subcategoría de: {c.nombre}
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  Ejemplo: Selecciona "Bebidas" si estás creando "Gaseosas" o "Cócteles".
                </p>
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
      {/* MODAL: SUBCATEGORÍA DEDICADA                             */}
      {/* ======================================================== */}
      {isSubcatModalOpen && (
        <div 
          onClick={() => setIsSubcatModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#141414] border border-[#2a2a2a] rounded-3xl max-w-md w-full p-6 space-y-4 relative"
          >
            <div className="flex justify-between items-center pb-2 border-b border-[#252525]">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-brand-yellow" />
                <h3 className="text-lg font-black uppercase text-white font-display">
                  {editingSubcat ? 'EDITAR SUBCATEGORÍA' : 'NUEVA SUBCATEGORÍA'}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Cerrar modal"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsSubcatModalOpen(false);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsSubcatModalOpen(false);
                }}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-full bg-[#1c1c1c] hover:bg-[#252525] active:scale-90 transition border border-[#333] cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Crea una subcategoría y vincúlala a su categoría principal correspondiente.
            </p>

            <form onSubmit={handleSaveSubcategory} className="space-y-3.5 text-xs">
              {/* Parent Category Selector */}
              <div>
                <label className="block text-gray-200 font-extrabold uppercase mb-1">
                  Categoría Principal Asociada *
                </label>
                <select
                  required
                  value={subcatFormData.parentId}
                  onChange={(e) => setSubcatFormData({ ...subcatFormData, parentId: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-brand-yellow/50 rounded-xl px-4 py-2.5 text-brand-yellow font-bold text-xs focus:outline-none"
                >
                  <option value="">-- Selecciona una categoría principal --</option>
                  {categoryList
                    .filter((c) => !c.parentId)
                    .map((mainCat) => (
                      <option key={mainCat.id} value={mainCat.id}>
                        ⭐ {mainCat.nombre}
                      </option>
                    ))}
                </select>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Los productos de esta subcategoría pertenecerán a esta sección principal.
                </span>
              </div>

              {/* Subcategory Name */}
              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">
                  Nombre de la Subcategoría *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Gaseosas, Cócteles, Jugos Naturales..."
                  value={subcatFormData.nombre}
                  onChange={(e) => {
                    const val = e.target.value;
                    const autoSlug = val
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)+/g, '');
                    setSubcatFormData({
                      ...subcatFormData,
                      nombre: val,
                      slug: editingSubcat ? subcatFormData.slug : autoSlug,
                    });
                  }}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-white text-xs"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">
                  Slug (Identificador URL)
                </label>
                <input
                  type="text"
                  placeholder="gaseosas, cocteles..."
                  value={subcatFormData.slug}
                  onChange={(e) => setSubcatFormData({ ...subcatFormData, slug: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2 text-white font-mono text-xs"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">
                  Descripción (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Descripción de la subcategoría..."
                  value={subcatFormData.descripcion}
                  onChange={(e) => setSubcatFormData({ ...subcatFormData, descripcion: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2 text-white text-xs resize-none"
                />
              </div>

              {/* Order & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Orden de Aparición</label>
                  <input
                    type="number"
                    value={subcatFormData.orden}
                    onChange={(e) => setSubcatFormData({ ...subcatFormData, orden: Number(e.target.value) })}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Estado</label>
                  <select
                    value={subcatFormData.activo ? 'true' : 'false'}
                    onChange={(e) => setSubcatFormData({ ...subcatFormData, activo: e.target.value === 'true' })}
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
                  onClick={() => setIsSubcatModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#202020] text-gray-400 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-yellow text-black font-black uppercase rounded-xl shadow-glow"
                >
                  Guardar Subcategoría
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
        <div 
          onClick={() => setIsProductModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#141414] border border-[#2a2a2a] rounded-3xl max-w-md w-full p-6 space-y-4 relative"
          >
            <div className="flex justify-between items-center pb-2 border-b border-[#252525]">
              <h3 className="text-lg font-black uppercase text-white font-display">
                {editingProduct ? 'EDITAR PRODUCTO' : 'AGREGAR PRODUCTO'}
              </h3>
              <button
                type="button"
                aria-label="Cerrar modal"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsProductModalOpen(false);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsProductModalOpen(false);
                }}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-full bg-[#1c1c1c] hover:bg-[#252525] active:scale-90 transition border border-[#333] cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
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
                  <label className="block text-gray-300 font-bold uppercase mb-1">Categoría Principal *</label>
                  <select
                    value={productFormData.categoriaSlug}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setProductFormData({
                        ...productFormData,
                        categoriaSlug: newCat,
                        subcategoriaSlug: '',
                      });
                    }}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white text-xs"
                  >
                    {categoryList
                      .filter((c) => !c.parentId)
                      .map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.nombre}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Subcategoría (Opcional)</label>
                  <select
                    value={productFormData.subcategoriaSlug}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, subcategoriaSlug: e.target.value })
                    }
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white text-xs"
                  >
                    <option value="">-- Sin subcategoría --</option>
                    {categoryList
                      .filter((c) => {
                        const parent = categoryList.find((p) => p.slug === productFormData.categoriaSlug);
                        return parent && (c.parentId === parent.id || c.parentId === parent.slug);
                      })
                      .map((sub) => (
                        <option key={sub.id} value={sub.slug}>
                          {sub.nombre}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Precio Venta (COP) *</label>
                  <input
                    type="number"
                    required
                    placeholder="25000"
                    value={productFormData.precio}
                    onChange={(e) => setProductFormData({ ...productFormData, precio: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Costo Unitario (COP)</label>
                  <input
                    type="number"
                    placeholder="12000 (Opcional)"
                    value={productFormData.costo}
                    onChange={(e) => setProductFormData({ ...productFormData, costo: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2 text-white text-xs"
                  />
                </div>
              </div>

              {/* SECCIÓN INVENTARIO Y STOCK */}
              <div className="bg-[#181818] border border-[#2c2c2c] rounded-2xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-xs block">Control de Inventario / Stock</span>
                    <span className="text-[10px] text-gray-400">Descuenta unidades al vender y apaga el plato en 0</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productFormData.controlarStock}
                      onChange={(e) => setProductFormData({ ...productFormData, controlarStock: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-yellow"></div>
                  </label>
                </div>

                {productFormData.controlarStock && (
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#262626]">
                    <div>
                      <label className="block text-gray-300 font-bold uppercase text-[10px] mb-1">Stock Actual (Uds) *</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Ej: 20"
                        value={productFormData.stock}
                        onChange={(e) => setProductFormData({ ...productFormData, stock: e.target.value })}
                        className="w-full bg-[#121212] border border-[#383838] focus:border-brand-yellow rounded-xl px-3 py-1.5 text-white text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-bold uppercase text-[10px] mb-1">Stock Mínimo Alerta</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Ej: 5"
                        value={productFormData.stockMinimo}
                        onChange={(e) => setProductFormData({ ...productFormData, stockMinimo: e.target.value })}
                        className="w-full bg-[#121212] border border-[#383838] focus:border-brand-yellow rounded-xl px-3 py-1.5 text-white text-xs"
                      />
                    </div>
                  </div>
                )}
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
                  <label className="block text-gray-300 font-bold uppercase mb-1">Etiqueta (Badge)</label>
                  <input
                    type="text"
                    placeholder="PROMO, COMBO, MÁS VENDIDO..."
                    value={productFormData.etiqueta}
                    onChange={(e) => setProductFormData({ ...productFormData, etiqueta: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2 text-white text-xs"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['PROMO', 'COMBO', 'MÁS VENDIDO', 'NUEVO', 'RECOMENDADO'].map((badge) => (
                      <button
                        key={badge}
                        type="button"
                        onClick={() => setProductFormData({ ...productFormData, etiqueta: badge })}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition ${
                          productFormData.etiqueta === badge
                            ? 'bg-brand-yellow text-black'
                            : 'bg-[#222] text-gray-400 hover:text-white'
                        }`}
                      >
                        +{badge}
                      </button>
                    ))}
                  </div>
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
        <div 
          onClick={() => setIsUserModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#141414] border border-[#2a2a2a] rounded-3xl max-w-md w-full p-6 space-y-4 relative"
          >
            <div className="flex justify-between items-center pb-2 border-b border-[#252525]">
              <h3 className="text-lg font-black uppercase text-white font-display">
                {editingUser ? 'EDITAR USUARIO / STAFF' : 'CREAR USUARIO / STAFF'}
              </h3>
              <button
                type="button"
                aria-label="Cerrar modal"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsUserModalOpen(false);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsUserModalOpen(false);
                }}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-full bg-[#1c1c1c] hover:bg-[#252525] active:scale-90 transition border border-[#333] cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
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
                <div className="relative">
                  <input
                    type={showUserModalPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl pl-4 pr-10 py-2.5 text-white text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUserModalPassword(!showUserModalPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-brand-yellow transition"
                    title={showUserModalPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showUserModalPassword ? <EyeOff className="w-4 h-4 text-brand-yellow" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Rol</label>
                  <select
                    value={userFormData.rol}
                    onChange={(e) => setUserFormData({ ...userFormData, rol: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white text-xs"
                  >
                    <option value="Superadmin">Superadmin</option>
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

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Sede de Asignación</label>
                <select
                  value={userFormData.branchId ? String(userFormData.branchId) : ''}
                  onChange={(e) =>
                    setUserFormData({
                      ...userFormData,
                      branchId: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white text-xs"
                >
                  <option value="">Acceso Global / Todas las Sedes (Superadmin)</option>
                  {branches.map((b) => (
                    <option key={b.id} value={String(b.id)}>
                      {b.nombre} ({b.ciudad})
                    </option>
                  ))}
                </select>
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

      {/* ======================================================== */}
      {/* MODAL: CREAR / EDITAR SEDE                                */}
      {/* ======================================================== */}
      {isBranchModalOpen && (
        <div 
          onClick={() => setIsBranchModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#141414] border border-[#2a2a2a] rounded-3xl max-w-md w-full p-6 space-y-4 relative shadow-2xl"
          >
            <div className="flex justify-between items-center pb-2 border-b border-[#252525]">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand-yellow" />
                <h3 className="text-lg font-black uppercase text-white font-display">
                  {editingBranch ? 'EDITAR SEDE / SUCURSAL' : 'CREAR NUEVA SEDE'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBranchModalOpen(false)}
                className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white rounded-full bg-[#1c1c1c] hover:bg-[#252525] transition border border-[#333]"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Nombre de la Sede *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sede Granada (Principal)"
                  value={branchFormData.nombre}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoSlug = name
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)+/g, '');
                    setBranchFormData({
                      ...branchFormData,
                      nombre: name,
                      slug: editingBranch ? branchFormData.slug : autoSlug,
                    });
                  }}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-white text-xs focus:border-brand-yellow focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Slug / Identificador Único *</label>
                <input
                  type="text"
                  required
                  placeholder="ej: granada, ciudad-jardin, norte"
                  value={branchFormData.slug}
                  onChange={(e) => setBranchFormData({ ...branchFormData, slug: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-white text-xs font-mono focus:border-brand-yellow focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Dirección Física</label>
                <input
                  type="text"
                  placeholder="Calle 9 # 45-12, Barrio Granada"
                  value={branchFormData.direccion}
                  onChange={(e) => setBranchFormData({ ...branchFormData, direccion: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-white text-xs focus:border-brand-yellow focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="3229088736"
                    value={branchFormData.telefono}
                    onChange={(e) => setBranchFormData({ ...branchFormData, telefono: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white text-xs focus:border-brand-yellow focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Ciudad</label>
                  <input
                    type="text"
                    required
                    value={branchFormData.ciudad}
                    onChange={(e) => setBranchFormData({ ...branchFormData, ciudad: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white text-xs focus:border-brand-yellow focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Estado</label>
                <select
                  value={branchFormData.activo ? 'true' : 'false'}
                  onChange={(e) => setBranchFormData({ ...branchFormData, activo: e.target.value === 'true' })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white text-xs"
                >
                  <option value="true">Activa (Disponible para asignación y pedidos)</option>
                  <option value="false">Inactiva (Temporalmente cerrada)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#202020] text-gray-400 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-yellow text-black font-black uppercase rounded-xl shadow-glow hover:bg-brand-yellowHover transition"
                >
                  {editingBranch ? 'Guardar Cambios' : 'Crear Sede'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ABRIR TURNO DE CAJA                               */}
      {/* ======================================================== */}
      {isOpenShiftModalOpen && (
        <div 
          onClick={() => setIsOpenShiftModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#141414] border border-[#2a2a2a] rounded-3xl max-w-md w-full p-6 space-y-4 relative"
          >
            <div className="flex justify-between items-center pb-2 border-b border-[#252525]">
              <h3 className="text-lg font-black uppercase text-white font-display">
                ABRIR TURNO DE CAJA
              </h3>
              <button
                type="button"
                aria-label="Cerrar modal"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpenShiftModalOpen(false);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpenShiftModalOpen(false);
                }}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-full bg-[#1c1c1c] hover:bg-[#252525] active:scale-90 transition border border-[#333] cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
            <form onSubmit={handleOpenShiftSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Nombre del Cajero *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carlos Gómez"
                  value={openShiftData.cajero}
                  onChange={(e) => setOpenShiftData({ ...openShiftData, cajero: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Base Inicial en Efectivo (COP) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="100000"
                  value={openShiftData.baseInicial}
                  onChange={(e) => setOpenShiftData({ ...openShiftData, baseInicial: Number(e.target.value) })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-white text-xs"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">Dinero en monedas y billetes para cambio al inicio del turno.</span>
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Observaciones / Notas</label>
                <textarea
                  rows={2}
                  placeholder="Turno mañana / noche..."
                  value={openShiftData.notas}
                  onChange={(e) => setOpenShiftData({ ...openShiftData, notas: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2 text-white text-xs resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpenShiftModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#202020] text-gray-400 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-yellow text-black font-black uppercase rounded-xl shadow-glow"
                >
                  Confirmar Apertura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: REGISTRAR EGRESO / GASTO MENOR                    */}
      {/* ======================================================== */}
      {isExpenseModalOpen && (
        <div 
          onClick={() => setIsExpenseModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#141414] border border-[#2a2a2a] rounded-3xl max-w-md w-full p-6 space-y-4 relative"
          >
            <div className="flex justify-between items-center pb-2 border-b border-[#252525]">
              <h3 className="text-lg font-black uppercase text-white font-display">
                REGISTRAR SALIDA / EGRESO DE CAJA
              </h3>
              <button
                type="button"
                aria-label="Cerrar modal"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsExpenseModalOpen(false);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsExpenseModalOpen(false);
                }}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-full bg-[#1c1c1c] hover:bg-[#252525] active:scale-90 transition border border-[#333] cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
            <form onSubmit={handleAddExpenseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Motivo / Descripción *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Compra de 2 bolsas de hielo"
                  value={expenseFormData.descripcion}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, descripcion: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Monto de Salida (COP) *</label>
                <input
                  type="number"
                  required
                  min="100"
                  placeholder="15000"
                  value={expenseFormData.monto}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, monto: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Categoría</label>
                <select
                  value={expenseFormData.categoria}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, categoria: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white text-xs"
                >
                  <option value="Insumos">Insumos (Hielo, gas, empaques)</option>
                  <option value="Domicilios">Pago Carreras Domiciliario</option>
                  <option value="Personal">Anticipo / Propinas Personal</option>
                  <option value="Varios">Varios / Otros</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#202020] text-gray-400 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black uppercase rounded-xl"
                >
                  Guardar Egreso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CIERRE Y CUADRE DE CAJA                           */}
      {/* ======================================================== */}
      {isCloseShiftModalOpen && activeShift && (
        <div 
          onClick={() => setIsCloseShiftModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#141414] border border-[#2a2a2a] rounded-3xl max-w-md w-full p-6 space-y-4 relative"
          >
            <div className="flex justify-between items-center pb-2 border-b border-[#252525]">
              <h3 className="text-lg font-black uppercase text-white font-display">
                CIERRE DE TURNO Y CUADRE DE CAJA
              </h3>
              <button
                type="button"
                aria-label="Cerrar modal"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsCloseShiftModalOpen(false);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsCloseShiftModalOpen(false);
                }}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-full bg-[#1c1c1c] hover:bg-[#252525] active:scale-90 transition border border-[#333] cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Calculated expectations */}
            <div className="bg-[#1b1b1b] p-3.5 rounded-2xl border border-[#2a2a2a] space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Base Inicial:</span>
                <span className="font-bold text-white">{formatPrice(activeShift.baseInicial)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Ventas en Efectivo:</span>
                <span className="font-bold text-emerald-400">+{formatPrice(activeShift.ventasEfectivo || 0)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Total Egresos:</span>
                <span className="font-bold text-red-400">-{formatPrice(activeShift.totalEgresos || 0)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-brand-yellow pt-2 border-t border-[#262626]">
                <span>Total Esperado en Efectivo:</span>
                <span>{formatPrice(activeShift.totalEfectivoEsperado || (activeShift.baseInicial + (activeShift.ventasEfectivo || 0) - (activeShift.totalEgresos || 0)))}</span>
              </div>
            </div>

            <form onSubmit={handleCloseShiftSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">
                  Efectivo Físico Contado en Gaveta (COP) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="Ingresa el dinero físico que contaste"
                  value={closeShiftData.efectivoReal}
                  onChange={(e) => setCloseShiftData({ ...closeShiftData, efectivoReal: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:border-brand-yellow"
                />

                {/* Live Difference Calculation */}
                {closeShiftData.efectivoReal !== '' && (
                  <div className="mt-2 p-2.5 rounded-xl bg-[#1e1e1e] border border-[#333] flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-400">Diferencia de Cuadre:</span>
                    {(() => {
                      const expected = activeShift.totalEfectivoEsperado || (activeShift.baseInicial + (activeShift.ventasEfectivo || 0) - (activeShift.totalEgresos || 0));
                      const diff = Number(closeShiftData.efectivoReal) - expected;
                      if (diff === 0) {
                        return <span className="text-emerald-400 font-black">✓ Cuadre Exacto ($0)</span>;
                      } else if (diff > 0) {
                        return <span className="text-emerald-400 font-black">+{formatPrice(diff)} (Sobrante)</span>;
                      } else {
                        return <span className="text-red-400 font-black">{formatPrice(diff)} (Faltante)</span>;
                      }
                    })()}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Observaciones de Cierre</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre faltante, billetes deteriorados, etc..."
                  value={closeShiftData.notas}
                  onChange={(e) => setCloseShiftData({ ...closeShiftData, notas: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2 text-white text-xs resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCloseShiftModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#202020] text-gray-400 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black uppercase rounded-xl shadow-lg"
                >
                  Confirmar y Cerrar Turno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREAR / EDITAR ADICIONAL (TOPPING)                */}
      {/* ======================================================== */}
      {isAddonModalOpen && (
        <div 
          onClick={() => setIsAddonModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#141414] border border-[#2a2a2a] rounded-3xl max-w-md w-full p-6 space-y-4 relative"
          >
            <div className="flex justify-between items-center pb-2 border-b border-[#252525]">
              <h3 className="text-lg font-black uppercase text-white font-display">
                {editingAddon ? 'EDITAR ADICIONAL' : 'CREAR NUEVO ADICIONAL'}
              </h3>
              <button
                type="button"
                aria-label="Cerrar modal"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsAddonModalOpen(false);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsAddonModalOpen(false);
                }}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-full bg-[#1c1c1c] hover:bg-[#252525] active:scale-90 transition border border-[#333] cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
            <form onSubmit={handleSaveAddon} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Nombre del Adicional *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Tocineta Ahumada Crispy"
                  value={addonFormData.nombre}
                  onChange={(e) => setAddonFormData({ ...addonFormData, nombre: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Precio (COP) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="4000"
                    value={addonFormData.precio}
                    onChange={(e) => setAddonFormData({ ...addonFormData, precio: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-2.5 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Categoría</label>
                  <select
                    value={addonFormData.categoria}
                    onChange={(e) => setAddonFormData({ ...addonFormData, categoria: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white text-xs"
                  >
                    <option value="Toppings">Toppings</option>
                    <option value="Salsas">Salsas</option>
                    <option value="Acompañamientos">Acompañamientos</option>
                    <option value="Bebidas">Bebidas</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddonModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#202020] text-gray-400 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-yellow text-black font-black uppercase rounded-xl"
                >
                  Guardar Adicional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POS Thermal Receipt Modal for Invoicing and Kitchen Tickets */}
      <ThermalReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        order={receiptOrder}
        ticketType={receiptType}
      />

    </div>
  );
}
