import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let config = await prisma.restaurantConfig.findFirst();
    if (!config) {
      config = await prisma.restaurantConfig.create({
        data: {
          nombre: 'PUNTO G',
          eslogan: 'ANTOJOS QUE CONECTAN',
          telefonoWhatsapp: '3229088736',
          mensajeWhatsappDefault: '¡Hola! Quiero hacer un pedido por la web.',
          email: 'contacto@puntog.com',
          correoRemitente: 'pedidos@puntog.com',
          correoDestinatario: 'novedades@puntog.com',
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
          nombre: body.nombre || 'PUNTO G',
          eslogan: body.eslogan || 'ANTOJOS QUE CONECTAN',
          telefonoWhatsapp: body.telefonoWhatsapp || '3229088736',
          mensajeWhatsappDefault: body.mensajeWhatsappDefault || '¡Hola! Quiero hacer un pedido por la web.',
          email: body.email || 'contacto@puntog.com',
          correoRemitente: body.correoRemitente || 'pedidos@puntog.com',
          correoDestinatario: body.correoDestinatario || 'novedades@puntog.com',
          direccion: body.direccion || 'Calle 9 # 45-12, Barrio Granada, Cali',
          horario: body.horario || 'Lunes a Domingo: 12:00 m. a 11:30 p.m.',
          costoDomicilioBase: Number(body.costoDomicilioBase) || 5000,
          propinaSugeridaPct: Number(body.propinaSugeridaPct) || 10,
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
