export default async function handler(req, res) {
  // 1. COLLECT VISITOR DATA
  // Captures the IP (looking through Vercel's proxy) and the device type
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const timestamp = new Date().toISOString();

  // 2. FILTER OUT VERCEL BOTS
  // This prevents the script from firing when Vercel's internal systems check the link
  if (userAgent.includes('vercel-favicon')) {
    return res.status(204).end();
  }

  // 3. YOUR DISCORD WEBHOOK CONFIG
  // Replace the string below with your actual Discord Webhook URL
  const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1491153564159184947/_NO3pSdteBLLJN26oyhTQJiJaZcjl2s_-k82ALTThl65jrZePzwhaWYqd3iiD4uvi0T_";

  // 4. CREATE THE DISCORD MESSAGE (EMBED)
  const discordPayload = {
    embeds: [{
      title: "🎯 New Hit Logged",
      color: 3447003, // A nice blue color
      fields: [
        {
          name: "🌐 IP Address",
          value: `\`${ip}\``,
          inline: true
        },
        {
          name: "📱 Device / User-Agent",
          value: `\`${userAgent}\``
        },
        {
          name: "⏰ Time (UTC)",
          value: timestamp
        }
      ],
      footer: {
        text: "Vercel Image Tracker"
      }
    }]
  };

  // 5. SEND THE DATA TO DISCORD
  try {
    // We use fetch to send the POST request to Discord
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordPayload)
    });

    if (!response.ok) {
      console.error(`[DISCORD ERROR] Status: ${response.status}`);
    }
  } catch (err) {
    console.error("[CRITICAL ERROR] Failed to reach Discord:", err.message);
  }

  // 6. SERVE THE 1x1 INVISIBLE PIXEL
  // This is what the target's browser/email client actually "loads"
  const pixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgEwh3JQAAAAASUVORK5CYII=",
    "base64"
  );

  // Set headers to prevent the image from being saved in browser cache
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  
  // Send the pixel back to the visitor
  res.status(200).send(pixel);
}
