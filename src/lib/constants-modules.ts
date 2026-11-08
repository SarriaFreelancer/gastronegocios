export interface ModuleDefinition {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  requiere?: string[];
  activoPorDefecto: boolean;
  categoria: 'operativo' | 'gestion' | 'comercial' | 'analitica';
}

export const SYSTEM_MODULES: ModuleDefinition[] = [
  {
    id: 'pos',
    nombre: 'Ventas y Punto de Venta (POS)',
    descripcion: 'Cobro rápido, comandas de mesas, barra, delivery y medios de pago.',
    icono: 'ShoppingCart',
    activoPorDefecto: true,
    categoria: 'operativo',
  },
  {
    id: 'kds',
    nombre: 'Pantalla de Cocina (KDS)',
    descripcion: 'Comandero en tiempo real para jefes de cocina y líneas de despacho.',
    icono: 'UtensilsCrossed',
    requiere: ['pos'],
    activoPorDefecto: true,
    categoria: 'operativo',
  },
  {
    id: 'mesero',
    nombre: 'Comandero Móvil de Mesero',
    descripcion: 'Toma de pedidos en mesa con sincronización inmediata a cocina y caja.',
    icono: 'TabletSmartphone',
    requiere: ['pos'],
    activoPorDefecto: true,
    categoria: 'operativo',
  },
  {
    id: 'menu_digital',
    nombre: 'Menú Digital QR / Carta Web',
    descripcion: 'Carta interactiva para comensales en mesa o a domicilio con pedidos online.',
    icono: 'QrCode',
    activoPorDefecto: true,
    categoria: 'comercial',
  },
  {
    id: 'insumos',
    nombre: 'Inventario Inteligente de Insumos',
    descripcion: 'Control de materias primas, unidades de medida, stock mínimo y Kardex.',
    icono: 'Boxes',
    activoPorDefecto: true,
    categoria: 'gestion',
  },
  {
    id: 'recetas',
    nombre: 'Escandallos y Fichas Técnicas (BOM)',
    descripcion: 'Costeo por porción, márgenes de ganancia y deducción automática por venta.',
    icono: 'BookOpen',
    requiere: ['insumos'],
    activoPorDefecto: true,
    categoria: 'gestion',
  },
  {
    id: 'compras',
    nombre: 'Compras y Proveedores',
    descripcion: 'Facturas de proveedores, actualización de costos promedio (PPP) e ingresos.',
    icono: 'Truck',
    requiere: ['insumos'],
    activoPorDefecto: true,
    categoria: 'gestion',
  },
  {
    id: 'clientes',
    nombre: 'Clientes y Fidelización',
    descripcion: 'Directorio de clientes, consumos acumulados, preferencias y facturas.',
    icono: 'Users',
    activoPorDefecto: true,
    categoria: 'gestion',
  },
  {
    id: 'reportes',
    nombre: 'Dashboard Ejecutivo y Analítica',
    descripcion: 'Ventas, utilidad bruta, costo de insumos (CMV), productos más vendidos y mermas.',
    icono: 'BarChart3',
    activoPorDefecto: true,
    categoria: 'analitica',
  },
  {
    id: 'facturacion_electronica',
    nombre: 'Facturación Electrónica DIAN / Fiscal',
    descripcion: 'Emisión de facturas fiscales electrónicas y documentos soporte.',
    icono: 'ReceiptText',
    requiere: ['pos'],
    activoPorDefecto: false,
    categoria: 'gestion',
  },
  {
    id: 'delivery',
    nombre: 'Gestión de Domicilios y Despacho',
    descripcion: 'Rastreo de repartidores, tiempos de entrega y direcciones de clientes.',
    icono: 'Bike',
    requiere: ['pos'],
    activoPorDefecto: true,
    categoria: 'operativo',
  },
];

export const DEFAULT_MODULES_STATE: Record<string, boolean> = SYSTEM_MODULES.reduce(
  (acc, mod) => {
    acc[mod.id] = mod.activoPorDefecto;
    return acc;
  },
  {} as Record<string, boolean>
);
