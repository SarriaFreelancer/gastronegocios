'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Star, MessageSquare, CheckCircle, ArrowLeft, Heart, Send } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

function CalificarFormContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = ((params?.slug as string) || 'punto-g').toLowerCase().trim();
  const mesaParam = searchParams.get('mesa') || '';
  const orderParam = searchParams.get('order') || '';

  const [restaurantName, setRestaurantName] = useState('Punto G');
  const [clienteNombre, setClienteNombre] = useState('');
  const [calificacion, setCalificacion] = useState(5);
  const [tipoVisita, setTipoVisita] = useState(mesaParam ? 'En Sitio / Mesa' : 'Domicilio');
  const [mesaNumero, setMesaNumero] = useState(mesaParam);
  const [comentario, setComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/restaurants?slug=${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.restaurant?.nombre) setRestaurantName(data.restaurant.nombre);
      })
      .catch(() => {});

    fetchReviews();
  }, [slug]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?publicados=true&restaurantSlug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        if (data.reviews) {
          setRecentReviews(data.reviews.slice(0, 4));
        }
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
          restaurantSlug: slug,
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
    <div className="min-h-screen bg-[#080808] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href={`/r/${slug}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a {restaurantName}</span>
          </Link>

          <Link
            href={`/r/${slug}/rastreo`}
            className="text-xs font-bold text-brand-yellow hover:underline"
          >
            Rastrear Pedido →
          </Link>
        </div>

        {/* Hero */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase font-display tracking-tight">
            CALIFICA TU EXPERIENCIA EN <span className="text-brand-yellow">{restaurantName}</span>
          </h1>
          <p className="text-sm text-gray-400 max-w-lg mx-auto">
            Tu opinión nos ayuda a mantener el auténtico sabor y la mejor atención en cada bocado.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#121212] border border-[#222] rounded-3xl p-6 sm:p-8 shadow-2xl">
          {submitted ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase font-display">¡Muchas Gracias!</h3>
              <p className="text-sm text-gray-300 max-w-md mx-auto">
                Tu reseña fue recibida con éxito. ¡Gracias por ser parte de la familia {restaurantName}!
              </p>
              <div className="pt-2">
                <Link
                  href={`/r/${slug}`}
                  className="px-6 py-3 bg-brand-yellow text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-glow inline-block"
                >
                  Volver al Inicio
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Star Rating */}
              <div className="text-center space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  ¿Cómo estuvo la comida y la atención?
                </span>
                <div className="flex items-center justify-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCalificacion(star)}
                      className="p-1 transition-transform hover:scale-125 cursor-pointer"
                    >
                      <Star
                        className={`w-9 h-9 sm:w-10 sm:h-10 ${
                          star <= calificacion
                            ? 'text-brand-yellow fill-brand-yellow drop-shadow-[0_2px_10px_rgba(255,201,40,0.5)]'
                            : 'text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-brand-yellow block">
                  {calificacion === 5 && '⭐⭐⭐⭐⭐ ¡Excelente! Lo amé'}
                  {calificacion === 4 && '⭐⭐⭐⭐ Muy bueno'}
                  {calificacion === 3 && '⭐⭐⭐ Bueno'}
                  {calificacion === 2 && '⭐⭐ Regular'}
                  {calificacion === 1 && '⭐ Malo'}
                </span>
              </div>

              {/* Form Fields */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                    Tu Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Daniel Gómez"
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2e2e2e] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-yellow"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                      Modalidad
                    </label>
                    <select
                      value={tipoVisita}
                      onChange={(e) => setTipoVisita(e.target.value)}
                      className="w-full bg-[#181818] border border-[#2e2e2e] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-yellow font-bold"
                    >
                      <option value="Domicilio">Domicilio / Pedido Online</option>
                      <option value="En Sitio / Mesa">En Restaurante / Mesa</option>
                      <option value="Para Llevar">Para Llevar / Recoger</option>
                    </select>
                  </div>

                  {tipoVisita === 'En Sitio / Mesa' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                        Número de Mesa
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Mesa 4"
                        value={mesaNumero}
                        onChange={(e) => setMesaNumero(e.target.value)}
                        className="w-full bg-[#181818] border border-[#2e2e2e] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-yellow"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                    Tu Opinión o Comentario *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="¿Qué plato pediste? ¿Qué tal la temperatura, las salsas y el tiempo de entrega?..."
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2e2e2e] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-yellow"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !clienteNombre.trim() || !comentario.trim()}
                  className="w-full py-4 bg-brand-yellow hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-glow transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4 fill-current" />
                  <span>{isSubmitting ? 'Enviando Calificación...' : 'Publicar Calificación'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Recent Community Reviews */}
        {recentReviews.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="text-base font-black text-white uppercase font-display text-center">
              Opiniones Recientes de Clientes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentReviews.map((rev) => (
                <div key={rev.id} className="bg-[#121212] border border-[#202020] rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{rev.clienteNombre}</span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(rev.calificacion)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-brand-yellow fill-brand-yellow" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed italic">"{rev.comentario}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function TenantCalificarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080808] pt-28 text-center text-white">Cargando...</div>}>
      <CalificarFormContent />
    </Suspense>
  );
}
