import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureRestaurantBranchesAndSchema, getOrCreateBranchesForRestaurant, serializeSafe } from '@/lib/db-autoheal';

export const dynamic = 'force-dynamic';

// PUT /api/restaurants/[id]
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureRestaurantBranchesAndSchema();

    const { id } = await context.params;
    const restaurantId = Number(id);
    const body = await request.json();

    if (!restaurantId || isNaN(restaurantId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const data: any = {};

    const stringFields = [
      'nombre',
      'slug',
      'subdominio',
      'dominio',
      'eslogan',
      'descripcion',
      'logo',
      'favicon',
      'bannerHero',
      'colorPrimario',
      'colorSecundario',
      'colorTerciario',
      'colorAcento',
      'colorFondo',
      'colorSuperficie',
      'colorTexto',
      'colorTextoSecundario',
      'colorBorde',
      'colorBoton',
      'colorBotonTexto',
      'colorNavegacion',
      'colorExito',
      'colorAlerta',
      'colorError',
      'plantilla',
      'tituloHero',
      'subtituloHero',
      'descripcionHero',
      'textoBotonHero',
      'bannerPromocional',
      'textoPromocional',
      'tituloSeccionMenu',
      'tituloSeccionDestacados',
      'ordenSecciones',
      'horarioAtencion',
      'redesSociales',
      'tipografia',
      'radioBordes',
      'estiloTarjetas',
      'aparienciaMenu',
      'aparienciaAdmin',
      'politicaStockNegativo',
      'telefono',
      'telefonoWhatsapp',
      'mensajeWhatsappDefault',
      'email',
      'correoRemitente',
      'correoDestinatario',
      'imagenHero',
      'instagram',
      'direccionCentral',
      'ciudad',
      'plan',
      'estadoLicencia',
      'notasSuperadmin',
      'modulosActivos',
      'seoTitulo',
      'seoDescripcion',
      'seoKeywords',
      'seoTipoNegocio',
      'seoImagenCompartir',
      'seoUrlCanonica',
      'googleSearchConsoleCode',
      'googleAnalyticsId',
    ];

    for (const field of stringFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    if (body.slug) {
      data.slug = String(body.slug)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }

    if (body.subdominio !== undefined) {
      data.subdominio = body.subdominio
        ? String(body.subdominio)
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9-]/g, '')
        : null;
    }

    const booleanFields = [
      'mostrarHero',
      'mostrarCategorias',
      'mostrarDestacados',
      'mostrarPromociones',
      'mostrarResenas',
      'mostrarHorarios',
      'mostrarEnLanding',
      'activo',
    ];

    for (const field of booleanFields) {
      if (body[field] !== undefined) {
        data[field] = Boolean(body[field]);
      }
    }

    if (body.columnasMenu !== undefined) {
      data.columnasMenu = Number(body.columnasMenu);
    }
    if (body.costoDomicilioBase !== undefined) {
      data.costoDomicilioBase = Number(body.costoDomicilioBase);
    }
    if (body.propinaSugeridaPct !== undefined) {
      data.propinaSugeridaPct = Number(body.propinaSugeridaPct);
    }
    if (body.fechaVencimiento !== undefined) {
      data.fechaVencimiento = body.fechaVencimiento ? new Date(body.fechaVencimiento) : null;
    }

    // 1. Always apply direct SQL updates for critical status/visibility fields first
    // so Suspend / Activate / Landing Toggle ALWAYS succeed immediately
    if (data.activo !== undefined) {
      const activeInt = data.activo ? 1 : 0;
      const licState = data.estadoLicencia || (data.activo ? 'ACTIVA' : 'SUSPENDIDA');
      await prisma.$executeRawUnsafe(
        "UPDATE `restaurants` SET `activo` = ?, `updatedAt` = NOW() WHERE `id` = ?;",
        activeInt,
        restaurantId
      ).catch(() => {});
      await prisma.$executeRawUnsafe(
        "UPDATE `restaurants` SET `estadoLicencia` = ? WHERE `id` = ?;",
        licState,
        restaurantId
      ).catch(() => {});
    } else if (data.estadoLicencia !== undefined) {
      await prisma.$executeRawUnsafe(
        "UPDATE `restaurants` SET `estadoLicencia` = ? WHERE `id` = ?;",
        data.estadoLicencia,
        restaurantId
      ).catch(() => {});
    }

    if (data.mostrarEnLanding !== undefined) {
      await prisma.$executeRawUnsafe(
        "UPDATE `restaurants` SET `mostrarEnLanding` = ? WHERE `id` = ?;",
        data.mostrarEnLanding ? 1 : 0,
        restaurantId
      ).catch(() => {});
    }

    if (data.fechaVencimiento !== undefined && data.fechaVencimiento) {
      await prisma.$executeRawUnsafe(
        "UPDATE `restaurants` SET `fechaVencimiento` = ? WHERE `id` = ?;",
        data.fechaVencimiento,
        restaurantId
      ).catch(() => {});
    }

    // 2. Update full restaurant fields if present
    if (Object.keys(data).length > 0) {
      try {
        await prisma.restaurant.update({
          where: { id: restaurantId },
          data,
        });
      } catch (updateErr: any) {
        console.warn('Extended restaurant update failed, retrying core fields:', updateErr?.message);
        const coreFields = [
          'nombre',
          'slug',
          'subdominio',
          'dominio',
          'eslogan',
          'descripcion',
          'logo',
          'bannerHero',
          'colorPrimario',
          'colorSecundario',
          'colorFondo',
          'telefonoWhatsapp',
          'direccionCentral',
          'ciudad',
          'costoDomicilioBase',
          'propinaSugeridaPct',
          'plan',
          'activo',
        ];
        const coreData: any = {};
        for (const k of coreFields) {
          if (data[k] !== undefined) coreData[k] = data[k];
        }

        if (Object.keys(coreData).length > 0) {
          try {
            await prisma.restaurant.update({
              where: { id: restaurantId },
              data: coreData,
            });
          } catch {
            // Raw SQL fallback for core fields
            if (coreData.nombre !== undefined) {
              await prisma.$executeRawUnsafe(
                `UPDATE \`restaurants\`
                 SET \`nombre\` = COALESCE(?, \`nombre\`),
                     \`slug\` = COALESCE(?, \`slug\`),
                     \`subdominio\` = COALESCE(?, \`subdominio\`),
                     \`eslogan\` = COALESCE(?, \`eslogan\`),
                     \`descripcion\` = COALESCE(?, \`descripcion\`),
                     \`logo\` = COALESCE(?, \`logo\`),
                     \`bannerHero\` = COALESCE(?, \`bannerHero\`),
                     \`colorPrimario\` = COALESCE(?, \`colorPrimario\`),
                     \`colorSecundario\` = COALESCE(?, \`colorSecundario\`),
                     \`colorFondo\` = COALESCE(?, \`colorFondo\`),
                     \`telefonoWhatsapp\` = COALESCE(?, \`telefonoWhatsapp\`),
                     \`direccionCentral\` = COALESCE(?, \`direccionCentral\`),
                     \`ciudad\` = COALESCE(?, \`ciudad\`),
                     \`plan\` = COALESCE(?, \`plan\`),
                     \`updatedAt\` = NOW()
                 WHERE \`id\` = ?;`,
                coreData.nombre ?? null,
                coreData.slug ?? null,
                coreData.subdominio ?? null,
                coreData.eslogan ?? null,
                coreData.descripcion ?? null,
                coreData.logo ?? null,
                coreData.bannerHero ?? null,
                coreData.colorPrimario ?? null,
                coreData.colorSecundario ?? null,
                coreData.colorFondo ?? null,
                coreData.telefonoWhatsapp ?? null,
                coreData.direccionCentral ?? null,
                coreData.ciudad ?? null,
                coreData.plan ?? null,
                restaurantId
              ).catch(() => {});
            }
          }
        }
      }
    }

    // 3. Ensure restaurant has at least 1 default branch (Sede Principal)
    const branches = await getOrCreateBranchesForRestaurant(restaurantId);
    const defaultBranchId = branches[0]?.id || null;

    // 4. Optional update of administrator user credentials
    if (body.adminEmail || body.adminPassword || body.adminNombre) {
      const cleanEmail = body.adminEmail ? String(body.adminEmail).trim().toLowerCase() : undefined;
      const cleanPassword = body.adminPassword ? String(body.adminPassword).trim() : undefined;
      const cleanName = body.adminNombre ? String(body.adminNombre).trim() : undefined;

      try {
        const existingAdmins: any[] = await prisma.$queryRawUnsafe(
          "SELECT `id` FROM `users` WHERE `restaurantId` = ? AND `rol` IN ('Administrador', 'Admin') ORDER BY `id` ASC LIMIT 1;",
          restaurantId
        );

        if (existingAdmins.length > 0) {
          const adminId = Number(existingAdmins[0].id);
          await prisma.user.update({
            where: { id: adminId },
            data: {
              ...(cleanEmail ? { email: cleanEmail } : {}),
              ...(cleanPassword ? { password: cleanPassword } : {}),
              ...(cleanName ? { nombre: cleanName } : {}),
            },
          });
        } else if (cleanEmail) {
          await prisma.user.create({
            data: {
              nombre: cleanName || `Admin ${data.nombre || 'Restaurante'}`,
              email: cleanEmail,
              password: cleanPassword || 'admin123',
              rol: 'Administrador',
              estado: 'Activo',
              restaurantId,
              branchId: defaultBranchId,
            },
          });
        }
      } catch (uErr) {
        console.warn('Error updating admin user:', uErr);
      }
    }

    // 5. Optional update of existing staff users
    if (Array.isArray(body.updatedUsers)) {
      for (const u of body.updatedUsers) {
        if (u.id) {
          await prisma.user
            .update({
              where: { id: Number(u.id) },
              data: {
                ...(u.nombre ? { nombre: String(u.nombre).trim() } : {}),
                ...(u.email ? { email: String(u.email).trim().toLowerCase() } : {}),
                ...(u.password ? { password: String(u.password).trim() } : {}),
                ...(u.rol ? { rol: String(u.rol) } : {}),
                ...(u.estado ? { estado: String(u.estado) } : {}),
                ...(u.branchId !== undefined ? { branchId: u.branchId ? Number(u.branchId) : defaultBranchId } : {}),
              },
            })
            .catch(() => {});
        }
      }
    }

    // 6. Optional creation of a new staff user
    if (body.newUser && body.newUser.email && body.newUser.password) {
      await prisma.user
        .create({
          data: {
            nombre: String(body.newUser.nombre || 'Colaborador').trim(),
            email: String(body.newUser.email).trim().toLowerCase(),
            password: String(body.newUser.password).trim(),
            rol: String(body.newUser.rol || 'Cajero'),
            estado: 'Activo',
            restaurantId,
            branchId: body.newUser.branchId ? Number(body.newUser.branchId) : defaultBranchId,
          },
        })
        .catch(() => {});
    }

    // 7. Optional deletion of a staff user
    if (body.deleteUserId) {
      await prisma.user
        .delete({
          where: { id: Number(body.deleteUserId) },
        })
        .catch(() => {});
    }

    // 8. Return full updated restaurant object with branches and users
    try {
      const fullUpdated = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        include: {
          branches: { orderBy: { id: 'asc' } },
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
        },
      });
      if (fullUpdated) {
        return NextResponse.json({
          ...fullUpdated,
          branches: fullUpdated.branches?.length ? fullUpdated.branches : branches,
        });
      }
    } catch {}

    // Raw SQL fallback for returning the updated restaurant
    const rawRestRows: any[] = await prisma.$queryRawUnsafe(
      "SELECT * FROM `restaurants` WHERE `id` = ? LIMIT 1;",
      restaurantId
    );
    const rawUsers: any[] = (await prisma
      .$queryRawUnsafe(
        "SELECT `id`, `nombre`, `email`, `password`, `rol`, `estado`, `branchId` FROM `users` WHERE `restaurantId` = ? ORDER BY `id` ASC;",
        restaurantId
      )
      .catch(() => [])) as any[];

    const r = rawRestRows[0] || { id: restaurantId, ...data };
    const isActivo = r.activo !== undefined ? Boolean(r.activo) : true;

    return NextResponse.json(
      serializeSafe({
        ...r,
        id: restaurantId,
        activo: isActivo,
        mostrarEnLanding: r.mostrarEnLanding !== undefined ? Boolean(r.mostrarEnLanding) : true,
        estadoLicencia: r.estadoLicencia || (isActivo ? 'ACTIVA' : 'SUSPENDIDA'),
        branches,
        users: rawUsers,
      })
    );
  } catch (error) {
    console.error('Error updating restaurant:', error);
    return NextResponse.json({ error: 'Error al actualizar el restaurante' }, { status: 500 });
  }
}

