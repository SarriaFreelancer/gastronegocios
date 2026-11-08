'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronRight, 
  ChevronDown,
  Menu, 
  X, 
  SlidersHorizontal,
  ChevronLeft,
  Sparkles,
  ArrowRightLeft,
  Layers,
  Store,
  CheckCircle2
} from 'lucide-react';

export interface AdminTabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  badge?: string;
  category: 'metricas' | 'operacion' | 'menu' | 'inventario' | 'configuracion';
  description?: string;
}

export interface AdminSidebarProps {
  tabs: AdminTabItem[];
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  aparienciaAdmin: 'lateral' | 'superior';
  onToggleApariencia: (mode: 'lateral' | 'superior') => void;
  restaurantName?: string;
  activeBranchName?: string;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const CATEGORIES: { id: string; label: string; icon: string; accentColor: string }[] = [
  { id: 'operacion', label: 'Operación en Vivo', icon: '⚡', accentColor: 'text-amber-400' },
  { id: 'metricas', label: 'Métricas & Negocio', icon: '📊', accentColor: 'text-emerald-400' },
  { id: 'menu', label: 'Menú & Carta', icon: '🍽️', accentColor: 'text-orange-400' },
  { id: 'inventario', label: 'Inventario Inteligente', icon: '📦', accentColor: 'text-cyan-400' },
  { id: 'configuracion', label: 'Configuración & SaaS', icon: '⚙️', accentColor: 'text-purple-400' },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  tabs,
  activeTab,
  onSelectTab,
  aparienciaAdmin,
  onToggleApariencia,
  restaurantName = 'Restaurante',
  activeBranchName,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Estados de acordeón por categoría: todas abiertas por defecto para fácil acceso
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    operacion: true,
    metricas: true,
    menu: true,
    inventario: true,
    configuracion: true,
  });

  const toggleCategory = (catId: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Filtrar tabs según término de búsqueda
  const filteredTabs = useMemo(() => {
    if (!searchTerm.trim()) return tabs;
    const term = searchTerm.toLowerCase();
    return tabs.filter(
      (t) =>
        t.label.toLowerCase().includes(term) ||
        t.id.toLowerCase().includes(term) ||
        (t.badge && t.badge.toLowerCase().includes(term))
    );
  }, [tabs, searchTerm]);

  // Agrupar tabs por categoría
  const groupedTabs = useMemo(() => {
    const groups: Record<string, AdminTabItem[]> = {
      operacion: [],
      metricas: [],
      menu: [],
      inventario: [],
      configuracion: [],
    };

    filteredTabs.forEach((tab) => {
      const cat = tab.category || 'configuracion';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(tab);
    });

    return groups;
  }, [filteredTabs]);

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  const renderContent = (isMobileMode = false) => {
    const collapsed = isMobileMode ? false : isCollapsed;

    return (
      <div className="flex flex-col h-full bg-[#101218] text-slate-100 select-none">
        
        {/* Cabecera del Menú Lateral */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-[#141824]/90 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-yellow via-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black text-sm shrink-0 shadow-lg shadow-amber-500/20">
                <Store className="w-5 h-5 text-black" />
              </div>

              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-brand-yellow">
                      Panel Administrativo
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                  </div>
                  <h3 className="text-sm font-black text-white truncate leading-tight">
                    {restaurantName}
                  </h3>
                  {activeBranchName && (
                    <span className="text-xs text-slate-400 truncate block font-medium">
                      📍 {activeBranchName}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Botón para expandir/contraer en Desktop */}
            {!isMobileMode && (
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition shadow-sm shrink-0 cursor-pointer"
                title={collapsed ? 'Expandir barra lateral' : 'Contraer a iconos'}
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}

            {/* Botón Cerrar en Móvil */}
            {isMobileMode && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Buscador de Módulos */}
          {!collapsed && (
            <div className="mt-4 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar módulo (ej. caja, recetas, kardex)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#181d2a] border border-slate-700/80 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow rounded-xl pl-10 pr-8 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none transition shadow-inner"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-sm font-black p-0.5"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>

        {/* Lista de Módulos Agrupados con Espaciado Generoso */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
          {CATEGORIES.map((cat) => {
            const catTabs = groupedTabs[cat.id] || [];
            if (catTabs.length === 0) return null;

            const isOpen = openCategories[cat.id] ?? true;

            return (
              <div 
                key={cat.id} 
                className={`rounded-2xl transition-all border ${
                  collapsed 
                    ? 'border-transparent' 
                    : 'bg-[#141722]/80 border-slate-800/80 p-2 sm:p-2.5 shadow-sm'
                }`}
              >
                {/* Título de Sección / Acordeón */}
                {!collapsed ? (
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-black uppercase tracking-wider text-slate-300 hover:text-white transition rounded-xl hover:bg-slate-800/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{cat.icon}</span>
                      <span className={`font-black ${cat.accentColor}`}>{cat.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="text-[11px] font-mono font-bold bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60">
                        {catTabs.length}
                      </span>
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 transition-transform" />
                      ) : (
                        <ChevronRight className="w-4 h-4 transition-transform" />
                      )}
                    </div>
                  </button>
                ) : (
                  <div className="w-full flex justify-center py-2 text-base" title={cat.label}>
                    <span>{cat.icon}</span>
                  </div>
                )}

                {/* Módulos de la categoría */}
                {(isOpen || collapsed || !!searchTerm) && (
                  <div className={`mt-1 space-y-1.5 ${collapsed ? 'mt-2' : ''}`}>
                    {catTabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;

                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => handleTabClick(tab.id)}
                          className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm transition-all relative group cursor-pointer border ${
                            isActive
                              ? 'bg-gradient-to-r from-brand-yellow via-amber-400 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-400/25 border-amber-300'
                              : 'bg-[#181c28] hover:bg-[#202536] text-slate-200 hover:text-white border-slate-800/60 hover:border-slate-700 shadow-sm'
                          } ${collapsed ? 'justify-center px-2 py-3' : ''}`}
                          title={collapsed ? `${tab.label} ${tab.badge ? `[${tab.badge}]` : ''}` : undefined}
                        >
                          {/* Barra indicadora vertical izquierda */}
                          {isActive && !collapsed && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-slate-950 rounded-r-full" />
                          )}

                          <Icon 
                            className={`w-5 h-5 shrink-0 transition-transform ${
                              isActive 
                                ? 'text-slate-950 scale-110' 
                                : 'text-slate-400 group-hover:text-brand-yellow group-hover:scale-110'
                            }`} 
                          />

                          {!collapsed && (
                            <>
                              <span className="truncate flex-1 text-left font-bold tracking-normal leading-snug">
                                {tab.label.replace(/^[\uD800-\uDBFF\uDC00-\uDFFF\u2600-\u27BF\uFE00-\uFE0F\s]+/, '')}
                              </span>

                              {tab.badge && (
                                <span
                                  className={`text-[11px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0 ${
                                    isActive
                                      ? 'bg-slate-950/30 text-slate-950'
                                      : 'bg-[#262c3e] text-amber-300 border border-slate-700'
                                  }`}
                                >
                                  {tab.badge}
                                </span>
                              )}

                              {tab.count !== undefined && (
                                <span
                                  className={`text-xs font-mono font-black px-2 py-0.5 rounded-lg shrink-0 border ${
                                    isActive
                                      ? 'bg-slate-950 text-brand-yellow border-slate-950'
                                      : 'bg-[#222738] text-slate-200 border-slate-700'
                                  }`}
                                >
                                  {tab.count}
                                </span>
                              )}
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {filteredTabs.length === 0 && (
            <div className="p-6 text-center text-sm text-slate-400 bg-[#161a26] rounded-2xl border border-slate-800">
              No se encontraron módulos con &quot;{searchTerm}&quot;
            </div>
          )}
        </div>

        {/* Footer del Sidebar con Selector Rápido de Apariencia */}
        <div className="p-4 border-t border-slate-800/80 bg-[#141824] space-y-3">
          {!collapsed ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-300 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-brand-yellow" />
                  <span>Modo de Navegación</span>
                </span>
                <span className="text-[11px] font-black text-brand-yellow bg-brand-yellow/10 px-2 py-0.5 rounded-full border border-brand-yellow/30">
                  Lateral Activo
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#0e1118] p-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => onToggleApariencia('lateral')}
                  className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    aparienciaAdmin === 'lateral'
                      ? 'bg-brand-yellow text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Mantener navegación lateral"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Lateral</span>
                </button>
                <button
                  type="button"
                  onClick={() => onToggleApariencia('superior')}
                  className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    aparienciaAdmin === 'superior'
                      ? 'bg-brand-yellow text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Cambiar a barra superior horizontal"
                >
                  <span>Superior</span>
                </button>
              </div>

              <div className="text-[10px] text-slate-400 text-center leading-tight">
                Puedes cambiar entre estilos en cualquier momento
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onToggleApariencia('superior')}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-center flex items-center justify-center transition border border-slate-700 cursor-pointer"
              title="Cambiar a menú superior horizontal"
            >
              <ArrowRightLeft className="w-4 h-4 text-brand-yellow" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Sidebar fijo en escritorio */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-22' : 'w-80'
        }`}
      >
        <div className="sticky top-18 sm:top-20 bg-[#101218] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl h-[calc(100vh-5.5rem)] flex flex-col">
          {renderContent(false)}
        </div>
      </aside>

      {/* Drawer móvil deslizable */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop con blur */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Panel deslizante */}
          <div className="fixed inset-y-0 left-0 w-84 max-w-[88vw] bg-[#101218] border-r border-slate-800 shadow-2xl z-50 flex flex-col">
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
