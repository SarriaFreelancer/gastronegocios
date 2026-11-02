import * as XLSX from 'xlsx';
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

  // ==========================================
  // SHEET 1: RESUMEN EJECUTIVO
  // ==========================================
  const summaryRows: any[][] = [
    ['PUNTO G - RESTAURANTE & COMIDAS RÁPIDAS'],
    ['INFORME DE VENTAS E INVENTARIO'],
    ['Fecha de Generación:', `${dateFormatted} ${timeFormatted}`],
    ['Generado Por:', userName],
    ['Período Consultado:', `Del ${formatDate(filters.desde)} al ${formatDate(filters.hasta)}`],
    [
      'Filtros Aplicados:',
      `Estado: ${filters.estado || 'Todos'} | Tipo: ${filters.tipo || 'Todos'} | Método Pago: ${filters.metodoPago || 'Todos'} | Mesa: ${filters.mesa || 'Todas'}`,
    ],
    [], // Blank line
    ['INDICADORES CLAVE DE RENDIMIENTO (KPIs)'],
    ['Métrica', 'Valor'],
    ['Ventas Totales Facturadas', formatMoney(metrics.totalVentas)],
    ['Total Propinas Recaudadas', formatMoney(metrics.totalPropinas)],
    ['Total Pedidos Registrados', metrics.totalPedidos],
    ['Ticket Promedio por Pedido', formatMoney(metrics.ticketPromedio)],
    ['Total Platos / Ítems Despachados', totalItemsSold],
    [], // Blank line
    ['DESGLOSE POR MÉTODO DE PAGO'],
    ['Método de Pago', 'N° Pedidos', 'Monto Facturado', '% Participación'],
    ...Object.entries(paymentBreakdown).map(([method, data]) => {
      const pct = metrics.totalVentas > 0 ? ((data.total / metrics.totalVentas) * 100).toFixed(1) + '%' : '0%';
      return [method, data.count, formatMoney(data.total), pct];
    }),
    [], // Blank line
    ['DESGLOSE POR TIPO DE SERVICIO / ENTREGA'],
    ['Tipo de Servicio', 'N° Pedidos', 'Monto Facturado'],
    ...Object.entries(typeBreakdown).map(([type, data]) => [
      type,
      data.count,
      formatMoney(data.total),
    ]),
    [], // Blank line
    ['TOP PLATOS / INVENTARIO VENDIDO EN EL PERÍODO'],
    ['Ranking', 'Producto / Plato', 'Unidades Vendidas', 'Total Facturado ($)', 'Precio Promedio'],
    ...productSalesSummary.map((p, idx) => {
      const avgPrice = p.cantidad > 0 ? Math.round(p.total / p.cantidad) : 0;
      return [idx + 1, p.nombre, p.cantidad, formatMoney(p.total), formatMoney(avgPrice)];
    }),
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  // Set column widths for Sheet 1
  wsSummary['!cols'] = [
    { wch: 35 },
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
  ];

  const orderRows = orders.map((o) => {
    const d = new Date(o.createdAt);
    const dateStr = d.toLocaleDateString('es-CO');
    const timeStr = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const location = o.tipo === 'mesa' ? (o.numeroMesa || `Mesa #${o.mesaId || 'S/N'}`) : (o.direccion || 'Retiro en punto');

    const itemsSummary = (o.items || [])
      .map((it: any) => `${it.cantidad}x ${it.nombre}${it.adiciones ? ` (${it.adiciones})` : ''}`)
      .join('; ');

    return [
      o.codigo,
      dateStr,
      timeStr,
      o.cliente,
      o.telefono || 'N/A',
      o.tipo === 'mesa' ? 'Mesa' : o.tipo === 'domicilio' ? 'Domicilio' : 'Retiro',
      location,
      o.estado,
      o.metodoPago || 'Efectivo',
      itemsSummary,
      formatMoney(o.subtotal || 0),
      formatMoney(o.propina || 0),
      formatMoney(o.costoEnvio || 0),
      formatMoney(o.total || 0),
      o.notasCliente || '',
    ];
  });

  const wsOrders = XLSX.utils.aoa_to_sheet([orderHeaders, ...orderRows]);
  wsOrders['!cols'] = [
    { wch: 12 }, // Código
    { wch: 12 }, // Fecha
    { wch: 10 }, // Hora
    { wch: 22 }, // Cliente
    { wch: 15 }, // Teléfono
    { wch: 12 }, // Tipo
    { wch: 25 }, // Mesa / Dirección
    { wch: 15 }, // Estado
    { wch: 15 }, // Método Pago
    { wch: 45 }, // Productos
    { wch: 15 }, // Subtotal
    { wch: 12 }, // Propina
    { wch: 12 }, // Envío
    { wch: 16 }, // Total
    { wch: 30 }, // Notas
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
  doc.text('PUNTO G', 14, 16);

  doc.setFontSize(10);
  doc.setTextColor(234, 179, 8);
  doc.text('RESTAURANTE & COMIDAS RÁPIDAS', 14, 22);

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
    didDrawPage: (data) => {
      // Footer page numbering
      const pageCount = (doc.internal as any).getNumberOfPages();
      doc.setFontSize(7.5);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Punto G - Informe de Ventas | Página ${data.pageNumber} de ${pageCount}`,
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
