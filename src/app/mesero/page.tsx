'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  UtensilsCrossed,
  Bell,
  Receipt,
  Search,
  Plus,
  Minus,
  Trash2,
  Check,
  X,
  Printer,
  RefreshCw,
  Volume2,
  VolumeX,
  CreditCard,
  Banknote,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  Users,
  Clock,
  AlertTriangle,
  ChefHat,
  MonitorPlay,
  Settings,
  DollarSign
} from 'lucide-react';
import { swalCustom, showSuccess, showError, showConfirm } from '@/lib/swal';
import { ThermalReceiptModal } from '@/components/pos/ThermalReceiptModal';

// Audio sintetizado con Web Audio API para alertas de mesero
function playAlertSound(type: 'call' | 'bill') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'call') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.15); // D6
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.45);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.12); // G5
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.25); // C6
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    }
  } catch (e) {
    // Ignore autoplay policy restrictions
  }
}

interface TableOrder {
  id: number;
  codigo: string;
  cliente: string;
  telefono: string;
  subtotal: number;
  propina: number;
  total: number;
  estado: string;
  metodoPago: string;
  createdAt: string;
  items: Array<{
    id: number;
    nombre: string;
    precio: number;
    cantidad: number;
    notas?: string | null;
    adicionales?: string | null;
  }>;
}

interface Table {
  id: number;
  numero: string;
  capacidad: number;
  ubicacion: string;
  estado: string;
  notas?: string | null;
  branchId?: number | null;
  llamandoMesero?: boolean;
  llamadoEn?: string | null;
  solicitudCuenta?: boolean;
  solicitudCuentaEn?: string | null;
  metodoPagoCuenta?: string | null;
  orders?: TableOrder[];
}

interface ProductItem {
  id: number;
  nombre: string;
  slug: string;
  descripcion?: string;
  precio: number;
  imagen: string;
  categoria: string;
  categoriaNombre?: string;
  subcategoria?: string;
  subcategoriaNombre?: string;
  disponibilidad?: boolean;
  etiqueta?: string | null;
  stock?: number | null;
  stockMinimo?: number | null;
  controlarStock?: boolean;
  costo?: number | null;
}

interface ComandaItem {
  product: ProductItem;
  cantidad: number;
  notas: string;
}

