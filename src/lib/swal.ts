import Swal from 'sweetalert2';

// Instancia personalizada de SweetAlert2 con la paleta de Punto G
// Fondo negro (#0e0e0e / #121212), botones amarillos (#ffc928) con texto negro
export const swalCustom = Swal.mixin({
  background: '#121212',
  color: '#ffffff',
  confirmButtonColor: '#ffc928',
  cancelButtonColor: '#262626',
  buttonsStyling: false,
  customClass: {
    popup: 'bg-[#121212] border-2 border-brand-yellow/70 rounded-3xl p-6 text-center shadow-[0_0_40px_rgba(255,201,40,0.25)] font-sans',
    title: 'text-white text-lg sm:text-xl font-black uppercase font-display tracking-wide',
    htmlContainer: 'text-gray-300 text-xs sm:text-sm leading-relaxed mt-2',
    confirmButton: 'bg-brand-yellow hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl mx-1.5 shadow-glow transition-all active:scale-95 cursor-pointer',
    cancelButton: 'bg-[#222222] hover:bg-[#303030] text-gray-300 hover:text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl mx-1.5 border border-[#3d3d3d] transition-all active:scale-95 cursor-pointer',
    denyButton: 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40 font-bold text-xs uppercase px-5 py-3 rounded-xl mx-1.5 cursor-pointer',
    input: 'bg-[#1c1c1c] border border-[#333] text-white text-xs rounded-xl px-4 py-2.5 focus:border-brand-yellow focus:outline-none',
  },
});

/**
 * Muestra una confirmación con SweetAlert2 retornando true si el usuario confirmó.
 */
export async function showConfirm(options: {
  title: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  icon?: 'warning' | 'question' | 'info';
}): Promise<boolean> {
  const result = await swalCustom.fire({
    title: options.title,
    text: options.text,
    icon: options.icon || 'warning',
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText || 'Sí, confirmar',
    cancelButtonText: options.cancelButtonText || 'Cancelar',
    reverseButtons: true,
  });

  return result.isConfirmed;
}

/**
 * Muestra una alerta informativa o de éxito
 */
export async function showAlert(options: {
  title: string;
  text?: string;
  icon?: 'success' | 'error' | 'warning' | 'info';
  confirmButtonText?: string;
}) {
  return swalCustom.fire({
    title: options.title,
    text: options.text,
    icon: options.icon || 'info',
    confirmButtonText: options.confirmButtonText || 'Entendido',
  });
}

/**
 * Atajo para alerta de éxito
 */
export async function showSuccess(title: string, text?: string) {
  return swalCustom.fire({
    title,
    text,
    icon: 'success',
    confirmButtonText: 'Genial',
  });
}

/**
 * Atajo para alerta de error
 */
export async function showError(title: string, text?: string) {
  return swalCustom.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'Aceptar',
  });
}

/**
 * Atajo para advertencia
 */
export async function showWarning(title: string, text?: string) {
  return swalCustom.fire({
    title,
    text,
    icon: 'warning',
    confirmButtonText: 'De acuerdo',
  });
}

export default swalCustom;
