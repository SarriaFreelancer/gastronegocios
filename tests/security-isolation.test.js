/**
 * Security & Multi-Tenant Data Isolation Test Suite
 * Evaluates tenant isolation and security boundaries across restaurants.
 * 
 * Run with: npm run test:security
 * or: node --test tests/security-isolation.test.js
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Security & Multi-Tenant Isolation Suite', () => {

  describe('1. Product Catalog Tenant Isolation', () => {
    test('Punto G (tenant 1) and Salchi Ricurras (tenant 2) have completely isolated products', async () => {
      const resPuntoG = await fetch(`${BASE_URL}/api/products?restaurantSlug=punto-g`);
      assert.strictEqual(resPuntoG.status, 200, 'Punto G products endpoint should respond 200');
      const productsPuntoG = await resPuntoG.json();
      assert.ok(Array.isArray(productsPuntoG), 'Expected array of products');
      assert.ok(productsPuntoG.length > 0, 'Punto G should have products');

      // Verify every product in Punto G belongs to restaurantId 1
      for (const p of productsPuntoG) {
        assert.strictEqual(
          p.restaurantId,
          1,
          `Product ${p.id} (${p.nombre}) belongs to restaurantId ${p.restaurantId}, expected 1`
        );
      }

      const resSalchi = await fetch(`${BASE_URL}/api/products?restaurantSlug=salchiricurras`);
      assert.strictEqual(resSalchi.status, 200, 'Salchi Ricurras products endpoint should respond 200');
      const productsSalchi = await resSalchi.json();
      assert.ok(Array.isArray(productsSalchi), 'Expected array of products');
      assert.ok(productsSalchi.length > 0, 'Salchi Ricurras should have products');

      // Verify every product in Salchi Ricurras belongs to restaurantId 2
      for (const p of productsSalchi) {
        assert.strictEqual(
          p.restaurantId,
          2,
          `Product ${p.id} (${p.nombre}) belongs to restaurantId ${p.restaurantId}, expected 2`
        );
      }

      // Assert ZERO overlap between product IDs
      const puntoGIds = new Set(productsPuntoG.map(p => p.id));
      for (const p of productsSalchi) {
        assert.ok(
          !puntoGIds.has(p.id),
          `CRITICAL LEAK: Salchi Ricurras product ${p.id} (${p.nombre}) exists in Punto G!`
        );
      }
    });

    test('Header-based tenant resolution (x-restaurant-slug) enforces product isolation', async () => {
      const res = await fetch(`${BASE_URL}/api/products`, {
        headers: { 'x-restaurant-slug': 'salchiricurras' }
      });
      assert.strictEqual(res.status, 200);
      const products = await res.json();
      assert.ok(products.length > 0);
      for (const p of products) {
        assert.strictEqual(p.restaurantId, 2, 'Header-scoped products must belong to restaurantId 2');
      }
    });
  });

  describe('2. Order & Kitchen Tenant Isolation', () => {
    test('Orders for Salchi Ricurras do not contain Punto G orders', async () => {
      const resSalchi = await fetch(`${BASE_URL}/api/orders?restaurantSlug=salchiricurras`);
      assert.strictEqual(resSalchi.status, 200);
      const dataSalchi = await resSalchi.json();
      assert.ok(dataSalchi.orders, 'Expected orders property');

      for (const order of dataSalchi.orders) {
        assert.strictEqual(
          order.restaurantId,
          2,
          `CRITICAL LEAK: Order ${order.codigo} has restaurantId ${order.restaurantId}, expected 2`
        );
      }
    });

    test('Kitchen orders (soloCocina=true) are strictly scoped to the tenant', async () => {
      const resSalchiCocina = await fetch(`${BASE_URL}/api/orders?restaurantSlug=salchiricurras&soloCocina=true`);
      assert.strictEqual(resSalchiCocina.status, 200);
      const cocinaSalchi = await resSalchiCocina.json();

      const ordersList = Array.isArray(cocinaSalchi) ? cocinaSalchi : cocinaSalchi.orders || [];
      for (const o of ordersList) {
        assert.strictEqual(
          o.restaurantId,
          2,
          `Kitchen order ${o.codigo} leaked from restaurant ${o.restaurantId} into Salchi Ricurras kitchen!`
        );
      }
    });

    test('Financial sales metrics are strictly isolated between tenants', async () => {
      const [res1, res2] = await Promise.all([
        fetch(`${BASE_URL}/api/orders?restaurantSlug=punto-g`),
        fetch(`${BASE_URL}/api/orders?restaurantSlug=salchiricurras`),
      ]);

      const data1 = await res1.json();
      const data2 = await res2.json();

      assert.ok(data1.metrics, 'Punto G metrics should be present');
      assert.ok(data2.metrics, 'Salchi Ricurras metrics should be present');

      // Metric calculations must reflect each restaurant's individual orders, not aggregate total
      assert.notStrictEqual(
        data1.metrics.totalVentas,
        data2.metrics.totalVentas,
        'Metrics totalVentas should not be equal across distinct restaurants'
      );
      assert.strictEqual(
        data2.metrics.totalPedidos,
        data2.orders.length,
        'Salchi Ricurras order count must equal its metrics count'
      );
    });
  });

  describe('3. Tables & Cash Shifts Isolation', () => {
    test('Table layouts are scoped by restaurant and do not cross tenants', async () => {
      const resPuntoG = await fetch(`${BASE_URL}/api/tables?restaurantSlug=punto-g`);
      const resSalchi = await fetch(`${BASE_URL}/api/tables?restaurantSlug=salchiricurras`);

      assert.strictEqual(resPuntoG.status, 200);
      assert.strictEqual(resSalchi.status, 200);

      const tablesPuntoG = await resPuntoG.json();
      const tablesSalchi = await resSalchi.json();

      assert.ok(Array.isArray(tablesPuntoG));
      assert.ok(Array.isArray(tablesSalchi));

      // Salchi Ricurras should not see Punto G's tables
      const puntoGTableIds = new Set(tablesPuntoG.map(t => t.id));
      for (const t of tablesSalchi) {
        assert.ok(
          !puntoGTableIds.has(t.id),
          `CRITICAL LEAK: Table ${t.numero} from Punto G leaked to Salchi Ricurras!`
        );
      }
    });

    test('Cash shift query resolves to the requested tenant without cross-talk', async () => {
      const res = await fetch(`${BASE_URL}/api/shifts?restaurantSlug=salchiricurras`);
      assert.strictEqual(res.status, 200);
      const shifts = await res.json();
      
      const list = Array.isArray(shifts) ? shifts : (shifts.shift ? [shifts.shift] : []);
      for (const s of list) {
        if (s.restaurantId) {
          assert.strictEqual(s.restaurantId, 2, 'Cash shift restaurantId must match requested tenant');
        }
      }
    });
  });

  describe('4. Security & Injection Resilience', () => {
    test('Resistant to SQL Injection payloads in search query', async () => {
      const sqlInjections = [
        "' OR '1'='1",
        "1; DROP TABLE Restaurant;--",
        "\" OR \"\"=\"",
        "admin'--",
      ];

      for (const payload of sqlInjections) {
        const url = `${BASE_URL}/api/products?restaurantSlug=punto-g&search=${encodeURIComponent(payload)}`;
        const res = await fetch(url);
        // Must never throw 500 internal server error or expose Prisma database traces
        assert.ok(
          [200, 400, 404].includes(res.status),
          `SQL Injection payload '${payload}' caused server error ${res.status}`
        );
      }
    });

    test('Non-existent or malicious tenant slug falls back securely without data leak', async () => {
      const res = await fetch(`${BASE_URL}/api/products?restaurantSlug=malicious-non-existent-tenant-xyz`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      // Must either return empty array or default to restaurant 1, never return ALL tenants
      if (Array.isArray(data)) {
        const restaurantIds = new Set(data.map(p => p.restaurantId));
        assert.ok(
          restaurantIds.size <= 1,
          'Malicious tenant request must never aggregate across multiple tenants'
        );
      }
    });

    test('Order notes handle XSS and script characters safely', async () => {
      const resProducts = await fetch(`${BASE_URL}/api/products?restaurantSlug=salchiricurras`);
      const products = await resProducts.json();
      assert.ok(products.length > 0, 'Need at least one product for order test');

      const testProduct = products[0];
      const payloadXSS = "<script>alert('xss')</script><img src=x onerror=alert(1)>";

      const orderPayload = {
        cliente: "Automated Security Test User",
        telefono: "3000000099",
        tipo: "domicilio",
        direccion: "Calle 123 # 45-67",
        barrio: "Centro",
        subtotal: testProduct.precio,
        total: testProduct.precio,
        metodoPago: "Efectivo",
        notasCliente: payloadXSS,
        restaurantSlug: "salchiricurras",
        items: [
          {
            productoId: testProduct.id,
            nombre: testProduct.nombre,
            precio: testProduct.precio,
            cantidad: 1,
            subtotal: testProduct.precio,
            notas: payloadXSS,
          }
        ]
      };

      const resOrder = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      assert.strictEqual(resOrder.status, 201, 'Order creation with XSS string should be safely accepted as string');
      const createdOrder = await resOrder.json();
      assert.ok(createdOrder.codigo, 'Order should receive a unique code');
      assert.strictEqual(createdOrder.restaurantId, 2, 'Order must belong to restaurantId 2');

      // Clean up: cancel the security test order so it does not affect live metrics
      if (createdOrder.id) {
        await fetch(`${BASE_URL}/api/orders/${createdOrder.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: 'Cancelado' }),
        });
      }
    });
  });

});
