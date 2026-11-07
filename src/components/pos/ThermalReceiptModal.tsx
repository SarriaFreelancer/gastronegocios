'use client';

import React from 'react';
import { Printer, X } from 'lucide-react';

interface ReceiptItem {
  nombre: string;
  precio: number;
  cantidad: number;
  notas?: string | null;
  adicionales?: string | null;
}

interface ThermalReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    codigo: string;
    cliente: string;
    telefono: string;
    tipo: string;
    numeroMesa?: string | null;
    direccion?: string | null;
    barrio?: string | null;
    subtotal: number;
    propina?: number;
    costoEnvio?: number;
    total: number;
    metodoPago: string;
    notasCliente?: string | null;
    repartidor?: string | null;
    createdAt?: string;
    items: ReceiptItem[];
  } | null;
  ticketType?: 'factura' | 'comanda';
}

export const ThermalReceiptModal: React.FC<ThermalReceiptProps> = ({
  isOpen,
  onClose,
  order,
  ticketType = 'factura',
}) => {
  if (!isOpen || !order) return null;

  const isComanda = ticketType === 'comanda';
  const formatCOP = (num: number) => '$' + (num || 0).toLocaleString('es-CO');

  const handlePrint = () => {
    const printArea = document.getElementById('thermal-receipt-print-area');
    if (!printArea) {
      window.print();
      return;
    }

    // Create an isolated hidden iframe for crisp, reliable POS printing
    const existingIframe = document.getElementById('receipt-print-iframe');
    if (existingIframe) existingIframe.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'receipt-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.zIndex = '-9999';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${isComanda ? 'Comanda' : 'Ticket'} - ${order.codigo}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            @media print {
              html, body {
                width: 80mm !important;
                margin: 0 !important;
                padding: 4px 6px !important;
                background: #fff !important;
                color: #000 !important;
              }
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 11px;
              line-height: 1.35;
              color: #000;
              background: #fff;
              width: 74mm;
              margin: 0 auto;
              padding: 6px;
              box-sizing: border-box;
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .font-black { font-weight: 900; }
            .uppercase { text-transform: uppercase; }
            .border-dashed { border-top: 1px dashed #000; margin: 6px 0; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-center { align-items: center; }
            .badge { background: #000; color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 4px 0; font-size: 11px; }
            th, td { text-align: left; padding: 2px 0; vertical-align: top; }
            th.right, td.right { text-align: right; }
          </style>
        </head>
        <body>
          ${printArea.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.error('Iframe print error, falling back to window.print', e);
        window.print();
      }
    }, 250);
  };

  const parseAddons = (raw: string | null | undefined) => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString('es-CO', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    : new Date().toLocaleString('es-CO');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Container - on screen it is an attractive dialog, on print it isolates the receipt */}
      <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Screen Header */}
        <div className="print:hidden flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              {isComanda ? 'Comanda de Cocina (POS)' : 'Ticket / Factura (POS)'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons for Screen */}
        <div className="print:hidden p-4 bg-neutral-900/80 border-b border-neutral-800 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-400 text-black font-bold text-sm hover:bg-amber-300 active:scale-95 transition shadow-lg shadow-amber-400/20"
          >
            <Printer className="w-4 h-4" /> Imprimir Ticket (58mm/80mm)
          </button>
        </div>

        {/* Printable Ticket Content (monochrome, high-contrast monospace) */}
        <div className="overflow-y-auto p-4 bg-white text-black font-mono text-xs leading-relaxed print:p-0 print:m-0 print:w-[80mm] print:overflow-visible">
          <div id="thermal-receipt-print-area" className="receipt-paper max-w-[320px] mx-auto">
            {/* Header */}
            <div className="text-center mb-2">
              <h1 className="text-base font-extrabold tracking-wider uppercase">PUNTO G</h1>
              <p className="text-[10px] font-semibold tracking-widest text-neutral-600">ANTOJOS QUE CONECTAN</p>
              <p className="text-[10px] text-neutral-600">Calle 9 # 45-12, Granada - Cali</p>
              <p className="text-[10px] text-neutral-600">WhatsApp: 322 908 8736</p>
              <div className="my-1 border-t border-dashed border-black" />
              <p className="text-xs font-black tracking-widest uppercase">
                {isComanda ? '*** COMANDA DE COCINA ***' : '*** COMPROBANTE DE PAGO ***'}
              </p>
              <div className="my-1 border-t border-dashed border-black" />
            </div>

            {/* Order Meta */}
            <div className="mb-2 space-y-0.5 text-[11px]">
              <div className="flex justify-between items-center text-sm font-black">
                <span>ORDEN:</span>
                <span className="text-base bg-black text-white px-1.5 py-0.5 rounded">{order.codigo}</span>
              </div>
              <div className="flex justify-between">
                <span>FECHA:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>MODALIDAD:</span>
                <span className="font-bold uppercase">
                  {order.tipo === 'mesa' ? `MESA: ${order.numeroMesa || 'Principal'}` : order.tipo}
                </span>
              </div>
              <div className="flex justify-between">
                <span>CLIENTE:</span>
                <span className="font-bold">{order.cliente}</span>
              </div>
              {order.telefono && (
                <div className="flex justify-between">
                  <span>TEL:</span>
                  <span>{order.telefono}</span>
                </div>
              )}
              {order.direccion && (
                <div className="pt-0.5">
                  <span className="font-bold">DIR: </span>
                  <span>{order.direccion}</span>
                  {order.barrio && <span> ({order.barrio})</span>}
                </div>
              )}
              {order.repartidor && (
                <div className="flex justify-between pt-0.5 text-black font-bold">
                  <span>REPARTIDOR:</span>
                  <span>{order.repartidor}</span>
                </div>
              )}
            </div>

            <div className="my-1 border-t border-dashed border-black" />

            {/* Items Table */}
            <div className="mb-2">
              <div className="flex justify-between text-[11px] font-bold border-b border-black pb-0.5 mb-1">
                <span className="w-8">CANT</span>
                <span className="flex-1">PRODUCTO</span>
                {!isComanda && <span className="w-16 text-right">TOTAL</span>}
              </div>

              {order.items.map((item, idx) => {
                const addons = parseAddons(item.adicionales);
                return (
                  <div key={idx} className="py-1 border-b border-dashed border-neutral-300">
                    <div className="flex justify-between items-start text-[11px]">
                      <span className="w-8 font-black text-xs">{item.cantidad}x</span>
                      <span className="flex-1 font-bold text-xs uppercase">{item.nombre}</span>
                      {!isComanda && (
                        <span className="w-16 text-right font-semibold">
                          {formatCOP(item.precio * item.cantidad)}
                        </span>
                      )}
                    </div>

                    {/* Addons breakdown */}
                    {addons.length > 0 && (
                      <div className="pl-8 text-[10px] text-neutral-700 italic">
                        {addons.map((ad: any, aIdx: number) => (
                          <div key={aIdx} className="flex justify-between">
                            <span>+ {ad.nombre}</span>
                            {!isComanda && ad.precio > 0 && <span>+{formatCOP(ad.precio)}</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Specific item notes */}
                    {item.notas && (
                      <div className="pl-8 text-[10px] font-bold text-black uppercase bg-neutral-100 p-0.5 mt-0.5">
                        👉 NOTA: {item.notas}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* General notes */}
            {order.notasCliente && (
              <div className="my-1.5 p-1.5 bg-neutral-100 border border-black text-[11px]">
                <span className="font-black uppercase">OBSERVACIÓN: </span>
                <span className="font-semibold">{order.notasCliente}</span>
              </div>
            )}

            {/* Financial Totals (Only in Factura / Pre-cuenta) */}
            {!isComanda && (
              <>
                <div className="my-1 border-t border-dashed border-black" />
                <div className="space-y-0.5 text-[11px]">
                  <div className="flex justify-between">
                    <span>SUBTOTAL:</span>
                    <span>{formatCOP(order.subtotal)}</span>
                  </div>
                  {order.costoEnvio !== undefined && order.costoEnvio > 0 && (
                    <div className="flex justify-between">
                      <span>DOMICILIO:</span>
                      <span>{formatCOP(order.costoEnvio)}</span>
                    </div>
                  )}
                  {order.propina !== undefined && order.propina > 0 && (
                    <div className="flex justify-between">
                      <span>PROPINA VOLUNTARIA:</span>
                      <span>{formatCOP(order.propina)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black pt-1 border-t border-black">
                    <span>TOTAL A PAGAR:</span>
                    <span>{formatCOP(order.total)}</span>
                  </div>
                  <div className="flex justify-between pt-0.5 text-[10px]">
                    <span>FORMA DE PAGO:</span>
                    <span className="font-bold uppercase">{order.metodoPago || 'Efectivo'}</span>
                  </div>
                </div>
              </>
            )}

            {/* Footer */}
            <div className="my-2 border-t border-dashed border-black" />
            <div className="text-center text-[10px] space-y-0.5">
              <p className="font-bold">¡GRACIAS POR TU PREFERENCIA!</p>
              <p>Rastrea en vivo: puntog.com/r/{(order as any)?.restaurant?.slug || 'punto-g'}/pedido/{order.codigo}</p>
              <p className="text-[9px] text-neutral-500 mt-1">Software gastronómico Punto G v2.0</p>
            </div>
          </div>
        </div>

        {/* Screen Footer */}
        <div className="print:hidden px-5 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-neutral-800 text-neutral-300 font-semibold text-xs hover:bg-neutral-700 transition"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Global Print Stylesheet for POS printers */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-paper,
          .receipt-paper * {
            visibility: visible;
          }
          .receipt-paper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 80mm !important;
            padding: 2mm !important;
            margin: 0 !important;
            color: black !important;
            background: white !important;
          }
          @page {
            margin: 0;
            size: auto;
          }
        }
      `}</style>
    </div>
  );
};
