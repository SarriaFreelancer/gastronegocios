import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const STANDARD_MODULES = [
  'pos',
  'kds',
  'mesero',
  'menu_digital',
  'insumos',
  'recetas',
  'compras',
  'clientes',
  'reportes',
  'usuarios',
  'configuracion',
];

export const STANDARD_ROLES = [
  {
    nombre: 'Administrador del Restaurante',
    descripcion: 'Acceso total a todos los módulos y configuraciones del restaurante.',
    permisos: {
      pos: { ver: true, crear: true, editar: true, eliminar: true, exportar: true, autorizar: true },
      kds: { ver: true, crear: true, editar: true, eliminar: true, exportar: true, autorizar: true },
      mesero: { ver: true, crear: true, editar: true, eliminar: true, exportar: true, autorizar: true },
      menu_digital: { ver: true, crear: true, editar: true, eliminar: true, exportar: true, autorizar: true },
      insumos: { ver: true, crear: true, editar: true, eliminar: true, exportar: true, autorizar: true },
      recetas: { ver: true, crear: true, editar: true, eliminar: true, exportar: true, autorizar: true },
      compras: { ver: true, crear: true, editar: true, eliminar: true, exportar: true, autorizar: true },
      clientes: { ver: true, crear: true, editar: true, eliminar: true, exportar: true, autorizar: true },
      reportes: { ver: true, crear: true, editar: true, eliminar: true, exportar: true, autorizar: true },
      usuarios: { ver: true, crear: true, editar: true, eliminar: true, exportar: true, autorizar: true },
      configuracion: { ver: true, crear: true, editar: true, eliminar: true, exportar: true, autorizar: true },
    },
  },
  {
    nombre: 'Cajero',
    descripcion: 'Ventas, cobros, arqueos de caja y visualización de productos. Sin acceso a costos ni recetas.',
    permisos: {
      pos: { ver: true, crear: true, editar: true, eliminar: false, exportar: false, autorizar: false },
      kds: { ver: true, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      mesero: { ver: true, crear: true, editar: true, eliminar: false, exportar: false, autorizar: false },
      menu_digital: { ver: true, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      insumos: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      recetas: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      compras: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      clientes: { ver: true, crear: true, editar: true, eliminar: false, exportar: false, autorizar: false },
      reportes: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      usuarios: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      configuracion: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
    },
  },
  {
    nombre: 'Mesero',
    descripcion: 'Toma de pedidos en mesa, visualización de menú y estado de mesas.',
    permisos: {
      pos: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      kds: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      mesero: { ver: true, crear: true, editar: true, eliminar: false, exportar: false, autorizar: false },
      menu_digital: { ver: true, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      insumos: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      recetas: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      compras: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      clientes: { ver: true, crear: true, editar: false, eliminar: false, exportar: false, autorizar: false },
      reportes: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      usuarios: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      configuracion: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
    },
  },
  {
    nombre: 'Cocinero / Jefe de Cocina',
    descripcion: 'Visualización de pantalla KDS, cambio de estados, consulta de recetas e ingredientes.',
    permisos: {
      pos: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      kds: { ver: true, crear: false, editar: true, eliminar: false, exportar: false, autorizar: false },
      mesero: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      menu_digital: { ver: true, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      insumos: { ver: true, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      recetas: { ver: true, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      compras: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      clientes: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      reportes: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      usuarios: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      configuracion: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
    },
  },
  {
    nombre: 'Almacenista / Encargado de Compras',
    descripcion: 'Registro de compras, recepción de mercancía, inventario de insumos y proveedores.',
    permisos: {
      pos: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      kds: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      mesero: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      menu_digital: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      insumos: { ver: true, crear: true, editar: true, eliminar: true, exportar: true, autorizar: false },
      recetas: { ver: true, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      compras: { ver: true, crear: true, editar: true, eliminar: false, exportar: true, autorizar: false },
      clientes: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      reportes: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      usuarios: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      configuracion: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
    },
  },
  {
    nombre: 'Contador / Auditor',
    descripcion: 'Acceso de sólo lectura a reportes de ventas, compras, inventarios, costos y exportación.',
    permisos: {
      pos: { ver: true, crear: false, editar: false, eliminar: false, exportar: true, autorizar: false },
      kds: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      mesero: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      menu_digital: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      insumos: { ver: true, crear: false, editar: false, eliminar: false, exportar: true, autorizar: false },
      recetas: { ver: true, crear: false, editar: false, eliminar: false, exportar: true, autorizar: false },
      compras: { ver: true, crear: false, editar: false, eliminar: false, exportar: true, autorizar: false },
      clientes: { ver: true, crear: false, editar: false, eliminar: false, exportar: true, autorizar: false },
      reportes: { ver: true, crear: false, editar: false, eliminar: false, exportar: true, autorizar: false },
      usuarios: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
      configuracion: { ver: false, crear: false, editar: false, eliminar: false, exportar: false, autorizar: false },
    },
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');
    const restaurantSlug = searchParams.get('restaurantSlug');

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

    let roles = await prisma.role.findMany({
      where: { restaurantId: resolvedRestaurantId },
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (roles.length === 0) {
      for (const standardRole of STANDARD_ROLES) {
        await prisma.role.create({
          data: {
            restaurantId: resolvedRestaurantId,
            nombre: standardRole.nombre,
            descripcion: standardRole.descripcion,
            permisos: JSON.stringify(standardRole.permisos),
          },
        });
      }

      roles = await prisma.role.findMany({
        where: { restaurantId: resolvedRestaurantId },
        include: {
          _count: { select: { users: true } },
        },
        orderBy: { createdAt: 'asc' },
      });
    }

    const parsedRoles = roles.map((r) => {
      let pObj = {};
      try {
        pObj = JSON.parse(r.permisos);
      } catch {}
      return {
        ...r,
        permisos: pObj,
        esSistema: STANDARD_ROLES.some((s) => s.nombre === r.nombre),
      };
    });

    return NextResponse.json(parsedRoles);
  } catch (error: any) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { restaurantId, nombre, descripcion, permisos } = body;
    const restId = Number(restaurantId);

    if (!restId || !nombre) {
      return NextResponse.json(
        { error: 'restaurantId y nombre son obligatorios' },
        { status: 400 }
      );
    }

    const existingRole = await prisma.role.findFirst({
      where: { restaurantId: restId, nombre },
    });
    if (existingRole) {
      return NextResponse.json(
        { error: `Ya existe un rol con el nombre "${nombre}"` },
        { status: 400 }
      );
    }

    const role = await prisma.role.create({
      data: {
        restaurantId: restId,
        nombre,
        descripcion: descripcion || null,
        permisos: typeof permisos === 'string' ? permisos : JSON.stringify(permisos || {}),
      },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error: any) {
    console.error('Error creating role:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
