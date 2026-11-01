import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const soloPublicados = searchParams.get('publicados') === 'true';

    const where: any = {};
    if (soloPublicados) where.publicado = true;

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const averageRating =
      reviews.length > 0
        ? Number((reviews.reduce((acc, r) => acc + r.calificacion, 0) / reviews.length).toFixed(1))
        : 5.0;

    return NextResponse.json({
      reviews,
      total: reviews.length,
      averageRating,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener calificaciones' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { clienteNombre, calificacion, tipoVisita, mesaNumero, comentario, orderId } = await req.json();

    if (!clienteNombre || !comentario) {
      return NextResponse.json(
        { error: 'Tu nombre y comentario son obligatorios' },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        clienteNombre,
        calificacion: Number(calificacion) || 5,
        tipoVisita: tipoVisita || 'En Sitio / Mesa',
        mesaNumero: mesaNumero || null,
        comentario,
        orderId: orderId || null,
        publicado: true,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Error al registrar calificación' }, { status: 500 });
  }
}
