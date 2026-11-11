import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureRestaurantBranchesAndSchema, getOrCreateBranchesForRestaurant } from '@/lib/db-autoheal';

export const dynamic = 'force-dynamic';

// GET /api/restaurants
// Params: ?slug=xxx | ?id=xxx | ?subdomain=xxx
export async function GET(request: Request) {
  try {
    await ensureRestaurantBranchesAndSchema();

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');
    const subdomain = searchParams.get('subdomain');

    if (slug || id || subdomain) {
      const cleanSlug = slug ? slug.toLowerCase().trim() : '';
      const cleanSub = subdomain ? subdomain.toLowerCase().trim() : '';
      const variantWithHyphen = cleanSlug === 'puntog' ? 'punto-g' : cleanSlug;
      const variantWithoutHyphen = cleanSlug === 'punto-g' ? 'puntog' : cleanSlug.replace(/-/g, '');

      let restaurant: any = null;
      try {
        restaurant = await prisma.restaurant.findFirst({
          where: id
            ? { id: Number(id) }
            : {
                OR: [
                  ...(slug
                    ? [
                        { slug: cleanSlug },
                        { slug: variantWithHyphen },
                        { slug: variantWithoutHyphen },
                        { subdominio: cleanSlug },
                        { subdominio: variantWithoutHyphen },
                      ]
                    : []),
                  ...(subdomain
                    ? [
                        { subdominio: cleanSub },
                        { slug: cleanSub },
                      ]
                    : []),
                ],
              },
          include: {
            branches: {
              orderBy: { id: 'asc' },
            },
            _count: {
              select: {
                orders: true,
                products: true,
                categories: true,
                branches: true,
              },
            },
          },
        });
      } catch {
        // Direct raw SQL fallback so single-restaurant lookup NEVER fails on schema differences
        let rawRows: any[] = [];
        if (id) {
          rawRows = await prisma.$queryRawUnsafe(
            "SELECT * FROM `restaurants` WHERE `id` = ? LIMIT 1;",
            Number(id)
          );
        } else {
          const s1 = cleanSlug || cleanSub;
          const s2 = variantWithHyphen || s1;
          const s3 = variantWithoutHyphen || s1;
          rawRows = await prisma.$queryRawUnsafe(
            "SELECT * FROM `restaurants` WHERE LOWER(`slug`) IN (?, ?, ?) OR LOWER(`subdominio`) IN (?, ?, ?) LIMIT 1;",
            s1,
            s2,
            s3,
            s1,
            s2,
            s3
          );
        }

        if (rawRows.length > 0) {
          const r = rawRows[0];
          restaurant = {
            ...r,
            id: Number(r.id),
            activo: r.activo !== undefined ? Boolean(r.activo) : true,
            mostrarEnLanding: r.mostrarEnLanding !== undefined ? Boolean(r.mostrarEnLanding) : true,
            estadoLicencia: r.estadoLicencia || (r.activo === 0 || r.activo === false ? 'SUSPENDIDA' : 'ACTIVA'),
            costoDomicilioBase: Number(r.costoDomicilioBase ?? 5000),
            propinaSugeridaPct: Number(r.propinaSugeridaPct ?? 10),
            branches: [],
          };
        }
      }

      if (!restaurant) {
        return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 });
      }

      // Guarantee at least 1 default branch ("Sede Principal") exists and is attached
      if (!restaurant.branches || restaurant.branches.length === 0) {
        restaurant.branches = await getOrCreateBranchesForRestaurant(Number(restaurant.id));
      } else {
        restaurant.branches = restaurant.branches.map((b: any) => ({
          ...b,
          id: Number(b.id),
          activo: Boolean(b.activo),
        }));
      }

      restaurant.activo = restaurant.activo !== undefined ? Boolean(restaurant.activo) : true;
      restaurant.estadoLicencia =
        restaurant.estadoLicencia || (restaurant.activo ? 'ACTIVA' : 'SUSPENDIDA');

      return NextResponse.json(restaurant, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });
    }

    // List all restaurants (for SuperAdmin)
    let restaurants: any[] = [];
    try {
      restaurants = await prisma.restaurant.findMany({
        orderBy: { id: 'asc' },
        include: {
          branches: {
            orderBy: { id: 'asc' },
          },
          users: {
            select: {
              id: true,
              nombre: true,
              email: true,
              password: true,
              rol: true,
              estado: true,
              branchId: true,
            },
            orderBy: { id: 'asc' },
          },
          _count: {
            select: {
              orders: true,
              products: true,
              categories: true,
              branches: true,
              tables: true,
            },
          },
        },
      });
    } catch (listErr) {
      // Raw SQL fallback for SuperAdmin restaurant list
      const rawRests: any[] = await prisma.$queryRawUnsafe(
        "SELECT * FROM `restaurants` ORDER BY `id` ASC;"
      );
      const rawBranches: any[] = (await prisma
        .$queryRawUnsafe("SELECT * FROM `branches` ORDER BY `id` ASC;")
        .catch(() => [])) as any[];
      const rawUsers: any[] = (await prisma
        .$queryRawUnsafe(
          "SELECT `id`, `nombre`, `email`, `password`, `rol`, `estado`, `restaurantId`, `branchId` FROM `users` ORDER BY `id` ASC;"
        )
        .catch(() => [])) as any[];

      const prodCounts: any[] = (await prisma
        .$queryRawUnsafe(
          "SELECT `restaurantId`, COUNT(*) as cnt FROM `products` GROUP BY `restaurantId`;"
        )
        .catch(() => [])) as any[];
      const orderCounts: any[] = (await prisma
        .$queryRawUnsafe(
          "SELECT `restaurantId`, COUNT(*) as cnt FROM `orders` GROUP BY `restaurantId`;"
        )
        .catch(() => [])) as any[];
      const catCounts: any[] = (await prisma
        .$queryRawUnsafe(
          "SELECT `restaurantId`, COUNT(*) as cnt FROM `categories` GROUP BY `restaurantId`;"
        )
        .catch(() => [])) as any[];
      const tableCounts: any[] = (await prisma
        .$queryRawUnsafe(
          "SELECT `restaurantId`, COUNT(*) as cnt FROM `restaurant_tables` GROUP BY `restaurantId`;"
        )
        .catch(() => [])) as any[];

      const prodMap = new Map(prodCounts.map((x) => [Number(x.restaurantId || 1), Number(x.cnt || 0)]));
      const ordMap = new Map(orderCounts.map((x) => [Number(x.restaurantId || 1), Number(x.cnt || 0)]));
      const catMap = new Map(catCounts.map((x) => [Number(x.restaurantId || 1), Number(x.cnt || 0)]));
      const tblMap = new Map(tableCounts.map((x) => [Number(x.restaurantId || 1), Number(x.cnt || 0)]));

      restaurants = rawRests.map((r) => {
        const rId = Number(r.id);
        const rBranches = rawBranches
          .filter((b) => Number(b.restaurantId || 1) === rId)
          .map((b) => ({
            ...b,
            id: Number(b.id),
            activo: Boolean(b.activo),
            restaurantId: rId,
          }));
        const rUsers = rawUsers
          .filter((u) => Number(u.restaurantId || 0) === rId)
          .map((u) => ({
            ...u,
            id: Number(u.id),
            branchId: u.branchId ? Number(u.branchId) : null,
          }));

        const isActivo = r.activo !== undefined ? Boolean(r.activo) : true;
        return {
          ...r,
          id: rId,
          activo: isActivo,
          mostrarEnLanding: r.mostrarEnLanding !== undefined ? Boolean(r.mostrarEnLanding) : true,
          estadoLicencia: r.estadoLicencia || (isActivo ? 'ACTIVA' : 'SUSPENDIDA'),
          costoDomicilioBase: Number(r.costoDomicilioBase ?? 5000),
          propinaSugeridaPct: Number(r.propinaSugeridaPct ?? 10),
          branches: rBranches,
          users: rUsers,
          _count: {
            orders: ordMap.get(rId) || 0,
            products: prodMap.get(rId) || 0,
            categories: catMap.get(rId) || 0,
            branches: rBranches.length,
            tables: tblMap.get(rId) || 0,
          },
        };
      });
    }

    // Ensure every restaurant in the list has at least 1 branch in `branches` and accurate `_count.branches`
    for (const rest of restaurants) {
      if (!rest.branches || rest.branches.length === 0) {
        rest.branches = await getOrCreateBranchesForRestaurant(Number(rest.id));
      }
      rest.activo = rest.activo !== undefined ? Boolean(rest.activo) : true;
      rest.estadoLicencia = rest.estadoLicencia || (rest.activo ? 'ACTIVA' : 'SUSPENDIDA');
      rest._count = {
        orders: Number(rest._count?.orders || 0),
        products: Number(rest._count?.products || 0),
        categories: Number(rest._count?.categories || 0),
        tables: Number(rest._count?.tables || 0),
        branches: rest.branches.length,
      };
    }

    return NextResponse.json(restaurants, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json({ error: 'Error al consultar restaurantes' }, { status: 500 });
  }
}

