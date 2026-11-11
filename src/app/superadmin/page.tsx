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
  ArrowRight,
  Database,
  Server,
  Download,
  HardDrive,
  FileCode,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Key,
  UserPlus,
  Globe
} from 'lucide-react';
import { swalCustom, showSuccess, showError, showConfirm } from '@/lib/swal';
import { FoodImagePresetSelector } from '@/components/admin/FoodImagePresetSelector';
import { LogoPresetSelector } from '@/components/admin/LogoPresetSelector';

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
  mostrarEnLanding?: boolean;
  fechaVencimiento?: string | null;
  limiteSedes?: number;
  limiteProductos?: number;
  limiteUsuarios?: number;
  estadoLicencia?: string;
  databaseType?: string;
  dbHost?: string;
  dbPort?: number;
  dbName?: string;
  dbUser?: string;
  dbPassword?: string;
  dbConnectionUrl?: string;
  dbStatus?: string;
  migratedAt?: string;
  createdAt: string;
  branches: Array<{ id: number; nombre: string; slug: string; activo: boolean }>;
  users?: Array<{
    id: number;
    nombre: string;
    email: string;
    rol: string;
    estado: string;
    password?: string;
    branchId?: number | null;
  }>;
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [restaurants, setRestaurants] = useState<RestaurantItem[]>([]);
  const [metrics, setMetrics] = useState({
    totalRestaurantes: 0,
    activos: 0,
    totalVentasPlataforma: 0,
    totalPedidosPlataforma: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Verificación de credenciales de Superadmin
  useEffect(() => {
    try {
      const stored =
        localStorage.getItem('punto_g_admin_logged_in') ||
        localStorage.getItem('puntog_user') ||
        localStorage.getItem('punto_g_user');
      if (stored) {
        const u = JSON.parse(stored);
        const role = (u?.rol || u?.role || '').toLowerCase();
        if (role === 'superadmin') {
          setCurrentUser(u);
          setAuthChecked(true);
          return;
        } else {
          // Guardar usuario para mostrar advertencia descriptiva
          setCurrentUser(u);
        }
      }
    } catch (e) {
      console.error('Error al verificar sesión superadmin:', e);
    }
    setAuthChecked(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('punto_g_admin_logged_in');
    localStorage.removeItem('puntog_user');
    localStorage.removeItem('punto_g_user');
    localStorage.removeItem('punto_g_active_restaurant');
    window.location.href = '/login?logout=true';
  };

  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantItem | null>(null);

  // Estados avanzados para Edición de Restaurante, Admin y Staff
  const [editTab, setEditTab] = useState<'branding' | 'admin' | 'staff'>('branding');
  const [editStaffUsers, setEditStaffUsers] = useState<Array<{
    id: number;
    nombre: string;
    email: string;
    rol: string;
    estado: string;
    password?: string;
    branchId?: number | null;
  }>>([]);
  const [newStaff, setNewStaff] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'Mesero',
    branchId: '',
  });
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showStaffPasswords, setShowStaffPasswords] = useState<Record<number, boolean>>({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Modal de Servidor de Base de Datos & Migración Monolítica (Exclusivo Superadmin)
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [dbModalRestaurant, setDbModalRestaurant] = useState<RestaurantItem | null>(null);
  const [dbFormData, setDbFormData] = useState({
    databaseType: 'SHARED',
    dbHost: '',
    dbPort: 3306,
    dbName: '',
    dbUser: '',
    dbPassword: '',
    dbConnectionUrl: '',
  });
  const [exportingSql, setExportingSql] = useState(false);
  const [exportingJson, setExportingJson] = useState(false);
  const [savingDb, setSavingDb] = useState(false);

  // Modal de Agregar Sede a un restaurante
  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState(false);
  const [branchRestaurant, setBranchRestaurant] = useState<RestaurantItem | null>(null);
  const [branchFormData, setBranchFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    ciudad: 'Cali',
  });
  const [creatingBranch, setCreatingBranch] = useState(false);

  // Modal de Limpieza / Reset de Base de Datos y Datos de Prueba (Con Clave Superadmin)
  const [isDbCleanupModalOpen, setIsDbCleanupModalOpen] = useState(false);
  const [dbCleanupTargetRestaurant, setDbCleanupTargetRestaurant] = useState<RestaurantItem | null>(null);
  const [dbCleanupSlugInput, setDbCleanupSlugInput] = useState('');
  const [dbCleanupSuperadminPassword, setDbCleanupSuperadminPassword] = useState('');
  const [showDbCleanupPass, setShowDbCleanupPass] = useState(false);
  const [dbCleanupProcessing, setDbCleanupProcessing] = useState(false);

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
      const res = await fetch(`/api/restaurants?_t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.restaurants || [];
        setRestaurants(list);
        if (data.metrics) {
          setMetrics(data.metrics);
        } else {
          setMetrics({
            totalRestaurantes: list.length,
            activos: list.filter((r: any) => r.activo).length,
            totalVentasPlataforma: 0,
            totalPedidosPlataforma: list.reduce((acc: number, r: any) => acc + (r._count?.orders || 0), 0),
          });
        }
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
        const createdData = await res.json();
        const createdSlug = createdData.slug || formData.slug || formData.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const adminEmail = createdData.adminUser?.email || formData.adminEmail || `admin@${createdSlug}.com`;
        const adminPass = createdData.adminUser?.password || formData.adminPassword || 'admin123';

        await swalCustom.fire({
          title: '🏢 ¡RESTAURANTE CREADO CON ÉXITO!',
          html: `
            <div class="text-left text-xs space-y-3">
              <p>El restaurante <strong class="text-brand-yellow font-bold">${formData.nombre}</strong> está listo.</p>
              
              <div class="bg-black/60 p-3 rounded-xl border border-white/10 space-y-2">
                <div class="text-gray-300"><strong>🌐 Menú Web:</strong> <code class="text-brand-yellow">/r/${createdSlug}</code></div>
                <div class="text-gray-300"><strong>👤 Admin Email:</strong> <code class="text-emerald-400 font-bold">${adminEmail}</code></div>
                <div class="text-gray-300"><strong>🔑 Contraseña:</strong> <code class="text-emerald-400 font-bold">${adminPass}</code></div>
              </div>

              <div class="pt-2 flex flex-col gap-2">
                <a href="/r/${createdSlug}/admin" target="_blank" class="py-2.5 px-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black uppercase text-center rounded-xl shadow-glow block">
                  🚀 Ir a Administrar este Restaurante (/r/${createdSlug}/admin)
                </a>
                <a href="/r/${createdSlug}/login?tab=staff" target="_blank" class="py-2 px-3 bg-[#222] hover:bg-[#333] text-white font-bold uppercase text-center rounded-xl border border-[#444] block">
                  🔑 Iniciar Sesión como Administrador
                </a>
                <a href="/r/${createdSlug}" target="_blank" class="py-2 px-3 bg-[#111] hover:bg-[#222] text-gray-300 font-bold uppercase text-center rounded-xl border border-[#333] block">
                  📱 Ver Carta Digital
                </a>
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'Cerrar',
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
        if (err.existingSlug) {
          const result = await swalCustom.fire({
            title: 'Identificador (slug) ya ocupado',
            html: `
              <div class="text-left text-xs space-y-2.5">
                <p class="text-gray-300">${err.error}</p>
                <div class="p-3 rounded-xl bg-black/50 border border-amber-500/30 text-amber-300">
                  Slug existente en base de datos: <strong class="font-mono">${err.existingSlug}</strong>
                  ${err.existingRestaurant?.nombre ? ` (${err.existingRestaurant.nombre})` : ''}
                </div>
                <p class="text-gray-400">¿Deseas abrir el panel de <strong>Limpieza / Eliminación con Clave Superadmin</strong> para reiniciar desde cero o eliminar ese registro y liberar el slug?</p>
              </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '🧹 Limpiar / Eliminar ese Registro',
            cancelButtonText: 'Cambiar Nombre/Slug',
          });
          if (result.isConfirmed) {
            setIsCreateModalOpen(false);
            setDbCleanupTargetRestaurant(err.existingRestaurant || null);
            setDbCleanupSlugInput(err.existingSlug);
            setIsDbCleanupModalOpen(true);
            loadRestaurants();
          }
        } else {
          showError('Error al crear', err.error || 'No se pudo registrar');
        }
      }
    } catch (e) {
      showError('Error de conexión', 'Fallo al comunicarse con el servidor');
    }
  };

  // Abrir modal de edición
  const handleOpenEdit = (rest: RestaurantItem) => {
    setSelectedRestaurant(rest);
    const adminUser = rest.users?.find((u) => u.rol === 'Administrador' || u.rol === 'Superadmin');
    const staffList = (rest.users || [])
      .filter((u) => u.id !== adminUser?.id)
      .map((u) => ({ ...u, password: u.password || '' }));

    setFormData({
      nombre: rest.nombre || '',
      slug: rest.slug || '',
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
      adminNombre: adminUser?.nombre || '',
      adminEmail: adminUser?.email || '',
      adminPassword: adminUser?.password || '',
    });
    setEditStaffUsers(staffList);
    setNewStaff({
      nombre: '',
      email: '',
      password: '',
      rol: 'Mesero',
      branchId: '',
    });
    setEditTab('branding');
    setShowAdminPassword(false);
    setShowStaffPasswords({});
    setIsEditModalOpen(true);
  };

  // Guardar edición
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant) return;
    setSavingEdit(true);

    try {
      const payload: any = {
        ...formData,
        updatedUsers: editStaffUsers,
      };

      if (newStaff.email.trim() && newStaff.password.trim()) {
        payload.newUser = {
          ...newStaff,
          email: newStaff.email.trim().toLowerCase(),
          password: newStaff.password.trim(),
        };
      }

      const res = await fetch(`/api/restaurants/${selectedRestaurant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showSuccess('Restaurante Actualizado', 'Los cambios en la marca, colores, administrador y usuarios fueron guardados con éxito.');
        setIsEditModalOpen(false);
        setSelectedRestaurant(null);
        loadRestaurants();
      } else {
        const err = await res.json();
        showError('Error al guardar', err.error || 'No se pudo actualizar');
      }
    } catch (e) {
      showError('Error de conexión', 'No se pudo conectar con el servidor');
    } finally {
      setSavingEdit(false);
    }
  };

  // Eliminar usuario de staff
  const handleDeleteStaffUser = async (userId: number, userNombre: string) => {
    if (!selectedRestaurant) return;
    const confirmed = await showConfirm({
      title: '¿Eliminar usuario?',
      text: `Se eliminará al usuario ${userNombre} de este restaurante.`,
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/restaurants/${selectedRestaurant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteUserId: userId }),
      });
      if (res.ok) {
        setEditStaffUsers((prev) => prev.filter((u) => u.id !== userId));
        showSuccess('Usuario Eliminado', `El usuario ${userNombre} fue eliminado correctamente.`);
        loadRestaurants();
      }
    } catch (e) {
      showError('Error', 'No se pudo eliminar el usuario');
    }
  };

  // Abrir Modal de Servidor de Base de Datos y Migración
  const handleOpenDbModal = (rest: RestaurantItem) => {
    setDbModalRestaurant(rest);
    setDbFormData({
      databaseType: rest.databaseType || 'SHARED',
      dbHost: rest.dbHost || '',
      dbPort: rest.dbPort || 3306,
      dbName: rest.dbName || `puntog_${rest.slug.replace(/[^a-zA-Z0-9_]/g, '_')}`,
      dbUser: rest.dbUser || 'root',
      dbPassword: rest.dbPassword || '',
      dbConnectionUrl: rest.dbConnectionUrl || '',
    });
    setIsDbModalOpen(true);
  };

  // Descargar Dump SQL completo para Monolítico Independiente
  const handleDownloadSql = async () => {
    if (!dbModalRestaurant) return;
    setExportingSql(true);
    try {
      const res = await fetch(`/api/superadmin/restaurants/${dbModalRestaurant.id}/migrate-db`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export_sql',
          dbName: dbFormData.dbName,
        }),
      });

      if (!res.ok) {
        showError('Error', 'No se pudo generar el script SQL');
        return;
      }

      const data = await res.json();
      const blob = new Blob([data.sql], { type: 'application/sql' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename || `migracion_${dbModalRestaurant.slug}_monolitico.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showSuccess(
        'Script SQL Generado',
        `Se descargó el archivo con ${data.summary.productos} platos, ${data.summary.pedidos} pedidos y ${data.summary.sedes} sedes listo para montar el servidor monolítico independiente.`
      );
    } catch (e) {
      showError('Error', 'Fallo al descargar script SQL');
    } finally {
      setExportingSql(false);
    }
  };

  // Descargar Snapshot JSON completo de migración
  const handleDownloadJson = async () => {
    if (!dbModalRestaurant) return;
    setExportingJson(true);
    try {
      const res = await fetch(`/api/superadmin/restaurants/${dbModalRestaurant.id}/migrate-db`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export_json' }),
      });

      if (!res.ok) {
        showError('Error', 'No se pudo generar backup JSON');
        return;
      }

      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${dbModalRestaurant.slug}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showSuccess('Backup Descargado', 'Se descargó el archivo JSON con toda la información.');
    } catch (e) {
      showError('Error', 'Fallo al descargar backup JSON');
    } finally {
      setExportingJson(false);
    }
  };

  // Guardar configuración del servidor de BD dedicada
  const handleSaveDbConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbModalRestaurant) return;
    setSavingDb(true);
    try {
      const res = await fetch(`/api/superadmin/restaurants/${dbModalRestaurant.id}/migrate-db`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_db_config',
          ...dbFormData,
        }),
      });

      if (res.ok) {
        showSuccess('Servidor de BD Guardado', 'La configuración de la base de datos se actualizó correctamente.');
        setIsDbModalOpen(false);
        loadRestaurants();
      } else {
        const err = await res.json();
        showError('Error al guardar BD', err.error || 'No se pudo actualizar');
      }
    } catch (e) {
      showError('Error', 'Fallo de conexión');
    } finally {
      setSavingDb(false);
    }
  };

  // Alternar visibilidad en la Landing Page
  const handleToggleLanding = async (rest: RestaurantItem) => {
    const newState = rest.mostrarEnLanding === false ? true : false;
    try {
      const res = await fetch(`/api/restaurants/${rest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mostrarEnLanding: newState }),
      });
      if (res.ok) {
        setRestaurants((prev) =>
          prev.map((r) => (r.id === rest.id ? { ...r, mostrarEnLanding: newState } : r))
        );
        showSuccess(
          newState ? 'Visible en Landing' : 'Oculto en Landing',
          `El negocio ${rest.nombre} ahora ${newState ? 'aparece' : 'no aparece'} en la vitrina de la landing page.`
        );
        loadRestaurants();
      } else {
        const err = await res.json().catch(() => ({}));
        showError('Error al cambiar visibilidad', err.error || 'No se pudo actualizar en el servidor');
      }
    } catch (e) {
      showError('Error', 'Fallo al cambiar visibilidad en landing');
    }
  };

  // Alternar estado activo / suspendido
  const handleToggleActive = async (rest: RestaurantItem) => {
    const newState = !rest.activo;
    try {
      const res = await fetch(`/api/restaurants/${rest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: newState, estadoLicencia: newState ? 'ACTIVA' : 'SUSPENDIDA' }),
      });
      if (res.ok) {
        setRestaurants((prev) =>
          prev.map((r) =>
            r.id === rest.id ? { ...r, activo: newState, estadoLicencia: newState ? 'ACTIVA' : 'SUSPENDIDA' } : r
          )
        );
        showSuccess(
          newState ? 'Restaurante Activado' : 'Restaurante Suspendido',
          `El negocio ${rest.nombre} ahora está ${newState ? 'en línea' : 'suspendido'}.`
        );
        loadRestaurants();
      } else {
        const err = await res.json().catch(() => ({}));
        showError('Error al cambiar estado', err.error || 'No se pudo actualizar el estado del restaurante');
      }
    } catch (e) {
      showError('Error', 'Fallo al cambiar estado');
    }
  };

  // Renovar / Extender Licencia SaaS
  const handleExtendLicense = async (rest: RestaurantItem, days: number) => {
    try {
      const currentExp = rest.fechaVencimiento ? new Date(rest.fechaVencimiento) : new Date();
      const baseDate = currentExp > new Date() ? currentExp : new Date();
      baseDate.setDate(baseDate.getDate() + days);

      const res = await fetch(`/api/restaurants/${rest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fechaVencimiento: baseDate.toISOString(),
          estadoLicencia: 'ACTIVA',
          activo: true,
        }),
      });

      if (res.ok) {
        showSuccess('Licencia Extendida', `La licencia de ${rest.nombre} ha sido extendida por +${days} días hasta el ${baseDate.toLocaleDateString()}.`);
        loadRestaurants();
      } else {
        showError('Error', 'No se pudo actualizar la licencia');
      }
    } catch {
      showError('Error de red', 'Fallo al comunicarse con el servidor');
    }
  };

  // Abrir modal de agregar sede a restaurante
  const handleOpenAddBranch = (rest: RestaurantItem) => {
    setBranchRestaurant(rest);
    setBranchFormData({
      nombre: '',
      direccion: rest.direccionCentral || '',
      telefono: rest.telefonoWhatsapp || '',
      ciudad: rest.ciudad || 'Cali',
    });
    setIsAddBranchModalOpen(true);
  };

  // Guardar nueva sede para el restaurante
  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchRestaurant) return;
    setCreatingBranch(true);
    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...branchFormData,
          restaurantId: branchRestaurant.id,
        }),
      });
      if (res.ok) {
        const createdBranch = await res.json();
        setRestaurants((prev) =>
          prev.map((r) => {
            if (r.id !== branchRestaurant.id) return r;
            const updatedBranches = [...(r.branches || []), createdBranch];
            return {
              ...r,
              branches: updatedBranches,
              _count: {
                orders: r._count?.orders || 0,
                products: r._count?.products || 0,
                categories: r._count?.categories || 0,
                tables: r._count?.tables || 0,
                users: r._count?.users || 0,
                branches: updatedBranches.length,
              },
            };
          })
        );
        showSuccess(
          'Sede Registrada Exitosamente',
          `La nueva sede "${branchFormData.nombre}" ha sido creada para ${branchRestaurant.nombre}.`
        );
        setIsAddBranchModalOpen(false);
        loadRestaurants();
      } else {
        const err = await res.json();
        showError('Error al crear sede', err.error || 'No se pudo registrar');
      }
    } catch (e) {
      showError('Error', 'Fallo al comunicarse con el servidor');
    } finally {
      setCreatingBranch(false);
    }
  };

  // Abrir modal de Limpieza / Reset de Base de Datos y Datos de Prueba
  const handleOpenDbCleanupModal = (rest?: RestaurantItem | null, slugOverride?: string) => {
    setDbCleanupTargetRestaurant(rest || null);
    setDbCleanupSlugInput(slugOverride || rest?.slug || '');
    setIsDbCleanupModalOpen(true);
  };

  // Ejecutar acción de Limpieza / Reset / Eliminación / Carga de Pruebas con Clave Superadmin
  const handleExecuteDbAction = async (
    action: 'reset_restaurant_zero' | 'delete_restaurant' | 'seed_restaurant_demo' | 'reset_all_zero' | 'seed_all_demo',
    options?: { deleteSecondaryRestaurants?: boolean }
  ) => {
    if (!dbCleanupSuperadminPassword.trim()) {
      showError('Clave requerida', 'Por favor ingresa la clave del Superadmin para autorizar esta operación en la base de datos.');
      return;
    }

    const targetId = dbCleanupTargetRestaurant?.id || null;
    const targetSlug = dbCleanupSlugInput.trim().toLowerCase() || dbCleanupTargetRestaurant?.slug || '';

    if (
      (action === 'reset_restaurant_zero' || action === 'delete_restaurant' || action === 'seed_restaurant_demo') &&
      !targetId &&
      !targetSlug
    ) {
      showError('Selecciona un restaurante o escribe su slug', 'Debes seleccionar un restaurante o escribir su identificador (slug) para ejecutar esta acción.');
      return;
    }

    setDbCleanupProcessing(true);
    try {
      const res = await fetch('/api/admin/db-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          superadminPassword: dbCleanupSuperadminPassword.trim(),
          restaurantId: targetId,
          slug: targetSlug,
          deleteSecondaryRestaurants: Boolean(options?.deleteSecondaryRestaurants),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await showSuccess('Operación Completada', data.message || 'La operación sobre la base de datos se ejecutó con éxito.');
        if (action === 'delete_restaurant') {
          setDbCleanupTargetRestaurant(null);
          setDbCleanupSlugInput('');
        }
        await loadRestaurants();
      } else {
        showError('No se pudo ejecutar', data.error || 'Verifica la clave del Superadmin e inténtalo de nuevo.');
      }
    } catch (e) {
      showError('Error de conexión', 'No se pudo comunicar con el servidor para gestionar la base de datos.');
    } finally {
      setDbCleanupProcessing(false);
    }
  };

  // Filtrar restaurantes
  const filtered = restaurants.filter(
    (r) =>
      (r.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.slug || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.ciudad || '').toLowerCase().includes(search.toLowerCase())
  );

  // Protección de acceso al Superadmin
  const isSuperadmin =
    currentUser && (currentUser.rol || currentUser.role || '').toLowerCase() === 'superadmin';

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6 text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
          <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">Verificando credenciales Superadmin...</span>
        </div>
      </div>
    );
  }

  if (authChecked && !isSuperadmin) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6 text-white font-sans">
        <div className="bg-[#121212] border border-purple-500/30 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-black uppercase text-white font-display">
              Acceso Restringido SaaS
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Esta es la consola central del Superadmin de la plataforma. Tu usuario actual no tiene privilegios de Superadministrador para ver o modificar otros clientes.
            </p>
            {currentUser && (
              <div className="mt-3 p-2.5 rounded-xl bg-[#181818] border border-[#282828] text-[11px] text-gray-300 text-left space-y-1">
                <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Sesión detectada en navegador:</div>
                <div className="flex items-center justify-between">
                  <strong className="text-white">{currentUser.nombre || currentUser.email}</strong>
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                    {currentUser.rol || currentUser.role || 'Usuario'}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('punto_g_admin_logged_in');
                localStorage.removeItem('puntog_user');
                localStorage.removeItem('punto_g_user');
                localStorage.removeItem('punto_g_active_restaurant');
                window.location.href = '/login?redirect=/superadmin&switch=true';
              }}
              className="py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider transition shadow-glow flex items-center justify-center gap-2 cursor-pointer"
            >
              <Key className="w-4 h-4" />
              <span>Iniciar Sesión como Superadmin</span>
            </button>
            <Link
              href={currentUser?.restaurant?.slug ? `/r/${currentUser.restaurant.slug}/admin` : '/admin'}
              className="py-3 px-4 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] text-gray-300 font-bold text-xs uppercase tracking-wider border border-[#2e2e2e] transition"
            >
              Ir a mi Panel de Administración
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans pb-16">
      {/* Header Superior Superadmin - Siempre Visible y Fijo */}
      <header className="sticky top-0 z-50 bg-[#0d0d0d]/98 backdrop-blur-md border-b border-[#262626] px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-brand-yellow flex items-center justify-center font-black text-black shadow-glow shrink-0">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase text-white font-display tracking-wider flex items-center gap-2">
              <span>PANEL SUPERADMIN</span>
              <span className="text-[10px] bg-brand-yellow text-black font-black px-2 py-0.5 rounded-md">
                SAAS MULTI-RESTAURANTE
              </span>
            </h1>
            <p className="text-[11px] text-gray-400">
              Administración centralizada de restaurantes, sedes, landing pages y bases de datos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {currentUser && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#181818] border border-[#2e2e2e] text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-gray-400 text-[11px]">Superadmin:</span>
              <span className="font-bold text-white text-[11px]">{currentUser.nombre || currentUser.email}</span>
            </div>
          )}

          <button
            type="button"
            onClick={loadRestaurants}
            className="p-2.5 rounded-xl bg-[#181818] hover:bg-[#252525] border border-[#333] text-gray-300 hover:text-white transition cursor-pointer"
            title="Recargar datos de la plataforma"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-yellow' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => handleOpenDbCleanupModal(null, '')}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600/15 hover:bg-red-600/25 text-red-300 border border-red-500/40 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
            title="Limpiar base de datos, eliminar restaurantes por slug o cargar datos de prueba (Con Clave Superadmin)"
          >
            <Database className="w-4 h-4 text-red-400" />
            <span>🧹 Limpiar / Reset BD</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 via-brand-yellow to-yellow-500 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-glow transition hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Crear Restaurante</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition cursor-pointer"
            title="Cerrar sesión Superadmin"
          >
            <Power className="w-4 h-4" />
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

                  {/* Enlace y Rutas Dedicadas del Cliente */}
                  <div className="bg-[#181818] border border-[#262626] rounded-2xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">
                        Rutas por Cliente:
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                          rest.databaseType === 'DEDICATED'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'bg-white/5 text-gray-400 border border-white/10'
                        }`}
                      >
                        {rest.databaseType === 'DEDICATED' ? 'BD Monolítica Dedicada' : 'BD Cluster Compartida'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-[11px] font-mono">
                      <Link
                        href={`/r/${rest.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-[#111] hover:bg-[#222] text-brand-yellow font-bold text-center border border-[#282828] truncate block"
                        title="Ver Landing del Cliente"
                      >
                        /r/{rest.slug}
                      </Link>
                      <Link
                        href={`/r/${rest.slug}/menu`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-[#111] hover:bg-[#222] text-gray-300 hover:text-white font-bold text-center border border-[#282828] truncate block"
                        title="Ver Menú del Cliente"
                      >
                        /menu
                      </Link>
                      <Link
                        href={`/r/${rest.slug}/rastreo`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-[#111] hover:bg-[#222] text-gray-300 hover:text-white font-bold text-center border border-[#282828] truncate block"
                        title="Ver Rastreo de Pedidos del Cliente"
                      >
                        /rastreo
                      </Link>
                    </div>

                    <p className="text-[10px] text-gray-500 truncate">{rest.direccionCentral} • {rest.ciudad}</p>
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

                  {/* Listado de Sedes de este restaurante */}
                  <div className="bg-[#161616] border border-[#242424] rounded-2xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-brand-yellow" />
                        <span>Sedes Físicas ({rest.branches?.length || 0}):</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenAddBranch(rest)}
                        className="text-[10px] font-black text-brand-yellow hover:underline flex items-center gap-1 cursor-pointer"
                        title="Agregar nueva sede a este restaurante"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" />
                        <span>Nueva Sede</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {rest.branches && rest.branches.length > 0 ? (
                        rest.branches.map((b) => (
                          <span
                            key={b.id}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                              b.activo
                                ? 'bg-[#202020] text-gray-200 border-[#333]'
                                : 'bg-red-950/30 text-red-400 border-red-900/40 line-through'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${b.activo ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            <span>{b.nombre}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-gray-500 italic">Sin sedes registradas aún</span>
                      )}
                    </div>
                  </div>

                  {/* Credenciales de Acceso Administrador */}
                  {(() => {
                    const adminUser = rest.users?.find(u => u.rol === 'Administrador' || u.rol === 'Superadmin') || rest.users?.[0];
                    if (!adminUser) return null;
                    return (
                      <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl p-3 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-brand-yellow flex items-center gap-1.5 tracking-wider">
                            <Key className="w-3.5 h-3.5 text-brand-yellow" />
                            <span>Acceso Admin del Negocio</span>
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono truncate max-w-[120px]">
                            {adminUser.nombre}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div className="bg-[#181818] px-3 py-1.5 rounded-xl border border-[#2d2d2d] flex items-center justify-between gap-1 overflow-hidden">
                            <span className="text-gray-400 text-[10px] uppercase font-bold shrink-0">Email:</span>
                            <span className="text-gray-200 font-mono font-bold truncate select-all" title={adminUser.email}>{adminUser.email}</span>
                          </div>
                          <div className="bg-[#181818] px-3 py-1.5 rounded-xl border border-[#2d2d2d] flex items-center justify-between gap-1">
                            <span className="text-gray-400 text-[10px] uppercase font-bold shrink-0">Clave:</span>
                            <span className="text-emerald-400 font-mono font-black select-all">{adminUser.password || '••••••••'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Botón Principal: Administrar Restaurante */}
                  <Link
                    href={`/r/${rest.slug}/admin`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        localStorage.setItem(
                          'punto_g_active_restaurant',
                          JSON.stringify({
                            id: rest.id,
                            nombre: rest.nombre,
                            slug: rest.slug,
                            colorPrimario: rest.colorPrimario,
                            branches: rest.branches || [],
                          })
                        );
                        // Mantener el rol Superadmin para poder administrar cualquier restaurante sin perder acceso a /superadmin
                        const existingAuth = localStorage.getItem('punto_g_admin_logged_in');
                        if (!existingAuth) {
                          const adminUser = rest.users?.find((u) => u.rol === 'Administrador' || u.rol === 'Superadmin');
                          const authUser = {
                            id: adminUser?.id || currentUser?.id || 1,
                            nombre: currentUser?.nombre || adminUser?.nombre || `Admin ${rest.nombre}`,
                            email: currentUser?.email || adminUser?.email || `admin@${rest.slug}.com`,
                            rol: 'Superadmin',
                            restaurantId: rest.id,
                            branchId: rest.branches?.[0]?.id || null,
                            restaurant: {
                              id: rest.id,
                              nombre: rest.nombre,
                              slug: rest.slug,
                              branches: rest.branches || [],
                            },
                          };
                          localStorage.setItem('punto_g_admin_logged_in', JSON.stringify(authUser));
                        }
                      }
                    }}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-400 via-brand-yellow to-yellow-500 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-glow transition hover:scale-[1.01] active:scale-95"
                  >
                    <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                    <span>Administrar este Restaurante</span>
                    <ExternalLink className="w-4 h-4 ml-auto stroke-[2.5]" />
                  </Link>

                  {/* Botones Secundarios: Iniciar Sesión Admin & Ver Menú Digital */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/r/${rest.slug}/login?tab=staff`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 bg-[#1e1e1e] hover:bg-[#282828] text-white border border-[#333] font-bold text-[11px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition hover:scale-105"
                    >
                      <Lock className="w-3.5 h-3.5 text-brand-yellow" />
                      <span>Login Admin</span>
                      <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                    </Link>
                    <Link
                      href={`/r/${rest.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 bg-[#1e1e1e] hover:bg-[#282828] text-white border border-[#333] font-bold text-[11px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition hover:scale-105"
                    >
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ver Carta Web</span>
                      <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                    </Link>
                  </div>

                  {/* Control de Licencia SaaS */}
                  <div className="bg-[#181818] border border-[#282828] rounded-2xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-bold uppercase text-[10px]">Plan & Licencia:</span>
                      <span className="px-2 py-0.5 rounded-md font-black text-[10px] bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/30">
                        {rest.plan || 'Pro'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 text-[11px]">Vencimiento:</span>
                      <span className="font-bold text-white text-[11px]">
                        {rest.fechaVencimiento
                          ? new Date(rest.fechaVencimiento).toLocaleDateString()
                          : 'Indefinida'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleExtendLicense(rest, 30)}
                        className="flex-1 py-1 px-2 rounded-lg bg-[#222] hover:bg-[#333] text-gray-300 hover:text-white text-[10px] font-bold border border-[#333] transition text-center cursor-pointer"
                        title="Extender 30 días"
                      >
                        +30 Días
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExtendLicense(rest, 365)}
                        className="flex-1 py-1 px-2 rounded-lg bg-brand-yellow/15 hover:bg-brand-yellow/25 text-brand-yellow text-[10px] font-bold border border-brand-yellow/30 transition text-center cursor-pointer"
                        title="Extender 1 año"
                      >
                        +1 Año
                      </button>
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
                  <div className="flex items-center gap-2">
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

                    <button
                      type="button"
                      onClick={() => handleToggleLanding(rest)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition flex items-center gap-1.5 cursor-pointer ${
                        rest.mostrarEnLanding !== false
                          ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40'
                          : 'bg-[#1c1c1c] hover:bg-[#282828] text-gray-500 border border-[#2e2e2e]'
                      }`}
                      title={rest.mostrarEnLanding !== false ? 'Visible en la vitrina de la Landing Page' : 'Oculto en la Landing Page'}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{rest.mostrarEnLanding !== false ? 'En Landing' : 'Oculto'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Botón de Limpieza desde Cero / Datos Demo / Eliminar con Clave Superadmin */}
                    <button
                      type="button"
                      onClick={() => handleOpenDbCleanupModal(rest, rest.slug)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/25 text-red-400 rounded-xl border border-red-500/30 transition cursor-pointer"
                      title="Limpiar desde cero, cargar datos de prueba o eliminar restaurante (Con Clave Superadmin)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Botón de Servidor de Base de Datos y Migración */}
                    <button
                      type="button"
                      onClick={() => handleOpenDbModal(rest)}
                      className={`p-2 rounded-xl border transition cursor-pointer ${
                        rest.databaseType === 'DEDICATED'
                          ? 'bg-blue-950/40 text-blue-300 border-blue-500/50 hover:bg-blue-900/50'
                          : 'bg-[#1c1c1c] hover:bg-[#282828] text-gray-300 hover:text-white border-[#333]'
                      }`}
                      title="Servidor de Base de Datos & Migración Monolítica"
                    >
                      <Database className="w-3.5 h-3.5" />
                    </button>

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
                      title="Editar Título, Branding y Configuración"
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

                  {/* Selector de Logo Prediseñado / Subir */}
                  <div className="col-span-full">
                    <LogoPresetSelector
                      value={formData.logo}
                      onChange={(url) => setFormData({ ...formData, logo: url })}
                      label="Logo del Restaurante"
                    />
                  </div>

                </div>

                {/* Selector de Imagen Hero 3D / Portada */}
                <FoodImagePresetSelector
                  value={formData.bannerHero}
                  onChange={(url) => setFormData({ ...formData, bannerHero: url })}
                  label="Imagen Principal del Restaurante (Formato 3D o Fotografía)"
                  helpText="Escoge un render 3D predeterminado con fondo transparente, sube un archivo desde tu dispositivo o ingresa un enlace web."
                />

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
                      autoComplete="new-password"
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
      {/* MODAL: EDITAR RESTAURANTE, COLORES, ADMIN Y USUARIOS */}
      {/* ======================================================== */}
      {isEditModalOpen && selectedRestaurant && (
        <div
          onClick={() => setIsEditModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#121212] border-2 border-brand-yellow/60 rounded-3xl max-w-3xl w-full p-5 sm:p-7 space-y-4 shadow-2xl relative my-8"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#252525]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-yellow/15 border border-brand-yellow/30 flex items-center justify-center text-brand-yellow font-black">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black uppercase text-white font-display">
                    CONFIGURAR: {selectedRestaurant.nombre}
                  </h3>
                  <span className="text-xs text-gray-400 font-mono">
                    /r/{selectedRestaurant.slug}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full bg-[#1c1c1c] text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-[#222] pb-2 text-xs">
              <button
                type="button"
                onClick={() => setEditTab('branding')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all ${
                  editTab === 'branding'
                    ? 'bg-brand-yellow text-black shadow-glow'
                    : 'bg-[#181818] text-gray-300 hover:text-white'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Identidad y Colores</span>
              </button>
              <button
                type="button"
                onClick={() => setEditTab('admin')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all ${
                  editTab === 'admin'
                    ? 'bg-brand-yellow text-black shadow-glow'
                    : 'bg-[#181818] text-gray-300 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Principal</span>
              </button>
              <button
                type="button"
                onClick={() => setEditTab('staff')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all ${
                  editTab === 'staff'
                    ? 'bg-brand-yellow text-black shadow-glow'
                    : 'bg-[#181818] text-gray-300 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Staff y Claves ({editStaffUsers.length})</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* TAB 1: BRANDING & COLORES */}
              {editTab === 'branding' && (
                <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 font-bold uppercase mb-1">
                        Nombre Comercial / Título
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="w-full bg-[#181818] border border-[#2d2d2d] focus:border-brand-yellow rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-bold uppercase mb-1">
                        Eslogan / Subtítulo
                      </label>
                      <input
                        type="text"
                        value={formData.eslogan}
                        onChange={(e) => setFormData({ ...formData, eslogan: e.target.value })}
                        className="w-full bg-[#181818] border border-[#2d2d2d] focus:border-brand-yellow rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-bold uppercase mb-1">
                      Descripción del Restaurante
                    </label>
                    <textarea
                      rows={2}
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      className="w-full bg-[#181818] border border-[#2d2d2d] focus:border-brand-yellow rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  {/* Colores */}
                  <div className="bg-[#181818] border border-[#262626] rounded-2xl p-3.5 space-y-2.5">
                    <span className="text-[11px] font-black uppercase text-brand-yellow tracking-wider block">
                      🎨 Paleta de Colores de la Marca
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-gray-300 font-bold uppercase mb-1 text-[10px]">
                          Color Primario
                        </label>
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
                            className="w-full bg-[#121212] border border-[#333] rounded-xl px-2 py-1.5 text-white font-mono text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-300 font-bold uppercase mb-1 text-[10px]">
                          Color Secundario / Acento
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formData.colorSecundario}
                            onChange={(e) => setFormData({ ...formData, colorSecundario: e.target.value })}
                            className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={formData.colorSecundario}
                            onChange={(e) => setFormData({ ...formData, colorSecundario: e.target.value })}
                            className="w-full bg-[#121212] border border-[#333] rounded-xl px-2 py-1.5 text-white font-mono text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-300 font-bold uppercase mb-1 text-[10px]">
                          Color de Fondo (Tema)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formData.colorFondo}
                            onChange={(e) => setFormData({ ...formData, colorFondo: e.target.value })}
                            className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={formData.colorFondo}
                            onChange={(e) => setFormData({ ...formData, colorFondo: e.target.value })}
                            className="w-full bg-[#121212] border border-[#333] rounded-xl px-2 py-1.5 text-white font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selector de Logo Prediseñado / Subir */}
                  <div className="pt-1">
                    <LogoPresetSelector
                      value={formData.logo}
                      onChange={(url) => setFormData({ ...formData, logo: url })}
                      label="Logo del Restaurante"
                    />
                  </div>

                  {/* Selector de Imagen Hero 3D / Portada */}
                  <FoodImagePresetSelector
                    value={formData.bannerHero}
                    onChange={(url) => setFormData({ ...formData, bannerHero: url })}
                    label="Imagen Principal del Restaurante (Formato 3D o Fotografía)"
                    helpText="Escoge un render 3D predeterminado con fondo transparente, sube un archivo desde tu dispositivo o ingresa un enlace web."
                  />

                  {/* Contacto & Plan */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-300 font-bold uppercase mb-1">
                        WhatsApp Pedidos
                      </label>
                      <input
                        type="tel"
                        value={formData.telefonoWhatsapp}
                        onChange={(e) => setFormData({ ...formData, telefonoWhatsapp: e.target.value })}
                        className="w-full bg-[#181818] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-bold uppercase mb-1">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        value={formData.ciudad}
                        onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                        className="w-full bg-[#181818] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-bold uppercase mb-1">
                        Plan SaaS
                      </label>
                      <select
                        value={formData.plan}
                        onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                        className="w-full bg-[#181818] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white font-bold"
                      >
                        <option value="Basico">Plan Básico</option>
                        <option value="Pro">Plan Pro</option>
                        <option value="Enterprise">Plan Enterprise</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-bold uppercase mb-1">
                      Dirección Central / Principal
                    </label>
                    <input
                      type="text"
                      value={formData.direccionCentral}
                      onChange={(e) => setFormData({ ...formData, direccionCentral: e.target.value })}
                      className="w-full bg-[#181818] border border-[#2d2d2d] rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: ADMINISTRADOR PRINCIPAL */}
              {editTab === 'admin' && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  <div className="bg-brand-yellow/10 border border-brand-yellow/30 p-3.5 rounded-2xl flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-brand-yellow flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">
                        Cuenta de Acceso Administrativo
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Este usuario tiene permiso para gestionar el menú, pedidos, finanzas y sedes de este negocio tanto en <code className="text-brand-yellow">/login</code> como en <code className="text-brand-yellow">/r/{selectedRestaurant.slug}/admin</code>.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 font-bold uppercase mb-1">
                        Nombre del Administrador
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Juan Pérez"
                        value={formData.adminNombre}
                        onChange={(e) => setFormData({ ...formData, adminNombre: e.target.value })}
                        className="w-full bg-[#181818] border border-[#2d2d2d] focus:border-brand-yellow rounded-xl px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 font-bold uppercase mb-1">
                        Correo de Acceso (Email)
                      </label>
                      <input
                        type="email"
                        placeholder="admin@restaurante.com"
                        value={formData.adminEmail}
                        onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                        className="w-full bg-[#181818] border border-[#2d2d2d] focus:border-brand-yellow rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-gray-300 font-bold uppercase">
                        Contraseña del Administrador
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const randomPass = 'Admin' + Math.floor(1000 + Math.random() * 9000);
                          setFormData({ ...formData, adminPassword: randomPass });
                          setShowAdminPassword(true);
                        }}
                        className="text-[10px] text-brand-yellow font-bold hover:underline"
                      >
                        Generar clave aleatoria
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.adminPassword}
                        onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                        className="w-full bg-[#181818] border border-[#2d2d2d] focus:border-brand-yellow rounded-xl pl-3 pr-10 py-2.5 text-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white"
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: STAFF Y CLAVES */}
              {editTab === 'staff' && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {/* Lista de usuarios existentes */}
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider block">
                      Usuarios Registrados ({editStaffUsers.length})
                    </span>

                    {editStaffUsers.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-[#181818] border border-[#242424] text-center text-gray-400 text-xs">
                        No hay usuarios adicionales registrados para este restaurante. Agrega meseros, cajeros o cocineros abajo.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {editStaffUsers.map((user, idx) => (
                          <div
                            key={user.id}
                            className="bg-[#181818] border border-[#282828] p-3 rounded-2xl space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-white/10 text-brand-yellow flex items-center justify-center font-bold text-xs">
                                  {user.nombre[0]}
                                </div>
                                <div>
                                  <input
                                    type="text"
                                    value={user.nombre}
                                    onChange={(e) => {
                                      const updated = [...editStaffUsers];
                                      updated[idx].nombre = e.target.value;
                                      setEditStaffUsers(updated);
                                    }}
                                    className="bg-transparent font-bold text-white text-xs border-b border-transparent hover:border-gray-600 focus:border-brand-yellow focus:outline-none"
                                  />
                                  <input
                                    type="email"
                                    value={user.email}
                                    onChange={(e) => {
                                      const updated = [...editStaffUsers];
                                      updated[idx].email = e.target.value;
                                      setEditStaffUsers(updated);
                                    }}
                                    className="bg-transparent text-[11px] text-gray-400 block border-b border-transparent hover:border-gray-600 focus:border-brand-yellow focus:outline-none"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <select
                                  value={user.rol}
                                  onChange={(e) => {
                                    const updated = [...editStaffUsers];
                                    updated[idx].rol = e.target.value;
                                    setEditStaffUsers(updated);
                                  }}
                                  className="bg-[#121212] border border-[#333] rounded-xl px-2 py-1 text-white font-bold text-[11px]"
                                >
                                  <option value="Mesero">Mesero</option>
                                  <option value="Cocina">Cocina</option>
                                  <option value="Cajero">Cajero</option>
                                  <option value="Administrador">Administrador</option>
                                </select>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteStaffUser(user.id, user.nombre)}
                                  className="p-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition"
                                  title="Eliminar usuario"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Contraseña editable con mostrar/ocultar */}
                            <div className="flex items-center gap-2 pt-1 border-t border-[#222]">
                              <span className="text-[10px] text-gray-400 font-bold uppercase w-16">
                                Clave:
                              </span>
                              <div className="relative flex-1">
                                <input
                                  type={showStaffPasswords[user.id] ? 'text' : 'password'}
                                  value={user.password || ''}
                                  onChange={(e) => {
                                    const updated = [...editStaffUsers];
                                    updated[idx].password = e.target.value;
                                    setEditStaffUsers(updated);
                                  }}
                                  className="w-full bg-[#121212] border border-[#333] rounded-lg pl-2 pr-8 py-1 text-white font-mono text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowStaffPasswords((prev) => ({
                                      ...prev,
                                      [user.id]: !prev[user.id],
                                    }))
                                  }
                                  className="absolute right-2 top-1.5 text-gray-400 hover:text-white"
                                >
                                  {showStaffPasswords[user.id] ? (
                                    <EyeOff className="w-3.5 h-3.5" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Formulario rápido para agregar nuevo miembro */}
                  <div className="bg-[#181818] border border-[#2e2e2e] p-3.5 rounded-2xl space-y-2.5">
                    <span className="text-[11px] font-black uppercase text-brand-yellow tracking-wider flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4" />
                      Agregar Nuevo Personal a este Restaurante
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Nombre completo (ej. Carlos Mesero)"
                        value={newStaff.nombre}
                        onChange={(e) => setNewStaff({ ...newStaff, nombre: e.target.value })}
                        className="bg-[#121212] border border-[#333] rounded-xl px-2.5 py-1.5 text-white text-xs"
                      />
                      <input
                        type="email"
                        placeholder="Correo de acceso (ej. carlos@restaurante.com)"
                        value={newStaff.email}
                        onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                        className="bg-[#121212] border border-[#333] rounded-xl px-2.5 py-1.5 text-white text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Contraseña inicial"
                        value={newStaff.password}
                        onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                        className="bg-[#121212] border border-[#333] rounded-xl px-2.5 py-1.5 text-white font-mono text-xs"
                      />
                      <select
                        value={newStaff.rol}
                        onChange={(e) => setNewStaff({ ...newStaff, rol: e.target.value })}
                        className="bg-[#121212] border border-[#333] rounded-xl px-2.5 py-1.5 text-white font-bold text-xs"
                      >
                        <option value="Mesero">Rol: Mesero</option>
                        <option value="Cocina">Rol: Cocina</option>
                        <option value="Cajero">Rol: Cajero</option>
                      </select>
                      <select
                        value={newStaff.branchId}
                        onChange={(e) => setNewStaff({ ...newStaff, branchId: e.target.value })}
                        className="bg-[#121212] border border-[#333] rounded-xl px-2.5 py-1.5 text-white font-bold text-xs"
                      >
                        <option value="">Todas las Sedes</option>
                        {(selectedRestaurant.branches || []).map((b) => (
                          <option key={b.id} value={b.id}>
                            Sede: {b.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-2 pt-3 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#202020] hover:bg-[#252525] text-gray-400 font-bold rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 py-2.5 bg-brand-yellow hover:bg-yellow-400 text-black font-black uppercase rounded-xl shadow-glow cursor-pointer transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingEdit ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar Todo</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: SERVIDOR DE BASE DE DATOS & MIGRACIÓN MONOLÍTICA */}
      {/* ======================================================== */}
      {isDbModalOpen && dbModalRestaurant && (
        <div
          onClick={() => setIsDbModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#121212] border-2 border-blue-500/60 rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl relative"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#252525]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black uppercase text-white font-display flex items-center gap-2">
                    <span>SERVIDOR BD & MIGRACIÓN MONOLÍTICA</span>
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Cliente: <strong className="text-white">{dbModalRestaurant.nombre}</strong> (ID: {dbModalRestaurant.id}, Slug: {dbModalRestaurant.slug})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDbModalOpen(false)}
                className="p-1 rounded-full bg-[#202020] text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Status Banner */}
            <div
              className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                dbModalRestaurant.databaseType === 'DEDICATED'
                  ? 'bg-blue-950/20 border-blue-500/40 text-blue-200'
                  : 'bg-[#181818] border-[#2b2b2b] text-gray-300'
              }`}
            >
              <Server className="w-5 h-5 text-brand-yellow flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase tracking-wider text-white">Estado Actual:</span>
                  <span
                    className={`font-black text-[10px] uppercase px-2 py-0.5 rounded-full ${
                      dbModalRestaurant.databaseType === 'DEDICATED'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : 'bg-amber-500/20 text-yellow-300 border border-yellow-500/40'
                    }`}
                  >
                    {dbModalRestaurant.databaseType === 'DEDICATED'
                      ? 'Base de Datos Monolítica Dedicada'
                      : 'Cluster Multi-Tenant Compartido'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {dbModalRestaurant.databaseType === 'DEDICATED'
                    ? `Este cliente ya cuenta con servidor MySQL independiente (${dbModalRestaurant.dbHost || 'Local'}).`
                    : 'Actualmente comparte el pool de datos principal del SaaS. Puedes exportar o conectar a un servidor MySQL independiente si el cliente creció.'}
                </p>
              </div>
            </div>

            {/* Migration Engine Buttons */}
            <div className="bg-[#181818] border border-[#262626] rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-black uppercase text-white flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-brand-yellow" />
                <span>Generador de Migración Monolítica Independiente</span>
              </h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Genera el script SQL de MySQL con todas las tablas e inserts de {dbModalRestaurant.nombre} (sedes, categorías, platos, pedidos, comandas, mesas y usuarios) listo para montar un servidor standalone.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadSql}
                  disabled={exportingSql}
                  className="py-2.5 px-3 bg-brand-yellow hover:bg-yellow-400 text-black font-black text-xs uppercase rounded-xl flex items-center justify-center gap-2 shadow-glow transition cursor-pointer disabled:opacity-50"
                >
                  <Download className={`w-4 h-4 ${exportingSql ? 'animate-bounce' : ''}`} />
                  <span>{exportingSql ? 'Generando Dump...' : 'Descargar Script SQL (.sql)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadJson}
                  disabled={exportingJson}
                  className="py-2.5 px-3 bg-[#222] hover:bg-[#2c2c2c] text-white font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-2 border border-[#3a3a3a] transition cursor-pointer disabled:opacity-50"
                >
                  <FileCode className={`w-4 h-4 text-blue-400 ${exportingJson ? 'animate-spin' : ''}`} />
                  <span>{exportingJson ? 'Exportando...' : 'Descargar Snapshot JSON'}</span>
                </button>
              </div>
            </div>

            {/* Server Connection Form */}
            <form onSubmit={handleSaveDbConfig} className="space-y-3 text-xs">
              <h4 className="text-xs font-black uppercase text-white flex items-center gap-2 pt-1">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>Parámetros de Conexión del Servidor Dedicado</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">
                    Host / Servidor MySQL
                  </label>
                  <input
                    type="text"
                    placeholder="localhost o 192.168.1.50"
                    value={dbFormData.dbHost}
                    onChange={(e) => setDbFormData({ ...dbFormData, dbHost: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">
                    Puerto
                  </label>
                  <input
                    type="number"
                    placeholder="3306"
                    value={dbFormData.dbPort}
                    onChange={(e) => setDbFormData({ ...dbFormData, dbPort: Number(e.target.value) })}
                    className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">
                    Nombre de Base de Datos
                  </label>
                  <input
                    type="text"
                    placeholder={`puntog_${dbModalRestaurant.slug}`}
                    value={dbFormData.dbName}
                    onChange={(e) => setDbFormData({ ...dbFormData, dbName: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">
                    Usuario de la BD
                  </label>
                  <input
                    type="text"
                    placeholder="root o dbuser"
                    value={dbFormData.dbUser}
                    onChange={(e) => setDbFormData({ ...dbFormData, dbUser: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-bold uppercase mb-1">
                  Contraseña del Servidor Dedicado
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={dbFormData.dbPassword}
                  onChange={(e) => setDbFormData({ ...dbFormData, dbPassword: e.target.value })}
                  className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setIsDbModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#202020] text-gray-400 font-bold rounded-xl"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={savingDb}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {savingDb ? 'Guardando...' : 'Guardar Servidor Dedicado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: AGREGAR SEDE A RESTAURANTE */}
      {/* ======================================================== */}
      {isAddBranchModalOpen && branchRestaurant && (
        <div
          onClick={() => setIsAddBranchModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#141414] border-2 border-brand-yellow/60 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#252525]">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-yellow" />
                <div>
                  <h3 className="text-base font-black uppercase text-white font-display">
                    Nueva Sede para {branchRestaurant.nombre}
                  </h3>
                  <p className="text-xs text-gray-400">Punto de venta físico, cocina o despacho</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddBranchModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">
                  Nombre de la Sede *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sede Granada, Sede Ciudad Jardín, Sede Norte..."
                  value={branchFormData.nombre}
                  onChange={(e) => setBranchFormData({ ...branchFormData, nombre: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#333] focus:border-brand-yellow rounded-xl px-3 py-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">
                  Dirección Física
                </label>
                <input
                  type="text"
                  placeholder="Ej: Av 9N # 12-45, Barrio Granada"
                  value={branchFormData.direccion}
                  onChange={(e) => setBranchFormData({ ...branchFormData, direccion: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#333] focus:border-brand-yellow rounded-xl px-3 py-2.5 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 3229088736"
                    value={branchFormData.telefono}
                    onChange={(e) => setBranchFormData({ ...branchFormData, telefono: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#333] focus:border-brand-yellow rounded-xl px-3 py-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    placeholder="Cali"
                    value={branchFormData.ciudad}
                    onChange={(e) => setBranchFormData({ ...branchFormData, ciudad: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#333] focus:border-brand-yellow rounded-xl px-3 py-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-[#252525]">
                <button
                  type="button"
                  onClick={() => setIsAddBranchModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#202020] hover:bg-[#282828] text-gray-300 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingBranch}
                  className="flex-1 py-2.5 bg-brand-yellow hover:bg-yellow-400 text-black font-black uppercase rounded-xl shadow-glow transition cursor-pointer disabled:opacity-50"
                >
                  {creatingBranch ? 'Guardando...' : '+ Crear Sede'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: LIMPIEZA / RESET DE BASE DE DATOS Y DATOS DE PRUEBA (PROTEGIDO CON CLAVE SUPERADMIN) */}
      {/* ======================================================== */}
      {isDbCleanupModalOpen && (
        <div
          onClick={() => setIsDbCleanupModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#121212] border-2 border-red-500/50 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#252525]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-white font-display">
                    CONTROL Y RESET DE BASE DE DATOS (CON CLAVE SUPERADMIN)
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Limpia tablas para iniciar desde cero, libera slugs ocupados o llena con información de pruebas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDbCleanupModalOpen(false)}
                className="p-1.5 rounded-full bg-[#202020] text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Clave de Autorización Superadmin */}
            <div className="bg-[#181818] border border-amber-500/40 rounded-2xl p-4 space-y-2">
              <label className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                <Key className="w-4 h-4" />
                <span>1. Clave del Superadmin (Obligatoria para autorizar) *</span>
              </label>
              <div className="relative">
                <input
                  type={showDbCleanupPass ? 'text' : 'password'}
                  placeholder="Ingresa la contraseña del Superadmin (ej. superadmin123)..."
                  value={dbCleanupSuperadminPassword}
                  onChange={(e) => setDbCleanupSuperadminPassword(e.target.value)}
                  className="w-full bg-[#111] border border-[#333] focus:border-amber-400 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white font-mono outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowDbCleanupPass(!showDbCleanupPass)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-white cursor-pointer"
                >
                  {showDbCleanupPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-gray-400">
                Por seguridad, ninguna operación de limpieza, borrado o llenado se ejecutará sin validar la clave del Superadmin.
              </p>
            </div>

            {/* 2. Acciones por Restaurante Individual (Seleccionar o escribir Slug) */}
            <div className="bg-[#161616] border border-[#282828] rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-brand-yellow" />
                  <span>2. Gestionar un Restaurante Específico (o por Slug oculto)</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-gray-400 font-bold uppercase text-[10px] mb-1">
                    Seleccionar Restaurante de la lista:
                  </label>
                  <select
                    value={dbCleanupTargetRestaurant?.id || ''}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      const found = restaurants.find((r) => r.id === id) || null;
                      setDbCleanupTargetRestaurant(found);
                      if (found) setDbCleanupSlugInput(found.slug);
                    }}
                    className="w-full bg-[#111] border border-[#333] focus:border-brand-yellow rounded-xl px-3 py-2.5 text-white outline-none"
                  >
                    <option value="">-- Seleccionar por lista --</option>
                    {restaurants.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre} (/r/{r.slug}) - ID #{r.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-bold uppercase text-[10px] mb-1">
                    O escribir Identificador (Slug) exacto:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: mi-restaurante, salchi-ricuras..."
                    value={dbCleanupSlugInput}
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase().trim();
                      setDbCleanupSlugInput(val);
                      const match = restaurants.find((r) => r.slug.toLowerCase() === val) || null;
                      setDbCleanupTargetRestaurant(match);
                    }}
                    className="w-full bg-[#111] border border-[#333] focus:border-brand-yellow rounded-xl px-3 py-2.5 text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={dbCleanupProcessing}
                  onClick={() => handleExecuteDbAction('reset_restaurant_zero')}
                  className="p-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-left space-y-1 transition cursor-pointer disabled:opacity-50"
                >
                  <div className="font-black text-xs uppercase flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Iniciar desde Cero</span>
                  </div>
                  <p className="text-[10px] text-gray-300 leading-snug">
                    Vacía categorías, platos, pedidos, inventario y turnos de este restaurante. Mantiene su Sede Principal, usuario Admin y 4 mesas limpias.
                  </p>
                </button>

                <button
                  type="button"
                  disabled={dbCleanupProcessing}
                  onClick={() => handleExecuteDbAction('seed_restaurant_demo')}
                  className="p-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-left space-y-1 transition cursor-pointer disabled:opacity-50"
                >
                  <div className="font-black text-xs uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Llenar Datos Demo</span>
                  </div>
                  <p className="text-[10px] text-gray-300 leading-snug">
                    Carga categorías de prueba (Hamburguesas, Perros, Salchipapas, Bebidas), 5 productos demo, adicionales y 6 mesas.
                  </p>
                </button>

                <button
                  type="button"
                  disabled={dbCleanupProcessing}
                  onClick={() => handleExecuteDbAction('delete_restaurant')}
                  className="p-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-300 text-left space-y-1 transition cursor-pointer disabled:opacity-50"
                >
                  <div className="font-black text-xs uppercase flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Restaurante</span>
                  </div>
                  <p className="text-[10px] text-gray-300 leading-snug">
                    Elimina por completo el restaurante y todas sus tablas asociadas de la BD, liberando su slug y subdominio inmediatamente.
                  </p>
                </button>
              </div>
            </div>

            {/* 3. Reset Global de Toda la Base de Datos */}
            <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-red-300 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-red-400" />
                  <span>3. Reset Global de Todas las Tablas de la Base de Datos</span>
                </span>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                Usa estas opciones si deseas limpiar todas las tablas del sistema para que todos los restaurantes inicien desde cero (sin productos, sin categorías, sin pedidos) o llenar toda la plataforma con datos de prueba.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  disabled={dbCleanupProcessing}
                  onClick={() => handleExecuteDbAction('reset_all_zero', { deleteSecondaryRestaurants: false })}
                  className="p-3 rounded-xl bg-[#1c1c1c] hover:bg-red-950/50 border border-red-500/40 text-white text-left space-y-1 transition cursor-pointer disabled:opacity-50"
                >
                  <div className="font-black text-xs uppercase text-amber-300">
                    🧹 Limpiar Tablas (Dejar Restaurantes en Cero)
                  </div>
                  <p className="text-[10px] text-gray-400 leading-snug">
                    Vacía categorías, platos, pedidos, clientes e inventario de todos los restaurantes, conservando sus cuentas y sedes.
                  </p>
                </button>

                <button
                  type="button"
                  disabled={dbCleanupProcessing}
                  onClick={() => handleExecuteDbAction('reset_all_zero', { deleteSecondaryRestaurants: true })}
                  className="p-3 rounded-xl bg-red-600/20 hover:bg-red-600/35 border border-red-500 text-white text-left space-y-1 transition cursor-pointer disabled:opacity-50"
                >
                  <div className="font-black text-xs uppercase text-red-300">
                    🧨 Reset Total BD (Solo dejar Matriz en Cero)
                  </div>
                  <p className="text-[10px] text-gray-300 leading-snug">
                    Elimina todos los restaurantes secundarios y deja únicamente el restaurante principal limpio desde cero.
                  </p>
                </button>

                <button
                  type="button"
                  disabled={dbCleanupProcessing}
                  onClick={() => handleExecuteDbAction('seed_all_demo')}
                  className="p-3 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/40 text-emerald-300 text-left space-y-1 transition cursor-pointer disabled:opacity-50"
                >
                  <div className="font-black text-xs uppercase text-emerald-300">
                    🧪 Poblar Todos con Datos Demo
                  </div>
                  <p className="text-[10px] text-gray-300 leading-snug">
                    Inyecta categorías, productos, adicionales y mesas de demostración en todos los restaurantes activos.
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
