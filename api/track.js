const https = require('https');

// Memory-based rate limiter
const recentHits = new Map();

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  // --- RATE LIMITER ---
  const now = Date.now();
  if (recentHits.has(ip) && (now - recentHits.get(ip)) < 5000) { 
    const pixel = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgEwh3JQAAAAASUVORK5CYII=", "base64");
    res.setHeader('Content-Type', 'image/png');
    return res.status(200).send(pixel);
  }
  recentHits.set(ip, now);

  // --- DATA PARSING ---
  const userAgent = req.headers['user-agent'] || 'unknown';
  const timestamp = new Date().toISOString();
  
  // LOG TO VERCEL DASHBOARD (The website link you sent)
  console.log(`[HIT] IP: ${ip} | User-Agent: ${userAgent} | Time: ${timestamp}`);

  const discordPayload = JSON.stringify({
    content: `🎯 **Association Alert: New Hit Detected!**\n**Time:** \`${timestamp}\` \n**IP Address:** \`${ip}\` \n**User-Agent:** \` ${userAgent} \``
  });

  const webhookUrl = "https://discord.com/api/webhooks/1491153564159184947/_NO3pSdteBLLJN26oyhTQJiJaZcjl2s_-k82ALTThl65jrZePzwhaWYqd3iiD4uvi0T_";

  // --- LOG TO DISCORD (The permanent backup) ---
  await new Promise((resolve) => {
    const discordReq = https.request(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(discordPayload),
      }
    });

    discordReq.on('error', (error) => {
      console.error('Discord Webhook Error:', error);
      resolve(); 
    });

    discordReq.write(discordPayload);
    discordReq.end(() => resolve());
  });

  // --- RETURN PIXEL ---
  const pixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgEwh3JQAAAAASUVORK5CYII=",
    "base64"
  );

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.status(200).send(pixel);
}
