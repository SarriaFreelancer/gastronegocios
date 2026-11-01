'use client';

import React, { useState } from 'react';
import { restaurantInfo } from '@/data/restaurant-info';
import { MapPin, Phone, Clock, MessageSquare, Send, CheckCircle2, Mail } from 'lucide-react';

export default function ContactoPage() {
  const [formState, setFormState] = useState({
    nombre: '',
    telefono: '',
    email: '',
    asunto: 'consulta',
    mensaje: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.nombre || !formState.mensaje) return;

    // Send direct to WhatsApp as convenient channel
    const text = `📬 *MENSAJE DE CONTACTO - PUNTO G*\n\n👤 *Nombre:* ${formState.nombre}\n📱 *Teléfono:* ${formState.telefono || 'No indicado'}\n📧 *Email:* ${formState.email || 'No indicado'}\n📌 *Asunto:* ${formState.asunto}\n\n💬 *Mensaje:*\n${formState.mensaje}`;
    
    setSubmitted(true);
    setTimeout(() => {
      const url = `https://api.whatsapp.com/send?phone=${restaurantInfo.whatsappNumber}&text=${encodeURIComponent(text)}`;
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
            CONTÁCTANOS EN <span className="text-brand-yellow italic">PUNTO G</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto">
            ¿Dudas, reservas para eventos, domicilios o sugerencias? Escríbenos o visítanos en nuestro local.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Info cards (Left) */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-2xl font-black uppercase text-white font-display tracking-wide">
              INFORMACIÓN DEL RESTAURANTE
            </h2>

            <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 space-y-5">
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dirección Principal</h3>
                  <p className="text-base font-bold text-white mt-0.5">{restaurantInfo.address}</p>
                  <p className="text-xs text-brand-yellow font-semibold">{restaurantInfo.city}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t border-[#1e1e1e] pt-4">
                <div className="p-3 rounded-xl bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Horario de Servicio</h3>
                  <p className="text-base font-bold text-white mt-0.5">{restaurantInfo.schedule}</p>
                  <p className="text-xs text-gray-400">Atención en local y domicilios activos</p>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t border-[#1e1e1e] pt-4">
                <div className="p-3 rounded-xl bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Línea Telefónica</h3>
                  <p className="text-base font-bold text-white mt-0.5">{restaurantInfo.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t border-[#1e1e1e] pt-4">
                <div className="p-3 rounded-xl bg-brand-whatsapp/10 border border-brand-whatsapp/30 text-brand-whatsapp flex-shrink-0">
                  <MessageSquare className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">WhatsApp Oficial</h3>
                  <p className="text-base font-bold text-brand-whatsapp mt-0.5">{restaurantInfo.whatsappFormatted}</p>
                  <p className="text-xs text-gray-400">Respuesta rápida con asistente virtual</p>
                </div>
              </div>

            </div>

            {/* Direct WhatsApp Callout */}
            <a
              href={`https://api.whatsapp.com/send?phone=${restaurantInfo.whatsappNumber}&text=${encodeURIComponent(
                '¡Hola Punto G! Quiero hablar con un asesor.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 bg-brand-whatsapp hover:bg-[#20ba59] text-white font-extrabold text-sm py-4 px-6 rounded-2xl shadow-[0_4px_20px_rgba(37,211,102,0.35)] transition-transform hover:scale-102"
            >
              <MessageSquare className="w-5 h-5 fill-current" />
              <span>CHATEAR POR WHATSAPP AHORA</span>
            </a>
          </div>

          {/* Contact Form (Right) */}
          <div className="lg:col-span-7">
            <div className="bg-[#121212] border border-[#242424] rounded-3xl p-6 sm:p-8 shadow-xl">
              <h2 className="text-2xl font-black uppercase text-white font-display tracking-wide mb-2">
                ENVÍANOS UN MENSAJE
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mb-6">
                Completa este formulario y te responderemos inmediatamente a través de WhatsApp o llamada.
              </p>

              {submitted ? (
                <div className="bg-[#18231c] border border-green-500/40 rounded-2xl p-8 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-brand-whatsapp mx-auto animate-bounce" />
                  <h3 className="text-xl font-bold text-white">¡Mensaje preparado!</h3>
                  <p className="text-xs text-gray-300">
                    Se ha abierto tu aplicación de WhatsApp con el mensaje. Gracias por comunicarte con Punto G.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-xs font-bold text-brand-yellow hover:underline"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                        Tu Nombre *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Daniel Morales"
                        value={formState.nombre}
                        onChange={(e) => setFormState({ ...formState, nombre: e.target.value })}
                        className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                        Teléfono / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Ej: 310 987 6543"
                        value={formState.telefono}
                        onChange={(e) => setFormState({ ...formState, telefono: e.target.value })}
                        className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        placeholder="Ej: usuario@correo.com"
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                        Motivo del Mensaje
                      </label>
                      <select
                        value={formState.asunto}
                        onChange={(e) => setFormState({ ...formState, asunto: e.target.value })}
                        className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-medium focus:outline-none focus:border-brand-yellow cursor-pointer"
                      >
                        <option value="consulta">Consulta general</option>
                        <option value="pedido">Pregunta sobre pedido</option>
                        <option value="evento">Cotización de evento o grupo</option>
                        <option value="sugerencia">Sugerencia o felicitación</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Tu Mensaje *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Escribe tu mensaje aquí..."
                      value={formState.mensaje}
                      onChange={(e) => setFormState({ ...formState, mensaje: e.target.value })}
                      className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-glow flex items-center justify-center gap-2 transition-all transform active:scale-98"
                  >
                    <Send className="w-4 h-4 fill-current" />
                    <span>ENVIAR MENSAJE</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
