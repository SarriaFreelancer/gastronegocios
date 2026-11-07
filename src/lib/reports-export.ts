import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface OrderExportItem {
  id: number;
  codigo: string;
  cliente: string;
  telefono?: string | null;
  tipo: string;
  numeroMesa?: string | null;
  metodoPago: string;
  subtotal: number;
  propina: number;
  costoEnvio?: number;
  total: number;
  estado: string;
  createdAt: string;
  items?: Array<{
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
}

export function exportOrdersToExcel(
  orders: OrderExportItem[],
  restaurantName: string = 'Restaurante',
  dateLabel: string = 'Historico'
) {
  if (!orders || orders.length === 0) {
    alert('No hay pedidos disponibles para exportar con los filtros actuales.');
    return;
  }

  const rows = orders.map((o) => {
    const d = new Date(o.createdAt);
    const fecha = d.toLocaleDateString('es-CO');
    const hora = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const itemsText = o.items ? o.items.map((it) => `${it.cantidad}x ${it.nombre}`).join(', ') : '';

    return {
      'Código Pedido': o.codigo || `#${o.id}`,
      Fecha: fecha,
      Hora: hora,
      Cliente: o.cliente || 'Consumidor Final',
      Teléfono: o.telefono || 'N/A',
      Tipo: (o.tipo || 'mesa').toUpperCase(),
      Mesa: o.numeroMesa || 'N/A',
      'Método de Pago': o.metodoPago || 'Efectivo',
      'Subtotal ($)': o.subtotal || 0,
      'Propina ($)': o.propina || 0,
      'Envío ($)': o.costoEnvio || 0,
      'Total ($)': o.total || 0,
      Estado: o.estado || 'Completado',
      Productos: itemsText,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 16 }, // Codigo
    { wch: 12 }, // Fecha
    { wch: 10 }, // Hora
    { wch: 22 }, // Cliente
    { wch: 14 }, // Telefono
    { wch: 12 }, // Tipo
    { wch: 10 }, // Mesa
    { wch: 16 }, // Metodo
    { wch: 14 }, // Subtotal
    { wch: 12 }, // Propina
    { wch: 12 }, // Envio
    { wch: 14 }, // Total
    { wch: 14 }, // Estado
    { wch: 40 }, // Productos
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas');

  const cleanName = restaurantName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Reporte_Ventas_${cleanName}_${dateLabel.replace(/\s+/g, '_')}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}

export function exportShiftClosureToPdf(
  shift: any,
  restaurantName: string = 'Restaurante'
) {
  if (!shift) return;

  const doc = new jsPDF();
  const formatCOP = (val: number) => '$' + Number(val || 0).toLocaleString('es-CO');

  const fechaInicio = shift.fechaInicio ? new Date(shift.fechaInicio).toLocaleString('es-CO') : 'N/A';
  const fechaFin = shift.fechaFin ? new Date(shift.fechaFin).toLocaleString('es-CO') : 'Turno Activo';

  // Header Title
  doc.setFillColor(15, 15, 15);
  doc.rect(0, 0, 210, 38, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 201, 40); // Yellow gold
  doc.text(restaurantName.toUpperCase(), 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.text('ACTA DE ARQUEO Y CIERRE DE CAJA (SISTEMA POS)', 14, 26);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Documento generado el: ${new Date().toLocaleString('es-CO')}`, 14, 32);

  // Meta Info Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text('DATOS DEL TURNO', 14, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Identificador de Turno: #${shift.id || 'N/A'}`, 14, 55);
  doc.text(`Cajero Responsable: ${shift.cajero || 'Admin'}`, 14, 61);
  doc.text(`Fecha y Hora Apertura: ${fechaInicio}`, 14, 67);
  doc.text(`Fecha y Hora Cierre: ${fechaFin}`, 14, 73);

  // Financial Breakdown Table
  const baseInicial = shift.baseInicial || 0;
  const ventasEfectivo = shift.ventasEfectivo || 0;
  const ventasTransferencia = shift.ventasTransferencia || shift.ventasDigitales || 0;
  const ventasDatafono = shift.ventasDatafono || shift.ventasTarjetas || 0;
  const propinas = shift.totalPropinas || 0;
  const gastos = shift.totalGastos || 0;
  const totalEsperado = shift.totalEsperado || baseInicial + ventasEfectivo - gastos;
  const efectivoReal = shift.efectivoReal !== undefined && shift.efectivoReal !== null ? shift.efectivoReal : totalEsperado;
  const diferencia = efectivoReal - totalEsperado;

  const tableData = [
    ['(+) Base Inicial de Caja en Efectivo', formatCOP(baseInicial)],
    ['(+) Ventas Cobradas en Efectivo', formatCOP(ventasEfectivo)],
    ['(+) Ventas Digitales (Nequi / Daviplata / Bancolombia)', formatCOP(ventasTransferencia)],
    ['(+) Ventas Datáfono / Tarjetas de Crédito / Débito', formatCOP(ventasDatafono)],
    ['(+) Propinas Voluntarias Recaudadas', formatCOP(propinas)],
    ['(-) Salidas de Caja / Gastos Operativos del Turno', `-${formatCOP(gastos)}`],
    ['(=) TOTAL TEÓRICO ESPERADO EN CAJA', formatCOP(totalEsperado)],
    ['(=) EFECTIVO REAL DECLARADO EN ARQUEO', formatCOP(efectivoReal)],
    [
      diferencia === 0
        ? 'ESTADO DE CUADRE: CAJA EXACTA'
        : diferencia > 0
        ? `ESTADO DE CUADRE: SOBRANTE EN CAJA`
        : `ESTADO DE CUADRE: FALTANTE EN CAJA`,
      formatCOP(diferencia),
    ],
  ];

  autoTable(doc, {
    startY: 80,
    head: [['Concepto Contable del Turno', 'Monto Liquidado']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [25, 25, 25],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [40, 40, 40],
    },
    columnStyles: {
      0: { cellWidth: 130 },
      1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
  });

  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 15 : 190;

  // Signatures Section
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);

  // Line 1: Cajero
  doc.line(20, finalY + 25, 85, finalY + 25);
  doc.text('Firma y C.C. Cajero Responsable', 25, finalY + 30);

  // Line 2: Administrador
  doc.line(125, finalY + 25, 190, finalY + 25);
  doc.text('Firma y Sello Administrador / Gerente', 125, finalY + 30);

  // Legal / Security footer
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text(
    'Este documento es soporte oficial del arqueo de caja generado por la plataforma GastroNegocios.',
    14,
    285
  );

  const cleanRest = restaurantName.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Cierre_Caja_${cleanRest}_Turno_${shift.id || 'Caja'}.pdf`);
}
