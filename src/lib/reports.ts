import XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ReportItem {
  nombre: string;
  cantidad: number;
  total: number;
}

export interface ReportFilterInfo {
  desde?: string;
  hasta?: string;
  tipo?: string;
  estado?: string;
  metodoPago?: string;
  mesa?: string;
  search?: string;
}

export type SalesReportType =
  | 'completo'
  | 'propinas'
  | 'pagos'
  | 'productos'
  | 'pedidos';

export const REPORT_TYPE_LABELS: Record<SalesReportType, string> = {
  completo: 'INFORME GENERAL DE VENTAS Y PROPINAS',
  propinas: 'INFORME DE PROPINAS Y VENTAS NETAS',
  pagos: 'RESUMEN POR MÉTODO DE PAGO Y PROPINAS',
  productos: 'INFORME DE TOP PRODUCTOS VENDIDOS',
  pedidos: 'LISTADO DETALLADO DE PEDIDOS CON PROPINAS',
};

export interface ExportReportData {
  restaurantName?: string;
  orders: any[];
  filters: ReportFilterInfo;
  metrics: {
    totalVentas: number;
    totalPropinas: number;
    totalPedidos: number;
    ticketPromedio: number;
  };
  productSalesSummary: ReportItem[];
  userName?: string;
  reportType?: SalesReportType;
}

// Formatter for Colombian Pesos
const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// Formatter for date string YYYY-MM-DD to readable
const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'N/A';
  try {
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CO');
  } catch {
    return dateStr;
  }
};

/**
 * Generates and downloads a clean, multi-sheet Excel (.xlsx) sales report
 */
