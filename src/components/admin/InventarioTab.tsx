'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Boxes, 
  Plus, 
  Search, 
  AlertTriangle, 
  FileSpreadsheet, 
  FileText, 
  ArrowUpDown, 
  History, 
  Calendar, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Scale, 
  Filter,
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/lib/export-utils';

interface Supply {
  id: string;
  codigo?: string;
  nombre: string;
  categoria?: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  costoUnitario: number;
  costoPromedio: number;
  mermaEsperada: number;
  lote?: string;
  fechaVencimiento?: string;
  ubicacionAlmacen?: string;
  isLowStock?: boolean;
  isNegative?: boolean;
  isExpiringSoon?: boolean;
  isExpired?: boolean;
}

interface InventarioTabProps {
  restaurantId: string;
  restaurantName: string;
}

export const InventarioTab: React.FC<InventarioTabProps> = ({ restaurantId, restaurantName }) => {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAlert, setFilterAlert] = useState<string>('all');
  const [metrics, setMetrics] = useState<any>(null);

  // Modals
  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showKardexModal, setShowKardexModal] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);

  // Supply Form State
  const [supplyForm, setSupplyForm] = useState({
    id: '',
    codigo: '',
    nombre: '',
    categoria: 'General',
    unidadMedida: 'kg',
    stockActual: 0,
    stockMinimo: 5,
    stockMaximo: 50,
    costoUnitario: 0,
    mermaEsperada: 0,
    ubicacionAlmacen: '',
    lote: '',
    fechaVencimiento: '',
  });

  // Adjust Form State
  const [adjustForm, setAdjustForm] = useState({
    supplyId: '',
    tipo: 'SALIDA_MERMA',
    cantidad: 1,
    motivo: '',
  });

  // Kardex State
  const [kardexMovements, setKardexMovements] = useState<any[]>([]);
  const [kardexLoading, setKardexLoading] = useState(false);
  const [kardexFilterType, setKardexFilterType] = useState('');

  const fetchSupplies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/supplies?restaurantId=${restaurantId}`);
      if (res.ok) {
        const data = await res.json();
        setSupplies(data.supplies || []);
        setMetrics(data.metrics || null);
      }
    } catch (err) {
      console.error('Error fetching supplies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchSupplies();
    }
  }, [restaurantId]);

  // Filtered supplies
  const filteredSupplies = useMemo(() => {
    return supplies.filter((s) => {
      // Alert filters
      if (filterAlert === 'low_stock' && !s.isLowStock) return false;
      if (filterAlert === 'negative' && !s.isNegative) return false;
      if (filterAlert === 'expiring' && !s.isExpiringSoon) return false;
      if (filterAlert === 'expired' && !s.isExpired) return false;

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = s.nombre.toLowerCase().includes(q);
        const matchesCode = (s.codigo || '').toLowerCase().includes(q);
        const matchesCat = (s.categoria || '').toLowerCase().includes(q);
        return matchesName || matchesCode || matchesCat;
      }
      return true;
    });
  }, [supplies, filterAlert, search]);

  // Open Create/Edit modal
  const handleOpenSupplyModal = (supply?: Supply) => {
    if (supply) {
      setSupplyForm({
        id: supply.id,
        codigo: supply.codigo || '',
        nombre: supply.nombre,
        categoria: supply.categoria || 'General',
        unidadMedida: supply.unidadMedida,
        stockActual: supply.stockActual,
        stockMinimo: supply.stockMinimo,
        stockMaximo: supply.stockMaximo,
        costoUnitario: supply.costoUnitario,
        mermaEsperada: supply.mermaEsperada,
        ubicacionAlmacen: supply.ubicacionAlmacen || '',
        lote: supply.lote || '',
        fechaVencimiento: supply.fechaVencimiento ? supply.fechaVencimiento.split('T')[0] : '',
      });
    } else {
      setSupplyForm({
        id: '',
        codigo: `INS-${String(supplies.length + 1).padStart(3, '0')}`,
        nombre: '',
        categoria: 'General',
        unidadMedida: 'kg',
        stockActual: 0,
        stockMinimo: 5,
        stockMaximo: 50,
        costoUnitario: 0,
        mermaEsperada: 0,
        ubicacionAlmacen: '',
        lote: '',
        fechaVencimiento: '',
      });
    }
    setShowSupplyModal(true);
  };

  const handleSaveSupply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (supplyForm.id) {
        // PUT
        const res = await fetch(`/api/supplies/${supplyForm.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(supplyForm),
        });
        if (!res.ok) throw new Error('Error al actualizar insumo');
      } else {
        // POST
        const res = await fetch('/api/supplies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...supplyForm, restaurantId }),
        });
        if (!res.ok) throw new Error('Error al crear insumo');
      }
      setShowSupplyModal(false);
      fetchSupplies();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteSupply = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el insumo "${name}"? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch(`/api/supplies/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar');
      fetchSupplies();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Adjust stock
  const handleOpenAdjust = (supply: Supply) => {
    setSelectedSupply(supply);
    setAdjustForm({
      supplyId: supply.id,
      tipo: 'SALIDA_MERMA',
      cantidad: 1,
      motivo: 'Ajuste manual de merma',
    });
    setShowAdjustModal(true);
  };

  const handleSaveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/supplies/kardex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          supplyId: adjustForm.supplyId,
          tipo: adjustForm.tipo,
          cantidad: Number(adjustForm.cantidad),
          motivo: adjustForm.motivo,
          usuarioNombre: 'Administrador',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar ajuste');

      setShowAdjustModal(false);
      fetchSupplies();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Kardex
  const handleOpenKardex = async (supply?: Supply) => {
    setSelectedSupply(supply || null);
    setShowKardexModal(true);
    setKardexLoading(true);
    try {
      let url = `/api/supplies/kardex?restaurantId=${restaurantId}`;
      if (supply) url += `&supplyId=${supply.id}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setKardexMovements(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setKardexLoading(false);
    }
  };

  // Exports
  const handleExportExcel = () => {
    const data = filteredSupplies.map((s) => ({
      CÓDIGO: s.codigo || '',
      NOMBRE: s.nombre,
      CATEGORÍA: s.categoria || 'General',
      'UNIDAD DE MEDIDA': s.unidadMedida,
      'STOCK ACTUAL': s.stockActual,
      'STOCK MÍNIMO': s.stockMinimo,
      'STOCK MÁXIMO': s.stockMaximo,
      'COSTO UNITARIO': s.costoUnitario,
      'COSTO PROMEDIO': s.costoPromedio,
      'VALOR TOTAL INVENTARIO': s.stockActual * (s.costoPromedio || s.costoUnitario),
      'MERMA ESPERADA (%)': s.mermaEsperada,
      LOTE: s.lote || '',
      'FECHA VENCIMIENTO': s.fechaVencimiento ? s.fechaVencimiento.split('T')[0] : '',
      UBICACIÓN: s.ubicacionAlmacen || '',
    }));
    exportToExcel(data, `inventario_insumos_${restaurantName.toLowerCase().replace(/\s+/g, '_')}`);
  };

  const handleExportPdf = () => {
    const columns = ['Código', 'Insumo', 'Unidad', 'Stock', 'Mínimo', 'Costo Prom.', 'Valor Total', 'Estado'];
    const rows = filteredSupplies.map((s) => {
      let estado = 'Normal';
      if (s.isNegative) estado = 'NEGATIVO';
      else if (s.isLowStock) estado = 'BAJO';
      else if (s.isExpired) estado = 'VENCIDO';
      else if (s.isExpiringSoon) estado = 'POR VENCER';

      const valorTotal = s.stockActual * (s.costoPromedio || s.costoUnitario);

      return [
        s.codigo || '-',
        s.nombre,
        s.unidadMedida,
        s.stockActual.toFixed(2),
        s.stockMinimo.toFixed(2),
        `$${Number(s.costoPromedio || s.costoUnitario).toLocaleString('es-CO')}`,
        `$${Math.round(valorTotal).toLocaleString('es-CO')}`,
        estado,
      ];
    });

    const totalValorizado = filteredSupplies.reduce(
      (acc, s) => acc + s.stockActual * (s.costoPromedio || s.costoUnitario),
      0
    );

    exportToPdf({
      title: 'Reporte General de Inventario y Materias Primas',
      restaurantName,
      columns,
      rows,
      fileName: `inventario_${restaurantName.toLowerCase().replace(/\s+/g, '_')}`,
      summaryRows: [
        `Total de insumos listados: ${filteredSupplies.length}`,
        `Valorización total del inventario: $${Math.round(totalValorizado).toLocaleString('es-CO')}`,
      ],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Quick Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-[#12141c] border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Insumos</span>
          <div className="text-xl font-extrabold text-white">{metrics?.totalSupplies ?? supplies.length}</div>
          <span className="text-[10px] text-slate-500">Materias primas activas</span>
        </div>

        <div className="bg-[#12141c] border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Inventario Valorizado</span>
          <div className="text-xl font-extrabold text-emerald-400 font-mono">
            ${Math.round(metrics?.totalValuation ?? 0).toLocaleString('es-CO')}
          </div>
          <span className="text-[10px] text-slate-500">A costo promedio ponderado</span>
        </div>

        <div 
          onClick={() => setFilterAlert(filterAlert === 'low_stock' ? 'all' : 'low_stock')}
          className={`border rounded-2xl p-3.5 space-y-1 cursor-pointer transition-all ${
            filterAlert === 'low_stock'
              ? 'bg-amber-500/20 border-amber-500'
              : 'bg-[#12141c] border-slate-800 hover:border-amber-500/50'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Bajo Stock</span>
          </span>
          <div className="text-xl font-extrabold text-amber-400">{metrics?.lowStockCount ?? 0}</div>
          <span className="text-[10px] text-slate-500">Por debajo del mínimo</span>
        </div>

        <div 
          onClick={() => setFilterAlert(filterAlert === 'negative' ? 'all' : 'negative')}
          className={`border rounded-2xl p-3.5 space-y-1 cursor-pointer transition-all ${
            filterAlert === 'negative'
              ? 'bg-red-500/20 border-red-500'
              : 'bg-[#12141c] border-slate-800 hover:border-red-500/50'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 flex items-center space-x-1">
            <TrendingDown className="w-3 h-3" />
            <span>Stock Negativo</span>
          </span>
          <div className="text-xl font-extrabold text-red-400">{metrics?.negativeStockCount ?? 0}</div>
          <span className="text-[10px] text-slate-500">Requieren reposición</span>
        </div>

        <div 
          onClick={() => setFilterAlert(filterAlert === 'expiring' ? 'all' : 'expiring')}
          className={`border rounded-2xl p-3.5 space-y-1 cursor-pointer transition-all ${
            filterAlert === 'expiring'
              ? 'bg-orange-500/20 border-orange-500'
              : 'bg-[#12141c] border-slate-800 hover:border-orange-500/50'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>Por Vencer</span>
          </span>
          <div className="text-xl font-extrabold text-orange-400">{metrics?.expiringSoonCount ?? 0}</div>
          <span className="text-[10px] text-slate-500">Próximos días (FEFO)</span>
        </div>

        <div 
          onClick={() => setFilterAlert(filterAlert === 'expired' ? 'all' : 'expired')}
          className={`border rounded-2xl p-3.5 space-y-1 cursor-pointer transition-all ${
            filterAlert === 'expired'
              ? 'bg-rose-500/20 border-rose-500'
              : 'bg-[#12141c] border-slate-800 hover:border-rose-500/50'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1">
            <X className="w-3 h-3" />
            <span>Vencidos</span>
          </span>
          <div className="text-xl font-extrabold text-rose-400">{metrics?.expiredCount ?? 0}</div>
          <span className="text-[10px] text-slate-500">Descartar o ajustar</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#12141c] border border-slate-800 rounded-2xl p-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, insumo o categoría..."
            className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => handleOpenKardex()}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all"
          >
            <History className="w-4 h-4 text-orange-400" />
            <span>Kardex General</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center space-x-1 px-2.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-all"
            title="Exportar a Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel</span>
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            className="flex items-center space-x-1 px-2.5 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold transition-all"
            title="Exportar a PDF"
          >
            <FileText className="w-4 h-4" />
            <span>PDF</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenSupplyModal()}
            className="flex items-center space-x-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Insumo</span>
          </button>
        </div>
      </div>

      {/* Main Supplies Table */}
      <div className="bg-[#12141c] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#181b26] text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Código / Insumo</th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-3">Unidad</th>
                <th className="py-3 px-3 text-right">Stock Actual</th>
                <th className="py-3 px-3 text-right">Límites (Mín - Máx)</th>
                <th className="py-3 px-3 text-right">Costo Promedio</th>
                <th className="py-3 px-3 text-right">Valor Total</th>
                <th className="py-3 px-3">Lote / Vence</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-400" />
                    Cargando inventario de materias primas...
                  </td>
                </tr>
              ) : filteredSupplies.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No se encontraron insumos con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredSupplies.map((s) => {
                  const valorTotal = s.stockActual * (s.costoPromedio || s.costoUnitario);
                  return (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white flex items-center space-x-2">
                          <span>{s.nombre}</span>
                          {s.isNegative && (
                            <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.2 rounded font-black">
                              NEGATIVO
                            </span>
                          )}
                          {s.isLowStock && !s.isNegative && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-black">
                              BAJO
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          {s.codigo || 'SIN-CÓDIGO'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-400">
                        {s.categoria || 'General'}
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-orange-400">
                        {s.unidadMedida}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold">
                        <span className={s.isNegative ? 'text-red-400' : s.isLowStock ? 'text-amber-400' : 'text-emerald-400'}>
                          {s.stockActual.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-400 text-xs">
                        {s.stockMinimo} - {s.stockMaximo}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-300">
                        ${Math.round(s.costoPromedio || s.costoUnitario).toLocaleString('es-CO')}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-white">
                        ${Math.round(valorTotal).toLocaleString('es-CO')}
                      </td>

                      <td className="py-3 px-3 text-xs">
                        {s.lote && <div className="text-slate-400 font-mono">Lot: {s.lote}</div>}
                        {s.fechaVencimiento ? (
                          <div className={`font-mono ${s.isExpired ? 'text-rose-400 font-bold' : s.isExpiringSoon ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                            {s.fechaVencimiento.split('T')[0]}
                          </div>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenAdjust(s)}
                            className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-orange-400 rounded-lg transition-colors"
                            title="Ajuste de Stock / Merma"
                          >
                            <Scale className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenKardex(s)}
                            className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                            title="Ver Kardex del Insumo"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenSupplyModal(s)}
                            className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                            title="Editar Insumo"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSupply(s.id, s.nombre)}
                            className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                            title="Eliminar Insumo"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* MODAL: Create/Edit Supply */}
      {showSupplyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                {supplyForm.id ? 'Editar Materia Prima / Insumo' : 'Nueva Materia Prima / Insumo'}
              </h3>
              <button
                type="button"
                onClick={() => setShowSupplyModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupply} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Código / Referencia *</label>
                  <input
                    type="text"
                    required
                    value={supplyForm.codigo}
                    onChange={(e) => setSupplyForm({ ...supplyForm, codigo: e.target.value })}
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Categoría</label>
                  <input
                    type="text"
                    value={supplyForm.categoria}
                    onChange={(e) => setSupplyForm({ ...supplyForm, categoria: e.target.value })}
                    placeholder="Carnes, Lácteos, Verduras..."
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Nombre del Insumo *</label>
                <input
                  type="text"
                  required
                  value={supplyForm.nombre}
                  onChange={(e) => setSupplyForm({ ...supplyForm, nombre: e.target.value })}
                  placeholder="Ej: Carne de res para hamburguesa"
                  className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Unidad de Medida *</label>
                  <select
                    value={supplyForm.unidadMedida}
                    onChange={(e) => setSupplyForm({ ...supplyForm, unidadMedida: e.target.value })}
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="kg">kg (Kilogramos)</option>
                    <option value="g">g (Gramos)</option>
                    <option value="mg">mg (Miligramos)</option>
                    <option value="l">l (Litros)</option>
                    <option value="ml">ml (Mililitros)</option>
                    <option value="und">und (Unidades)</option>
                    <option value="porc">porc (Porciones)</option>
                    <option value="paq">paq (Paquetes)</option>
                    <option value="caja">caja (Cajas)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Costo Unitario ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={supplyForm.costoUnitario}
                    onChange={(e) => setSupplyForm({ ...supplyForm, costoUnitario: Number(e.target.value) })}
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Merma Esperada (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={supplyForm.mermaEsperada}
                    onChange={(e) => setSupplyForm({ ...supplyForm, mermaEsperada: Number(e.target.value) })}
                    placeholder="Ej: 3.5"
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Stock Actual Inicial</label>
                  <input
                    type="number"
                    step="any"
                    value={supplyForm.stockActual}
                    onChange={(e) => setSupplyForm({ ...supplyForm, stockActual: Number(e.target.value) })}
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    step="any"
                    value={supplyForm.stockMinimo}
                    onChange={(e) => setSupplyForm({ ...supplyForm, stockMinimo: Number(e.target.value) })}
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Stock Máximo</label>
                  <input
                    type="number"
                    step="any"
                    value={supplyForm.stockMaximo}
                    onChange={(e) => setSupplyForm({ ...supplyForm, stockMaximo: Number(e.target.value) })}
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Lote</label>
                  <input
                    type="text"
                    value={supplyForm.lote}
                    onChange={(e) => setSupplyForm({ ...supplyForm, lote: e.target.value })}
                    placeholder="LOTE-001"
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Fecha Vencimiento</label>
                  <input
                    type="date"
                    value={supplyForm.fechaVencimiento}
                    onChange={(e) => setSupplyForm({ ...supplyForm, fechaVencimiento: e.target.value })}
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Ubicación Bodega</label>
                  <input
                    type="text"
                    value={supplyForm.ubicacionAlmacen}
                    onChange={(e) => setSupplyForm({ ...supplyForm, ubicacionAlmacen: e.target.value })}
                    placeholder="Nevera 2, Estante 4"
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSupplyModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 rounded-xl font-bold shadow-lg"
                >
                  Guardar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Manual Stock Adjustment */}
      {showAdjustModal && selectedSupply && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                <Scale className="w-5 h-5 text-orange-400" />
                <span>Ajuste de Stock: {selectedSupply.nombre}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="space-y-4 text-xs sm:text-sm">
              <div className="bg-slate-800/60 p-3 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Stock Actual en Sistema:</span>
                  <span className="font-bold font-mono text-white">
                    {selectedSupply.stockActual.toFixed(2)} {selectedSupply.unidadMedida}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Costo Base Unitario:</span>
                  <span className="font-bold font-mono text-white">
                    ${Math.round(selectedSupply.costoPromedio || selectedSupply.costoUnitario).toLocaleString('es-CO')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Tipo de Ajuste *</label>
                <select
                  value={adjustForm.tipo}
                  onChange={(e) => setAdjustForm({ ...adjustForm, tipo: e.target.value })}
                  className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="SALIDA_MERMA">Salida por Merma de Preparación</option>
                  <option value="SALIDA_DESPERDICIO">Salida por Desperdicio / Daño</option>
                  <option value="SALIDA_VENCIMIENTO">Salida por Vencimiento</option>
                  <option value="SALIDA_CONSUMO_INTERNO">Salida por Consumo Interno / Personal</option>
                  <option value="ENTRADA_AJUSTE">Entrada por Ajuste de Inventario</option>
                  <option value="SALIDA_AJUSTE">Salida por Ajuste de Inventario</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Cantidad a Ajustar ({selectedSupply.unidadMedida}) *
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.001"
                  required
                  value={adjustForm.cantidad}
                  onChange={(e) => setAdjustForm({ ...adjustForm, cantidad: Number(e.target.value) })}
                  className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Motivo / Justificación *</label>
                <textarea
                  required
                  rows={2}
                  value={adjustForm.motivo}
                  onChange={(e) => setAdjustForm({ ...adjustForm, motivo: e.target.value })}
                  placeholder="Detalla la razón del ajuste para auditoría en el Kardex..."
                  className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 rounded-xl font-bold shadow-lg"
                >
                  Confirmar y Asentar Kardex
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Full Kardex History */}
      {showKardexModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-orange-400" />
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    Kardex de Movimientos de Inventario
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedSupply ? `Insumo: ${selectedSupply.nombre}` : 'Todos los movimientos asentados'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowKardexModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {kardexLoading ? (
                <div className="py-12 text-center text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-400" />
                  Cargando trazabilidad...
                </div>
              ) : kardexMovements.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  No hay movimientos registrados en el Kardex.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#181b26] text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Fecha y Hora</th>
                      <th className="py-2.5 px-3">Insumo</th>
                      <th className="py-2.5 px-3">Tipo Movimiento</th>
                      <th className="py-2.5 px-3 text-right">Cant.</th>
                      <th className="py-2.5 px-3 text-right">Stock Previo</th>
                      <th className="py-2.5 px-3 text-right">Stock Posterior</th>
                      <th className="py-2.5 px-3">Doc / Motivo</th>
                      <th className="py-2.5 px-3">Usuario</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {kardexMovements.map((mov) => {
                      const isEntry = mov.tipo.startsWith('ENTRADA') || mov.tipo === 'INVENTARIO_INICIAL' || mov.tipo === 'DEVOLUCION_VENTA';
                      return (
                        <tr key={mov.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono text-slate-400">
                            {new Date(mov.createdAt).toLocaleString('es-CO')}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-white">
                            {mov.supply?.nombre || 'Insumo'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              isEntry ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {mov.tipo}
                            </span>
                          </td>
                          <td className={`py-2.5 px-3 text-right font-mono font-bold ${isEntry ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isEntry ? '+' : '-'}{mov.cantidad}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                            {mov.stockPrevio.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                            {mov.stockPosterior.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400">
                            <div className="font-semibold text-slate-300">{mov.documentoReferencia || '-'}</div>
                            <div className="text-[10px] line-clamp-1">{mov.motivo}</div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {mov.usuarioNombre || 'Sistema'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowKardexModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
