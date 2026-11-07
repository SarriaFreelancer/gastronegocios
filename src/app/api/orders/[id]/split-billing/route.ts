import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const orderId = Number(params.id);
    const body = await req.json();
    const { diners = [], liberarMesa = true, cajero = 'Mesero' } = body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        mesa: true,
        branch: true,
        restaurant: true,
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido / Comanda no encontrada' }, { status: 404 });
    }

    if (!Array.isArray(diners) || diners.length === 0) {
      return NextResponse.json({ error: 'Se requiere al menos un comensal para facturar' }, { status: 400 });
    }

    const isSplit = diners.length > 1;

    // 1. Eliminar facturas previas no consolidadas de esta orden si existieran
    await prisma.invoice.deleteMany({
      where: { orderId: order.id },
    });

    // 2. Crear las N Facturas correspondientes
    const createdInvoices = [];
    let sumEfectivo = 0;
    let sumDatafono = 0;
    let sumTransfer = 0;
    let sumPropinas = 0;
    let sumTotal = 0;

    for (let i = 0; i < diners.length; i++) {
      const d = diners[i];
      const dinerName = (d.nombre || `Comensal ${i + 1}`).trim();
      const subtotal = Number(d.subtotal) || 0;
      const propina = Number(d.propina) || 0;
      const total = Number(d.total) || subtotal + propina;
      const metodo = (d.metodoPago || 'Efectivo').trim();
      const items = Array.isArray(d.items) ? d.items : [];

      const invoiceCode = isSplit
        ? `FAC-${order.codigo}-${i + 1}`
        : `FAC-${order.codigo}`;

      const inv = await prisma.invoice.create({
        data: {
          numeroFactura: invoiceCode,
          orderId: order.id,
          cliente: `${dinerName} (${order.numeroMesa || 'Mesa'})`,
          telefono: order.telefono || null,
          tipo: order.tipo || 'mesa',
          numeroMesa: order.numeroMesa || order.mesa?.numero || null,
          subtotal,
          propina,
          costoEnvio: 0,
          total,
          metodoPago: metodo,
          estado: 'Pagada',
          itemsJson: JSON.stringify(items),
          esDividida: isSplit,
          dinerNombre: dinerName,
          dinerIndex: i + 1,
          totalDiners: diners.length,
          notas: isSplit ? `Cuenta dividida (${i + 1}/${diners.length}) para ${dinerName}` : 'Cuenta completa',
          cajero,
          branchId: order.branchId,
          restaurantId: order.restaurantId,
        },
      });

      createdInvoices.push(inv);

      // Agrupación contable por método de pago para el turno de caja
      sumTotal += total;
      sumPropinas += propina;
      const normMetodo = metodo.toLowerCase();
      if (normMetodo.includes('dat') || normMetodo.includes('tarjeta')) {
        sumDatafono += total;
      } else if (normMetodo.includes('nequi') || normMetodo.includes('davi') || normMetodo.includes('transf')) {
        sumTransfer += total;
      } else {
        sumEfectivo += total;
      }
    }

    // 3. Mantener 1 SOLA comanda operativa en cocina/administración, pero registrando la división
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        estado: 'Entregado',
        cuentaDividida: isSplit,
        numFacturas: diners.length,
        metodoPago: isSplit ? `Dividido (${diners.length} Facturas)` : (diners[0]?.metodoPago || order.metodoPago),
      },
    });

    // 4. Actualizar Turno de Caja Abierto (CashShift) si existe en la sede
    try {
      const activeShift = await prisma.cashShift.findFirst({
        where: {
          estado: 'Abierto',
          branchId: order.branchId || undefined,
          restaurantId: order.restaurantId || undefined,
        },
        orderBy: { id: 'desc' },
      });

      if (activeShift) {
        await prisma.cashShift.update({
          where: { id: activeShift.id },
          data: {
            ventasEfectivo: { increment: sumEfectivo },
            ventasDatafono: { increment: sumDatafono },
            ventasTransfer: { increment: sumTransfer },
            propinasTotal: { increment: sumPropinas },
            totalVentas: { increment: sumTotal },
          },
        });
      }
    } catch (e) {
      console.error('Error al actualizar turno de caja en split billing:', e);
    }

    // 5. Liberar mesa si se indicó
    if (liberarMesa && (order.mesaId || order.numeroMesa)) {
      await prisma.restaurantTable.updateMany({
        where: {
          OR: [
            ...(order.mesaId ? [{ id: order.mesaId }] : []),
            ...(order.numeroMesa ? [{ numero: order.numeroMesa }] : []),
          ],
        },
        data: {
          estado: 'Libre',
          solicitudCuenta: false,
          solicitudCuentaEn: null,
          metodoPagoCuenta: null,
          llamandoMesero: false,
          llamadoEn: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: isSplit
        ? `Se liquidó la mesa con 1 sola comanda y se emitieron ${diners.length} facturas individuales.`
        : 'Se liquidó la mesa y se emitió la factura correctamente.',
      order: updatedOrder,
      invoices: createdInvoices,
    });
  } catch (error) {
    console.error('Error in split billing:', error);
    return NextResponse.json({ error: 'Error al procesar la división de cuentas y facturas' }, { status: 500 });
  }
}
