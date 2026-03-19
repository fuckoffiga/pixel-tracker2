export default function handler(req, res) {
  // Get IP address (Vercel uses this header)
  const ip =
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress ||
    'unknown';

  // Get User-Agent
  const userAgent = req.headers['user-agent'] || 'unknown';

  // Basic parsing (no external libraries needed)
  const browser = userAgent.includes('Chrome')
    ? 'Chrome'
    : userAgent.includes('Firefox')
    ? 'Firefox'
    : userAgent.includes('Safari')
    ? 'Safari'
    : userAgent.includes('Edge')
    ? 'Edge'
    : 'Other';

  const os = userAgent.includes('Windows')
    ? 'Windows'
    : userAgent.includes('Mac')
    ? 'MacOS'
    : userAgent.includes('Linux')
    ? 'Linux'
    : userAgent.includes('Android')
    ? 'Android'
    : userAgent.includes('iPhone')
    ? 'iOS'
    : 'Other';

  // Log data to Vercel console
  console.log({
    ip,
    browser,
    os,
    userAgent,
    timestamp: new Date().toISOString()
  });

  // Return a 1x1 transparent pixel
  const pixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgEwh3JQAAAAASUVORK5CYII=",
    "base64"
  );

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  res.status(200).send(pixel);
}
