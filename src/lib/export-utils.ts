import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ExportPdfOptions {
  title: string;
  subtitle?: string;
  restaurantName?: string;
  columns: string[];
  rows: (string | number)[][];
  fileName: string;
  summaryRows?: string[];
}

export function exportToExcel(data: any[], fileName: string, sheetName = 'Datos') {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Generate buffer and trigger download
    const dateStr = new Date().toISOString().split('T')[0];
    const finalName = fileName.endsWith('.xlsx') ? fileName : `${fileName}_${dateStr}.xlsx`;
    XLSX.writeFile(wb, finalName);
  } catch (error) {
    console.error('Error exportando a Excel:', error);
    alert('Error al exportar archivo Excel');
  }
}

export function exportToPdf({
  title,
  subtitle,
  restaurantName = 'PUNTO G GastroERP',
  columns,
  rows,
  fileName,
  summaryRows = [],
}: ExportPdfOptions) {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const currentDate = new Date().toLocaleString('es-CO');

    // Header styling
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Header branding
    doc.setTextColor(249, 115, 22); // orange-500
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(restaurantName.toUpperCase(), 14, 12);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(title, 14, 18);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Fecha de emisión: ${currentDate}`, 14, 24);

    if (subtitle) {
      doc.setFontSize(8);
      doc.text(subtitle, pageWidth - 14, 24, { align: 'right' });
    }

    // Table
    (doc as any).autoTable({
      head: [columns],
      body: rows,
      startY: 33,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 14, right: 14 },
    });

    // Final Y coordinate
    let finalY = (doc as any).lastAutoTable?.finalY || 40;

    // Summary lines
    if (summaryRows.length > 0) {
      if (finalY + 20 > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        finalY = 20;
      }

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);

      summaryRows.forEach((line, idx) => {
        doc.text(line, 14, finalY + 8 + idx * 5);
      });
    }

    // Footer on all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Desarrollado por SarriaTech Solutions S.A.S — Página ${i} de ${totalPages}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      );
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const finalName = fileName.endsWith('.pdf') ? fileName : `${fileName}_${dateStr}.pdf`;
    doc.save(finalName);
  } catch (error) {
    console.error('Error exportando a PDF:', error);
    alert('Error al exportar archivo PDF');
  }
}
