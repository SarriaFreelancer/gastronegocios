import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateTableQRCode, generateFeedbackQRCode } from '@/lib/qrcode';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const tableId = Number(params.id);
    const table = await prisma.restaurantTable.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      return NextResponse.json({ error: 'Mesa no encontrada' }, { status: 404 });
    }

    const host = req.headers.get('host') || 'localhost:3005';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const orderQr = await generateTableQRCode(table.numero, baseUrl);
    const feedbackQr = await generateFeedbackQRCode(table.numero, baseUrl);

    return NextResponse.json({
      mesa: table.numero,
      orderUrl: `${baseUrl}/?mesa=${encodeURIComponent(table.numero)}#menu`,
      orderQr,
      feedbackUrl: `${baseUrl}/calificar?mesa=${encodeURIComponent(table.numero)}`,
      feedbackQr,
    });
  } catch (error) {
    console.error('Error generating QR:', error);
    return NextResponse.json({ error: 'Error al generar código QR' }, { status: 500 });
  }
}
