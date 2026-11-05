'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTenant } from '@/context/TenantContext';
import { MapPin, Phone, Clock, MessageSquare, Send, CheckCircle2, MessageCircle, Building2 } from 'lucide-react';

export default function TenantContactoPage() {
  const params = useParams();
  const slug = ((params?.slug as string) || 'punto-g').toLowerCase().trim();

  const { restaurant } = useTenant();
  const restaurantName = restaurant?.nombre || 'Restaurante';
  const primaryColor = restaurant?.colorPrimario || '#EAA622';
  const buttonColor = restaurant?.colorBoton || primaryColor;
  const buttonTextColor = restaurant?.colorBotonTexto || '#000000';
  const whatsappNumber = restaurant?.telefonoWhatsapp || restaurant?.telefono || '3229088736';
  const address = restaurant?.direccionCentral || 'Principal';
  const city = restaurant?.ciudad || 'Colombia';
  const schedule = restaurant?.horarioAtencion || 'Lunes a Domingo: 12:00 m. a 11:30 p.m.';

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

    const text = `📬 *MENSAJE DE CONTACTO - ${restaurantName.toUpperCase()}*\n\n👤 *Nombre:* ${formState.nombre}\n📱 *Teléfono:* ${formState.telefono || 'No indicado'}\n📧 *Email:* ${formState.email || 'No indicado'}\n📌 *Asunto:* ${formState.asunto}\n\n💬 *Mensaje:*\n${formState.mensaje}`;
    
    setSubmitted(true);
    setTimeout(() => {
      const url = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-16">
      
      {/* Hero Header */}
      <div className="relative border-b border-[#202020] py-16 mb-12 overflow-hidden">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-60 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: primaryColor }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 relative z-10">
          <span 
            className="text-xs sm:text-sm font-black tracking-widest uppercase font-display"
            style={{ color: primaryColor }}
          >
            ESTAMOS PARA ATENDERTE • {city.toUpperCase()}
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase text-white font-display tracking-tight">
            CONTÁCTANOS EN{' '}
            <span className="italic" style={{ color: primaryColor }}>
              {restaurantName}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto">
            ¿Tienes dudas sobre pedidos, eventos, reservas o sugerencias? Escríbenos y con gusto te atenderemos.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Contact Details Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#121212] border border-[#222] rounded-3xl p-6 space-y-3 shadow-lg">
              <div 
                className="w-12 h-12 rounded-2xl border flex items-center justify-center"
                style={{ 
                  backgroundColor: `${primaryColor}15`, 
                  borderColor: `${primaryColor}40`, 
                  color: primaryColor 
                }}
              >
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white uppercase font-display">Ubicación Principal</h3>
              <p className="text-sm text-gray-300">{address}</p>
              <p className="text-xs font-bold" style={{ color: primaryColor }}>{city}</p>
            </div>

            <div className="bg-[#121212] border border-[#222] rounded-3xl p-6 space-y-3 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 fill-current" />
              </div>
              <h3 className="text-base font-black text-white uppercase font-display">Línea Oficial WhatsApp</h3>
              <p className="text-sm text-gray-300">Atención rápida para domicilios, consultas y reservas.</p>
              <a
                href={`https://api.whatsapp.com/send?phone=${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-mono font-bold text-emerald-400 hover:underline"
              >
                +{whatsappNumber} →
              </a>
            </div>

            <div className="bg-[#121212] border border-[#222] rounded-3xl p-6 space-y-3 shadow-lg">
              <div 
                className="w-12 h-12 rounded-2xl border flex items-center justify-center"
                style={{ 
                  backgroundColor: `${primaryColor}15`, 
                  borderColor: `${primaryColor}40`, 
                  color: primaryColor 
                }}
              >
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white uppercase font-display">Horario de Atención</h3>
              <p className="text-sm text-gray-300">{schedule}</p>
            </div>

            {restaurant?.branches && restaurant.branches.length > 1 && (
              <div className="bg-[#121212] border border-[#222] rounded-3xl p-6 space-y-3 shadow-lg">
                <div 
                  className="w-12 h-12 rounded-2xl border flex items-center justify-center"
                  style={{ 
                    backgroundColor: `${primaryColor}15`, 
                    borderColor: `${primaryColor}40`, 
                    color: primaryColor 
                  }}
                >
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-white uppercase font-display">Nuestras Sedes</h3>
                <div className="space-y-1.5 text-xs text-gray-300">
                  {restaurant.branches.map((b: any) => (
                    <p key={b.id}>• <strong className="text-white">{b.nombre}</strong>: {b.direccion || b.ciudad}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-[#121212] border border-[#222] rounded-3xl p-6 sm:p-10 shadow-2xl">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase font-display">¡Mensaje Preparado!</h3>
                <p className="text-sm text-gray-300 max-w-md mx-auto">
                  Se ha generado tu mensaje para el WhatsApp de {restaurantName}. Te estamos redirigiendo para enviarlo.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 transition"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white uppercase font-display">Envíanos un Mensaje</h3>
                  <p className="text-xs text-gray-400">Completa el formulario y te contactaremos por WhatsApp de inmediato.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Tu nombre"
                      value={formState.nombre}
                      onChange={(e) => setFormState({ ...formState, nombre: e.target.value })}
                      className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition"
                      style={{ borderColor: formState.nombre ? primaryColor : undefined }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                      Teléfono WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="Ej: 300 123 4567"
                      value={formState.telefono}
                      onChange={(e) => setFormState({ ...formState, telefono: e.target.value })}
                      className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                    Asunto
                  </label>
                  <select
                    value={formState.asunto}
                    onChange={(e) => setFormState({ ...formState, asunto: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition"
                  >
                    <option value="consulta">Consulta General / Información</option>
                    <option value="pedido">Estado de mi Pedido</option>
                    <option value="evento">Eventos y Reservas</option>
                    <option value="sugerencia">Sugerencias o Felicitaciones</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                    Mensaje *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Cuéntanos en qué te podemos ayudar..."
                    value={formState.mensaje}
                    onChange={(e) => setFormState({ ...formState, mensaje: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition"
                    style={{ borderColor: formState.mensaje ? primaryColor : undefined }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  style={{ backgroundColor: buttonColor, color: buttonTextColor }}
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Mensaje a WhatsApp</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
