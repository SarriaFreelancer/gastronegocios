'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2,
  Store,
  Layers,
  ShieldCheck,
  TrendingUp,
  Users,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface BranchDemo {
  id: string;
  name: string;
  city: string;
  salesToday: string;
  orders: number;
  status: 'Abierto' | 'Cerrado';
  color: string;
  bgGradient: string;
}

const BRANCHES: BranchDemo[] = [
  {
    id: 'puntog',
    name: 'Punto G Gourmet',
    city: 'Sede Principal - Cali Granada',
    salesToday: '$4.850.000',
    orders: 142,
    status: 'Abierto',
    color: '#FFC928',
    bgGradient: 'from-amber-500/20 to-transparent',
  },
  {
    id: 'salchiricurras',
    name: 'Salchi Ricurras',
    city: 'Sede Sur - Valle del Lili',
    salesToday: '$3.920.000',
    orders: 118,
    status: 'Abierto',
    color: '#E53E3E',
    bgGradient: 'from-red-500/20 to-transparent',
  },
  {
    id: 'doncarbon',
    name: 'Don Carbón Parrilla',
    city: 'Sede Norte - Chipichape',
    salesToday: '$3.810.000',
    orders: 88,
    status: 'Abierto',
    color: '#F97316',
    bgGradient: 'from-orange-500/20 to-transparent',
  },
];

export function SaasMultiBusinessSection() {
  const [selectedBranch, setSelectedBranch] = useState<BranchDemo>(BRANCHES[0]);

  return (
    <section id="multisede" className="relative py-24 bg-[#080A12] text-white overflow-hidden border-t border-white/5">
      {/* Ambient background lighting */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-amber-400 text-xs font-black uppercase tracking-wider mb-4">
            <Building2 className="w-3.5 h-3.5" />
            <span>Multi-Sede & Franquicias</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] font-display">
            Un solo ecosistema para <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-500">
              todos tus negocios gastronómicos
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-gray-300 font-normal">
            Administra restaurantes independientes, cadenas o franquicias desde un único panel centralizado con inventarios y reportes consolidados.
          </p>
        </div>

        {/* Central Multi-Branch Showcase Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-gradient-to-br from-[#121626] to-[#0D101C] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
          
          {/* Left Column: Branch Selector + Metrics */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Selecciona una sede en tiempo real:
            </div>

            {BRANCHES.map((b) => {
              const isSelected = selectedBranch.id === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBranch(b)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${
                    isSelected
                      ? 'bg-white/10 border-white/20 shadow-lg scale-[1.02]'
                      : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: b.color }}
                      />
                      <span className="font-extrabold text-white text-sm sm:text-base">{b.name}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ● {b.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mb-2">{b.city}</p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                    <span className="text-gray-400">Ventas Hoy:</span>
                    <span className="font-black text-white">{b.salesToday}</span>
                    <span className="text-gray-400">Órdenes:</span>
                    <span className="font-black" style={{ color: b.color }}>{b.orders}</span>
                  </div>
                </div>
              );
            })}

            <div className="pt-2">
              <Link
                href="/superadmin"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-200 hover:text-white transition"
              >
                <span>Explorar Panel Superadmin Franquicias</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Multi-tenant Simulation Screen */}
          <div className="lg:col-span-7 bg-[#090C16] rounded-2xl border border-white/10 p-5 sm:p-7 relative overflow-hidden">
            
            {/* Top header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-md"
                  style={{ backgroundColor: selectedBranch.color }}
                >
                  {selectedBranch.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">{selectedBranch.name}</h4>
                  <p className="text-[11px] text-gray-400">{selectedBranch.city}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-gray-400 uppercase font-semibold">Total Consolidado Red</div>
                <div className="text-sm sm:text-base font-black text-emerald-400">$12.580.000 COP</div>
              </div>
            </div>

            {/* Live Branch Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-[10px] text-gray-400">Ticket Promedio</div>
                <div className="text-base font-black text-white mt-0.5">$34.150</div>
                <div className="text-[9px] text-emerald-400 font-bold mt-0.5">+5.4%</div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-[10px] text-gray-400">Mesas Ocupadas</div>
                <div className="text-base font-black text-white mt-0.5">14 / 18</div>
                <div className="text-[9px] text-amber-400 font-bold mt-0.5">78% aforo</div>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-[10px] text-gray-400">Tiempo KDS Cocina</div>
                <div className="text-base font-black text-white mt-0.5">11.4 min</div>
                <div className="text-[9px] text-emerald-400 font-bold mt-0.5">Óptimo</div>
              </div>
            </div>

            {/* Multi-business features bullet grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Catálogo Unificado:</strong> Cambia precios y recetas en todas las sedes con 1 click.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Permisos por Rol:</strong> Meseros, cajeros, administradores y dueños de franquicia.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Inventario Centralizado:</strong> Traslados de stock y mermas entre sedes en tiempo real.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Reportes Comparativos:</strong> Descubre qué sede vende más y cuál tiene mayor margen.</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
