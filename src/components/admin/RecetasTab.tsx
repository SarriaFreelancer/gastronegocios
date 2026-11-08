'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpenCheck, 
  Plus, 
  Search, 
  AlertCircle, 
  FileSpreadsheet, 
  FileText, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  RefreshCw, 
  DollarSign, 
  Clock, 
  Percent, 
  Sparkles,
  Layers
} from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/lib/export-utils';

interface RecipeItem {
  supplyId: string;
  supply?: any;
  cantidad: number;
  unidadMedida: string;
  porcentajeMerma: number;
  costoCalculado?: number;
}

interface Recipe {
  id: string;
  nombre: string;
  descripcion?: string;
  rendimientoPorciones: number;
  costoTotal: number;
  costoPorPorcion: number;
  tiempoPreparacionMinutos?: number;
  instrucciones?: string;
  productId: string;
  product?: any;
  items: RecipeItem[];
  salePrice?: number;
  grossProfit?: number;
  marginPercent?: number;
  hasStockIssues?: boolean;
}

interface RecetasTabProps {
  restaurantId: string;
  restaurantName: string;
}

export const RecetasTab: React.FC<RecetasTabProps> = ({ restaurantId, restaurantName }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [supplies, setSupplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [recalculating, setRecalculating] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [recipeName, setRecipeName] = useState('');
  const [recipeDesc, setRecipeDesc] = useState('');
  const [yieldPortions, setYieldPortions] = useState(1);
  const [prepTime, setPrepTime] = useState<number | ''>('');
  const [instructions, setInstructions] = useState('');
  const [formItems, setFormItems] = useState<RecipeItem[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recipesRes, prodsRes, suppliesRes] = await Promise.all([
        fetch(`/api/recipes?restaurantId=${restaurantId}`),
        fetch(`/api/products?restaurantId=${restaurantId}`),
        fetch(`/api/supplies?restaurantId=${restaurantId}`),
      ]);

      if (recipesRes.ok) {
        const data = await recipesRes.json();
        setRecipes(Array.isArray(data) ? data : []);
      }
      if (prodsRes.ok) {
        const data = await prodsRes.json();
        setProducts(Array.isArray(data) ? data : []);
      }
      if (suppliesRes.ok) {
        const data = await suppliesRes.json();
        setSupplies(data.supplies || []);
      }
    } catch (err) {
      console.error('Error fetching recipes data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchData();
    }
  }, [restaurantId]);

  // Filtered recipes
  const filteredRecipes = useMemo(() => {
    if (!search.trim()) return recipes;
    const q = search.toLowerCase();
    return recipes.filter(
      (r) =>
        r.nombre.toLowerCase().includes(q) ||
        (r.product?.name || '').toLowerCase().includes(q) ||
        (r.product?.category || '').toLowerCase().includes(q)
    );
  }, [recipes, search]);

  // Recalculate live cost in modal
  const liveCostCalculations = useMemo(() => {
    const supplyMap = new Map(supplies.map((s) => [s.id, s]));
    let total = 0;

    const enrichedItems = formItems.map((item) => {
      const sup = supplyMap.get(item.supplyId);
      const unitCost = Number(sup?.costoPromedio || sup?.costoUnitario || 0);
      const qty = Number(item.cantidad) || 0;
      const waste = Number(item.porcentajeMerma) || 0;
      const effectiveQty = qty * (1 + waste / 100);
      const lineCost = effectiveQty * unitCost;
      total += lineCost;
      return {
        ...item,
        supplyName: sup?.nombre || 'Insumo',
        unitCost,
        lineCost,
      };
    });

    const portions = Number(yieldPortions) > 0 ? Number(yieldPortions) : 1;
    const costPerPortion = total / portions;

    const currentProd = products.find((p) => p.id === selectedProductId);
    const salePrice = Number(currentProd?.price || currentProd?.precio || 0);
    const grossProfit = salePrice - costPerPortion;
    const marginPercent = salePrice > 0 ? (grossProfit / salePrice) * 100 : 0;

    return {
      totalCost: total,
      costPerPortion,
      salePrice,
      grossProfit,
      marginPercent: Math.round(marginPercent * 10) / 10,
      items: enrichedItems,
    };
  }, [formItems, yieldPortions, selectedProductId, supplies, products]);

  // Open modal
  const handleOpenModal = (recipe?: Recipe) => {
    if (recipe) {
      setEditingRecipeId(recipe.id);
      setSelectedProductId(recipe.productId);
      setRecipeName(recipe.nombre);
      setRecipeDesc(recipe.descripcion || '');
      setYieldPortions(recipe.rendimientoPorciones || 1);
      setPrepTime(recipe.tiempoPreparacionMinutos || '');
      setInstructions(recipe.instrucciones || '');
      setFormItems(
        recipe.items.map((i) => ({
          supplyId: i.supplyId,
          cantidad: i.cantidad,
          unidadMedida: i.unidadMedida,
          porcentajeMerma: i.porcentajeMerma || 0,
        }))
      );
    } else {
      setEditingRecipeId(null);
      // Select first product not having a recipe yet
      const usedProductIds = new Set(recipes.map((r) => r.productId));
      const firstFree = products.find((p) => !usedProductIds.has(p.id)) || products[0];
      setSelectedProductId(firstFree?.id || '');
      setRecipeName(firstFree?.name ? `Receta: ${firstFree.name}` : '');
      setRecipeDesc('');
      setYieldPortions(1);
      setPrepTime(15);
      setInstructions('');
      setFormItems([]);
    }
    setShowModal(true);
  };

  const handleProductSelectChange = (productId: string) => {
    setSelectedProductId(productId);
    const prod = products.find((p) => p.id === productId);
    if (prod && !editingRecipeId) {
      setRecipeName(`Receta: ${prod.name || prod.nombre}`);
    }
  };

  const handleAddIngredient = () => {
    if (supplies.length === 0) {
      alert('Debes registrar materias primas/insumos primero en la pestaña de Inventario.');
      return;
    }
    const firstSupply = supplies[0];
    setFormItems([
      ...formItems,
      {
        supplyId: firstSupply.id,
        cantidad: 1,
        unidadMedida: firstSupply.unidadMedida || 'kg',
        porcentajeMerma: Number(firstSupply.mermaEsperada || 0),
      },
    ]);
  };

  const handleUpdateItem = (index: number, field: string, val: any) => {
    const updated = [...formItems];
    if (field === 'supplyId') {
      const sup = supplies.find((s) => s.id === val);
      updated[index] = {
        ...updated[index],
        supplyId: val,
        unidadMedida: sup?.unidadMedida || updated[index].unidadMedida,
        porcentajeMerma: Number(sup?.mermaEsperada || 0),
      };
    } else {
      updated[index] = { ...updated[index], [field]: val };
    }
    setFormItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      alert('Selecciona un producto comercial');
      return;
    }
    if (formItems.length === 0) {
      alert('Agrega al menos un ingrediente o materia prima a la receta');
      return;
    }

    try {
      const payload = {
        restaurantId,
        productId: selectedProductId,
        nombre: recipeName,
        descripcion: recipeDesc,
        rendimientoPorciones: Number(yieldPortions) || 1,
        tiempoPreparacionMinutos: prepTime ? Number(prepTime) : null,
        instrucciones: instructions,
        items: formItems.map((i) => ({
          supplyId: i.supplyId,
          cantidad: Number(i.cantidad) || 0,
          unidadMedida: i.unidadMedida,
          porcentajeMerma: Number(i.porcentajeMerma) || 0,
        })),
      };

      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar receta');

      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteRecipe = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar la receta "${name}"?`)) return;
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRecalculateAll = async () => {
    setRecalculating(true);
    try {
      const res = await fetch('/api/recipes/recalculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al recalcular');
      alert(data.message || 'Recetas recalculadas');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRecalculating(false);
    }
  };

  // Exports
  const handleExportExcel = () => {
    const data = filteredRecipes.map((r) => ({
      PLATO: r.product?.name || r.nombre,
      CATEGORÍA: r.product?.category || '',
      'PRECIO DE VENTA': r.salePrice || 0,
      'COSTO POR PORCIÓN': r.costoPorPorcion,
      'UTILIDAD BRUTA ($)': r.grossProfit || 0,
      'MARGEN BRUTO (%)': `${r.marginPercent || 0}%`,
      'RENDIMIENTO (PORC.)': r.rendimientoPorciones,
      'TIEMPO PREPARACIÓN (MIN)': r.tiempoPreparacionMinutos || 0,
      'NRO INGREDIENTES': r.items.length,
    }));
    exportToExcel(data, `recetas_y_costos_${restaurantName.toLowerCase().replace(/\s+/g, '_')}`);
  };

  const handleExportPdf = () => {
    const columns = ['Plato Comercial', 'Categoría', 'Precio Venta', 'Costo Porción', 'Margen ($)', 'Margen (%)', 'Ingredientes'];
    const rows = filteredRecipes.map((r) => [
      r.product?.name || r.nombre,
      r.product?.category || 'General',
      `$${Number(r.salePrice || 0).toLocaleString('es-CO')}`,
      `$${Math.round(r.costoPorPorcion).toLocaleString('es-CO')}`,
      `$${Math.round(r.grossProfit || 0).toLocaleString('es-CO')}`,
      `${r.marginPercent || 0}%`,
      `${r.items.length} insumos`,
    ]);

    exportToPdf({
      title: 'Estructura de Recetas Técnicas, Costos y Márgenes (BOM)',
      restaurantName,
      columns,
      rows,
      fileName: `recetas_costos_${restaurantName.toLowerCase().replace(/\s+/g, '_')}`,
      summaryRows: [
        `Total de recetas configuradas: ${filteredRecipes.length}`,
        `Costo promedio por porción: $${Math.round(filteredRecipes.reduce((acc, r) => acc + r.costoPorPorcion, 0) / (filteredRecipes.length || 1)).toLocaleString('es-CO')}`,
      ],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#12141c] border border-slate-800 rounded-2xl p-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
            <BookOpenCheck className="w-5 h-5 text-orange-400" />
            <span>Recetas Técnicas y Costeo Automático (BOM)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Control de ingredientes, cálculo de costo unitario por porción y descarga automática en cada venta.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRecalculateAll}
            disabled={recalculating}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            title="Recalcular costos con los precios más recientes de insumos"
          >
            <RefreshCw className={`w-4 h-4 text-orange-400 ${recalculating ? 'animate-spin' : ''}`} />
            <span>Recalcular Costos</span>
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
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Receta</span>
          </button>
        </div>
      </div>

      {/* Recipes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-400" />
            Cargando recetas gastronómicas...
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-[#12141c] border border-slate-800 rounded-2xl p-8 space-y-3">
            <BookOpenCheck className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">No hay recetas configuradas</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Crea tu primera receta técnica para calcular el costo real de tus platos y descontar automáticamente los insumos al vender.
            </p>
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="mt-2 px-4 py-2 bg-orange-500 text-slate-950 rounded-xl text-xs font-bold"
            >
              Crear Receta Ahora
            </button>
          </div>
        ) : (
          filteredRecipes.map((r) => {
            const salePrice = Number(r.salePrice || 0);
            const cost = Number(r.costoPorPorcion || 0);
            const profit = Number(r.grossProfit || 0);
            const margin = Number(r.marginPercent || 0);

            return (
              <div
                key={r.id}
                className="bg-[#12141c] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md group relative overflow-hidden"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                        {r.product?.category || 'Plato'}
                      </span>
                      <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-orange-400 transition-colors">
                        {r.product?.name || r.nombre}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(r)}
                        className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
                        title="Editar Receta"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRecipe(r.id, r.product?.name || r.nombre)}
                        className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                        title="Eliminar Receta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="grid grid-cols-3 gap-2 my-3 text-center">
                    <div className="bg-[#181b26] p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold block">Precio Venta</span>
                      <span className="text-xs sm:text-sm font-extrabold text-white font-mono">
                        ${salePrice.toLocaleString('es-CO')}
                      </span>
                    </div>

                    <div className="bg-[#181b26] p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold block">Costo Porción</span>
                      <span className="text-xs sm:text-sm font-extrabold text-orange-400 font-mono">
                        ${Math.round(cost).toLocaleString('es-CO')}
                      </span>
                    </div>

                    <div className="bg-[#181b26] p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold block">Margen Bruto</span>
                      <span className={`text-xs sm:text-sm font-extrabold font-mono ${margin >= 60 ? 'text-emerald-400' : margin >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                        {margin}%
                      </span>
                    </div>
                  </div>

                  {/* Ingredients Preview */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                      <span>Ingredientes ({r.items.length})</span>
                      <span className="text-slate-500 font-normal">
                        Rinde {r.rendimientoPorciones} porc.
                      </span>
                    </span>
                    <div className="bg-[#161822] rounded-xl p-2.5 max-h-32 overflow-y-auto space-y-1 text-xs">
                      {r.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-slate-300">
                          <span className="truncate pr-2">
                            • {item.supply?.nombre || 'Insumo'}
                          </span>
                          <span className="font-mono text-slate-400 flex-shrink-0">
                            {item.cantidad} {item.unidadMedida}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Alert if out of stock */}
                {r.hasStockIssues && (
                  <div className="mt-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center space-x-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Algunos ingredientes tienen bajo stock</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* RECIPE BUILDER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpenCheck className="w-5 h-5 text-orange-400" />
                <h3 className="font-extrabold text-base text-white">
                  {editingRecipeId ? 'Editar Receta Técnica (BOM)' : 'Crear Receta Técnica (BOM)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs sm:text-sm">
              {/* Product and General Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Producto Comercial Asociado *</label>
                  <select
                    disabled={!!editingRecipeId}
                    value={selectedProductId}
                    onChange={(e) => handleProductSelectChange(e.target.value)}
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="">Seleccione un producto...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name || p.nombre} - ${Number(p.price || p.precio || 0).toLocaleString('es-CO')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Nombre de la Receta *</label>
                  <input
                    type="text"
                    required
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Rendimiento (Porciones)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={yieldPortions}
                    onChange={(e) => setYieldPortions(Number(e.target.value))}
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Tiempo Prep. (Min)</label>
                  <input
                    type="number"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="15"
                    className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Costo Estimado / Porción</label>
                  <div className="w-full bg-[#181b26] border border-slate-800 rounded-xl px-3 py-2 text-orange-400 font-mono font-bold">
                    ${Math.round(liveCostCalculations.costPerPortion).toLocaleString('es-CO')}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Margen Bruto Est.</label>
                  <div className={`w-full bg-[#181b26] border border-slate-800 rounded-xl px-3 py-2 font-mono font-black ${
                    liveCostCalculations.marginPercent >= 50 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {liveCostCalculations.marginPercent}% (${Math.round(liveCostCalculations.grossProfit).toLocaleString('es-CO')})
                  </div>
                </div>
              </div>

              {/* Ingredients / BOM Table */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-xs flex items-center space-x-1.5">
                    <Layers className="w-4 h-4 text-orange-400" />
                    <span>Ingredientes y Materias Primas Requeridas</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="flex items-center space-x-1 px-3 py-1 bg-orange-500 hover:bg-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Insumo</span>
                  </button>
                </div>

                {formItems.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 bg-[#161822] rounded-xl">
                    No has agregado ingredientes a esta receta. Haz clic en "Agregar Insumo".
                  </div>
                ) : (
                  <div className="space-y-2">
                    {liveCostCalculations.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 gap-2 items-center bg-[#181b26] p-2.5 rounded-xl border border-slate-800"
                      >
                        {/* Supply Picker */}
                        <div className="col-span-4">
                          <select
                            value={item.supplyId}
                            onChange={(e) => handleUpdateItem(idx, 'supplyId', e.target.value)}
                            className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white"
                          >
                            {supplies.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.nombre} ({s.unidadMedida}) - ${Math.round(s.costoPromedio || s.costoUnitario)}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div className="col-span-2">
                          <input
                            type="number"
                            step="any"
                            min="0.0001"
                            value={item.cantidad}
                            onChange={(e) => handleUpdateItem(idx, 'cantidad', Number(e.target.value))}
                            placeholder="Cant"
                            className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white font-mono font-bold"
                          />
                        </div>

                        {/* Unit */}
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={item.unidadMedida}
                            onChange={(e) => handleUpdateItem(idx, 'unidadMedida', e.target.value)}
                            className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-orange-400 font-mono text-center font-bold"
                          />
                        </div>

                        {/* Waste % */}
                        <div className="col-span-2">
                          <input
                            type="number"
                            step="0.1"
                            value={item.porcentajeMerma}
                            onChange={(e) => handleUpdateItem(idx, 'porcentajeMerma', Number(e.target.value))}
                            placeholder="% Merma"
                            className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white font-mono"
                            title="Porcentaje de merma en preparación"
                          />
                        </div>

                        {/* Line Cost & Delete */}
                        <div className="col-span-2 flex items-center justify-between pl-2">
                          <span className="font-mono text-xs font-bold text-white">
                            ${Math.round(item.lineCost || 0).toLocaleString('es-CO')}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 hover:bg-slate-700 text-slate-400 hover:text-red-400 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">Instrucciones de Preparación / Cocina</label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Detalla los pasos de cocción, montaje y presentación..."
                  className="w-full bg-[#1b1e2a] border border-slate-700 rounded-xl p-3 text-white"
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
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 rounded-xl font-bold shadow-lg"
                >
                  Guardar Receta y Costeo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
