import QRCode from 'qrcode';

export async function generateTableQRCode(tableNumber: string, baseUrl: string = 'http://localhost:3005'): Promise<string> {
  const targetUrl = `${baseUrl}/?mesa=${encodeURIComponent(tableNumber)}#menu`;
  return await QRCode.toDataURL(targetUrl, {
    width: 400,
    margin: 2,
    color: {
      dark: '#151515',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H',
  });
}

export async function generateFeedbackQRCode(tableNumber: string, baseUrl: string = 'http://localhost:3005'): Promise<string> {
  const targetUrl = `${baseUrl}/calificar?mesa=${encodeURIComponent(tableNumber)}`;
  return await QRCode.toDataURL(targetUrl, {
    width: 400,
    margin: 2,
    color: {
      dark: '#E94B24',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H',
  });
}
