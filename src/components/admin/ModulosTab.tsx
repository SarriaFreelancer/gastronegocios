'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Check, 
  AlertTriangle, 
  LayoutTemplate, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  ShoppingCart,
  UtensilsCrossed,
  TabletSmartphone,
  QrCode,
  Boxes,
  BookOpenCheck,
  Truck,
  Users,
  TrendingUp,
  ReceiptText,
  Bike
} from 'lucide-react';

interface ModulosTabProps {
  restaurantId: string;
  restaurantName: string;
}

const ICON_MAP: Record<string, any> = {
  ShoppingCart,
  UtensilsCrossed,
  TabletSmartphone,
  QrCode,
  Boxes,
  BookOpenCheck,
  Truck,
  Users,
  TrendingUp,
  ReceiptText,
  Bike,
};

export const ModulosTab: React.FC<ModulosTabProps> = ({ restaurantId, restaurantName }) => {
  const [modules, setModules] = useState<any[]>([]);
  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({});
  const [settings, setSettings] = useState({
    aparienciaMenu: 'clasico',
    politicaStockNegativo: 'BLOQUEAR',
    diasAnticipacionVencimiento: 7,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/modules?restaurantId=${restaurantId}`);
      if (res.ok) {
        const data = await res.json();
        setModules(data.modules || []);
        setEnabledModules(data.enabledModules || {});
        if (data.settings) {
          setSettings({
            aparienciaMenu: data.settings.aparienciaMenu || 'clasico',
            politicaStockNegativo: data.settings.politicaStockNegativo || 'BLOQUEAR',
            diasAnticipacionVencimiento: data.settings.diasAnticipacionVencimiento || 7,
          });
        }
      }
    } catch (err) {
      console.error('Error fetching modules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchModules();
    }
  }, [restaurantId]);

  const handleToggleModule = (moduleId: string) => {
    const isCurrentlyActive = !!enabledModules[moduleId];
    const willBeActive = !isCurrentlyActive;

    const newStates = { ...enabledModules, [moduleId]: willBeActive };

    // Dependency check: if turning ON, ensure dependencies are ON
    const targetDef = modules.find((m) => m.id === moduleId);
    if (willBeActive && targetDef?.requiere) {
      targetDef.requiere.forEach((reqId: string) => {
        newStates[reqId] = true;
      });
    }

    // If turning OFF, check if other active modules depend on it
    if (!willBeActive) {
      const dependents = modules.filter(
        (m) => newStates[m.id] && m.requiere && m.requiere.includes(moduleId)
      );
      if (dependents.length > 0) {
        const depNames = dependents.map((d) => d.nombre).join(', ');
        alert(
          `Advertencia: Desactivar este módulo afectará a: ${depNames}. Esos módulos también serán desactivados automáticamente.`
        );
        dependents.forEach((d) => {
          newStates[d.id] = false;
        });
      }
    }

    setEnabledModules(newStates);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setWarnings([]);
    try {
      const res = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          enabledModules,
          aparienciaMenu: settings.aparienciaMenu,
          politicaStockNegativo: settings.politicaStockNegativo,
          diasAnticipacionVencimiento: Number(settings.diasAnticipacionVencimiento),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar configuraciones');

      if (data.warnings && data.warnings.length > 0) {
        setWarnings(data.warnings);
      }

      setSaveNotice('¡Configuraciones y módulos guardados con éxito!');
      setTimeout(() => setSaveNotice(null), 3000);
      
      // Notificar a toda la aplicación para actualizar inmediatamente la apariencia del menú y políticas
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('punto-g:tenant-updated', {
            detail: { restaurantId, aparienciaMenu: settings.aparienciaMenu },
          })
        );
      }
      
      fetchModules();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Save Toast */}
      {saveNotice && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Warnings Banner if any */}
      {warnings.length > 0 && (
        <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4 text-xs space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>Avisos de dependencias entre módulos:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-slate-300">
            {warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* SECTION 1: POLÍTICAS GLOBALES DEL RESTAURANTE */}
      <div className="bg-[#12141c] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="pb-3 border-b border-slate-800">
          <h2 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
            <Settings className="w-5 h-5 text-orange-400" />
            <span>Políticas Operativas y Apariencia de {restaurantName}</span>
          </h2>
          <p className="text-xs text-slate-400">
            Aislamiento estricto por restaurante: estas configuraciones solo afectan a tu sede.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Apariencia del Menú */}
          <div className="bg-[#181b26] p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-orange-400 font-bold text-sm">
              <LayoutTemplate className="w-4 h-4" />
              <span>Apariencia del Menú Digital</span>
            </div>
            <p className="text-xs text-slate-400">
              Selecciona cómo se visualizará la carta interactiva de tu negocio.
            </p>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-3 rounded-xl border border-slate-700/60 bg-[#12141c] cursor-pointer hover:border-orange-500/50">
                <input
                  type="radio"
                  name="aparienciaMenu"
                  value="clasico"
                  checked={settings.aparienciaMenu === 'clasico'}
                  onChange={() => setSettings({ ...settings, aparienciaMenu: 'clasico' })}
                  className="text-orange-500 focus:ring-orange-500"
                />
                <div>
                  <div className="font-bold text-xs text-white">Opción A — Menú Actual</div>
                  <div className="text-[10px] text-slate-400">Diseño clásico con banner, categorías superiores y filtros</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 rounded-xl border border-slate-700/60 bg-[#12141c] cursor-pointer hover:border-orange-500/50">
                <input
                  type="radio"
                  name="aparienciaMenu"
                  value="lateral"
                  checked={settings.aparienciaMenu === 'lateral'}
                  onChange={() => setSettings({ ...settings, aparienciaMenu: 'lateral' })}
                  className="text-orange-500 focus:ring-orange-500"
                />
                <div>
                  <div className="font-bold text-xs text-white">Opción B — Menú Lateral</div>
                  <div className="text-[10px] text-slate-400">Barra lateral con categorías fijas, scrollspy y layout moderno</div>
                </div>
              </label>
            </div>
          </div>

          {/* Política de Stock Negativo */}
          <div className="bg-[#181b26] p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-orange-400 font-bold text-sm">
              <ShieldAlert className="w-4 h-4" />
              <span>Política de Ventas Sin Stock</span>
            </div>
            <p className="text-xs text-slate-400">
              ¿Qué debe ocurrir en el POS si los insumos de la receta están agotados?
            </p>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-3 rounded-xl border border-slate-700/60 bg-[#12141c] cursor-pointer hover:border-orange-500/50">
                <input
                  type="radio"
                  name="politicaStock"
                  value="BLOQUEAR"
                  checked={settings.politicaStockNegativo === 'BLOQUEAR'}
                  onChange={() => setSettings({ ...settings, politicaStockNegativo: 'BLOQUEAR' })}
                  className="text-orange-500 focus:ring-orange-500"
                />
                <div>
                  <div className="font-bold text-xs text-white">Modalidad A — Bloquear Venta</div>
                  <div className="text-[10px] text-slate-400">Impide confirmar la venta e informa insumos faltantes</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 rounded-xl border border-slate-700/60 bg-[#12141c] cursor-pointer hover:border-orange-500/50">
                <input
                  type="radio"
                  name="politicaStock"
                  value="PERMITIR_NEGATIVO"
                  checked={settings.politicaStockNegativo === 'PERMITIR_NEGATIVO'}
                  onChange={() => setSettings({ ...settings, politicaStockNegativo: 'PERMITIR_NEGATIVO' })}
                  className="text-orange-500 focus:ring-orange-500"
                />
                <div>
                  <div className="font-bold text-xs text-white">Modalidad B — Permitir Negativo</div>
                  <div className="text-[10px] text-slate-400">Asienta existencias negativas con registro de auditoría en Kardex</div>
                </div>
              </label>
            </div>
          </div>

          {/* Días Anticipación Vencimiento FEFO */}
          <div className="bg-[#181b26] p-4 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-orange-400 font-bold text-sm">
                <Clock className="w-4 h-4" />
                <span>Alerta de Vencimientos (FEFO)</span>
              </div>
              <p className="text-xs text-slate-400">
                Días de anticipación para marcar insumos y lotes como "Próximos a Vencer" en el tablero de alertas.
              </p>
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Días de anticipación:
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={settings.diasAnticipacionVencimiento}
                  onChange={(e) => setSettings({ ...settings, diasAnticipacionVencimiento: Number(e.target.value) })}
                  className="w-full bg-[#12141c] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-500 italic">
              * Basado en política FEFO (First Expired, First Out)
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: GESTIÓN DE MÓDULOS HABILITADOS */}
      <div className="bg-[#12141c] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">
              Gestión y Habilitación de Módulos
            </h2>
            <p className="text-xs text-slate-400">
              Activa o desactiva las capacidades del sistema según el plan o modelo de negocio de tu restaurante.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-slate-950 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>Guardar Toda la Configuración</span>
          </button>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => {
            const isEnabled = !!enabledModules[mod.id];
            const IconComponent = ICON_MAP[mod.icono] || Settings;

            return (
              <div
                key={mod.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  isEnabled
                    ? 'bg-[#181b26] border-slate-700/80 shadow-md'
                    : 'bg-[#12141c]/50 border-slate-800/50 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-2 rounded-xl ${isEnabled ? 'bg-orange-500/10 text-orange-400' : 'bg-slate-800 text-slate-500'}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-white">{mod.nombre}</h3>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                          {mod.categoria}
                        </span>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleModule(mod.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        isEnabled ? 'bg-orange-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                    {mod.descripcion}
                  </p>
                </div>

                {mod.requiere && mod.requiere.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center space-x-1">
                    <span>Requiere:</span>
                    <span className="font-mono text-orange-400/80">
                      {mod.requiere.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
