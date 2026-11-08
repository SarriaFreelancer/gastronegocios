import { prisma } from './prisma';

/**
 * Tabla de conversiones dimensionales universales para cocina y gastronomía.
 */
const CONVERSION_FACTORS: Record<string, number> = {
  // Masa (Base: gramo)
  mg: 0.001,
  g: 1,
  kg: 1000,
  lb: 453.592,
  oz: 28.3495,

  // Volumen (Base: mililitro)
  ml: 1,
  l: 1000,
  cm3: 1,
  oz_fl: 29.5735,

  // Conteo / Unidades
  und: 1,
  unidad: 1,
  porc: 1,
  porcion: 1,
  paq: 1,
  caja: 1,
};

export function areUnitsCompatible(fromUnit: string, toUnit: string): boolean {
  const u1 = fromUnit.toLowerCase().trim();
  const u2 = toUnit.toLowerCase().trim();

  if (u1 === u2) return true;

  const isMass1 = ['mg', 'g', 'kg', 'lb', 'oz'].includes(u1);
  const isMass2 = ['mg', 'g', 'kg', 'lb', 'oz'].includes(u2);
  if (isMass1 && isMass2) return true;

  const isVol1 = ['ml', 'l', 'cm3', 'oz_fl'].includes(u1);
  const isVol2 = ['ml', 'l', 'cm3', 'oz_fl'].includes(u2);
  if (isVol1 && isVol2) return true;

  const isCount1 = ['und', 'unidad', 'porc', 'porcion', 'paq', 'caja'].includes(u1);
  const isCount2 = ['und', 'unidad', 'porc', 'porcion', 'paq', 'caja'].includes(u2);
  if (isCount1 && isCount2) return true;

  return false;
}

export function convertQuantity(
  quantity: number,
  fromUnit: string,
  toUnit: string,
  customFactor?: number
): number {
  const u1 = fromUnit.toLowerCase().trim();
  const u2 = toUnit.toLowerCase().trim();

  if (u1 === u2) return quantity;

  if (customFactor && customFactor > 0) {
    return quantity * customFactor;
  }

  const factor1 = CONVERSION_FACTORS[u1];
  const factor2 = CONVERSION_FACTORS[u2];

  if (factor1 !== undefined && factor2 !== undefined) {
    const baseValue = quantity * factor1;
    return baseValue / factor2;
  }

  return quantity;
}

/**
 * Calcula el costo unitario por porción y costo total de una receta técnica (BOM).
 */
export async function recalculateAllRecipeCosts(restaurantId: number): Promise<number> {
  const recipes = await prisma.recipe.findMany({
    where: { restaurantId, activo: true },
    include: {
      items: {
        include: { supply: true },
      },
      product: true,
    },
  });

  let updatedCount = 0;

  for (const recipe of recipes) {
    let totalCost = 0;

    for (const item of recipe.items) {
      const supply = item.supply;
      if (!supply) continue;

      const costBasis = supply.costoPromedio > 0 ? supply.costoPromedio : supply.costoUnitario;
      const convertedQty = convertQuantity(
        item.cantidad,
        item.unidad,
        supply.unidadMedida,
        supply.factorConversion
      );

      const itemCost = convertedQty * costBasis;
      totalCost += itemCost;

      // Update recipe item subtotal
      await prisma.recipeItem.update({
        where: { id: item.id },
        data: {
          costoUnitarioCalculado: costBasis,
          costoSubtotal: itemCost,
        },
      });
    }

    const portions = recipe.porciones > 0 ? recipe.porciones : 1;
    const costPerPortion = totalCost / portions;
    const productPrice = recipe.product?.precio || 0;
    const grossProfit = productPrice - costPerPortion;
    const margin = productPrice > 0 ? (grossProfit / productPrice) * 100 : 0;

    await prisma.recipe.update({
      where: { id: recipe.id },
      data: {
        costoTotal: totalCost,
        costoPorcion: costPerPortion,
        margenUtilidad: Math.round(margin * 10) / 10,
      },
    });

    updatedCount++;
  }

  return updatedCount;
}

export interface InventoryDeductionResult {
  success: boolean;
  blocked: boolean;
  missingSupplies?: Array<{
    supplyId: number;
    nombre: string;
    requerido: number;
    disponible: number;
    faltante: number;
    unidad: string;
  }>;
  movementsRecorded: number;
  message?: string;
}

/**
 * Descarga atómica de materias primas e insumos por venta de pedido en POS.
 */
