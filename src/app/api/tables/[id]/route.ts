import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const tableId = Number(params.id);
    const { 
      numero, 
      capacidad, 
      ubicacion, 
      estado, 
      notas, 
      action,
      llamandoMesero,
      solicitudCuenta,
      metodoPagoCuenta,
      metodoPago
    } = await req.json();

    const currentTable = await prisma.restaurantTable.findUnique({ where: { id: tableId } });
    if (!currentTable) {
      return NextResponse.json({ error: 'Mesa no encontrada' }, { status: 404 });
    }

    const data: any = {};
    if (numero !== undefined) data.numero = numero;
    if (capacidad !== undefined) data.capacidad = Number(capacidad);
    if (ubicacion !== undefined) data.ubicacion = ubicacion;
    if (estado !== undefined) data.estado = estado;
    if (notas !== undefined) data.notas = notas;

    if (llamandoMesero !== undefined) data.llamandoMesero = Boolean(llamandoMesero);
    if (solicitudCuenta !== undefined) data.solicitudCuenta = Boolean(solicitudCuenta);
    if (metodoPagoCuenta !== undefined) data.metodoPagoCuenta = metodoPagoCuenta;

    // Handle specific table actions
    if (action === 'llamar_mesero') {
      data.llamandoMesero = true;
      data.llamadoEn = new Date();
    } else if (action === 'atender_llamado') {
      data.llamandoMesero = false;
      data.llamadoEn = null;
    } else if (action === 'pedir_cuenta') {
      data.solicitudCuenta = true;
      data.solicitudCuentaEn = new Date();
      data.metodoPagoCuenta = metodoPago || metodoPagoCuenta || 'Efectivo';
    } else if (action === 'atender_cuenta') {
      data.solicitudCuenta = false;
      data.solicitudCuentaEn = null;
    } else if (action === 'liberar' || estado === 'Libre') {
      data.estado = 'Libre';
      data.llamandoMesero = false;
      data.llamadoEn = null;
      data.solicitudCuenta = false;
      data.solicitudCuentaEn = null;
      data.metodoPagoCuenta = null;
      // Mark active table orders as Entregado so table is completely clean
      await prisma.order.updateMany({
        where: {
          OR: [
            { mesaId: tableId },
            { numeroMesa: currentTable.numero },
          ],
          estado: { notIn: ['Entregado', 'Cancelado'] },
        },
        data: { estado: 'Entregado' },
      });
    }

    const updated = await prisma.restaurantTable.update({
      where: { id: tableId },
      data,
      include: {
        orders: {
          where: { estado: { notIn: ['Entregado', 'Cancelado'] } },
          include: { items: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar mesa' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.restaurantTable.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar mesa' }, { status: 500 });
  }
}
