import { prisma } from '@/lib/prisma';

export interface TenantScope {
  restaurantId: number;
  restaurantSlug: string;
  isDefault: boolean;
}

/**
 * Resuelve el restaurante (tenant) de forma segura y obligatoria a partir de la petición.
 * Previene fugas de datos entre restaurantes si no se envían parámetros.
 * 
 * Prioridad de detección:
 * 1. Query params: ?restaurantSlug=... o ?restaurantId=...
 * 2. Headers: x-restaurant-slug o x-restaurant-id
 * 3. Referer / URL de origen: /r/[slug]/...
 * 4. Fallback seguro: Restaurante principal (id: 1, slug: 'punto-g')
 */
export async function resolveTenantScope(
  req: Request,
  fallbackBody?: { restaurantId?: any; restaurantSlug?: any }
): Promise<TenantScope> {
  const url = new URL(req.url);
  const qSlug = url.searchParams.get('restaurantSlug') || url.searchParams.get('slug');
  const qId = url.searchParams.get('restaurantId');

  const hSlug = req.headers.get('x-restaurant-slug');
  const hId = req.headers.get('x-restaurant-id');

  // Detectar desde referer si la petición la hace el frontend
  let refererSlug: string | null = null;
  const referer = req.headers.get('referer');
  if (referer) {
    const match = referer.match(/\/r\/([^\/\?#]+)/);
    if (match && match[1]) {
      refererSlug = match[1];
    }
  }

  const targetSlug = qSlug || hSlug || refererSlug || fallbackBody?.restaurantSlug;
  const targetId = qId || hId || fallbackBody?.restaurantId;

  // 1. Si viene ID numérico directo
  if (targetId && targetId !== 'all' && targetId !== 'todas' && !isNaN(Number(targetId))) {
    const idNum = Number(targetId);
    const rest = await prisma.restaurant.findUnique({
      where: { id: idNum },
      select: { id: true, slug: true },
    });
    if (rest) {
      return { restaurantId: rest.id, restaurantSlug: rest.slug, isDefault: false };
    }
  }

  // 2. Si viene Slug
  if (targetSlug && targetSlug !== 'all' && targetSlug !== 'todas') {
    const cleanSlug = targetSlug.toLowerCase().trim();
    const slugWithHyphen = cleanSlug === 'puntog' ? 'punto-g' : cleanSlug;
    const rest = await prisma.restaurant.findFirst({
      where: {
        OR: [
          { slug: cleanSlug },
          { subdominio: cleanSlug },
          { slug: slugWithHyphen },
        ],
      },
      select: { id: true, slug: true },
    });
    if (rest) {
      return { restaurantId: rest.id, restaurantSlug: rest.slug, isDefault: false };
    }
  }

  // 3. Fallback seguro al restaurante principal (Punto G, ID 1) para evitar retornar datos cruzados
  const defaultRest = await prisma.restaurant.findFirst({
    where: { OR: [{ id: 1 }, { slug: 'punto-g' }] },
    select: { id: true, slug: true },
  });

  if (defaultRest) {
    return { restaurantId: defaultRest.id, restaurantSlug: defaultRest.slug, isDefault: true };
  }

  // En caso de base de datos vacía, devolver 1 como fallback
  return { restaurantId: 1, restaurantSlug: 'punto-g', isDefault: true };
}
