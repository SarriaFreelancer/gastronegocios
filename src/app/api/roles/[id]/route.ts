import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { STANDARD_ROLES } from '@/lib/constants-roles';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, nombre: true, email: true, rol: true },
        },
      },
    });

    if (!role) {
      return NextResponse.json({ error: 'Rol no encontrado' }, { status: 404 });
    }

    let pObj = {};
    try {
      pObj = JSON.parse(role.permisos);
    } catch {}

    return NextResponse.json({
      ...role,
      permisos: pObj,
      esSistema: STANDARD_ROLES.some((s: any) => s.nombre === role.nombre),
    });
  } catch (error: any) {
    console.error('Error fetching role:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await req.json();

    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      return NextResponse.json({ error: 'Rol no encontrado' }, { status: 404 });
    }

    const updated = await prisma.role.update({
      where: { id },
      data: {
        nombre: body.nombre !== undefined ? body.nombre : undefined,
        descripcion: body.descripcion !== undefined ? body.descripcion : undefined,
        permisos: body.permisos !== undefined ? (typeof body.permisos === 'string' ? body.permisos : JSON.stringify(body.permisos)) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating role:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: { select: { users: true } },
      },
    });

    if (!role) {
      return NextResponse.json({ error: 'Rol no encontrado' }, { status: 404 });
    }

    const isSystem = STANDARD_ROLES.some((s: any) => s.nombre === role.nombre);
    if (isSystem) {
      return NextResponse.json(
        { error: 'No se pueden eliminar los roles predeterminados del sistema.' },
        { status: 400 }
      );
    }

    if (role._count.users > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar el rol porque tiene ${role._count.users} usuario(s) asignado(s).` },
        { status: 400 }
      );
    }

    await prisma.role.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Rol eliminado correctamente' });
  } catch (error: any) {
    console.error('Error deleting role:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
