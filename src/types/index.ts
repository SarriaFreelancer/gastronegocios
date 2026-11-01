export type ProductBadge = 
  | 'MÁS VENDIDO' 
  | 'NUEVO' 
  | 'RECOMENDADO' 
  | 'PICANTE' 
  | 'VEGETARIANA' 
  | 'BBQ' 
  | 'INFANTIL';

export interface Product {
  id: string | number;
  nombre: string;
  slug: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria: string; // e.g. 'hamburguesas', 'comidas-rapidas', etc.
  categoriaId?: number;
  categoriaNombre?: string;
  subcategoria?: string | null; // e.g. 'hamburguesas', 'gaseosas', 'cocteles'
  subcategoriaId?: number | null;
  subcategoriaNombre?: string | null;
  etiqueta?: ProductBadge;
  disponibilidad: boolean;
  destacado?: boolean;
  ingredientes?: string[];
  orden?: number;
}

export interface Category {
  id: string | number;
  slug: string;
  nombre: string;
  descripcion: string;
  subtitulo?: string;
  imagen: string;
  icono: string; // identifier for icon
  orden: number;
  activo?: boolean;
  parentId?: number | string | null;
  parent?: Category | null;
  children?: Category[];
  _count?: {
    products?: number;
    subProducts?: number;
    children?: number;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface ComboItem {
  id: string | number;
  nombre: string;
  descripcion: string;
  incluye: string[];
  precio: number;
  imagen: string;
  etiqueta?: string;
}

export interface RestaurantInfo {
  name: string;
  slogan: string;
  phone: string;
  whatsappNumber: string;
  whatsappFormatted: string;
  address: string;
  city: string;
  schedule: string;
  socials: {
    facebook: string;
    instagram: string;
    tiktok: string;
  };
}
