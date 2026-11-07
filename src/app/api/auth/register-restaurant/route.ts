import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with -
    .replace(/^-+|-+$/g, ''); // remove leading/trailing -
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      nombreRestaurante,
      nombreAdmin,
      email,
      password,
      telefonoWhatsapp,
      ciudad = 'Cali',
      colorPrimario = '#FFC928',
      bannerHero = '/images/assets/burger-hero-transparent.png',
      eslogan = 'Tu Máximo Placer Gastronómico',
      descripcion = '',
      plantilla = 'plantilla-actual',
    } = body;

    // Validaciones básicas
    if (!nombreRestaurante?.trim()) {
      return NextResponse.json({ error: 'El nombre del restaurante es obligatorio' }, { status: 400 });
    }
    if (!nombreAdmin?.trim()) {
      return NextResponse.json({ error: 'El nombre del administrador es obligatorio' }, { status: 400 });
    }
    if (!email?.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'Debes proporcionar un correo electrónico válido' }, { status: 400 });
    }
    if (!password || password.length < 4) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 4 caracteres' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Validar si el correo ya está registrado
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta registrada con este correo electrónico. Inicia sesión o usa otro correo.' },
        { status: 409 }
      );
    }

    // Generar slug único para el restaurante
    let baseSlug = slugify(nombreRestaurante);
    if (!baseSlug || baseSlug.length < 2) baseSlug = 'restaurante';

    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await prisma.restaurant.findUnique({ where: { slug: uniqueSlug } })) {
      counter++;
      uniqueSlug = `${baseSlug}-${counter}`;
    }

    // Calcular fecha de vencimiento del periodo de prueba (14 días gratis)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    // Crear el Restaurante en la base de datos
    const restaurant = await prisma.restaurant.create({
      data: {
        nombre: nombreRestaurante.trim(),
        slug: uniqueSlug,
        subdominio: uniqueSlug.replace(/-/g, ''),
        eslogan: eslogan.trim(),
        descripcion: descripcion.trim() || `Los mejores sabores en ${ciudad}. Haz tu pedido en línea o por WhatsApp.`,
        bannerHero,
        colorPrimario,
        colorBoton: colorPrimario,
        colorAcento: colorPrimario,
        colorFondo: '#080808',
        colorSuperficie: '#121212',
        colorTexto: '#ffffff',
        plantilla,
        tituloHero: nombreRestaurante.trim().toUpperCase(),
        subtituloHero: eslogan.trim(),
        descripcionHero: `Bienvenidos a ${nombreRestaurante.trim()}. Disfruta de nuestras especialidades preparadas con ingredientes frescos y recetas de la casa.`,
        telefonoWhatsapp: telefonoWhatsapp ? telefonoWhatsapp.replace(/\D/g, '') : '',
        ciudad: ciudad.trim() || 'Cali',
        plan: 'Trial',
        activo: true,
        fechaVencimiento: trialEndDate,
        estadoLicencia: 'PRUEBA_GRATIS',
        limiteSedes: 2,
        limiteProductos: 50,
        limiteUsuarios: 5,
        diasGracia: 5,
      },
    });

    // Crear la primera sede por defecto para el restaurante
    const branchSlug = `${uniqueSlug}-principal`;
    const branch = await prisma.branch.create({
      data: {
        nombre: `Sede Principal - ${restaurant.nombre}`,
        slug: branchSlug,
        ciudad: restaurant.ciudad,
        direccion: `Sede Principal, ${restaurant.ciudad}`,
        telefono: restaurant.telefonoWhatsapp || '',
        activo: true,
        restaurantId: restaurant.id,
      },
    });

    // Crear el usuario administrador del restaurante
    const user = await prisma.user.create({
      data: {
        nombre: nombreAdmin.trim(),
        email: cleanEmail,
        password: password.trim(), // En producción se recomienda bcrypt
        rol: 'Administrador',
        estado: 'Activo',
        restaurantId: restaurant.id,
        branchId: branch.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: '¡Restaurante y cuenta creados con éxito! Tu periodo de prueba de 14 días está activo.',
      restaurant: {
        id: restaurant.id,
        nombre: restaurant.nombre,
        slug: restaurant.slug,
        plan: restaurant.plan,
        colorPrimario: restaurant.colorPrimario,
      },
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        restaurantId: restaurant.id,
        restaurant: {
          id: restaurant.id,
          nombre: restaurant.nombre,
          slug: restaurant.slug,
        },
      },
      redirectUrl: `/r/${restaurant.slug}/admin`,
    });
  } catch (error) {
    console.error('Error registrando restaurante:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error al registrar el restaurante. Por favor intenta de nuevo.' },
      { status: 500 }
    );
  }
}
