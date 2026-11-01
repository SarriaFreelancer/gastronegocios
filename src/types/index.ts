export type ProductBadge = 
  | 'MÁS VENDIDO' 
  | 'NUEVO' 
  | 'RECOMENDADO' 
  | 'PICANTE' 
  | 'VEGETARIANA' 
  | 'BBQ' 
  | 'INFANTIL';

export interface Product {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria: string; // e.g. 'hamburguesas', 'picadas', etc.
  etiqueta?: ProductBadge;
  disponibilidad: boolean;
  destacado?: boolean;
  ingredientes?: string[];
  orden?: number;
}

export interface Category {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  subtitulo?: string;
  imagen: string;
  icono: string; // identifier for icon
  orden: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface ComboItem {
  id: string;
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
