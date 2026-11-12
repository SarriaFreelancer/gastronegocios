'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  Filter,
  Power,
  RefreshCw,
  Search,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { formatCopPrice, type SaasPlanItem } from '@/lib/saas-plans';
import { showError, showSuccess } from '@/lib/swal';

export interface SuperadminClientLicenseRow {
  id: number;
  nombre: string;
  slug: string;
  ciudad: string;
  plan: string;
  activo: boolean;
  estadoLicencia?: string;
  fechaVencimiento?: string | null;
  limiteSedes?: number;
  limiteProductos?: number;
  limiteUsuarios?: number;
  diasGracia?: number;
  colorPrimario?: string;
  users?: Array<{ nombre: string; email: string; rol: string }>;
  _count?: {
    branches: number;
    products: number;
    orders: number;
    users: number;
  };
}

interface SuperadminLicensesPanelProps {
  restaurants: SuperadminClientLicenseRow[];
  plans: SaasPlanItem[];
  onRefresh: () => Promise<void> | void;
  onExtendLicense: (rest: any, days: number) => Promise<void> | void;
  onToggleActive: (rest: any) => Promise<void> | void;
}

export function computeLicenseStatus(rest: SuperadminClientLicenseRow): {
  code: 'ACTIVA' | 'PRUEBA' | 'POR_VENCER' | 'VENCIDA' | 'SUSPENDIDA';
  label: string;
  badgeClass: string;
  daysLeft: number | null;
} {
  if (!rest.activo || rest.estadoLicencia === 'SUSPENDIDA') {
    return {
      code: 'SUSPENDIDA',
      label: 'Suspendida',
      badgeClass: 'bg-red-500/15 text-red-300 border-red-500/40',
      daysLeft: null,
    };
  }

  let daysLeft: number | null = null;
  if (rest.fechaVencimiento) {
    const diffMs = new Date(rest.fechaVencimiento).getTime() - Date.now();
    daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) {
      return {
        code: 'VENCIDA',
        label: 'Vencida',
        badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        daysLeft,
      };
    }
    if (daysLeft <= 7) {
      return {
        code: 'POR_VENCER',
        label: `Por vencer (${daysLeft}d)`,
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        daysLeft,
      };
    }
  }

  if (rest.estadoLicencia === 'PRUEBA') {
    return {
      code: 'PRUEBA',
      label: daysLeft !== null ? `Prueba (${daysLeft}d)` : 'En Prueba',
      badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      daysLeft,
    };
  }

  return {
    code: 'ACTIVA',
    label: 'Activa',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    daysLeft,
  };
}

