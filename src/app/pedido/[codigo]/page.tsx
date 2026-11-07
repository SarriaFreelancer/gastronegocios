import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function LegacyOrderRedirectPage({
  params,
}: {
  params: { codigo: string };
}) {
  const rawCode = params?.codigo || '';
  const cleanId = decodeURIComponent(rawCode).replace(/^#+/, '').trim();
  const isNum = !isNaN(Number(cleanId));
  const normalizedPg = cleanId.startsWith('PG-')
    ? cleanId
    : cleanId.startsWith('PG')
    ? `PG-${cleanId.slice(2)}`
    : `PG-${cleanId}`;

  let order = null;
  try {
    order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(isNum ? [{ id: Number(cleanId) }] : []),
          { codigo: rawCode },
          { codigo: cleanId },
          { codigo: normalizedPg },
        ],
      },
      include: {
        restaurant: true,
      },
    });
  } catch (err) {
    console.error('Error fetching order for legacy redirect:', err);
  }

  const slug = order?.restaurant?.slug || (order?.restaurant as any)?.subdominio || 'punto-g';
  const targetCode = order?.codigo || cleanId;

  redirect(`/r/${slug}/pedido/${encodeURIComponent(targetCode)}`);
}
