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
  Scale
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
  const [period, setPeriod] = useState<'today' | '7days' | 'month' | 'all'>('month');
  const [orders, setOrders] = useState<any[]>([]);
  const [supplies, setSupplies] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [kardex, setKardex] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, suppliesRes, recipesRes, kardexRes] = await Promise.all([
        fetch(`/api/orders?restaurantId=${restaurantId}`),
        fetch(`/api/supplies?restaurantId=${restaurantId}`),
        fetch(`/api/recipes?restaurantId=${restaurantId}`),
        fetch(`/api/supplies/kardex?restaurantId=${restaurantId}`),
      ]);

      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (suppliesRes.ok) {
        const sData = await suppliesRes.json();
        setSupplies(sData.supplies || []);
      }
      if (recipesRes.ok) setRecipes(await recipesRes.json());
      if (kardexRes.ok) setKardex(await kardexRes.json());
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

  // Filter orders by period
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((o) => {
      if (o.status === 'CANCELLED' || o.status === 'CANCELADO') return false;
      const orderDate = new Date(o.createdAt);
      if (period === 'today') {
        return orderDate.toDateString() === now.toDateString();
      }
      if (period === '7days') {
        const diff = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
        return diff <= 7;
      }
      if (period === 'month') {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  }, [orders, period]);

  // Financial KPIs
  const kpis = useMemo(() => {
    // 1. Total Sales
    const totalSales = filteredOrders.reduce((acc, o) => acc + Number(o.total || 0), 0);

    // 2. Cost of Goods Sold (CMV) calculated from recipe cost of each sold product
    const recipeMap = new Map(recipes.map((r) => [r.productId, r]));
    let totalSupplyCost = 0;

    filteredOrders.forEach((order) => {
      (order.items || []).forEach((item: any) => {
        const recipe = recipeMap.get(item.productId);
        const portionCost = Number(recipe?.costoPorPorcion || 0);
        totalSupplyCost += portionCost * (Number(item.quantity) || 1);
      });
    });

    // 3. Gross Profit & Margin
    const grossProfit = totalSales - totalSupplyCost;
    const grossMarginPercent = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

    // 4. Inventory Valuation
    const totalValuation = supplies.reduce(
      (acc, s) => acc + s.stockActual * (s.costoPromedio || s.costoUnitario || 0),
      0
    );

    // 5. Total Waste/Merma Cost in period
    const wasteMovements = kardex.filter((m) =>
      ['SALIDA_MERMA', 'SALIDA_DESPERDICIO', 'SALIDA_VENCIMIENTO'].includes(m.tipo)
    );
    const totalWasteCost = wasteMovements.reduce((acc, m) => acc + Number(m.costoTotal || 0), 0);

    // 6. Critical Alerts Counts
    const lowStockCount = supplies.filter((s) => s.isLowStock && !s.isNegative).length;
    const negativeStockCount = supplies.filter((s) => s.isNegative).length;
    const expiringSoonCount = supplies.filter((s) => s.isExpiringSoon).length;
    const expiredCount = supplies.filter((s) => s.isExpired).length;

    return {
      totalSales,
      totalSupplyCost,
      grossProfit,
      grossMarginPercent: Math.round(grossMarginPercent * 10) / 10,
      totalValuation: Math.max(0, totalValuation),
      totalWasteCost,
      lowStockCount,
      negativeStockCount,
      expiringSoonCount,
      expiredCount,
    };
  }, [filteredOrders, supplies, recipes, kardex]);

  // Top Selling Items
  const topSelling = useMemo(() => {
    const map = new Map<string, { name: string; count: number; total: number }>();
    filteredOrders.forEach((order) => {
      (order.items || []).forEach((item: any) => {
        const id = item.productId || item.product?.id || item.name;
        const name = item.name || item.product?.name || 'Plato';
        const qty = Number(item.quantity) || 1;
        const price = Number(item.unitPrice || item.price || 0);

        if (!map.has(id)) {
          map.set(id, { name, count: 0, total: 0 });
        }
        const curr = map.get(id)!;
        curr.count += qty;
        curr.total += qty * price;
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredOrders]);

  return (
    <div className="space-y-6">
      {/* Header and Period Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#12141c] border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-orange-400" />
            <span>Dashboard Ejecutivo y Operativo — {restaurantName}</span>
          </h2>
          <p className="text-xs text-slate-400">
            Inteligencia de negocio: ventas, costo real de recetas (BOM), márgenes y alertas de inventario.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center space-x-1 bg-[#181b26] p-1 rounded-xl border border-slate-800">
          {[
            { id: 'today', label: 'Hoy' },
            { id: '7days', label: '7 Días' },
            { id: 'month', label: 'Este Mes' },
            { id: 'all', label: 'Histórico' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === p.id
                  ? 'bg-orange-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* CRITICAL ALERTS BANNER IF ANY */}
      {(kpis.negativeStockCount > 0 || kpis.lowStockCount > 0 || kpis.expiringSoonCount > 0 || kpis.expiredCount > 0) && (
        <div className="bg-gradient-to-r from-red-500/10 via-amber-500/10 to-[#12141c] border border-amber-500/30 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
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
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 flex-shrink-0"
          >
            Gestionar en Inventario →
          </button>
        </div>
      )}

      {/* FINANCIAL KPIS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Ventas */}
        <div className="bg-[#12141c] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ventas Totales</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono">
              ${Math.round(kpis.totalSales).toLocaleString('es-CO')}
            </div>
            <span className="text-[11px] text-slate-500">
              {filteredOrders.length} pedidos facturados
            </span>
          </div>
        </div>

        {/* Costo Insumos CMV */}
        <div className="bg-[#12141c] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Costo Insumos (BOM)</span>
            <div className="p-2 bg-orange-500/10 text-orange-400 rounded-xl">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-orange-400 font-mono">
              ${Math.round(kpis.totalSupplyCost).toLocaleString('es-CO')}
            </div>
            <span className="text-[11px] text-slate-500">
              Costo de materias primas consumidas
            </span>
          </div>
        </div>

        {/* Utilidad Bruta */}
        <div className="bg-[#12141c] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Utilidad Bruta</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400 font-mono">
              ${Math.round(kpis.grossProfit).toLocaleString('es-CO')}
            </div>
            <span className="text-[11px] text-slate-500">
              Margen Bruto: <strong className="text-emerald-400 font-mono">{kpis.grossMarginPercent}%</strong>
            </span>
          </div>
        </div>

        {/* Inventario Valorizado */}
        <div className="bg-[#12141c] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Valorizado</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono">
              ${Math.round(kpis.totalValuation).toLocaleString('es-CO')}
            </div>
            <span className="text-[11px] text-slate-500">
              Valor en almacén a costo promedio
            </span>
          </div>
        </div>

        {/* Costo de Mermas */}
        <div className="bg-[#12141c] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mermas del Período</span>
            <div className="p-2 bg-red-500/10 text-red-400 rounded-xl">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-red-400 font-mono">
              ${Math.round(kpis.totalWasteCost).toLocaleString('es-CO')}
            </div>
            <span className="text-[11px] text-slate-500">
              Desperdicios y pérdidas auditadas
            </span>
          </div>
        </div>
      </div>

      {/* TOP SELLING & MOST PROFITABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-[#12141c] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Platos Más Vendidos en el Período
              </h3>
            </div>
            <span className="text-xs text-slate-500">Volumen y Facturación</span>
          </div>

          <div className="space-y-2.5">
            {topSelling.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No hay ventas registradas en este período.
              </div>
            ) : (
              topSelling.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-[#181b26] rounded-xl border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-400 font-black flex items-center justify-center text-xs font-mono">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-white">{item.name}</div>
                      <span className="text-[11px] text-slate-400 font-mono">{item.count} unidades vendidas</span>
                    </div>
                  </div>

                  <span className="font-mono font-extrabold text-emerald-400">
                    ${Math.round(item.total).toLocaleString('es-CO')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Most Profitable Recipes */}
        <div className="bg-[#12141c] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Recetas con Mayor Margen Bruto (Rentabilidad)
              </h3>
            </div>
            <span className="text-xs text-slate-500">Ingeniería de Menú</span>
          </div>

          <div className="space-y-2.5">
            {recipes.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                Aún no has configurado recetas técnicas en el sistema.
              </div>
            ) : (
              [...recipes]
                .sort((a, b) => Number(b.marginPercent || 0) - Number(a.marginPercent || 0))
                .slice(0, 5)
                .map((r, idx) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 bg-[#181b26] rounded-xl border border-slate-800/80 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{r.product?.name || r.nombre}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Costo: ${Math.round(r.costoPorPorcion)} | Venta: ${Number(r.salePrice || 0).toLocaleString('es-CO')}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-emerald-400 text-sm">
                        {r.marginPercent}%
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono">
                        +${Math.round(r.grossProfit || 0).toLocaleString('es-CO')}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
