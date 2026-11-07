'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Receipt,
  Search,
  Printer,
  Calendar,
  Filter,
  Users,
  DollarSign,
  CreditCard,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Layers,
  UtensilsCrossed,
  FileText,
  Clock,
  Sparkles,
  ChevronDown,
  Building2,
  AlertCircle
} from 'lucide-react';

interface FacturasTabProps {
  restaurant: any;
  selectedBranchId: string;
  formatPrice: (val: number) => string;
  onPrintInvoice: (invoice: any) => void;
}

export function FacturasTab({
  restaurant,
  selectedBranchId,
  formatPrice,
  onPrintInvoice,
}: FacturasTabProps) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [dateFilter, setDateFilter] = useState<'hoy' | 'ayer' | 'semana' | 'mes' | 'todos'>('hoy');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'divididas' | 'unicas'>('todos');
  const [paymentFilter, setPaymentFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal de vista rápida / comensales de comanda
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Calcular fechas según filtro
  const getDateRange = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (dateFilter === 'hoy') {
      const todayStr = toYMD(now);
      return { desde: todayStr, hasta: todayStr };
    }
    if (dateFilter === 'ayer') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const yesterdayStr = toYMD(yesterday);
      return { desde: yesterdayStr, hasta: yesterdayStr };
    }
    if (dateFilter === 'semana') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      return { desde: toYMD(weekStart), hasta: toYMD(now) };
    }
    if (dateFilter === 'mes') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { desde: toYMD(monthStart), hasta: toYMD(now) };
    }
    return { desde: '', hasta: '' };
  };

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (restaurant?.id) params.set('restaurantId', String(restaurant.id));
      if (selectedBranchId && selectedBranchId !== 'all') params.set('branchId', selectedBranchId);

      const { desde, hasta } = getDateRange();
      if (desde && hasta) {
        params.set('desde', desde);
        params.set('hasta', hasta);
      }

      if (typeFilter === 'divididas') params.set('esDividida', 'true');
      if (typeFilter === 'unicas') params.set('esDividida', 'false');
      if (paymentFilter !== 'todos') params.set('metodoPago', paymentFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/invoices?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
      }
    } catch (e) {
      console.error('Error al cargar facturas:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [restaurant?.id, selectedBranchId, dateFilter, typeFilter, paymentFilter]);

  // Manejo de búsqueda local para respuesta instantánea
  const filteredInvoices = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return invoices;
    return invoices.filter((inv) => {
      const numFac = (inv.numeroFactura || '').toLowerCase();
      const cli = (inv.cliente || '').toLowerCase();
      const mesa = (inv.numeroMesa || '').toLowerCase();
      const codOrd = (inv.order?.codigo || '').toLowerCase();
      const diner = (inv.dinerNombre || '').toLowerCase();
      return (
        numFac.includes(q) ||
        cli.includes(q) ||
        mesa.includes(q) ||
        codOrd.includes(q) ||
        diner.includes(q)
      );
    });
  }, [invoices, searchQuery]);

  // Métricas financieras calculadas
  const metrics = useMemo(() => {
    let total = 0;
    let propinas = 0;
    let efectivo = 0;
    let datafono = 0;
    let transfer = 0;
    let divididasCount = 0;
    let unicasCount = 0;

    filteredInvoices.forEach((inv) => {
      total += inv.total || 0;
      propinas += inv.propina || 0;
      if (inv.esDividida) divididasCount++;
      else unicasCount++;

      const m = (inv.metodoPago || '').toLowerCase();
      if (m.includes('dat') || m.includes('tarjeta')) {
        datafono += inv.total || 0;
      } else if (m.includes('nequi') || m.includes('davi') || m.includes('transf')) {
        transfer += inv.total || 0;
      } else {
        efectivo += inv.total || 0;
      }
    });

    return {
      total,
      propinas,
      efectivo,
      datafono,
      transfer,
      divididasCount,
      unicasCount,
      count: filteredInvoices.length,
    };
  }, [filteredInvoices]);

  // Parsear items JSON de una factura
  const getInvoiceItems = (itemsJson: any): any[] => {
    if (!itemsJson) return [];
    if (Array.isArray(itemsJson)) return itemsJson;
    try {
      return JSON.parse(itemsJson);
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-white font-sans">
      {/* ======================================================== */}
      {/* 1. HEADER DE CONTROL Y DESCRIPCIÓN                      */}
      {/* ======================================================== */}
      <div className="bg-[#121212] border border-[#222] rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-yellow/15 border border-brand-yellow/40 flex items-center justify-center text-brand-yellow shrink-0 shadow-glow">
            <Receipt className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black uppercase text-white font-display tracking-wide flex items-center gap-2">
              <span>Módulo de Facturación & Cuentas Divididas</span>
              <span className="text-[10px] bg-brand-yellow text-black font-black px-2 py-0.5 rounded-md">
                POS
              </span>
            </h2>
            <p className="text-xs text-gray-400">
              Visualiza las facturas emitidas por mesa. Si una comanda se dividió en N comensales, aquí se audita cada factura individualmente con su método de pago.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadInvoices}
          className="px-4 py-2.5 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] border border-[#333] text-gray-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-yellow' : ''}`} />
          <span>Actualizar Facturas</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 2. TARJETAS DE MÉTRICAS FINANCIERAS                     */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Facturado */}
        <div className="bg-[#121212] border border-[#222] rounded-3xl p-5 space-y-2 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px]">Total Facturado</span>
            <DollarSign className="w-4 h-4 text-brand-yellow" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
            {formatPrice(metrics.total)}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span>{metrics.count} facturas emitidas</span>
            {metrics.propinas > 0 && (
              <span className="text-brand-orange font-bold">
                (Prop: {formatPrice(metrics.propinas)})
              </span>
            )}
          </div>
        </div>

        {/* Efectivo Recaudado */}
        <div className="bg-[#121212] border border-[#222] rounded-3xl p-5 space-y-2 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px]">💵 Efectivo en Caja</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-display tracking-tight">
            {formatPrice(metrics.efectivo)}
          </div>
          <p className="text-[11px] text-gray-400">Recibido en billetes y monedas</p>
        </div>

        {/* Tarjetas / Datáfono */}
        <div className="bg-[#121212] border border-[#222] rounded-3xl p-5 space-y-2 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px]">💳 Datáfono / Tarjetas</span>
            <CreditCard className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400 font-display tracking-tight">
            {formatPrice(metrics.datafono)}
          </div>
          <p className="text-[11px] text-gray-400">Crédito, débito y pagos electrónicos</p>
        </div>

        {/* Nequi / Transferencias */}
        <div className="bg-[#121212] border border-[#222] rounded-3xl p-5 space-y-2 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px]">📱 Nequi / Daviplata</span>
            <Smartphone className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-400 font-display tracking-tight">
            {formatPrice(metrics.transfer)}
          </div>
          <p className="text-[11px] text-gray-400">
            {metrics.divididasCount > 0
              ? `${metrics.divididasCount} facturas divididas en mesa`
              : 'Transferencias confirmadas'}
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. BARRA DE FILTROS & BÚSQUEDA                          */}
      {/* ======================================================== */}
      <div className="bg-[#121212] border border-[#222] rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Filtros de Fecha */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#181818] p-1 rounded-2xl border border-[#2a2a2a] text-xs font-bold">
            <span className="px-2 text-gray-500 uppercase text-[10px] hidden sm:inline">Fecha:</span>
            {[
              { id: 'hoy', label: 'Hoy' },
              { id: 'ayer', label: 'Ayer' },
              { id: 'semana', label: 'Últimos 7 Días' },
              { id: 'mes', label: 'Este Mes' },
              { id: 'todos', label: 'Historial Completo' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setDateFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl transition ${
                  dateFilter === f.id
                    ? 'bg-brand-yellow text-black font-black shadow-glow'
                    : 'text-gray-400 hover:text-white hover:bg-[#222]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Filtro de Tipo (Divididas vs Únicas) */}
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value="todos">Todas las Facturas</option>
              <option value="divididas">🍽️ Solo Cuentas Divididas (Subcuentas)</option>
              <option value="unicas">📄 Solo Cuentas Completas</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos los Métodos</option>
              <option value="Efectivo">💵 Efectivo</option>
              <option value="Datáfono">💳 Datáfono / Tarjeta</option>
              <option value="Nequi">📱 Nequi / Transferencia</option>
            </select>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por Nº de Factura (ej: FAC-PG-1045-1), Comanda, Mesa o Nombre del Comensal..."
            className="w-full bg-[#181818] border border-[#2a2a2a] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow transition"
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. TABLA DE FACTURAS EMITIDAS                           */}
      {/* ======================================================== */}
      <div className="bg-[#121212] border border-[#222] rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-[#222] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Listado de Facturas Emitidas ({filteredInvoices.length})
            </span>
            {metrics.divididasCount > 0 && (
              <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-500/30">
                {metrics.divididasCount} provenientes de cuentas divididas
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-brand-yellow mx-auto" />
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
              Consultando facturas del sistema...
            </p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <FileText className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="text-base font-black text-white uppercase">No se encontraron facturas</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              No hay facturas registradas para los filtros seleccionados o no se han liquidado comandas en este rango.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#202020] bg-[#161616] text-[10px] font-black uppercase tracking-wider text-gray-400">
                  <th className="p-3.5">Nº Factura</th>
                  <th className="p-3.5">Comanda Origen</th>
                  <th className="p-3.5">Comensal / Cliente</th>
                  <th className="p-3.5">Consumo Facturado</th>
                  <th className="p-3.5">Método de Pago</th>
                  <th className="p-3.5 text-right">Subtotal / Propina</th>
                  <th className="p-3.5 text-right">Total Facturado</th>
                  <th className="p-3.5">Fecha & Hora</th>
                  <th className="p-3.5 text-center">Imprimir POS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {filteredInvoices.map((inv) => {
                  const items = getInvoiceItems(inv.itemsJson);
                  const isDinerSplit = inv.esDividida;

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-[#181818] transition-colors group text-gray-200"
                    >
                      {/* Nº Factura */}
                      <td className="p-3.5 font-mono align-top">
                        <div className="space-y-1">
                          <span className="font-black text-brand-yellow text-xs block">
                            {inv.numeroFactura}
                          </span>
                          {isDinerSplit ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              <Users className="w-3 h-3" />
                              <span>Dividida ({inv.dinerIndex}/{inv.totalDiners})</span>
                            </span>
                          ) : (
                            <span className="inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/10">
                              Cuenta Única
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Comanda Origen */}
                      <td className="p-3.5 align-top">
                        <div className="space-y-0.5">
                          <span className="font-bold text-white text-xs block">
                            #{inv.order?.codigo || `ORD-${inv.orderId}`}
                          </span>
                          <span className="text-[10px] text-gray-400 block font-semibold">
                            {inv.numeroMesa ? `🪑 ${inv.numeroMesa}` : `📦 ${inv.tipo}`}
                          </span>
                        </div>
                      </td>

                      {/* Comensal / Cliente */}
                      <td className="p-3.5 align-top">
                        <div className="space-y-0.5">
                          <strong className="text-white text-xs block">
                            {inv.dinerNombre || inv.cliente}
                          </strong>
                          {isDinerSplit && (
                            <span className="text-[10px] text-gray-400 block">
                              Mesa: {inv.numeroMesa || 'Principal'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Consumo Facturado */}
                      <td className="p-3.5 align-top max-w-xs">
                        <div className="space-y-1">
                          {items.length > 0 ? (
                            items.map((it: any, itIdx: number) => (
                              <div
                                key={itIdx}
                                className="text-[11px] flex items-start justify-between gap-2 bg-[#161616] px-2 py-1 rounded-md border border-[#242424]"
                              >
                                <span className="truncate">
                                  <strong className="text-brand-yellow font-black">
                                    {it.cantidad || 1}x
                                  </strong>{' '}
                                  <span className="text-gray-300 font-semibold">{it.nombre}</span>
                                </span>
                                <span className="text-[10px] font-mono text-gray-400 shrink-0">
                                  {formatPrice((it.precio || 0) * (it.cantidad || 1))}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-[11px] text-gray-500 italic">
                              Detalle proporcional consolidado
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Método de Pago */}
                      <td className="p-3.5 align-top">
                        <span
                          className={`inline-block text-[10px] font-black uppercase px-2.5 py-1 rounded-xl border ${
                            (inv.metodoPago || '').toLowerCase().includes('dat') ||
                            (inv.metodoPago || '').toLowerCase().includes('tarj')
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              : (inv.metodoPago || '').toLowerCase().includes('nequi') ||
                                (inv.metodoPago || '').toLowerCase().includes('davi')
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {inv.metodoPago || 'Efectivo'}
                        </span>
                      </td>

                      {/* Subtotal / Propina */}
                      <td className="p-3.5 align-top text-right text-gray-400 font-mono text-xs">
                        <div>Sub: {formatPrice(inv.subtotal)}</div>
                        {inv.propina > 0 && (
                          <div className="text-brand-orange text-[10px] font-bold">
                            +Prop: {formatPrice(inv.propina)}
                          </div>
                        )}
                      </td>

                      {/* Total Facturado */}
                      <td className="p-3.5 align-top text-right font-mono">
                        <span className="text-sm font-black text-white font-display block">
                          {formatPrice(inv.total)}
                        </span>
                        <span className="text-[9px] text-emerald-400 font-bold block uppercase">
                          ✓ Pagada
                        </span>
                      </td>

                      {/* Fecha */}
                      <td className="p-3.5 align-top text-[11px] text-gray-400 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span>
                            {new Date(inv.createdAt).toLocaleDateString('es-CO', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Acción: Imprimir Ticket POS */}
                      <td className="p-3.5 align-top text-center">
                        <button
                          type="button"
                          onClick={() => onPrintInvoice(inv)}
                          className="p-2 rounded-xl bg-brand-yellow/15 hover:bg-brand-yellow text-brand-yellow hover:text-black border border-brand-yellow/30 font-black text-xs transition cursor-pointer shadow"
                          title="Imprimir Factura POS para este comensal"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
