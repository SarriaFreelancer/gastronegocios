'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Star, MessageSquare, CheckCircle, ArrowLeft, Heart, Send } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

function CalificarForm() {
  const searchParams = useSearchParams();
  const mesaParam = searchParams.get('mesa') || '';

  const [clienteNombre, setClienteNombre] = useState('');
  const [calificacion, setCalificacion] = useState(5);
  const [tipoVisita, setTipoVisita] = useState(mesaParam ? 'En Sitio / Mesa' : 'En Sitio / Mesa');
  const [mesaNumero, setMesaNumero] = useState(mesaParam);
  const [comentario, setComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);

  useEffect(() => {
    if (mesaParam) setMesaNumero(mesaParam);
    fetchReviews();
  }, [mesaParam]);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews?publicados=true');
      const data = await res.json();
      if (data.reviews) {
        setRecentReviews(data.reviews.slice(0, 4));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteNombre || !comentario) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteNombre,
          calificacion,
          tipoVisita,
          mesaNumero: tipoVisita === 'En Sitio / Mesa' ? mesaNumero : null,
          comentario,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        fetchReviews();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-16 px-4">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <Logo size="md" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-xs font-bold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 text-brand-orange fill-brand-orange" />
            <span>Tu Opinión Conecta Con Nosotros</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-white font-display">
            ¿CÓMO ESTUVO TU EXPERIENCIA?
          </h1>
          <p className="text-sm text-gray-400">
            En Punto G nos esforzamos en darte los antojos más deliciosos. Ayúdanos calificando nuestra comida y servicio.
          </p>
        </div>

        {submitted ? (
          <div className="bg-[#121212] border border-brand-yellow/40 rounded-3xl p-8 sm:p-10 text-center space-y-5 shadow-glow">
            <div className="w-16 h-16 bg-brand-yellow/20 text-brand-yellow rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black uppercase text-white font-display">
              ¡GRACIAS POR TU COMENTARIO!
            </h2>
            <p className="text-sm text-gray-300">
              Valoramos enormemente tus palabras. Tu retroalimentación nos ayuda a seguir preparando las mejores hamburguesas y parrillas de Cali.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setComentario('');
                }}
                className="px-6 py-3 bg-[#1e1e1e] hover:bg-[#252525] text-white rounded-xl text-xs font-bold transition-colors"
              >
                Enviar otra opinión
              </button>
              <Link
                href="/menu"
                className="px-6 py-3 bg-brand-yellow hover:bg-brand-yellowHover text-black rounded-xl text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2"
              >
                <span>Ver nuestro Menú</span>
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-[#121212] border border-[#222222] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
          >
            {mesaParam && (
              <div className="bg-brand-yellow/10 border border-brand-yellow/30 p-3 rounded-xl flex items-center justify-between text-xs">
                <span className="text-gray-300">Calificando atención en:</span>
                <span className="font-black text-brand-yellow uppercase text-sm">{mesaParam}</span>
              </div>
            )}

            {/* Star Rating Selector */}
            <div className="text-center space-y-2">
              <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider">
                Calificación general
              </label>
              <div className="flex justify-center items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCalificacion(star)}
                    className="p-1.5 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= calificacion
                          ? 'text-brand-yellow fill-brand-yellow drop-shadow-[0_0_8px_rgba(255,201,40,0.6)]'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs font-bold text-brand-yellow">
                {calificacion === 5 && '⭐⭐⭐⭐⭐ ¡Excelente! Insuperable'}
                {calificacion === 4 && '⭐⭐⭐⭐ ¡Muy Bueno! Gran sabor'}
                {calificacion === 3 && '⭐⭐⭐ Bueno, aceptable'}
                {calificacion === 2 && '⭐⭐ Regular, puede mejorar'}
                {calificacion === 1 && '⭐ Malo, no me gustó'}
              </p>
            </div>

            {/* Tipo de Visita */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-300 mb-2">
                ¿Dónde disfrutaste tu pedido?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['En Sitio / Mesa', 'Domicilio', 'Para Llevar'].map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setTipoVisita(tipo)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      tipoVisita === tipo
                        ? 'bg-brand-yellow text-black border-brand-yellow shadow-glow'
                        : 'bg-[#181818] text-gray-400 border-[#2a2a2a] hover:text-white'
                    }`}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            </div>

            {/* Mesa selection if En Sitio */}
            {tipoVisita === 'En Sitio / Mesa' && (
              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                  Número de Mesa o Barra (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Mesa 2, Barra 1..."
                  value={mesaNumero}
                  onChange={(e) => setMesaNumero(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#2b2b2b] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow text-xs"
                />
              </div>
            )}

            {/* Nombre */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                Tu Nombre *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Laura Gómez"
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#2b2b2b] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow text-xs"
              />
            </div>

            {/* Comentario */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                Tu Comentario o Sugerencia *
              </label>
              <textarea
                required
                rows={4}
                placeholder="¿Qué tal estuvo la comida, la sazón de la hamburguesa, el tiempo de entrega o la atención del personal? ¡Cuéntanoslo todo!"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#2b2b2b] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow text-xs resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'ENVIANDO...' : 'PUBLICAR CALIFICACIÓN'}</span>
            </button>
          </form>
        )}

        {/* Recent Reviews Showcase */}
        {recentReviews.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-black uppercase text-white font-display flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-yellow" />
              <span>Opiniones Recientes de Clientes</span>
            </h3>
            <div className="grid gap-3">
              {recentReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-[#121212] border border-[#222222] rounded-2xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{rev.clienteNombre}</p>
                      <span className="text-[10px] text-gray-500">
                        {rev.tipoVisita} {rev.mesaNumero ? `• ${rev.mesaNumero}` : ''}
                      </span>
                    </div>
                    <div className="flex items-center text-brand-yellow">
                      {[...Array(rev.calificacion)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-brand-yellow" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 italic">"{rev.comentario}"</p>
                  {rev.respuesta && (
                    <div className="bg-[#1a1a1a] border-l-2 border-brand-yellow p-2 rounded-r-lg text-[11px] text-gray-400">
                      <strong className="text-brand-yellow block">Respuesta de Punto G:</strong>
                      {rev.respuesta}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-brand-yellow transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function CalificarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080808] text-white flex items-center justify-center">Cargando...</div>}>
      <CalificarForm />
    </Suspense>
  );
}
