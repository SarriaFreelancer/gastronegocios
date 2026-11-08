'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronRight, 
  LayoutDashboard, 
  Menu, 
  X, 
  SlidersHorizontal,
  ChevronLeft,
  Sparkles,
  Layers,
  ArrowRightLeft
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

const CATEGORIES: { id: string; label: string; icon: string }[] = [
  { id: 'metricas', label: 'Métricas & Negocio', icon: '📊' },
  { id: 'operacion', label: 'Operación en Vivo', icon: '⚡' },
  { id: 'menu', label: 'Menú & Carta', icon: '🍽️' },
  { id: 'inventario', label: 'Inventario Inteligente', icon: '📦' },
  { id: 'configuracion', label: 'Configuración & SaaS', icon: '⚙️' },
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
      metricas: [],
      operacion: [],
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
      <div className="flex flex-col h-full select-none">
        {/* Header del Sidebar */}
        <div className="p-4 border-b border-[#222222] bg-[#111111]/90 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2">
            <div className={`flex items-center gap-2.5 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-yellow to-amber-500 flex items-center justify-center text-black font-black text-xs shrink-0 shadow-glow">
                PG
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase text-brand-yellow tracking-wider truncate">
                      Panel Admin
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                  </div>
                  <h3 className="text-xs font-black text-white truncate">
                    {restaurantName}
                  </h3>
                  {activeBranchName && (
                    <span className="text-[10px] text-gray-400 truncate block">
                      📍 {activeBranchName}
                    </span>
                  )}
                </div>
              )}
            </div>

            {!isMobileMode && (
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-gray-400 hover:text-white border border-[#2b2b2b] transition shrink-0"
                title={collapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
              >
                {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              </button>
            )}

            {isMobileMode && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-gray-400 hover:text-white border border-[#2b2b2b] transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Buscador de Módulos (solo expandido) */}
          {!collapsed && (
            <div className="mt-3 relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar módulo (ej. caja, recetas)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#161616] border border-[#292929] focus:border-brand-yellow/60 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>

        {/* Lista de Módulos Agrupados */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 scrollbar-thin scrollbar-thumb-neutral-800">
          {CATEGORIES.map((cat) => {
            const catTabs = groupedTabs[cat.id] || [];
            if (catTabs.length === 0) return null;

            return (
              <div key={cat.id} className="space-y-1">
                {/* Título de Categoría */}
                {!collapsed ? (
                  <div className="px-2.5 pt-1 pb-1 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono">({catTabs.length})</span>
                  </div>
                ) : (
                  <div className="w-full h-px bg-[#222222] my-2" title={cat.label} />
                )}

                {/* Items de la categoría */}
                <div className="space-y-1">
                  {catTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleTabClick(tab.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.2 rounded-xl text-xs transition-all relative group cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-brand-yellow to-amber-400 text-black font-black shadow-glow'
                            : 'bg-[#141414] hover:bg-[#1c1c1c] text-gray-300 hover:text-white border border-transparent hover:border-[#2a2a2a]'
                        } ${collapsed ? 'justify-center px-2' : ''}`}
                        title={collapsed ? `${tab.label} ${tab.badge ? `[${tab.badge}]` : ''}` : undefined}
                      >
                        {/* Indicador de pestaña activa */}
                        {isActive && !collapsed && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-black rounded-r-full" />
                        )}

                        <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />

                        {!collapsed && (
                          <>
                            <span className="truncate flex-1 text-left font-medium">
                              {tab.label.replace(/^[\uD800-\uDBFF\uDC00-\uDFFF\u2600-\u27BF\uFE00-\uFE0F\s]+/, '')}
                            </span>

                            {tab.badge && (
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0 ${
                                  isActive
                                    ? 'bg-black/25 text-black'
                                    : 'bg-[#242424] text-gray-300 border border-[#333]'
                                }`}
                              >
                                {tab.badge}
                              </span>
                            )}

                            {tab.count !== undefined && (
                              <span
                                className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded-md shrink-0 ${
                                  isActive
                                    ? 'bg-black text-brand-yellow'
                                    : 'bg-[#222222] text-gray-300 border border-[#333]'
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
              </div>
            );
          })}

          {filteredTabs.length === 0 && (
            <div className="p-4 text-center text-xs text-gray-500">
              No se encontraron módulos con &quot;{searchTerm}&quot;
            </div>
          )}
        </div>

        {/* Footer del Sidebar con Selector Rápido de Apariencia */}
        <div className="p-3 border-t border-[#222222] bg-[#111111] space-y-2">
          {!collapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-brand-yellow" />
                  <span>Modo de Menú</span>
                </span>
                <span className="text-brand-yellow">Lateral Activo</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 bg-[#181818] p-1 rounded-xl border border-[#2a2a2a]">
                <button
                  type="button"
                  onClick={() => onToggleApariencia('lateral')}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition ${
                    aparienciaAdmin === 'lateral'
                      ? 'bg-brand-yellow text-black shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Mantener navegación lateral"
                >
                  <span>Lateral</span>
                </button>
                <button
                  type="button"
                  onClick={() => onToggleApariencia('superior')}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition ${
                    aparienciaAdmin === 'superior'
                      ? 'bg-brand-yellow text-black shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Cambiar a barra superior tradicional"
                >
                  <span>Superior</span>
                </button>
              </div>

              <div className="text-[9px] text-gray-400 text-center leading-tight">
                Configurable por restaurante en Ajustes
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onToggleApariencia('superior')}
              className="w-full py-2 bg-[#1a1a1a] hover:bg-[#252525] text-gray-400 hover:text-white rounded-xl text-center flex items-center justify-center transition border border-[#292929]"
              title="Cambiar a menú superior horizontal"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-brand-yellow" />
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
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        <div className="sticky top-24 bg-[#121212] border border-[#242424] rounded-2xl overflow-hidden shadow-2xl h-[calc(100vh-7.5rem)] flex flex-col">
          {renderContent(false)}
        </div>
      </aside>

      {/* Drawer móvil */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop con blur */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Panel deslizante */}
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-[#121212] border-r border-[#262626] shadow-2xl z-50 flex flex-col">
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
