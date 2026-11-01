import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { nombre, email, password, rol, estado } = await req.json();

    const data: any = {
      nombre,
      email: email?.trim().toLowerCase(),
      rol,
      estado,
    };
    if (password) data.password = password;

    const updated = await prisma.user.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        estado: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 });
  }
}
