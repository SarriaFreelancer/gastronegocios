/**
 * Utility helper to resolve the appropriate high-resolution 3D isolated asset
 * for category banners, category cards, and navigation.
 */

interface CategoryLike {
  slug?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
  imagen?: string | null;
}

const PRESET_3D = {
  drinks: '/images/assets/drinks-3d.png',
  parrilla: '/images/assets/parrilla-3d.png',
  salchipapa: '/images/assets/salchipapa-3d.png',
  hotdog: '/images/assets/hotdog-3d.png',
  burger: '/images/assets/burger-hero-transparent.png',
  chicken: '/images/assets/chicken-3d.png',
  pizza: '/images/assets/pizza-3d.png',
  tacos: '/images/assets/tacos-3d.png',
};

function normalizeText(text?: string | null): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Returns the best transparent 3D asset URL matching the category or subcategory name / slug.
 */
export function getCategoryHeroImage(
  category?: CategoryLike | null,
  subcategory?: CategoryLike | null
): string {
  // If subcategory has high priority, check it first
  const targetSub = normalizeText(subcategory?.slug) + ' ' + normalizeText(subcategory?.nombre);
  const targetMain = normalizeText(category?.slug) + ' ' + normalizeText(category?.nombre);
  const combined = `${targetSub} ${targetMain}`.trim();

  // 1. BEBIDAS / JUGOS / COCTELES / GASEOSAS / CERVEZAS / SODAS
  if (
    /bebid|jugo|limonad|gaseosa|refresc|soda|coctel|cocktail|cervez|agua|drink|michelad/i.test(
      combined
    )
  ) {
    return PRESET_3D.drinks;
  }

  // 2. PARRILLA / ASADOS / CARNES / PICADAS / COSTILLAS / CHURRASCO / STEAK
  if (
    /parrill|asado|carne|picada|costilla|bbq|churrasc|bife|steak|chuzo|pincho|llanera/i.test(
      combined
    )
  ) {
    return PRESET_3D.parrilla;
  }

  // 3. SALCHIPAPAS / PAPAS FRITAS / MAZORCADAS / DESGRANADOS / ANTOJITOS
  if (
    /salchipap|papa|francesa|mazorcad|desgranad|antojit|butifarra/i.test(
      combined
    )
  ) {
    return PRESET_3D.salchipapa;
  }

  // 4. PERROS CALIENTES / HOT DOGS
  if (/perro|hotdog|hot-dog|frankfurt/i.test(combined)) {
    // Si la categoría es compuesta tipo "Hamburguesas y Perros" pero no estamos en subcategoría de perro
    if (/hamburgues/i.test(targetSub) || (!targetSub && /hamburgues/i.test(targetMain) && !/perro/i.test(targetSub))) {
      return PRESET_3D.burger;
    }
    return PRESET_3D.hotdog;
  }

  // 5. POLLO / ALITAS / BROASTER / NUGGETS
  if (/pollo|alita|broaster|nugget|crispy/i.test(combined)) {
    return PRESET_3D.chicken;
  }

  // 6. PIZZAS
  if (/pizza|calzone/i.test(combined)) {
    return PRESET_3D.pizza;
  }

  // 7. TACOS / MEXICANA
  if (/taco|burrito|fajita|quesadill|mexican/i.test(combined)) {
    return PRESET_3D.tacos;
  }

  // 8. HAMBURGUESAS / BURGERS
  if (/hamburgues|burger|angus|cheeseburg/i.test(combined)) {
    return PRESET_3D.burger;
  }

  // 9. If category has a custom transparent PNG or uploaded image (not standard unsplash)
  if (category?.imagen && !category.imagen.includes('unsplash.com')) {
    return category.imagen;
  }

  // Default fallback
  return PRESET_3D.burger;
}
