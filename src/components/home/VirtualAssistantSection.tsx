'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MessageSquare, Send, CheckCheck, Bot, Sparkles } from 'lucide-react';
import { restaurantInfo } from '@/data/restaurant-info';

export const VirtualAssistantSection: React.FC = () => {
  const [interactiveInput, setInteractiveInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: '¡Hola! 👋 Bienvenido a Punto G. ¿Qué se te antoja hoy?',
      time: '11:24',
    },
    {
      sender: 'user',
      text: 'Una hamburguesa y una salchipapa.',
      time: '11:25',
    },
    {
      sender: 'bot',
      text: '¡Perfecto! 😋 ¿Domicilio o para recoger?',
      time: '11:25',
    },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interactiveInput.trim()) return;

    const userText = interactiveInput.trim();
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText, time: timeStr },
    ]);
    setInteractiveInput('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `¡Excelente elección! 🍔 Dale clic a 'Hablar por WhatsApp' para confirmar los detalles directamente a nuestra línea oficial ${restaurantInfo.phone}.`,
          time: timeStr,
        },
      ]);
    }, 700);
  };

  const handleWhatsAppClick = () => {
    const defaultMsg = encodeURIComponent(
      '¡Hola Punto G! Quiero hacer un pedido con el asistente virtual.'
    );
    window.open(
      `https://api.whatsapp.com/send?phone=${restaurantInfo.whatsappNumber}&text=${defaultMsg}`,
      '_blank'
    );
  };

  return (
    <section className="relative py-16 sm:py-20 bg-gradient-to-b from-[#0a0a0a] via-[#111111] to-[#080808] border-t border-[#1f1f1f] overflow-hidden">
      {/* Background yellow glow accents */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-brand-yellow/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-brand-whatsapp/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-5 text-center lg:text-left space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Atención Digital 24/7</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black italic uppercase font-display text-brand-yellow tracking-tight drop-shadow-[0_4px_25px_rgba(255,201,40,0.5)]">
              ¿YA SE TE ANTOJÓ?
            </h2>

            <p className="text-base sm:text-lg text-gray-300 max-w-md mx-auto lg:mx-0 leading-relaxed">
              Haz tu pedido en segundos. Nuestro asistente virtual está listo para atenderte en nuestra línea <strong className="text-white">{restaurantInfo.phone}</strong>.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleWhatsAppClick}
                className="inline-flex items-center gap-3 bg-brand-whatsapp hover:bg-[#20ba59] text-white font-extrabold text-sm sm:text-base px-8 py-4 rounded-full shadow-[0_6px_25px_rgba(37,211,102,0.4)] transition-all transform hover:scale-105 active:scale-95"
              >
                <MessageSquare className="w-5 h-5 fill-current" />
                <span>HABLAR POR WHATSAPP</span>
              </button>
            </div>
          </div>

          {/* Center Column: Clear Robot Mascot Illustration */}
          <div className="lg:col-span-3 flex justify-center">
            <div className="relative w-48 sm:w-56 h-60 sm:h-72 rounded-3xl bg-gradient-to-b from-[#181818] to-[#101010] border border-[#2b2b2b] p-6 flex flex-col items-center justify-center text-center shadow-2xl group hover:border-brand-yellow/60 transition-colors">
              <div className="w-24 h-24 rounded-full bg-brand-yellow/20 border-2 border-brand-yellow flex items-center justify-center text-brand-yellow shadow-glow mb-4">
                <Bot className="w-14 h-14" />
              </div>
              <span className="text-sm font-black text-white uppercase font-display tracking-wider">
                Bot Punto G
              </span>
              <span className="text-[11px] text-brand-whatsapp font-bold mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-whatsapp animate-ping" />
                Listo para atenderte
              </span>
            </div>
          </div>

          {/* Right Column: WhatsApp Chat Mockup */}
          <div className="lg:col-span-4 w-full max-w-md mx-auto">
            <div className="bg-[#121b22] rounded-2xl overflow-hidden border border-[#2a3942] shadow-[0_15px_40px_rgba(0,0,0,0.85)] flex flex-col">
              
              {/* Chat Header */}
              <div className="bg-[#1f2c34] p-3.5 flex items-center justify-between border-b border-[#2a3942]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-bold text-black border border-yellow-300">
                    <span className="font-display text-sm">PG</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">
                      Punto G | Asistente Virtual
                    </h4>
                    <p className="text-[11px] text-[#25d366] flex items-center gap-1 font-medium">
                      <span className="w-2 h-2 rounded-full bg-[#25d366] animate-pulse" />
                      En línea
                    </p>
                  </div>
                </div>

                <div className="w-3 h-3 rounded-full bg-[#25d366]/40" />
              </div>

              {/* Chat Messages Body */}
              <div 
                className="p-4 space-y-3.5 bg-[#0b141a] min-h-[220px] max-h-[260px] overflow-y-auto"
                style={{
                  backgroundImage: 'radial-gradient(#1f2c34 1px, transparent 1px)',
                  backgroundSize: '16px 16px'
                }}
              >
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-[#005c4b] text-white rounded-tr-none'
                          : 'bg-[#202c33] text-gray-100 rounded-tl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-gray-400">
                        <span>{msg.time}</span>
                        {msg.sender === 'user' && (
                          <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Interactive Input Bar */}
              <form onSubmit={handleSend} className="bg-[#1f2c34] p-2.5 flex items-center gap-2 border-t border-[#2a3942]">
                <input
                  type="text"
                  placeholder="Escribe tu mensaje..."
                  value={interactiveInput}
                  onChange={(e) => setInteractiveInput(e.target.value)}
                  className="flex-1 bg-[#2a3942] rounded-full px-4 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-yellow"
                />
                <button
                  type="submit"
                  className="w-8 h-8 rounded-full bg-brand-whatsapp text-white flex items-center justify-center hover:bg-[#20ba59] transition-colors"
                  aria-label="Enviar mensaje"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
