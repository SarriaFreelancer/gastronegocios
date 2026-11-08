'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  FileSpreadsheet, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Award, 
  Clock, 
  Trash2, 
  Edit3, 
  Eye, 
  X, 
  RefreshCw 
} from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/lib/export-utils';

interface ClientesTabProps {
  restaurantId: string;
  restaurantName: string;
}

export const ClientesTab: React.FC<ClientesTabProps> = ({ restaurantId, restaurantName }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<any | null>(null);

  // Form State
  const [customerForm, setCustomerForm] = useState({
    id: '',
    nombre: '',
    documentoTipo: 'CC',
    documentoNumero: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    limiteCredito: 0,
    observaciones: '',
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers?restaurantId=${restaurantId}`);
      if (res.ok) {
        setCustomers(await res.json());
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchCustomers();
    }
  }, [restaurantId]);

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        (c.documentoNumero || '').toLowerCase().includes(q) ||
        (c.telefono || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q)
    );
  }, [customers, search]);

  const handleOpenModal = (c?: any) => {
    if (c) {
      setCustomerForm({
        id: c.id,
        nombre: c.nombre,
        documentoTipo: c.documentoTipo || 'CC',
        documentoNumero: c.documentoNumero || '',
        telefono: c.telefono || '',
        email: c.email || '',
        direccion: c.direccion || '',
        ciudad: c.ciudad || '',
        limiteCredito: c.limiteCredito || 0,
        observaciones: c.observaciones || '',
      });
    } else {
      setCustomerForm({
        id: '',
        nombre: '',
        documentoTipo: 'CC',
        documentoNumero: '',
        telefono: '',
        email: '',
        direccion: '',
        ciudad: '',
        limiteCredito: 0,
        observaciones: '',
      });
    }
    setShowModal(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (customerForm.id) {
        const res = await fetch(`/api/customers/${customerForm.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customerForm),
        });
        if (!res.ok) throw new Error('Error al actualizar cliente');
      } else {
        const res = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...customerForm, restaurantId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al crear cliente');
      }
      setShowModal(false);
      fetchCustomers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleViewOrders = async (customerId: string) => {
    try {
      const res = await fetch(`/api/customers/${customerId}`);
      if (res.ok) {
        setViewingCustomer(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Exports
  const handleExportExcel = () => {
    const data = filteredCustomers.map((c) => ({
      NOMBRE: c.nombre,
      'TIPO DOC': c.documentoTipo || 'CC',
      'NUMERO DOC': c.documentoNumero || '',
      TELÉFONO: c.telefono || '',
      EMAIL: c.email || '',
      DIRECCIÓN: c.direccion || '',
      'TOTAL PEDIDOS': c._count?.orders || c.totalVisitas || 0,
      'TOTAL CONSUMIDO ($)': c.totalConsumido || 0,
      'LÍMITE CRÉDITO ($)': c.limiteCredito || 0,
      'SALDO CRÉDITO ($)': c.saldoCredito || 0,
      'PUNTOS FIDELIDAD': c.puntosFidelidad || 0,
    }));
    exportToExcel(data, `clientes_${restaurantName.toLowerCase().replace(/\s+/g, '_')}`);
  };

  const handleExportPdf = () => {
    const columns = ['Cliente', 'Documento', 'Teléfono', 'Pedidos', 'Total Consumido', 'Límite Crédito', 'Puntos'];
    const rows = filteredCustomers.map((c) => [
      c.nombre,
      `${c.documentoTipo || 'CC'} ${c.documentoNumero || '-'}`,
      c.telefono || '-',
      c._count?.orders || c.totalVisitas || 0,
      `$${Math.round(c.totalConsumido || 0).toLocaleString('es-CO')}`,
      `$${Math.round(c.limiteCredito || 0).toLocaleString('es-CO')}`,
      c.puntosFidelidad || 0,
    ]);

    exportToPdf({
      title: 'Directorio de Clientes y Fidelización',
      restaurantName,
      columns,
      rows,
      fileName: `clientes_${restaurantName.toLowerCase().replace(/\s+/g, '_')}`,
      summaryRows: [
        `Total clientes registrados: ${filteredCustomers.length}`,
        `Consumo acumulado total: $${Math.round(filteredCustomers.reduce((acc, c) => acc + (c.totalConsumido || 0), 0)).toLocaleString('es-CO')}`,
      ],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#12141c] border border-slate-800 rounded-2xl p-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-orange-400" />
            <span>Directorio de Clientes y Comensales</span>
          </h2>
          <p className="text-xs text-slate-400">
            Fidelización, historial de consumo en mesa/delivery y cuentas corrientes por restaurante.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, documento o cel..."
              className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

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
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-[#12141c] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#181b26] text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Documento</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-3 text-right">Pedidos</th>
                <th className="py-3 px-3 text-right">Total Consumido</th>
                <th className="py-3 px-3 text-right">Límite Crédito</th>
                <th className="py-3 px-3 text-right">Puntos</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-400" />
                    Cargando comensales...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No se encontraron clientes registrados.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{c.nombre}</div>
                      {c.direccion && (
                        <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{c.direccion}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-400">
                      {c.documentoNumero ? `${c.documentoTipo || 'CC'} ${c.documentoNumero}` : 'Sin Doc.'}
                    </td>

                    <td className="py-3 px-4 text-xs">
                      {c.telefono && <div className="text-white font-mono">{c.telefono}</div>}
                      {c.email && <div className="text-slate-500">{c.email}</div>}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-300">
                      {c._count?.orders || c.totalVisitas || 0}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-black text-emerald-400">
                      ${Math.round(c.totalConsumido || 0).toLocaleString('es-CO')}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-400">
                      ${Math.round(c.limiteCredito || 0).toLocaleString('es-CO')}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-orange-400">
                      {c.puntosFidelidad || 0}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleViewOrders(c.id)}
                          className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                          title="Historial de Pedidos"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenModal(c)}
                          className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                          title="Editar Cliente"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT CUSTOMER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-base text-white">
                {customerForm.id ? 'Editar Cliente' : 'Nuevo Cliente del Restaurante'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={customerForm.nombre}
                  onChange={(e) => setCustomerForm({ ...customerForm, nombre: e.target.value })}
                  placeholder="Ej: Andrés Morales"
                  className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Tipo Doc.</label>
                  <select
                    value={customerForm.documentoTipo}
                    onChange={(e) => setCustomerForm({ ...customerForm, documentoTipo: e.target.value })}
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="CC">CC</option>
                    <option value="NIT">NIT</option>
                    <option value="CE">CE</option>
                    <option value="PAS">Pasaporte</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-400 font-bold mb-1">Número de Documento</label>
                  <input
                    type="text"
                    value={customerForm.documentoNumero}
                    onChange={(e) => setCustomerForm({ ...customerForm, documentoNumero: e.target.value })}
                    placeholder="1098765432"
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Teléfono / Celular</label>
                  <input
                    type="text"
                    value={customerForm.telefono}
                    onChange={(e) => setCustomerForm({ ...customerForm, telefono: e.target.value })}
                    placeholder="300 123 4567"
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    placeholder="cliente@correo.com"
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Dirección de Entrega</label>
                  <input
                    type="text"
                    value={customerForm.direccion}
                    onChange={(e) => setCustomerForm({ ...customerForm, direccion: e.target.value })}
                    placeholder="Calle 15 # 4-20"
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Límite de Crédito ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={customerForm.limiteCredito}
                    onChange={(e) => setCustomerForm({ ...customerForm, limiteCredito: Number(e.target.value) })}
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Observaciones / Alergias / Preferencias</label>
                <textarea
                  rows={2}
                  value={customerForm.observaciones}
                  onChange={(e) => setCustomerForm({ ...customerForm, observaciones: e.target.value })}
                  placeholder="Sin cebolla, alérgico a nueces, mesa preferida..."
                  className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 rounded-xl font-bold shadow-lg"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ORDER HISTORY MODAL */}
      {viewingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-extrabold text-base text-white">
                  Historial de Pedidos: {viewingCustomer.nombre}
                </h3>
                <span className="text-xs text-slate-400">
                  {viewingCustomer.orders?.length || 0} pedidos registrados • Total consumido: ${Math.round(viewingCustomer.totalConsumido || 0).toLocaleString('es-CO')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingCustomer(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {viewingCustomer.orders?.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  Este comensal aún no tiene pedidos asociados.
                </div>
              ) : (
                viewingCustomer.orders.map((order: any) => (
                  <div key={order.id} className="p-3 bg-[#181b26] rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-white">Pedido #{order.codigo || order.orderNumber || String(order.id)}</span>
                      <span className="font-mono text-emerald-400 font-bold">${Number(order.total).toLocaleString('es-CO')}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>{new Date(order.createdAt).toLocaleString('es-CO')}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-700 text-slate-200 uppercase font-black text-[9px]">{order.estado || order.status || 'Completado'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setViewingCustomer(null)}
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
