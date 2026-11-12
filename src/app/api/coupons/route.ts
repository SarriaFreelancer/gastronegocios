import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveTenantScope } from '@/lib/tenant-security';
import { ensureCouponsTable, normalizeCouponRow } from '@/lib/coupons';

export const dynamic = 'force-dynamic';

// GET /api/coupons?restaurantId=...&restaurantSlug=...&onlyCart=true
export async function GET(req: Request) {
  try {
    await ensureCouponsTable();
    const { searchParams } = new URL(req.url);
    const onlyCart = searchParams.get('onlyCart') === 'true';
    const scope = await resolveTenantScope(req);

    const rows: any[] = await prisma.$queryRawUnsafe(
      'SELECT * FROM `coupons` WHERE `restaurantId` = ? ORDER BY `id` DESC;',
      scope.restaurantId
    );

    const normalized = rows.map(normalizeCouponRow);

    if (onlyCart) {
      const validForCart = normalized.filter(
        (c) => c.mostrarEnCarrito && c.estadoVigencia === 'VIGENTE'
      );
      return NextResponse.json(validForCart, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    return NextResponse.json(normalized, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: 'Error al consultar cupones' }, { status: 500 });
  }
}

// POST /api/coupons
export async function POST(req: Request) {
  try {
    await ensureCouponsTable(true);
    const body = await req.json();
    const scope = await resolveTenantScope(req, body);

    const rawCode = String(body.codigo || '')
      .toUpperCase()
      .trim()
      .replace(/[^A-Z0-9_-]/g, '');

    if (!rawCode || rawCode.length < 2) {
      return NextResponse.json(
        { error: 'El código del cupón debe tener al menos 2 caracteres alfanuméricos.' },
        { status: 400 }
      );
    }

    const existing: any[] = await prisma.$queryRawUnsafe(
      'SELECT `id` FROM `coupons` WHERE `restaurantId` = ? AND UPPER(`codigo`) = ? LIMIT 1;',
      scope.restaurantId,
      rawCode
    );
    if (existing.length > 0) {
      return NextResponse.json(
        { error: `Ya existe un cupón con el código "${rawCode}" en este restaurante.` },
        { status: 400 }
      );
    }

    const tipoDescuento =
      body.tipoDescuento === 'fijo' || body.tipoDescuento === 'envio'
        ? body.tipoDescuento
        : 'porcentaje';
    const valor = Number(body.valor ?? 0);
    const montoMinimo = Math.max(0, Number(body.montoMinimo ?? 0));
    const usoMaximo = Math.max(0, Number(body.usoMaximo ?? 0));
    const descripcion = String(body.descripcion || '').trim();
    const fechaInicio = body.fechaInicio ? new Date(body.fechaInicio) : null;
    const fechaFin = body.fechaFin
      ? new Date(
          String(body.fechaFin).length === 10
            ? `${body.fechaFin}T23:59:59`
            : body.fechaFin
        )
      : null;
    const activo = body.activo !== undefined ? (body.activo ? 1 : 0) : 1;
    const mostrarEnCarrito =
      body.mostrarEnCarrito !== undefined ? (body.mostrarEnCarrito ? 1 : 0) : 1;
    const soloDomicilio = body.soloDomicilio ? 1 : 0;

    await prisma.$executeRawUnsafe(
      `INSERT INTO \`coupons\`
       (\`codigo\`, \`descripcion\`, \`tipoDescuento\`, \`valor\`, \`montoMinimo\`, \`usoMaximo\`, \`usosActuales\`, \`fechaInicio\`, \`fechaFin\`, \`activo\`, \`mostrarEnCarrito\`, \`soloDomicilio\`, \`restaurantId\`, \`createdAt\`, \`updatedAt\`)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, NOW(), NOW());`,
      rawCode,
      descripcion,
      tipoDescuento,
      valor,
      montoMinimo,
      usoMaximo,
      fechaInicio,
      fechaFin,
      activo,
      mostrarEnCarrito,
      soloDomicilio,
      scope.restaurantId
    );

    const createdRows: any[] = await prisma.$queryRawUnsafe(
      'SELECT * FROM `coupons` WHERE `restaurantId` = ? AND UPPER(`codigo`) = ? LIMIT 1;',
      scope.restaurantId,
      rawCode
    );

    return NextResponse.json(normalizeCouponRow(createdRows[0]), { status: 201 });
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al crear el cupón' },
      { status: 500 }
    );
  }
}

