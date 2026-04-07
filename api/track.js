const https = require('https');

export default async function handler(req, res) {
  // 1. Collect Data
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const timestamp = new Date().toISOString();
  
  // Skip Vercel's own favicon crawler to avoid spam
  if (userAgent.includes('vercel-favicon')) {
    return res.status(204).end();
  }

  // Parse for the Dashboard
  const browser = userAgent.includes('Chrome') ? 'Chrome' : userAgent.includes('Firefox') ? 'Firefox' : userAgent.includes('Safari') ? 'Safari' : userAgent.includes('Edge') ? 'Edge' : 'Other';
  const os = userAgent.includes('Windows') ? 'Windows' : userAgent.includes('Mac') ? 'MacOS' : userAgent.includes('Linux') ? 'Linux' : userAgent.includes('Android') ? 'Android' : userAgent.includes('iPhone') ? 'iOS' : 'Other';

  const discordPayload = JSON.stringify({
    content: `🎯 **Hit Detected!**\n**IP:** \`${ip}\` \n**Device:** \`${os} / ${browser}\` \n**Time:** \`${timestamp}\``
  });

  const webhookUrl = "https://discord.com/api/webhooks/1491153564159184947/_NO3pSdteBLLJN26oyhTQJiJaZcjl2s_-k82ALTThl65jrZePzwhaWYqd3iiD4uvi0T_";

  // 2. THE SYNC FIX: We MUST await this to ensure it sends
  console.log(`[SYSTEM] Attempting Discord Ping for IP: ${ip}`);

  try {
    await new Promise((resolve, reject) => {
      const discordReq = https.request(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(discordPayload),
        }
      }, (discordRes) => {
        console.log(`[DISCORD RESPONSE] Status: ${discordRes.statusCode}`);
        resolve();
      });

      discordReq.on('error', (err) => {
        console.error("[DISCORD ERROR]", err.message);
        resolve(); // Resolve anyway to send the pixel
      });

      discordReq.write(discordPayload);
      discordReq.end();
    });
  } catch (e) {
    console.error("[CRITICAL ERROR]", e);
  }

  // 3. Return the 1x1 Pixel
  const pixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgEwh3JQAAAAASUVORK5CYII=",
    "base64"
  );

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.status(200).send(pixel);
}
