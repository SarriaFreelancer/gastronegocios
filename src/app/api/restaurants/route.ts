import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const subdominio = searchParams.get('subdominio');
    const id = searchParams.get('id');
    const forLanding = searchParams.get('landing') === 'true';

    // Listado público optimizado para la Landing Page
    if (forLanding) {
      try {
        const landingRests = await prisma.restaurant.findMany({
          where: {
            activo: true,
            mostrarEnLanding: true,
          },
          select: {
            id: true,
            nombre: true,
            slug: true,
            subdominio: true,
            eslogan: true,
            descripcion: true,
            logo: true,
            colorPrimario: true,
            colorSecundario: true,
            colorBoton: true,
            colorBotonTexto: true,
            mostrarEnLanding: true,
            activo: true,
            _count: {
              select: { products: true, branches: true },
            },
          },
          orderBy: { id: 'asc' },
        });
        return NextResponse.json(landingRests);
      } catch (landingErr) {
        // Fallback resiliente si la columna mostrarEnLanding aún no estuviera presente
        const fallbackRests = await prisma.restaurant.findMany({
          where: { activo: true },
          select: {
            id: true,
            nombre: true,
            slug: true,
            subdominio: true,
            eslogan: true,
            descripcion: true,
            logo: true,
            colorPrimario: true,
            colorSecundario: true,
            colorBoton: true,
            colorBotonTexto: true,
            activo: true,
            _count: {
              select: { products: true, branches: true },
            },
          },
          orderBy: { id: 'asc' },
        });
        return NextResponse.json(fallbackRests);
      }
    }

    // Consulta específica de un restaurante por slug, subdominio o id
    if (slug || subdominio || id) {
      const searchKey = (slug || subdominio || '').trim();
      const variantWithHyphen = searchKey === 'puntog' ? 'punto-g' : (searchKey === 'don-carbon-parrilla' || searchKey === 'doncarbon') ? 'bryan' : searchKey.includes('-') ? searchKey : searchKey.replace(/([a-z])([A-Z])/g, '$1-$2');
      const variantWithoutHyphen = searchKey.replace(/-/g, '');

      try {
        const restaurant = await prisma.restaurant.findFirst({
          where: {
            OR: [
              ...(id ? [{ id: Number(id) }] : []),
              ...(searchKey ? [
                { slug: searchKey },
                { subdominio: searchKey },
                { slug: variantWithHyphen },
                { subdominio: variantWithHyphen },
                { slug: variantWithoutHyphen },
                { subdominio: variantWithoutHyphen },
              ] : []),
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

        if (restaurant) {
          return NextResponse.json(restaurant);
        }
      } catch (queryErr) {
        console.warn('Prisma query warning for restaurant, trying basic fields:', queryErr);
        const basic = await prisma.restaurant.findFirst({
          where: {
            OR: [
              ...(id ? [{ id: Number(id) }] : []),
              ...(searchKey ? [{ slug: searchKey }, { subdominio: searchKey }] : []),
            ],
          },
        });
        if (basic) {
          return NextResponse.json(basic);
        }
      }

      return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 });
    }

    // Listado completo para el Superadmin con manejo de errores resiliente
    try {
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
      let ordersAgg: any = { _sum: { total: 0 }, _count: { id: 0 } };
      try {
        ordersAgg = await prisma.order.aggregate({
          _sum: { total: true },
          _count: { id: true },
        });
      } catch (aggErr) {
        // Ignorar si orders no está disponible
      }

      return NextResponse.json({
        restaurants,
        metrics: {
          totalRestaurantes: restaurants.length,
          activos: restaurants.filter((r) => r.activo).length,
          totalVentasPlataforma: ordersAgg._sum?.total || 0,
          totalPedidosPlataforma: ordersAgg._count?.id || 0,
        },
      });
    } catch (listErr) {
      console.warn('Error fetching detailed restaurants for superadmin, fallback to basic list:', listErr);
      const basicList = await prisma.restaurant.findMany({
        select: {
          id: true,
          nombre: true,
          slug: true,
          subdominio: true,
          eslogan: true,
          plan: true,
          activo: true,
          createdAt: true,
        },
        orderBy: { id: 'asc' },
      });
      return NextResponse.json({
        restaurants: basicList.map((r) => ({
          ...r,
          branches: [],
          users: [],
          _count: { branches: 0, products: 0, categories: 0, orders: 0, tables: 0, users: 0 },
        })),
        metrics: {
          totalRestaurantes: basicList.length,
          activos: basicList.filter((r) => r.activo).length,
          totalVentasPlataforma: 0,
          totalPedidosPlataforma: 0,
        },
      });
    }
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

    // Asegurar siempre un usuario Administrador para el nuevo restaurante
    const effectiveAdminEmail = (adminEmail || `admin@${cleanSlug}.com`).toLowerCase().trim();
    const effectiveAdminPassword = adminPassword || 'admin123';
    const effectiveAdminNombre = adminNombre || `Administrador ${nombre}`;

    const adminUser = await prisma.user.upsert({
      where: { email: effectiveAdminEmail },
      create: {
        nombre: effectiveAdminNombre,
        email: effectiveAdminEmail,
        password: effectiveAdminPassword,
        rol: 'Administrador',
        permisos: '["*"]',
        estado: 'Activo',
        restaurantId: newRestaurant.id,
        branchId: newRestaurant.branches[0]?.id || null,
      },
      update: {
        nombre: effectiveAdminNombre,
        password: effectiveAdminPassword,
        rol: 'Administrador',
        permisos: '["*"]',
        estado: 'Activo',
        restaurantId: newRestaurant.id,
        branchId: newRestaurant.branches[0]?.id || null,
      },
    });

    // Crear mesas iniciales para que el restaurante esté listo para operar de inmediato
    try {
      const branchId = newRestaurant.branches[0]?.id || null;
      await prisma.restaurantTable.createMany({
        data: [
          { numero: `Mesa 1 (${cleanSlug})`, capacidad: 4, ubicacion: 'Salón Principal', restaurantId: newRestaurant.id, branchId },
          { numero: `Mesa 2 (${cleanSlug})`, capacidad: 4, ubicacion: 'Salón Principal', restaurantId: newRestaurant.id, branchId },
          { numero: `Mesa 3 (${cleanSlug})`, capacidad: 6, ubicacion: 'Terraza', restaurantId: newRestaurant.id, branchId },
          { numero: `Barra 1 (${cleanSlug})`, capacidad: 2, ubicacion: 'Barra', restaurantId: newRestaurant.id, branchId },
        ],
        skipDuplicates: true,
      });
    } catch (tableErr) {
      console.warn('Nota creando mesas iniciales:', tableErr);
    }

    return NextResponse.json({
      ...newRestaurant,
      adminUser: {
        id: adminUser.id,
        nombre: adminUser.nombre,
        email: adminUser.email,
        password: adminUser.password,
        rol: adminUser.rol,
      },
      adminUrl: `/r/${newRestaurant.slug}/admin`,
      loginUrl: `/r/${newRestaurant.slug}/login?tab=staff`,
      menuUrl: `/r/${newRestaurant.slug}`,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating restaurant:', error);
    return NextResponse.json({ error: error?.message || 'Error al crear restaurante' }, { status: 500 });
  }
}
