import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { mesa, action, metodoPago } = await req.json();

    if (!mesa) {
      return NextResponse.json({ error: 'Número o identificador de mesa requerido' }, { status: 400 });
    }

    const mesaStr = String(mesa).trim();
    const mesaNum = !isNaN(Number(mesaStr)) ? Number(mesaStr) : null;

    // Buscar la mesa por ID, por número exacto, o por "Mesa X"
    let table = null;
    if (mesaNum) {
      table = await prisma.restaurantTable.findUnique({ where: { id: mesaNum } });
    }
    if (!table) {
      table = await prisma.restaurantTable.findUnique({ where: { numero: mesaStr } });
    }
    if (!table) {
      table = await prisma.restaurantTable.findFirst({
        where: {
          OR: [
            { numero: { equals: `Mesa ${mesaStr}` } },
            { numero: { contains: mesaStr } },
          ],
        },
      });
    }

    if (!table) {
      return NextResponse.json({ error: `Mesa "${mesaStr}" no encontrada` }, { status: 404 });
    }

    const data: any = {};
    if (action === 'llamar_mesero') {
      data.llamandoMesero = true;
      data.llamadoEn = new Date();
      // Si la mesa estaba libre, marcarla como Ocupada porque hay un cliente en ella
      if (table.estado === 'Libre') {
        data.estado = 'Ocupada';
      }
    } else if (action === 'pedir_cuenta') {
      data.solicitudCuenta = true;
      data.solicitudCuentaEn = new Date();
      data.metodoPagoCuenta = metodoPago || 'Efectivo';
      if (table.estado === 'Libre') {
        data.estado = 'Ocupada';
      }
    } else if (action === 'atender_llamado') {
      data.llamandoMesero = false;
      data.llamadoEn = null;
    } else if (action === 'atender_cuenta') {
      data.solicitudCuenta = false;
      data.solicitudCuentaEn = null;
    }

    const updated = await prisma.restaurantTable.update({
      where: { id: table.id },
      data,
    });

    return NextResponse.json({ success: true, table: updated });
  } catch (error) {
    console.error('Error in tables service:', error);
    return NextResponse.json({ error: 'Error al procesar solicitud de mesa' }, { status: 500 });
  }
}
