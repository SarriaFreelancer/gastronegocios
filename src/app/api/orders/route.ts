import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const desde = searchParams.get('desde');
    const hasta = searchParams.get('hasta');
    const tipo = searchParams.get('tipo');
    const estado = searchParams.get('estado');
    const mesaId = searchParams.get('mesaId');
    const search = searchParams.get('search');

    const where: any = {};

    // Date range filter
    if (desde || hasta) {
      where.createdAt = {};
      if (desde) {
        const parts = desde.split('-').map(Number);
        if (parts.length === 3) {
          const startDate = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
          where.createdAt.gte = startDate;
        } else {
          const d = new Date(desde);
          d.setHours(0, 0, 0, 0);
          where.createdAt.gte = d;
        }
      }
      if (hasta) {
        const parts = hasta.split('-').map(Number);
        if (parts.length === 3) {
          const endDate = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999);
          where.createdAt.lte = endDate;
        } else {
          const d = new Date(hasta);
          d.setHours(23, 59, 59, 999);
          where.createdAt.lte = d;
        }
      }
    }

    // Tipo filter (domicilio, recoger, mesa)
    if (tipo && tipo !== 'todos') {
      where.tipo = tipo;
    }

    // Estado filter
    const soloCocina = searchParams.get('cocina') === 'true';
    if (soloCocina) {
      where.estado = { in: ['Pendiente', 'En Preparación', 'Listo', 'Despachado'] };
    } else if (estado && estado !== 'todos') {
      where.estado = estado;
    }

    // Table filter
    if (mesaId && mesaId !== 'todas') {
      const isNum = !isNaN(Number(mesaId));
      where.OR = [
        ...(isNum ? [{ mesaId: Number(mesaId) }] : []),
        { numeroMesa: mesaId },
      ];
    }

    // Search query
    if (search) {
      where.OR = [
        { codigo: { contains: search } },
        { cliente: { contains: search } },
        { telefono: { contains: search } },
        { direccion: { contains: search } },
        { numeroMesa: { contains: search } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        mesa: {
          select: { id: true, numero: true, ubicacion: true },
        },
      },
      orderBy: { createdAt: soloCocina ? 'asc' : 'desc' },
    });

    // Calculate aggregated metrics for the filtered range
    const totalVentas = orders.reduce((sum, o) => sum + o.total, 0);
    const totalPropinas = orders.reduce((sum, o) => sum + o.propina, 0);
    const totalPedidos = orders.length;
    const ticketPromedio = totalPedidos > 0 ? Math.round(totalVentas / totalPedidos) : 0;

    return NextResponse.json({
      orders,
      metrics: {
        totalVentas,
        totalPropinas,
        totalPedidos,
        ticketPromedio,
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      cliente,
      telefono,
      tipo = 'domicilio',
      mesaId,
      numeroMesa,
      direccion,
      barrio,
      subtotal = 0,
      propina = 0,
      costoEnvio = 0,
      total = 0,
      metodoPago = 'Efectivo',
      notasCliente,
      repartidor,
      repartidorTel,
      items = [],
    } = body;

    if (!cliente || !telefono || items.length === 0) {
      return NextResponse.json(
        { error: 'Cliente, teléfono y productos son obligatorios' },
        { status: 400 }
      );
    }

    // Generate unique code like PG-2041
    const count = await prisma.order.count();
    const codigo = `PG-${(1000 + count + 1).toString()}`;

    // If table order, find table id or update table state to Ocupada
    let resolvedMesaId: number | null = mesaId && !isNaN(Number(mesaId)) ? Number(mesaId) : null;
    let resolvedNumeroMesa = numeroMesa || null;

    if (tipo === 'mesa' && numeroMesa && !resolvedMesaId) {
      const foundTable = await prisma.restaurantTable.findUnique({
        where: { numero: numeroMesa },
      });
      if (foundTable) {
        resolvedMesaId = foundTable.id;
        resolvedNumeroMesa = foundTable.numero;
      }
    }

    const newOrder = await prisma.order.create({
      data: {
        codigo,
        cliente,
        telefono,
        tipo,
        mesaId: resolvedMesaId,
        numeroMesa: resolvedNumeroMesa,
        direccion: tipo === 'domicilio' ? direccion : null,
        barrio: tipo === 'domicilio' ? barrio : null,
        subtotal: Number(subtotal),
        propina: Number(propina),
        costoEnvio: tipo === 'domicilio' ? Number(costoEnvio) : 0,
        total: Number(total),
        estado: 'Pendiente',
        metodoPago,
        notasCliente: notasCliente || null,
        repartidor: repartidor || null,
        repartidorTel: repartidorTel || null,
        items: {
          create: items.map((i: any) => ({
            nombre: i.nombre,
            precio: Number(i.precio),
            cantidad: Number(i.cantidad) || 1,
            notas: i.notas || null,
            adicionales: i.adicionales ? (typeof i.adicionales === 'string' ? i.adicionales : JSON.stringify(i.adicionales)) : null,
          })),
        },
      },
      include: {
        items: true,
        mesa: true,
      },
    });

    // Mark table as Ocupada if it was a table order
    if (resolvedMesaId) {
      await prisma.restaurantTable.update({
        where: { id: resolvedMesaId },
        data: { estado: 'Ocupada' },
      });
    }

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Error al registrar pedido' }, { status: 500 });
  }
}
