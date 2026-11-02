const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const defaultUsers = [
  {
    nombre: 'Super Administrador',
    email: 'superadmin@puntog.com',
    password: 'admin123',
    rol: 'Superadmin',
    estado: 'Activo',
  },
  {
    nombre: 'Administrador',
    email: 'admin@puntog.com',
    password: 'admin123',
    rol: 'Administrador',
    estado: 'Activo',
  },
  {
    nombre: 'Cajero Principal',
    email: 'cajero@puntog.com',
    password: 'admin123',
    rol: 'Cajero',
    estado: 'Activo',
  },
  {
    nombre: 'Chef Cocina',
    email: 'cocina@puntog.com',
    password: 'cocina123',
    rol: 'Cocinero',
    estado: 'Activo',
  },
];

async function seedDefaultUsers() {
  console.log('🔄 Verificando usuarios esenciales por defecto (superadmin / admin)...');
  try {
    for (const u of defaultUsers) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {
          rol: u.rol,
          estado: u.estado,
        },
        create: u,
      });
      console.log(` ✅ Usuario listo: ${u.nombre} (${u.email}) [Rol: ${u.rol}]`);
    }
    console.log('✨ Usuarios iniciales sincronizados exitosamente.');
  } catch (error) {
    console.error('⚠️ Error al sincronizar usuarios por defecto:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDefaultUsers();