export async function deductRecipeStockOnOrder(
  orderId: number,
  orderNumber: string,
  restaurantId: number,
  branchId: number | null,
  items: Array<{ productId?: number | null; id?: number | null; quantity: number }>,
  userId?: number | null,
  userName?: string
): Promise<InventoryDeductionResult> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { politicaStockNegativo: true },
  });

  const politica = restaurant?.politicaStockNegativo || 'BLOQUEAR';

  // 1. Get recipes for sold products
  const productIds = items
    .map((i) => i.productId || i.id)
    .filter((id): id is number => typeof id === 'number' && id > 0);

  if (productIds.length === 0) {
    return { success: true, blocked: false, movementsRecorded: 0 };
  }

  const recipes = await prisma.recipe.findMany({
    where: {
      productId: { in: productIds },
      restaurantId,
      activo: true,
    },
    include: {
      items: {
        include: { supply: true },
      },
    },
  });

  if (recipes.length === 0) {
    return { success: true, blocked: false, movementsRecorded: 0 };
  }

  const recipeMap = new Map(recipes.map((r) => [r.productId, r]));

  // Calculate required totals per supply
  const requiredBySupply = new Map<
    number,
    { supply: any; requiredQty: number; unidad: string }
  >();

  for (const soldItem of items) {
    const pId = soldItem.productId || soldItem.id;
    if (!pId) continue;
    const recipe = recipeMap.get(pId);
    if (!recipe) continue;

    const portionsMultiplier = (Number(soldItem.quantity) || 1) / (recipe.porciones || 1);

    for (const rItem of recipe.items) {
      const supply = rItem.supply;
      if (!supply) continue;

      const convertedQty = convertQuantity(
        rItem.cantidad * portionsMultiplier,
        rItem.unidad,
        supply.unidadMedida,
        supply.factorConversion
      );

      const existing = requiredBySupply.get(supply.id);
      if (existing) {
        existing.requiredQty += convertedQty;
      } else {
        requiredBySupply.set(supply.id, {
          supply,
          requiredQty: convertedQty,
          unidad: supply.unidadMedida,
        });
      }
    }
  }

  // Check policy if stock is insufficient
  if (politica === 'BLOQUEAR') {
    const missing: any[] = [];
    for (const [sId, req] of Array.from(requiredBySupply.entries())) {
      if (req.supply.stockActual < req.requiredQty) {
        missing.push({
          supplyId: sId,
          nombre: req.supply.nombre,
          requerido: req.requiredQty,
          disponible: req.supply.stockActual,
          faltante: req.requiredQty - req.supply.stockActual,
          unidad: req.unidad,
        });
      }
    }

    if (missing.length > 0) {
      return {
        success: false,
        blocked: true,
        missingSupplies: missing,
        movementsRecorded: 0,
        message: `Venta bloqueada por inventario insuficiente en ${missing.length} materia(s) prima(s).`,
      };
    }
  }

  // 2. Perform atomic stock deduction & Kardex entry
  let movementsCount = 0;
  await prisma.$transaction(async (tx) => {
    for (const [supplyId, req] of Array.from(requiredBySupply.entries())) {
      const currentSupply = await tx.supply.findUnique({
        where: { id: supplyId },
      });

      if (!currentSupply) continue;

      const stockAnterior = currentSupply.stockActual;
      const stockResultante = stockAnterior - req.requiredQty;
      const isNegative = stockResultante < 0;

      // Update Supply
      await tx.supply.update({
        where: { id: supplyId },
        data: {
          stockActual: stockResultante,
          estado: stockResultante <= 0 ? 'Agotado' : 'Activo',
        },
      });

      const costBasis = currentSupply.costoPromedio > 0 ? currentSupply.costoPromedio : currentSupply.costoUnitario;

      // Record Kardex
      await tx.inventoryMovement.create({
        data: {
          supplyId,
          restaurantId,
          branchId,
          tipoMovimiento: 'SALIDA_VENTA',
          cantidad: req.requiredQty,
          unidad: req.unidad,
          stockAnterior,
          stockResultante,
          costoUnitario: costBasis,
          costoTotal: req.requiredQty * costBasis,
          esNegativo: isNegative,
          autorizadoPor: isNegative ? (userName || 'Venta Sin Stock') : null,
          referencia: `ORD-${orderNumber}`,
          motivo: `Descarga automática por pedido #${orderNumber}`,
          usuarioResponsable: userName || 'POS',
        },
      });

      movementsCount++;
    }
  });

  return {
    success: true,
    blocked: false,
    movementsRecorded: movementsCount,
  };
}

/**
 * Restaura el inventario al cancelar o anular una comanda / pedido en el POS.
 */
export async function restoreRecipeStockOnOrderCancellation(
  orderId: number,
  orderNumber: string,
  restaurantId: number,
  branchId: number | null,
  userName?: string
): Promise<number> {
  const movements = await prisma.inventoryMovement.findMany({
    where: {
      referencia: `ORD-${orderNumber}`,
      tipoMovimiento: 'SALIDA_VENTA',
      restaurantId,
    },
    include: { supply: true },
  });

  if (movements.length === 0) return 0;

  let restoredCount = 0;

  await prisma.$transaction(async (tx) => {
    for (const mov of movements) {
      const supply = await tx.supply.findUnique({
        where: { id: mov.supplyId },
      });
      if (!supply) continue;

      const stockAnterior = supply.stockActual;
      const stockResultante = stockAnterior + mov.cantidad;

      await tx.supply.update({
        where: { id: supply.id },
        data: {
          stockActual: stockResultante,
          estado: stockResultante > 0 ? 'Activo' : 'Agotado',
        },
      });

      await tx.inventoryMovement.create({
        data: {
          supplyId: supply.id,
          restaurantId,
          branchId,
          tipoMovimiento: 'DEVOLUCION',
          cantidad: mov.cantidad,
          unidad: mov.unidad,
          stockAnterior,
          stockResultante,
          costoUnitario: mov.costoUnitario,
          costoTotal: mov.costoTotal,
          esNegativo: false,
          referencia: `ANUL-${orderNumber}`,
          motivo: `Restauración por anulación/cancelación de comanda #${orderNumber}`,
          usuarioResponsable: userName || 'POS',
        },
      });

      restoredCount++;
    }
  });

  return restoredCount;
}
