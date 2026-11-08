import { NextResponse } from 'next/server';
import { recalculateAllRecipeCosts } from '@/lib/inventory-engine';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const restaurantId = Number(body.restaurantId);

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'restaurantId es obligatorio' },
        { status: 400 }
      );
    }

    const count = await recalculateAllRecipeCosts(restaurantId);

    return NextResponse.json({
      success: true,
      message: `Se recalcularon exitosamente ${count} recetas con los costos vigentes de insumos`,
      updatedCount: count,
    });
  } catch (error: any) {
    console.error('Error recalculating recipes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
