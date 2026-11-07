import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: Number(params.id) },
      include: {
        branches: true,
        users: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
            estado: true,
            password: true,
            branchId: true,
          },
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
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 });
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar restaurante' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const restaurantId = Number(params.id);
    const body = await req.json();

    const data: any = {};
    if (body.nombre !== undefined) data.nombre = body.nombre;
    if (body.eslogan !== undefined) data.eslogan = body.eslogan;
    if (body.descripcion !== undefined) data.descripcion = body.descripcion;
    if (body.logo !== undefined) data.logo = body.logo;
    if (body.bannerHero !== undefined) data.bannerHero = body.bannerHero;
    if (body.colorPrimario !== undefined) data.colorPrimario = body.colorPrimario;
    if (body.colorSecundario !== undefined) data.colorSecundario = body.colorSecundario;
    if (body.colorTerciario !== undefined) data.colorTerciario = body.colorTerciario;
    if (body.colorAcento !== undefined) data.colorAcento = body.colorAcento;
    if (body.colorFondo !== undefined) data.colorFondo = body.colorFondo;
    if (body.colorSuperficie !== undefined) data.colorSuperficie = body.colorSuperficie;
    if (body.colorTexto !== undefined) data.colorTexto = body.colorTexto;
    if (body.colorTextoSecundario !== undefined) data.colorTextoSecundario = body.colorTextoSecundario;
    if (body.colorBorde !== undefined) data.colorBorde = body.colorBorde;
    if (body.colorBoton !== undefined) data.colorBoton = body.colorBoton;
    if (body.colorBotonTexto !== undefined) data.colorBotonTexto = body.colorBotonTexto;
    if (body.colorNavegacion !== undefined) data.colorNavegacion = body.colorNavegacion;
    if (body.colorExito !== undefined) data.colorExito = body.colorExito;
    if (body.colorAlerta !== undefined) data.colorAlerta = body.colorAlerta;
    if (body.colorError !== undefined) data.colorError = body.colorError;

    // Plantillas y Secciones
    if (body.plantilla !== undefined) data.plantilla = body.plantilla;
    if (body.tituloHero !== undefined) data.tituloHero = body.tituloHero;
    if (body.subtituloHero !== undefined) data.subtituloHero = body.subtituloHero;
    if (body.descripcionHero !== undefined) data.descripcionHero = body.descripcionHero;
    if (body.textoBotonHero !== undefined) data.textoBotonHero = body.textoBotonHero;
    if (body.bannerPromocional !== undefined) data.bannerPromocional = body.bannerPromocional;
    if (body.textoPromocional !== undefined) data.textoPromocional = body.textoPromocional;
    if (body.tituloSeccionMenu !== undefined) data.tituloSeccionMenu = body.tituloSeccionMenu;
    if (body.tituloSeccionDestacados !== undefined) data.tituloSeccionDestacados = body.tituloSeccionDestacados;
    if (body.mostrarHero !== undefined) data.mostrarHero = Boolean(body.mostrarHero);
    if (body.mostrarCategorias !== undefined) data.mostrarCategorias = Boolean(body.mostrarCategorias);
    if (body.mostrarDestacados !== undefined) data.mostrarDestacados = Boolean(body.mostrarDestacados);
    if (body.mostrarPromociones !== undefined) data.mostrarPromociones = Boolean(body.mostrarPromociones);
    if (body.mostrarResenas !== undefined) data.mostrarResenas = Boolean(body.mostrarResenas);
    if (body.mostrarHorarios !== undefined) data.mostrarHorarios = Boolean(body.mostrarHorarios);
    if (body.ordenSecciones !== undefined) data.ordenSecciones = body.ordenSecciones;
    if (body.horarioAtencion !== undefined) data.horarioAtencion = body.horarioAtencion;
    if (body.redesSociales !== undefined) data.redesSociales = typeof body.redesSociales === 'string' ? body.redesSociales : JSON.stringify(body.redesSociales);

    // Tipografía y Estilo
    if (body.tipografia !== undefined) data.tipografia = body.tipografia;
    if (body.radioBordes !== undefined) data.radioBordes = body.radioBordes;
    if (body.estiloTarjetas !== undefined) data.estiloTarjetas = body.estiloTarjetas;
    if (body.columnasMenu !== undefined) data.columnasMenu = Number(body.columnasMenu);

    // SEO y Posicionamiento
    if (body.seoTitulo !== undefined) data.seoTitulo = body.seoTitulo;
    if (body.seoDescripcion !== undefined) data.seoDescripcion = body.seoDescripcion;
    if (body.seoKeywords !== undefined) data.seoKeywords = body.seoKeywords;
    if (body.seoTipoNegocio !== undefined) data.seoTipoNegocio = body.seoTipoNegocio;
    if (body.seoImagenCompartir !== undefined) data.seoImagenCompartir = body.seoImagenCompartir;
    if (body.seoUrlCanonica !== undefined) data.seoUrlCanonica = body.seoUrlCanonica;
    if (body.googleSearchConsoleCode !== undefined) data.googleSearchConsoleCode = body.googleSearchConsoleCode;
    if (body.googleAnalyticsId !== undefined) data.googleAnalyticsId = body.googleAnalyticsId;
    if (body.favicon !== undefined) data.favicon = body.favicon;
    if (body.telefonoWhatsapp !== undefined) data.telefonoWhatsapp = body.telefonoWhatsapp;
    if (body.mensajeWhatsappDefault !== undefined) data.mensajeWhatsappDefault = body.mensajeWhatsappDefault;
    if (body.email !== undefined) data.email = body.email;
    if (body.correoRemitente !== undefined) data.correoRemitente = body.correoRemitente;
    if (body.correoDestinatario !== undefined) data.correoDestinatario = body.correoDestinatario;
    if (body.instagram !== undefined) data.instagram = body.instagram;
    if (body.direccionCentral !== undefined) data.direccionCentral = body.direccionCentral;
    if (body.ciudad !== undefined) data.ciudad = body.ciudad;
    if (body.costoDomicilioBase !== undefined) data.costoDomicilioBase = Number(body.costoDomicilioBase);
    if (body.propinaSugeridaPct !== undefined) data.propinaSugeridaPct = Number(body.propinaSugeridaPct);
    if (body.plan !== undefined) data.plan = body.plan;
    if (body.activo !== undefined) data.activo = Boolean(body.activo);
    if (body.dominio !== undefined) data.dominio = body.dominio || null;

    // Control de Licencias y Suscripciones SaaS
    if (body.fechaVencimiento !== undefined) data.fechaVencimiento = body.fechaVencimiento ? new Date(body.fechaVencimiento) : null;
    if (body.limiteSedes !== undefined) data.limiteSedes = Number(body.limiteSedes);
    if (body.limiteProductos !== undefined) data.limiteProductos = Number(body.limiteProductos);
    if (body.limiteUsuarios !== undefined) data.limiteUsuarios = Number(body.limiteUsuarios);
    if (body.diasGracia !== undefined) data.diasGracia = Number(body.diasGracia);
    if (body.estadoLicencia !== undefined) data.estadoLicencia = body.estadoLicencia;

    // Database server configuration (Superadmin only)
    if (body.databaseType !== undefined) data.databaseType = body.databaseType;
    if (body.dbHost !== undefined) data.dbHost = body.dbHost || null;
    if (body.dbPort !== undefined) data.dbPort = body.dbPort ? Number(body.dbPort) : null;
    if (body.dbName !== undefined) data.dbName = body.dbName || null;
    if (body.dbUser !== undefined) data.dbUser = body.dbUser || null;
    if (body.dbPassword !== undefined) data.dbPassword = body.dbPassword || null;
    if (body.dbConnectionUrl !== undefined) data.dbConnectionUrl = body.dbConnectionUrl || null;
    if (body.dbStatus !== undefined) data.dbStatus = body.dbStatus || null;

    const updated = await prisma.restaurant.update({
      where: { id: restaurantId },
      data,
      include: {
        branches: true,
      },
    });

    // Handle Admin user updates or password changes
    if (body.adminEmail || body.adminPassword || body.adminNombre) {
      const existingAdmin = await prisma.user.findFirst({
        where: {
          restaurantId,
          rol: { in: ['Administrador', 'Superadmin'] },
        },
      });

      if (existingAdmin) {
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: {
            ...(body.adminNombre ? { nombre: body.adminNombre } : {}),
            ...(body.adminEmail ? { email: body.adminEmail.trim().toLowerCase() } : {}),
            ...(body.adminPassword ? { password: body.adminPassword.trim() } : {}),
          },
        });
      } else if (body.adminEmail && body.adminPassword) {
        await prisma.user.create({
          data: {
            nombre: body.adminNombre || `Admin ${body.nombre || 'Restaurante'}`,
            email: body.adminEmail.trim().toLowerCase(),
            password: body.adminPassword.trim(),
            rol: 'Administrador',
            estado: 'Activo',
            restaurantId,
          },
        });
      }
    }

    // Handle updates for other restaurant staff users (passwords, roles, names)
    if (Array.isArray(body.updatedUsers)) {
      for (const u of body.updatedUsers) {
        if (u.id) {
          const updateData: any = {};
          if (u.nombre) updateData.nombre = u.nombre;
          if (u.email) updateData.email = u.email.trim().toLowerCase();
          if (u.password && u.password.trim()) updateData.password = u.password.trim();
          if (u.rol) updateData.rol = u.rol;
          if (u.estado) updateData.estado = u.estado;

          await prisma.user.update({
            where: { id: Number(u.id) },
            data: updateData,
          });
        }
      }
    }

    // Handle creating a new user for this restaurant
    if (body.newUser && body.newUser.email && body.newUser.password) {
      await prisma.user.create({
        data: {
          nombre: body.newUser.nombre || 'Nuevo Usuario',
          email: body.newUser.email.trim().toLowerCase(),
          password: body.newUser.password.trim(),
          rol: body.newUser.rol || 'Mesero',
          estado: 'Activo',
          restaurantId,
          branchId: body.newUser.branchId ? Number(body.newUser.branchId) : null,
        },
      });
    }

    // Handle deleting a user
    if (body.deleteUserId) {
      await prisma.user.delete({
        where: { id: Number(body.deleteUserId) },
      }).catch(console.error);
    }

    // Fetch the updated restaurant with users and branches
    const finalRestaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        branches: true,
        users: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
            estado: true,
            password: true,
            branchId: true,
          },
        },
      },
    });

    return NextResponse.json(finalRestaurant || updated);
  } catch (error) {
    console.error('Error updating restaurant:', error);
    return NextResponse.json({ error: 'Error al actualizar restaurante' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const restaurantId = Number(params.id);
    // Proteger restaurante principal Punto G (id 1)
    if (restaurantId === 1) {
      return NextResponse.json({ error: 'No es posible eliminar el restaurante principal de la plataforma' }, { status: 400 });
    }

    await prisma.restaurant.delete({
      where: { id: restaurantId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar restaurante' }, { status: 500 });
  }
}
