const https = require('https');

export default function handler(req, res) {
  // 1. Get IP address (Vercel uses this header)
  const ip =
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress ||
    'unknown';

  // 2. Get User-Agent and Parse Browser/OS (Your original logic)
  const userAgent = req.headers['user-agent'] || 'unknown';

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

  const timestamp = new Date().toISOString();

  // 3. Prepare the message for Discord
  const discordData = JSON.stringify({
    content: `🎯 **NEW LOG**\n**Time:** \`${timestamp}\` \n**IP Address:** \`${ip}\` \n**Operating System:** \`${os}\` \n**Browser:** \`${browser}\` \n**Full User-Agent:** \` ${userAgent} \``
  });

  // 4. Send to Discord (Replace the URL below with your actual Webhook URL)
  const webhookUrl = "https://discord.com/api/webhooks/1491153564159184947/_NO3pSdteBLLJN26oyhTQJiJaZcjl2s_-k82ALTThl65jrZePzwhaWYqd3iiD4uvi0T_"; 

  // Standard Node.js HTTPS request configuration
  const url = new URL(webhookUrl);
  const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(discordData),
    },
  };

  // Execute the Discord Ping
  const discordReq = https.request(options);
  discordReq.on('error', (error) => {
    console.error('Discord Webhook Error:', error);
  });
  discordReq.write(discordData);
  discordReq.end();

  // 5. Return the 1x1 transparent pixel (Your original image)
  const pixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgEwh3JQAAAAASUVORK5CYII=",
    "base64"
  );

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  res.status(200).send(pixel);
}
