'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  ExternalLink,
  Layers,
  RefreshCw,
  Save,
  Sparkles,
  Users,
  Building2,
  UtensilsCrossed,
} from 'lucide-react';
import { formatCopPrice, type SaasPlanItem } from '@/lib/saas-plans';
import { showError, showSuccess } from '@/lib/swal';

interface SuperadminPlansPanelProps {
  plans: SaasPlanItem[];
  onPlansUpdated: (updated: SaasPlanItem[]) => void;
  onSyncLimitsToRestaurants: () => Promise<void> | void;
}

interface PlanDraft {
  id: number;
  codigo: string;
  nombre: string;
  subtitulo: string;
  emoji: string;
  precioMensual: number;
  precioAnual: number;
  badgeTexto: string;
  destacado: boolean;
  caracteristicasText: string;
  limiteSedes: number;
  limiteProductos: number;
  limiteUsuarios: number;
  ctaTexto: string;
  tipoAccion: 'registro' | 'whatsapp';
  activo: boolean;
  orden: number;
}

function toDraft(p: SaasPlanItem): PlanDraft {
  return {
    id: p.id,
    codigo: p.codigo,
    nombre: p.nombre,
    subtitulo: p.subtitulo,
    emoji: p.emoji,
    precioMensual: p.precioMensual,
    precioAnual: p.precioAnual,
    badgeTexto: p.badgeTexto || '',
    destacado: p.destacado,
    caracteristicasText: (p.caracteristicas || []).join('\n'),
    limiteSedes: p.limiteSedes,
    limiteProductos: p.limiteProductos,
    limiteUsuarios: p.limiteUsuarios,
    ctaTexto: p.ctaTexto,
    tipoAccion: p.tipoAccion,
    activo: p.activo,
    orden: p.orden,
  };
}

