import { prisma } from '@/lib/prisma';

export interface CouponItem {
  id: number;
  codigo: string;
  descripcion: string;
  tipoDescuento: 'porcentaje' | 'fijo' | 'envio';
  valor: number;
  montoMinimo: number;
  usoMaximo: number;
  usosActuales: number;
  fechaInicio: string | null;
  fechaFin: string | null;
  activo: boolean;
  mostrarEnCarrito: boolean;
  soloDomicilio: boolean;
  restaurantId: number;
  createdAt?: string;
  updatedAt?: string;
  estadoVigencia?: 'VIGENTE' | 'PROGRAMADO' | 'EXPIRADO' | 'AGOTADO' | 'INACTIVO';
}

let lastCouponsInitAt = 0;

export async function ensureCouponsTable(force = false): Promise<void> {
  const now = Date.now();
  if (!force && now - lastCouponsInitAt < 60_000) return;
  lastCouponsInitAt = now;

  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`coupons\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`codigo\` VARCHAR(64) NOT NULL,
        \`descripcion\` VARCHAR(255) NOT NULL DEFAULT '',
        \`tipoDescuento\` VARCHAR(32) NOT NULL DEFAULT 'porcentaje',
        \`valor\` DOUBLE NOT NULL DEFAULT 10,
        \`montoMinimo\` DOUBLE NOT NULL DEFAULT 0,
        \`usoMaximo\` INT NOT NULL DEFAULT 0,
        \`usosActuales\` INT NOT NULL DEFAULT 0,
        \`fechaInicio\` DATETIME(3) NULL,
        \`fechaFin\` DATETIME(3) NULL,
        \`activo\` TINYINT(1) NOT NULL DEFAULT 1,
        \`mostrarEnCarrito\` TINYINT(1) NOT NULL DEFAULT 1,
        \`soloDomicilio\` TINYINT(1) NOT NULL DEFAULT 0,
        \`restaurantId\` INT NOT NULL DEFAULT 1,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`coupons_restaurantId_codigo_key\` (\`restaurantId\`, \`codigo\`),
        INDEX \`coupons_restaurantId_idx\` (\`restaurantId\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
  } catch (err) {
    console.warn('Warning ensuring coupons table:', err);
  }
}

export function computeCouponStatus(c: {
  activo: boolean;
  usoMaximo: number;
  usosActuales: number;
  fechaInicio: string | null;
  fechaFin: string | null;
}): 'VIGENTE' | 'PROGRAMADO' | 'EXPIRADO' | 'AGOTADO' | 'INACTIVO' {
  if (!c.activo) return 'INACTIVO';
  if (c.usoMaximo > 0 && c.usosActuales >= c.usoMaximo) return 'AGOTADO';
  const now = Date.now();
  if (c.fechaInicio) {
    const startMs = new Date(c.fechaInicio).getTime();
    if (!isNaN(startMs) && now < startMs) return 'PROGRAMADO';
  }
  if (c.fechaFin) {
    const endMs = new Date(c.fechaFin).getTime();
    if (!isNaN(endMs) && now > endMs) return 'EXPIRADO';
  }
  return 'VIGENTE';
}

export function normalizeCouponRow(row: any): CouponItem {
  const item: CouponItem = {
    id: Number(row.id),
    codigo: String(row.codigo || '').toUpperCase().trim(),
    descripcion: String(row.descripcion || ''),
    tipoDescuento:
      row.tipoDescuento === 'fijo' || row.tipoDescuento === 'envio'
        ? row.tipoDescuento
        : 'porcentaje',
    valor: Number(row.valor || 0),
    montoMinimo: Number(row.montoMinimo || 0),
    usoMaximo: Number(row.usoMaximo || 0),
    usosActuales: Number(row.usosActuales || 0),
    fechaInicio: row.fechaInicio ? new Date(row.fechaInicio).toISOString() : null,
    fechaFin: row.fechaFin ? new Date(row.fechaFin).toISOString() : null,
    activo: Boolean(row.activo),
    mostrarEnCarrito: row.mostrarEnCarrito !== undefined ? Boolean(row.mostrarEnCarrito) : true,
    soloDomicilio: Boolean(row.soloDomicilio),
    restaurantId: Number(row.restaurantId || 1),
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : undefined,
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : undefined,
  };
  item.estadoVigencia = computeCouponStatus({
    activo: item.activo,
    usoMaximo: item.usoMaximo,
    usosActuales: item.usosActuales,
    fechaInicio: item.fechaInicio,
    fechaFin: item.fechaFin,
  });
  return item;
}
