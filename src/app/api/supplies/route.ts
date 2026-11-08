import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');
    const restaurantSlug = searchParams.get('restaurantSlug');
    const branchId = searchParams.get('branchId');
    const categoria = searchParams.get('categoria');
    const search = searchParams.get('search');
    const alert = searchParams.get('alert'); // low_stock, negative, expired, expiring

    let resolvedRestaurantId: number | null = restaurantId ? Number(restaurantId) : null;

    if (!resolvedRestaurantId && restaurantSlug) {
      const rest = await prisma.restaurant.findUnique({
        where: { slug: restaurantSlug },
        select: { id: true, diasAnticipacionVencimiento: true },
      });
      if (rest) resolvedRestaurantId = rest.id;
    }

    if (!resolvedRestaurantId) {
      return NextResponse.json({ error: 'restaurantId o restaurantSlug es obligatorio' }, { status: 400 });
    }

    const where: any = {
      restaurantId: resolvedRestaurantId,
    };

    if (branchId && branchId !== 'all') {
      where.branchId = Number(branchId);
    }

    if (categoria && categoria !== 'todas') {
      where.categoria = categoria;
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search } },
        { codigoInterno: { contains: search } },
        { codigoBarras: { contains: search } },
      ];
    }

    const supplies = await prisma.supply.findMany({
      where,
      include: {
        proveedor: {
          select: { id: true, nombre: true, telefono: true },
        },
        branch: {
          select: { id: true, nombre: true },
        },
        _count: {
          select: { recipeItems: true, movements: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });

    // Filtros de alertas en memoria
    let filtered = supplies;
    if (alert === 'low_stock') {
      filtered = supplies.filter(s => s.stockActual <= s.stockMinimo && s.stockActual > 0);
    } else if (alert === 'negative') {
      filtered = supplies.filter(s => s.stockActual < 0);
    } else if (alert === 'agotado') {
      filtered = supplies.filter(s => s.stockActual <= 0);
    } else if (alert === 'expiring') {
      const now = new Date();
      const limitDays = 7;
      const targetDate = new Date(now.getTime() + limitDays * 24 * 60 * 60 * 1000);
      filtered = supplies.filter(s => s.fechaVencimiento && new Date(s.fechaVencimiento) <= targetDate && new Date(s.fechaVencimiento) >= now);
    } else if (alert === 'expired') {
      const now = new Date();
      filtered = supplies.filter(s => s.fechaVencimiento && new Date(s.fechaVencimiento) < now);
    }

    // Métricas de inventario valorizado
    const valorTotalInventario = supplies.reduce((sum, s) => sum + (Math.max(0, s.stockActual) * (s.costoUnitario || 0)), 0);
    const totalAgotados = supplies.filter(s => s.stockActual <= 0).length;
    const totalNegativos = supplies.filter(s => s.stockActual < 0).length;
    const totalStockBajo = supplies.filter(s => s.stockActual > 0 && s.stockActual <= s.stockMinimo).length;

    return NextResponse.json({
      supplies: filtered,
      metrics: {
        totalItems: supplies.length,
        valorTotalInventario: Math.round(valorTotalInventario * 100) / 100,
        totalAgotados,
        totalNegativos,
        totalStockBajo,
      },
    });
  } catch (error) {
    console.error('Error fetching supplies:', error);
    return NextResponse.json({ error: 'Error al consultar materias primas' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      codigoInterno,
      codigoBarras,
      nombre,
      descripcion,
      categoria = 'General',
      unidadMedida = 'g',
      unidadCompra = 'kg',
      factorConversion = 1.0,
      stockInicial = 0,
      stockMinimo = 0,
      stockMaximo = 0,
      costoUnitario = 0,
      costoPromedio = 0,
      proveedorId,
      restaurantId,
      restaurantSlug,
      branchId,
      fechaVencimiento,
      lote,
      observaciones,
      usuarioResponsable = 'Admin',
    } = body;

    let resolvedRestaurantId: number | null = restaurantId ? Number(restaurantId) : null;
    if (!resolvedRestaurantId && restaurantSlug) {
      const rest = await prisma.restaurant.findUnique({ where: { slug: restaurantSlug } });
      if (rest) resolvedRestaurantId = rest.id;
    }

    if (!resolvedRestaurantId) {
      return NextResponse.json({ error: 'restaurantId o restaurantSlug es obligatorio' }, { status: 400 });
    }

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre de la materia prima es obligatorio' }, { status: 400 });
    }

    // Generar código interno automático si no se provee (e.g. MP-1001)
    let finalCodigo = codigoInterno?.trim();
    if (!finalCodigo) {
      const count = await prisma.supply.count({ where: { restaurantId: resolvedRestaurantId } });
      finalCodigo = `MP-${(1001 + count).toString()}`;
    }

    const initialStockNum = Number(stockInicial) || 0;
    const unitCostNum = Number(costoUnitario) || 0;

    const newSupply = await prisma.supply.create({
      data: {
        codigoInterno: finalCodigo,
        codigoBarras: codigoBarras ? String(codigoBarras).trim() : null,
        nombre: nombre.trim(),
        descripcion: descripcion || null,
        categoria: categoria || 'General',
        unidadMedida: (unidadMedida || 'g').toLowerCase().trim(),
        unidadCompra: unidadCompra ? (unidadCompra).toLowerCase().trim() : null,
        factorConversion: Number(factorConversion) || 1.0,
        stockActual: initialStockNum,
        stockMinimo: Number(stockMinimo) || 0,
        stockMaximo: Number(stockMaximo) || 0,
        costoUnitario: unitCostNum,
        costoPromedio: Number(costoPromedio) || unitCostNum,
        proveedorId: proveedorId ? Number(proveedorId) : null,
        restaurantId: resolvedRestaurantId,
        branchId: branchId ? Number(branchId) : null,
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
        lote: lote ? String(lote).trim() : null,
        estado: initialStockNum <= 0 ? 'Agotado' : 'Activo',
        observaciones: observaciones || null,
      },
    });

    // Si se inicializó con stock, crear el movimiento inaugural en el Kardex
    if (initialStockNum > 0) {
      await prisma.inventoryMovement.create({
        data: {
          supplyId: newSupply.id,
          tipoMovimiento: 'AJUSTE_POSITIVO',
          cantidad: initialStockNum,
          unidad: newSupply.unidadMedida,
          stockAnterior: 0,
          stockResultante: initialStockNum,
          costoUnitario: unitCostNum,
          costoTotal: initialStockNum * unitCostNum,
          esNegativo: false,
          motivo: 'Inventario inicial registrado',
          referencia: 'INVENTARIO-INICIAL',
          usuarioResponsable,
          restaurantId: resolvedRestaurantId,
          branchId: newSupply.branchId,
        },
      });
    }

    return NextResponse.json(newSupply, { status: 201 });
  } catch (error: any) {
    console.error('Error creating supply:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe una materia prima con este código en el restaurante' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Error al registrar materia prima' }, { status: 500 });
  }
}
