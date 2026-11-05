'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { restaurantInfo } from '@/data/restaurant-info';
import { MapPin, Phone, Clock, MessageSquare, Send, CheckCircle2, Mail, MessageCircle } from 'lucide-react';

export default function TenantContactoPage() {
  const params = useParams();
  const slug = ((params?.slug as string) || 'punto-g').toLowerCase().trim();

  const [restaurant, setRestaurant] = useState<any>(null);
  const [formState, setFormState] = useState({
    nombre: '',
    telefono: '',
    email: '',
    asunto: 'consulta',
    mensaje: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants?slug=${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.restaurant) setRestaurant(data.restaurant);
      })
      .catch(() => {});
  }, [slug]);

  const whatsappNumber = restaurant?.telefonoWhatsapp || restaurantInfo.whatsappNumber;
  const restaurantName = restaurant?.nombre || 'Punto G';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.nombre || !formState.mensaje) return;

    const text = `📬 *MENSAJE DE CONTACTO - ${restaurantName.toUpperCase()}*\n\n👤 *Nombre:* ${formState.nombre}\n📱 *Teléfono:* ${formState.telefono || 'No indicado'}\n📧 *Email:* ${formState.email || 'No indicado'}\n📌 *Asunto:* ${formState.asunto}\n\n💬 *Mensaje:*\n${formState.mensaje}`;
    
    setSubmitted(true);
    setTimeout(() => {
      const url = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-16">
      
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-[#0c0c0c] via-[#141414] to-[#080808] border-b border-[#202020] py-14 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs sm:text-sm font-black tracking-widest text-brand-yellow uppercase font-display">
            ESTAMOS PARA ATENDERTE
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase text-white font-display tracking-tight">
            CONTÁCTANOS EN <span className="text-brand-yellow italic">{restaurantName}</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto">
            ¿Tienes dudas sobre eventos, reservas, domicilios o sugerencias? Déjanos tu mensaje y te responderemos de inmediato.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Contact Details Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#121212] border border-[#222] rounded-3xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white uppercase font-display">Ubicación Principal</h3>
              <p className="text-sm text-gray-300">{restaurant?.direccionCentral || restaurantInfo.address}</p>
              <p className="text-xs text-brand-yellow font-bold">{restaurant?.ciudad || restaurantInfo.city}</p>
            </div>

            <div className="bg-[#121212] border border-[#222] rounded-3xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 fill-current" />
              </div>
              <h3 className="text-base font-black text-white uppercase font-display">Línea Oficial WhatsApp</h3>
              <p className="text-sm text-gray-300">Pedidos, reservas y atención al cliente inmediata.</p>
              <a
                href={`https://api.whatsapp.com/send?phone=${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-mono font-bold text-emerald-400 hover:underline"
              >
                +{whatsappNumber} →
              </a>
            </div>

            <div className="bg-[#121212] border border-[#222] rounded-3xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white uppercase font-display">Horario de Atención</h3>
              <p className="text-sm text-gray-300">{restaurantInfo.schedule}</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-[#121212] border border-[#222] rounded-3xl p-6 sm:p-10 shadow-2xl">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase font-display">¡Mensaje Preparado!</h3>
                <p className="text-sm text-gray-300 max-w-md mx-auto">
                  Te hemos redirigido a WhatsApp para enviar el mensaje con un solo toque a la línea oficial de {restaurantName}.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-[#1e1e1e] hover:bg-[#282828] text-brand-yellow font-bold text-xs uppercase rounded-xl transition"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-black text-white uppercase font-display mb-2">
                  Escríbenos Directamente
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tu Nombre *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Andrés Morales"
                      value={formState.nombre}
                      onChange={(e) => setFormState({ ...formState, nombre: e.target.value })}
                      className="w-full bg-[#181818] border border-[#2e2e2e] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-yellow"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Teléfono Móvil</label>
                    <input
                      type="tel"
                      placeholder="Ej: 310 123 4567"
                      value={formState.telefono}
                      onChange={(e) => setFormState({ ...formState, telefono: e.target.value })}
                      className="w-full bg-[#181818] border border-[#2e2e2e] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-yellow"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="andres@ejemplo.com"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full bg-[#181818] border border-[#2e2e2e] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-yellow"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Asunto</label>
                    <select
                      value={formState.asunto}
                      onChange={(e) => setFormState({ ...formState, asunto: e.target.value })}
                      className="w-full bg-[#181818] border border-[#2e2e2e] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-yellow font-bold"
                    >
                      <option value="consulta">Consulta de Pedido / Menú</option>
                      <option value="evento">Eventos & Cumpleaños</option>
                      <option value="felicitacion">Felicitaciones / Sugerencia</option>
                      <option value="otro">Otro Motivo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tu Mensaje *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Cuéntanos en qué podemos ayudarte..."
                    value={formState.mensaje}
                    onChange={(e) => setFormState({ ...formState, mensaje: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2e2e2e] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-yellow"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-brand-yellow hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-glow transition active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4 fill-current" />
                  <span>Enviar Mensaje por WhatsApp</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
