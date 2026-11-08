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
  Award,
  Activity,
  ArrowRightLeft
} from 'lucide-react';

interface DashboardEjecutivoTabProps {
  restaurantId: string;
  restaurantName: string;
  onNavigateTab?: (tab: string) => void;
}

// Generador de curva Bézier cúbica suave para SVG
function getCurvedPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export const DashboardEjecutivoTab: React.FC<DashboardEjecutivoTabProps> = ({
  restaurantId,
  restaurantName,
  onNavigateTab,
}) => {
  const [period, setPeriod] = useState<'today' | '7days' | '14days' | 'month' | 'year' | 'all'>('month');
  const [dailyViewDays, setDailyViewDays] = useState<7 | 14 | 30>(14);
  const [topProductsMetric, setTopProductsMetric] = useState<'qty' | 'revenue'>('revenue');
  const [trendMode, setTrendMode] = useState<'daily' | 'monthly'>('daily');
  
  const [hoveredDailyIndex, setHoveredDailyIndex] = useState<number | null>(null);
  const [hoveredMonthlyIndex, setHoveredMonthlyIndex] = useState<number | null>(null);
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);

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
  // PROMEDIO DE PEDIDOS REALIZADOS (Día, Sem, Mes)
  // ==========================================
  const orderAverages = useMemo(() => {
    const ordersList = validOrders;
    if (ordersList.length === 0) {
      return { daily: 0, weekly: 0, monthly: 0, ticketAvg: 0, totalOrders: 0 };
    }

    // Calcular días únicos con actividad o lapso de tiempo
    const dates = ordersList.map((o) => new Date(o.createdAt).getTime());
    const minTime = Math.min(...dates);
    const maxTime = Math.max(...dates, Date.now());
    const daysSpan = Math.max(1, Math.round((maxTime - minTime) / (1000 * 3600 * 24)) + 1);

    const totalOrders = ordersList.length;
    const totalSales = ordersList.reduce((acc, o) => acc + Number(o.total || 0), 0);

    const daily = Math.round((totalOrders / daysSpan) * 10) / 10;
    const weekly = Math.round(daily * 7);
    const monthly = Math.round(daily * 30);
    const ticketAvg = Math.round(totalSales / totalOrders);

    return { daily, weekly, monthly, ticketAvg, totalOrders };
  }, [validOrders]);

  // ==========================================
  // 1. DATA PARA GRÁFICA DE VENTAS DIARIAS (COMPACTA)
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
  // 2. DATA PARA GRÁFICA DE VENTAS MENSUALES (COMPACTA)
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
  // 3. DATA GRÁFICO DE TENDENCIA CURVA: INGRESOS VS GASTOS (CON SOMBREADO)
  // ==========================================
  const trendData = useMemo(() => {
    // Mapa de costos por receta
    const recipeMap = new Map(recipes.map((r) => [r.productId, r]));

    // Egresos registrados de turnos de caja
    const shiftExpensesList: { dateKey: string; monthKey: string; amount: number }[] = [];
    shifts.forEach((sh) => {
      (sh.egresos || []).forEach((eg: any) => {
        const d = new Date(eg.createdAt || sh.createdAt);
        const dateKey = d.toISOString().slice(0, 10);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        shiftExpensesList.push({ dateKey, monthKey, amount: Number(eg.monto || 0) });
      });
    });

    if (trendMode === 'daily') {
      // 14 días diarios
      const daysCount = 14;
      const points: { key: string; label: string; fullDate: string; ingresos: number; gastos: number; margen: number }[] = [];
      const now = new Date();

      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
        const fullDate = d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' });
        points.push({ key, label, fullDate, ingresos: 0, gastos: 0, margen: 0 });
      }

      const map = new Map(points.map((p) => [p.key, p]));

      // Acumular ingresos y costo de recetas
      validOrders.forEach((o) => {
        const d = new Date(o.createdAt);
        const key = d.toISOString().slice(0, 10);
        const entry = map.get(key);
        if (entry) {
          entry.ingresos += Number(o.total || 0);
          (o.items || []).forEach((it: any) => {
            const recipe = recipeMap.get(it.productId);
            const portionCost = Number(recipe?.costoTotal || recipe?.costoPorPorcion || 0);
            entry.gastos += portionCost * (Number(it.cantidad || it.quantity) || 1);
          });
        }
      });

      // Acumular egresos de caja
      shiftExpensesList.forEach((eg) => {
        const entry = map.get(eg.dateKey);
        if (entry) {
          entry.gastos += eg.amount;
        }
      });

      points.forEach((p) => {
        p.margen = p.ingresos - p.gastos;
      });

      const maxVal = Math.max(...points.map((p) => Math.max(p.ingresos, p.gastos)), 150000);
      const totalIngresos = points.reduce((acc, p) => acc + p.ingresos, 0);
      const totalGastos = points.reduce((acc, p) => acc + p.gastos, 0);

      return { points, maxVal, totalIngresos, totalGastos };
    } else {
      // 6 Meses
      const monthsList: { key: string; label: string; fullDate: string; ingresos: number; gastos: number; margen: number }[] = [];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('es-CO', { month: 'short' }).toUpperCase();
        const fullDate = d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
        monthsList.push({ key, label, fullDate, ingresos: 0, gastos: 0, margen: 0 });
      }

      const map = new Map(monthsList.map((m) => [m.key, m]));

      validOrders.forEach((o) => {
        const d = new Date(o.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const entry = map.get(key);
        if (entry) {
          entry.ingresos += Number(o.total || 0);
          (o.items || []).forEach((it: any) => {
            const recipe = recipeMap.get(it.productId);
            const portionCost = Number(recipe?.costoTotal || recipe?.costoPorPorcion || 0);
            entry.gastos += portionCost * (Number(it.cantidad || it.quantity) || 1);
          });
        }
      });

      shiftExpensesList.forEach((eg) => {
        const entry = map.get(eg.monthKey);
        if (entry) {
          entry.gastos += eg.amount;
        }
      });

      monthsList.forEach((p) => {
        p.margen = p.ingresos - p.gastos;
      });

      const maxVal = Math.max(...monthsList.map((m) => Math.max(m.ingresos, m.gastos)), 300000);
      const totalIngresos = monthsList.reduce((acc, p) => acc + p.ingresos, 0);
      const totalGastos = monthsList.reduce((acc, p) => acc + p.gastos, 0);

      return { points: monthsList, maxVal, totalIngresos, totalGastos };
    }
  }, [validOrders, recipes, shifts, trendMode]);

  // Generar coordenadas SVG de la curva de tendencia
  const trendSvgCoords = useMemo(() => {
    const svgWidth = 800;
    const svgHeight = 220;
    const paddingX = 40;
    const paddingY = 25;
    const chartW = svgWidth - paddingX * 2;
    const chartH = svgHeight - paddingY * 2;

    const points = trendData.points;
    if (points.length === 0) {
      return {
        incomeLine: '',
        incomeArea: '',
        expenseLine: '',
        expenseArea: '',
        svgPoints: [] as (typeof trendData.points[0] & { incomeX: number; incomeY: number; expenseX: number; expenseY: number })[],
        baselineY: paddingY + chartH,
        svgWidth,
        svgHeight,
      };
    }

    const stepX = chartW / Math.max(1, points.length - 1);

    const incomeCoords = points.map((p, idx) => {
      const x = paddingX + idx * stepX;
      const y = paddingY + chartH - (p.ingresos / trendData.maxVal) * chartH;
      return { x, y: Math.max(paddingY, Math.min(paddingY + chartH, y)) };
    });

    const expenseCoords = points.map((p, idx) => {
      const x = paddingX + idx * stepX;
      const y = paddingY + chartH - (p.gastos / trendData.maxVal) * chartH;
      return { x, y: Math.max(paddingY, Math.min(paddingY + chartH, y)) };
    });

    const incomeLine = getCurvedPath(incomeCoords);
    const incomeArea = `${incomeLine} L ${incomeCoords[incomeCoords.length - 1].x} ${paddingY + chartH} L ${incomeCoords[0].x} ${paddingY + chartH} Z`;

    const expenseLine = getCurvedPath(expenseCoords);
    const expenseArea = `${expenseLine} L ${expenseCoords[expenseCoords.length - 1].x} ${paddingY + chartH} L ${expenseCoords[0].x} ${paddingY + chartH} Z`;

    const svgPoints = points.map((p, idx) => ({
      ...p,
      incomeX: incomeCoords[idx].x,
      incomeY: incomeCoords[idx].y,
      expenseX: expenseCoords[idx].x,
      expenseY: expenseCoords[idx].y,
    }));

    return { incomeLine, incomeArea, expenseLine, expenseArea, svgPoints, baselineY: paddingY + chartH, svgWidth, svgHeight };
  }, [trendData]);

  // ==========================================
  // 4. DATA POR MÉTODOS DE PAGO (CAJA & DIGITAL)
  // ==========================================
  const paymentMethodsData = useMemo(() => {
    const map = new Map<string, { method: string; total: number; count: number }>();
    const colors: Record<string, string> = {
      Efectivo: '#10b981',
      Nequi: '#a855f7',
      Daviplata: '#ef4444',
      Tarjeta: '#3b82f6',
      Transferencia: '#f59e0b',
      Datáfono: '#06b6d4',
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
  // 5. DATA POR CANALES (MESA / DOMI / RECOGER)
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

    const topList = list.slice(0, 6);
    const maxMetric = Math.max(...topList.map((p) => (topProductsMetric === 'qty' ? p.qty : p.revenue)), 1);

    return { items: topList, maxMetric };
  }, [filteredOrders, topProductsMetric]);

  return (
    <div className="space-y-6 text-white pb-12">
      
      {/* ======================================================== */}
      {/* CABECERA Y FILTRO DE PERÍODO GENERAL                     */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#11141e] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-2xl">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-yellow/15 text-brand-yellow">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-black text-white font-display tracking-tight">
              Dashboard Ejecutivo & Gráficas del Negocio
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Inteligencia comercial y analítica de {restaurantName}: ventas, tendencias de caja, costos y promedios operativos.
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
            className="p-1.5 text-slate-400 hover:text-brand-yellow transition cursor-pointer"
            title="Refrescar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-yellow' : ''}`} />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECCIÓN PROMEDIOS DE PEDIDOS REALIZADOS (NUEVA)           */}
      {/* ======================================================== */}
      <div className="bg-[#11141e] border border-slate-800/90 rounded-3xl p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              Promedio de Pedidos Realizados en el Negocio
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Total histórico: <strong className="text-brand-yellow">{orderAverages.totalOrders} órdenes</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Promedio Diario */}
          <div className="p-3 bg-[#0c0f16] rounded-2xl border border-slate-800/90 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Promedio Diario</span>
            <div className="text-xl font-black text-amber-400 font-mono">
              {orderAverages.daily} <span className="text-xs font-normal text-slate-400 font-sans">pedidos/día</span>
            </div>
            <span className="text-[10px] text-slate-500">Ritmo de venta diario estimado</span>
          </div>

          {/* Promedio Semanal */}
          <div className="p-3 bg-[#0c0f16] rounded-2xl border border-slate-800/90 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Promedio Semanal</span>
            <div className="text-xl font-black text-emerald-400 font-mono">
              {orderAverages.weekly} <span className="text-xs font-normal text-slate-400 font-sans">pedidos/sem</span>
            </div>
            <span className="text-[10px] text-slate-500">Capacidad de rotación semanal</span>
          </div>

          {/* Promedio Mensual */}
          <div className="p-3 bg-[#0c0f16] rounded-2xl border border-slate-800/90 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Promedio Mensual</span>
            <div className="text-xl font-black text-blue-400 font-mono">
              {orderAverages.monthly} <span className="text-xs font-normal text-slate-400 font-sans">pedidos/mes</span>
            </div>
            <span className="text-[10px] text-slate-500">Volumen mensual proyectado</span>
          </div>

          {/* Ticket Promedio */}
          <div className="p-3 bg-[#0c0f16] rounded-2xl border border-slate-800/90 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Ticket Promedio General</span>
            <div className="text-xl font-black text-white font-mono">
              ${orderAverages.ticketAvg.toLocaleString('es-CO')}
            </div>
            <span className="text-[10px] text-slate-500">Valor promedio facturado por orden</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* GRÁFICA NUEVA: TENDENCIA CURVA ONDULADA (INGRESOS VS GASTOS)*/}
      {/* CON RAYITA HACIA ARRIBA / ABAJO Y SOMBREADO CLARITO       */}
      {/* ======================================================== */}
      <div className="bg-[#11141e] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-brand-yellow/15 text-brand-yellow">
                <Activity className="w-5 h-5" />
              </span>
              <h3 className="text-base sm:text-lg font-black text-white font-display">
                Gráfico de Tendencia Curva — Ingresos vs Gastos
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Curva ondulada que sube y baja mostrando el dinero entrante vs costos con sombreado luminoso.
            </p>
          </div>

          {/* Selector de modo: Diario o Mensual */}
          <div className="flex items-center gap-1.5 bg-[#0b0e14] p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setTrendMode('daily')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                trendMode === 'daily'
                  ? 'bg-brand-yellow text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tendencia Diaria (14 Días)
            </button>
            <button
              type="button"
              onClick={() => setTrendMode('monthly')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                trendMode === 'monthly'
                  ? 'bg-brand-yellow text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tendencia Mensual (6 Meses)
            </button>
          </div>
        </div>

        {/* Resumen Superior de Ingresos vs Gastos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0d1017] p-3 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-brand-yellow shadow-glow shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Dinero que Entra (Ingresos)</span>
              <span className="text-base font-black text-brand-yellow font-mono">
                ${Math.round(trendData.totalIngresos).toLocaleString('es-CO')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-glow shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Dinero que Sale (Costos & Gastos)</span>
              <span className="text-base font-black text-rose-400 font-mono">
                ${Math.round(trendData.totalGastos).toLocaleString('es-CO')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-glow shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Utilidad Neta del Período</span>
              <span className="text-base font-black text-emerald-400 font-mono">
                ${Math.round(trendData.totalIngresos - trendData.totalGastos).toLocaleString('es-CO')}
              </span>
            </div>
          </div>
        </div>

        {/* Gráfico SVG Curvo con Rayitas Onduladas y Sombreado Clarito */}
        <div className="relative pt-2">
          <div className="w-full bg-[#0a0d14] rounded-2xl border border-slate-800/70 p-3 relative overflow-hidden">
            <svg
              viewBox={`0 0 ${trendSvgCoords.svgWidth} ${trendSvgCoords.svgHeight}`}
              className="w-full h-48 sm:h-56 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Sombreado clarito dorado para Ingresos */}
                <linearGradient id="ingresosAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffc928" stopOpacity="0.45" />
                  <stop offset="70%" stopColor="#ffc928" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#ffc928" stopOpacity="0.0" />
                </linearGradient>

                {/* Sombreado clarito rojizo para Gastos */}
                <linearGradient id="gastosAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
                  <stop offset="70%" stopColor="#ef4444" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Líneas guía horizontales de fondo */}
              <line x1="40" y1="40" x2="760" y2="40" stroke="#222738" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="40" y1="95" x2="760" y2="95" stroke="#222738" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="40" y1="150" x2="760" y2="150" stroke="#222738" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="40" y1={trendSvgCoords.baselineY} x2="760" y2={trendSvgCoords.baselineY} stroke="#333b52" strokeWidth="1" />

              {/* Sombreado clarito de Ingresos */}
              {trendSvgCoords.incomeArea && (
                <path d={trendSvgCoords.incomeArea} fill="url(#ingresosAreaGrad)" />
              )}

              {/* Sombreado clarito de Gastos */}
              {trendSvgCoords.expenseArea && (
                <path d={trendSvgCoords.expenseArea} fill="url(#gastosAreaGrad)" />
              )}

              {/* Rayita curva continua hacia arriba/abajo de Gastos */}
              {trendSvgCoords.expenseLine && (
                <path
                  d={trendSvgCoords.expenseLine}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_2px_8px_rgba(239,68,68,0.5)]"
                />
              )}

              {/* Rayita curva continua hacia arriba/abajo de Ingresos */}
              {trendSvgCoords.incomeLine && (
                <path
                  d={trendSvgCoords.incomeLine}
                  fill="none"
                  stroke="#ffc928"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_2px_10px_rgba(255,201,40,0.6)]"
                />
              )}

              {/* Puntos y áreas interactivas en la curva */}
              {trendSvgCoords.svgPoints.map((pt, idx) => {
                const isHovered = hoveredTrendIndex === idx;

                return (
                  <g key={pt.key} className="cursor-pointer">
                    {/* Punto luminoso de Ingresos */}
                    <circle
                      cx={pt.incomeX}
                      cy={pt.incomeY}
                      r={isHovered ? 6 : 4}
                      fill="#ffc928"
                      stroke="#0a0d14"
                      strokeWidth="2"
                      className="transition-all duration-150"
                    />

                    {/* Punto de Gastos */}
                    <circle
                      cx={pt.expenseX}
                      cy={pt.expenseY}
                      r={isHovered ? 5 : 3.5}
                      fill="#ef4444"
                      stroke="#0a0d14"
                      strokeWidth="1.5"
                      className="transition-all duration-150"
                    />

                    {/* Área invisible amplia para detectar hover */}
                    <rect
                      x={pt.incomeX - 20}
                      y="10"
                      width="40"
                      height={trendSvgCoords.svgHeight - 20}
                      fill="transparent"
                      onMouseEnter={() => setHoveredTrendIndex(idx)}
                      onMouseLeave={() => setHoveredTrendIndex(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Etiquetas de fechas en la base */}
            <div className="flex justify-between px-6 pt-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {trendSvgCoords.svgPoints.map((pt, idx) => (
                <span
                  key={pt.key}
                  className={`text-center transition-colors ${hoveredTrendIndex === idx ? 'text-brand-yellow font-black' : ''}`}
                >
                  {pt.label}
                </span>
              ))}
            </div>

            {/* Tooltip dinámico sobre el punto seleccionado */}
            {hoveredTrendIndex !== null && trendSvgCoords.svgPoints[hoveredTrendIndex] && (
              <div 
                className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#141824]/95 border border-amber-400/80 p-3 rounded-2xl shadow-2xl text-center backdrop-blur-md z-30 animate-in fade-in zoom-in-95 pointer-events-none"
              >
                <div className="text-xs font-black text-slate-200 capitalize">
                  {trendSvgCoords.svgPoints[hoveredTrendIndex].fullDate}
                </div>
                <div className="flex items-center justify-center gap-4 mt-1.5 text-xs font-mono font-black">
                  <span className="text-brand-yellow">
                    🟡 Ingresos: ${Math.round(trendSvgCoords.svgPoints[hoveredTrendIndex].ingresos).toLocaleString('es-CO')}
                  </span>
                  <span className="text-rose-400">
                    🔴 Gastos: ${Math.round(trendSvgCoords.svgPoints[hoveredTrendIndex].gastos).toLocaleString('es-CO')}
                  </span>
                  <span className="text-emerald-400">
                    🟢 Margen: ${Math.round(trendSvgCoords.svgPoints[hoveredTrendIndex].margen).toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* GRÁFICAS COMPACTAS EN 2 COLUMNAS (MÁS PEQUEÑAS Y EQUILIBRADAS)*/}
      {/* 1. VENTAS DIARIAS COMPACTA | 2. VENTAS MENSUALES COMPACTA */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. VENTAS DIARIAS COMPACTA */}
        <div className="bg-[#11141e] border border-slate-800/90 rounded-3xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-500/15 text-brand-yellow">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <h3 className="text-sm sm:text-base font-black text-white font-display">
                  Ventas Diarias (Recaudos por Día)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Promedio: ${Math.round(dailyData.avgDailySales).toLocaleString('es-CO')} / día
              </span>
            </div>

            {/* Selector 7 / 14 / 30 días */}
            <div className="flex items-center gap-1 bg-[#0b0e14] p-1 rounded-lg border border-slate-800">
              {([7, 14, 30] as const).map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setDailyViewDays(days)}
                  className={`px-2 py-0.5 rounded text-[10px] font-black transition cursor-pointer ${
                    dailyViewDays === days
                      ? 'bg-brand-yellow text-slate-950 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>

          {/* Gráfico de Barras Compacto (h-44) */}
          <div className="h-44 w-full flex items-end gap-1 sm:gap-2 px-2 pb-6 pt-2 bg-[#0a0d14] rounded-2xl border border-slate-800/70 relative">
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
                  {isHovered && (
                    <div className="absolute bottom-[calc(100%+6px)] z-30 bg-[#161a26] border border-amber-400/80 p-2 rounded-xl shadow-xl text-center whitespace-nowrap pointer-events-none">
                      <div className="text-[10px] font-black text-slate-300">{point.label}</div>
                      <div className="text-xs font-black text-brand-yellow font-mono">
                        ${Math.round(point.total).toLocaleString('es-CO')}
                      </div>
                      <div className="text-[9px] text-slate-400">{point.count} órdenes</div>
                    </div>
                  )}

                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[32px] rounded-t-lg transition-all duration-300 ${
                      point.total > 0
                        ? isHovered
                          ? 'bg-gradient-to-t from-amber-500 to-yellow-300 shadow-lg shadow-amber-400/40'
                          : 'bg-gradient-to-t from-amber-600 to-yellow-400 hover:brightness-110'
                        : 'bg-slate-800/40'
                    }`}
                  />
                  <span className="absolute bottom-1 text-[8px] font-bold text-slate-400 truncate w-full text-center">
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. VENTAS MENSUALES COMPACTA */}
        <div className="bg-[#11141e] border border-slate-800/90 rounded-3xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-emerald-500/15 text-emerald-400">
                  <Calendar className="w-4 h-4" />
                </span>
                <h3 className="text-sm sm:text-base font-black text-white font-display">
                  Ventas Mensuales (Mes a Mes)
                </h3>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono font-bold">
                Últimos 6 meses de historial
              </span>
            </div>
            <span className="text-xs text-brand-yellow font-mono font-bold">
              ${Math.round(monthlyData.totalYearSales).toLocaleString('es-CO')}
            </span>
          </div>

          {/* Gráfico de Barras Mensuales Compacto (h-44) */}
          <div className="h-44 w-full flex items-end gap-3 px-3 pb-6 pt-2 bg-[#0a0d14] rounded-2xl border border-slate-800/70 relative">
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
                  {isHovered && (
                    <div className="absolute bottom-[calc(100%+6px)] z-30 bg-[#161a26] border border-emerald-400/80 p-2 rounded-xl shadow-xl text-center whitespace-nowrap pointer-events-none">
                      <div className="text-[10px] font-black text-slate-300">{m.label} {m.year}</div>
                      <div className="text-xs font-black text-emerald-400 font-mono">
                        ${Math.round(m.total).toLocaleString('es-CO')}
                      </div>
                      <div className="text-[9px] text-slate-400">{m.count} pedidos</div>
                    </div>
                  )}

                  {m.growth !== 0 && m.total > 0 && (
                    <span className={`text-[8px] font-black mb-1 px-1 py-0.2 rounded ${
                      m.growth > 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                    }`}>
                      {m.growth > 0 ? `+${m.growth}%` : `${m.growth}%`}
                    </span>
                  )}

                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 ${
                      m.total > 0
                        ? isHovered
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-300 shadow-lg shadow-emerald-400/30'
                          : 'bg-gradient-to-t from-emerald-600 to-teal-400 hover:brightness-110'
                        : 'bg-slate-800/40'
                    }`}
                  />

                  <span className="absolute bottom-1 text-[10px] font-black text-slate-300 tracking-wider">
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* CAJA, TOP PRODUCTOS Y CANALES                            */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. Métodos de Pago & Caja */}
        <div className="bg-[#11141e] border border-slate-800/90 rounded-3xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <span className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400">
              <Wallet className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-black text-white font-display">
              Caja & Métodos de Pago
            </h3>
          </div>

          <div className="space-y-2">
            {paymentMethodsData.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                No hay pagos registrados en este período.
              </div>
            ) : (
              paymentMethodsData.map((item) => (
                <div
                  key={item.method}
                  className="p-2.5 bg-[#0d1017] rounded-xl border border-slate-800/80 space-y-1 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-bold text-white">{item.method}</span>
                    </div>
                    <span className="font-mono font-black text-brand-yellow">
                      ${Math.round(item.total).toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                      className="h-full rounded-full"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. Top Productos */}
        <div className="bg-[#11141e] border border-slate-800/90 rounded-3xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-500/15 text-orange-400">
                <Flame className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-black text-white font-display">
                Top Productos
              </h3>
            </div>
            <div className="flex items-center bg-[#0b0e14] p-0.5 rounded-lg border border-slate-800 text-[10px]">
              <button
                type="button"
                onClick={() => setTopProductsMetric('revenue')}
                className={`px-2 py-0.5 rounded font-black ${topProductsMetric === 'revenue' ? 'bg-orange-500 text-black' : 'text-slate-400'}`}
              >
                $
              </button>
              <button
                type="button"
                onClick={() => setTopProductsMetric('qty')}
                className={`px-2 py-0.5 rounded font-black ${topProductsMetric === 'qty' ? 'bg-orange-500 text-black' : 'text-slate-400'}`}
              >
                Und
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {topProductsData.items.map((prod, idx) => {
              const val = topProductsMetric === 'qty' ? prod.qty : prod.revenue;
              const pct = Math.max(8, Math.round((val / topProductsData.maxMetric) * 100));

              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold text-white truncate max-w-[150px]">
                      #{idx + 1} {prod.name}
                    </span>
                    <span className="font-mono font-bold text-amber-300">
                      {topProductsMetric === 'qty' ? `${prod.qty} und` : `$${Math.round(prod.revenue).toLocaleString('es-CO')}`}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div style={{ width: `${pct}%` }} className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Canales de Venta */}
        <div className="bg-[#11141e] border border-slate-800/90 rounded-3xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <span className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400">
              <Layers className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-black text-white font-display">
              Canales de Venta
            </h3>
          </div>

          <div className="space-y-2">
            {channelsData.map((ch) => {
              const Icon = ch.icon;
              return (
                <div key={ch.key} className="p-2.5 bg-[#0d1017] rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" style={{ color: ch.color }} />
                      <span className="font-bold text-white">{ch.label}</span>
                    </div>
                    <span className="font-mono font-black text-white">
                      ${Math.round(ch.total).toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div style={{ width: `${ch.percent}%`, backgroundColor: ch.color }} className="h-full rounded-full" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