// DELETE /api/restaurants/[id]
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const restaurantId = Number(id);

    if (restaurantId === 1) {
      return NextResponse.json(
        { error: 'No se puede eliminar el restaurante matriz principal (ID 1). Usa Limpiar / Reset desde cero si deseas vaciar sus datos.' },
        { status: 400 }
      );
    }

    // Limpiar todas las tablas hijas antes de borrar el restaurante
    await prisma.$executeRawUnsafe(
      'DELETE FROM `order_items` WHERE `orderId` IN (SELECT `id` FROM `orders` WHERE `restaurantId` = ?);',
      restaurantId
    ).catch(() => {});
    const childTables = [
      'invoices',
      'orders',
      'cash_shifts',
      'reviews',
      'products',
      'subcategories',
      'categories',
      'addons',
      'restaurant_tables',
      'users',
      'branches',
    ];
    for (const tbl of childTables) {
      await prisma.$executeRawUnsafe(`DELETE FROM \`${tbl}\` WHERE \`restaurantId\` = ?;`, restaurantId).catch(() => {});
    }

    await prisma.$executeRawUnsafe('DELETE FROM `restaurants` WHERE `id` = ?;', restaurantId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    return NextResponse.json({ error: 'Error al eliminar restaurante' }, { status: 500 });
  }
}
