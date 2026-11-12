'use client';

import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Edit,
  Eye,
  EyeOff,
  Percent,
  Plus,
  ShoppingCart,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import type { CouponItem } from '@/lib/coupons';
import { showConfirm, showError, showSuccess } from '@/lib/swal';

interface CouponsTabProps {
  coupons: CouponItem[];
  restaurantId: number;
  restaurantSlug?: string;
  onRefresh: () => Promise<void> | void;
}

export function CouponsTab({
  coupons,
  restaurantId,
  restaurantSlug,
  onRefresh,
}: CouponsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    codigo: '',
    descripcion: '',
    tipoDescuento: 'porcentaje' as 'porcentaje' | 'fijo' | 'envio',
    valor: '10',
    montoMinimo: '0',
    usoMaximo: '0',
    fechaInicio: '',
    fechaFin: '',
    activo: true,
    mostrarEnCarrito: true,
    soloDomicilio: false,
  });

  const formatCOP = (val: number) => '$' + Math.round(val || 0).toLocaleString('es-CO');

  const toDateInput = (iso: string | null) => {
    if (!iso) return '';
    try {
      return new Date(iso).toISOString().slice(0, 10);
    } catch {
      return '';
    }
  };

  const handleOpenNew = () => {
    setEditingCoupon(null);
    const todayStr = new Date().toISOString().slice(0, 10);
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    setFormData({
      codigo: '',
      descripcion: '',
      tipoDescuento: 'porcentaje',
      valor: '10',
      montoMinimo: '0',
      usoMaximo: '0',
      fechaInicio: todayStr,
      fechaFin: nextMonth.toISOString().slice(0, 10),
      activo: true,
      mostrarEnCarrito: true,
      soloDomicilio: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: CouponItem) => {
    setEditingCoupon(c);
    setFormData({
      codigo: c.codigo,
      descripcion: c.descripcion || '',
      tipoDescuento: c.tipoDescuento,
      valor: String(c.valor),
      montoMinimo: String(c.montoMinimo || 0),
      usoMaximo: String(c.usoMaximo || 0),
      fechaInicio: toDateInput(c.fechaInicio),
      fechaFin: toDateInput(c.fechaFin),
      activo: c.activo,
      mostrarEnCarrito: c.mostrarEnCarrito,
      soloDomicilio: c.soloDomicilio,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigo.trim()) {
      showError('Código requerido', 'Ingresa el código del cupón (ej: PROMO15).');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...(editingCoupon ? { id: editingCoupon.id } : {}),
        codigo: formData.codigo.trim().toUpperCase(),
        descripcion: formData.descripcion.trim(),
        tipoDescuento: formData.tipoDescuento,
        valor: formData.tipoDescuento === 'envio' ? 0 : Number(formData.valor || 0),
        montoMinimo: Number(formData.montoMinimo || 0),
        usoMaximo: Number(formData.usoMaximo || 0),
        fechaInicio: formData.fechaInicio || null,
        fechaFin: formData.fechaFin || null,
        activo: formData.activo,
        mostrarEnCarrito: formData.mostrarEnCarrito,
        soloDomicilio: formData.soloDomicilio,
        restaurantId,
        restaurantSlug,
      };

      const res = await fetch('/api/coupons', {
        method: editingCoupon ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        showError('No se pudo guardar', data.error || 'Error en el servidor.');
        return;
      }

      setIsModalOpen(false);
      await onRefresh();
      showSuccess(
        editingCoupon ? 'Cupón Actualizado' : 'Cupón Creado',
        `El cupón ${payload.codigo} quedó guardado${payload.mostrarEnCarrito ? ' y visible en el carrito mientras esté vigente' : ''}.`
      );
    } catch {
      showError('Error de conexión', 'No se pudo guardar el cupón.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleField = async (c: CouponItem, field: 'activo' | 'mostrarEnCarrito') => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id, [field]: !c[field] }),
      });
      if (res.ok) {
        await onRefresh();
      }
    } catch {
      showError('Error', 'No se pudo actualizar el cupón.');
    }
  };

  const handleDelete = async (c: CouponItem) => {
    const ok = await showConfirm({
      title: '¿Eliminar Cupón?',
      text: `Se eliminará permanentemente el cupón "${c.codigo}".`,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      icon: 'warning',
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/coupons?id=${c.id}`, { method: 'DELETE' });
      if (res.ok) {
        await onRefresh();
        showSuccess('Cupón Eliminado', `El cupón ${c.codigo} fue eliminado.`);
      }
    } catch {
      showError('Error', 'No se pudo eliminar el cupón.');
    }
  };

  const statusBadge = (status?: string) => {
    switch (status) {
      case 'VIGENTE':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
      case 'PROGRAMADO':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
      case 'EXPIRADO':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/40';
      case 'AGOTADO':
        return 'bg-orange-500/15 text-orange-300 border-orange-500/40';
      default:
        return 'bg-gray-500/15 text-gray-400 border-gray-500/40';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-[#121212] border border-[#222] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h3 className="text-lg font-black uppercase text-white font-display flex items-center gap-2">
            <Tag className="w-5 h-5 text-brand-yellow" />
            <span>Cupones de Descuento y Vigencias ({coupons.length})</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Crea cupones por porcentaje, valor fijo o envío gratis con fechas de vigencia. Todos los cupones vigentes marcados como visibles seguirán apareciendo automáticamente en el carrito de compras.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="px-4 py-2.5 bg-brand-yellow hover:bg-brand-yellowHover text-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-glow transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Crear Cupón</span>
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="bg-[#121212] border border-[#222] rounded-3xl p-10 text-center space-y-3">
          <Percent className="w-10 h-10 text-brand-yellow/60 mx-auto" />
          <h4 className="text-sm font-black text-white uppercase">Aún no tienes cupones creados</h4>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Crea tu primer cupón con fechas de vigencia para que tus clientes lo vean y apliquen directamente desde el carrito de compras.
          </p>
          <button
            type="button"
            onClick={handleOpenNew}
            className="px-5 py-2.5 bg-brand-yellow text-black font-black text-xs uppercase rounded-xl cursor-pointer"
          >
            + Crear Primer Cupón
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {coupons.map((c) => (
            <div
              key={c.id}
              className="bg-[#121212] border border-[#242424] hover:border-brand-yellow/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-xl bg-brand-yellow/15 border border-brand-yellow/40 text-brand-yellow font-mono font-black text-sm tracking-wider">
                      {c.codigo}
                    </span>
                    <div className="text-xs text-gray-300 font-semibold mt-2">
                      {c.descripcion || 'Cupón promocional de descuento'}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase ${statusBadge(
                      c.estadoVigencia
                    )}`}
                  >
                    {c.estadoVigencia || 'VIGENTE'}
                  </span>
                </div>

                {/* Benefit */}
                <div className="bg-[#181818] border border-[#262626] rounded-xl p-3 flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-bold">Beneficio:</span>
                  <span className="text-emerald-400 font-black text-sm">
                    {c.tipoDescuento === 'porcentaje'
                      ? `${c.valor}% de Descuento`
                      : c.tipoDescuento === 'envio'
                      ? 'Domicilio Gratis'
                      : `${formatCOP(c.valor)} de Descuento`}
                  </span>
                </div>

                {/* Validity dates & conditions */}
                <div className="space-y-1.5 text-[11px] text-gray-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-yellow" />
                      <span>Vigencia:</span>
                    </span>
                    <span className="text-white font-semibold">
                      {c.fechaInicio ? new Date(c.fechaInicio).toLocaleDateString('es-CO') : 'Hoy'} →{' '}
                      {c.fechaFin ? new Date(c.fechaFin).toLocaleDateString('es-CO') : 'Sin límite'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Compra mínima:</span>
                    <span className="text-white font-semibold">
                      {c.montoMinimo > 0 ? formatCOP(c.montoMinimo) : 'Sin mínimo'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Usos:</span>
                    <span className="text-white font-semibold">
                      {c.usosActuales} / {c.usoMaximo > 0 ? c.usoMaximo : 'Ilimitados'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="pt-3 border-t border-[#222] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleField(c, 'mostrarEnCarrito')}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 border cursor-pointer ${
                      c.mostrarEnCarrito
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                        : 'bg-[#1c1c1c] text-gray-500 border-[#2e2e2e]'
                    }`}
                    title="Mostrar u ocultar este cupón dentro del carrito de compras"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>{c.mostrarEnCarrito ? 'En Carrito' : 'Oculto'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleField(c, 'activo')}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 border cursor-pointer ${
                      c.activo
                        ? 'bg-brand-yellow/15 text-brand-yellow border-brand-yellow/35'
                        : 'bg-red-500/15 text-red-300 border-red-500/35'
                    }`}
                  >
                    {c.activo ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{c.activo ? 'Activo' : 'Pausado'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(c)}
                    className="p-2 rounded-lg bg-[#1c1c1c] hover:bg-[#262626] text-gray-300 hover:text-white border border-[#2f2f2f] cursor-pointer"
                    title="Editar cupón"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 cursor-pointer"
                    title="Eliminar cupón"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear / Editar Cupón */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#141414] border-2 border-brand-yellow/50 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#252525]">
              <h4 className="text-base font-black uppercase text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-brand-yellow" />
                <span>{editingCoupon ? `Editar Cupón ${editingCoupon.codigo}` : 'Nuevo Cupón de Descuento'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full bg-[#1f1f1f] text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Código del Cupón *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: BIENVENIDO15"
                    value={formData.codigo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        codigo: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''),
                      })
                    }
                    className="w-full bg-[#1c1c1c] border border-[#2f2f2f] rounded-xl px-3.5 py-2.5 text-brand-yellow font-mono font-black uppercase outline-none focus:border-brand-yellow"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Tipo de Descuento</label>
                  <select
                    value={formData.tipoDescuento}
                    onChange={(e) =>
                      setFormData({ ...formData, tipoDescuento: e.target.value as any })
                    }
                    className="w-full bg-[#1c1c1c] border border-[#2f2f2f] rounded-xl px-3 py-2.5 text-white font-bold outline-none focus:border-brand-yellow"
                  >
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="fijo">Valor Fijo ($ COP)</option>
                    <option value="envio">Domicilio Gratis</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Descripción / Mensaje</label>
                <input
                  type="text"
                  placeholder="Ej: 15% de descuento en tu pedido por tiempo limitado"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-[#2f2f2f] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-brand-yellow"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">
                    {formData.tipoDescuento === 'porcentaje' ? 'Porcentaje (%)' : 'Valor ($ COP)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    disabled={formData.tipoDescuento === 'envio'}
                    value={formData.tipoDescuento === 'envio' ? '0' : formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#2f2f2f] rounded-xl px-3 py-2.5 text-white font-bold outline-none disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Compra Mínima ($)</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={formData.montoMinimo}
                    onChange={(e) => setFormData({ ...formData, montoMinimo: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#2f2f2f] rounded-xl px-3 py-2.5 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">Límite Usos (0=∞)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.usoMaximo}
                    onChange={(e) => setFormData({ ...formData, usoMaximo: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#2f2f2f] rounded-xl px-3 py-2.5 text-white outline-none"
                  />
                </div>
              </div>

              {/* Fechas de Vigencia */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#181818] border border-[#282828] rounded-2xl p-3.5">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">
                    Vigencia Desde (Inicio)
                  </label>
                  <input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">
                    Vigencia Hasta (Vencimiento)
                  </label>
                  <input
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                    className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer text-gray-200 font-bold">
                  <input
                    type="checkbox"
                    checked={formData.mostrarEnCarrito}
                    onChange={(e) =>
                      setFormData({ ...formData, mostrarEnCarrito: e.target.checked })
                    }
                    className="accent-emerald-500"
                  />
                  <span>Mostrar automáticamente en el carrito de compras mientras esté vigente</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer text-gray-300 font-bold">
                  <input
                    type="checkbox"
                    checked={formData.soloDomicilio}
                    onChange={(e) => setFormData({ ...formData, soloDomicilio: e.target.checked })}
                    className="accent-brand-yellow"
                  />
                  <span>Aplicar solo para pedidos con entrega a Domicilio</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer text-gray-300 font-bold">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="accent-brand-yellow"
                  />
                  <span>Cupón Activo</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#202020] text-gray-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-brand-yellow text-black font-black uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{saving ? 'Guardando...' : 'Guardar Cupón'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