export const exportSalesReportToExcel = ({
  orders,
  filters,
  metrics,
  productSalesSummary,
  userName = 'Administrador',
  restaurantName = 'Restaurante',
  reportType = 'completo',
}: ExportReportData) => {
  const wb = XLSX.utils.book_new();
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('es-CO');
  const timeFormatted = today.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  // 1. Calculate Breakdown by Payment Method (including propinas)
  const paymentBreakdown: Record<string, { count: number; total: number; propina: number }> = {};
  orders.forEach((o) => {
    const method = o.metodoPago || 'Efectivo';
    if (!paymentBreakdown[method]) {
      paymentBreakdown[method] = { count: 0, total: 0, propina: 0 };
    }
    paymentBreakdown[method].count += 1;
    paymentBreakdown[method].total += Number(o.total || 0);
    paymentBreakdown[method].propina += Number(o.propina || 0);
  });

  // 2. Calculate Breakdown by Delivery Type
  const typeBreakdown: Record<string, { count: number; total: number; propina: number }> = {};
  orders.forEach((o) => {
    const t = o.tipo === 'mesa' ? 'En Mesa / Sitio' : o.tipo === 'domicilio' ? 'Domicilio' : 'Para Llevar / Retiro';
    if (!typeBreakdown[t]) {
      typeBreakdown[t] = { count: 0, total: 0, propina: 0 };
    }
    typeBreakdown[t].count += 1;
    typeBreakdown[t].total += Number(o.total || 0);
    typeBreakdown[t].propina += Number(o.propina || 0);
  });

  const totalItemsSold = productSalesSummary.reduce((sum, p) => sum + p.cantidad, 0);
  const totalEnvios = orders.reduce((sum, o) => sum + Number(o.costoEnvio || 0), 0);
  const ventasNetas = Math.max(0, (metrics.totalVentas || 0) - (metrics.totalPropinas || 0));

  // Black border for tables and data cells
  const blackBorder = {
    top: { style: 'thin', color: { rgb: '000000' } },
    bottom: { style: 'thin', color: { rgb: '000000' } },
    left: { style: 'thin', color: { rgb: '000000' } },
    right: { style: 'thin', color: { rgb: '000000' } },
  };

  // Header style with business yellow (FBBF24 / Punto G Brand Yellow) and black border
  const headerYellowStyle = {
    font: { bold: true, color: { rgb: '000000' }, sz: 11, name: 'Calibri' },
    fill: { fgColor: { rgb: 'FBBF24' } },
    border: blackBorder,
    alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
  };

  // Section title banner style with yellow accent and black border
  const sectionTitleStyle = {
    font: { bold: true, color: { rgb: '000000' }, sz: 11, name: 'Calibri' },
    fill: { fgColor: { rgb: 'FCD34D' } },
    border: blackBorder,
    alignment: { vertical: 'center', horizontal: 'left' },
  };

  // Main restaurant header banner
  const mainBannerStyle = {
    font: { bold: true, color: { rgb: '000000' }, sz: 13, name: 'Calibri' },
    fill: { fgColor: { rgb: 'F59E0B' } },
    border: blackBorder,
    alignment: { vertical: 'center', horizontal: 'center' },
  };

  // Metadata label style
  const metaLabelStyle = {
    font: { bold: true, color: { rgb: '000000' }, sz: 10, name: 'Calibri' },
    fill: { fgColor: { rgb: 'FEF08A' } },
    border: blackBorder,
    alignment: { vertical: 'center', horizontal: 'left' },
  };

  // Metadata value style
  const metaValueStyle = {
    font: { color: { rgb: '111111' }, sz: 10, name: 'Calibri' },
    fill: { fgColor: { rgb: 'FFFFFF' } },
    border: blackBorder,
    alignment: { vertical: 'center', horizontal: 'left' },
  };

  // Helper for table data cells with black borders
  const dataCell = (value: any, align: 'left' | 'center' | 'right' = 'left', isAlt = false, isBold = false) => ({
    v: value ?? '',
    s: {
      font: { bold: isBold, color: { rgb: '000000' }, sz: 10, name: 'Calibri' },
      fill: { fgColor: { rgb: isAlt ? 'FFFBEB' : 'FFFFFF' } },
      border: blackBorder,
      alignment: { vertical: 'center', horizontal: align, wrapText: true },
    },
  });

  const headerCell = (value: string) => ({
    v: value,
    s: headerYellowStyle,
  });

  const sectionCell = (value: string) => ({
    v: value,
    s: sectionTitleStyle,
  });

  // ==========================================
  // SHEET 1: RESUMEN EJECUTIVO
  // ==========================================
  const summaryRows: any[][] = [
    // Banner principal con amarillo institucional
    [{ v: `${restaurantName.toUpperCase()} - INFORME OFICIAL DE VENTAS`, s: mainBannerStyle }],
    [{ v: 'INFORME OFICIAL DE VENTAS E INVENTARIO', s: sectionTitleStyle }],
    [
      { v: 'Fecha de Generación:', s: metaLabelStyle },
      { v: `${dateFormatted} ${timeFormatted}`, s: metaValueStyle },
    ],
    [
      { v: 'Generado Por:', s: metaLabelStyle },
      { v: userName, s: metaValueStyle },
    ],
    [
      { v: 'Período Consultado:', s: metaLabelStyle },
      { v: `Del ${formatDate(filters.desde)} al ${formatDate(filters.hasta)}`, s: metaValueStyle },
    ],
    [
      { v: 'Filtros Aplicados:', s: metaLabelStyle },
      {
        v: `Estado: ${filters.estado || 'Todos'} | Tipo: ${filters.tipo || 'Todos'} | Método Pago: ${filters.metodoPago || 'Todos'} | Mesa: ${filters.mesa || 'Todas'}`,
        s: metaValueStyle,
      },
    ],
    [], // Blank line

    // TABLA 1: KPIs
    [{ v: `INDICADORES CLAVE (${REPORT_TYPE_LABELS[reportType]})`, s: sectionTitleStyle }],
    [headerCell('Métrica'), headerCell('Valor')],
    [dataCell('Ventas Totales Facturadas (Incl. Propinas)', 'left', false, true), dataCell(formatMoney(metrics.totalVentas), 'right', false, true)],
    [dataCell('Ventas Netas de Productos/Envíos (Sin Propinas)', 'left', true), dataCell(formatMoney(ventasNetas), 'right', true)],
    [dataCell('Total Propinas Voluntarias Recaudadas', 'left', false, true), dataCell(formatMoney(metrics.totalPropinas), 'right', false, true)],
    [dataCell('Total Costos de Domicilio / Envío', 'left', true), dataCell(formatMoney(totalEnvios), 'right', true)],
    [dataCell('Total Pedidos Registrados', 'left'), dataCell(metrics.totalPedidos, 'right')],
    [dataCell('Ticket Promedio por Pedido', 'left', true), dataCell(formatMoney(metrics.ticketPromedio), 'right', true)],
    [dataCell('Total Platos / Ítems Despachados', 'left'), dataCell(totalItemsSold, 'right')],
    [], // Blank line

    // TABLA 2: DESGLOSE POR MÉTODO DE PAGO
    [{ v: 'DESGLOSE POR MÉTODO DE PAGO (CON PROPINAS)', s: sectionTitleStyle }],
    [
      headerCell('Método de Pago'),
      headerCell('N° Pedidos'),
      headerCell('Propinas ($)'),
      headerCell('Total Facturado ($)'),
      headerCell('% Participación'),
    ],
    ...Object.entries(paymentBreakdown).map(([method, data], idx) => {
      const isAlt = idx % 2 === 1;
      const pct = metrics.totalVentas > 0 ? ((data.total / metrics.totalVentas) * 100).toFixed(1) + '%' : '0%';
      return [
        dataCell(method, 'left', isAlt, true),
        dataCell(data.count, 'center', isAlt),
        dataCell(formatMoney(data.propina), 'right', isAlt),
        dataCell(formatMoney(data.total), 'right', isAlt, true),
        dataCell(pct, 'center', isAlt),
      ];
    }),
    [], // Blank line

    // TABLA 3: DESGLOSE POR TIPO DE SERVICIO / ENTREGA
    [{ v: 'DESGLOSE POR TIPO DE SERVICIO / ENTREGA', s: sectionTitleStyle }],
    [
      headerCell('Tipo de Servicio'),
      headerCell('N° Pedidos'),
      headerCell('Propinas ($)'),
      headerCell('Monto Facturado'),
    ],
    ...Object.entries(typeBreakdown).map(([type, data], idx) => {
      const isAlt = idx % 2 === 1;
      return [
        dataCell(type, 'left', isAlt, true),
        dataCell(data.count, 'center', isAlt),
        dataCell(formatMoney(data.propina), 'right', isAlt),
        dataCell(formatMoney(data.total), 'right', isAlt, true),
      ];
    }),
    [], // Blank line

    // TABLA 4: TOP PLATOS / INVENTARIO VENDIDO
    [{ v: 'TOP PLATOS / INVENTARIO VENDIDO EN EL PERÍODO', s: sectionTitleStyle }],
    [
      headerCell('Ranking'),
      headerCell('Producto / Plato'),
      headerCell('Unidades Vendidas'),
      headerCell('Total Facturado ($)'),
      headerCell('Precio Promedio'),
    ],
    ...productSalesSummary.map((p, idx) => {
      const isAlt = idx % 2 === 1;
      const avgPrice = p.cantidad > 0 ? Math.round(p.total / p.cantidad) : 0;
      return [
        dataCell(`#${idx + 1}`, 'center', isAlt, true),
        dataCell(p.nombre, 'left', isAlt, true),
        dataCell(p.cantidad, 'center', isAlt),
        dataCell(formatMoney(p.total), 'right', isAlt, true),
        dataCell(formatMoney(avgPrice), 'right', isAlt),
      ];
    }),
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  // Set column widths for Sheet 1
  wsSummary['!cols'] = [
    { wch: 36 },
    { wch: 25 },
    { wch: 25 },
    { wch: 20 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen Ejecutivo');

  // ==========================================
  // SHEET 2: DETALLE DE PEDIDOS
  // ==========================================
  const orderHeaders = [
    'Código',
    'Fecha',
    'Hora',
    'Cliente',
    'Teléfono',
    'Tipo',
    'Mesa / Dirección',
    'Estado',
    'Método Pago',
    'Productos / Detalle',
    'Subtotal ($)',
    'Propina ($)',
    'Envío ($)',
    'Total ($)',
    'Notas del Cliente',
  ].map((h) => headerCell(h));

  const orderRows = orders.map((o, idx) => {
    const isAlt = idx % 2 === 1;
    const d = new Date(o.createdAt);
    const dateStr = d.toLocaleDateString('es-CO');
    const timeStr = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const location = o.tipo === 'mesa' ? (o.numeroMesa || `Mesa #${o.mesaId || 'S/N'}`) : (o.direccion || 'Retiro en punto');

    const itemsSummary = (o.items || [])
      .map((it: any) => `${it.cantidad}x ${it.nombre}${it.adiciones ? ` (${it.adiciones})` : ''}`)
      .join('; ');

    return [
      dataCell(o.codigo, 'center', isAlt, true),
      dataCell(dateStr, 'center', isAlt),
      dataCell(timeStr, 'center', isAlt),
      dataCell(o.cliente, 'left', isAlt, true),
      dataCell(o.telefono || 'N/A', 'center', isAlt),
      dataCell(o.tipo === 'mesa' ? 'Mesa' : o.tipo === 'domicilio' ? 'Domicilio' : 'Retiro', 'center', isAlt),
      dataCell(location, 'left', isAlt),
      dataCell(o.estado, 'center', isAlt, true),
      dataCell(o.metodoPago || 'Efectivo', 'center', isAlt),
      dataCell(itemsSummary, 'left', isAlt),
      dataCell(formatMoney(o.subtotal || 0), 'right', isAlt),
      dataCell(formatMoney(o.propina || 0), 'right', isAlt),
      dataCell(formatMoney(o.costoEnvio || 0), 'right', isAlt),
      dataCell(formatMoney(o.total || 0), 'right', isAlt, true),
      dataCell(o.notasCliente || '', 'left', isAlt),
    ];
  });

  const wsOrders = XLSX.utils.aoa_to_sheet([orderHeaders, ...orderRows]);
  wsOrders['!cols'] = [
    { wch: 14 }, // Código
    { wch: 13 }, // Fecha
    { wch: 10 }, // Hora
    { wch: 24 }, // Cliente
    { wch: 15 }, // Teléfono
    { wch: 13 }, // Tipo
    { wch: 28 }, // Mesa / Dirección
    { wch: 16 }, // Estado
    { wch: 16 }, // Método Pago
    { wch: 48 }, // Productos
    { wch: 16 }, // Subtotal
    { wch: 14 }, // Propina
    { wch: 14 }, // Envío
    { wch: 18 }, // Total
    { wch: 32 }, // Notas
  ];
  XLSX.utils.book_append_sheet(wb, wsOrders, 'Detalle de Pedidos');

  // Trigger file download
  const cleanStartDate = filters.desde || 'inicio';
  const cleanEndDate = filters.hasta || 'fin';
  const fileName = `Reporte_Ventas_PuntoG_${cleanStartDate}_al_${cleanEndDate}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

/**
 * Generates and downloads a clean, beautifully formatted PDF sales report
 */
export const exportSalesReportToPDF = ({
  orders,
  filters,
  metrics,
  productSalesSummary,
  userName = 'Administrador',
  restaurantName = 'Restaurante',
  reportType = 'completo',
}: ExportReportData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const today = new Date();
  const dateFormatted = today.toLocaleDateString('es-CO');
  const timeFormatted = today.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  const totalItemsSold = productSalesSummary.reduce((sum, p) => sum + p.cantidad, 0);
  const totalSubtotal = orders.reduce((sum, o) => sum + Number(o.subtotal || 0), 0);
  const ventasNetas = Math.max(0, (metrics.totalVentas || 0) - (metrics.totalPropinas || 0));

  // Colors
  const primaryColor: [number, number, number] = [234, 179, 8]; // Amber/Yellow
  const darkBg: [number, number, number] = [18, 18, 18];

  // 1. Header Banner
  doc.setFillColor(...darkBg);
  doc.rect(0, 0, 210, 36, 'F');

  // Yellow accent line
  doc.setFillColor(...primaryColor);
  doc.rect(0, 36, 210, 2, 'F');

  // Brand title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(restaurantName.toUpperCase(), 14, 16);

  doc.setFontSize(10);
  doc.setTextColor(234, 179, 8);
  doc.text('PLATAFORMA GASTRONÓMICA & POS', 14, 22);

  doc.setTextColor(180, 180, 180);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(REPORT_TYPE_LABELS[reportType] || 'INFORME OFICIAL DE VENTAS Y PROPINAS', 14, 29);

  // Right-aligned report metadata in header
  doc.setFontSize(8);
  doc.setTextColor(220, 220, 220);
  doc.text(`Fecha Emisión: ${dateFormatted} ${timeFormatted}`, 196, 14, { align: 'right' });
  doc.text(`Generado por: ${userName}`, 196, 20, { align: 'right' });
  doc.text(`Período: ${formatDate(filters.desde)} al ${formatDate(filters.hasta)}`, 196, 26, { align: 'right' });

  // 2. Applied Filters Row
  let currentY = 44;
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(14, currentY, 182, 10, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'bold');
  const filterDesc = `Filtros: Estado: [${filters.estado || 'Todos'}] | Tipo: [${filters.tipo || 'Todos'}] | Pago: [${filters.metodoPago || 'Todos'}] | Mesa: [${filters.mesa || 'Todas'}]`;
  doc.text(filterDesc, 18, currentY + 6.5);

  currentY += 15;

  // 3. Executive KPI Cards
  const cardWidth = 34;
  const cardHeight = 18;
  const cardGap = 3;
  const kpis = [
    { label: 'VENTAS TOTALES', val: formatMoney(metrics.totalVentas), color: [16, 185, 129] },
    { label: 'PROPINAS', val: formatMoney(metrics.totalPropinas), color: [249, 115, 22] },
    { label: 'VENTAS NETAS', val: formatMoney(ventasNetas), color: [59, 130, 246] },
    { label: 'N° PEDIDOS', val: String(metrics.totalPedidos), color: [217, 119, 6] },
    { label: 'PLATOS / TICKET', val: `${totalItemsSold}u`, color: [139, 92, 246] },
  ];

  kpis.forEach((kpi, i) => {
    const x = 14 + i * (cardWidth + cardGap);
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(110, 110, 110);
    doc.text(kpi.label, x + cardWidth / 2, currentY + 5.5, { align: 'center' });

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...(kpi.color as [number, number, number]));
    doc.text(kpi.val, x + cardWidth / 2, currentY + 12.5, { align: 'center' });
  });

  currentY += cardHeight + 8;

  // 4. Payment & Delivery Breakdown Table (including Propinas)
  const paymentBreakdown: Record<string, { count: number; total: number; propina: number }> = {};
  orders.forEach((o) => {
    const method = o.metodoPago || 'Efectivo';
    if (!paymentBreakdown[method]) paymentBreakdown[method] = { count: 0, total: 0, propina: 0 };
    paymentBreakdown[method].count += 1;
    paymentBreakdown[method].total += Number(o.total || 0);
    paymentBreakdown[method].propina += Number(o.propina || 0);
  });

  if (reportType === 'completo' || reportType === 'pagos' || reportType === 'propinas') {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text('Resumen por Método de Pago y Propinas', 14, currentY);

    currentY += 3;

    autoTable(doc, {
      startY: currentY,
      head: [['Método de Pago', 'N° Pedidos', 'Propinas', 'Total Facturado', '% Part.']],
      body: Object.entries(paymentBreakdown).map(([method, data]) => {
        const pct = metrics.totalVentas > 0 ? ((data.total / metrics.totalVentas) * 100).toFixed(1) + '%' : '0%';
        return [method, data.count, formatMoney(data.propina), formatMoney(data.total), pct];
      }),
      foot: [['TOTAL', metrics.totalPedidos, formatMoney(metrics.totalPropinas), formatMoney(metrics.totalVentas), '100%']],
      theme: 'grid',
      headStyles: {
        fillColor: [30, 30, 30],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
      },
      footStyles: {
        fillColor: [234, 179, 8],
        textColor: [0, 0, 0],
        fontSize: 8,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [40, 40, 40],
      },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // 5. Top Platos / Inventario Vendido Table
  if ((reportType === 'completo' || reportType === 'productos') && productSalesSummary.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text('Top Platos / Inventario Más Vendido', 14, currentY);

    currentY += 3;

    const topRows = reportType === 'productos' ? productSalesSummary : productSalesSummary.slice(0, 10);
    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Producto / Plato', 'Cantidad Vendida', 'Total Facturado', 'Precio Promedio']],
      body: topRows.map((p, idx) => {
        const avg = p.cantidad > 0 ? Math.round(p.total / p.cantidad) : 0;
        return [idx + 1, p.nombre, `${p.cantidad} unidades`, formatMoney(p.total), formatMoney(avg)];
      }),
      theme: 'grid',
      headStyles: {
        fillColor: [234, 179, 8],
        textColor: [0, 0, 0],
        fontSize: 8,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [40, 40, 40],
      },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // 6. Detalle de Pedidos Table (including Subtotal & Propina)
  if (reportType === 'completo' || reportType === 'pedidos' || reportType === 'propinas') {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text(`Detalle de Órdenes y Propinas (${orders.length} pedidos)`, 14, currentY);

    currentY += 3;

    autoTable(doc, {
      startY: currentY,
      head: [['Código', 'Fecha/Hora', 'Cliente', 'Tipo', 'Pago', 'Subtotal', 'Propina', 'Total']],
      body: orders.map((o) => {
        const d = new Date(o.createdAt);
        const dt = `${d.toLocaleDateString('es-CO')} ${d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
        return [
          o.codigo,
          dt,
          o.cliente,
          o.tipo === 'mesa' ? `Mesa ${o.numeroMesa || ''}` : o.tipo === 'domicilio' ? 'Domicilio' : 'Retiro',
          o.metodoPago || 'Efectivo',
          formatMoney(o.subtotal || 0),
          formatMoney(o.propina || 0),
          formatMoney(o.total || 0),
        ];
      }),
      foot: [[
        'TOTALES',
        `${orders.length} órd.`,
        '',
        '',
        '',
        formatMoney(totalSubtotal),
        formatMoney(metrics.totalPropinas),
        formatMoney(metrics.totalVentas),
      ]],
      theme: 'striped',
      headStyles: {
        fillColor: [30, 30, 30],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
      },
      footStyles: {
        fillColor: [234, 179, 8],
        textColor: [0, 0, 0],
        fontSize: 7.5,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [40, 40, 40],
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (pageHookData) => {
        const pageCount = (doc.internal as any).getNumberOfPages();
        doc.setFontSize(7.5);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `${restaurantName} - Informe de Ventas y Propinas | Página ${pageHookData.pageNumber} de ${pageCount}`,
          14,
          290
        );
        doc.text(
          `Generado el ${dateFormatted} ${timeFormatted}`,
          196,
          290,
          { align: 'right' }
        );
      },
    });
  }

  // Save the PDF
  const cleanStartDate = filters.desde || 'inicio';
  const cleanEndDate = filters.hasta || 'fin';
  const cleanRest = restaurantName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Reporte_${reportType}_${cleanRest}_${cleanStartDate}_al_${cleanEndDate}.pdf`;
  doc.save(fileName);
};

/**
 * Opens a clean printable HTML window with Sales + Propinas breakdown according to selected reportType and dates
 */
export const printSalesReport = ({
  orders,
  filters,
  metrics,
  productSalesSummary,
  userName = 'Administrador',
  restaurantName = 'Restaurante',
  reportType = 'completo',
}: ExportReportData) => {
  if (typeof window === 'undefined') return;
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('es-CO');
  const timeFormatted = today.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  const totalSubtotal = orders.reduce((sum, o) => sum + Number(o.subtotal || 0), 0);
  const totalEnvios = orders.reduce((sum, o) => sum + Number(o.costoEnvio || 0), 0);
  const ventasNetas = Math.max(0, (metrics.totalVentas || 0) - (metrics.totalPropinas || 0));

  const paymentBreakdown: Record<string, { count: number; total: number; propina: number }> = {};
  orders.forEach((o) => {
    const method = o.metodoPago || 'Efectivo';
    if (!paymentBreakdown[method]) paymentBreakdown[method] = { count: 0, total: 0, propina: 0 };
    paymentBreakdown[method].count += 1;
    paymentBreakdown[method].total += Number(o.total || 0);
    paymentBreakdown[method].propina += Number(o.propina || 0);
  });

  const esc = (s: any) =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${esc(restaurantName)} - ${esc(REPORT_TYPE_LABELS[reportType])}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 20px; font-size: 12px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #eab308; padding-bottom: 12px; margin-bottom: 14px; }
    .brand h1 { margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
    .brand p { margin: 4px 0 0; font-size: 11px; color: #555; font-weight: bold; }
    .meta { text-align: right; font-size: 11px; color: #333; line-height: 1.5; }
    .filters { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; margin-bottom: 14px; font-size: 11px; }
    .kpis { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 16px; }
    .kpi { border: 1px solid #d1d5db; border-radius: 8px; padding: 10px; background: #fafafa; }
    .kpi-label { font-size: 9px; font-weight: bold; text-transform: uppercase; color: #6b7280; }
    .kpi-val { font-size: 15px; font-weight: 900; margin-top: 4px; color: #111; }
    .kpi-tip .kpi-val { color: #d97706; }
    h2 { font-size: 13px; text-transform: uppercase; margin: 16px 0 6px; border-left: 4px solid #eab308; padding-left: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11px; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
    th { background: #1e293b; color: #fff; font-size: 10px; text-transform: uppercase; }
    tfoot td { background: #fef3c7; font-weight: 900; border-top: 2px solid #000; }
    .right { text-align: right; }
    .center { text-align: center; }
    .footer { margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 8px; font-size: 10px; color: #6b7280; display: flex; justify-content: space-between; }
    @media print {
      body { margin: 10mm; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <h1>${esc(restaurantName)}</h1>
      <p>${esc(REPORT_TYPE_LABELS[reportType])}</p>
    </div>
    <div class="meta">
      <div><strong>Período:</strong> ${esc(formatDate(filters.desde))} al ${esc(formatDate(filters.hasta))}</div>
      <div><strong>Emisión:</strong> ${esc(dateFormatted)} ${esc(timeFormatted)}</div>
      <div><strong>Generado por:</strong> ${esc(userName)}</div>
    </div>
  </div>

  <div class="filters">
    <strong>Filtros aplicados:</strong> Estado: ${esc(filters.estado || 'Todos')} • Modalidad: ${esc(filters.tipo || 'Todas')} • Método de Pago: ${esc(filters.metodoPago || 'Todos')} • Mesa: ${esc(filters.mesa || 'Todas')}
  </div>

  <div class="kpis">
    <div class="kpi"><div class="kpi-label">Ventas Totales (c/ Propinas)</div><div class="kpi-val">${esc(formatMoney(metrics.totalVentas))}</div></div>
    <div class="kpi kpi-tip"><div class="kpi-label">Propinas Recaudadas</div><div class="kpi-val">${esc(formatMoney(metrics.totalPropinas))}</div></div>
    <div class="kpi"><div class="kpi-label">Ventas Netas (Sin Prop.)</div><div class="kpi-val">${esc(formatMoney(ventasNetas))}</div></div>
    <div class="kpi"><div class="kpi-label">N° Pedidos</div><div class="kpi-val">${orders.length}</div></div>
    <div class="kpi"><div class="kpi-label">Ticket Promedio</div><div class="kpi-val">${esc(formatMoney(metrics.ticketPromedio))}</div></div>
  </div>

  ${
    reportType === 'completo' || reportType === 'pagos' || reportType === 'propinas'
      ? `
    <h2>Resumen por Método de Pago y Propinas</h2>
    <table>
      <thead>
        <tr>
          <th>Método de Pago</th>
          <th class="center">N° Pedidos</th>
          <th class="right">Propinas Recaudadas</th>
          <th class="right">Total Facturado</th>
          <th class="center">% Participación</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(paymentBreakdown)
          .map(([method, d]) => {
            const pct = metrics.totalVentas > 0 ? ((d.total / metrics.totalVentas) * 100).toFixed(1) + '%' : '0%';
            return `<tr>
              <td><strong>${esc(method)}</strong></td>
              <td class="center">${d.count}</td>
              <td class="right">${esc(formatMoney(d.propina))}</td>
              <td class="right"><strong>${esc(formatMoney(d.total))}</strong></td>
              <td class="center">${pct}</td>
            </tr>`;
          })
          .join('')}
      </tbody>
      <tfoot>
        <tr>
          <td>TOTAL GENERAL</td>
          <td class="center">${orders.length}</td>
          <td class="right">${esc(formatMoney(metrics.totalPropinas))}</td>
          <td class="right">${esc(formatMoney(metrics.totalVentas))}</td>
          <td class="center">100%</td>
        </tr>
      </tfoot>
    </table>
  `
      : ''
  }

  ${
    (reportType === 'completo' || reportType === 'productos') && productSalesSummary.length > 0
      ? `
    <h2>Top Productos / Platos Vendidos</h2>
    <table>
      <thead>
        <tr>
          <th class="center">#</th>
          <th>Producto / Plato</th>
          <th class="center">Unidades</th>
          <th class="right">Total Facturado</th>
          <th class="right">Precio Promedio</th>
        </tr>
      </thead>
      <tbody>
        ${(reportType === 'productos' ? productSalesSummary : productSalesSummary.slice(0, 15))
          .map((p, idx) => {
            const avg = p.cantidad > 0 ? Math.round(p.total / p.cantidad) : 0;
            return `<tr>
              <td class="center">${idx + 1}</td>
              <td><strong>${esc(p.nombre)}</strong></td>
              <td class="center">${p.cantidad}</td>
              <td class="right">${esc(formatMoney(p.total))}</td>
              <td class="right">${esc(formatMoney(avg))}</td>
            </tr>`;
          })
          .join('')}
      </tbody>
    </table>
  `
      : ''
  }

  ${
    reportType === 'completo' || reportType === 'pedidos' || reportType === 'propinas'
      ? `
    <h2>Detalle de Órdenes e Inclusión de Propinas (${orders.length})</h2>
    <table>
      <thead>
        <tr>
          <th>Código</th>
          <th>Fecha / Hora</th>
          <th>Cliente</th>
          <th>Servicio</th>
          <th>Pago</th>
          <th class="right">Subtotal</th>
          <th class="right">Propina</th>
          <th class="right">Envío</th>
          <th class="right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${orders
          .map((o) => {
            const d = new Date(o.createdAt);
            const dt = `${d.toLocaleDateString('es-CO')} ${d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
            const srv = o.tipo === 'mesa' ? `Mesa ${o.numeroMesa || ''}` : o.tipo === 'domicilio' ? 'Domicilio' : 'Retiro';
            return `<tr>
              <td><strong>${esc(o.codigo)}</strong></td>
              <td>${esc(dt)}</td>
              <td>${esc(o.cliente)}</td>
              <td>${esc(srv)}</td>
              <td>${esc(o.metodoPago || 'Efectivo')}</td>
              <td class="right">${esc(formatMoney(o.subtotal || 0))}</td>
              <td class="right"><strong>${esc(formatMoney(o.propina || 0))}</strong></td>
              <td class="right">${esc(formatMoney(o.costoEnvio || 0))}</td>
              <td class="right"><strong>${esc(formatMoney(o.total || 0))}</strong></td>
            </tr>`;
          })
          .join('')}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5">TOTALES DEL PERÍODO</td>
          <td class="right">${esc(formatMoney(totalSubtotal))}</td>
          <td class="right">${esc(formatMoney(metrics.totalPropinas))}</td>
          <td class="right">${esc(formatMoney(totalEnvios))}</td>
          <td class="right">${esc(formatMoney(metrics.totalVentas))}</td>
        </tr>
      </tfoot>
    </table>
  `
      : ''
  }

  <div class="footer">
    <span>${esc(restaurantName)} • Reporte generado con GastroNegocios</span>
    <span>Impreso el ${esc(dateFormatted)} ${esc(timeFormatted)}</span>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 250);
    };
  </script>
</body>
</html>
  `;

  const printWindow = window.open('', '_blank', 'width=960,height=800');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }
};
