import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveTenantScope } from '@/lib/tenant-security';

export const dynamic = 'force-dynamic';
import { generateTableQRCode } from '@/lib/qrcode';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get('branchId');
    const restaurantId = searchParams.get('restaurantId');
    const restaurantSlug = searchParams.get('restaurantSlug');

    const where: any = {};
    if (branchId && branchId !== 'all') {
      where.branchId = Number(branchId);
    }

    // Aislamiento Multi-Tenant Estricto
    const allowAll = searchParams.get('allTenants') === 'true';
    if (!allowAll) {
      try {
        const scope = await resolveTenantScope(req);
        where.restaurantId = scope.restaurantId;
      } catch (scopeErr) {
        if (restaurantId && !isNaN(Number(restaurantId))) {
          where.restaurantId = Number(restaurantId);
        } else {
          where.restaurantId = 1;
        }
      }
    }

    try {
      const tables = await prisma.restaurantTable.findMany({
        where,
        include: {
          branch: {
            select: {
              id: true,
              nombre: true,
              slug: true,
            },
          },
          orders: {
            where: {
              estado: {
                notIn: ['Entregado', 'Cancelado'],
              },
            },
            include: {
              items: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { numero: 'asc' },
      });

      return NextResponse.json(tables);
    } catch (queryErr) {
      console.warn('Prisma tables query error, attempting simple query:', queryErr);
      const simpleTables = await prisma.restaurantTable.findMany({
        where,
        orderBy: { numero: 'asc' },
      });
      return NextResponse.json(simpleTables.map(t => ({ ...t, branch: null, orders: [] })));
    }
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const { numero, capacidad, ubicacion, notas, branchId, restaurantId = 1 } = await req.json();

    if (!numero) {
      return NextResponse.json({ error: 'El número de mesa es obligatorio' }, { status: 400 });
    }

    const exists = await prisma.restaurantTable.findUnique({
      where: { numero },
    });

    if (exists) {
      return NextResponse.json({ error: 'Ya existe una mesa con ese número o nombre' }, { status: 400 });
    }

    const table = await prisma.restaurantTable.create({
      data: {
        numero,
        capacidad: Number(capacidad) || 4,
        ubicacion: ubicacion || 'Salón Principal',
        notas: notas || null,
        estado: 'Libre',
        branchId: branchId ? Number(branchId) : null,
        restaurantId: restaurantId ? Number(restaurantId) : 1,
      },
      include: {
        branch: true,
      },
    });

    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear mesa' }, { status: 500 });
  }
}
