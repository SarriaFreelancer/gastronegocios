'use client';

import React, { useState } from 'react';
import { Printer, X, MessageCircle, FileText, ChefHat, Check } from 'lucide-react';

interface ReceiptItem {
  nombre: string;
  precio: number;
  cantidad: number;
  notas?: string | null;
  adicionales?: string | null;
}

interface RestaurantReceiptInfo {
  nombre?: string;
  eslogan?: string;
  direccion?: string;
  telefono?: string;
  slug?: string;
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
  restaurantInfo?: RestaurantReceiptInfo;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptProps> = ({
  isOpen,
  onClose,
  order,
  ticketType: initialTicketType = 'factura',
  restaurantInfo,
}) => {
  const [currentTicketType, setCurrentTicketType] = useState<'factura' | 'comanda'>(initialTicketType);

  if (!isOpen || !order) return null;

  const isComanda = currentTicketType === 'comanda';
  const formatCOP = (num: number) => '$' + (num || 0).toLocaleString('es-CO');

  const restName = restaurantInfo?.nombre || 'PUNTO G';
  const restSlogan = restaurantInfo?.eslogan || 'ANTOJOS QUE CONECTAN';
  const restAddress = restaurantInfo?.direccion || 'Calle 9 # 45-12, Granada - Cali';
  const restPhone = restaurantInfo?.telefono || '322 908 8736';
  const restSlug = restaurantInfo?.slug || 'punto-g';

  const handlePrint = () => {
    const printArea = document.getElementById('thermal-receipt-print-area');
    if (!printArea) {
      window.print();
      return;
    }

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

  const cleanCustomerPhone = (order.telefono || '').replace(/\D/g, '');
  const targetPhone = cleanCustomerPhone.length === 10 ? `57${cleanCustomerPhone}` : cleanCustomerPhone;
  const whatsappUrl = targetPhone
    ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(
        `¡Hola ${order.cliente}! Aquí tienes el comprobante de tu pedido #${order.codigo} en ${restName}:\n\nTotal: ${formatCOP(order.total)}\nMétodo: ${order.metodoPago || 'Efectivo'}\n\n¡Gracias por tu compra!`
      )}`
    : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Screen Header */}
        <div className="print:hidden flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950 shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-brand-yellow" />
            <h3 className="text-xs sm:text-sm font-black text-white tracking-wide uppercase">
              Impresora Térmica POS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Modo: Comanda Cocina vs Factura Cliente */}
        <div className="print:hidden p-3 bg-neutral-900 border-b border-neutral-800 space-y-2 shrink-0">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/40 rounded-xl border border-neutral-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setCurrentTicketType('comanda')}
              className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                isComanda
                  ? 'bg-brand-yellow text-black font-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Comanda Cocina</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentTicketType('factura')}
              className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                !isComanda
                  ? 'bg-brand-yellow text-black font-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ticket / Cuenta</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-brand-yellow text-black font-black text-xs uppercase tracking-wider hover:bg-yellow-400 active:scale-95 transition shadow-lg shadow-brand-yellow/20"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir {isComanda ? 'Comanda' : 'Ticket'} (80mm/58mm)</span>
            </button>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition flex items-center justify-center"
                title="Enviar ticket por WhatsApp al cliente"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Printable Ticket Content (monochrome, high-contrast monospace) */}
        <div className="overflow-y-auto p-4 bg-white text-black font-mono text-xs leading-relaxed print:p-0 print:m-0 print:w-[80mm] print:overflow-visible">
          <div id="thermal-receipt-print-area" className="receipt-paper max-w-[320px] mx-auto">
            {/* Header */}
            <div className="text-center mb-2">
              <h1 className="text-base font-extrabold tracking-wider uppercase">{restName}</h1>
              <p className="text-[10px] font-semibold tracking-widest text-neutral-600">{restSlogan}</p>
              <p className="text-[10px] text-neutral-600">{restAddress}</p>
              <p className="text-[10px] text-neutral-600">WhatsApp: {restPhone}</p>
              <div className="my-1 border-t border-dashed border-black" />
              <p className="text-xs font-black tracking-widest uppercase">
                {isComanda ? '*** COMANDA DE COCINA ***' : '*** COMPROBANTE DE VENTA ***'}
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
              <p>Rastrea en vivo: puntog.com/r/{restSlug}/pedido/{order.codigo}</p>
              <p className="text-[9px] text-neutral-500 mt-1">GastroPOS • SarriaTech Solutions</p>
            </div>
          </div>
        </div>

        {/* Screen Footer */}
        <div className="print:hidden px-4 py-2.5 border-t border-neutral-800 bg-neutral-950 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-neutral-800 text-neutral-300 font-semibold text-xs hover:bg-neutral-700 transition"
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
