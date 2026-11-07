import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');
    const restaurantSlug = searchParams.get('restaurantSlug');

    if (restaurantId && restaurantId !== 'all') {
      const rest = await prisma.restaurant.findUnique({
        where: { id: Number(restaurantId) },
      });
      if (rest) {
        return NextResponse.json({
          id: rest.id,
          restaurantId: rest.id,
          nombre: rest.nombre,
          eslogan: rest.eslogan || '',
          telefonoWhatsapp: rest.telefonoWhatsapp || '',
          mensajeWhatsappDefault: rest.mensajeWhatsappDefault || '¡Hola! Quiero hacer un pedido por la web.',
          email: rest.email || '',
          correoRemitente: rest.correoRemitente || '',
          correoDestinatario: rest.correoDestinatario || '',
          direccion: rest.direccionCentral || '',
          horario: rest.horarioAtencion || '',
          costoDomicilioBase: rest.costoDomicilioBase || 5000,
          propinaSugeridaPct: rest.propinaSugeridaPct || 10,
        });
      }
    } else if (restaurantSlug) {
      const rest = await prisma.restaurant.findUnique({
        where: { slug: restaurantSlug },
      });
      if (rest) {
        return NextResponse.json({
          id: rest.id,
          restaurantId: rest.id,
          nombre: rest.nombre,
          eslogan: rest.eslogan || '',
          telefonoWhatsapp: rest.telefonoWhatsapp || '',
          mensajeWhatsappDefault: rest.mensajeWhatsappDefault || '¡Hola! Quiero hacer un pedido por la web.',
          email: rest.email || '',
          correoRemitente: rest.correoRemitente || '',
          correoDestinatario: rest.correoDestinatario || '',
          direccion: rest.direccionCentral || '',
          horario: rest.horarioAtencion || '',
          costoDomicilioBase: rest.costoDomicilioBase || 5000,
          propinaSugeridaPct: rest.propinaSugeridaPct || 10,
        });
      }
    }

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

    if (body.restaurantId && body.restaurantId !== 'all') {
      const targetId = Number(body.restaurantId);
      const updatedRest = await prisma.restaurant.update({
        where: { id: targetId },
        data: {
          ...(body.nombre !== undefined ? { nombre: body.nombre } : {}),
          ...(body.eslogan !== undefined ? { eslogan: body.eslogan } : {}),
          ...(body.telefonoWhatsapp !== undefined ? { telefonoWhatsapp: body.telefonoWhatsapp } : {}),
          ...(body.mensajeWhatsappDefault !== undefined ? { mensajeWhatsappDefault: body.mensajeWhatsappDefault } : {}),
          ...(body.email !== undefined ? { email: body.email } : {}),
          ...(body.correoRemitente !== undefined ? { correoRemitente: body.correoRemitente } : {}),
          ...(body.correoDestinatario !== undefined ? { correoDestinatario: body.correoDestinatario } : {}),
          ...(body.direccion !== undefined ? { direccionCentral: body.direccion } : {}),
          ...(body.horario !== undefined ? { horarioAtencion: body.horario } : {}),
          ...(body.costoDomicilioBase !== undefined ? { costoDomicilioBase: Number(body.costoDomicilioBase) } : {}),
          ...(body.propinaSugeridaPct !== undefined ? { propinaSugeridaPct: Number(body.propinaSugeridaPct) } : {}),
        },
      });
      return NextResponse.json(updatedRest);
    }

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
