'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Boxes, 
  AlertTriangle, 
  Calendar, 
  Percent, 
  ArrowUpRight, 
  RefreshCw, 
  Package, 
  Clock, 
  XCircle, 
  Flame, 
  Sparkles,
  BarChart3,
  Scale,
  PieChart,
  Wallet,
  CreditCard,
  ShoppingBag,
  UtensilsCrossed,
  Bike,
  Store,
  ArrowDownRight,
  ChevronRight,
  Filter,
  Eye,
  Layers,
  Award
} from 'lucide-react';

interface DashboardEjecutivoTabProps {
  restaurantId: string;
  restaurantName: string;
  onNavigateTab?: (tab: string) => void;
}

export const DashboardEjecutivoTab: React.FC<DashboardEjecutivoTabProps> = ({
  restaurantId,
  restaurantName,
  onNavigateTab,
}) => {
  const [period, setPeriod] = useState<'today' | '7days' | '14days' | 'month' | 'year' | 'all'>('month');
  const [dailyViewDays, setDailyViewDays] = useState<7 | 14 | 30>(14);
  const [topProductsMetric, setTopProductsMetric] = useState<'qty' | 'revenue'>('revenue');
  const [hoveredDailyIndex, setHoveredDailyIndex] = useState<number | null>(null);
  const [hoveredMonthlyIndex, setHoveredMonthlyIndex] = useState<number | null>(null);

  const [orders, setOrders] = useState<any[]>([]);
  const [supplies, setSupplies] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [kardex, setKardex] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, suppliesRes, recipesRes, kardexRes, shiftsRes] = await Promise.all([
        fetch(`/api/orders?restaurantId=${restaurantId}`),
        fetch(`/api/supplies?restaurantId=${restaurantId}`),
        fetch(`/api/recipes?restaurantId=${restaurantId}`),
        fetch(`/api/supplies/kardex?restaurantId=${restaurantId}`),
        fetch(`/api/shifts?restaurantId=${restaurantId}`),
      ]);

      if (ordersRes.ok) {
        const oData = await ordersRes.json();
        setOrders(Array.isArray(oData) ? oData : (oData.orders || []));
      }
      if (suppliesRes.ok) {
        const sData = await suppliesRes.json();
        setSupplies(Array.isArray(sData) ? sData : (sData.supplies || []));
      }
      if (recipesRes.ok) {
        const rData = await recipesRes.json();
        setRecipes(Array.isArray(rData) ? rData : (rData.recipes || []));
      }
      if (kardexRes.ok) {
        const kData = await kardexRes.json();
        setKardex(Array.isArray(kData) ? kData : (kData.movements || []));
      }
      if (shiftsRes.ok) {
        const shData = await shiftsRes.json();
        setShifts(Array.isArray(shData) ? shData : []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchData();
    }
  }, [restaurantId]);

  // Valid non-cancelled orders
  const validOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    return orders.filter(
      (o) => o.status !== 'CANCELLED' && o.status !== 'CANCELADO' && o.estado !== 'Cancelado'
    );
  }, [orders]);

  // Filter orders by selected period
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return validOrders.filter((o) => {
      const orderDate = new Date(o.createdAt);
      if (period === 'today') {
        return orderDate.toDateString() === now.toDateString();
      }
      if (period === '7days') {
        const diff = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
        return diff <= 7;
      }
      if (period === '14days') {
        const diff = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
        return diff <= 14;
      }
      if (period === 'month') {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      if (period === 'year') {
        return orderDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [validOrders, period]);

  // Financial KPIs
  const kpis = useMemo(() => {
    const ordersList = filteredOrders;
    const suppliesList = Array.isArray(supplies) ? supplies : [];
    const recipesList = Array.isArray(recipes) ? recipes : [];
    const kardexList = Array.isArray(kardex) ? kardex : [];

    // 1. Total Sales
    const totalSales = ordersList.reduce((acc, o) => acc + Number(o.total || 0), 0);

    // 2. Cost of Goods Sold (CMV) calculated from recipe cost of each sold product
    const recipeMap = new Map(recipesList.map((r) => [r.productId, r]));
    let totalSupplyCost = 0;

    ordersList.forEach((order) => {
      (order.items || []).forEach((item: any) => {
        const recipe = recipeMap.get(item.productId);
        const portionCost = Number(recipe?.costoTotal || recipe?.costoPorPorcion || 0);
        totalSupplyCost += portionCost * (Number(item.cantidad || item.quantity) || 1);
      });
    });

    // 3. Gross Profit & Margin
    const grossProfit = totalSales - totalSupplyCost;
    const grossMarginPercent = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

    // 4. Inventory Valuation
    const totalValuation = suppliesList.reduce(
      (acc, s) => acc + Number(s.stockActual || 0) * Number(s.costoUnitario || s.costoPromedio || 0),
      0
    );

    // 5. Total Waste/Merma Cost in period
    const wasteMovements = kardexList.filter((m) =>
      ['MERMA', 'DESPERDICIO', 'CONSUMO_INTERNO', 'SALIDA_MERMA', 'SALIDA_DESPERDICIO'].includes(m.tipoMovimiento || m.tipo)
    );
    const totalWasteCost = wasteMovements.reduce((acc, m) => acc + Number(m.costoTotal || 0), 0);

    // 6. Ticket Promedio
    const ticketPromedio = ordersList.length > 0 ? totalSales / ordersList.length : 0;

    // 7. Critical Alerts Counts
    const lowStockCount = suppliesList.filter((s) => s.isLowStock && !s.isNegative).length;
    const negativeStockCount = suppliesList.filter((s) => s.isNegative).length;
    const expiringSoonCount = suppliesList.filter((s) => s.isExpiringSoon).length;
    const expiredCount = suppliesList.filter((s) => s.isExpired).length;

    return {
      totalSales,
      totalSupplyCost,
      grossProfit,
      grossMarginPercent: Math.round(grossMarginPercent * 10) / 10,
      totalValuation: Math.max(0, totalValuation),
      totalWasteCost,
      ticketPromedio,
      lowStockCount,
      negativeStockCount,
      expiringSoonCount,
      expiredCount,
    };
  }, [filteredOrders, supplies, recipes, kardex]);

  // ==========================================
  // 1. DATA PARA GRÁFICA DE VENTAS DIARIAS
  // ==========================================
  const dailyData = useMemo(() => {
    const daysCount = dailyViewDays;
    const result: { dateKey: string; label: string; fullDate: string; total: number; count: number }[] = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
      const fullDate = d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      result.push({ dateKey, label, fullDate, total: 0, count: 0 });
    }

    const dayMap = new Map(result.map((r) => [r.dateKey, r]));

    validOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = d.toISOString().slice(0, 10);
      const entry = dayMap.get(key);
      if (entry) {
        entry.total += Number(o.total || 0);
        entry.count += 1;
      }
    });

    const maxVal = Math.max(...result.map((r) => r.total), 100000);
    const totalPeriodSales = result.reduce((acc, r) => acc + r.total, 0);
    const avgDailySales = result.length > 0 ? totalPeriodSales / result.length : 0;
    const peakDay = [...result].sort((a, b) => b.total - a.total)[0];

    return { points: result, maxVal, totalPeriodSales, avgDailySales, peakDay };
  }, [validOrders, dailyViewDays]);

  // ==========================================
  // 2. DATA PARA GRÁFICA DE VENTAS MES A MES
  // ==========================================
  const monthlyData = useMemo(() => {
    const monthsList: { key: string; label: string; year: number; monthIndex: number; total: number; count: number; previousTotal: number }[] = [];
    const now = new Date();

    // Últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('es-CO', { month: 'short' }).toUpperCase();
      monthsList.push({
        key,
        label,
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        total: 0,
        count: 0,
        previousTotal: 0,
      });
    }

    const monthMap = new Map(monthsList.map((m) => [m.key, m]));

    validOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const entry = monthMap.get(key);
      if (entry) {
        entry.total += Number(o.total || 0);
        entry.count += 1;
      }
    });

    // Calcular crecimiento porcentual respecto al mes anterior
    const pointsWithGrowth = monthsList.map((m, idx) => {
      const prev = idx > 0 ? monthsList[idx - 1].total : 0;
      let growth = 0;
      if (prev > 0) {
        growth = Math.round(((m.total - prev) / prev) * 100);
      }
      return { ...m, growth };
    });

    const maxVal = Math.max(...pointsWithGrowth.map((m) => m.total), 200000);
    const totalYearSales = pointsWithGrowth.reduce((acc, m) => acc + m.total, 0);

    return { points: pointsWithGrowth, maxVal, totalYearSales };
  }, [validOrders]);

  // ==========================================
  // 3. DATA POR MÉTODOS DE PAGO (CAJA & DIGITAL)
  // ==========================================
  const paymentMethodsData = useMemo(() => {
    const map = new Map<string, { method: string; total: number; count: number }>();
    const colors: Record<string, string> = {
      Efectivo: '#10b981', // Emerald
      Nequi: '#a855f7',    // Purple
      Daviplata: '#ef4444', // Red
      Tarjeta: '#3b82f6',  // Blue
      Transferencia: '#f59e0b', // Amber
      Datáfono: '#06b6d4', // Cyan
      Otro: '#64748b',
    };

    filteredOrders.forEach((o) => {
      const rawMethod = (o.metodoPago || 'Efectivo').trim();
      let method = 'Efectivo';
      if (/nequi/i.test(rawMethod)) method = 'Nequi';
      else if (/daviplata/i.test(rawMethod)) method = 'Daviplata';
      else if (/tarjeta|datafono|pos/i.test(rawMethod)) method = 'Tarjeta';
      else if (/transferencia|banc/i.test(rawMethod)) method = 'Transferencia';
      else if (/efectivo/i.test(rawMethod)) method = 'Efectivo';
      else method = rawMethod || 'Otro';

      const curr = map.get(method) || { method, total: 0, count: 0 };
      curr.total += Number(o.total || 0);
      curr.count += 1;
      map.set(method, curr);
    });

    const list = Array.from(map.values()).sort((a, b) => b.total - a.total);
    const grandTotal = list.reduce((acc, item) => acc + item.total, 0) || 1;

    return list.map((item) => ({
      ...item,
      percent: Math.round((item.total / grandTotal) * 100),
      color: colors[item.method] || '#f59e0b',
    }));
  }, [filteredOrders]);

  // ==========================================
  // 4. DATA POR CANALES (MESA / DOMI / RECOGER)
  // ==========================================
  const channelsData = useMemo(() => {
    const map: Record<string, { label: string; icon: any; total: number; count: number; color: string }> = {
      mesa: { label: 'En Mesa (Salón)', icon: UtensilsCrossed, total: 0, count: 0, color: '#a855f7' },
      domicilio: { label: 'Domicilios', icon: Bike, total: 0, count: 0, color: '#3b82f6' },
      recoger: { label: 'Para Llevar / Recoger', icon: Store, total: 0, count: 0, color: '#10b981' },
    };

    filteredOrders.forEach((o) => {
      const type = (o.tipo || 'mesa').toLowerCase();
      const target = map[type] || map['mesa'];
      target.total += Number(o.total || 0);
      target.count += 1;
    });

    const grandTotal = (map.mesa.total + map.domicilio.total + map.recoger.total) || 1;

    return [
      { key: 'mesa', ...map.mesa, percent: Math.round((map.mesa.total / grandTotal) * 100) },
      { key: 'domicilio', ...map.domicilio, percent: Math.round((map.domicilio.total / grandTotal) * 100) },
      { key: 'recoger', ...map.recoger, percent: Math.round((map.recoger.total / grandTotal) * 100) },
    ];
  }, [filteredOrders]);

  // ==========================================
  // 5. DATA POR HORAS PICO (DISTRIBUCIÓN HORARIA)
  // ==========================================
  const hourlyData = useMemo(() => {
    // Rango típico gastronómico: 11:00 AM a 23:00 PM
    const hours = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    const map = new Map(hours.map((h) => [h, { hour: h, label: `${h > 12 ? h - 12 : h}${h >= 12 ? 'pm' : 'am'}`, total: 0, count: 0 }]));

    filteredOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      const h = d.getHours();
      const entry = map.get(h);
      if (entry) {
        entry.total += Number(o.total || 0);
        entry.count += 1;
      }
    });

    const list = hours.map((h) => map.get(h)!);
    const maxVal = Math.max(...list.map((item) => item.total), 50000);

    return { points: list, maxVal };
  }, [filteredOrders]);

  // ==========================================
  // 6. TOP PRODUCTOS MÁS VENDIDOS Y FACTURADOS
  // ==========================================
  const topProductsData = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();

    filteredOrders.forEach((o) => {
      (o.items || []).forEach((item: any) => {
        const name = item.nombre || item.name || 'Plato';
        const qty = Number(item.cantidad || item.quantity || 1);
        const price = Number(item.precio || item.unitPrice || 0);
        const curr = map.get(name) || { name, qty: 0, revenue: 0 };
        curr.qty += qty;
        curr.revenue += qty * price;
        map.set(name, curr);
      });
    });

    const list = Array.from(map.values());
    if (topProductsMetric === 'qty') {
      list.sort((a, b) => b.qty - a.qty);
    } else {
      list.sort((a, b) => b.revenue - a.revenue);
    }

    const topList = list.slice(0, 8);
    const maxMetric = Math.max(...topList.map((p) => (topProductsMetric === 'qty' ? p.qty : p.revenue)), 1);

    return { items: topList, maxMetric };
  }, [filteredOrders, topProductsMetric]);

  return (
    <div className="space-y-6 text-white pb-12">
      
      {/* ======================================================== */}
      {/* CABECERA Y FILTRO DE PERÍODO GENERAL                     */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#11141e] border border-slate-800/90 rounded-2xl p-5 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-yellow/15 text-brand-yellow">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white font-display tracking-tight">
              Dashboard Ejecutivo & Inteligencia de Negocio
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Métricas integrales de {restaurantName}: ventas en vivo, recaudos por día, mes a mes, productos estrella y flujo de caja.
          </p>
        </div>

        {/* Selector de Período con botones estilizados */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0b0e14] p-1.5 rounded-xl border border-slate-800 shadow-inner">
          {[
            { id: 'today', label: 'Hoy' },
            { id: '7days', label: '7 Días' },
            { id: '14days', label: '14 Días' },
            { id: 'month', label: 'Este Mes' },
            { id: 'year', label: 'Este Año' },
            { id: 'all', label: 'Todo' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                period === p.id
                  ? 'bg-gradient-to-r from-brand-yellow to-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={fetchData}
            className="p-1.5 text-slate-400 hover:text-brand-yellow transition"
            title="Refrescar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-yellow' : ''}`} />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ALERTAS CRÍTICAS DE STOCK / MERMAS                       */}
      {/* ======================================================== */}
      {(kpis.negativeStockCount > 0 || kpis.lowStockCount > 0 || kpis.expiringSoonCount > 0 || kpis.expiredCount > 0) && (
        <div className="bg-gradient-to-r from-red-500/10 via-amber-500/10 to-[#12141c] border border-amber-500/30 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white">Alertas Operativas Críticas de Almacén</div>
              <div className="text-xs text-slate-400 flex flex-wrap gap-2 mt-0.5">
                {kpis.negativeStockCount > 0 && (
                  <span className="text-red-400 font-bold">• {kpis.negativeStockCount} insumo(s) en saldo negativo</span>
                )}
                {kpis.lowStockCount > 0 && (
                  <span className="text-amber-400 font-bold">• {kpis.lowStockCount} insumo(s) bajo stock mínimo</span>
                )}
                {kpis.expiringSoonCount > 0 && (
                  <span className="text-orange-400 font-bold">• {kpis.expiringSoonCount} lote(s) próximos a vencer</span>
                )}
                {kpis.expiredCount > 0 && (
                  <span className="text-rose-400 font-bold">• {kpis.expiredCount} lote(s) ya vencidos</span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('inventario')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 flex-shrink-0 cursor-pointer"
          >
            Gestionar en Inventario →
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* TARJETAS KPI DE IMPACTO FINANCIERO                       */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Ventas Totales */}
        <div className="bg-[#11141e] border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-amber-400/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Ventas Totales</span>
            <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono tracking-tight">
              ${Math.round(kpis.totalSales).toLocaleString('es-CO')}
            </div>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
              <span>{filteredOrders.length} pedidos facturados</span>
            </span>
          </div>
        </div>

        {/* Costo Insumos BOM */}
        <div className="bg-[#11141e] border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-orange-400/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Costo Insumos (BOM)</span>
            <div className="p-2 bg-orange-500/15 text-orange-400 rounded-xl border border-orange-500/30">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-orange-400 font-mono tracking-tight">
              ${Math.round(kpis.totalSupplyCost).toLocaleString('es-CO')}
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Costo de recetas consumidas
            </span>
          </div>
        </div>

        {/* Utilidad Bruta & Margen */}
        <div className="bg-[#11141e] border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-emerald-400/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Utilidad Bruta</span>
            <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/30">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
              ${Math.round(kpis.grossProfit).toLocaleString('es-CO')}
            </div>
            <div className="text-xs text-slate-300 font-medium mt-0.5">
              Margen: <strong className="text-emerald-400 font-black">{kpis.grossMarginPercent}%</strong>
            </div>
          </div>
        </div>

        {/* Ticket Promedio */}
        <div className="bg-[#11141e] border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-blue-400/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Ticket Promedio</span>
            <div className="p-2 bg-blue-500/15 text-blue-400 rounded-xl border border-blue-500/30">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-blue-400 font-mono tracking-tight">
              ${Math.round(kpis.ticketPromedio).toLocaleString('es-CO')}
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Promedio por mesa/pedido
            </span>
          </div>
        </div>

        {/* Stock Valorizado en Almacén */}
        <div className="bg-[#11141e] border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-purple-400/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Stock Valorizado</span>
            <div className="p-2 bg-purple-500/15 text-purple-400 rounded-xl border border-purple-500/30">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-purple-300 font-mono tracking-tight">
              ${Math.round(kpis.totalValuation).toLocaleString('es-CO')}
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Materia prima disponible
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* GRÁFICA 1: VENTAS DIARIAS (DINERO QUE ENTRA DÍA A DÍA)   */}
      {/* ======================================================== */}
      <div className="bg-[#11141e] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/15 text-brand-yellow">
                <TrendingUp className="w-5 h-5" />
              </span>
              <h3 className="text-base sm:text-lg font-black text-white font-display">
                Ventas Diarias — Dinero que entra día a día
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Facturación día a día en el negocio. Pasa el cursor sobre cualquier barra para ver el valor exacto.
            </p>
          </div>

          {/* Rango de días: 7, 14 o 30 días */}
          <div className="flex items-center gap-1.5 bg-[#0b0e14] p-1 rounded-xl border border-slate-800">
            {([7, 14, 30] as const).map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setDailyViewDays(days)}
                className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                  dailyViewDays === days
                    ? 'bg-brand-yellow text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {days} Días
              </button>
            ))}
          </div>
        </div>

        {/* Resumen Superior de la Gráfica Diaria */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0d1017] p-3.5 rounded-2xl border border-slate-800/80">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Total Recaudado en el Rango</span>
            <span className="text-lg font-black text-brand-yellow font-mono">
              ${Math.round(dailyData.totalPeriodSales).toLocaleString('es-CO')}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Promedio Diario</span>
            <span className="text-lg font-black text-emerald-400 font-mono">
              ${Math.round(dailyData.avgDailySales).toLocaleString('es-CO')} / día
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Día Récord de Ventas</span>
            <span className="text-lg font-black text-white font-mono">
              ${Math.round(dailyData.peakDay?.total || 0).toLocaleString('es-CO')}
              <span className="text-xs text-slate-400 ml-1 font-normal font-sans">
                ({dailyData.peakDay?.label || 'N/A'})
              </span>
            </span>
          </div>
        </div>

        {/* Gráfico SVG Interactivo de Barras Diarias */}
        <div className="relative pt-4">
          <div className="h-64 sm:h-72 w-full flex items-end gap-1.5 sm:gap-3 px-2 sm:px-4 pb-8 pt-4 bg-[#0a0d14] rounded-2xl border border-slate-800/70 relative">
            {dailyData.points.map((point, idx) => {
              const heightPct = Math.max(6, Math.round((point.total / dailyData.maxVal) * 100));
              const isHovered = hoveredDailyIndex === idx;

              return (
                <div
                  key={point.dateKey}
                  onMouseEnter={() => setHoveredDailyIndex(idx)}
                  onMouseLeave={() => setHoveredDailyIndex(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                >
                  {/* Tooltip flotante al pasar el mouse */}
                  {isHovered && (
                    <div className="absolute bottom-[calc(100%+8px)] z-30 bg-[#161a26] border border-amber-400/80 p-2.5 rounded-xl shadow-2xl text-center whitespace-nowrap animate-in fade-in zoom-in-95 pointer-events-none">
                      <div className="text-[11px] font-black text-slate-300 capitalize">{point.fullDate}</div>
                      <div className="text-sm font-black text-brand-yellow font-mono mt-0.5">
                        ${Math.round(point.total).toLocaleString('es-CO')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                        {point.count} pedido{point.count === 1 ? '' : 's'}
                      </div>
                    </div>
                  )}

                  {/* Barra del Gráfico */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 relative ${
                      point.total > 0
                        ? isHovered
                          ? 'bg-gradient-to-t from-amber-500 to-yellow-300 shadow-lg shadow-amber-400/40 scale-x-105'
                          : 'bg-gradient-to-t from-amber-600 via-brand-yellow to-yellow-400 hover:brightness-110'
                        : 'bg-slate-800/40'
                    }`}
                  >
                    {/* Indicador de brillo en tope de barra */}
                    {point.total > 0 && (
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/70 shadow-glow" />
                    )}
                  </div>

                  {/* Etiqueta de Fecha en el eje X */}
                  <span className="absolute bottom-1 text-[9px] sm:text-[10px] font-bold text-slate-400 capitalize truncate w-full text-center">
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* GRÁFICA 2: VENTAS MENSUALES (DINERO QUE ENTRA MES A MES) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico Curvo de Evolución Mes a Mes (2 Columnas) */}
        <div className="lg:col-span-2 bg-[#11141e] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                  <Calendar className="w-5 h-5" />
                </span>
                <h3 className="text-base sm:text-lg font-black text-white font-display">
                  Ventas Mensuales — Dinero que entra Mes a Mes
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Comportamiento histórico de facturación en los últimos 6 meses.
              </p>
            </div>
            <span className="text-xs text-brand-yellow font-black font-mono">
              Total 6M: ${Math.round(monthlyData.totalYearSales).toLocaleString('es-CO')}
            </span>
          </div>

          {/* Gráfico de Barras y Tendencia Mensual */}
          <div className="h-60 sm:h-64 w-full flex items-end gap-3 sm:gap-6 px-3 sm:px-6 pb-8 pt-4 bg-[#0a0d14] rounded-2xl border border-slate-800/70 relative">
            {monthlyData.points.map((m, idx) => {
              const heightPct = Math.max(10, Math.round((m.total / monthlyData.maxVal) * 100));
              const isHovered = hoveredMonthlyIndex === idx;

              return (
                <div
                  key={m.key}
                  onMouseEnter={() => setHoveredMonthlyIndex(idx)}
                  onMouseLeave={() => setHoveredMonthlyIndex(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                >
                  {/* Tooltip mensual */}
                  {isHovered && (
                    <div className="absolute bottom-[calc(100%+8px)] z-30 bg-[#161a26] border border-emerald-400/80 p-2.5 rounded-xl shadow-2xl text-center whitespace-nowrap pointer-events-none">
                      <div className="text-[11px] font-black text-slate-300">{m.label} {m.year}</div>
                      <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">
                        ${Math.round(m.total).toLocaleString('es-CO')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                        {m.count} pedidos
                      </div>
                      {m.growth !== 0 && (
                        <div className={`text-[10px] font-black mt-1 ${m.growth > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {m.growth > 0 ? `+${m.growth}%` : `${m.growth}%`} vs mes anterior
                        </div>
                      )}
                    </div>
                  )}

                  {/* Valor en pesos encima de la barra si es representativo */}
                  {m.total > 0 && (
                    <span className="text-[10px] font-mono font-black text-emerald-300 mb-1 hidden sm:block">
                      ${Math.round(m.total / 1000)}k
                    </span>
                  )}

                  {/* Barra mensual estilizada con gradiente */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[54px] rounded-t-2xl transition-all duration-300 relative ${
                      m.total > 0
                        ? isHovered
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-300 shadow-lg shadow-emerald-400/30 scale-x-105'
                          : 'bg-gradient-to-t from-emerald-700 via-emerald-500 to-teal-400 hover:brightness-110'
                        : 'bg-slate-800/40'
                    }`}
                  >
                    {/* Badge de crecimiento en la barra */}
                    {m.growth !== 0 && m.total > 0 && (
                      <span className={`absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                        m.growth > 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                      }`}>
                        {m.growth > 0 ? `+${m.growth}%` : `${m.growth}%`}
                      </span>
                    )}
                  </div>

                  {/* Etiqueta del Mes en el eje X */}
                  <span className="absolute bottom-1 text-xs font-black text-slate-300 tracking-wider">
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfico 3: Flujo de Dinero por Método de Pago & Caja (1 Columna) */}
        <div className="bg-[#11141e] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <span className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400">
                <Wallet className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-white font-display">
                  Caja & Métodos de Pago
                </h3>
                <span className="text-[11px] text-slate-400 block">¿Por dónde entra el dinero?</span>
              </div>
            </div>

            {/* Lista Desglosada por Método */}
            <div className="mt-4 space-y-2.5">
              {paymentMethodsData.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No hay pagos registrados en este período.
                </div>
              ) : (
                paymentMethodsData.map((item) => (
                  <div
                    key={item.method}
                    className="p-3 bg-[#0d1017] rounded-xl border border-slate-800/80 space-y-1.5 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-bold text-white">{item.method}</span>
                      </div>
                      <span className="font-mono font-black text-brand-yellow">
                        ${Math.round(item.total).toLocaleString('es-CO')}
                      </span>
                    </div>

                    {/* Barra de Porcentaje */}
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                        className="h-full rounded-full transition-all duration-500"
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>{item.count} transacciones</span>
                      <span className="font-bold text-slate-300">{item.percent}% del total</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('caja')}
            className="w-full py-2.5 bg-slate-800/70 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700/60 cursor-pointer"
          >
            <span>Ver Arqueos y Turnos de Caja →</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* GRÁFICAS ADICIONALES: PRODUCTOS, CANALES Y HORAS PICO    */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Gráfica 4: Top Platos & Productos Más Vendidos */}
        <div className="bg-[#11141e] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-500/15 text-orange-400">
                <Flame className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-white font-display">
                  Top Productos
                </h3>
                <span className="text-[11px] text-slate-400 block">Ranking de platos más solicitados</span>
              </div>
            </div>

            {/* Toggle Unidades vs Dinero */}
            <div className="flex items-center bg-[#0b0e14] p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setTopProductsMetric('revenue')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition cursor-pointer ${
                  topProductsMetric === 'revenue'
                    ? 'bg-orange-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Por $
              </button>
              <button
                type="button"
                onClick={() => setTopProductsMetric('qty')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition cursor-pointer ${
                  topProductsMetric === 'qty'
                    ? 'bg-orange-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Por Unidades
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {topProductsData.items.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No hay productos vendidos en este período.
              </div>
            ) : (
              topProductsData.items.map((prod, idx) => {
                const metricValue = topProductsMetric === 'qty' ? prod.qty : prod.revenue;
                const percent = Math.max(8, Math.round((metricValue / topProductsData.maxMetric) * 100));

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-black text-[10px] shrink-0 ${
                          idx === 0 ? 'bg-amber-400 text-slate-950 font-black' : idx === 1 ? 'bg-slate-300 text-slate-950' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-white truncate max-w-[170px]">{prod.name}</span>
                      </div>
                      <span className="font-mono font-black text-amber-300 shrink-0">
                        {topProductsMetric === 'qty' ? `${prod.qty} und` : `$${Math.round(prod.revenue).toLocaleString('es-CO')}`}
                      </span>
                    </div>

                    {/* Barra horizontal */}
                    <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Gráfica 5: Canales de Venta (Salón vs Domicilio vs Llevar) */}
        <div className="bg-[#11141e] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400">
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-white font-display">
                  Canales de Venta
                </h3>
                <span className="text-[11px] text-slate-400 block">Distribución de ingresos por canal</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {channelsData.map((ch) => {
              const Icon = ch.icon;
              return (
                <div
                  key={ch.key}
                  className="p-3.5 bg-[#0d1017] rounded-2xl border border-slate-800/80 space-y-2 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="p-2 rounded-xl text-white"
                        style={{ backgroundColor: `${ch.color}25`, color: ch.color }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-white">{ch.label}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{ch.count} órdenes</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black font-mono text-white block">
                        ${Math.round(ch.total).toLocaleString('es-CO')}
                      </span>
                      <span className="text-[11px] font-black" style={{ color: ch.color }}>
                        {ch.percent}% del negocio
                      </span>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${ch.percent}%`, backgroundColor: ch.color }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfica 6: Horas Pico de Venta (¿A qué hora entra el dinero?) */}
        <div className="bg-[#11141e] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400">
                <Clock className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-white font-display">
                  Horas Pico de Venta
                </h3>
                <span className="text-[11px] text-slate-400 block">Flujo de dinero a lo largo del día</span>
              </div>
            </div>
          </div>

          <div className="h-56 w-full flex items-end gap-1.5 px-2 pb-6 pt-2 bg-[#0a0d14] rounded-2xl border border-slate-800/70 relative">
            {hourlyData.points.map((pt) => {
              const heightPct = Math.max(8, Math.round((pt.total / hourlyData.maxVal) * 100));

              return (
                <div
                  key={pt.hour}
                  className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                  title={`${pt.label}: $${Math.round(pt.total).toLocaleString('es-CO')} (${pt.count} pedidos)`}
                >
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                      pt.total > 0
                        ? 'bg-gradient-to-t from-cyan-600 to-teal-400 group-hover:brightness-125'
                        : 'bg-slate-800/40'
                    }`}
                  />
                  <span className="absolute bottom-1 text-[8px] sm:text-[9px] font-mono text-slate-400">
                    {pt.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 text-center leading-relaxed">
            Concentración de pedidos durante los turnos de almuerzo (12pm-2pm) y cena (7pm-10pm).
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* SECCIÓN ADICIONAL: INGENIERÍA DE MENÚ & RENTABILIDAD     */}
      {/* ======================================================== */}
      <div className="bg-[#11141e] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white font-display">
                Ingeniería de Menú — Recetas Técnicas Más Rentables
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Platos con mayor margen de ganancia neta calculado a partir de materias primas (BOM).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('recetas')}
            className="text-xs text-brand-yellow font-bold hover:underline cursor-pointer"
          >
            Ver todas las recetas →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recipes.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-500 text-xs">
              Aún no has configurado recetas técnicas en el sistema.
            </div>
          ) : (
            [...recipes]
              .sort((a, b) => Number(b.marginPercent || 0) - Number(a.marginPercent || 0))
              .slice(0, 4)
              .map((r, idx) => (
                <div
                  key={r.id}
                  className="p-4 bg-[#0d1017] rounded-2xl border border-slate-800/80 space-y-2 hover:border-emerald-500/40 transition shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60">
                      Margen {r.marginPercent}%
                    </span>
                    <span className="text-xs font-mono font-black text-white">
                      +${Math.round(r.grossProfit || 0).toLocaleString('es-CO')}
                    </span>
                  </div>

                  <div className="font-extrabold text-sm text-white truncate">
                    {r.product?.name || r.nombre}
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono space-y-0.5 pt-1 border-t border-slate-800/80">
                    <div className="flex justify-between">
                      <span>Costo Materia Prima:</span>
                      <strong className="text-orange-400">${Math.round(r.costoPorPorcion)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Precio al Público:</span>
                      <strong className="text-white">${Number(r.salePrice || 0).toLocaleString('es-CO')}</strong>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

    </div>
  );
};
