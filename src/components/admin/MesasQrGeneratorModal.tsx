'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Printer, 
  X, 
  Download, 
  Sparkles, 
  QrCode, 
  UtensilsCrossed, 
  Star,
  Check, 
  Layers, 
  Eye, 
  ChevronRight,
  Smartphone,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

interface TableItem {
  id: number | string;
  numero: string;
  ubicacion?: string | null;
  capacidad?: number;
}

interface RestaurantInfo {
  nombre: string;
  slug: string;
  logo?: string | null;
  eslogan?: string | null;
  colorPrimario?: string;
  colorSecundario?: string;
}

interface MesasQrGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: TableItem[];
  restaurant: RestaurantInfo;
  initialTableId?: number | string | null;
}

interface TableQrData {
  table: TableItem;
  menuUrl: string;
  menuQrDataUrl: string;
  feedbackUrl: string;
  feedbackQrDataUrl: string;
}

export const MesasQrGeneratorModal: React.FC<MesasQrGeneratorModalProps> = ({
  isOpen,
  onClose,
  tables,
  restaurant,
  initialTableId,
}) => {
  const [selectedMode, setSelectedMode] = useState<'all' | 'single'>(initialTableId ? 'single' : 'all');
  const [selectedTableId, setSelectedTableId] = useState<string | number>(
    initialTableId || (tables[0]?.id ?? '')
  );
  const [tableQrs, setTableQrs] = useState<TableQrData[]>([]);
  const [generating, setGenerating] = useState<boolean>(true);
  const [qrLayoutMode, setQrLayoutMode] = useState<'both' | 'order' | 'feedback'>('both');

  // Origen de la URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gastronegocios.com';

  useEffect(() => {
    if (initialTableId) {
      setSelectedTableId(initialTableId);
      setSelectedMode('single');
    }
  }, [initialTableId]);

  // Generar ambos códigos QR (Pedido + Calificar Servicio) en alta resolución
  useEffect(() => {
    if (!isOpen || tables.length === 0) return;

    let isMounted = true;
    setGenerating(true);

    const generateAll = async () => {
      const results: TableQrData[] = [];

      for (const t of tables) {
        const cleanTableNum = encodeURIComponent(t.numero);
        const menuUrl = `${baseUrl}/r/${restaurant.slug}/menu?mesa=${cleanTableNum}`;
        const feedbackUrl = `${baseUrl}/r/${restaurant.slug}/calificar?mesa=${cleanTableNum}`;

        try {
          const menuQrDataUrl = await QRCode.toDataURL(menuUrl, {
            width: 450,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#ffffff',
            },
            errorCorrectionLevel: 'H',
          });

          const feedbackQrDataUrl = await QRCode.toDataURL(feedbackUrl, {
            width: 450,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#ffffff',
            },
            errorCorrectionLevel: 'H',
          });

          results.push({
            table: t,
            menuUrl,
            menuQrDataUrl,
            feedbackUrl,
            feedbackQrDataUrl,
          });
        } catch (e) {
          console.error(`Error generando QR para mesa ${t.numero}:`, e);
        }
      }

      if (isMounted) {
        setTableQrs(results);
        setGenerating(false);
      }
    };

    generateAll();

    return () => {
      isMounted = false;
    };
  }, [isOpen, tables, restaurant.slug, baseUrl]);

  if (!isOpen) return null;

  const filteredQrs = selectedMode === 'all'
    ? tableQrs
    : tableQrs.filter((q) => String(q.table.id) === String(selectedTableId));

  const handlePrint = () => {
    window.print();
  };

  const primaryColor = restaurant.colorPrimario || '#ffc928';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:fixed print:inset-0">
      
      {/* Contenedor Modal */}
      <div className="bg-[#121214] border border-[#26262a] rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden print:max-w-none print:max-h-none print:border-none print:bg-white print:shadow-none print:w-full print:h-auto">
        
        {/* ======================================================== */}
        {/* HEADER (Oculto al imprimir)                              */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 border-b border-[#222] flex items-center justify-between bg-[#161619] print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-black shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase text-white font-display tracking-wider flex items-center gap-2">
                <span>Códigos QR Oficiales de Mesa</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30">
                  Carta Digital & Calificación
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                {restaurant.nombre} • Genera las tarjetas para acrílicos de mesa con QR para pedir y QR para calificar el servicio.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#252525] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* BARRA DE HERRAMIENTAS Y CONTROLES (Oculto al imprimir)   */}
        {/* ======================================================== */}
        <div className="p-4 bg-[#141416] border-b border-[#222] flex flex-wrap items-center justify-between gap-3 print:hidden shrink-0">
          
          {/* Selector de Modo: Todas vs Una Sola */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400 font-bold">Mesas:</span>
            <div className="inline-flex bg-[#1d1d20] p-1 rounded-xl border border-[#2a2a2e] text-xs font-bold">
              <button
                type="button"
                onClick={() => setSelectedMode('all')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  selectedMode === 'all'
                    ? 'bg-brand-yellow text-black font-black shadow-sm'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Todas las Mesas ({tables.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedMode('single')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  selectedMode === 'single'
                    ? 'bg-brand-yellow text-black font-black shadow-sm'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Mesa Específica
              </button>
            </div>

            {selectedMode === 'single' && (
              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                className="bg-[#1d1d20] border border-[#2a2a2e] text-white text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-brand-yellow"
              >
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.numero} {t.ubicacion ? `(${t.ubicacion})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selector de Contenido: Ambos QRs vs Solo Pedido vs Solo Calificar */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-bold hidden sm:inline">Mostrar:</span>
            <div className="inline-flex bg-[#1d1d20] p-1 rounded-xl border border-[#2a2a2e] text-xs font-bold">
              <button
                type="button"
                onClick={() => setQrLayoutMode('both')}
                className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  qrLayoutMode === 'both'
                    ? 'bg-brand-yellow text-black font-black shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Incluir ambos códigos QR: Pedido y Calificar Servicio"
              >
                <span>Doble QR (Pedido + Reseña)</span>
              </button>
              <button
                type="button"
                onClick={() => setQrLayoutMode('order')}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  qrLayoutMode === 'order'
                    ? 'bg-brand-yellow text-black font-black shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Solo QR para pedir en mesa"
              >
                Solo Pedido
              </button>
              <button
                type="button"
                onClick={() => setQrLayoutMode('feedback')}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  qrLayoutMode === 'feedback'
                    ? 'bg-brand-yellow text-black font-black shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Solo QR para calificar el servicio"
              >
                Solo Calificar
              </button>
            </div>
          </div>

          {/* Botón de Impresión Principal */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              disabled={generating || filteredQrs.length === 0}
              className="px-5 py-2.5 rounded-xl bg-brand-yellow hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-glow transition hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>
                {selectedMode === 'all'
                  ? `Imprimir Lote (${filteredQrs.length} Mesas)`
                  : 'Imprimir Esta Mesa'}
              </span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* ÁREA DE VISTA PREVIA & PLANTILLAS IMPRIMIBLES            */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0a0a0c] print:overflow-visible print:p-0 print:bg-white">
          {generating ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-center">
              <div 
                className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}
              />
              <p className="text-xs font-bold text-gray-400">Generando códigos QR oficiales en alta resolución...</p>
            </div>
          ) : filteredQrs.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-gray-500 text-xs">
              <p>No hay mesas configuradas para generar códigos QR.</p>
            </div>
          ) : (
            <div className={`grid gap-6 print:p-4 ${
              qrLayoutMode === 'both' 
                ? 'grid-cols-1 md:grid-cols-2 print:grid-cols-1 print:gap-6' 
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-2 print:gap-4'
            }`}>
              {filteredQrs.map((item) => (
                <div
                  key={item.table.id}
                  className="bg-white text-black rounded-3xl p-5 sm:p-6 border-2 border-dashed border-gray-300 shadow-xl flex flex-col items-center justify-between text-center relative overflow-hidden page-break-inside-avoid print:shadow-none print:border-2 print:border-black print:rounded-2xl print:m-4"
                  style={{ 
                    minHeight: qrLayoutMode === 'both' ? '460px' : '440px', 
                    maxWidth: qrLayoutMode === 'both' ? '520px' : '340px', 
                    margin: '0 auto',
                    width: '100%'
                  }}
                >
                  {/* Decorative Brand Top Banner */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-3"
                    style={{ backgroundColor: primaryColor }}
                  />

                  {/* Header de la Tarjeta */}
                  <div className="pt-2 w-full">
                    {restaurant.logo ? (
                      <img 
                        src={restaurant.logo} 
                        alt={restaurant.nombre} 
                        className="h-10 mx-auto object-contain mb-1.5"
                      />
                    ) : (
                      <h4 className="font-extrabold text-base tracking-wider uppercase text-gray-900 font-display">
                        {restaurant.nombre}
                      </h4>
                    )}
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {restaurant.eslogan || 'Comidas Rápidas Gourmet'}
                    </p>
                  </div>

                  {/* Número de Mesa Gigante y Elegante */}
                  <div className="my-2 py-1.5 px-6 rounded-2xl bg-black text-white inline-block shadow-md">
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-400 block">
                      Estás en la
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider font-display">
                      {item.table.numero}
                    </h2>
                  </div>

                  {/* ======================================================== */}
                  {/* CONTENEDOR DE CÓDIGOS QR (DOBLE QR O INDIVIDUAL)        */}
                  {/* ======================================================== */}
                  {qrLayoutMode === 'both' ? (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full my-2">
                      
                      {/* QR 1: Pedir en Mesa */}
                      <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-3 flex flex-col items-center justify-between text-center space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-black flex items-center justify-center gap-1">
                          <Smartphone className="w-3 h-3 text-black" />
                          <span>1. Pedir en Mesa</span>
                        </span>
                        
                        <div className="p-1.5 bg-white border border-gray-300 rounded-xl shadow-inner">
                          <img 
                            src={item.menuQrDataUrl} 
                            alt={`QR Menú ${item.table.numero}`} 
                            className="w-32 h-32 sm:w-36 sm:h-36 object-contain mx-auto"
                          />
                        </div>

                        <p className="text-[9px] text-gray-600 font-medium leading-tight">
                          Abre la carta digital y pide directo a la cocina.
                        </p>

                        <a
                          href={item.menuQrDataUrl}
                          download={`QR_Pedido_${restaurant.slug}_${item.table.numero.replace(/\s+/g, '_')}.png`}
                          className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold text-[9px] flex items-center gap-1 transition print:hidden"
                        >
                          <Download className="w-2.5 h-2.5" />
                          <span>PNG Pedido</span>
                        </a>
                      </div>

                      {/* QR 2: Calificar el Servicio */}
                      <div className="bg-amber-50/60 border-2 border-amber-200 rounded-2xl p-3 flex flex-col items-center justify-between text-center space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center justify-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>2. Calificanos</span>
                        </span>

                        <div className="p-1.5 bg-white border border-amber-200 rounded-xl shadow-inner">
                          <img 
                            src={item.feedbackQrDataUrl} 
                            alt={`QR Calificar ${item.table.numero}`} 
                            className="w-32 h-32 sm:w-36 sm:h-36 object-contain mx-auto"
                          />
                        </div>

                        <p className="text-[9px] text-gray-600 font-medium leading-tight">
                          Déjanos tu reseña sobre la comida y la atención.
                        </p>

                        <a
                          href={item.feedbackQrDataUrl}
                          download={`QR_Resena_${restaurant.slug}_${item.table.numero.replace(/\s+/g, '_')}.png`}
                          className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-[9px] flex items-center gap-1 transition print:hidden"
                        >
                          <Download className="w-2.5 h-2.5" />
                          <span>PNG Reseña</span>
                        </a>
                      </div>

                    </div>
                  ) : qrLayoutMode === 'order' ? (
                    /* Solo QR de Pedido */
                    <div className="my-2 flex flex-col items-center space-y-2">
                      <div className="p-3 bg-white border-2 border-gray-200 rounded-2xl shadow-inner">
                        <img 
                          src={item.menuQrDataUrl} 
                          alt={`QR Menú ${item.table.numero}`} 
                          className="w-44 h-44 object-contain mx-auto"
                        />
                      </div>
                      <p className="text-xs font-black uppercase text-gray-900 flex items-center justify-center gap-1.5 pt-1">
                        <Smartphone className="w-3.5 h-3.5 text-black" />
                        <span>Escanea para ver la Carta y Pedir</span>
                      </p>
                      <p className="text-[9px] text-gray-500 leading-tight">
                        Selecciona tus platos favoritos y recíbelos en tu mesa.
                      </p>
                    </div>
                  ) : (
                    /* Solo QR de Calificar */
                    <div className="my-2 flex flex-col items-center space-y-2">
                      <div className="p-3 bg-white border-2 border-amber-200 rounded-2xl shadow-inner">
                        <img 
                          src={item.feedbackQrDataUrl} 
                          alt={`QR Calificar ${item.table.numero}`} 
                          className="w-44 h-44 object-contain mx-auto"
                        />
                      </div>
                      <p className="text-xs font-black uppercase text-amber-950 flex items-center justify-center gap-1.5 pt-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>¡Tu opinión nos ayuda a crecer!</span>
                      </p>
                      <p className="text-[9px] text-gray-500 leading-tight">
                        Escanea para calificar la comida, la atención y el servicio de hoy.
                      </p>
                    </div>
                  )}

                  {/* Pie de imprenta oficial para restaurantes */}
                  <div className="pt-2 w-full border-t border-gray-100 flex items-center justify-between text-[8px] text-gray-400 font-semibold">
                    <span>{restaurant.nombre} • Mesa Oficial</span>
                    <span>Powered by GastroPOS • SarriaTech Solutions</span>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* FOOTER MODAL (Oculto al imprimir)                        */}
        {/* ======================================================== */}
        <div className="p-4 bg-[#141416] border-t border-[#222] flex items-center justify-between text-xs text-gray-400 print:hidden shrink-0">
          <p className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-yellow" />
            <span>
              Tip: Al presionar <strong>Imprimir</strong>, el sistema acomoda las tarjetas con ambos códigos QR listas para cortar y colocar en acrílicos de mesa.
            </span>
          </p>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded-xl font-bold transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>

      {/* Estilos específicos de impresión */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block {
            display: block !important;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};
