import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  DEFAULT_SAAS_PLANS,
  ensureSaasPlansTableAndDefaults,
  getSaasPlans,
  normalizePlanRow,
} from '@/lib/saas-plans';

export const dynamic = 'force-dynamic';

// GET /api/saas/plans
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const onlyActive = searchParams.get('active') === 'true';

    const plans = await getSaasPlans(onlyActive);
    return NextResponse.json(
      { plans },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching SaaS plans:', error);
    return NextResponse.json({ plans: DEFAULT_SAAS_PLANS });
  }
}

// PUT /api/saas/plans -> Actualizar precio, nombre, límites y características de un plan
export async function PUT(request: Request) {
  try {
    await ensureSaasPlansTableAndDefaults(true);
    const body = await request.json();

    const codigo = String(body.codigo || '').trim();
    const id = body.id ? Number(body.id) : null;

    if (!codigo && !id) {
      return NextResponse.json({ error: 'Código o ID del plan es obligatorio' }, { status: 400 });
    }

    const caracteristicasArr: string[] = Array.isArray(body.caracteristicas)
      ? body.caracteristicas.map((c: any) => String(c).trim()).filter(Boolean)
      : String(body.caracteristicasText || '')
          .split('\n')
          .map((c) => c.trim())
          .filter(Boolean);

    const nombre = String(body.nombre || codigo || 'Plan').trim();
    const subtitulo = String(body.subtitulo || '').trim();
    const emoji = String(body.emoji || '🚀').trim();
    const precioMensual = Number(body.precioMensual ?? 0);
    const precioAnual = Number(body.precioAnual ?? precioMensual * 10);
    const badgeTexto = body.badgeTexto ? String(body.badgeTexto).trim() : null;
    const destacado = body.destacado ? 1 : 0;
    const limiteSedes = Math.max(1, Number(body.limiteSedes ?? 1));
    const limiteProductos = Math.max(1, Number(body.limiteProductos ?? 100));
    const limiteUsuarios = Math.max(1, Number(body.limiteUsuarios ?? 5));
    const ctaTexto = String(body.ctaTexto || 'Comenzar Ahora').trim();
    const tipoAccion = body.tipoAccion === 'whatsapp' ? 'whatsapp' : 'registro';
    const activo = body.activo !== undefined ? (body.activo ? 1 : 0) : 1;
    const orden = Number(body.orden ?? 1);

    if (id) {
      await prisma.$executeRawUnsafe(
        `UPDATE \`saas_plans\`
         SET \`nombre\` = ?,
             \`subtitulo\` = ?,
             \`emoji\` = ?,
             \`precioMensual\` = ?,
             \`precioAnual\` = ?,
             \`badgeTexto\` = ?,
             \`destacado\` = ?,
             \`caracteristicasJson\` = ?,
             \`limiteSedes\` = ?,
             \`limiteProductos\` = ?,
             \`limiteUsuarios\` = ?,
             \`ctaTexto\` = ?,
             \`tipoAccion\` = ?,
             \`activo\` = ?,
             \`orden\` = ?,
             \`updatedAt\` = NOW()
         WHERE \`id\` = ?;`,
        nombre,
        subtitulo,
        emoji,
        precioMensual,
        precioAnual,
        badgeTexto,
        destacado,
        JSON.stringify(caracteristicasArr),
        limiteSedes,
        limiteProductos,
        limiteUsuarios,
        ctaTexto,
        tipoAccion,
        activo,
        orden,
        id
      );
    } else {
      await prisma.$executeRawUnsafe(
        `UPDATE \`saas_plans\`
         SET \`nombre\` = ?,
             \`subtitulo\` = ?,
             \`emoji\` = ?,
             \`precioMensual\` = ?,
             \`precioAnual\` = ?,
             \`badgeTexto\` = ?,
             \`destacado\` = ?,
             \`caracteristicasJson\` = ?,
             \`limiteSedes\` = ?,
             \`limiteProductos\` = ?,
             \`limiteUsuarios\` = ?,
             \`ctaTexto\` = ?,
             \`tipoAccion\` = ?,
             \`activo\` = ?,
             \`orden\` = ?,
             \`updatedAt\` = NOW()
         WHERE LOWER(\`codigo\`) = LOWER(?);`,
        nombre,
        subtitulo,
        emoji,
        precioMensual,
        precioAnual,
        badgeTexto,
        destacado,
        JSON.stringify(caracteristicasArr),
        limiteSedes,
        limiteProductos,
        limiteUsuarios,
        ctaTexto,
        tipoAccion,
        activo,
        orden,
        codigo
      );
    }

    const updatedRows: any[] = await prisma.$queryRawUnsafe(
      id
        ? 'SELECT * FROM `saas_plans` WHERE `id` = ? LIMIT 1;'
        : 'SELECT * FROM `saas_plans` WHERE LOWER(`codigo`) = LOWER(?) LIMIT 1;',
      id || codigo
    );

    const plans = await getSaasPlans();

    return NextResponse.json({
      success: true,
      plan: updatedRows[0] ? normalizePlanRow(updatedRows[0]) : null,
      plans,
    });
  } catch (error: any) {
    console.error('Error updating SaaS plan:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al actualizar el plan SaaS' },
      { status: 500 }
    );
  }
}

// POST /api/saas/plans -> Sincronizar límites del plan a los restaurantes que lo tienen asignado (o restaurar precios base)
export async function POST(request: Request) {
  try {
    await ensureSaasPlansTableAndDefaults(true);
    const body = await request.json().catch(() => ({}));

    if (body.action === 'sync_restaurant_limits' && body.codigo) {
      const plans = await getSaasPlans();
      const target = plans.find((p) => p.codigo.toLowerCase() === String(body.codigo).toLowerCase());
      if (!target) {
        return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 });
      }
      await prisma.$executeRawUnsafe(
        `UPDATE \`restaurants\`
         SET \`limiteSedes\` = ?, \`limiteProductos\` = ?, \`limiteUsuarios\` = ?, \`updatedAt\` = NOW()
         WHERE LOWER(\`plan\`) = LOWER(?);`,
        target.limiteSedes,
        target.limiteProductos,
        target.limiteUsuarios,
        target.codigo
      );
      return NextResponse.json({
        success: true,
        message: `Límites sincronizados en todos los restaurantes con plan ${target.nombre}.`,
      });
    }

    const plans = await getSaasPlans();
    return NextResponse.json({ success: true, plans });
  } catch (error: any) {
    console.error('Error in SaaS plans POST:', error);
    return NextResponse.json({ error: error?.message || 'Error interno' }, { status: 500 });
  }
}
