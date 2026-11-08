import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recalculateAllRecipeCosts } from '@/lib/inventory-engine';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');
    const restaurantSlug = searchParams.get('restaurantSlug');
    const productId = searchParams.get('productId');

    let resolvedRestaurantId: number | null = restaurantId ? Number(restaurantId) : null;
    if (!resolvedRestaurantId && restaurantSlug) {
      const rest = await prisma.restaurant.findUnique({
        where: { slug: restaurantSlug },
        select: { id: true },
      });
      if (rest) resolvedRestaurantId = rest.id;
    }

    if (!resolvedRestaurantId) {
      return NextResponse.json({ error: 'restaurantId es obligatorio' }, { status: 400 });
    }

    const where: any = { restaurantId: resolvedRestaurantId };
    if (productId) {
      where.productId = Number(productId);
    }

    const recipes = await prisma.recipe.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            nombre: true,
            precio: true,
            categoria: true,
            imagen: true,
            sku: true,
            codigoBarras: true,
            disponibilidad: true,
          },
        },
        items: {
          include: {
            supply: {
              select: {
                id: true,
                codigoInterno: true,
                nombre: true,
                unidadMedida: true,
                costoPromedio: true,
                costoUnitario: true,
                stockActual: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const enrichedRecipes = recipes.map((r) => {
      const salePrice = Number(r.product?.precio || 0);
      const costPerPortion = Number(r.costoPorcion || 0);
      const grossProfit = salePrice - costPerPortion;
      const marginPercent = salePrice > 0 ? (grossProfit / salePrice) * 100 : 0;

      const hasStockIssues = r.items.some(
        (item) => Number(item.supply?.stockActual || 0) < Number(item.cantidad)
      );

      return {
        ...r,
        salePrice,
        grossProfit,
        marginPercent: Math.round(marginPercent * 10) / 10,
        hasStockIssues,
      };
    });

    return NextResponse.json(enrichedRecipes);
  } catch (error: any) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      restaurantId,
      productId,
      nombre,
      descripcion,
      rendimientoPorciones,
      tiempoPreparacionMinutos,
      instrucciones,
      items, // array of { supplyId, cantidad, unidadMedida }
    } = body;

    const restId = Number(restaurantId);
    const prodId = Number(productId);

    if (!restId || !prodId || !nombre) {
      return NextResponse.json(
        { error: 'restaurantId, productId y nombre son obligatorios' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'La receta debe incluir al menos un insumo/ingrediente' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findFirst({
      where: { id: prodId, restaurantId: restId },
    });
    if (!product) {
      return NextResponse.json(
        { error: 'El producto especificado no existe o no pertenece a este restaurante' },
        { status: 404 }
      );
    }

    const portions = Number(rendimientoPorciones) > 0 ? Number(rendimientoPorciones) : 1;

    const result = await prisma.$transaction(async (tx) => {
      let existingRecipe = await tx.recipe.findUnique({
        where: { productId: prodId },
      });

      let recipe;
      if (existingRecipe) {
        recipe = await tx.recipe.update({
          where: { id: existingRecipe.id },
          data: {
            nombre,
            observaciones: descripcion || null,
            porciones: portions,
            tiempoPreparacion: tiempoPreparacionMinutos ? Number(tiempoPreparacionMinutos) : 15,
            instrucciones: instrucciones || null,
          },
        });
        await tx.recipeItem.deleteMany({
          where: { recipeId: recipe.id },
        });
      } else {
        recipe = await tx.recipe.create({
          data: {
            restaurantId: restId,
            productId: prodId,
            nombre,
            observaciones: descripcion || null,
            porciones: portions,
            tiempoPreparacion: tiempoPreparacionMinutos ? Number(tiempoPreparacionMinutos) : 15,
            instrucciones: instrucciones || null,
            costoTotal: 0,
            costoPorcion: 0,
          },
        });
      }

      const supplyIds = items.map((i: any) => Number(i.supplyId));
      const supplies = await tx.supply.findMany({
        where: { id: { in: supplyIds }, restaurantId: restId },
      });
      const supplyMap = new Map(supplies.map((s) => [s.id, s]));

      let totalRecipeCost = 0;

      for (const item of items) {
        const sId = Number(item.supplyId);
        const supply = supplyMap.get(sId);
        if (!supply) {
          throw new Error(`Insumo con ID ${sId} no encontrado en este restaurante`);
        }

        const qty = Number(item.cantidad) || 0;
        const costBasis = supply.costoPromedio > 0 ? supply.costoPromedio : supply.costoUnitario;
        const lineCost = qty * costBasis;
        totalRecipeCost += lineCost;

        await tx.recipeItem.create({
          data: {
            recipeId: recipe.id,
            supplyId: sId,
            cantidad: qty,
            unidad: item.unidadMedida || supply.unidadMedida,
            costoUnitarioCalculado: costBasis,
            costoSubtotal: lineCost,
          },
        });
      }

      const costPerPortion = totalRecipeCost / portions;
      const salePrice = Number(product.precio || 0);
      const grossProfit = salePrice - costPerPortion;
      const margin = salePrice > 0 ? (grossProfit / salePrice) * 100 : 0;

      const updatedRecipe = await tx.recipe.update({
        where: { id: recipe.id },
        data: {
          costoTotal: totalRecipeCost,
          costoPorcion: costPerPortion,
          margenUtilidad: Math.round(margin * 10) / 10,
        },
        include: {
          items: {
            include: { supply: true },
          },
          product: true,
        },
      });

      return updatedRecipe;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error creating/updating recipe:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
