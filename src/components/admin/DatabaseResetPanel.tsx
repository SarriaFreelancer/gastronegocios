'use client';

import React, { useState } from 'react';
import { Database, RefreshCw, Sparkles, Trash2, Key, Eye, EyeOff, HardDrive, ShieldCheck } from 'lucide-react';
import { showSuccess, showError, swalCustom } from '@/lib/swal';

interface DatabaseResetPanelProps {
  restaurantId?: number | string | null;
  restaurantSlug?: string;
  restaurantName?: string;
  onSuccessRefresh?: () => void;
}

export function DatabaseResetPanel({
  restaurantId,
  restaurantSlug,
  restaurantName,
  onSuccessRefresh,
}: DatabaseResetPanelProps) {
  const [superadminPassword, setSuperadminPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [customSlug, setCustomSlug] = useState(restaurantSlug || '');
  const [processing, setProcessing] = useState(false);

  const executeDbAction = async (
    action: 'reset_restaurant_zero' | 'delete_restaurant' | 'seed_restaurant_demo' | 'reset_all_zero' | 'seed_all_demo',
    options?: { deleteSecondaryRestaurants?: boolean; confirmTitle?: string; confirmText?: string }
  ) => {
    if (!superadminPassword.trim()) {
      showError(
        'Clave del Superadmin requerida',
        'Debes ingresar la contraseña del Superadmin para autorizar la limpieza o carga de datos de prueba.'
      );
      return;
    }

    if (options?.confirmTitle) {
      const conf = await swalCustom.fire({
        title: options.confirmTitle,
        text: options.confirmText || '¿Estás seguro de continuar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, ejecutar ahora',
        cancelButtonText: 'Cancelar',
      });
      if (!conf.isConfirmed) return;
    }

    setProcessing(true);
    try {
      const res = await fetch('/api/admin/db-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          superadminPassword: superadminPassword.trim(),
          restaurantId: restaurantId ? Number(restaurantId) : undefined,
          slug: customSlug.trim().toLowerCase() || restaurantSlug || undefined,
          deleteSecondaryRestaurants: Boolean(options?.deleteSecondaryRestaurants),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await showSuccess('Operación Completada', data.message || 'Base de datos actualizada con éxito.');
        if (onSuccessRefresh) {
          onSuccessRefresh();
        } else {
          window.location.reload();
        }
      } else {
        showError('Autorización o Acción Fallida', data.error || 'Verifica la clave del Superadmin.');
      }
    } catch (e) {
      showError('Error de red', 'No se pudo conectar con el servidor.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="pt-6 border-t border-[#222] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase text-white font-display">
              Limpieza de Base de Datos, Reset desde Cero y Datos de Prueba
            </h4>
            <p className="text-[11px] text-gray-400">
              Vacía categorías, platos y pedidos para iniciar desde cero, o llena con información de pruebas (Requiere Clave del Superadmin).
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          Protegido con Clave Superadmin
        </span>
      </div>

      <div className="bg-[#161616] border border-[#2b2b2b] rounded-2xl p-4 space-y-4">
        {/* Input de Clave Superadmin y Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase text-amber-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              <span>Clave del Superadmin (Obligatoria) *</span>
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Ingresa la contraseña del Superadmin..."
                value={superadminPassword}
                onChange={(e) => setSuperadminPassword(e.target.value)}
                className="w-full bg-[#101010] border border-[#333] focus:border-amber-400 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white font-mono outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white cursor-pointer"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-gray-300 block">
              Restaurante Objetivo (Slug):
            </label>
            <input
              type="text"
              placeholder="Ej: punto-g, salchi-ricuras..."
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value.toLowerCase().trim())}
              className="w-full bg-[#101010] border border-[#333] focus:border-brand-yellow rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
            />
          </div>
        </div>

        {/* Botones para este Restaurante */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            disabled={processing}
            onClick={() =>
              executeDbAction('reset_restaurant_zero', {
                confirmTitle: `¿Iniciar "${restaurantName || customSlug || 'este restaurante'}" desde cero?`,
                confirmText:
                  'Se eliminarán todas sus categorías, subcategorías, productos, pedidos, facturas, turnos e inventario. Se conservarán su Sede Principal, usuario Administrador y 4 mesas limpias.',
              })
            }
            className="p-3.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-left space-y-1 transition cursor-pointer disabled:opacity-50"
          >
            <div className="font-black text-xs uppercase text-amber-300 flex items-center gap-1.5">
              <RefreshCw className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
              <span>🧹 Limpiar Restaurante (En Cero)</span>
            </div>
            <p className="text-[10px] text-gray-300 leading-snug">
              Elimina categorías, productos, pedidos e inventario de este restaurante para iniciar su carta desde cero.
            </p>
          </button>

          <button
            type="button"
            disabled={processing}
            onClick={() =>
              executeDbAction('seed_restaurant_demo', {
                confirmTitle: `¿Llenar "${restaurantName || customSlug || 'este restaurante'}" con datos de prueba?`,
                confirmText:
                  'Se crearán categorías de demostración (Hamburguesas, Perros, Salchipapas, Bebidas), 5 platos con fotos, adicionales y 6 mesas.',
              })
            }
            className="p-3.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-left space-y-1 transition cursor-pointer disabled:opacity-50"
          >
            <div className="font-black text-xs uppercase text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>🧪 Llenar con Datos de Prueba</span>
            </div>
            <p className="text-[10px] text-gray-300 leading-snug">
              Puebla este restaurante con categorías, platos, precios, toppings y mesas de ejemplo listos para probar.
            </p>
          </button>

          <button
            type="button"
            disabled={processing}
            onClick={() =>
              executeDbAction('delete_restaurant', {
                confirmTitle: `¿Eliminar por completo el restaurante "${customSlug || restaurantName}"?`,
                confirmText:
                  'Se borrará el restaurante y todas sus tablas para liberar su identificador (slug) en la base de datos.',
              })
            }
            className="p-3.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-left space-y-1 transition cursor-pointer disabled:opacity-50"
          >
            <div className="font-black text-xs uppercase text-red-300 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4" />
              <span>🗑️ Eliminar Restaurante por Slug</span>
            </div>
            <p className="text-[10px] text-gray-300 leading-snug">
              Elimina por completo un restaurante (incluso si su slug quedó ocupado) y libera el identificador.
            </p>
          </button>
        </div>

        {/* Acciones Globales de toda la Base de Datos */}
        <div className="pt-3 border-t border-[#252525] flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-gray-400 flex items-center gap-1.5 font-bold">
            <HardDrive className="w-3.5 h-3.5 text-red-400" />
            <span>Acciones Globales sobre Todas las Tablas de la BD:</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={processing}
              onClick={() =>
                executeDbAction('reset_all_zero', {
                  deleteSecondaryRestaurants: false,
                  confirmTitle: '¿Vaciar todas las tablas de todos los restaurantes?',
                  confirmText:
                    'Todos los restaurantes quedarán con 0 categorías, 0 productos y 0 pedidos, listos para configurarse desde cero.',
                })
              }
              className="px-3 py-1.5 rounded-xl bg-[#222] hover:bg-red-950/50 text-red-300 border border-red-500/30 text-[11px] font-bold uppercase transition cursor-pointer disabled:opacity-50"
            >
              🧨 Resetear Todas las Tablas a Cero
            </button>

            <button
              type="button"
              disabled={processing}
              onClick={() =>
                executeDbAction('seed_all_demo', {
                  confirmTitle: '¿Llenar todos los restaurantes con datos de prueba?',
                  confirmText: 'Se cargarán categorías, platos y adicionales de demostración en todos los restaurantes.',
                })
              }
              className="px-3 py-1.5 rounded-xl bg-[#222] hover:bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold uppercase transition cursor-pointer disabled:opacity-50"
            >
              🧪 Llenar Toda la BD con Datos Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