// POST /api/restaurants (SuperAdmin create new tenant)
export async function POST(request: Request) {
  try {
    await ensureRestaurantBranchesAndSchema(true);

    const body = await request.json();
    const {
      nombre,
      slug,
      subdominio,
      dominio,
      eslogan,
      descripcion,
      logo,
      bannerHero,
      colorPrimario,
      colorSecundario,
      colorTerciario,
      colorAcento,
      colorFondo,
      colorSuperficie,
      colorTexto,
      colorTextoSecundario,
      colorBorde,
      colorBoton,
      colorBotonTexto,
      colorNavegacion,
      plantilla,
      tituloHero,
      subtituloHero,
      descripcionHero,
      textoBotonHero,
      tipografia,
      radioBordes,
      estiloTarjetas,
      columnasMenu,
      telefonoWhatsapp,
      direccionCentral,
      ciudad,
      costoDomicilioBase,
      propinaSugeridaPct,
      plan,
      adminEmail,
      adminPassword,
      adminNombre,
    } = body;

    if (!nombre || !slug) {
      return NextResponse.json({ error: 'Nombre y slug son obligatorios' }, { status: 400 });
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const cleanSubdomain = (subdominio || cleanSlug)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '');

    const existingRows: any[] = await prisma.$queryRawUnsafe(
      "SELECT `id` FROM `restaurants` WHERE `slug` = ? OR `subdominio` = ? LIMIT 1;",
      cleanSlug,
      cleanSubdomain
    );

    if (existingRows.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe un restaurante con ese identificador (slug) o subdominio.' },
        { status: 400 }
      );
    }

    let createdRest: any = null;
    try {
      createdRest = await prisma.restaurant.create({
        data: {
          nombre: nombre.trim(),
          slug: cleanSlug,
          subdominio: cleanSubdomain,
          dominio: dominio ? dominio.trim() : null,
          eslogan: eslogan || 'Sabor y Experiencia Única',
          descripcion: descripcion || `Restaurante ${nombre} - Haz tu pedido en línea o desde tu mesa.`,
          logo: logo || null,
          bannerHero: bannerHero || null,
          colorPrimario: colorPrimario || '#ffc928',
          colorSecundario: colorSecundario || '#E94B24',
          colorTerciario: colorTerciario || '#1a1a1a',
          colorAcento: colorAcento || colorPrimario || '#ffc928',
          colorFondo: colorFondo || '#080808',
          colorSuperficie: colorSuperficie || '#121212',
          colorTexto: colorTexto || '#ffffff',
          colorTextoSecundario: colorTextoSecundario || '#9ca3af',
          colorBorde: colorBorde || '#262626',
          colorBoton: colorBoton || colorPrimario || '#ffc928',
          colorBotonTexto: colorBotonTexto || '#000000',
          colorNavegacion: colorNavegacion || '#0a0a0a',
          plantilla: plantilla || 'urbana-gourmet',
          tituloHero: tituloHero || `BIENVENIDO A ${nombre.toUpperCase()}`,
          subtituloHero: subtituloHero || eslogan || 'Especialidades al instante',
          descripcionHero: descripcionHero || descripcion || 'Pide en línea a domicilio o desde tu mesa con atención inmediata.',
          textoBotonHero: textoBotonHero || 'Ver la Carta',
          tipografia: tipografia || 'Outfit',
          radioBordes: radioBordes || 'rounded-2xl',
          estiloTarjetas: estiloTarjetas || 'glass',
          columnasMenu: Number(columnasMenu ?? 3),
          telefonoWhatsapp: telefonoWhatsapp || '3000000000',
          direccionCentral: direccionCentral || 'Sede Principal',
          ciudad: ciudad || 'Cali',
          costoDomicilioBase: Number(costoDomicilioBase ?? 5000),
          propinaSugeridaPct: Number(propinaSugeridaPct ?? 10),
          plan: plan || 'Pro',
          activo: true,
        },
      });
    } catch {
      // Minimal fallback if extended columns aren't present
      await prisma.$executeRawUnsafe(
        `INSERT INTO \`restaurants\` (\`nombre\`, \`slug\`, \`subdominio\`, \`eslogan\`, \`descripcion\`, \`colorPrimario\`, \`colorSecundario\`, \`colorFondo\`, \`telefonoWhatsapp\`, \`direccionCentral\`, \`ciudad\`, \`costoDomicilioBase\`, \`propinaSugeridaPct\`, \`plan\`, \`activo\`, \`createdAt\`, \`updatedAt\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW());`,
        nombre.trim(),
        cleanSlug,
        cleanSubdomain,
        eslogan || 'Sabor y Experiencia Única',
        descripcion || `Restaurante ${nombre}`,
        colorPrimario || '#ffc928',
        colorSecundario || '#E94B24',
        colorFondo || '#080808',
        telefonoWhatsapp || '3000000000',
        direccionCentral || 'Sede Principal',
        ciudad || 'Cali',
        Number(costoDomicilioBase ?? 5000),
        Number(propinaSugeridaPct ?? 10),
        plan || 'Pro'
      );
      const rows: any[] = await prisma.$queryRawUnsafe(
        "SELECT * FROM `restaurants` WHERE `slug` = ? LIMIT 1;",
        cleanSlug
      );
      createdRest = rows[0];
    }

    const rId = Number(createdRest.id);

    // 1. Always create the default "Sede Principal" for this restaurant
    const branches = await getOrCreateBranchesForRestaurant(rId);
    const mainBranch = branches[0];

    // 2. Create admin user linked to the restaurant and its Sede Principal
    const finalAdminEmail = (adminEmail && adminEmail.trim())
      ? adminEmail.trim().toLowerCase()
      : `admin@${cleanSlug}.com`;
    const finalAdminPass = (adminPassword && adminPassword.trim())
      ? adminPassword.trim()
      : 'admin123';
    const finalAdminName = adminNombre || `Admin ${nombre}`;

    try {
      await prisma.user.create({
        data: {
          nombre: finalAdminName,
          email: finalAdminEmail,
          password: finalAdminPass,
          rol: 'Administrador',
          estado: 'Activo',
          restaurantId: rId,
          branchId: mainBranch?.id || null,
        },
      });
    } catch {
      await prisma.$executeRawUnsafe(
        `INSERT INTO \`users\` (\`nombre\`, \`email\`, \`password\`, \`rol\`, \`estado\`, \`restaurantId\`, \`branchId\`, \`createdAt\`, \`updatedAt\`)
         VALUES (?, ?, ?, 'Administrador', 'Activo', ?, ?, NOW(), NOW());`,
        finalAdminName,
        finalAdminEmail,
        finalAdminPass,
        rId,
        mainBranch?.id || null
      ).catch(() => {});
    }

    // 3. Create 4 initial tables linked to Sede Principal
    for (let i = 1; i <= 4; i++) {
      await prisma.restaurantTable.create({
        data: {
          numero: `Mesa ${i}`,
          capacidad: 4,
          estado: 'Libre',
          ubicacion: 'Salón Principal',
          branchId: mainBranch?.id || null,
          restaurantId: rId,
        },
      }).catch(() => {});
    }

    return NextResponse.json(
      {
        ...createdRest,
        id: rId,
        branches,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating restaurant:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al crear el restaurante' },
      { status: 500 }
    );
  }
}
