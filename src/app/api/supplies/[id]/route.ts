import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const supplyId = Number(params.id);
    if (isNaN(supplyId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const supply = await prisma.supply.findUnique({
      where: { id: supplyId },
      include: {
        proveedor: true,
        branch: true,
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
        recipeItems: {
          include: {
            recipe: {
              include: {
                product: {
                  select: { id: true, nombre: true, precio: true },
                },
              },
            },
          },
        },
      },
    });

    if (!supply) {
      return NextResponse.json({ error: 'Materia prima no encontrada' }, { status: 404 });
    }

    return NextResponse.json(supply);
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar materia prima' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const supplyId = Number(params.id);
    if (isNaN(supplyId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json();
    const {
      codigoInterno,
      codigoBarras,
      nombre,
      descripcion,
      categoria,
      unidadMedida,
      unidadCompra,
      factorConversion,
      stockMinimo,
      stockMaximo,
      costoUnitario,
      proveedorId,
      branchId,
      fechaVencimiento,
      lote,
      estado,
      observaciones,
    } = body;

    const updated = await prisma.supply.update({
      where: { id: supplyId },
      data: {
        ...(codigoInterno !== undefined && { codigoInterno: codigoInterno.trim() }),
        ...(codigoBarras !== undefined && { codigoBarras: codigoBarras ? String(codigoBarras).trim() : null }),
        ...(nombre !== undefined && { nombre: nombre.trim() }),
        ...(descripcion !== undefined && { descripcion }),
        ...(categoria !== undefined && { categoria }),
        ...(unidadMedida !== undefined && { unidadMedida: (unidadMedida || 'g').toLowerCase().trim() }),
        ...(unidadCompra !== undefined && { unidadCompra: unidadCompra ? unidadCompra.toLowerCase().trim() : null }),
        ...(factorConversion !== undefined && { factorConversion: Number(factorConversion) }),
        ...(stockMinimo !== undefined && { stockMinimo: Number(stockMinimo) }),
        ...(stockMaximo !== undefined && { stockMaximo: Number(stockMaximo) }),
        ...(costoUnitario !== undefined && { costoUnitario: Number(costoUnitario) }),
        ...(proveedorId !== undefined && { proveedorId: proveedorId ? Number(proveedorId) : null }),
        ...(branchId !== undefined && { branchId: branchId ? Number(branchId) : null }),
        ...(fechaVencimiento !== undefined && { fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null }),
        ...(lote !== undefined && { lote: lote ? String(lote).trim() : null }),
        ...(estado !== undefined && { estado }),
        ...(observaciones !== undefined && { observaciones }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating supply:', error);
    return NextResponse.json({ error: 'Error al actualizar materia prima' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const supplyId = Number(params.id);
    if (isNaN(supplyId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Validar si está en uso por alguna receta
    const recipeCount = await prisma.recipeItem.count({ where: { supplyId } });
    if (recipeCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar la materia prima porque se utiliza en ${recipeCount} receta(s). Retire el ingrediente de las recetas primero.` },
        { status: 409 }
      );
    }

    await prisma.supply.delete({ where: { id: supplyId } });
    return NextResponse.json({ success: true, message: 'Materia prima eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting supply:', error);
    return NextResponse.json({ error: 'Error al eliminar materia prima' }, { status: 500 });
  }
}
