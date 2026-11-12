import { prisma } from '@/lib/prisma';

export interface SaasPlanItem {
  id: number;
  codigo: string; // 'Basico', 'Pro', 'Enterprise'
  nombre: string; // 'Básico', 'Intermedio', 'Enterprise'
  subtitulo: string;
  emoji: string;
  precioMensual: number;
  precioAnual: number;
  moneda: string;
  badgeTexto: string | null;
  destacado: boolean;
  caracteristicas: string[];
  limiteSedes: number;
  limiteProductos: number;
  limiteUsuarios: number;
  ctaTexto: string;
  tipoAccion: 'registro' | 'whatsapp';
  activo: boolean;
  orden: number;
  updatedAt?: string;
}

export const DEFAULT_SAAS_PLANS: SaasPlanItem[] = [
  {
    id: 1,
    codigo: 'Basico',
    nombre: 'Básico',
    subtitulo: 'Perfecto para empezar',
    emoji: '🚀',
    precioMensual: 29990,
    precioAnual: 299900,
    moneda: 'COP',
    badgeTexto: null,
    destacado: false,
    caracteristicas: ['1 restaurante (1 Sede)', 'Menú QR y POS', 'Reportes básicos'],
    limiteSedes: 1,
    limiteProductos: 80,
    limiteUsuarios: 5,
    ctaTexto: 'Comenzar Ahora',
    tipoAccion: 'registro',
    activo: true,
    orden: 1,
  },
  {
    id: 2,
    codigo: 'Pro',
    nombre: 'Intermedio',
    subtitulo: 'Crece sin límites',
    emoji: '👑',
    precioMensual: 49990,
    precioAnual: 499900,
    moneda: 'COP',
    badgeTexto: 'Más Popular 🔥',
    destacado: true,
    caracteristicas: ['Hasta 3 sedes o restaurantes', 'Inventario y recetas', 'Reportes avanzados'],
    limiteSedes: 3,
    limiteProductos: 300,
    limiteUsuarios: 20,
    ctaTexto: 'Comenzar Ahora',
    tipoAccion: 'registro',
    activo: true,
    orden: 2,
  },
  {
    id: 3,
    codigo: 'Enterprise',
    nombre: 'Enterprise',
    subtitulo: 'Para grandes negocios',
    emoji: '💎',
    precioMensual: 89990,
    precioAnual: 899900,
    moneda: 'COP',
    badgeTexto: null,
    destacado: false,
    caracteristicas: ['Sedes y restaurantes ilimitados', 'Soporte prioritario 24/7', 'Todas las funciones & BD dedicada'],
    limiteSedes: 99,
    limiteProductos: 5000,
    limiteUsuarios: 200,
    ctaTexto: 'Contactar Ventas',
    tipoAccion: 'whatsapp',
    activo: true,
    orden: 3,
  },
];

let lastPlanTableInitAt = 0;

export async function ensureSaasPlansTableAndDefaults(force = false): Promise<void> {
  const now = Date.now();
  if (!force && now - lastPlanTableInitAt < 60_000) return;
  lastPlanTableInitAt = now;

  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`saas_plans\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`codigo\` VARCHAR(64) NOT NULL,
        \`nombre\` VARCHAR(120) NOT NULL,
        \`subtitulo\` VARCHAR(255) NOT NULL DEFAULT '',
        \`emoji\` VARCHAR(32) NOT NULL DEFAULT '🚀',
        \`precioMensual\` DOUBLE NOT NULL DEFAULT 29990,
        \`precioAnual\` DOUBLE NOT NULL DEFAULT 299900,
        \`moneda\` VARCHAR(16) NOT NULL DEFAULT 'COP',
        \`badgeTexto\` VARCHAR(120) NULL,
        \`destacado\` TINYINT(1) NOT NULL DEFAULT 0,
        \`caracteristicasJson\` TEXT NOT NULL,
        \`limiteSedes\` INT NOT NULL DEFAULT 1,
        \`limiteProductos\` INT NOT NULL DEFAULT 100,
        \`limiteUsuarios\` INT NOT NULL DEFAULT 10,
        \`ctaTexto\` VARCHAR(80) NOT NULL DEFAULT 'Comenzar Ahora',
        \`tipoAccion\` VARCHAR(32) NOT NULL DEFAULT 'registro',
        \`activo\` TINYINT(1) NOT NULL DEFAULT 1,
        \`orden\` INT NOT NULL DEFAULT 1,
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`saas_plans_codigo_key\` (\`codigo\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);

    const existing: any[] = await prisma.$queryRawUnsafe(
      'SELECT `codigo` FROM `saas_plans`;'
    );
    const existingSet = new Set(existing.map((r) => String(r.codigo).toLowerCase()));

    for (const def of DEFAULT_SAAS_PLANS) {
      if (!existingSet.has(def.codigo.toLowerCase())) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO \`saas_plans\`
           (\`codigo\`, \`nombre\`, \`subtitulo\`, \`emoji\`, \`precioMensual\`, \`precioAnual\`, \`moneda\`, \`badgeTexto\`, \`destacado\`, \`caracteristicasJson\`, \`limiteSedes\`, \`limiteProductos\`, \`limiteUsuarios\`, \`ctaTexto\`, \`tipoAccion\`, \`activo\`, \`orden\`, \`updatedAt\`)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW());`,
          def.codigo,
          def.nombre,
          def.subtitulo,
          def.emoji,
          def.precioMensual,
          def.precioAnual,
          def.moneda,
          def.badgeTexto,
          def.destacado ? 1 : 0,
          JSON.stringify(def.caracteristicas),
          def.limiteSedes,
          def.limiteProductos,
          def.limiteUsuarios,
          def.ctaTexto,
          def.tipoAccion,
          def.activo ? 1 : 0,
          def.orden
        ).catch(() => {});
      }
    }
  } catch (err) {
    console.warn('Warning ensuring saas_plans table:', err);
  }
}

