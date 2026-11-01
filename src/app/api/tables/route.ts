import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateTableQRCode } from '@/lib/qrcode';

export async function GET() {
  try {
    const tables = await prisma.restaurantTable.findMany({
      include: {
        orders: {
          where: {
            estado: {
              notIn: ['Entregado', 'Cancelado'],
            },
          },
          include: {
            items: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { numero: 'asc' },
    });

    return NextResponse.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json({ error: 'Error al obtener mesas' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { numero, capacidad, ubicacion, notas } = await req.json();

    if (!numero) {
      return NextResponse.json({ error: 'El número de mesa es obligatorio' }, { status: 400 });
    }

    const exists = await prisma.restaurantTable.findUnique({
      where: { numero },
    });

    if (exists) {
      return NextResponse.json({ error: 'Ya existe una mesa con ese número o nombre' }, { status: 400 });
    }

    const table = await prisma.restaurantTable.create({
      data: {
        numero,
        capacidad: Number(capacidad) || 4,
        ubicacion: ubicacion || 'Salón Principal',
        notas: notas || null,
        estado: 'Libre',
      },
    });

    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear mesa' }, { status: 500 });
  }
}
