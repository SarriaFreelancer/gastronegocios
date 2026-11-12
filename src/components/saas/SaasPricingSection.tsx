'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { DEFAULT_SAAS_PLANS, formatCopPrice, type SaasPlanItem } from '@/lib/saas-plans';

export function SaasPricingSection() {
  const [plans, setPlans] = useState<SaasPlanItem[]>(DEFAULT_SAAS_PLANS);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/saas/plans?active=true&_t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && Array.isArray(data.plans) && data.plans.length > 0) {
          setPlans(data.plans);
        }
      })
      .catch(() => {
        // Fallback silencioso a los valores iniciales
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const buildWhatsappUrl = (planName: string) =>
    'https://wa.me/573229088736?text=' +
    encodeURIComponent(
      `Hola GastroNegocios, deseo información comercial del Plan ${planName} para mi restaurante.`
    );

  return (
    <section id="planes" className="relative py-10 sm:py-14 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* LEFT COLUMN: Header + Billing Switcher + Curved Golden Arrow */}
        <div className="lg:col-span-3 text-left relative">
          <div className="inline-flex items-center px-4 py-1 rounded-full bg-gradient-to-b from-[#FF2A32] via-[#E90712] to-[#9E050C] text-white text-xs font-extrabold shadow-[0_4px_20px_rgba(241,15,26,0.65)] border border-red-400/40 mb-3">
            <span>Planes Flexibles</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-white tracking-tight leading-[1.08] font-display drop-shadow-[0_4px_14px_rgba(0,0,0,0.85)]">
            Elige el plan ideal para tu negocio
          </h2>

          <p className="text-sm sm:text-[15px] text-gray-200 font-normal mt-3 leading-relaxed">
            Desde emprendedores hasta cadenas de restaurantes.
          </p>

          {/* Billing Cycle Toggle (Mensual / Anual) */}
          <div className="mt-4 inline-flex items-center p-1 rounded-full bg-[#160A07] border border-[#FA9B23]/35 shadow-lg">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-[#FA9B23] to-[#FFE169] text-black shadow'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Mensual
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-[#FA9B23] to-[#FFE169] text-black shadow'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <span>Anual</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-black">
                2 meses gratis
              </span>
            </button>
          </div>

          {/* Curved golden arrow pointing right/up toward cards */}
          <div className="hidden lg:block mt-2 ml-28 pointer-events-none">
            <svg width="105" height="52" viewBox="0 0 110 55" fill="none" className="drop-shadow-[0_0_10px_rgba(250,155,35,0.6)]">
              <path
                d="M 6,38 Q 55,54 98,14"
                stroke="#FA9B23"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 83,12 L 99,13 L 95,28"
                stroke="#FA9B23"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* RIGHT COLUMN: DYNAMIC PRICING CARDS SYNCED WITH SUPERADMIN */}
        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-5 items-end pt-4">
          {plans.map((plan) => {
            const isFeatured = plan.destacado;
            const displayedPrice = billingCycle === 'annual' ? plan.precioAnual : plan.precioMensual;
            const cycleLabel = billingCycle === 'annual' ? '/año' : '/mes';
            const planQueryParam =
              plan.codigo.toLowerCase() === 'pro' ? 'Pro' : plan.codigo;

            return (
              <div
                key={plan.codigo}
                className={
                  isFeatured
                    ? 'relative rounded-[28px] bg-gradient-to-b from-[#FFFDF9] via-[#FDEEE1] to-[#FBDDC4] text-gray-950 p-6 sm:p-7 border-2 border-[#FBB024] shadow-[0_0_50px_rgba(250,155,35,0.45)] flex flex-col justify-between md:-translate-y-2.5 transition-transform duration-300 hover:-translate-y-3.5'
                    : 'rounded-[26px] bg-gradient-to-b from-[#F8FAFF] via-[#EFF2FC] to-[#E6E9F5] text-gray-950 p-6 border-2 border-white shadow-[0_22px_50px_rgba(0,0,0,0.8)] flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1'
                }
              >
                {plan.badgeTexto && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-b from-[#FFE27A] via-[#FBB024] to-[#E0870B] text-gray-950 text-xs font-black shadow-[0_4px_15px_rgba(250,155,35,0.65)] flex items-center gap-1 whitespace-nowrap border border-amber-100">
                    <span>{plan.badgeTexto}</span>
                  </div>
                )}

                <div>
                  {/* Centered Title & Subtitle */}
                  <div className={`text-center mb-3.5 ${isFeatured ? 'mt-1' : ''}`}>
                    <div className="inline-flex items-center justify-center gap-1.5">
                      <span className="text-xl drop-shadow-sm">{plan.emoji || '🚀'}</span>
                      <h3
                        className={
                          isFeatured
                            ? 'text-2xl sm:text-[25px] font-black text-gray-950 font-display'
                            : 'text-xl sm:text-[22px] font-black text-gray-950 font-display'
                        }
                      >
                        {plan.nombre}
                      </h3>
                    </div>
                    <p
                      className={`text-xs font-medium mt-0.5 ${
                        isFeatured ? 'text-gray-700' : 'text-gray-600'
                      }`}
                    >
                      {plan.subtitulo}
                    </p>
                  </div>

                  {/* Centered Price */}
                  <div
                    className={`text-center pb-4 mb-4 border-b ${
                      isFeatured ? 'border-amber-300/80' : 'border-gray-300/90'
                    }`}
                  >
                    <span
                      className={`${
                        isFeatured ? 'text-4xl sm:text-[44px]' : 'text-4xl sm:text-[40px]'
                      } font-black text-gray-950 tracking-tight font-display`}
                    >
                      {formatCopPrice(displayedPrice)}
                    </span>
                    <span
                      className={`text-xs font-extrabold ${
                        isFeatured ? 'text-gray-800' : 'text-gray-700'
                      }`}
                    >
                      {cycleLabel}
                    </span>
                  </div>

                  {/* Features */}
                  <ul className={`space-y-2.5 px-2 ${isFeatured ? 'mb-7' : 'mb-6'}`}>
                    {(plan.caracteristicas || []).map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2.5">
                        <Check
                          className={`w-4 h-4 shrink-0 ${
                            isFeatured ? 'text-[#D97706] stroke-[3.5]' : 'text-[#E08A1E] stroke-[3.2]'
                          }`}
                        />
                        <span
                          className={`text-xs sm:text-[13.5px] ${
                            isFeatured ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'
                          }`}
                        >
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.tipoAccion === 'whatsapp' ? (
                  <a
                    href={buildWhatsappUrl(plan.nombre)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={
                      isFeatured
                        ? 'w-full text-center py-3 px-6 rounded-full bg-gradient-to-b from-[#FF2A32] via-[#F10F1A] to-[#B5050D] hover:brightness-110 text-white font-extrabold text-xs sm:text-[14px] shadow-[0_8px_24px_rgba(241,15,26,0.65)] border border-red-400/40 transition-all'
                        : 'w-full text-center py-2.5 px-5 rounded-full border-[1.8px] border-gray-800 bg-white hover:bg-gray-950 text-gray-950 hover:text-white font-extrabold text-xs sm:text-[13.5px] shadow-sm transition-all'
                    }
                  >
                    {plan.ctaTexto || 'Contactar Ventas'}
                  </a>
                ) : (
                  <Link
                    href={`/registro?plan=${encodeURIComponent(planQueryParam)}`}
                    className={
                      isFeatured
                        ? 'w-full text-center py-3 px-6 rounded-full bg-gradient-to-b from-[#FF2A32] via-[#F10F1A] to-[#B5050D] hover:brightness-110 text-white font-extrabold text-xs sm:text-[14px] shadow-[0_8px_24px_rgba(241,15,26,0.65)] border border-red-400/40 transition-all'
                        : 'w-full text-center py-2.5 px-5 rounded-full border-[1.8px] border-gray-800 bg-white hover:bg-gray-950 text-gray-950 hover:text-white font-extrabold text-xs sm:text-[13.5px] shadow-sm transition-all'
                    }
                  >
                    {plan.ctaTexto || 'Comenzar Ahora'}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
