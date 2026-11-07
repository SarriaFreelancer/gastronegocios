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
}: ExportReportData) => {
  const wb = XLSX.utils.book_new();
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('es-CO');
  const timeFormatted = today.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  // 1. Calculate Breakdown by Payment Method
  const paymentBreakdown: Record<string, { count: number; total: number }> = {};
  orders.forEach((o) => {
    const method = o.metodoPago || 'Efectivo';
    if (!paymentBreakdown[method]) {
      paymentBreakdown[method] = { count: 0, total: 0 };
    }
    paymentBreakdown[method].count += 1;
    paymentBreakdown[method].total += Number(o.total || 0);
  });

  // 2. Calculate Breakdown by Delivery Type
  const typeBreakdown: Record<string, { count: number; total: number }> = {};
  orders.forEach((o) => {
    const t = o.tipo === 'mesa' ? 'En Mesa / Sitio' : o.tipo === 'domicilio' ? 'Domicilio' : 'Para Llevar / Retiro';
    if (!typeBreakdown[t]) {
      typeBreakdown[t] = { count: 0, total: 0 };
    }
    typeBreakdown[t].count += 1;
    typeBreakdown[t].total += Number(o.total || 0);
  });

  const totalItemsSold = productSalesSummary.reduce((sum, p) => sum + p.cantidad, 0);

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
    [{ v: 'INDICADORES CLAVE DE RENDIMIENTO (KPIs)', s: sectionTitleStyle }],
    [headerCell('Métrica'), headerCell('Valor')],
    [dataCell('Ventas Totales Facturadas', 'left', false, true), dataCell(formatMoney(metrics.totalVentas), 'right', false, true)],
    [dataCell('Total Propinas Recaudadas', 'left', true), dataCell(formatMoney(metrics.totalPropinas), 'right', true)],
    [dataCell('Total Pedidos Registrados', 'left'), dataCell(metrics.totalPedidos, 'right')],
    [dataCell('Ticket Promedio por Pedido', 'left', true), dataCell(formatMoney(metrics.ticketPromedio), 'right', true)],
    [dataCell('Total Platos / Ítems Despachados', 'left'), dataCell(totalItemsSold, 'right')],
    [], // Blank line

    // TABLA 2: DESGLOSE POR MÉTODO DE PAGO
    [{ v: 'DESGLOSE POR MÉTODO DE PAGO', s: sectionTitleStyle }],
    [
      headerCell('Método de Pago'),
      headerCell('N° Pedidos'),
      headerCell('Monto Facturado'),
      headerCell('% Participación'),
    ],
    ...Object.entries(paymentBreakdown).map(([method, data], idx) => {
      const isAlt = idx % 2 === 1;
      const pct = metrics.totalVentas > 0 ? ((data.total / metrics.totalVentas) * 100).toFixed(1) + '%' : '0%';
      return [
        dataCell(method, 'left', isAlt, true),
        dataCell(data.count, 'center', isAlt),
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
      headerCell('Monto Facturado'),
    ],
    ...Object.entries(typeBreakdown).map(([type, data], idx) => {
      const isAlt = idx % 2 === 1;
      return [
        dataCell(type, 'left', isAlt, true),
        dataCell(data.count, 'center', isAlt),
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

  // Colors
  const primaryColor: [number, number, number] = [234, 179, 8]; // Amber/Yellow
  const darkBg: [number, number, number] = [18, 18, 18];
  const textGray: [number, number, number] = [120, 120, 120];

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
  doc.text('INFORME OFICIAL DE VENTAS E INVENTARIO', 14, 29);

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
    { label: 'VENTAS TOTALES', val: formatMoney(metrics.totalVentas), color: [16, 185, 129] }, // green
    { label: 'PROPINAS', val: formatMoney(metrics.totalPropinas), color: [249, 115, 22] }, // orange
    { label: 'N° PEDIDOS', val: String(metrics.totalPedidos), color: [59, 130, 246] }, // blue
    { label: 'TICKET PROMEDIO', val: formatMoney(metrics.ticketPromedio), color: [217, 119, 6] }, // amber
    { label: 'PLATOS VENDIDOS', val: `${totalItemsSold} und`, color: [139, 92, 246] }, // purple
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

  // 4. Payment & Delivery Breakdown Table
  const paymentBreakdown: Record<string, { count: number; total: number }> = {};
  orders.forEach((o) => {
    const method = o.metodoPago || 'Efectivo';
    if (!paymentBreakdown[method]) paymentBreakdown[method] = { count: 0, total: 0 };
    paymentBreakdown[method].count += 1;
    paymentBreakdown[method].total += Number(o.total || 0);
  });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text('Resumen por Método de Pago', 14, currentY);

  currentY += 3;

  autoTable(doc, {
    startY: currentY,
    head: [['Método de Pago', 'N° Pedidos', 'Total Facturado', '% Participación']],
    body: Object.entries(paymentBreakdown).map(([method, data]) => {
      const pct = metrics.totalVentas > 0 ? ((data.total / metrics.totalVentas) * 100).toFixed(1) + '%' : '0%';
      return [method, data.count, formatMoney(data.total), pct];
    }),
    theme: 'grid',
    headStyles: {
      fillColor: [30, 30, 30],
      textColor: [255, 255, 255],
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

  // 5. Top Platos / Inventario Vendido Table
  if (productSalesSummary.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text('Top Platos / Inventario Más Vendido', 14, currentY);

    currentY += 3;

    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Producto / Plato', 'Cantidad Vendida', 'Total Facturado', 'Precio Promedio']],
      body: productSalesSummary.slice(0, 10).map((p, idx) => {
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

  // 6. Detalle de Pedidos Table (can paginate across pages automatically)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text(`Listado Detallado de Órdenes (${orders.length} pedidos)`, 14, currentY);

  currentY += 3;

  autoTable(doc, {
    startY: currentY,
    head: [['Código', 'Fecha/Hora', 'Cliente', 'Tipo', 'Pago', 'Estado', 'Total']],
    body: orders.map((o) => {
      const d = new Date(o.createdAt);
      const dt = `${d.toLocaleDateString('es-CO')} ${d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
      return [
        o.codigo,
        dt,
        o.cliente,
        o.tipo === 'mesa' ? `Mesa ${o.numeroMesa || ''}` : o.tipo === 'domicilio' ? 'Domicilio' : 'Retiro',
        o.metodoPago || 'Efectivo',
        o.estado,
        formatMoney(o.total || 0),
      ];
    }),
    theme: 'striped',
    headStyles: {
      fillColor: [30, 30, 30],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [40, 40, 40],
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (pageHookData) => {
      // Footer page numbering
      const pageCount = (doc.internal as any).getNumberOfPages();
      doc.setFontSize(7.5);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `${restaurantName} - Informe de Ventas | Página ${pageHookData.pageNumber} de ${pageCount}`,
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

  // Save the PDF
  const cleanStartDate = filters.desde || 'inicio';
  const cleanEndDate = filters.hasta || 'fin';
  const fileName = `Reporte_Ventas_PuntoG_${cleanStartDate}_al_${cleanEndDate}.pdf`;
  doc.save(fileName);
};
