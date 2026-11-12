import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveTenantScope } from '@/lib/tenant-security';
import { ensureCouponsTable, normalizeCouponRow } from '@/lib/coupons';

export const dynamic = 'force-dynamic';

// POST /api/coupons/validate
export async function POST(req: Request) {
  try {
    await ensureCouponsTable();
    const body = await req.json();
    const scope = await resolveTenantScope(req, body);

    const code = String(body.codigo || '').toUpperCase().trim();
    const subtotal = Number(body.subtotal || 0);
    const deliveryType = String(body.deliveryType || 'domicilio');

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Ingresa un código de cupón.' }, { status: 400 });
    }

    const rows: any[] = await prisma.$queryRawUnsafe(
      'SELECT * FROM `coupons` WHERE `restaurantId` = ? AND UPPER(`codigo`) = ? LIMIT 1;',
      scope.restaurantId,
      code
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { valid: false, error: 'El cupón ingresado no existe para este restaurante.' },
        { status: 404 }
      );
    }

    const coupon = normalizeCouponRow(rows[0]);

    if (!coupon.activo) {
      return NextResponse.json({ valid: false, error: 'Este cupón está desactivado.' }, { status: 400 });
    }

    if (coupon.estadoVigencia === 'PROGRAMADO') {
      const startStr = coupon.fechaInicio
        ? new Date(coupon.fechaInicio).toLocaleDateString('es-CO')
        : '';
      return NextResponse.json(
        { valid: false, error: `Este cupón estará vigente a partir del ${startStr}.` },
        { status: 400 }
      );
    }

    if (coupon.estadoVigencia === 'EXPIRADO') {
      return NextResponse.json(
        { valid: false, error: 'La vigencia de este cupón ya expiró.' },
        { status: 400 }
      );
    }

    if (coupon.estadoVigencia === 'AGOTADO') {
      return NextResponse.json(
        { valid: false, error: 'Este cupón ya alcanzó el límite máximo de usos.' },
        { status: 400 }
      );
    }

    if (coupon.soloDomicilio && deliveryType !== 'domicilio') {
      return NextResponse.json(
        { valid: false, error: 'Este cupón aplica únicamente para pedidos a Domicilio.' },
        { status: 400 }
      );
    }

    if (coupon.montoMinimo > 0 && subtotal < coupon.montoMinimo) {
      return NextResponse.json(
        {
          valid: false,
          error: `Requiere compra mínima de $${coupon.montoMinimo.toLocaleString('es-CO')}.`,
        },
        { status: 400 }
      );
    }

    const discountAmount =
      coupon.tipoDescuento === 'porcentaje'
        ? Math.round((subtotal * coupon.valor) / 100)
        : coupon.tipoDescuento === 'fijo'
        ? Math.min(subtotal, Math.round(coupon.valor))
        : 0;

    return NextResponse.json({
      valid: true,
      coupon,
      discountAmount,
    });
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { valid: false, error: 'No se pudo validar el cupón.' },
      { status: 500 }
    );
  }
}
