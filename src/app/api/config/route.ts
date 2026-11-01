import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let config = await prisma.restaurantConfig.findFirst();
    if (!config) {
      config = await prisma.restaurantConfig.create({
        data: {
          id: 'config-default',
          nombre: 'PUNTO G',
          eslogan: 'ANTOJOS QUE CONECTAN',
          telefonoWhatsapp: '3229088736',
          direccion: 'Calle 9 # 45-12, Barrio Granada, Cali',
          horario: 'Lunes a Domingo: 12:00 m. a 11:30 p.m.',
          costoDomicilioBase: 5000,
          propinaSugeridaPct: 10,
        },
      });
    }
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar configuración' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    let config = await prisma.restaurantConfig.findFirst();

    if (!config) {
      config = await prisma.restaurantConfig.create({
        data: {
          id: 'config-default',
          ...body,
        },
      });
    } else {
      config = await prisma.restaurantConfig.update({
        where: { id: config.id },
        data: {
          ...body,
          costoDomicilioBase: body.costoDomicilioBase ? Number(body.costoDomicilioBase) : undefined,
          propinaSugeridaPct: body.propinaSugeridaPct ? Number(body.propinaSugeridaPct) : undefined,
        },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar configuración' }, { status: 500 });
  }
}
