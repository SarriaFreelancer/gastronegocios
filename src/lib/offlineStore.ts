/**
 * GastroPOS - Offline-First Local Store (IndexedDB)
 * Permite a meseros, cocinas y clientes operar 100% sin conexión a internet.
 * Guarda el menú localmente y almacena pedidos en cola cuando no hay red,
 * sincronizándolos automáticamente en segundo plano al restablecer la conexión.
 */

const DB_NAME = 'GastroPosOfflineDB';
const DB_VERSION = 1;
const ORDERS_STORE = 'offline_orders';
const MENU_STORE = 'menu_cache';

export interface OfflineOrder {
  id: string; // ID temporal: e.g. "offline_1731000000_abc"
  codigo: string; // e.g. "OFF-4921"
  orderPayload: any;
  createdAt: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  lastError?: string;
}

let dbInstance: IDBDatabase | null = null;

export function openOfflineDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.reject(new Error('IndexedDB no está disponible en este entorno'));
  }

  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Almacén de pedidos creados fuera de línea
      if (!db.objectStoreNames.contains(ORDERS_STORE)) {
        const orderStore = db.createObjectStore(ORDERS_STORE, { keyPath: 'id' });
        orderStore.createIndex('status', 'status', { unique: false });
        orderStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Almacén de caché del menú, categorías y mesas por restaurante
      if (!db.objectStoreNames.contains(MENU_STORE)) {
        db.createObjectStore(MENU_STORE, { keyPath: 'slug' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('Error al abrir GastroPosOfflineDB:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

// =========================================================================
// 1. GESTIÓN DE CACHÉ DE MENÚ / PRODUCTOS / MESAS EN DISPOSITIVO LOCAL
// =========================================================================

export async function saveMenuCache(slug: string, data: { products: any[]; categories: any[]; tables?: any[] }): Promise<void> {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction(MENU_STORE, 'readwrite');
    const store = tx.objectStore(MENU_STORE);

    store.put({
      slug,
      products: data.products || [],
      categories: data.categories || [],
      tables: data.tables || [],
      cachedAt: new Date().toISOString(),
    });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('No se pudo guardar la caché del menú offline:', err);
  }
}

export async function getMenuCache(slug: string): Promise<any | null> {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction(MENU_STORE, 'readonly');
    const store = tx.objectStore(MENU_STORE);
    const request = store.get(slug);

    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
}

// =========================================================================
// 2. COLA DE PEDIDOS FUERA DE LÍNEA (OUTBOX QUEUE)
// =========================================================================

export async function enqueueOfflineOrder(orderPayload: any): Promise<OfflineOrder> {
  const db = await openOfflineDB();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const tempId = `offline_${Date.now()}_${randomSuffix}`;
  const tempCodigo = `OFF-${randomSuffix}`;

  const offlineRecord: OfflineOrder = {
    id: tempId,
    codigo: tempCodigo,
    orderPayload: {
      ...orderPayload,
      codigoTemporal: tempCodigo,
      isOfflineOrder: true,
    },
    createdAt: new Date().toISOString(),
    status: 'pending',
    retryCount: 0,
  };

  const tx = db.transaction(ORDERS_STORE, 'readwrite');
  const store = tx.objectStore(ORDERS_STORE);
  store.add(offlineRecord);

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  return offlineRecord;
}

export async function getPendingOfflineOrders(): Promise<OfflineOrder[]> {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction(ORDERS_STORE, 'readonly');
    const store = tx.objectStore(ORDERS_STORE);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const all: OfflineOrder[] = request.result || [];
        resolve(all.filter((o) => o.status === 'pending' || o.status === 'failed'));
      };
      request.onerror = () => resolve([]);
    });
  } catch (err) {
    return [];
  }
}

export async function removeOfflineOrder(id: string): Promise<void> {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction(ORDERS_STORE, 'readwrite');
    const store = tx.objectStore(ORDERS_STORE);
    store.delete(id);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Error al eliminar pedido offline sincronizado:', err);
  }
}

// =========================================================================
// 3. SINCRONIZADOR AUTOMÁTICO EN SEGUNDO PLANO
// =========================================================================

export async function syncPendingOfflineOrders(
  onProgress?: (synced: number, total: number, lastOrder?: any) => void
): Promise<{ success: boolean; syncedCount: number; errors: any[] }> {
  if (typeof window === 'undefined' || !navigator.onLine) {
    return { success: false, syncedCount: 0, errors: ['Sin conexión a internet'] };
  }

  const pending = await getPendingOfflineOrders();
  if (pending.length === 0) {
    return { success: true, syncedCount: 0, errors: [] };
  }

  let syncedCount = 0;
  const errors: any[] = [];

  for (let i = 0; i < pending.length; i++) {
    const record = pending[i];

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record.orderPayload),
      });

      if (res.ok) {
        const createdServerOrder = await res.json();
        // Eliminar de la cola local tras éxito
        await removeOfflineOrder(record.id);
        syncedCount++;

        if (onProgress) {
          onProgress(syncedCount, pending.length, createdServerOrder);
        }
      } else {
        const errorText = await res.text();
        errors.push({ id: record.id, error: errorText });
      }
    } catch (netErr: any) {
      errors.push({ id: record.id, error: netErr?.message || 'Error de red' });
      // Si la red se cayó a mitad de sincronización, detener bucle
      break;
    }
  }

  return {
    success: syncedCount > 0 && errors.length === 0,
    syncedCount,
    errors,
  };
}
