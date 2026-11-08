import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        product: true,
        items: {
          include: {
            supply: true,
          },
        },
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: 'Receta no encontrada' }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error: any) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);

    const recipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      return NextResponse.json({ error: 'Receta no encontrada' }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.recipeItem.deleteMany({ where: { recipeId: id } }),
      prisma.recipe.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true, message: 'Receta eliminada correctamente' });
  } catch (error: any) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