export function normalizePlanRow(row: any): SaasPlanItem {
  let features: string[] = [];
  try {
    const parsed = JSON.parse(row.caracteristicasJson || '[]');
    if (Array.isArray(parsed)) {
      features = parsed.map((x) => String(x));
    }
  } catch {
    features = [];
  }

  return {
    id: Number(row.id),
    codigo: String(row.codigo || 'Pro'),
    nombre: String(row.nombre || row.codigo || 'Plan'),
    subtitulo: String(row.subtitulo || ''),
    emoji: String(row.emoji || '🚀'),
    precioMensual: Number(row.precioMensual || 0),
    precioAnual: Number(row.precioAnual || 0),
    moneda: String(row.moneda || 'COP'),
    badgeTexto: row.badgeTexto ? String(row.badgeTexto) : null,
    destacado: Boolean(row.destacado),
    caracteristicas: features,
    limiteSedes: Number(row.limiteSedes || 1),
    limiteProductos: Number(row.limiteProductos || 100),
    limiteUsuarios: Number(row.limiteUsuarios || 10),
    ctaTexto: String(row.ctaTexto || 'Comenzar Ahora'),
    tipoAccion: row.tipoAccion === 'whatsapp' ? 'whatsapp' : 'registro',
    activo: row.activo !== undefined ? Boolean(row.activo) : true,
    orden: Number(row.orden || 1),
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : undefined,
  };
}

export async function getSaasPlans(onlyActive = false): Promise<SaasPlanItem[]> {
  try {
    await ensureSaasPlansTableAndDefaults();
    const sql = onlyActive
      ? 'SELECT * FROM `saas_plans` WHERE `activo` = 1 ORDER BY `orden` ASC, `id` ASC;'
      : 'SELECT * FROM `saas_plans` ORDER BY `orden` ASC, `id` ASC;';
    const rows: any[] = await prisma.$queryRawUnsafe(sql);
    if (rows && rows.length > 0) {
      return rows.map(normalizePlanRow);
    }
  } catch (err) {
    console.warn('Falling back to default SaaS plans:', err);
  }
  return DEFAULT_SAAS_PLANS;
}

export async function getPlanLimitsByCode(planCode: string): Promise<{
  plan: string;
  limiteSedes: number;
  limiteProductos: number;
  limiteUsuarios: number;
}> {
  const clean = (planCode || 'Pro').trim().toLowerCase();
  const plans = await getSaasPlans();
  const matched =
    plans.find((p) => p.codigo.toLowerCase() === clean || p.nombre.toLowerCase() === clean) ||
    plans.find((p) => clean === 'intermedio' && p.codigo === 'Pro') ||
    plans.find((p) => clean === 'basico' && p.codigo === 'Basico') ||
    plans.find((p) => p.codigo === 'Pro') ||
    DEFAULT_SAAS_PLANS[1];

  return {
    plan: matched.codigo,
    limiteSedes: matched.limiteSedes,
    limiteProductos: matched.limiteProductos,
    limiteUsuarios: matched.limiteUsuarios,
  };
}

export function formatCopPrice(amount: number): string {
  return '$' + Math.round(Number(amount) || 0).toLocaleString('es-CO');
}
