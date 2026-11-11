import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureRestaurantBranchesAndSchema, getOrCreateBranchesForRestaurant, serializeSafe } from '@/lib/db-autoheal';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await ensureRestaurantBranchesAndSchema(true);

    const body = await request.json();
    const {
      nombre,
      slug,
      eslogan,
      ciudad,
      direccionCentral,
      telefonoWhatsapp,
      plan,
      plantilla,
      colorPrimario,
      colorSecundario,
      adminNombre,
      adminEmail,
      adminPassword,
    } = body;

    if (!nombre || !slug || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'Por favor completa el nombre del restaurante, correo de administrador y contraseña.' },
        { status: 400 }
      );
    }

    const cleanSlug = String(slug)
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!cleanSlug || cleanSlug.length < 2) {
      return NextResponse.json(
        { error: 'El identificador URL (slug) del restaurante no es válido.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(adminEmail).trim().toLowerCase();
    const cleanSubdomainBase = cleanSlug.replace(/[^a-z0-9]/g, '');

    // 1. Verificar que el slug no esté en uso
    const existingRests: any[] = await prisma.$queryRawUnsafe(
      "SELECT `id`, `nombre`, `slug` FROM `restaurants` WHERE LOWER(`slug`) = ? LIMIT 1;",
      cleanSlug
    );

    if (existingRests.length > 0) {
      return NextResponse.json(
        {
          error: `El enlace /r/${cleanSlug} ya está registrado (${existingRests[0].nombre}). Elige otro identificador o límpialo desde el panel con la clave de Superadmin.`,
          existingSlug: cleanSlug,
        },
        { status: 400 }
      );
    }

    let cleanSubdomain = cleanSubdomainBase || cleanSlug;
    try {
      const subRows: any[] = await prisma.$queryRawUnsafe(
        "SELECT `id` FROM `restaurants` WHERE LOWER(`subdominio`) = ? LIMIT 1;",
        cleanSubdomain
      );
      if (subRows.length > 0) {
        cleanSubdomain = `${cleanSubdomain}${Date.now().toString().slice(-3)}`;
      }
    } catch {}

    const existingUsers: any[] = await prisma.$queryRawUnsafe(
      "SELECT `id` FROM `users` WHERE LOWER(`email`) = ? LIMIT 1;",
      cleanEmail
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Ese correo electrónico ya está registrado. Usa otro correo o inicia sesión.' },
        { status: 400 }
      );
    }

    // 2. Calcular fecha de vencimiento de prueba gratuita (14 días)
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 14);

    // 3. Crear Restaurante (con fallback resiliente)
    let restaurant: any = null;
    try {
      restaurant = await prisma.restaurant.create({
        data: {
          nombre: String(nombre).trim(),
          slug: cleanSlug,
          subdominio: cleanSubdomain,
          eslogan: eslogan ? String(eslogan).trim() : 'Sabor y Experiencia Única',
          descripcion: `Restaurante ${nombre} en ${ciudad || 'Colombia'} - Pide en línea a domicilio o desde tu mesa.`,
          plantilla: plantilla || 'urbana-gourmet',
          colorPrimario: colorPrimario || '#F10F1A',
          colorSecundario: colorSecundario || '#FA9B23',
          colorAcento: colorPrimario || '#F10F1A',
          colorBoton: colorPrimario || '#F10F1A',
          colorFondo: '#080808',
          colorSuperficie: '#121212',
          tituloHero: `BIENVENIDO A ${String(nombre).trim().toUpperCase()}`,
          subtituloHero: eslogan || 'Especialidades preparadas al instante',
          descripcionHero: 'Haz tu pedido en línea con entrega rápida a domicilio o directo a tu mesa sin esperas.',
          textoBotonHero: 'Ver Nuestra Carta',
          telefonoWhatsapp: telefonoWhatsapp ? String(telefonoWhatsapp).trim() : '3000000000',
          direccionCentral: direccionCentral ? String(direccionCentral).trim() : 'Sede Principal',
          ciudad: ciudad ? String(ciudad).trim() : 'Cali',
          plan: plan || 'Pro',
          estadoLicencia: 'PRUEBA',
          fechaVencimiento: trialEnds,
          mostrarEnLanding: true,
          activo: true,
        },
      });
    } catch {
      await prisma.$executeRawUnsafe(
        `INSERT INTO \`restaurants\` (\`nombre\`, \`slug\`, \`subdominio\`, \`eslogan\`, \`descripcion\`, \`colorPrimario\`, \`colorSecundario\`, \`colorFondo\`, \`telefonoWhatsapp\`, \`direccionCentral\`, \`ciudad\`, \`costoDomicilioBase\`, \`propinaSugeridaPct\`, \`plan\`, \`activo\`, \`createdAt\`, \`updatedAt\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, '#080808', ?, ?, ?, 5000, 10, ?, 1, NOW(), NOW());`,
        String(nombre).trim(),
        cleanSlug,
        cleanSubdomain,
        eslogan ? String(eslogan).trim() : 'Sabor y Experiencia Única',
        `Restaurante ${nombre} en ${ciudad || 'Colombia'}`,
        colorPrimario || '#F10F1A',
        colorSecundario || '#FA9B23',
        telefonoWhatsapp ? String(telefonoWhatsapp).trim() : '3000000000',
        direccionCentral ? String(direccionCentral).trim() : 'Sede Principal',
        ciudad ? String(ciudad).trim() : 'Cali',
        plan || 'Pro'
      );
      const rows: any[] = await prisma.$queryRawUnsafe(
        "SELECT * FROM `restaurants` WHERE `slug` = ? LIMIT 1;",
        cleanSlug
      );
      restaurant = rows[0];
    }

    const rId = Number(restaurant.id);

    // 4. Crear siempre la Sede Principal por defecto
    const branches = await getOrCreateBranchesForRestaurant(rId);
    const branch = branches[0];

    // 5. Crear Usuario Administrador vinculado a la Sede Principal
    let adminUser: any = null;
    try {
      adminUser = await prisma.user.create({
        data: {
          nombre: adminNombre ? String(adminNombre).trim() : `Admin ${nombre}`,
          email: cleanEmail,
          password: String(adminPassword).trim(),
          rol: 'Administrador',
          estado: 'Activo',
          restaurantId: rId,
          branchId: branch?.id || null,
        },
      });
    } catch {
      await prisma.$executeRawUnsafe(
        `INSERT INTO \`users\` (\`nombre\`, \`email\`, \`password\`, \`rol\`, \`estado\`, \`restaurantId\`, \`branchId\`, \`createdAt\`, \`updatedAt\`)
         VALUES (?, ?, ?, 'Administrador', 'Activo', ?, ?, NOW(), NOW());`,
        adminNombre ? String(adminNombre).trim() : `Admin ${nombre}`,
        cleanEmail,
        String(adminPassword).trim(),
        rId,
        branch?.id || null
      );
      const uRows: any[] = await prisma.$queryRawUnsafe(
        "SELECT * FROM `users` WHERE LOWER(`email`) = ? LIMIT 1;",
        cleanEmail
      );
      adminUser = uRows[0];
    }

    // 6. Crear 4 Mesas iniciales en la Sede Principal (el restaurante inicia desde cero sin categorías ni productos pre-cargados)
    for (let i = 1; i <= 4; i++) {
      await prisma.restaurantTable.create({
        data: {
          numero: `Mesa ${i} (${cleanSlug})`,
          capacidad: 4,
          estado: 'Libre',
          ubicacion: 'Salón Principal',
          branchId: branch?.id || null,
          restaurantId: rId,
        },
      }).catch(() => {});
    }

    const fullRestaurant = {
      ...restaurant,
      id: rId,
      activo: true,
      branches,
    };

    return NextResponse.json(
      serializeSafe({
        success: true,
        restaurant: fullRestaurant,
        branch,
        user: {
          id: adminUser?.id,
          nombre: adminUser?.nombre,
          email: adminUser?.email,
          rol: adminUser?.rol || 'Administrador',
          restaurantId: rId,
          branchId: branch?.id || null,
          branch: branch ? { id: branch.id, nombre: branch.nombre, slug: branch.slug } : null,
          restaurant: {
            id: rId,
            nombre: restaurant.nombre,
            slug: restaurant.slug,
            logo: restaurant.logo,
            subdominio: restaurant.subdominio,
            branches,
          },
        },
      }),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error registering restaurant:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al registrar el restaurante' },
      { status: 500 }
    );
  }
}
