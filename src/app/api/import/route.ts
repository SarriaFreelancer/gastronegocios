import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get('tipo') || 'productos';

    const wb = XLSX.utils.book_new();

    if (tipo === 'productos') {
      const data = [
        {
          NOMBRE: 'Hamburguesa Especial',
          CATEGORIA: 'Hamburguesas',
          PRECIO_VENTA: 25000,
          DESCRIPCION: 'Doble carne, queso cheddar y tocineta',
          SKU: 'HMB-001',
          CODIGO_BARRAS: '7701234567890',
          DISPONIBLE: 'SI',
        },
        {
          NOMBRE: 'Gaseosa Manzana 400ml',
          CATEGORIA: 'Bebidas',
          PRECIO_VENTA: 5000,
          DESCRIPCION: 'Bebida gaseosa personal',
          SKU: 'BEB-002',
          CODIGO_BARRAS: '7701234567891',
          DISPONIBLE: 'SI',
        },
      ];
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    } else if (tipo === 'insumos') {
      const data = [
        {
          CODIGO: 'INS-001',
          NOMBRE: 'Carne Molida de Res 80/20',
          CATEGORIA: 'Carnes',
          UNIDAD_MEDIDA: 'kg',
          STOCK_ACTUAL: 15.5,
          STOCK_MINIMO: 5.0,
          STOCK_MAXIMO: 50.0,
          COSTO_UNITARIO: 24000,
          UBICACION: 'Nevera Carnes 1',
        },
        {
          CODIGO: 'INS-002',
          NOMBRE: 'Pan Brioche Artesanal',
          CATEGORIA: 'Panadería',
          UNIDAD_MEDIDA: 'und',
          STOCK_ACTUAL: 60,
          STOCK_MINIMO: 20,
          STOCK_MAXIMO: 120,
          COSTO_UNITARIO: 1200,
          UBICACION: 'Estantería Panadería',
        },
      ];
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Insumos');
    } else if (tipo === 'proveedores') {
      const data = [
        {
          NOMBRE: 'Distribuidora Carnes del Valle',
          NIT: '900123456-1',
          CONTACTO: 'Carlos Gómez',
          TELEFONO: '3101234567',
          EMAIL: 'ventas@carnesvalle.com',
          DIRECCION: 'Calle 10 # 45-20',
        },
      ];
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Proveedores');
    } else if (tipo === 'clientes') {
      const data = [
        {
          NOMBRE: 'Juan David Pérez',
          DOCUMENTO: '1098765432',
          TELEFONO: '3009876543',
          EMAIL: 'juan.perez@example.com',
          DIRECCION: 'Cra 15 # 30-10',
          CIUDAD: 'Cali',
        },
      ];
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
    } else if (tipo === 'inventario_inicial') {
      const data = [
        {
          CODIGO_INSUMO: 'INS-001',
          CANTIDAD_INICIAL: 20.0,
          COSTO_UNITARIO: 24000,
          LOTE: 'LOTE-2026-001',
          FECHA_VENCIMIENTO: '2026-12-31',
          MOTIVO: 'Conteo de Apertura Inicial',
        },
      ];
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'InventarioInicial');
    }

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="plantilla_${tipo}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating template:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { restaurantId, action, tipo, rows, usuarioNombre } = body;
    const restId = Number(restaurantId);

    if (!restId || !tipo || !Array.isArray(rows)) {
      return NextResponse.json(
        { error: 'restaurantId, tipo y rows (array) son obligatorios' },
        { status: 400 }
      );
    }

    // 1. Validation mode
    if (action === 'validate') {
      const errors: Array<{ row: number; field: string; message: string }> = [];
      const validRows: any[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2;
        let rowHasError = false;

        if (tipo === 'productos') {
          if (!row.NOMBRE || String(row.NOMBRE).trim() === '') {
            errors.push({ row: rowNum, field: 'NOMBRE', message: 'El nombre del producto es obligatorio' });
            rowHasError = true;
          }
          if (row.PRECIO_VENTA === undefined || isNaN(Number(row.PRECIO_VENTA)) || Number(row.PRECIO_VENTA) < 0) {
            errors.push({ row: rowNum, field: 'PRECIO_VENTA', message: 'El precio debe ser un número válido >= 0' });
            rowHasError = true;
          }
        } else if (tipo === 'insumos') {
          if (!row.NOMBRE || String(row.NOMBRE).trim() === '') {
            errors.push({ row: rowNum, field: 'NOMBRE', message: 'El nombre del insumo es obligatorio' });
            rowHasError = true;
          }
          if (!row.UNIDAD_MEDIDA || String(row.UNIDAD_MEDIDA).trim() === '') {
            errors.push({ row: rowNum, field: 'UNIDAD_MEDIDA', message: 'La unidad de medida es obligatoria (ej: g, kg, ml, l, und)' });
            rowHasError = true;
          }
          if (row.COSTO_UNITARIO !== undefined && (isNaN(Number(row.COSTO_UNITARIO)) || Number(row.COSTO_UNITARIO) < 0)) {
            errors.push({ row: rowNum, field: 'COSTO_UNITARIO', message: 'El costo unitario debe ser un número >= 0' });
            rowHasError = true;
          }
        } else if (tipo === 'proveedores') {
          if (!row.NOMBRE || String(row.NOMBRE).trim() === '') {
            errors.push({ row: rowNum, field: 'NOMBRE', message: 'El nombre o razón social es obligatorio' });
            rowHasError = true;
          }
        } else if (tipo === 'clientes') {
          if (!row.NOMBRE || String(row.NOMBRE).trim() === '') {
            errors.push({ row: rowNum, field: 'NOMBRE', message: 'El nombre del cliente es obligatorio' });
            rowHasError = true;
          }
        } else if (tipo === 'inventario_inicial') {
          if (!row.CODIGO_INSUMO && !row.NOMBRE_INSUMO) {
            errors.push({ row: rowNum, field: 'CODIGO_INSUMO', message: 'Debe especificar el código o nombre del insumo' });
            rowHasError = true;
          }
          if (row.CANTIDAD_INICIAL === undefined || isNaN(Number(row.CANTIDAD_INICIAL))) {
            errors.push({ row: rowNum, field: 'CANTIDAD_INICIAL', message: 'La cantidad debe ser un número válido' });
            rowHasError = true;
          }
        }

        if (!rowHasError) {
          validRows.push({ ...row, _originalRowIndex: rowNum });
        }
      }

      return NextResponse.json({
        total: rows.length,
        validCount: validRows.length,
        errorCount: errors.length,
        errors,
        validRows,
      });
    }

    // 2. Execution mode
    if (action === 'execute') {
      const importedCount = await prisma.$transaction(async (tx) => {
        let count = 0;

        if (tipo === 'productos') {
          for (const row of rows) {
            const nombre = String(row.NOMBRE || '').trim();
            const precio = Number(row.PRECIO_VENTA) || 0;
            const catName = String(row.CATEGORIA || 'General').trim();
            const descripcion = row.DESCRIPCION ? String(row.DESCRIPCION).trim() : nombre;
            const sku = row.SKU ? String(row.SKU).trim() : null;
            const codigoBarras = row.CODIGO_BARRAS ? String(row.CODIGO_BARRAS).trim() : null;
            const disponibilidad = row.DISPONIBLE ? !['NO', 'FALSE', '0'].includes(String(row.DISPONIBLE).toUpperCase()) : true;

            let category = await tx.category.findFirst({
              where: {
                nombre: catName,
                OR: [{ restaurantId: restId }, { restaurantId: null }],
              },
            });

            if (!category) {
              const catSlug = `${catName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${restId}-${Date.now().toString().slice(-3)}`;
              category = await tx.category.create({
                data: {
                  nombre: catName,
                  slug: catSlug,
                  restaurantId: restId,
                },
              });
            }

            const autoSlug = `${nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${restId}-${Date.now().toString().slice(-4)}`;

            await tx.product.create({
              data: {
                restaurantId: restId,
                nombre,
                slug: autoSlug,
                precio,
                descripcion,
                imagen: '/images/placeholder.jpg',
                categoriaId: category.id,
                sku,
                codigoBarras,
                disponibilidad,
              },
            });
            count++;
          }
        } else if (tipo === 'insumos') {
          for (const row of rows) {
            const nombre = String(row.NOMBRE || '').trim();
            const codigoInterno = row.CODIGO ? String(row.CODIGO).trim() : `INS-${Date.now().toString().slice(-4)}`;
            const categoria = row.CATEGORIA ? String(row.CATEGORIA).trim() : 'General';
            const unidadMedida = String(row.UNIDAD_MEDIDA || 'und').trim().toLowerCase();
            const stockActual = Number(row.STOCK_ACTUAL) || 0;
            const stockMinimo = Number(row.STOCK_MINIMO) || 0;
            const stockMaximo = Number(row.STOCK_MAXIMO) || 0;
            const costoUnitario = Number(row.COSTO_UNITARIO) || 0;

            const supply = await tx.supply.create({
              data: {
                restaurantId: restId,
                codigoInterno,
                nombre,
                categoria,
                unidadMedida,
                stockActual,
                stockMinimo,
                stockMaximo,
                costoUnitario,
                costoPromedio: costoUnitario,
              },
            });

            if (stockActual !== 0) {
              await tx.inventoryMovement.create({
                data: {
                  restaurantId: restId,
                  supplyId: supply.id,
                  tipoMovimiento: 'AJUSTE_POSITIVO',
                  cantidad: Math.abs(stockActual),
                  unidad: unidadMedida,
                  costoUnitario,
                  costoTotal: Math.abs(stockActual) * costoUnitario,
                  stockAnterior: 0,
                  stockResultante: stockActual,
                  esNegativo: false,
                  referencia: 'CARGA_MASIVA_INICIAL',
                  motivo: 'Inventario inicial registrado mediante importación masiva',
                  usuarioResponsable: usuarioNombre || 'Sistema de Importación',
                },
              });
            }
            count++;
          }
        } else if (tipo === 'proveedores') {
          for (const row of rows) {
            const nombre = String(row.NOMBRE || '').trim();
            const nit = row.NIT ? String(row.NIT).trim() : null;
            const contacto = row.CONTACTO ? String(row.CONTACTO).trim() : null;
            const telefono = row.TELEFONO ? String(row.TELEFONO).trim() : null;
            const email = row.EMAIL ? String(row.EMAIL).trim() : null;
            const direccion = row.DIRECCION ? String(row.DIRECCION).trim() : null;

            await tx.supplier.create({
              data: {
                restaurantId: restId,
                nombre,
                nit,
                contacto,
                telefono,
                email,
                direccion,
              },
            });
            count++;
          }
        } else if (tipo === 'clientes') {
          for (const row of rows) {
            const nombre = String(row.NOMBRE || '').trim();
            const doc = row.DOCUMENTO ? String(row.DOCUMENTO).trim() : null;
            const telefono = row.TELEFONO ? String(row.TELEFONO).trim() : null;
            const email = row.EMAIL ? String(row.EMAIL).trim() : null;
            const direccion = row.DIRECCION ? String(row.DIRECCION).trim() : null;
            const ciudad = row.CIUDAD ? String(row.CIUDAD).trim() : null;

            await tx.customer.create({
              data: {
                restaurantId: restId,
                nombre,
                documento: doc,
                telefono,
                email,
                direccion,
                ciudad,
              },
            });
            count++;
          }
        } else if (tipo === 'inventario_inicial') {
          for (const row of rows) {
            const codigo = row.CODIGO_INSUMO ? String(row.CODIGO_INSUMO).trim() : null;
            const nombre = row.NOMBRE_INSUMO ? String(row.NOMBRE_INSUMO).trim() : null;
            const cant = Number(row.CANTIDAD_INICIAL) || 0;
            const costoUnitario = Number(row.COSTO_UNITARIO) || 0;
            const lote = row.LOTE ? String(row.LOTE).trim() : null;
            const fechaVenc = row.FECHA_VENCIMIENTO ? new Date(row.FECHA_VENCIMIENTO) : null;
            const motivo = row.MOTIVO ? String(row.MOTIVO).trim() : 'Inventario Inicial';

            const supply = await tx.supply.findFirst({
              where: {
                restaurantId: restId,
                OR: [
                  ...(codigo ? [{ codigoInterno: codigo }] : []),
                  ...(nombre ? [{ nombre }] : []),
                ],
              },
            });

            if (supply) {
              const stockAnterior = supply.stockActual;
              const stockResultante = cant;
              const delta = stockResultante - stockAnterior;

              await tx.supply.update({
                where: { id: supply.id },
                data: {
                  stockActual: stockResultante,
                  costoUnitario: costoUnitario > 0 ? costoUnitario : supply.costoUnitario,
                  costoPromedio: costoUnitario > 0 ? costoUnitario : supply.costoPromedio,
                  lote: lote || supply.lote,
                  fechaVencimiento: fechaVenc || supply.fechaVencimiento,
                },
              });

              await tx.inventoryMovement.create({
                data: {
                  restaurantId: restId,
                  supplyId: supply.id,
                  tipoMovimiento: 'AJUSTE_POSITIVO',
                  cantidad: Math.abs(delta),
                  unidad: supply.unidadMedida,
                  costoUnitario: costoUnitario > 0 ? costoUnitario : supply.costoUnitario,
                  costoTotal: Math.abs(delta) * (costoUnitario > 0 ? costoUnitario : supply.costoUnitario),
                  stockAnterior,
                  stockResultante,
                  esNegativo: false,
                  referencia: 'CARGA_INICIAL',
                  motivo,
                  usuarioResponsable: usuarioNombre || 'Sistema de Importación',
                },
              });
              count++;
            }
          }
        }

        return count;
      });

      return NextResponse.json({
        success: true,
        message: `Se importaron exitosamente ${importedCount} registros de ${tipo}`,
        importedCount,
      });
    }

    return NextResponse.json({ error: 'Acción inválida. Use validate o execute' }, { status: 400 });
  } catch (error: any) {
    console.error('Error processing bulk import:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
