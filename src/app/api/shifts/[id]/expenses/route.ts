import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const shiftId = Number(params.id);
    const body = await req.json();
    const { descripcion, monto, categoria = 'Insumos', creadoPor = 'Admin' } = body;

    if (!descripcion || !monto) {
      return NextResponse.json({ error: 'Descripción y monto requeridos' }, { status: 400 });
    }

    const expense = await prisma.cashExpense.create({
      data: {
        shiftId,
        descripcion,
        monto: Number(monto),
        categoria,
        creadoPor,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating cash expense:', error);
    return NextResponse.json({ error: 'Error al registrar egreso' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de gasto requerido' }, { status: 400 });
    }

    await prisma.cashExpense.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Error al eliminar egreso' }, { status: 500 });
  }
}
