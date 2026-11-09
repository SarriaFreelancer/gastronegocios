/**
 * End-to-End (E2E) Order Lifecycle & Cross-Tenant Isolation Test Suite
 * Tests the complete flow from customer placement to kitchen fulfillment,
 * while verifying strict tenant isolation at each step.
 * 
 * Run with: npm run test:e2e
 * or: node --test tests/e2e-order-flow.test.js
 */

const { test, describe, after } = require('node:test');
const assert = require('node:assert');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('E2E Order Flow & Cross-Tenant Isolation Test', () => {
  let createdOrderId = null;
  let createdOrderCode = null;
  let chosenProduct = null;

  after(async () => {
    // Teardown: ensure test order is cancelled so it does not pollute store metrics
    if (createdOrderId) {
      try {
        await fetch(`${BASE_URL}/api/orders/${createdOrderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: 'Cancelado' }),
        });
      } catch (err) {
        console.warn('Failed to clean up test order:', err);
      }
    }
  });

  test('Step 1: Customer queries Salchi Ricurras menu and chooses a product', async () => {
    const res = await fetch(`${BASE_URL}/api/products?restaurantSlug=salchiricurras`);
    assert.strictEqual(res.status, 200, 'Menu request should return HTTP 200');
    const products = await res.json();
    assert.ok(Array.isArray(products) && products.length > 0, 'Salchi Ricurras must have products');

    chosenProduct = products.find(p => p.disponibilidad !== false) || products[0];
    assert.ok(chosenProduct, 'Should have an available product');
    assert.strictEqual(chosenProduct.restaurantId, 2, 'Product must belong to Salchi Ricurras (tenant 2)');
  });

  test('Step 2: Customer places an order for Salchi Ricurras', async () => {
    const orderPayload = {
      cliente: 'Juan E2E Tester',
      telefono: '3109998877',
      tipo: 'domicilio',
      direccion: 'Carrera 15 # 20-30',
      barrio: 'Granada',
      subtotal: chosenProduct.precio,
      propina: 0,
      costoEnvio: 3000,
      total: chosenProduct.precio + 3000,
      metodoPago: 'Nequi',
      notasCliente: 'Prueba Automatizada E2E - Timbrar fuerte',
      restaurantSlug: 'salchiricurras',
      items: [
        {
          productoId: chosenProduct.id,
          nombre: chosenProduct.nombre,
          precio: chosenProduct.precio,
          cantidad: 1,
          subtotal: chosenProduct.precio,
          notas: 'Sin cebolla',
        },
      ],
    };

    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });

    assert.strictEqual(res.status, 201, 'Order placement should return HTTP 201 Created');
    const data = await res.json();

    assert.ok(data.id, 'Created order must have an id');
    assert.ok(data.codigo, 'Created order must have a unique code');
    assert.strictEqual(data.restaurantId, 2, 'Order must belong to tenant 2');
    assert.strictEqual(data.estado, 'Pendiente', 'Initial status must be Pendiente');

    createdOrderId = data.id;
    createdOrderCode = data.codigo;
  });

  test('Step 3: Salchi Ricurras kitchen receives the new order in real-time view', async () => {
    assert.ok(createdOrderId, 'Order must be created in step 2');

    const res = await fetch(`${BASE_URL}/api/orders?restaurantSlug=salchiricurras&soloCocina=true`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    const orders = Array.isArray(data) ? data : data.orders || [];

    const found = orders.some(o => o.id === createdOrderId || o.codigo === createdOrderCode);
    assert.ok(found, `Order ${createdOrderCode} must appear in Salchi Ricurras kitchen display`);
  });

  test('Step 4: CRITICAL ISOLATION - Punto G kitchen NEVER sees the Salchi Ricurras order', async () => {
    assert.ok(createdOrderId, 'Order must be created in step 2');

    const res = await fetch(`${BASE_URL}/api/orders?restaurantSlug=punto-g&soloCocina=true`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    const orders = Array.isArray(data) ? data : data.orders || [];

    const foundInPuntoG = orders.some(o => o.id === createdOrderId || o.codigo === createdOrderCode);
    assert.strictEqual(
      foundInPuntoG,
      false,
      `SECURITY LEAK: Order ${createdOrderCode} from Salchi Ricurras appeared in Punto G kitchen!`
    );
  });

  test('Step 5: Kitchen advances order status to "En preparación"', async () => {
    assert.ok(createdOrderId, 'Order must be created in step 2');

    const res = await fetch(`${BASE_URL}/api/orders/${createdOrderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'En preparación' }),
    });

    assert.strictEqual(res.status, 200, 'Status update to En preparación should succeed');
    const updated = await res.json();
    assert.strictEqual(updated.estado, 'En preparación');
  });

  test('Step 6: Kitchen marks order as "Listo" and customer tracking reflects it', async () => {
    assert.ok(createdOrderId, 'Order must be created in step 2');

    const resUpdate = await fetch(`${BASE_URL}/api/orders/${createdOrderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'Listo' }),
    });
    assert.strictEqual(resUpdate.status, 200);

    // Customer tracks order by code or id
    const resTracking = await fetch(`${BASE_URL}/api/orders/${createdOrderCode}`);
    assert.strictEqual(resTracking.status, 200);
    const trackingData = await resTracking.json();

    assert.strictEqual(trackingData.estado, 'Listo', 'Customer tracking must show Listo');
    assert.strictEqual(trackingData.restaurantId, 2, 'Tracking data retains tenant boundary');
  });

  test('Step 7: Order status reaches terminal state and inventory/history persists cleanly', async () => {
    assert.ok(createdOrderId, 'Order must be created in step 2');

    const resCancel = await fetch(`${BASE_URL}/api/orders/${createdOrderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'Cancelado' }),
    });
    assert.strictEqual(resCancel.status, 200);
    const finalOrder = await resCancel.json();
    assert.strictEqual(finalOrder.estado, 'Cancelado');

    // Reset so after() hook does not re-cancel
    createdOrderId = null;
  });
});