export function SuperadminPlansPanel({
  plans,
  onPlansUpdated,
  onSyncLimitsToRestaurants,
}: SuperadminPlansPanelProps) {
  const [drafts, setDrafts] = useState<PlanDraft[]>(() => plans.map(toDraft));
  const [savingCode, setSavingCode] = useState<string | null>(null);
  const [syncingCode, setSyncingCode] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(plans.map(toDraft));
  }, [plans]);

  const updateDraftField = (codigo: string, field: keyof PlanDraft, value: any) => {
    setDrafts((prev) =>
      prev.map((d) => (d.codigo === codigo ? { ...d, [field]: value } : d))
    );
  };

  const handleSavePlan = async (draft: PlanDraft) => {
    setSavingCode(draft.codigo);
    try {
      const caracteristicas = draft.caracteristicasText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      const res = await fetch('/api/saas/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          badgeTexto: draft.badgeTexto.trim() || null,
          caracteristicas,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (Array.isArray(data.plans)) {
          onPlansUpdated(data.plans);
        }
        await showSuccess(
          'Plan Publicado en Landing',
          `Los precios y beneficios del plan "${draft.nombre}" (${formatCopPrice(draft.precioMensual)}/mes) ya se reflejan en la página principal (/) y en /registro.`
        );
      } else {
        showError('Error al guardar', data.error || 'No se pudo actualizar el plan.');
      }
    } catch {
      showError('Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setSavingCode(null);
    }
  };

  const handleSyncLimits = async (draft: PlanDraft) => {
    setSyncingCode(draft.codigo);
    try {
      const res = await fetch('/api/saas/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync_restaurant_limits',
          codigo: draft.codigo,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await showSuccess('Límites Sincronizados', data.message);
        await onSyncLimitsToRestaurants();
      } else {
        showError('Error', data.error || 'No se pudieron sincronizar los límites.');
      }
    } catch {
      showError('Error de conexión', 'No se pudo comunicar con el servidor.');
    } finally {
      setSyncingCode(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#17120A] via-[#141414] to-[#121212] border border-brand-yellow/35 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-black uppercase text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-yellow" />
            <span>Editor de Licencias y Precios de la Landing Principal</span>
          </h3>
          <p className="text-xs text-gray-300">
            Cualquier cambio que guardes aquí actualiza automáticamente los precios, características y enlaces de registro en la página inicial (<code className="text-brand-yellow">/</code>) y en <code className="text-brand-yellow">/registro</code>.
          </p>
        </div>

        <Link
          href="/#planes"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-yellow/15 hover:bg-brand-yellow/25 border border-brand-yellow/40 text-brand-yellow font-black text-xs uppercase tracking-wider shrink-0 transition"
        >
          <span>Ver en Landing Principal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 3 Editable Plan Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {drafts.map((draft) => {
          const isSaving = savingCode === draft.codigo;
          const isSyncing = syncingCode === draft.codigo;
          return (
            <div
              key={draft.codigo}
              className={`rounded-3xl border-2 p-5 flex flex-col justify-between space-y-4 shadow-xl transition-all ${
                draft.destacado
                  ? 'bg-[#17120c] border-brand-yellow/70'
                  : 'bg-[#121212] border-[#262626]'
              }`}
            >
              <div className="space-y-4">
                {/* Plan Header */}
                <div className="flex items-center justify-between border-b border-[#242424] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{draft.emoji}</span>
                    <div>
                      <div className="text-[10px] font-mono text-gray-400 uppercase">
                        Código interno: {draft.codigo}
                      </div>
                      <h4 className="text-base font-black text-white">Plan {draft.nombre}</h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-brand-yellow">
                      {formatCopPrice(draft.precioMensual)}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Anual: {formatCopPrice(draft.precioAnual)}
                    </div>
                  </div>
                </div>

                {/* Basic Display Fields */}
                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                      Nombre Visible
                    </label>
                    <input
                      type="text"
                      value={draft.nombre}
                      onChange={(e) => updateDraftField(draft.codigo, 'nombre', e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#2f2f2f] rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-brand-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                      Emoji
                    </label>
                    <input
                      type="text"
                      value={draft.emoji}
                      onChange={(e) => updateDraftField(draft.codigo, 'emoji', e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#2f2f2f] rounded-xl px-3 py-2 text-center text-white outline-none focus:border-brand-yellow"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                      Subtítulo
                    </label>
                    <input
                      type="text"
                      value={draft.subtitulo}
                      onChange={(e) => updateDraftField(draft.codigo, 'subtitulo', e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#2f2f2f] rounded-xl px-3 py-2 text-white outline-none focus:border-brand-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                      Etiqueta Superior (Badge)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Más Popular 🔥"
                      value={draft.badgeTexto}
                      onChange={(e) => updateDraftField(draft.codigo, 'badgeTexto', e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#2f2f2f] rounded-xl px-3 py-2 text-amber-300 outline-none focus:border-brand-yellow"
                    />
                  </div>
                </div>

                {/* Prices */}
                <div className="grid grid-cols-2 gap-2.5 text-xs bg-[#181818] border border-[#292929] rounded-2xl p-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-brand-yellow mb-1">
                      Precio Mensual (COP)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={draft.precioMensual}
                      onChange={(e) =>
                        updateDraftField(draft.codigo, 'precioMensual', Number(e.target.value))
                      }
                      className="w-full bg-[#111] border border-brand-yellow/35 rounded-xl px-3 py-2 text-white font-black text-sm outline-none focus:border-brand-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                      Precio Anual (COP)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={draft.precioAnual}
                      onChange={(e) =>
                        updateDraftField(draft.codigo, 'precioAnual', Number(e.target.value))
                      }
                      className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-brand-yellow"
                    />
                  </div>
                </div>

                {/* Resource Limits */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="flex items-center gap-1 text-[10px] font-bold uppercase text-gray-400 mb-1">
                      <Building2 className="w-3 h-3 text-brand-yellow" />
                      <span>Max Sedes</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={draft.limiteSedes}
                      onChange={(e) =>
                        updateDraftField(draft.codigo, 'limiteSedes', Number(e.target.value))
                      }
                      className="w-full bg-[#1a1a1a] border border-[#2f2f2f] rounded-xl px-2.5 py-2 text-white font-bold text-center outline-none"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-[10px] font-bold uppercase text-gray-400 mb-1">
                      <UtensilsCrossed className="w-3 h-3 text-emerald-400" />
                      <span>Max Platos</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={draft.limiteProductos}
                      onChange={(e) =>
                        updateDraftField(draft.codigo, 'limiteProductos', Number(e.target.value))
                      }
                      className="w-full bg-[#1a1a1a] border border-[#2f2f2f] rounded-xl px-2.5 py-2 text-white font-bold text-center outline-none"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-[10px] font-bold uppercase text-gray-400 mb-1">
                      <Users className="w-3 h-3 text-sky-400" />
                      <span>Max Staff</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={draft.limiteUsuarios}
                      onChange={(e) =>
                        updateDraftField(draft.codigo, 'limiteUsuarios', Number(e.target.value))
                      }
                      className="w-full bg-[#1a1a1a] border border-[#2f2f2f] rounded-xl px-2.5 py-2 text-white font-bold text-center outline-none"
                    />
                  </div>
                </div>

                {/* Features List */}
                <div className="text-xs">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                    Características en Landing (1 por línea)
                  </label>
                  <textarea
                    rows={4}
                    value={draft.caracteristicasText}
                    onChange={(e) =>
                      updateDraftField(draft.codigo, 'caracteristicasText', e.target.value)
                    }
                    className="w-full bg-[#1a1a1a] border border-[#2f2f2f] rounded-xl px-3 py-2 text-gray-200 text-xs leading-relaxed outline-none focus:border-brand-yellow"
                  />
                </div>

                {/* CTA + Toggles */}
                <div className="grid grid-cols-2 gap-2.5 text-xs items-center">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                      Texto Botón CTA
                    </label>
                    <input
                      type="text"
                      value={draft.ctaTexto}
                      onChange={(e) => updateDraftField(draft.codigo, 'ctaTexto', e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#2f2f2f] rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                      Acción Botón
                    </label>
                    <select
                      value={draft.tipoAccion}
                      onChange={(e) => updateDraftField(draft.codigo, 'tipoAccion', e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#2f2f2f] rounded-xl px-3 py-2 text-white outline-none"
                    >
                      <option value="registro">Ir a /registro</option>
                      <option value="whatsapp">Abrir WhatsApp</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-gray-300 font-bold">
                    <input
                      type="checkbox"
                      checked={draft.destacado}
                      onChange={(e) => updateDraftField(draft.codigo, 'destacado', e.target.checked)}
                      className="rounded accent-brand-yellow"
                    />
                    <span>Tarjeta Destacada</span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer text-gray-300 font-bold">
                    <input
                      type="checkbox"
                      checked={draft.activo}
                      onChange={(e) => updateDraftField(draft.codigo, 'activo', e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    <span>Visible en Landing</span>
                  </label>
                </div>
              </div>

              {/* Save Actions */}
              <div className="pt-3 border-t border-[#242424] space-y-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSavePlan(draft)}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-brand-yellow to-yellow-500 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow transition cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{isSaving ? 'Guardando...' : 'Guardar y Publicar en Landing'}</span>
                </button>

                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={() => handleSyncLimits(draft)}
                  className="w-full py-2 px-3 rounded-xl bg-[#1b1b1b] hover:bg-[#252525] border border-[#303030] text-gray-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-60"
                >
                  <Layers className="w-3.5 h-3.5 text-brand-yellow" />
                  <span>
                    {isSyncing
                      ? 'Sincronizando...'
                      : `Aplicar límites (${draft.limiteSedes} sedes / ${draft.limiteProductos} platos) a clientes`}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
