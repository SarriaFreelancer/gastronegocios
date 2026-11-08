import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recalculateAllRecipeCosts } from '@/lib/inventory-engine';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');
    const restaurantSlug = searchParams.get('restaurantSlug');
    const branchId = searchParams.get('branchId');
    const supplierId = searchParams.get('supplierId');
    const estado = searchParams.get('estado');

    let resolvedRestaurantId: number | null = restaurantId ? Number(restaurantId) : null;
    if (!resolvedRestaurantId && restaurantSlug) {
      const rest = await prisma.restaurant.findUnique({
        where: { slug: restaurantSlug },
        select: { id: true },
      });
      if (rest) resolvedRestaurantId = rest.id;
    }

    if (!resolvedRestaurantId) {
      return NextResponse.json({ error: 'restaurantId es obligatorio' }, { status: 400 });
    }

    const where: any = { restaurantId: resolvedRestaurantId };
    if (branchId && branchId !== 'all') where.branchId = Number(branchId);
    if (supplierId) where.supplierId = Number(supplierId);
    if (estado) where.estado = estado;

    const purchases = await prisma.purchase.findMany({
      where,
      include: {
        supplier: {
          select: { id: true, nombre: true, nit: true, contacto: true, telefono: true },
        },
        branch: {
          select: { id: true, nombre: true },
        },
        items: {
          include: {
            supply: {
              select: { id: true, codigoInterno: true, nombre: true, unidadMedida: true },
            },
          },
        },
      },
      orderBy: { fecha: 'desc' },
      take: 100,
    });

    const enriched = purchases.map((p) => ({
      ...p,
      totalNeto: p.total,
      impuestos: 0,
    }));

    return NextResponse.json(enriched);
  } catch (error: any) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      restaurantId,
      branchId,
      supplierId,
      numeroFactura,
      fecha,
      impuestos,
      observaciones,
      items, // array of { supplyId, cantidad, unidadMedida, costoUnitario, subtotal, lote, fechaVencimiento }
      usuarioNombre,
    } = body;

    const restId = Number(restaurantId);
    const supId = Number(supplierId);

    if (!restId || !supId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'restaurantId, supplierId e items son obligatorios' },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.findFirst({
      where: { id: supId, restaurantId: restId },
    });
    if (!supplier) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 });
    }

    let finalBranchId: number | null = branchId ? Number(branchId) : null;
    if (!finalBranchId) {
      const defaultBranch = await prisma.branch.findFirst({
        where: { restaurantId: restId, activo: true },
      });
      finalBranchId = defaultBranch?.id || null;
    }

    const purchaseDate = fecha ? new Date(fecha) : new Date();

    const result = await prisma.$transaction(async (tx) => {
      let totalNeto = 0;

      for (const item of items) {
        const qty = Number(item.cantidad) || 0;
        const unitCost = Number(item.costoUnitario) || 0;
        const itemSubtotal = item.subtotal !== undefined ? Number(item.subtotal) : qty * unitCost;
        totalNeto += itemSubtotal;
      }

      const totalTaxes = Number(impuestos) || 0;
      const totalGeneral = totalNeto + totalTaxes;

      // 1. Create Purchase
      const purchase = await tx.purchase.create({
        data: {
          restaurantId: restId,
          branchId: finalBranchId,
          supplierId: supId,
          numeroFactura: numeroFactura || `FAC-${Date.now().toString().slice(-6)}`,
          fecha: purchaseDate,
          total: totalGeneral,
          estado: 'Recibido',
          observaciones: observaciones || null,
          registradoPor: usuarioNombre || 'Administrador',
        },
      });

      // 2. Process each line item
      for (const item of items) {
        const sId = Number(item.supplyId);
        const qty = Number(item.cantidad) || 0;
        const unitCost = Number(item.costoUnitario) || 0;
        const itemSubtotal = item.subtotal !== undefined ? Number(item.subtotal) : qty * unitCost;
        const itemExpiry = item.fechaVencimiento ? new Date(item.fechaVencimiento) : null;

        await tx.purchaseItem.create({
          data: {
            purchaseId: purchase.id,
            supplyId: sId,
            cantidad: qty,
            unidad: item.unidadMedida || 'kg',
            precioUnitario: unitCost,
            subtotal: itemSubtotal,
            lote: item.lote || null,
            fechaVencimiento: itemExpiry,
          },
        });

        const supply = await tx.supply.findUnique({
          where: { id: sId },
        });

        if (!supply) {
          throw new Error(`Insumo ${sId} no encontrado`);
        }

        const stockAnterior = supply.stockActual;
        const stockResultante = stockAnterior + qty;

        // Weighted average cost formula (PPP)
        let nuevoCostoPromedio = supply.costoPromedio;
        if (stockResultante > 0) {
          const valorPrevio = Math.max(0, stockAnterior) * (supply.costoPromedio || supply.costoUnitario || 0);
          const valorNuevo = qty * unitCost;
          nuevoCostoPromedio = (valorPrevio + valorNuevo) / (Math.max(0, stockAnterior) + qty);
        } else {
          nuevoCostoPromedio = unitCost;
        }

        await tx.supply.update({
          where: { id: sId },
          data: {
            stockActual: stockResultante,
            costoUnitario: unitCost,
            costoPromedio: nuevoCostoPromedio,
            lote: item.lote || supply.lote,
            fechaVencimiento: itemExpiry || supply.fechaVencimiento,
            estado: stockResultante > 0 ? 'Activo' : 'Agotado',
          },
        });

        // Record Kardex movement
        await tx.inventoryMovement.create({
          data: {
            restaurantId: restId,
            branchId: finalBranchId,
            supplyId: sId,
            tipoMovimiento: 'ENTRADA_COMPRA',
            cantidad: qty,
            unidad: item.unidadMedida || supply.unidadMedida,
            costoUnitario: unitCost,
            costoTotal: itemSubtotal,
            stockAnterior,
            stockResultante,
            esNegativo: false,
            referencia: numeroFactura ? `Factura ${numeroFactura}` : `Compra #${purchase.id}`,
            motivo: `Ingreso de compra a proveedor: ${supplier.nombre}`,
            usuarioResponsable: usuarioNombre || 'Administrador',
          },
        });
      }

      return purchase;
    });

    recalculateAllRecipeCosts(restId).catch((err) =>
      console.error('Error background-recalculating recipes after purchase:', err)
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error recording purchase:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