export default function MeseroPage() {
  const params = useParams();
  const tenantSlug = (params?.slug as string) || null;
  const [restaurant, setRestaurant] = useState<{ id: number; nombre: string; colorPrimario?: string; logo?: string; eslogan?: string } | null>(null);

  const [tables, setTables] = useState<Table[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Fetch restaurant branding if tenantSlug exists
  useEffect(() => {
    if (tenantSlug) {
      fetch(`/api/restaurants?slug=${tenantSlug}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) setRestaurant(data);
        })
        .catch(console.error);
    }
  }, [tenantSlug]);

  // Vista actual: 'mesas' | 'comanda' | 'dividir'
  const [currentView, setCurrentView] = useState<'mesas' | 'comanda' | 'dividir'>('mesas');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  // Estado del Comandero
  const [comandaItems, setComandaItems] = useState<ComandaItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [includeTip, setIncludeTip] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado de División de Cuentas (Split Bill)
  const [splitMode, setSplitMode] = useState<'items' | 'equal'>('items');
  const [equalPersons, setEqualPersons] = useState(2);
  const [equalTipPercent, setEqualTipPercent] = useState(10);
  // Cuentas individuales asignadas
  const [diners, setDiners] = useState<Array<{
    id: string;
    nombre: string;
    items: Array<{ nombre: string; precio: number; cantidad: number; notas?: string | null }>;
    propina: number;
    metodoPago: string;
    pagado: boolean;
  }>>([]);

  // Modal de Ticket POS Térmico
  const [receiptOrder, setReceiptOrder] = useState<any | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Rastreo de alertas previas para reproducir sonido solo en nuevas llamadas
  const prevAlertsRef = useRef<{ calls: Set<number>; bills: Set<number> }>({
    calls: new Set(),
    bills: new Set(),
  });

  const formatCOP = (num: number) => '$' + (num || 0).toLocaleString('es-CO');

  // Cargar mesas, productos y categorías
  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      let tablesUrl = `/api/tables?`;
      if (tenantSlug) tablesUrl += `restaurantSlug=${tenantSlug}&`;
      if (selectedBranch !== 'all') tablesUrl += `branchId=${selectedBranch}&`;

      let prodsUrl = `/api/products?`;
      if (tenantSlug) prodsUrl += `restaurantSlug=${tenantSlug}&`;

      let catsUrl = `/api/categories?all=true&`;
      if (tenantSlug) catsUrl += `restaurantSlug=${tenantSlug}&`;

      let branchesUrl = `/api/branches?activo=true&`;
      if (tenantSlug) branchesUrl += `restaurantSlug=${tenantSlug}&`;

      const [resTables, resProds, resCats, resBranches] = await Promise.all([
        fetch(tablesUrl),
        fetch(prodsUrl),
        fetch(catsUrl),
        fetch(branchesUrl),
      ]);

      if (resTables.ok) {
        const dataTables: Table[] = await resTables.json();
        setTables(dataTables);

        // Chequear llamadas y solicitudes de cuenta para reproducir sonido si soundEnabled
        if (soundEnabled) {
          const newCalls = new Set<number>();
          const newBills = new Set<number>();

          dataTables.forEach((t) => {
            if (t.llamandoMesero) newCalls.add(t.id);
            if (t.solicitudCuenta) newBills.add(t.id);
          });

          // Si hay una mesa llamando que antes no estaba
          let hasNewCall = false;
          newCalls.forEach((id) => {
            if (!prevAlertsRef.current.calls.has(id)) hasNewCall = true;
          });

          let hasNewBill = false;
          newBills.forEach((id) => {
            if (!prevAlertsRef.current.bills.has(id)) hasNewBill = true;
          });

          if (hasNewCall) playAlertSound('call');
          else if (hasNewBill) playAlertSound('bill');

          prevAlertsRef.current = { calls: newCalls, bills: newBills };
        }
      }

      if (resProds.ok) {
        const dataProds = await resProds.json();
        setProducts(dataProds);
      }

      if (resCats.ok) {
        const dataCats = await resCats.json();
        setCategories(dataCats);
      }

      if (resBranches.ok) {
        const dataBranches = await resBranches.json();
        setBranches(dataBranches);
      }
    } catch (err) {
      console.error('Error cargando datos de mesero:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Sondeo en tiempo real cada 6 segundos para llamadas de mesas
    const interval = setInterval(() => {
      loadData(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [selectedBranch, soundEnabled]);

  // Manejo de Atender Llamado
  const handleAttendCall = async (tableId: number, tableNumber: string) => {
    try {
      const res = await fetch(`/api/tables/${tableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'atender_llamado' }),
      });
      if (res.ok) {
        setTables((prev) =>
          prev.map((t) => (t.id === tableId ? { ...t, llamandoMesero: false, llamadoEn: null } : t))
        );
        showSuccess('Llamado atendido', `Has atendido el llamado de la ${tableNumber}`);
      }
    } catch (e) {
      showError('Error', 'No se pudo actualizar el estado de la mesa.');
    }
  };

  // Manejo de Atender Cuenta
  const handleAttendBill = async (tableId: number, tableNumber: string) => {
    try {
      const res = await fetch(`/api/tables/${tableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'atender_cuenta' }),
      });
      if (res.ok) {
        setTables((prev) =>
          prev.map((t) => (t.id === tableId ? { ...t, solicitudCuenta: false, solicitudCuentaEn: null } : t))
        );
        showSuccess('Cuenta atendida', `Has tomado la solicitud de cuenta de la ${tableNumber}`);
      }
    } catch (e) {
      showError('Error', 'No se pudo actualizar el estado de la mesa.');
    }
  };

  // Abrir Comandero para una mesa
  const handleOpenComandero = (table: Table) => {
    setSelectedTable(table);
    setComandaItems([]);
    setCustomerName(table.orders?.[0]?.cliente || `Comensal ${table.numero}`);
    setSearchProduct('');
    setSelectedCategory('todas');
    setIncludeTip(true);
    setCurrentView('comanda');
  };

  // Abrir División de Cuentas
  const handleOpenSplitBill = (table: Table) => {
    setSelectedTable(table);
    // Extraer todos los ítems de las órdenes activas de la mesa
    const allItems: Array<{ nombre: string; precio: number; cantidad: number; notas?: string | null }> = [];
    if (table.orders && table.orders.length > 0) {
      table.orders.forEach((ord) => {
        ord.items.forEach((it) => {
          allItems.push({
            nombre: it.nombre,
            precio: it.precio,
            cantidad: it.cantidad,
            notas: it.notas,
          });
        });
      });
    }

    // Inicializar 2 comensales por defecto
    const initialDiners = [
      {
        id: 'c-1',
        nombre: 'Comensal 1',
        items: [...allItems], // Inicialmente todos en comensal 1
        propina: Math.round(allItems.reduce((s, i) => s + i.precio * i.cantidad, 0) * 0.1),
        metodoPago: 'Efectivo',
        pagado: false,
      },
      {
        id: 'c-2',
        nombre: 'Comensal 2',
        items: [],
        propina: 0,
        metodoPago: 'Nequi / Daviplata / Transferencia',
        pagado: false,
      },
    ];

    setDiners(initialDiners);
    setSplitMode('items');
    setCurrentView('dividir');
  };

  // Agregar ítem al comandero (Totalmente inmutable para evitar incrementos dobles)
  const handleAddItemToComanda = (prod: ProductItem) => {
    if (prod.disponibilidad === false || (prod.controlarStock && (prod.stock ?? 0) <= 0)) {
      showError('Producto Agotado', `El producto "${prod.nombre}" no tiene inventario disponible.`);
      return;
    }

    setComandaItems((prev) => {
      const existing = prev.find((i) => i.product.id === prod.id);
      if (existing) {
        const newQty = existing.cantidad + 1;
        if (prod.controlarStock && prod.stock !== null && prod.stock !== undefined && newQty > prod.stock) {
          showError('Stock Insuficiente', `Solo quedan ${prod.stock} unidades disponibles.`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === prod.id ? { ...item, cantidad: newQty } : item
        );
      } else {
        return [...prev, { product: prod, cantidad: 1, notas: '' }];
      }
    });
  };

  const handleUpdateItemQty = (prodId: number, delta: number) => {
    setComandaItems((prev) => {
      const existing = prev.find((item) => item.product.id === prodId);
      if (!existing) return prev;

      const newQty = existing.cantidad + delta;
      if (delta > 0 && existing.product.controlarStock && existing.product.stock !== null && existing.product.stock !== undefined && newQty > existing.product.stock) {
        showError('Stock Insuficiente', `Solo quedan ${existing.product.stock} unidades.`);
        return prev;
      }

      if (newQty <= 0) {
        return prev.filter((item) => item.product.id !== prodId);
      }

      return prev.map((item) =>
        item.product.id === prodId ? { ...item, cantidad: newQty } : item
      );
    });
  };

  const handleUpdateItemNotes = (prodId: number, notas: string) => {
    setComandaItems((prev) =>
      prev.map((item) => (item.product.id === prodId ? { ...item, notas } : item))
    );
  };

  // Totales de la comanda actual
  const comandaSubtotal = useMemo(() => {
    return comandaItems.reduce((acc, it) => acc + it.product.precio * it.cantidad, 0);
  }, [comandaItems]);

  const comandaPropina = useMemo(() => {
    return includeTip ? Math.round(comandaSubtotal * 0.1) : 0;
  }, [comandaSubtotal, includeTip]);

  const comandaTotal = comandaSubtotal + comandaPropina;

  // Enviar comanda a Cocina
  const handleSubmitComandaToKitchen = async () => {
    if (!selectedTable || comandaItems.length === 0) return;

    const confirm = await swalCustom.fire({
      title: '🍽️ ENVIAR COMANDA A COCINA',
      html: `
        <div class="text-xs text-left space-y-1 mb-2">
          <p><strong>Mesa:</strong> <span class="text-brand-yellow font-bold">${selectedTable.numero}</span></p>
          <p><strong>Ítems:</strong> ${comandaItems.reduce((s, i) => s + i.cantidad, 0)} platos/bebidas</p>
          <p><strong>Total:</strong> <span class="text-brand-yellow font-black">${formatCOP(comandaTotal)}</span></p>
        </div>
        <p class="text-gray-400 text-[11px]">La comanda entrará directamente a la pantalla de cocina (KDS) y se descontará el inventario.</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, Enviar a Cocina',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: customerName.trim() || `Comensal ${selectedTable.numero}`,
          telefono: '3000000000',
          tipo: 'mesa',
          mesaId: selectedTable.id,
          numeroMesa: selectedTable.numero,
          branchId: selectedTable.branchId,
          restaurantSlug: tenantSlug,
          restaurantId: restaurant?.id,
          subtotal: comandaSubtotal,
          propina: comandaPropina,
          total: comandaTotal,
          metodoPago: 'Pendiente en Mesa',
          notasCliente: `Comanda tomada por Mesero en Tablet`,
          items: comandaItems.map((it) => ({
            productoId: it.product.id,
            nombre: it.product.nombre,
            precio: it.product.precio,
            cantidad: it.cantidad,
            notas: it.notas || null,
          })),
        }),
      });

      if (res.ok) {
        const orderData = await res.json();
        await swalCustom.fire({
          title: '👨‍🍳 ¡COMANDA ENVIADA!',
          html: `Comanda <strong class="text-brand-yellow">#${orderData.codigo}</strong> enviada exitosamente para la <strong>${selectedTable.numero}</strong>.`,
          icon: 'success',
          confirmButtonText: 'Continuar',
        });
        setCurrentView('mesas');
        setSelectedTable(null);
        setComandaItems([]);
        loadData();
      } else {
        const err = await res.json();
        await showError('Error al enviar', err.error || 'No se pudo crear la comanda.');
      }
    } catch (e) {
      await showError('Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Liberar mesa con SweetAlert2
  const handleReleaseTable = async (tableId: number, tableNumber: string) => {
    const confirmed = await showConfirm({
      title: `¿LIBERAR ${tableNumber.toUpperCase()}?`,
      text: 'Se cerrarán todos los consumos activos de esta mesa y quedará en estado LIBRE para nuevos clientes.',
      confirmButtonText: 'Sí, Liberar Mesa',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/tables/${tableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'liberar' }),
      });

      if (res.ok) {
        showSuccess('Mesa Liberada', `La ${tableNumber} ahora se encuentra disponible.`);
        loadData();
        if (currentView === 'dividir') setCurrentView('mesas');
      } else {
        showError('Error', 'No se pudo liberar la mesa.');
      }
    } catch (e) {
      showError('Error', 'Fallo de conexión.');
    }
  };

  // Mover ítem entre comensales en Split Bill (Permitiendo elegir cuántas unidades mover)
  const handleMoveItemToDiner = async (fromDinerId: string, toDinerId: string, itemIndex: number) => {
    const fromDiner = diners.find((d) => d.id === fromDinerId);
    const toDiner = diners.find((d) => d.id === toDinerId);
    if (!fromDiner || !toDiner) return;

    const itemToMove = fromDiner.items[itemIndex];
    if (!itemToMove) return;

    let qtyToMove = 1;

    // Si el plato tiene más de 1 unidad, preguntamos cuántas desea mover
    if (itemToMove.cantidad > 1) {
      const { value, isConfirmed } = await swalCustom.fire({
        title: '📦 MOVER CANTIDAD',
        html: `
          <div class="text-xs text-gray-300 mb-2">
            El ítem <strong class="text-brand-yellow font-bold">${itemToMove.nombre}</strong> tiene <strong>${itemToMove.cantidad} unidades</strong>.<br>
            ¿Cuántas unidades deseas mover a <strong class="text-brand-yellow font-bold">${toDiner.nombre}</strong>?
          </div>
        `,
        input: 'number',
        inputValue: 1,
        inputAttributes: {
          min: '1',
          max: String(itemToMove.cantidad),
          step: '1',
          style: 'text-align: center; font-size: 16px; font-weight: bold; width: 120px; margin: 10px auto;',
        },
        showCancelButton: true,
        confirmButtonText: 'Mover Platos',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        preConfirm: (inputVal) => {
          const n = Number(inputVal);
          if (!n || n < 1 || n > itemToMove.cantidad) {
            swalCustom.showValidationMessage(`Por favor ingresa un número entre 1 y ${itemToMove.cantidad}`);
            return false;
          }
          return n;
        },
      });

      if (!isConfirmed || !value) return;
      qtyToMove = Number(value);
    }

    setDiners((prev) => {
      return prev.map((diner) => {
        if (diner.id === fromDinerId) {
          // Descontar o remover de origen
          let newItems: typeof diner.items = [];
          if (qtyToMove >= itemToMove.cantidad) {
            newItems = diner.items.filter((_, idx) => idx !== itemIndex);
          } else {
            newItems = diner.items.map((it, idx) =>
              idx === itemIndex ? { ...it, cantidad: it.cantidad - qtyToMove } : it
            );
          }
          const newSub = newItems.reduce((s, i) => s + i.precio * i.cantidad, 0);
          return {
            ...diner,
            items: newItems,
            propina: Math.round(newSub * 0.1),
          };
        }

        if (diner.id === toDinerId) {
          // Agregar a destino (si ya existe el plato, sumar cantidad)
          let newItems = [...diner.items];
          const existIdx = newItems.findIndex(
            (it) => it.nombre === itemToMove.nombre && it.precio === itemToMove.precio
          );
          if (existIdx >= 0) {
            newItems = newItems.map((it, idx) =>
              idx === existIdx ? { ...it, cantidad: it.cantidad + qtyToMove } : it
            );
          } else {
            newItems.push({ ...itemToMove, cantidad: qtyToMove });
          }
          const newSub = newItems.reduce((s, i) => s + i.precio * i.cantidad, 0);
          return {
            ...diner,
            items: newItems,
            propina: Math.round(newSub * 0.1),
          };
        }

        return diner;
      });
    });
  };

  // Remover / eliminar comensal (devuelve los ítems al primer comensal para no perder nada)
  const handleRemoveDiner = async (dinerId: string) => {
    if (diners.length <= 1) {
      showError('Atención', 'Debe haber al menos 1 comensal en la mesa.');
      return;
    }

    const dinerToRemove = diners.find((d) => d.id === dinerId);
    if (!dinerToRemove) return;

    const confirm = await swalCustom.fire({
      title: `¿QUITAR ${dinerToRemove.nombre.toUpperCase()}?`,
      html: dinerToRemove.items.length > 0
        ? `Este comensal tiene <strong>${dinerToRemove.items.length} platos/bebidas</strong>.<br>Sus consumos se transferirán automáticamente al primer comensal para no perder datos.`
        : `¿Deseas remover a este comensal de la cuenta?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, Quitar Comensal',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    setDiners((prev) => {
      const remainingDiners = prev.filter((d) => d.id !== dinerId);
      if (dinerToRemove.items.length === 0) return remainingDiners;

      // Transferir todos los ítems al primer comensal restante
      const target = remainingDiners[0];
      const mergedItems = [...target.items];

      dinerToRemove.items.forEach((item) => {
        const existIdx = mergedItems.findIndex(
          (it) => it.nombre === item.nombre && it.precio === item.precio
        );
        if (existIdx >= 0) {
          mergedItems[existIdx] = {
            ...mergedItems[existIdx],
            cantidad: mergedItems[existIdx].cantidad + item.cantidad,
          };
        } else {
          mergedItems.push({ ...item });
        }
      });

      const newSub = mergedItems.reduce((s, i) => s + i.precio * i.cantidad, 0);

      return remainingDiners.map((d, idx) =>
        idx === 0
          ? {
              ...d,
              items: mergedItems,
              propina: Math.round(newSub * 0.1),
            }
          : d
      );
    });

    showSuccess('Comensal Removido', `Los consumos quedaron centralizados correctamente.`);
  };

  // Asignar todos los platos de la mesa a un solo comensal (Unificar Cuenta / Uno solo paga todo rápido)
  const handleAssignAllToDiner = async (targetDinerId: string) => {
    const targetDiner = diners.find((d) => d.id === targetDinerId);
    if (!targetDiner) return;

    const confirm = await swalCustom.fire({
      title: '⚡ UNIFICAR TODA LA CUENTA',
      html: `¿Deseas asignar <strong>TODOS</strong> los consumos de la mesa a <strong class="text-brand-yellow">${targetDiner.nombre}</strong> para pagar la cuenta completa en una sola factura?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, Pagar Todo Junto',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    // Recolectar todos los ítems de todas las órdenes activas de la mesa
    const allTableItems: Array<{ nombre: string; precio: number; cantidad: number; notas?: string | null }> = [];
    if (selectedTable?.orders) {
      selectedTable.orders.forEach((ord) => {
        ord.items.forEach((it) => {
          const existIdx = allTableItems.findIndex(
            (x) => x.nombre === it.nombre && x.precio === it.precio
          );
          if (existIdx >= 0) {
            allTableItems[existIdx].cantidad += it.cantidad;
          } else {
            allTableItems.push({
              nombre: it.nombre,
              precio: it.precio,
              cantidad: it.cantidad,
              notas: it.notas,
            });
          }
        });
      });
    }

    const newSub = allTableItems.reduce((s, i) => s + i.precio * i.cantidad, 0);

    setDiners((prev) =>
      prev.map((d) => {
        if (d.id === targetDinerId) {
          return {
            ...d,
            items: allTableItems,
            propina: Math.round(newSub * 0.1),
          };
        }
        return {
          ...d,
          items: [],
          propina: 0,
        };
      })
    );

    showSuccess('Cuenta Unificada', `Todos los consumos quedaron asignados a ${targetDiner.nombre}.`);
  };

  // Agregar nuevo comensal
  const handleAddDiner = () => {
    const nextNum = diners.length + 1;
    setDiners((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        nombre: `Comensal ${nextNum}`,
        items: [],
        propina: 0,
        metodoPago: 'Efectivo',
        pagado: false,
      },
    ]);
  };

  // Imprimir Ticket POS para un comensal individual en Split Bill
  const handlePrintDinerReceipt = (diner: any) => {
    if (!selectedTable) return;
    const subtotal = diner.items.reduce((s: number, i: any) => s + i.precio * i.cantidad, 0);
    const total = subtotal + diner.propina;

    setReceiptOrder({
      codigo: `SB-${selectedTable.numero.replace(/\s+/g, '')}-${diner.nombre.replace(/\s+/g, '')}`,
      cliente: `${diner.nombre} (${selectedTable.numero})`,
      telefono: '0000000000',
      tipo: 'mesa',
      numeroMesa: selectedTable.numero,
      subtotal,
      propina: diner.propina,
      total,
      metodoPago: diner.metodoPago,
      notasCliente: `Cuenta separada para ${diner.nombre}`,
      createdAt: new Date().toISOString(),
      items: diner.items,
    });
    setIsReceiptOpen(true);
  };

  // Imprimir Ticket POS para partes iguales
  const handlePrintEqualReceipt = (index: number) => {
    if (!selectedTable || !selectedTable.orders || selectedTable.orders.length === 0) return;
    const totalTable = selectedTable.orders.reduce((s, o) => s + o.total, 0);
    const subtotalTable = selectedTable.orders.reduce((s, o) => s + o.subtotal, 0);
    const eachSubtotal = Math.round(subtotalTable / equalPersons);
    const eachTip = Math.round((eachSubtotal * equalTipPercent) / 100);
    const eachTotal = eachSubtotal + eachTip;

    setReceiptOrder({
      codigo: `EQ-${selectedTable.numero.replace(/\s+/g, '')}-P${index + 1}`,
      cliente: `Persona ${index + 1} de ${equalPersons} (${selectedTable.numero})`,
      telefono: '0000000000',
      tipo: 'mesa',
      numeroMesa: selectedTable.numero,
      subtotal: eachSubtotal,
      propina: eachTip,
      total: eachTotal,
      metodoPago: 'Efectivo / Tarjeta',
      notasCliente: `División en partes iguales (${index + 1}/${equalPersons})`,
      createdAt: new Date().toISOString(),
      items: [
        {
          nombre: `Consumo dividido (${index + 1}/${equalPersons})`,
          precio: eachSubtotal,
          cantidad: 1,
          notas: `Parte proporcional de ${formatCOP(totalTable)}`,
        },
      ],
    });
    setIsReceiptOpen(true);
  };

  // Liquidar comanda de mesa generando N facturas individuales
  const handleLiquidateSplitBill = async () => {
    if (!selectedTable || !selectedTable.orders || selectedTable.orders.length === 0) {
      showError('Error', 'No hay comanda activa para liquidar.');
      return;
    }

    const activeOrder = selectedTable.orders[0];
    let dinersPayload: any[] = [];

    if (splitMode === 'items') {
      dinersPayload = diners.map((d, idx) => {
        const subtotal = d.items.reduce((s: number, i: any) => s + i.precio * i.cantidad, 0);
        const propina = d.propina || 0;
        const total = subtotal + propina;
        return {
          nombre: d.nombre || `Comensal ${idx + 1}`,
          items: d.items,
          subtotal,
          propina,
          total,
          metodoPago: d.metodoPago || 'Efectivo',
          pagado: true,
        };
      });
    } else {
      const totalTable = selectedTable.orders.reduce((s, o) => s + o.total, 0);
      const subtotalTable = selectedTable.orders.reduce((s, o) => s + o.subtotal, 0);
      const eachSubtotal = Math.round(subtotalTable / equalPersons);
      const eachTip = Math.round((eachSubtotal * equalTipPercent) / 100);
      const eachTotal = eachSubtotal + eachTip;

      dinersPayload = Array.from({ length: equalPersons }).map((_, idx) => ({
        nombre: `Persona ${idx + 1} de ${equalPersons}`,
        items: [
          {
            nombre: `Consumo proporcional (${idx + 1}/${equalPersons})`,
            precio: eachSubtotal,
            cantidad: 1,
            notas: `División en partes iguales de ${selectedTable.numero}`,
          },
        ],
        subtotal: eachSubtotal,
        propina: eachTip,
        total: eachTotal,
        metodoPago: 'Efectivo / Tarjeta',
        pagado: true,
      }));
    }

    const confirmed = await showConfirm({
      title: `¿LIQUIDAR CUENTA DE ${selectedTable.numero.toUpperCase()}?`,
      text: `Se mantendrá 1 sola comanda para cocina (#${activeOrder.codigo}) y se registrarán ${dinersPayload.length} FACTURAS individuales en administración y caja. La mesa quedará liberada.`,
      confirmButtonText: `Sí, Generar ${dinersPayload.length} Facturas`,
      cancelButtonText: 'Cancelar',
    });

    if (!confirmed) return;

    try {
      let cajeroName = 'Mesero';
      try {
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('punto_g_admin_logged_in') || localStorage.getItem('puntog_user');
          if (raw) {
            const u = JSON.parse(raw);
            if (u?.nombre) cajeroName = u.nombre;
          }
        }
      } catch {}

      const res = await fetch(`/api/orders/${activeOrder.id}/split-billing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diners: dinersPayload,
          liberarMesa: true,
          cajero: cajeroName,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showSuccess(
          '¡Cuenta Liquidada con Éxito!',
          `Se generaron ${data.invoices?.length || dinersPayload.length} facturas individuales. La mesa quedó libre para nuevos clientes.`
        );
        loadData();
        setCurrentView('mesas');
      } else {
        showError('Error', data.error || 'No se pudo liquidar la cuenta dividida.');
      }
    } catch (e) {
      showError('Error de conexión', 'Fallo al procesar las facturas.');
    }
  };

  // Filtro de productos para el comandero
  const filteredProducts = useMemo(() => {
    const q = searchProduct.toLowerCase().trim();
    return products.filter((p) => {
      if (selectedCategory !== 'todas') {
        if (p.categoria !== selectedCategory && p.subcategoria !== selectedCategory) {
          return false;
        }
      }
      if (!q) return true;
      return (
        p.nombre.toLowerCase().includes(q) ||
        (p.descripcion || '').toLowerCase().includes(q) ||
        (p.etiqueta || '').toLowerCase().includes(q)
      );
    });
  }, [products, searchProduct, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col font-sans pb-12 select-none">
      {/* ======================================================== */}
      {/* HEADER TÁCTIL PARA TABLETS / SMARTPHONES */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-30 bg-[#121212]/95 backdrop-blur-md border-b border-[#222] px-4 py-3 flex items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            href={tenantSlug ? `/r/${tenantSlug}` : '/'}
            className="flex items-center gap-2 group hover:opacity-90 transition"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-yellow to-amber-500 flex items-center justify-center font-black text-black shadow-glow shrink-0">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black uppercase text-white font-display tracking-wider flex items-center gap-1.5">
                <span>{restaurant?.nombre || 'Punto G'}</span>
                <span className="text-[10px] bg-brand-yellow text-black font-black px-1.5 py-0.5 rounded-md">
                  MESERO POS
                </span>
              </h1>
              <p className="text-[10px] text-gray-400 font-bold">{restaurant?.eslogan || 'Comandero Tablet & Móvil'}</p>
            </div>
          </Link>

          {/* Sede Selector */}
          {branches.length > 0 && (
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="hidden sm:block bg-[#1a1a1a] border border-[#333] text-gray-200 text-xs rounded-xl px-3 py-1.5 font-bold focus:border-brand-yellow outline-none"
            >
              <option value="all">Todas las Sedes</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Acciones Rápidas del Header */}
        <div className="flex items-center gap-2">
          {/* Conmutador de Sonido */}
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playAlertSound('call');
            }}
            className={`p-2.5 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-brand-yellow/15 text-brand-yellow border-brand-yellow/40'
                : 'bg-[#1a1a1a] text-gray-500 border-[#2b2b2b]'
            }`}
            title={soundEnabled ? 'Alertas sonoras activadas' : 'Alertas sonoras silenciadas'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Botón Refrescar */}
          <button
            type="button"
            onClick={() => loadData()}
            className="p-2.5 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] text-gray-300 hover:text-white transition"
            title="Recargar mesas y pedidos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-yellow' : ''}`} />
          </button>

          {/* Acceso a Cocina KDS */}
          <Link
            href="/cocina"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] text-gray-300 hover:text-white rounded-xl text-xs font-bold transition"
          >
            <ChefHat className="w-4 h-4 text-brand-orange" />
            <span>KDS Cocina</span>
          </Link>

          {/* Acceso a Turnero */}
          <Link
            href="/turnero"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] text-gray-300 hover:text-white rounded-xl text-xs font-bold transition"
          >
            <MonitorPlay className="w-4 h-4 text-emerald-400" />
            <span>Turnero</span>
          </Link>

          {/* Acceso a Admin */}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-yellow hover:bg-yellow-400 text-black rounded-xl text-xs font-black uppercase tracking-wider transition shadow-glow"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>
        </div>
      </header>

      {/* ======================================================== */}
      {/* VISTA 1: SALÓN DE MESAS EN TIEMPO REAL */}
      {/* ======================================================== */}
      {currentView === 'mesas' && (
        <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in">
          {/* Banner de Estado Resumen */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#141414] via-[#121212] to-[#141414] border border-[#262626] p-4 sm:p-5 rounded-2xl">
            <div>
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-brand-yellow" />
                <h2 className="text-lg font-black uppercase text-white font-display">
                  SALÓN DE MESAS Y COMANDAS
                </h2>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Toca cualquier mesa para tomar comanda, cobrar o dividir la cuenta por personas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-xl">
                🟢 {tables.filter((t) => t.estado === 'Libre' && (!t.orders || t.orders.length === 0)).length} Libres
              </span>
              <span className="text-xs font-black text-amber-400 bg-amber-950/40 border border-amber-800/40 px-3 py-1 rounded-xl">
                🔴 {tables.filter((t) => t.estado === 'Ocupada' || (t.orders && t.orders.length > 0)).length} Ocupadas
              </span>
              {tables.some((t) => t.llamandoMesero) && (
                <span className="text-xs font-black text-red-400 bg-red-950/60 border border-red-500/60 px-3 py-1 rounded-xl animate-pulse flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 animate-bounce" />
                  <span>¡{tables.filter((t) => t.llamandoMesero).length} Llamando!</span>
                </span>
              )}
              {tables.some((t) => t.solicitudCuenta) && (
                <span className="text-xs font-black text-yellow-300 bg-yellow-950/60 border border-yellow-500/60 px-3 py-1 rounded-xl animate-pulse flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5" />
                  <span>¡{tables.filter((t) => t.solicitudCuenta).length} Pidiendo Cuenta!</span>
                </span>
              )}
            </div>
          </div>

          {/* Cuadrícula Táctil de Mesas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map((table) => {
              const activeOrders = table.orders || [];
              const isOccupied = table.estado === 'Ocupada' || activeOrders.length > 0;
              const isCalling = table.llamandoMesero;
              const isBillRequested = table.solicitudCuenta;
              const tableTotal = activeOrders.reduce((sum, o) => sum + o.total, 0);
              const itemsCount = activeOrders.reduce(
                (sum, o) => sum + (o.items ? o.items.reduce((s, it) => s + it.cantidad, 0) : 0),
                0
              );

              return (
                <div
                  key={table.id}
                  className={`bg-[#121212] rounded-3xl p-5 border-2 transition-all relative flex flex-col justify-between space-y-4 shadow-xl ${
                    isCalling
                      ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.35)] animate-pulse'
                      : isBillRequested
                      ? 'border-brand-yellow shadow-[0_0_25px_rgba(255,201,40,0.3)]'
                      : isOccupied
                      ? 'border-amber-500/70 shadow-lg'
                      : 'border-[#222] hover:border-brand-yellow/40'
                  }`}
                >
                  {/* Encabezado de la Tarjeta */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base shadow-md ${
                            isCalling
                              ? 'bg-red-500 text-white animate-bounce'
                              : isBillRequested
                              ? 'bg-brand-yellow text-black'
                              : isOccupied
                              ? 'bg-amber-500 text-black'
                              : 'bg-[#1e1e1e] text-gray-300'
                          }`}
                        >
                          <UtensilsCrossed className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-white uppercase font-display">
                            {table.numero}
                          </h3>
                          <p className="text-[11px] text-gray-400 font-bold">
                            {table.ubicacion || 'Salón'} • {table.capacidad} personas
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-full ${
                          isOccupied
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {isOccupied ? '🔴 Ocupada' : '🟢 Libre'}
                      </span>
                    </div>

                    {/* ALERTA: Cliente Llamando */}
                    {isCalling && (
                      <div className="bg-red-950/60 border border-red-500/80 rounded-2xl p-3 flex items-center justify-between gap-2 animate-in fade-in">
                        <div className="flex items-center gap-2 text-xs font-black text-red-200">
                          <Bell className="w-4 h-4 text-red-400 animate-spin" />
                          <span>¡Cliente solicita mesero!</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAttendCall(table.id, table.numero)}
                          className="px-2.5 py-1 bg-red-500 hover:bg-red-400 text-white text-[10px] font-black uppercase rounded-lg shadow cursor-pointer active:scale-95 transition"
                        >
                          Atender
                        </button>
                      </div>
                    )}

                    {/* ALERTA: Cliente Pidiendo Cuenta */}
                    {isBillRequested && (
                      <div className="bg-amber-950/60 border border-brand-yellow/80 rounded-2xl p-3 flex items-center justify-between gap-2 animate-in fade-in">
                        <div className="text-xs">
                          <div className="flex items-center gap-1.5 font-black text-brand-yellow">
                            <Receipt className="w-4 h-4" />
                            <span>¡Pidiendo la cuenta!</span>
                          </div>
                          <span className="text-[10px] text-gray-300 font-bold block mt-0.5">
                            Medio: {table.metodoPagoCuenta || 'Efectivo'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAttendBill(table.id, table.numero)}
                          className="px-2.5 py-1 bg-brand-yellow hover:bg-yellow-400 text-black text-[10px] font-black uppercase rounded-lg shadow cursor-pointer active:scale-95 transition"
                        >
                          Atender
                        </button>
                      </div>
                    )}

                    {/* Estado del Consumo si está ocupada */}
                    {isOccupied ? (
                      <div className="bg-[#181818] border border-[#2a2a2a] rounded-2xl p-3 space-y-1.5 text-xs">
                        <div className="flex justify-between items-baseline">
                          <span className="text-gray-400 text-[11px] font-bold">Total Acumulado:</span>
                          <span className="text-brand-yellow font-black text-sm font-display">
                            {formatCOP(tableTotal)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-gray-400">
                          <span>{itemsCount} productos servidos</span>
                          <span>{activeOrders.length} comanda(s)</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#161616] border border-[#222] rounded-2xl py-3 text-center text-xs text-emerald-400 font-bold">
                        ✓ Mesa limpia y disponible
                      </div>
                    )}
                  </div>

                  {/* Acciones Táctiles de la Mesa */}
                  <div className="space-y-2 pt-1 border-t border-[#1e1e1e]">
                    <button
                      type="button"
                      onClick={() => handleOpenComandero(table)}
                      className="w-full py-2.5 bg-brand-yellow hover:bg-yellow-400 active:scale-98 text-black font-black text-xs uppercase tracking-wider rounded-xl transition shadow-glow flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>{isOccupied ? 'Añadir a Comanda' : 'Tomar Pedido'}</span>
                    </button>

                    {isOccupied && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenSplitBill(table)}
                          className="py-2 bg-[#222] hover:bg-[#2e2e2e] text-brand-yellow border border-brand-yellow/30 font-black text-[11px] uppercase rounded-xl transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                          title="Dividir cuenta por platos o partes iguales"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Dividir / Cobrar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReleaseTable(table.id, table.numero)}
                          className="py-2 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-700/40 font-black text-[11px] uppercase rounded-xl transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                          title="Liberar mesa tras pagar"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Liberar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* ======================================================== */}
      {/* VISTA 2: COMANDERO TÁCTIL (TOMA DE PEDIDOS) */}
      {/* ======================================================== */}
      {currentView === 'comanda' && selectedTable && (
        <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4 animate-in fade-in">
          {/* Barra Superior del Comandero */}
          <div className="flex items-center justify-between gap-3 bg-[#121212] border border-[#252525] p-3 sm:p-4 rounded-2xl">
            <button
              type="button"
              onClick={() => setCurrentView('mesas')}
              className="flex items-center gap-1 px-3 py-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-300 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Volver a Mesas</span>
            </button>

            <div className="text-center">
              <h2 className="text-base sm:text-lg font-black uppercase text-brand-yellow font-display">
                Comanda: {selectedTable.numero}
              </h2>
              <p className="text-[10px] text-gray-400 font-bold">
                {selectedTable.ubicacion || 'Salón Principal'}
              </p>
            </div>

            <div className="w-24 text-right">
              <span className="text-xs font-black text-white font-display">
                {formatCOP(comandaTotal)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Columna Izquierda: Menú de Platos (8 cols en desktop) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-3">
              {/* Buscador de Platos */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar plato, hamburguesa, bebida, carne..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="w-full bg-[#161616] border border-[#2b2b2b] focus:border-brand-yellow text-white text-xs rounded-2xl pl-10 pr-9 py-3 outline-none transition"
                />
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                {searchProduct && (
                  <button
                    type="button"
                    onClick={() => setSearchProduct('')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Categorías Rápidas */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('todas')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === 'todas'
                      ? 'bg-brand-yellow text-black shadow-glow'
                      : 'bg-[#181818] text-gray-400 border border-[#282828] hover:text-white'
                  }`}
                >
                  Todas
                </button>
                {categories
                  .filter((c) => !c.parentId && c.activo !== false)
                  .map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition cursor-pointer ${
                        selectedCategory === cat.slug
                          ? 'bg-brand-yellow text-black shadow-glow'
                          : 'bg-[#181818] text-gray-400 border border-[#282828] hover:text-white'
                      }`}
                    >
                      {cat.nombre}
                    </button>
                  ))}
              </div>

              {/* Cuadrícula de Platos */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                {filteredProducts.map((prod) => {
                  const isOutOfStock =
                    prod.disponibilidad === false ||
                    (prod.controlarStock && (prod.stock ?? 0) <= 0);
                  const isLowStock =
                    prod.controlarStock &&
                    prod.stock !== null &&
                    prod.stock !== undefined &&
                    prod.stock > 0 &&
                    prod.stock <= (prod.stockMinimo ?? 5);

                  return (
                    <button
                      key={prod.id}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => handleAddItemToComanda(prod)}
                      className={`bg-[#141414] border rounded-2xl p-2.5 text-left flex flex-col justify-between transition-all group relative overflow-hidden active:scale-95 cursor-pointer ${
                        isOutOfStock
                          ? 'opacity-40 border-red-900/50 cursor-not-allowed'
                          : 'border-[#262626] hover:border-brand-yellow/60 hover:shadow-lg'
                      }`}
                    >
                      <div className="space-y-1.5 w-full">
                        <div className="relative w-full h-24 rounded-xl overflow-hidden bg-[#202020]">
                          <Image
                            src={prod.imagen}
                            alt={prod.nombre}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                          {prod.etiqueta && (
                            <span className="absolute top-1 left-1 bg-brand-yellow text-black text-[9px] font-black uppercase px-1.5 py-0.2 rounded shadow">
                              {prod.etiqueta}
                            </span>
                          )}
                          {isOutOfStock ? (
                            <span className="absolute inset-0 bg-black/80 flex items-center justify-center text-red-400 font-black text-xs uppercase tracking-wider">
                              Agotado
                            </span>
                          ) : isLowStock ? (
                            <span className="absolute bottom-1 right-1 bg-amber-500/90 text-black text-[9px] font-black px-1.5 py-0.2 rounded shadow">
                              Quedan {prod.stock}
                            </span>
                          ) : prod.controlarStock && prod.stock !== null ? (
                            <span className="absolute bottom-1 right-1 bg-black/75 text-emerald-400 text-[9px] font-black px-1.5 py-0.2 rounded border border-emerald-500/40">
                              Stock: {prod.stock}
                            </span>
                          ) : null}
                        </div>

                        <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-brand-yellow transition-colors">
                          {prod.nombre}
                        </h4>
                        <p className="text-[10px] text-gray-400 line-clamp-1">
                          {prod.descripcion || prod.categoriaNombre}
                        </p>
                      </div>

                      <div className="pt-2 mt-1 border-t border-[#222] flex items-center justify-between w-full">
                        <span className="text-xs font-black text-brand-yellow font-display">
                          {formatCOP(prod.precio)}
                        </span>
                        <span className="w-6 h-6 rounded-lg bg-brand-yellow/15 group-hover:bg-brand-yellow text-brand-yellow group-hover:text-black flex items-center justify-center font-black text-xs transition-colors">
                          +
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Columna Derecha: Canasta / Bandeja de la Comanda (4-5 cols) */}
            <div className="lg:col-span-5 xl:col-span-4 bg-[#121212] border border-[#262626] rounded-3xl p-4 sm:p-5 space-y-4 shadow-2xl sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-[#222]">
                <div className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-brand-yellow" />
                  <h3 className="text-sm font-black uppercase text-white font-display">
                    NUEVA COMANDA ({comandaItems.reduce((s, i) => s + i.cantidad, 0)})
                  </h3>
                </div>
                {comandaItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setComandaItems([])}
                    className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase transition"
                  >
                    Vaciar
                  </button>
                )}
              </div>

              {/* Nombre del Cliente en la Mesa */}
              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">
                  Nombre del Comensal (Opcional):
                </label>
                <input
                  type="text"
                  placeholder={`Ej: Juan / Comensal ${selectedTable.numero}`}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2d2d2d] focus:border-brand-yellow text-white text-xs rounded-xl px-3 py-2 outline-none"
                />
              </div>

              {/* Lista de Ítems */}
              <div className="space-y-2.5 max-h-[35vh] overflow-y-auto pr-1">
                {comandaItems.length === 0 ? (
                  <div className="py-8 text-center text-gray-500 text-xs space-y-1">
                    <UtensilsCrossed className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                    <p className="font-bold">No hay platos agregados</p>
                    <p className="text-[10px] text-gray-500">Toca los platos a la izquierda para sumarlos</p>
                  </div>
                ) : (
                  comandaItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="bg-[#181818] border border-[#282828] rounded-2xl p-2.5 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h5 className="text-xs font-bold text-white">{item.product.nombre}</h5>
                          <span className="text-[11px] font-black text-brand-yellow font-display">
                            {formatCOP(item.product.precio * item.cantidad)}
                          </span>
                        </div>

                        {/* Cantidad +/- */}
                        <div className="flex items-center gap-1 bg-[#222] rounded-xl p-1 border border-[#333]">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(item.product.id, -1)}
                            className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-white rounded-lg active:scale-90"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-black text-white">
                            {item.cantidad}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(item.product.id, 1)}
                            className="w-6 h-6 flex items-center justify-center text-brand-yellow hover:text-yellow-400 rounded-lg active:scale-90"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Nota de Cocina */}
                      <input
                        type="text"
                        placeholder="Nota cocina: sin cebolla, término 3/4..."
                        value={item.notas}
                        onChange={(e) => handleUpdateItemNotes(item.product.id, e.target.value)}
                        className="w-full bg-[#121212] border border-[#303030] text-[11px] text-gray-300 rounded-lg px-2.5 py-1.5 focus:border-brand-yellow outline-none"
                      />
                    </div>
                  ))
                )}
              </div>

              {/* Resumen de Totales y Propina */}
              <div className="space-y-2 pt-2 border-t border-[#222] text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal:</span>
                  <span className="font-bold text-white">{formatCOP(comandaSubtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-gray-400">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeTip}
                      onChange={(e) => setIncludeTip(e.target.checked)}
                      className="accent-brand-yellow w-3.5 h-3.5"
                    />
                    <span className="text-[11px] font-bold">Propina sugerida (10%):</span>
                  </label>
                  <span className="font-bold text-brand-orange">{formatCOP(comandaPropina)}</span>
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t border-[#222]">
                  <span className="text-sm font-black uppercase text-white font-display">Total:</span>
                  <span className="text-lg font-black text-brand-yellow font-display">
                    {formatCOP(comandaTotal)}
                  </span>
                </div>
              </div>

              {/* Botón de Enviar a Cocina */}
              <button
                type="button"
                disabled={comandaItems.length === 0 || isSubmitting}
                onClick={handleSubmitComandaToKitchen}
                className="w-full py-3.5 bg-brand-yellow hover:bg-yellow-400 disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-glow transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ChefHat className="w-4 h-4 stroke-[2.5]" />
                <span>{isSubmitting ? 'Enviando a Cocina...' : '🚀 Enviar Comanda a Cocina'}</span>
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ======================================================== */}
      {/* VISTA 3: DIVISIÓN DE CUENTAS (SPLIT BILL) */}
      {/* ======================================================== */}
      {currentView === 'dividir' && selectedTable && (
        <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-5 animate-in fade-in">
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#121212] border border-[#252525] p-4 sm:p-5 rounded-3xl">
            <div>
              <button
                type="button"
                onClick={() => setCurrentView('mesas')}
                className="inline-flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-white mb-1.5 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Volver al Salón</span>
              </button>
              <h2 className="text-lg font-black uppercase text-white font-display flex items-center gap-2">
                <Receipt className="w-5 h-5 text-brand-yellow" />
                <span>DIVIDIR CUENTA: {selectedTable.numero}</span>
              </h2>
              <p className="text-xs text-gray-400">
                Separa los consumos por persona o divide el total en partes iguales con tickets POS individuales.
              </p>
            </div>

            {/* Selector de Modo de División */}
            <div className="flex items-center gap-1.5 bg-[#1a1a1a] p-1 rounded-2xl border border-[#333]">
              <button
                type="button"
                onClick={() => setSplitMode('items')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase transition ${
                  splitMode === 'items'
                    ? 'bg-brand-yellow text-black shadow-glow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Por Platos / Ítems
              </button>
              <button
                type="button"
                onClick={() => setSplitMode('equal')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase transition ${
                  splitMode === 'equal'
                    ? 'bg-brand-yellow text-black shadow-glow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Partes Iguales
              </button>
            </div>
          </div>

          {/* MODO 1: POR PLATOS / ÍTEMS */}
          {splitMode === 'items' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-gray-300 tracking-wider">
                  Comensales y Subcuentas ({diners.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddDiner}
                  className="px-3 py-1.5 bg-[#1c1c1c] hover:bg-[#282828] text-brand-yellow border border-brand-yellow/30 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar Comensal</span>
                </button>
              </div>

              {/* Tarjetas de cada Comensal */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {diners.map((diner) => {
                  const sub = diner.items.reduce((s, i) => s + i.precio * i.cantidad, 0);
                  const total = sub + diner.propina;

                  return (
                    <div
                      key={diner.id}
                      className={`bg-[#121212] border-2 rounded-3xl p-4 space-y-3.5 flex flex-col justify-between shadow-xl ${
                        diner.pagado ? 'border-emerald-600/70 bg-emerald-950/10' : 'border-[#282828]'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-[#222]">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-brand-yellow" />
                            <input
                              type="text"
                              value={diner.nombre}
                              onChange={(e) => {
                                const newName = e.target.value;
                                setDiners((prev) =>
                                  prev.map((d) => (d.id === diner.id ? { ...d, nombre: newName } : d))
                                );
                              }}
                              className="bg-transparent text-sm font-black text-white font-display border-b border-dashed border-gray-600 focus:border-brand-yellow outline-none px-1 w-28 sm:w-32"
                            />
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                diner.pagado
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {diner.pagado ? '✓ Pagado' : 'Pendiente'}
                            </span>

                            {diners.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveDiner(diner.id)}
                                className="p-1 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/20 transition cursor-pointer"
                                title="Quitar este comensal de la cuenta"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Botón Rápido: Uno solo paga la cuenta completa */}
                        {diners.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleAssignAllToDiner(diner.id)}
                            className="w-full py-1.5 px-2 bg-[#1a1a1a] hover:bg-[#252525] text-amber-300 hover:text-brand-yellow border border-amber-500/30 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                            title="Mueve todos los consumos de la mesa a este comensal para que pague toda la cuenta"
                          >
                            <Sparkles className="w-3 h-3 text-brand-yellow" />
                            <span>⚡ Pagar toda la cuenta aquí</span>
                          </button>
                        )}

                        {/* Ítems asignados a este comensal */}
                        <div className="space-y-2 min-h-[100px] max-h-[220px] overflow-y-auto pr-1">
                          {diner.items.length === 0 ? (
                            <p className="text-[11px] text-gray-500 text-center py-4 italic">
                              Sin platos asignados. Pasa platos desde otro comensal.
                            </p>
                          ) : (
                            diner.items.map((item, itIdx) => (
                              <div
                                key={itIdx}
                                className="bg-[#181818] border border-[#262626] rounded-xl p-2 flex items-center justify-between gap-2 text-xs"
                              >
                                <div className="flex-1">
                                  <p className="font-bold text-white line-clamp-1">{item.nombre}</p>
                                  <span className="text-[10px] text-brand-yellow font-display">
                                    {item.cantidad}x {formatCOP(item.precio)} = {formatCOP(item.precio * item.cantidad)}
                                  </span>
                                </div>

                                {/* Menú para transferir ítem a otro comensal */}
                                {diners.length > 1 && (
                                  <select
                                    aria-label="Mover plato a otro comensal"
                                    value=""
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        handleMoveItemToDiner(diner.id, e.target.value, itIdx);
                                      }
                                    }}
                                    className="bg-[#242424] text-gray-300 text-[10px] rounded-lg px-1.5 py-1 border border-[#3a3a3a] outline-none"
                                  >
                                    <option value="">Mover a...</option>
                                    {diners
                                      .filter((d) => d.id !== diner.id)
                                      .map((target) => (
                                        <option key={target.id} value={target.id}>
                                          {target.nombre}
                                        </option>
                                      ))}
                                  </select>
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        {/* Medio de Pago */}
                        <div>
                          <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">
                            Método de Pago:
                          </label>
                          <select
                            value={diner.metodoPago}
                            onChange={(e) => {
                              const method = e.target.value;
                              setDiners((prev) =>
                                prev.map((d) => (d.id === diner.id ? { ...d, metodoPago: method } : d))
                              );
                            }}
                            className="w-full bg-[#181818] border border-[#2d2d2d] text-gray-200 text-xs rounded-xl px-2.5 py-1.5 outline-none font-bold"
                          >
                            <option value="Efectivo">💵 Efectivo</option>
                            <option value="Nequi / Daviplata / Transferencia">📱 Nequi / Daviplata / Transferencia</option>
                            <option value="Datáfono (Tarjeta)">💳 Datáfono (Tarjeta)</option>
                          </select>
                        </div>
                      </div>

                      {/* Totales y Acciones del Comensal */}
                      <div className="space-y-2 pt-2 border-t border-[#222] text-xs">
                        <div className="flex justify-between text-gray-400 text-[11px]">
                          <span>Subtotal:</span>
                          <span className="font-bold text-white">{formatCOP(sub)}</span>
                        </div>
                        <div className="flex justify-between text-gray-400 text-[11px]">
                          <span>Propina:</span>
                          <span className="font-bold text-brand-orange">{formatCOP(diner.propina)}</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-1 border-t border-[#222]">
                          <span className="text-xs font-black uppercase text-white">Total a Pagar:</span>
                          <span className="text-base font-black text-brand-yellow font-display">
                            {formatCOP(total)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setDiners((prev) =>
                                prev.map((d) => (d.id === diner.id ? { ...d, pagado: !d.pagado } : d))
                              );
                            }}
                            className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                              diner.pagado
                                ? 'bg-[#222] text-gray-400 border border-[#333]'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                            }`}
                          >
                            {diner.pagado ? 'Desmarcar' : 'Cobrar ✓'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePrintDinerReceipt(diner)}
                            className="py-2 bg-brand-yellow hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1 shadow-glow"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Ticket</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botón Final: Liberar Mesa cuando todos pagaron */}
              <div className="bg-[#141414] border border-[#282828] rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-white uppercase">¿Cuentas liquidadas?</h4>
                  <p className="text-xs text-gray-400">
                    {diners.every((d) => d.pagado)
                      ? '✓ Todos los comensales han cancelado su cuenta. Puedes liberar la mesa.'
                      : 'Quedan comensales pendientes de pago en esta mesa.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLiquidateSplitBill}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition active:scale-95 flex items-center gap-2 cursor-pointer shadow-glow"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Liquidar y Emitir {diners.length} Facturas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReleaseTable(selectedTable.id, selectedTable.numero)}
                    className="px-4 py-3 bg-[#222] hover:bg-[#333] text-gray-300 font-bold text-xs uppercase rounded-2xl border border-[#333] transition cursor-pointer"
                  >
                    Solo Liberar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODO 2: PARTES IGUALES */}
          {splitMode === 'equal' && (
            <div className="bg-[#121212] border border-[#252525] rounded-3xl p-6 space-y-6 max-w-2xl mx-auto shadow-2xl">
              <div className="text-center space-y-1">
                <h3 className="text-base font-black uppercase text-white font-display">
                  Dividir Total en Partes Iguales
                </h3>
                <p className="text-xs text-gray-400">
                  Calcula el valor exacto por persona e imprime tickets individuales para cada comensal.
                </p>
              </div>

              {/* Selector de Personas */}
              <div className="bg-[#181818] border border-[#2a2a2a] rounded-2xl p-4 space-y-3 text-center">
                <label className="text-xs font-bold uppercase text-gray-300 block">
                  ¿Entre cuántas personas se divide la cuenta?
                </label>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEqualPersons(Math.max(2, equalPersons - 1))}
                    className="w-10 h-10 rounded-xl bg-[#222] hover:bg-[#333] text-white flex items-center justify-center font-black active:scale-90"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-2xl font-black text-brand-yellow font-display w-12">
                    {equalPersons}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEqualPersons(equalPersons + 1)}
                    className="w-10 h-10 rounded-xl bg-[#222] hover:bg-[#333] text-white flex items-center justify-center font-black active:scale-90"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Detalle del Cálculo */}
              {(() => {
                const totalTable = (selectedTable.orders || []).reduce((s, o) => s + o.total, 0);
                const subtotalTable = (selectedTable.orders || []).reduce((s, o) => s + o.subtotal, 0);
                const eachSubtotal = Math.round(subtotalTable / equalPersons);
                const eachTip = Math.round((eachSubtotal * equalTipPercent) / 100);
                const eachTotal = eachSubtotal + eachTip;

                return (
                  <div className="space-y-4">
                    <div className="bg-[#181818] border border-[#282828] rounded-2xl p-4 space-y-2 text-xs">
                      <div className="flex justify-between text-gray-400">
                        <span>Total de la Mesa:</span>
                        <span className="font-bold text-white">{formatCOP(totalTable)}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Subtotal por Persona:</span>
                        <span className="font-bold text-white">{formatCOP(eachSubtotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Propina por Persona ({equalTipPercent}%):</span>
                        <span className="font-bold text-brand-orange">{formatCOP(eachTip)}</span>
                      </div>
                      <div className="flex justify-between items-baseline pt-2 border-t border-[#333]">
                        <span className="text-sm font-black uppercase text-white font-display">
                          Paga Cada Persona:
                        </span>
                        <span className="text-xl font-black text-brand-yellow font-display">
                          {formatCOP(eachTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Botones para imprimir tickets por comensal */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase text-gray-400 block">
                        Imprimir Tickets de Cobro Individual:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {Array.from({ length: equalPersons }).map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handlePrintEqualReceipt(idx)}
                            className="py-2.5 px-3 bg-[#1e1e1e] hover:bg-[#282828] text-white border border-[#333] hover:border-brand-yellow rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                          >
                            <Printer className="w-3.5 h-3.5 text-brand-yellow" />
                            <span>Persona #{idx + 1} ({formatCOP(eachTotal)})</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Liquidar y Emitir Facturas */}
                    <button
                      type="button"
                      onClick={handleLiquidateSplitBill}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-glow"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Liquidar y Emitir {equalPersons} Facturas Divididas</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
        </main>
      )}

      {/* Modal de Impresión Térmica POS */}
      <ThermalReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        order={receiptOrder}
        ticketType="factura"
      />
    </div>
  );
}
