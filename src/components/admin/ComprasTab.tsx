'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  DollarSign, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  RefreshCw, 
  Building2, 
  Phone, 
  Mail, 
  Layers,
  ChevronDown,
  Eye
} from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/lib/export-utils';

interface ComprasTabProps {
  restaurantId: string;
  restaurantName: string;
}

export const ComprasTab: React.FC<ComprasTabProps> = ({ restaurantId, restaurantName }) => {
  const [activeSubTab, setActiveSubTab] = useState<'purchases' | 'suppliers'>('purchases');
  const [purchases, setPurchases] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [supplies, setSupplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState<any | null>(null);

  // Supplier Form State
  const [supplierForm, setSupplierForm] = useState({
    id: '',
    nombre: '',
    nitOIdentificacion: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: '',
    diasCredito: 0,
    observaciones: '',
  });

  // Purchase Form State
  const [purchaseForm, setPurchaseForm] = useState({
    supplierId: '',
    numeroFactura: '',
    fecha: new Date().toISOString().split('T')[0],
    impuestos: 0,
    observaciones: '',
    items: [] as Array<{
      supplyId: string;
      cantidad: number;
      unidadMedida: string;
      costoUnitario: number;
      subtotal: number;
      lote: string;
      fechaVencimiento: string;
    }>,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [purchasesRes, suppliersRes, suppliesRes] = await Promise.all([
        fetch(`/api/purchases?restaurantId=${restaurantId}`),
        fetch(`/api/suppliers?restaurantId=${restaurantId}`),
        fetch(`/api/supplies?restaurantId=${restaurantId}`),
      ]);

      if (purchasesRes.ok) setPurchases(await purchasesRes.json());
      if (suppliersRes.ok) setSuppliers(await suppliersRes.json());
      if (suppliesRes.ok) {
        const sData = await suppliesRes.json();
        setSupplies(sData.supplies || []);
      }
    } catch (err) {
      console.error('Error fetching purchases data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchData();
    }
  }, [restaurantId]);

  // Live Purchase Form calculations
  const purchaseFormTotals = useMemo(() => {
    let subtotal = 0;
    purchaseForm.items.forEach((item) => {
      subtotal += (Number(item.cantidad) || 0) * (Number(item.costoUnitario) || 0);
    });
    const taxes = Number(purchaseForm.impuestos) || 0;
    return {
      subtotal,
      taxes,
      total: subtotal + taxes,
    };
  }, [purchaseForm.items, purchaseForm.impuestos]);

  // Handle open purchase modal
  const handleOpenPurchaseModal = () => {
    if (suppliers.length === 0) {
      alert('Debes registrar al menos un proveedor antes de crear una compra.');
      setActiveSubTab('suppliers');
      setShowSupplierModal(true);
      return;
    }

    setPurchaseForm({
      supplierId: suppliers[0]?.id || '',
      numeroFactura: '',
      fecha: new Date().toISOString().split('T')[0],
      impuestos: 0,
      observaciones: '',
      items: supplies.length > 0 ? [
        {
          supplyId: supplies[0].id,
          cantidad: 1,
          unidadMedida: supplies[0].unidadMedida || 'kg',
          costoUnitario: Number(supplies[0].costoUnitario || 0),
          subtotal: Number(supplies[0].costoUnitario || 0),
          lote: '',
          fechaVencimiento: '',
        }
      ] : [],
    });
    setShowPurchaseModal(true);
  };

  const handleAddPurchaseItem = () => {
    if (supplies.length === 0) return;
    const first = supplies[0];
    setPurchaseForm({
      ...purchaseForm,
      items: [
        ...purchaseForm.items,
        {
          supplyId: first.id,
          cantidad: 1,
          unidadMedida: first.unidadMedida || 'kg',
          costoUnitario: Number(first.costoUnitario || 0),
          subtotal: Number(first.costoUnitario || 0),
          lote: '',
          fechaVencimiento: '',
        },
      ],
    });
  };

  const handleUpdatePurchaseItem = (index: number, field: string, value: any) => {
    const updated = [...purchaseForm.items];
    if (field === 'supplyId') {
      const sup = supplies.find((s) => s.id === value);
      const unitCost = Number(sup?.costoUnitario || 0);
      updated[index] = {
        ...updated[index],
        supplyId: value,
        unidadMedida: sup?.unidadMedida || updated[index].unidadMedida,
        costoUnitario: unitCost,
        subtotal: updated[index].cantidad * unitCost,
      };
    } else if (field === 'cantidad') {
      const qty = Number(value) || 0;
      updated[index] = {
        ...updated[index],
        cantidad: qty,
        subtotal: qty * updated[index].costoUnitario,
      };
    } else if (field === 'costoUnitario') {
      const cost = Number(value) || 0;
      updated[index] = {
        ...updated[index],
        costoUnitario: cost,
        subtotal: updated[index].cantidad * cost,
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setPurchaseForm({ ...purchaseForm, items: updated });
  };

  const handleRemovePurchaseItem = (index: number) => {
    setPurchaseForm({
      ...purchaseForm,
      items: purchaseForm.items.filter((_, i) => i !== index),
    });
  };

  const handleSavePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (purchaseForm.items.length === 0) {
      alert('Agrega al menos un insumo a la orden de compra');
      return;
    }

    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          ...purchaseForm,
          usuarioNombre: 'Administrador',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar compra');

      setShowPurchaseModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Supplier modal
  const handleOpenSupplierModal = (sup?: any) => {
    if (sup) {
      setSupplierForm({
        id: sup.id,
        nombre: sup.nombre,
        nitOIdentificacion: sup.nitOIdentificacion || '',
        contacto: sup.contacto || '',
        telefono: sup.telefono || '',
        email: sup.email || '',
        direccion: sup.direccion || '',
        diasCredito: sup.diasCredito || 0,
        observaciones: sup.observaciones || '',
      });
    } else {
      setSupplierForm({
        id: '',
        nombre: '',
        nitOIdentificacion: '',
        contacto: '',
        telefono: '',
        email: '',
        direccion: '',
        diasCredito: 0,
        observaciones: '',
      });
    }
    setShowSupplierModal(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (supplierForm.id) {
        const res = await fetch(`/api/suppliers/${supplierForm.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(supplierForm),
        });
        if (!res.ok) throw new Error('Error al actualizar proveedor');
      } else {
        const res = await fetch('/api/suppliers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...supplierForm, restaurantId }),
        });
        if (!res.ok) throw new Error('Error al crear proveedor');
      }
      setShowSupplierModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Exports
  const handleExportPurchasesExcel = () => {
    const data = purchases.map((p) => ({
      FECHA: new Date(p.fecha).toLocaleDateString('es-CO'),
      FACTURA: p.numeroFactura || '-',
      PROVEEDOR: p.supplier?.nombre || 'General',
      NIT: p.supplier?.nitOIdentificacion || '-',
      SUBTOTAL: p.totalNeto,
      IMPUESTOS: p.impuestos,
      TOTAL: p.total,
      ESTADO: p.estado,
    }));
    exportToExcel(data, `compras_${restaurantName.toLowerCase().replace(/\s+/g, '_')}`);
  };

  const handleExportPurchasesPdf = () => {
    const columns = ['Fecha', 'Factura', 'Proveedor', 'Subtotal', 'Impuestos', 'Total', 'Estado'];
    const rows = purchases.map((p) => [
      new Date(p.fecha).toLocaleDateString('es-CO'),
      p.numeroFactura || '-',
      p.supplier?.nombre || 'General',
      `$${Math.round(p.totalNeto).toLocaleString('es-CO')}`,
      `$${Math.round(p.impuestos).toLocaleString('es-CO')}`,
      `$${Math.round(p.total).toLocaleString('es-CO')}`,
      p.estado,
    ]);

    const totalGastado = purchases.reduce((acc, p) => acc + Number(p.total || 0), 0);

    exportToPdf({
      title: 'Reporte de Compras y Entradas de Almacén',
      restaurantName,
      columns,
      rows,
      fileName: `compras_${restaurantName.toLowerCase().replace(/\s+/g, '_')}`,
      summaryRows: [
        `Total de órdenes de compra: ${purchases.length}`,
        `Monto total acumulado: $${Math.round(totalGastado).toLocaleString('es-CO')}`,
      ],
    });
  };

  return (
    <div className="space-y-6">
      {/* Subtab Navigation and Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#12141c] border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('purchases')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === 'purchases'
                ? 'bg-orange-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Órdenes de Compra ({purchases.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('suppliers')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === 'suppliers'
                ? 'bg-orange-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Proveedores ({suppliers.length})</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeSubTab === 'purchases' ? (
            <>
              <button
                type="button"
                onClick={handleExportPurchasesExcel}
                className="flex items-center space-x-1 px-2.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-all"
                title="Exportar a Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Excel</span>
              </button>

              <button
                type="button"
                onClick={handleExportPurchasesPdf}
                className="flex items-center space-x-1 px-2.5 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold transition-all"
                title="Exportar a PDF"
              >
                <FileText className="w-4 h-4" />
                <span>PDF</span>
              </button>

              <button
                type="button"
                onClick={handleOpenPurchaseModal}
                className="flex items-center space-x-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Compra</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenSupplierModal()}
              className="flex items-center space-x-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Proveedor</span>
            </button>
          )}
        </div>
      </div>

      {/* PURCHASES LIST */}
      {activeSubTab === 'purchases' && (
        <div className="bg-[#12141c] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#181b26] text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Factura / Remisión</th>
                  <th className="py-3 px-4">Proveedor</th>
                  <th className="py-3 px-3 text-right">Subtotal</th>
                  <th className="py-3 px-3 text-right">Impuestos</th>
                  <th className="py-3 px-3 text-right">Total Factura</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-400" />
                      Cargando historial de compras...
                    </td>
                  </tr>
                ) : purchases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      No hay compras registradas aún. Registra tu primera compra para surtir el inventario.
                    </td>
                  </tr>
                ) : (
                  purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {new Date(p.fecha).toLocaleDateString('es-CO')}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {p.numeroFactura || `#${p.id.slice(-6)}`}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{p.supplier?.nombre || 'Proveedor'}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{p.supplier?.nitOIdentificacion || ''}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-400">
                        ${Math.round(p.totalNeto).toLocaleString('es-CO')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-400">
                        ${Math.round(p.impuestos).toLocaleString('es-CO')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-emerald-400">
                        ${Math.round(p.total).toLocaleString('es-CO')}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400">
                          {p.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setViewingPurchase(p)}
                          className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                          title="Ver detalle de compra"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUPPLIERS DIRECTORY */}
      {activeSubTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-[#12141c] border border-slate-800 rounded-2xl p-8 space-y-3">
              <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">No hay proveedores registrados</h3>
              <p className="text-xs text-slate-500">
                Registra tus distribuidores de carnes, vegetales, lácteos y packaging.
              </p>
              <button
                type="button"
                onClick={() => handleOpenSupplierModal()}
                className="mt-2 px-4 py-2 bg-orange-500 text-slate-950 rounded-xl text-xs font-bold"
              >
                Nuevo Proveedor
              </button>
            </div>
          ) : (
            suppliers.map((s) => (
              <div
                key={s.id}
                className="bg-[#12141c] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between pb-2 border-b border-slate-800">
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-white">
                        {s.nombre}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-500">
                        NIT: {s.nitOIdentificacion || 'No registrado'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenSupplierModal(s)}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-2 text-xs text-slate-300">
                    {s.contacto && (
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500">Contacto:</span>
                        <span className="font-semibold text-white">{s.contacto}</span>
                      </div>
                    )}
                    {s.telefono && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3.5 h-3.5 text-orange-400" />
                        <span>{s.telefono}</span>
                      </div>
                    )}
                    {s.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3.5 h-3.5 text-orange-400" />
                        <span>{s.email}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500">Crédito:</span>
                      <span className="font-mono font-bold text-orange-400">{s.diasCredito} días</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{s._count?.purchases || 0} compras realizadas</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${s.activo ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {s.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* REGISTER PURCHASE MODAL */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-orange-400" />
                <h3 className="font-extrabold text-base text-white">
                  Registrar Entrada de Compra a Proveedor
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPurchaseModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Proveedor *</label>
                  <select
                    required
                    value={purchaseForm.supplierId}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, supplierId: e.target.value })}
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre} ({s.nitOIdentificacion || 'Sin NIT'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Nro Factura / Remisión</label>
                  <input
                    type="text"
                    value={purchaseForm.numeroFactura}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, numeroFactura: e.target.value })}
                    placeholder="FAC-00123"
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Fecha de Compra</label>
                  <input
                    type="date"
                    value={purchaseForm.fecha}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, fecha: e.target.value })}
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-xs">
                    Insumos Comprados
                  </span>
                  <button
                    type="button"
                    onClick={handleAddPurchaseItem}
                    className="flex items-center space-x-1 px-3 py-1 bg-orange-500 hover:bg-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Insumo</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {purchaseForm.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center bg-[#181b26] p-2.5 rounded-xl border border-slate-800"
                    >
                      <div className="col-span-4">
                        <select
                          value={item.supplyId}
                          onChange={(e) => handleUpdatePurchaseItem(idx, 'supplyId', e.target.value)}
                          className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white"
                        >
                          {supplies.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nombre} ({s.unidadMedida})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          step="any"
                          min="0.0001"
                          required
                          value={item.cantidad}
                          onChange={(e) => handleUpdatePurchaseItem(idx, 'cantidad', e.target.value)}
                          placeholder="Cant"
                          className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white font-mono font-bold"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          required
                          value={item.costoUnitario}
                          onChange={(e) => handleUpdatePurchaseItem(idx, 'costoUnitario', e.target.value)}
                          placeholder="Costo Unit"
                          className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white font-mono"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="text"
                          value={item.lote}
                          onChange={(e) => handleUpdatePurchaseItem(idx, 'lote', e.target.value)}
                          placeholder="Lote"
                          className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-300 font-mono"
                        />
                      </div>

                      <div className="col-span-2 flex items-center justify-between pl-1">
                        <span className="font-mono text-xs font-bold text-white">
                          ${Math.round(item.subtotal || 0).toLocaleString('es-CO')}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePurchaseItem(idx)}
                          className="p-1 hover:bg-slate-700 text-slate-400 hover:text-red-400 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="bg-[#181b26] p-3 rounded-xl space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Neto:</span>
                  <span className="font-mono font-bold text-white">
                    ${Math.round(purchaseFormTotals.subtotal).toLocaleString('es-CO')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Impuestos / IVA ($):</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={purchaseForm.impuestos}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, impuestos: Number(e.target.value) })}
                    className="w-32 bg-[#1b1e2a] border border-slate-700 rounded-lg px-2 py-1 text-right text-white font-mono font-bold"
                  />
                </div>
                <div className="flex justify-between text-sm sm:text-base font-black text-white pt-2 border-t border-slate-800">
                  <span>Total General de Factura:</span>
                  <span className="font-mono text-emerald-400">
                    ${Math.round(purchaseFormTotals.total).toLocaleString('es-CO')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Observaciones</label>
                <textarea
                  rows={2}
                  value={purchaseForm.observaciones}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, observaciones: e.target.value })}
                  placeholder="Detalles de la entrega, transportadora, etc..."
                  className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 rounded-xl font-bold shadow-lg"
                >
                  Registrar Entrada y Actualizar Costos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPPLIER MODAL */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-base text-white">
                {supplierForm.id ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h3>
              <button
                type="button"
                onClick={() => setShowSupplierModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Nombre o Razón Social *</label>
                <input
                  type="text"
                  required
                  value={supplierForm.nombre}
                  onChange={(e) => setSupplierForm({ ...supplierForm, nombre: e.target.value })}
                  className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">NIT / Identificación</label>
                  <input
                    type="text"
                    value={supplierForm.nitOIdentificacion}
                    onChange={(e) => setSupplierForm({ ...supplierForm, nitOIdentificacion: e.target.value })}
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Días de Crédito</label>
                  <input
                    type="number"
                    min="0"
                    value={supplierForm.diasCredito}
                    onChange={(e) => setSupplierForm({ ...supplierForm, diasCredito: Number(e.target.value) })}
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Contacto Comercial</label>
                  <input
                    type="text"
                    value={supplierForm.contacto}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contacto: e.target.value })}
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    value={supplierForm.telefono}
                    onChange={(e) => setSupplierForm({ ...supplierForm, telefono: e.target.value })}
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Dirección / Ciudad</label>
                  <input
                    type="text"
                    value={supplierForm.direccion}
                    onChange={(e) => setSupplierForm({ ...supplierForm, direccion: e.target.value })}
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 rounded-xl font-bold shadow-lg"
                >
                  Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PURCHASE DETAIL MODAL */}
      {viewingPurchase && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-extrabold text-base text-white">
                  Detalle de Compra: {viewingPurchase.numeroFactura || `#${viewingPurchase.id.slice(-6)}`}
                </h3>
                <span className="text-xs text-slate-400">
                  Proveedor: {viewingPurchase.supplier?.nombre} • {new Date(viewingPurchase.fecha).toLocaleDateString('es-CO')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingPurchase(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {viewingPurchase.items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-2.5 bg-[#181b26] rounded-xl text-xs">
                  <div>
                    <div className="font-bold text-white">{item.supply?.nombre || 'Insumo'}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {item.cantidad} {item.unidadMedida} x ${Math.round(item.costoUnitario).toLocaleString('es-CO')}
                    </div>
                  </div>
                  <span className="font-mono font-bold text-white">
                    ${Math.round(item.subtotal).toLocaleString('es-CO')}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#181b26] rounded-xl space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono font-bold text-white">${Math.round(viewingPurchase.totalNeto).toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Impuestos:</span>
                <span className="font-mono font-bold text-white">${Math.round(viewingPurchase.impuestos).toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-white pt-1 border-t border-slate-700">
                <span>Total General:</span>
                <span className="font-mono text-emerald-400">${Math.round(viewingPurchase.total).toLocaleString('es-CO')}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setViewingPurchase(null)}
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
