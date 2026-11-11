'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Bell, Receipt, CheckCircle, CreditCard, Banknote, Smartphone, X } from 'lucide-react';
import { swalCustom, showSuccess, showError } from '@/lib/swal';

export function TableServiceBar() {
  const pathname = usePathname();
  const { tableNumber, setTableNumber, deliveryType, setDeliveryType } = useCart();
  const [loading, setLoading] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [tempTableInput, setTempTableInput] = useState('');

  if (
    pathname === '/' ||
    pathname.startsWith('/registro') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/superadmin') ||
    pathname.startsWith('/login') ||
    pathname.includes('/admin') ||
    pathname.includes('/cocina') ||
    pathname.includes('/mesero') ||
    pathname.includes('/entregas') ||
    pathname.includes('/pedidos-listos') ||
    pathname.includes('/turnero')
  ) {
    return null;
  }

  const currentTable = tableNumber ? tableNumber.trim() : '';

  // Acción: Llamar al Mesero
  const handleCallWaiter = async () => {
    if (!currentTable) {
      setShowManualModal(true);
      return;
    }

    const confirm = await swalCustom.fire({
      title: '🔔 LLAMAR AL MESERO',
      html: `¿Deseas enviar una llamada de asistencia a nuestro equipo para la <strong class="text-brand-yellow">${currentTable}</strong>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, llamar al mesero',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch('/api/tables/service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mesa: currentTable, action: 'llamar_mesero' }),
      });

      const data = await res.json();
      if (res.ok) {
        await swalCustom.fire({
          title: '🔔 ¡MESERO NOTIFICADO!',
          html: `Hemos avisado al mesero de tu zona.<br>En breves instantes se acercará a la <strong class="text-brand-yellow">${currentTable}</strong> para atenderte.`,
          icon: 'success',
          confirmButtonText: 'Excelente',
        });
      } else {
        await showError('Atención', data.error || 'No pudimos notificar al mesero. Por favor llama a un mesero directamente.');
      }
    } catch (e) {
      await showError('Error de conexión', 'No pudimos enviar la notificación. Por favor avisa a tu mesero.');
    } finally {
      setLoading(false);
    }
  };

  // Acción: Pedir la Cuenta
  const handleRequestBill = async () => {
    if (!currentTable) {
      setShowManualModal(true);
      return;
    }

    const { value: selectedMethod, isConfirmed } = await swalCustom.fire({
      title: '💳 PEDIR LA CUENTA',
      html: `
        <p class="text-gray-300 text-sm mb-3">¿Cómo deseas pagar la cuenta de la <strong class="text-brand-yellow">${currentTable}</strong>?</p>
        <div class="flex flex-col gap-2 text-left text-xs font-bold text-gray-200 mt-2">
          <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#1c1c1c] border border-stone-800 hover:border-brand-yellow/50 cursor-pointer transition-all">
            <input type="radio" name="swal_metodo_pago" value="Efectivo" checked class="accent-brand-yellow" />
            <span>💵 Efectivo</span>
          </label>
          <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#1c1c1c] border border-stone-800 hover:border-brand-yellow/50 cursor-pointer transition-all">
            <input type="radio" name="swal_metodo_pago" value="Nequi / Daviplata / Transferencia" class="accent-brand-yellow" />
            <span>📱 Nequi / Daviplata / Transferencia</span>
          </label>
          <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#1c1c1c] border border-stone-800 hover:border-brand-yellow/50 cursor-pointer transition-all">
            <input type="radio" name="swal_metodo_pago" value="Datáfono (Tarjeta)" class="accent-brand-yellow" />
            <span>💳 Datáfono (Tarjeta Débito/Crédito)</span>
          </label>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Solicitar la Cuenta',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      preConfirm: () => {
        const checked = document.querySelector('input[name="swal_metodo_pago"]:checked') as HTMLInputElement;
        return checked ? checked.value : 'Efectivo';
      },
    });

    if (!isConfirmed || !selectedMethod) return;

    setLoading(true);
    try {
      const res = await fetch('/api/tables/service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mesa: currentTable,
          action: 'pedir_cuenta',
          metodoPago: selectedMethod,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        await swalCustom.fire({
          title: '💳 ¡CUENTA SOLICITADA!',
          html: `Tu cuenta ha sido solicitada para la <strong class="text-brand-yellow">${currentTable}</strong>.<br>El mesero llevará el ticket y el soporte de pago en <strong>${selectedMethod}</strong>.`,
          icon: 'success',
          confirmButtonText: 'Entendido',
        });
      } else {
        await showError('Atención', data.error || 'No pudimos registrar la solicitud de la cuenta.');
      }
    } catch (e) {
      await showError('Error de conexión', 'No pudimos registrar tu solicitud. Por favor avisa a tu mesero.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveManualTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempTableInput.trim()) return;
    const cleanNumber = tempTableInput.trim().startsWith('Mesa') 
      ? tempTableInput.trim() 
      : `Mesa ${tempTableInput.trim()}`;
    setTableNumber(cleanNumber);
    setDeliveryType('mesa');
    setShowManualModal(false);
    setTempTableInput('');
  };

  return (
    <>
      {/* Botones Flotantes o Barra en Mesa */}
      <aside aria-label="Servicios de mesa" className="fixed bottom-20 right-4 z-40 sm:bottom-6 sm:right-6 flex flex-col items-end gap-2">
        {currentTable ? (
          <div className="bg-[#121212]/95 backdrop-blur-md border border-brand-yellow/40 rounded-2xl p-2.5 shadow-2xl shadow-black/80 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <div className="px-2.5 py-1 bg-brand-yellow/15 border border-brand-yellow/30 rounded-xl flex items-center gap-1.5 text-brand-yellow text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-brand-yellow animate-ping inline-block" />
              <span>{currentTable}</span>
            </div>

            <button
              onClick={handleCallWaiter}
              disabled={loading}
              title="Llamar al mesero"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-red hover:bg-red-600 active:scale-95 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 animate-bounce" />
              <span className="hidden sm:inline">Llamar</span> Mesero
            </button>

            <button
              onClick={handleRequestBill}
              disabled={loading}
              title="Pedir la cuenta"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-yellow hover:bg-yellow-400 active:scale-95 text-black text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pedir</span> Cuenta
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#181818]/90 hover:bg-[#222] border border-stone-700/60 hover:border-brand-yellow/50 rounded-full text-gray-300 hover:text-brand-yellow text-xs font-bold shadow-xl backdrop-blur-md transition-all group"
          >
            <Bell className="w-3.5 h-3.5 text-brand-yellow group-hover:scale-110 transition-transform" />
            <span>¿En mesa? Llama al mesero</span>
          </button>
        )}
      </aside>

      {/* Modal para ingresar número de mesa si no vino en el QR */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border-2 border-brand-yellow/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-center">
            <button
              onClick={() => setShowManualModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full bg-stone-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-brand-yellow/20 text-brand-yellow flex items-center justify-center mx-auto mb-3">
              <Bell className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-white font-display uppercase tracking-wide">
              ¿Cuál es tu número de mesa?
            </h3>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              Ingresa el número que se encuentra en la etiqueta o placa de tu mesa para poder atenderte y llevarte la cuenta.
            </p>

            <form onSubmit={handleSaveManualTable} className="space-y-4">
              <input
                type="text"
                autoFocus
                placeholder="Ejemplo: 3 o Mesa 3"
                value={tempTableInput}
                onChange={(e) => setTempTableInput(e.target.value)}
                className="w-full text-center text-lg font-black bg-[#1c1c1c] border border-stone-700 focus:border-brand-yellow text-brand-yellow rounded-2xl py-3 px-4 outline-none transition-all"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-800 text-gray-300 font-bold text-xs uppercase hover:bg-stone-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!tempTableInput.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-brand-yellow text-black font-black text-xs uppercase hover:bg-yellow-400 disabled:opacity-50 transition-colors shadow-glow"
                >
                  Confirmar Mesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
export default TableServiceBar;
