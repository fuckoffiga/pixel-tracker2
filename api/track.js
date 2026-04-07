const https = require('https');

export default function handler(req, res) {
  // 1. Collect Data
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const timestamp = new Date().toISOString();
  
  // Parse Browser/OS for the Vercel Log
  const browser = userAgent.includes('Chrome') ? 'Chrome' : userAgent.includes('Firefox') ? 'Firefox' : userAgent.includes('Safari') ? 'Safari' : userAgent.includes('Edge') ? 'Edge' : 'Other';
  const os = userAgent.includes('Windows') ? 'Windows' : userAgent.includes('Mac') ? 'MacOS' : userAgent.includes('Linux') ? 'Linux' : userAgent.includes('Android') ? 'Android' : userAgent.includes('iPhone') ? 'iOS' : 'Other';

  // 2. LOG TO VERCEL DASHBOARD
  // This will show up on your website link immediately
  console.log(`[ATTEMPT] IP: ${ip} | OS: ${os} | Browser: ${browser}`);

  const discordPayload = JSON.stringify({
    content: `🎯 **Hit Detected!**\n**Time:** \`${timestamp}\` \n**IP:** \`${ip}\` \n**Device:** \`${os} / ${browser}\``
  });

  const webhookUrl = "https://discord.com/api/webhooks/1491153564159184947/_NO3pSdteBLLJN26oyhTQJiJaZcjl2s_-k82ALTThl65jrZePzwhaWYqd3iiD4uvi0T_";

  // 3. THE DISCORD REQUEST (Non-Blocking)
  // We added a response listener so you can see if Discord returns a 429 error
  const discordReq = https.request(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(discordPayload),
    }
  }, (discordRes) => {
    if (discordRes.statusCode === 429) {
      console.error(`[DISCORD ERROR] Rate Limited (429). Too many hits at once.`);
    } else if (discordRes.statusCode !== 204) {
      console.error(`[DISCORD ERROR] Status: ${discordRes.statusCode}`);
    }
  });

  discordReq.on('error', (err) => console.error("Network Error:", err));
  discordReq.write(discordPayload);
  discordReq.end();

  // 4. RETURN PIXEL IMMEDIATELY
  // By not using 'await', we send the image back as fast as possible
  const pixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgEwh3JQAAAAASUVORK5CYII=",
    "base64"
  );

  res.setHeader('Content-Type', 'image/png');
  // Critical to prevent the browser from caching the hit
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.status(200).send(pixel);
}