export function SuperadminLicensesPanel({
  restaurants,
  plans,
  onRefresh,
  onExtendLicense,
  onToggleActive,
}: SuperadminLicensesPanelProps) {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('TODOS');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [savingId, setSavingId] = useState<number | null>(null);

  const getPlanInfo = (planCode: string): SaasPlanItem | undefined => {
    const clean = (planCode || 'Pro').toLowerCase().trim();
    return (
      plans.find((p) => p.codigo.toLowerCase() === clean || p.nombre.toLowerCase() === clean) ||
      plans.find((p) => clean === 'intermedio' && p.codigo === 'Pro')
    );
  };

  // Metrics calculated from live client licenses and plan prices
  const licenseStats = restaurants.reduce(
    (acc, r) => {
      const status = computeLicenseStatus(r);
      const matchedPlan = getPlanInfo(r.plan);
      if (status.code === 'ACTIVA' || status.code === 'PRUEBA' || status.code === 'POR_VENCER') {
        acc.activeCount += 1;
        if (status.code !== 'PRUEBA') {
          acc.estimatedMrr += matchedPlan?.precioMensual || 0;
        }
      }
      if (status.code === 'POR_VENCER' || status.code === 'PRUEBA') {
        acc.attentionCount += 1;
      }
      if (status.code === 'VENCIDA' || status.code === 'SUSPENDIDA') {
        acc.blockedCount += 1;
      }
      return acc;
    },
    { activeCount: 0, attentionCount: 0, blockedCount: 0, estimatedMrr: 0 }
  );

  const filtered = restaurants.filter((r) => {
    const status = computeLicenseStatus(r);
    const adminUser = r.users?.find((u) => u.rol === 'Administrador' || u.rol === 'Superadmin') || r.users?.[0];
    const matchesSearch =
      !search.trim() ||
      (r.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.slug || '').toLowerCase().includes(search.toLowerCase()) ||
      (adminUser?.email || '').toLowerCase().includes(search.toLowerCase());

    const matchesPlan =
      planFilter === 'TODOS' ||
      (r.plan || 'Pro').toLowerCase() === planFilter.toLowerCase();

    const matchesStatus = statusFilter === 'TODOS' || status.code === statusFilter;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleUpdateClientPlan = async (rest: SuperadminClientLicenseRow, newPlanCode: string) => {
    setSavingId(rest.id);
    try {
      const targetPlan = getPlanInfo(newPlanCode);
      const res = await fetch(`/api/restaurants/${rest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: targetPlan?.codigo || newPlanCode,
          ...(targetPlan
            ? {
                limiteSedes: targetPlan.limiteSedes,
                limiteProductos: targetPlan.limiteProductos,
                limiteUsuarios: targetPlan.limiteUsuarios,
              }
            : {}),
        }),
      });
      if (res.ok) {
        await showSuccess(
          'Licencia Actualizada',
          `${rest.nombre} ahora tiene el plan ${targetPlan?.nombre || newPlanCode}.`
        );
        await onRefresh();
      } else {
        const err = await res.json().catch(() => ({}));
        showError('Error al cambiar plan', err.error || 'No se pudo actualizar la licencia.');
      }
    } catch {
      showError('Error de conexión', 'No se pudo actualizar la licencia del cliente.');
    } finally {
      setSavingId(null);
    }
  };

  const handleUpdateExpirationDate = async (rest: SuperadminClientLicenseRow, dateStr: string) => {
    if (!dateStr) return;
    setSavingId(rest.id);
    try {
      const targetDate = new Date(`${dateStr}T23:59:59`);
      const res = await fetch(`/api/restaurants/${rest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fechaVencimiento: targetDate.toISOString(),
          estadoLicencia: targetDate > new Date() ? 'ACTIVA' : 'VENCIDA',
          activo: targetDate > new Date(),
        }),
      });
      if (res.ok) {
        await showSuccess(
          'Vencimiento Actualizado',
          `Licencia de ${rest.nombre} configurada hasta el ${targetDate.toLocaleDateString()}.`
        );
        await onRefresh();
      } else {
        showError('Error', 'No se pudo guardar la nueva fecha.');
      }
    } catch {
      showError('Error de conexión', 'No se pudo comunicar con el servidor.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121212] border border-[#222] rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center justify-between text-gray-400 text-[11px] font-bold uppercase">
            <span>Licencias Operativas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-display">{licenseStats.activeCount}</div>
          <p className="text-[10px] text-gray-500">Clientes habilitados actualmente</p>
        </div>

        <div className="bg-[#121212] border border-[#222] rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center justify-between text-gray-400 text-[11px] font-bold uppercase">
            <span>Ingresos Mensuales (MRR)</span>
            <DollarSign className="w-4 h-4 text-brand-yellow" />
          </div>
          <div className="text-2xl font-black text-brand-yellow font-display">
            {formatCopPrice(licenseStats.estimatedMrr)}
          </div>
          <p className="text-[10px] text-gray-500">Calculado según precios vigentes de planes</p>
        </div>

        <div className="bg-[#121212] border border-[#222] rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center justify-between text-gray-400 text-[11px] font-bold uppercase">
            <span>En Prueba / Por Vencer</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-300 font-display">{licenseStats.attentionCount}</div>
          <p className="text-[10px] text-gray-500">Requieren seguimiento o renovación</p>
        </div>

        <div className="bg-[#121212] border border-[#222] rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center justify-between text-gray-400 text-[11px] font-bold uppercase">
            <span>Vencidas / Suspendidas</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-300 font-display">{licenseStats.blockedCount}</div>
          <p className="text-[10px] text-gray-500">Acceso bloqueado por licencia</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-[#121212] border border-[#242424] rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente por restaurante, slug o email..."
              className="w-full bg-[#181818] border border-[#2f2f2f] focus:border-brand-yellow rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-400 font-bold flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-brand-yellow" />
            <span>Filtros:</span>
          </span>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="bg-[#181818] border border-[#2f2f2f] rounded-xl px-3 py-2 text-xs text-white font-bold outline-none"
          >
            <option value="TODOS">Todos los Planes</option>
            {plans.map((p) => (
              <option key={p.codigo} value={p.codigo}>
                Plan {p.nombre} ({formatCopPrice(p.precioMensual)})
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#181818] border border-[#2f2f2f] rounded-xl px-3 py-2 text-xs text-white font-bold outline-none"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="ACTIVA">Activas</option>
            <option value="PRUEBA">En Prueba</option>
            <option value="POR_VENCER">Por Vencer (≤7d)</option>
            <option value="VENCIDA">Vencidas</option>
            <option value="SUSPENDIDA">Suspendidas</option>
          </select>
        </div>
      </div>

      {/* Clients & Licenses Table */}
      <div className="bg-[#121212] border border-[#242424] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#171717] border-b border-[#262626] text-[10px] uppercase tracking-wider text-gray-400">
                <th className="py-3.5 px-4 font-black">Cliente / Restaurante</th>
                <th className="py-3.5 px-4 font-black">Plan / Licencia</th>
                <th className="py-3.5 px-4 font-black">Tarifa Mensual</th>
                <th className="py-3.5 px-4 font-black">Estado</th>
                <th className="py-3.5 px-4 font-black">Vencimiento</th>
                <th className="py-3.5 px-4 font-black">Uso / Límites</th>
                <th className="py-3.5 px-4 font-black text-right">Acciones Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500">
                    No se encontraron clientes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filtered.map((rest) => {
                  const status = computeLicenseStatus(rest);
                  const matchedPlan = getPlanInfo(rest.plan);
                  const adminUser =
                    rest.users?.find((u) => u.rol === 'Administrador' || u.rol === 'Superadmin') ||
                    rest.users?.[0];
                  const expValue = rest.fechaVencimiento
                    ? new Date(rest.fechaVencimiento).toISOString().slice(0, 10)
                    : '';

                  return (
                    <tr key={rest.id} className="hover:bg-[#161616] transition-colors">
                      {/* Client */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-black shrink-0"
                            style={{ backgroundColor: rest.colorPrimario || '#ffc928' }}
                          >
                            {rest.nombre.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-black text-white text-sm truncate flex items-center gap-1.5">
                              <span>{rest.nombre}</span>
                              <Link
                                href={`/r/${rest.slug}`}
                                target="_blank"
                                className="text-gray-400 hover:text-brand-yellow"
                                title="Abrir carta"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono truncate">
                              /r/{rest.slug} {adminUser?.email ? `• ${adminUser.email}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Plan selector */}
                      <td className="py-3.5 px-4">
                        <select
                          disabled={savingId === rest.id}
                          value={matchedPlan?.codigo || rest.plan || 'Pro'}
                          onChange={(e) => handleUpdateClientPlan(rest, e.target.value)}
                          className="bg-[#1b1b1b] border border-[#333] focus:border-brand-yellow rounded-xl px-2.5 py-1.5 text-xs font-black text-brand-yellow outline-none cursor-pointer"
                        >
                          {plans.map((p) => (
                            <option key={p.codigo} value={p.codigo} className="bg-[#141414] text-white">
                              {p.emoji} {p.nombre}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-black text-white">
                        {matchedPlan ? formatCopPrice(matchedPlan.precioMensual) : '$49.990'}
                        <span className="text-[10px] text-gray-500 font-normal">/mes</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-black uppercase ${status.badgeClass}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      {/* Expiration */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <input
                            type="date"
                            value={expValue}
                            disabled={savingId === rest.id}
                            onChange={(e) => handleUpdateExpirationDate(rest, e.target.value)}
                            className="bg-[#1a1a1a] border border-[#2f2f2f] rounded-lg px-2 py-1 text-[11px] text-white outline-none"
                          />
                        </div>
                      </td>

                      {/* Usage & Limits */}
                      <td className="py-3.5 px-4 text-[11px] text-gray-300">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-brand-yellow" />
                            <span>
                              Sedes: <strong>{rest._count?.branches || 0}</strong>/{rest.limiteSedes || matchedPlan?.limiteSedes || 3}
                            </span>
                          </span>
                          <span className="flex items-center gap-1 text-gray-400">
                            <Award className="w-3 h-3 text-emerald-400" />
                            <span>
                              Platos: {rest._count?.products || 0}/{rest.limiteProductos || matchedPlan?.limiteProductos || 100}
                            </span>
                          </span>
                          <span className="flex items-center gap-1 text-gray-400">
                            <Users className="w-3 h-3 text-sky-400" />
                            <span>
                              Staff: {rest._count?.users || 0}/{rest.limiteUsuarios || matchedPlan?.limiteUsuarios || 10}
                            </span>
                          </span>
                        </div>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={savingId === rest.id}
                            onClick={() => onExtendLicense(rest, 30)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#202020] hover:bg-[#2c2c2c] border border-[#333] text-gray-200 font-bold text-[10px] cursor-pointer"
                            title="Extender 30 días"
                          >
                            +30d
                          </button>
                          <button
                            type="button"
                            disabled={savingId === rest.id}
                            onClick={() => onExtendLicense(rest, 365)}
                            className="px-2.5 py-1.5 rounded-lg bg-brand-yellow/15 hover:bg-brand-yellow/25 border border-brand-yellow/35 text-brand-yellow font-bold text-[10px] cursor-pointer"
                            title="Extender 1 año"
                          >
                            +1 Año
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleActive(rest)}
                            className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer ${
                              rest.activo
                                ? 'bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/35'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            <Power className="w-3 h-3" />
                            <span>{rest.activo ? 'Suspender' : 'Activar'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {savingId && (
        <div className="flex items-center justify-end gap-2 text-xs text-brand-yellow font-bold">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Guardando cambios en la licencia...</span>
        </div>
      )}
    </div>
  );
}
