import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        purchases: {
          orderBy: { fecha: 'desc' },
          take: 20,
        },
      },
    });

    if (!supplier) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 });
    }

    return NextResponse.json(supplier);
  } catch (error: any) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await req.json();

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        nombre: body.nombre,
        nit: body.nit !== undefined ? body.nit : body.nitOIdentificacion,
        contacto: body.contacto,
        telefono: body.telefono,
        email: body.email,
        direccion: body.direccion,
        ciudad: body.ciudad,
        categoria: body.categoria,
        activo: body.activo !== undefined ? Boolean(body.activo) : undefined,
      },
    });

    return NextResponse.json(supplier);
  } catch (error: any) {
    console.error('Error updating supplier:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);

    const purchaseCount = await prisma.purchase.count({
      where: { supplierId: id },
    });

    if (purchaseCount > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un proveedor con compras asociadas. Puedes desactivarlo.' },
        { status: 400 }
      );
    }

    await prisma.supplier.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Proveedor eliminado correctamente' });
  } catch (error: any) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
