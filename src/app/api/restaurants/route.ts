import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const subdominio = searchParams.get('subdominio');
    const id = searchParams.get('id');

    // Consulta específica de un restaurante por slug, subdominio o id
    if (slug || subdominio || id) {
      const restaurant = await prisma.restaurant.findFirst({
        where: {
          OR: [
            ...(id ? [{ id: Number(id) }] : []),
            ...(slug ? [{ slug }] : []),
            ...(subdominio ? [{ subdominio }] : []),
          ],
        },
        include: {
          branches: {
            where: { activo: true },
            select: { id: true, nombre: true, slug: true, direccion: true, telefono: true, ciudad: true },
          },
          _count: {
            select: {
              products: true,
              categories: true,
              branches: true,
              orders: true,
              tables: true,
            },
          },
        },
      });

      if (!restaurant) {
        return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 });
      }

      return NextResponse.json(restaurant);
    }

    // Listado completo para el Superadmin
    const restaurants = await prisma.restaurant.findMany({
      include: {
        branches: {
          select: { id: true, nombre: true, slug: true, activo: true, direccion: true, telefono: true, ciudad: true },
        },
        users: {
          select: { id: true, nombre: true, email: true, rol: true, estado: true, password: true, branchId: true },
        },
        _count: {
          select: {
            branches: true,
            products: true,
            categories: true,
            orders: true,
            tables: true,
            users: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    // Calcular métricas consolidadas
    const ordersAgg = await prisma.order.aggregate({
      _sum: { total: true },
      _count: { id: true },
    });

    return NextResponse.json({
      restaurants,
      metrics: {
        totalRestaurantes: restaurants.length,
        activos: restaurants.filter((r) => r.activo).length,
        totalVentasPlataforma: ordersAgg._sum.total || 0,
        totalPedidosPlataforma: ordersAgg._count.id || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json({ error: 'Error al obtener restaurantes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      nombre,
      slug,
      subdominio,
      eslogan,
      descripcion,
      logo,
      bannerHero,
      colorPrimario = '#ffc928',
      colorSecundario = '#E94B24',
      colorFondo = '#080808',
      telefonoWhatsapp,
      instagram,
      direccionCentral,
      ciudad = 'Cali',
      costoDomicilioBase = 5000,
      propinaSugeridaPct = 10,
      plan = 'Pro',
      // Datos opcionales para crear el usuario admin del restaurante
      adminNombre,
      adminEmail,
      adminPassword,
    } = body;

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre del restaurante es obligatorio' }, { status: 400 });
    }

    const cleanSlug = (slug || nombre)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const cleanSubdomain = (subdominio || cleanSlug).toLowerCase().trim().replace(/[^a-z0-9]/g, '');

    // Verificar si ya existe ese slug o subdominio
    const existing = await prisma.restaurant.findFirst({
      where: {
        OR: [{ slug: cleanSlug }, { subdominio: cleanSubdomain }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Ya existe un restaurante con el identificador "${cleanSlug}" o subdominio "${cleanSubdomain}"` },
        { status: 400 }
      );
    }

    // Crear el restaurante
    const newRestaurant = await prisma.restaurant.create({
      data: {
        nombre,
        slug: cleanSlug,
        subdominio: cleanSubdomain,
        eslogan: eslogan || 'Sabor & Placer en cada plato',
        descripcion: descripcion || '',
        logo: logo || null,
        bannerHero: bannerHero || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1400&auto=format&fit=crop',
        colorPrimario,
        colorSecundario,
        colorFondo,
        telefonoWhatsapp: telefonoWhatsapp || '3229088736',
        instagram: instagram || null,
        direccionCentral: direccionCentral || 'Calle Principal # 1-00',
        ciudad,
        costoDomicilioBase: Number(costoDomicilioBase) || 5000,
        propinaSugeridaPct: Number(propinaSugeridaPct) || 10,
        plan,
        activo: true,
        // Configuración de Identidad y Secciones por defecto
        plantilla: 'plantilla-actual',
        tituloHero: `Bienvenidos a ${nombre}`,
        subtituloHero: eslogan || 'Sabor & Antojos Inolvidables',
        descripcionHero: descripcion || 'Disfruta de nuestros mejores platos preparados con pasión e ingredientes frescos.',
        textoBotonHero: 'Ver Nuestra Carta',
        tituloSeccionMenu: 'Nuestra Carta',
        tituloSeccionDestacados: 'Los Más Populares',
        // SEO por defecto
        seoTitulo: `${nombre} | Restaurante & Domicilios en ${ciudad}`,
        seoDescripcion: descripcion || `Disfruta del mejor menú de ${nombre} en ${ciudad}. Domicilios rápidos, combos especiales y atención por WhatsApp.`,
        seoKeywords: `${nombre}, restaurante ${ciudad}, comidas rápidas, hamburguesas, picadas, domicilios ${ciudad}`,
        // Crear automáticamente su Sede Principal por defecto
        branches: {
          create: {
            nombre: `Sede Principal - ${nombre}`,
            slug: `${cleanSlug}-principal`,
            direccion: direccionCentral || 'Sede Central',
            telefono: telefonoWhatsapp || null,
            ciudad,
            activo: true,
          },
        },
      },
      include: {
        branches: true,
      },
    });

    // Si se enviaron credenciales de administrador, creamos su usuario
    if (adminEmail) {
      await prisma.user.create({
        data: {
          nombre: adminNombre || `Admin ${nombre}`,
          email: adminEmail.toLowerCase().trim(),
          password: adminPassword || 'admin123',
          rol: 'Administrador',
          estado: 'Activo',
          restaurantId: newRestaurant.id,
          branchId: newRestaurant.branches[0]?.id || null,
        },
      });
    }

    return NextResponse.json(newRestaurant, { status: 201 });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    return NextResponse.json({ error: 'Error al crear restaurante' }, { status: 500 });
  }
}
