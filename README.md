# PUNTO G – Plataforma Web Oficial

Plataforma digital para el restaurante de comidas rápidas **PUNTO G** (*"Antojos que conectan"*), desarrollada con **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS** y **Lucide React**, reproduciendo fielmente la identidad visual, tipográfica y de composición aprobada en los diseños de referencia.

---

## 🎨 Identidad Visual y Paleta de Colores

- **Amarillo Principal:** `#FFC928`
- **Negro Principal:** `#151515`
- **Negro de Fondo:** `#080808`
- **Blanco:** `#FFFFFF`
- **Naranja Complementario:** `#E94B24`
- **Verde WhatsApp:** `#25D366`

---

## 🚀 Arquitectura y Rutas Implementadas

- `/` → **Página Principal (HOME)**
  - Hero cinematográfico con tipografía display, hamburguesa artesanal gigante y papas fritas.
  - Sección **NUESTRAS CATEGORÍAS** con 9 tarjetas gastronómicas y badges interactivos.
  - Sección **PRODUCTOS DESTACADOS** con badges (*MÁS VENDIDO, NUEVO, RECOMENDADO*).
  - Banner promocional **COMBOS QUE NO TE PUEDES PERDER** con adición rápida al pedido.
  - Sección **EL SABOR DE LA PARRILLA EN CADA BOCADO** con efecto brasas y cortes al carbón.
  - Sección **¿YA SE TE ANTOJÓ?** con asistente virtual 3D, chat interactivo simulado y botón directo de WhatsApp.
  - Footer corporativo completo con horarios, ubicación en Cali, redes sociales y botón de pedidos.

- `/menu` → **Menú Completo** con buscador en tiempo real, selector de categorías por pills y catálogo consolidado.
- `/menu/hamburguesas` → **Página Interna de Hamburguesas** (Fiel a la Imagen 2 de referencia)
  - Banner superior de categoría con tipografía *brush* y fotografía hiperrealista.
  - Menú lateral (Sidebar) con categoría activa en amarillo sólido, iconos individuales, banner de marca y bloque de asistencia.
  - Barra de herramientas con título, subtítulo, barra de búsqueda y selector de ordenación (*Recomendados, Menor precio, Mayor precio, Nombre*).
  - Cuadrícula de 9 hamburguesas artesanales con selectores de cantidad individuales y botones de agregar al pedido.
  - Banner inferior *Combo Especial ($28.900)* con acceso directo a WhatsApp.
- `/menu/picadas` → Picadas tradicionales, mixtas familiares y costilla/chicharrón.
- `/menu/salchipapas` → Salchipapas clásicas, especiales, monstruo y gratinadas.
- `/menu/perros-calientes` → Perros tradicionales, especiales, suizos y mexicanos.
- `/menu/parrillas` → Cortes al carbón, churrascos, pechugas gratinadas y costillas BBQ.
- `/menu/bebidas` → Gaseosas heladas, colas y aguas minerales.
- `/menu/cocteles` → Mojito cubano, margaritas, gin tonic y piña colada.
- `/menu/jugos-naturales` → Frutas 100% naturales (mango, maracuyá, lulo valluno, fresa).
- `/menu/sodas` → Sodas saborizadas artesanales con frutos rojos y maracuyá.
- `/promociones` → Combos con descuentos y cotización para eventos.
- `/nosotros` → Historia, pilares de calidad, compromiso culinario y espíritu urbano.
- `/contacto` → Información de contacto, horarios, mapa y formulario con enlace a WhatsApp.

---

## 🛒 Sistema de Carrito y Checkout por WhatsApp

- **Carrito Lateral Desplegable (Slide-over):**
  - Accesible desde el encabezado en todas las páginas.
  - Control de cantidades (`+` / `-`), cálculo de subtotales por producto y eliminación.
  - Selector de modalidad: **Domicilio** (+$5.000 COP) o **Para Recoger** ($0 COP).
  - Campos de datos del cliente: Nombre, Teléfono, Dirección de entrega y Observaciones especiales (*ej: "sin cebolla y con salsa tártara extra"*).
  - Persistencia local mediante `localStorage` para no perder el pedido al navegar.
  - Toast interactivo de confirmación al agregar cualquier producto.
  - Botón **CONTINUAR PEDIDO POR WHATSAPP** que genera automáticamente un mensaje estructurado con el resumen detallado para el restaurante.

---

## 💻 Comandos del Proyecto

```bash
# Instalar dependencias
npm install

# Modo desarrollo (puerto 3005)
npm run dev

# Compilar para producción (SSG optimizado)
npm run build

# Iniciar servidor de producción
npm run start
```

---

## 🔮 Preparación para Futuras Fases

1. **Base de Datos & ORM:** Los modelos `Product`, `Category` y `RestaurantInfo` en `src/types/index.ts` y los datos desacoplados en `src/data/` están listos para conectarse a Prisma y MySQL.
2. **Panel Administrativo:** Estructura modular preparada para agregar rutas `/admin` con autenticación para gestión de inventario y pedidos.
3. **Agente IA & WhatsApp Cloud API:** El flujo de checkout y el componente del asistente virtual están diseñados para enlazarse con webhooks de Meta y modelos de lenguaje de Google Gemini.
