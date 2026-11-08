'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  X,
  Smartphone
} from 'lucide-react';
import { 
  getPendingOfflineOrders, 
  syncPendingOfflineOrders, 
  OfflineOrder 
} from '@/lib/offlineStore';

interface PwaContextType {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  canInstall: boolean;
  triggerInstall: () => Promise<void>;
  syncNow: () => Promise<void>;
}

const PwaContext = createContext<PwaContextType>({
  isOnline: true,
  pendingCount: 0,
  isSyncing: false,
  canInstall: false,
  triggerInstall: async () => {},
  syncNow: async () => {},
});

export const usePwa = () => useContext(PwaContext);

export const PwaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingOrders, setPendingOrders] = useState<OfflineOrder[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);

  // 1. Refrescar lista de pedidos pendientes en memoria
  const refreshPending = useCallback(async () => {
    try {
      const orders = await getPendingOfflineOrders();
      setPendingOrders(orders);
    } catch (e) {
      // Ignorar en SSR
    }
  }, []);

  // 2. Sincronizar cola de pedidos fuera de línea
  const syncNow = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;

    setIsSyncing(true);
    setSyncSuccessMsg(null);

    try {
      const res = await syncPendingOfflineOrders((synced, total) => {
        // Callback opcional de progreso
      });

      await refreshPending();

      if (res.syncedCount > 0) {
        setSyncSuccessMsg(`¡${res.syncedCount} ${res.syncedCount === 1 ? 'pedido sincronizado' : 'pedidos sincronizados'} con cocina y caja!`);
        setTimeout(() => setSyncSuccessMsg(null), 5000);
      }
    } catch (err) {
      console.warn('Error durante sincronización offline:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, refreshPending]);

  // 3. Montaje y registro del Service Worker + Listeners de red
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);
    refreshPending();

    // Registro del Service Worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('GastroPOS Service Worker registrado con éxito:', reg.scope);
        })
        .catch((err) => {
          console.warn('No se pudo registrar Service Worker:', err);
        });
    }

    const handleOnline = () => {
      setIsOnline(true);
      // Al volver la red, auto-sincronizar pedidos pendientes
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
      refreshPending();
    };

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Si no ha sido descartado en la sesión
      if (!sessionStorage.getItem('gastropos_install_dismissed')) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Revisar cola local periódicamente
    const interval = setInterval(refreshPending, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearInterval(interval);
    };
  }, [refreshPending, syncNow]);

  // 4. Lanzar instalador de PWA
  const triggerInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setShowInstallBanner(false);
    }
  };

  const dismissInstall = () => {
    setShowInstallBanner(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('gastropos_install_dismissed', 'true');
    }
  };

  return (
    <PwaContext.Provider
      value={{
        isOnline,
        pendingCount: pendingOrders.length,
        isSyncing,
        canInstall: !!installPrompt,
        triggerInstall,
        syncNow,
      }}
    >
      {children}

      {/* ======================================================== */}
      {/* BANNER 1: ESTADO FUERA DE LÍNEA (OFFLINE DETECTADO)       */}
      {/* ======================================================== */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[999999] bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-black px-4 py-2.5 shadow-xl text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-2 animate-in slide-in-from-top">
          <WifiOff className="w-4 h-4 shrink-0 text-black animate-pulse" />
          <span>
            <strong>Modo Sin Conexión Activo:</strong> Puedes seguir tomando pedidos. Se guardan en este dispositivo y se enviarán automáticamente al volver internet.
          </span>
          {pendingOrders.length > 0 && (
            <span className="ml-2 bg-black text-amber-400 px-2.5 py-0.5 rounded-full text-[11px] font-black">
              {pendingOrders.length} {pendingOrders.length === 1 ? 'pedido en cola' : 'pedidos en cola'}
            </span>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* BANNER 2: SINCRONIZANDO PEDIDOS PENDIENTES TRAS RECONEXIÓN*/}
      {/* ======================================================== */}
      {isOnline && isSyncing && (
        <div className="fixed top-0 left-0 right-0 z-[999999] bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 shadow-xl text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-2 animate-in slide-in-from-top">
          <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
          <span>Restableciendo conexión: Sincronizando pedidos guardados con cocina y caja...</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* BANNER 3: ÉXITO DE SINCRONIZACIÓN                         */}
      {/* ======================================================== */}
      {syncSuccessMsg && (
        <div className="fixed top-3 right-3 sm:right-6 z-[999999] max-w-sm bg-[#121214] border border-emerald-500/50 text-white p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs">
            <p className="font-extrabold text-white text-[13px]">Sincronización Exitosa</p>
            <p className="text-gray-300">{syncSuccessMsg}</p>
          </div>
          <button 
            onClick={() => setSyncSuccessMsg(null)}
            className="text-gray-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* BANNER 4: INSTALADOR PWA FLOTANTE DISCRETO               */}
      {/* ======================================================== */}
      {showInstallBanner && installPrompt && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[99998] bg-[#141416]/95 backdrop-blur-md border border-[#2c2c30] p-4 rounded-2xl shadow-2xl text-white flex items-center justify-between gap-3 animate-in slide-in-from-bottom">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-yellow/20 text-brand-yellow flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white">Instalar GastroPOS App</p>
              <p className="text-[11px] text-gray-400">Opera a pantalla completa, más rápido y 100% offline.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerInstall}
              className="px-3.5 py-1.5 rounded-full bg-brand-yellow text-black font-extrabold text-xs hover:scale-105 active:scale-95 transition"
            >
              Instalar
            </button>
            <button
              onClick={dismissInstall}
              className="p-1.5 text-gray-400 hover:text-white"
              aria-label="Cerrar aviso de instalación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </PwaContext.Provider>
  );
};