// PUT /api/coupons
export async function PUT(req: Request) {
  try {
    await ensureCouponsTable();
    const body = await req.json();
    const id = Number(body.id);

    if (!id) {
      return NextResponse.json({ error: 'ID del cupón es obligatorio' }, { status: 400 });
    }

    const rawCode = body.codigo
      ? String(body.codigo)
          .toUpperCase()
          .trim()
          .replace(/[^A-Z0-9_-]/g, '')
      : undefined;

    const fechaInicio =
      body.fechaInicio !== undefined
        ? body.fechaInicio
          ? new Date(body.fechaInicio)
          : null
        : undefined;
    const fechaFin =
      body.fechaFin !== undefined
        ? body.fechaFin
          ? new Date(
              String(body.fechaFin).length === 10
                ? `${body.fechaFin}T23:59:59`
                : body.fechaFin
            )
          : null
        : undefined;

    const currentRows: any[] = await prisma.$queryRawUnsafe(
      'SELECT * FROM `coupons` WHERE `id` = ? LIMIT 1;',
      id
    );
    if (currentRows.length === 0) {
      return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 });
    }
    const prev = currentRows[0];

    await prisma.$executeRawUnsafe(
      `UPDATE \`coupons\`
       SET \`codigo\` = ?,
           \`descripcion\` = ?,
           \`tipoDescuento\` = ?,
           \`valor\` = ?,
           \`montoMinimo\` = ?,
           \`usoMaximo\` = ?,
           \`fechaInicio\` = ?,
           \`fechaFin\` = ?,
           \`activo\` = ?,
           \`mostrarEnCarrito\` = ?,
           \`soloDomicilio\` = ?,
           \`updatedAt\` = NOW()
       WHERE \`id\` = ?;`,
      rawCode ?? prev.codigo,
      body.descripcion !== undefined ? String(body.descripcion).trim() : prev.descripcion,
      body.tipoDescuento !== undefined ? body.tipoDescuento : prev.tipoDescuento,
      body.valor !== undefined ? Number(body.valor) : Number(prev.valor),
      body.montoMinimo !== undefined ? Number(body.montoMinimo) : Number(prev.montoMinimo),
      body.usoMaximo !== undefined ? Number(body.usoMaximo) : Number(prev.usoMaximo),
      fechaInicio !== undefined ? fechaInicio : prev.fechaInicio,
      fechaFin !== undefined ? fechaFin : prev.fechaFin,
      body.activo !== undefined ? (body.activo ? 1 : 0) : prev.activo,
      body.mostrarEnCarrito !== undefined ? (body.mostrarEnCarrito ? 1 : 0) : prev.mostrarEnCarrito,
      body.soloDomicilio !== undefined ? (body.soloDomicilio ? 1 : 0) : prev.soloDomicilio,
      id
    );

    const updated: any[] = await prisma.$queryRawUnsafe(
      'SELECT * FROM `coupons` WHERE `id` = ? LIMIT 1;',
      id
    );

    return NextResponse.json(normalizeCouponRow(updated[0]));
  } catch (error: any) {
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al actualizar el cupón' },
      { status: 500 }
    );
  }
}

// DELETE /api/coupons?id=...
export async function DELETE(req: Request) {
  try {
    await ensureCouponsTable();
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));
    if (!id) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }
    await prisma.$executeRawUnsafe('DELETE FROM `coupons` WHERE `id` = ?;', id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ error: 'Error al eliminar el cupón' }, { status: 500 });
  }
}
