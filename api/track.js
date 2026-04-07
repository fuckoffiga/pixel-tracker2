const https = require('https');

export default async function handler(req, res) {
  // 1. Capture the "Who" and "Where"
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const timestamp = new Date().toISOString();

  // 2. Filter out Vercel's internal bots
  if (userAgent.includes('vercel-favicon')) {
    return res.status(204).end();
  }

  // --- NEW: THE LIVE LOGGER (Shows up in Vercel Dashboard) ---
  console.log("------------------------------------------");
  console.log(`🎯 HIT DETECTED: ${timestamp}`);
  console.log(`🌐 IP: ${ip}`);
  console.log(`🔍 UA: ${userAgent}`);
  console.log("------------------------------------------");

  // 3. YOUR GOOGLE SHEETS WEB APP URL
  const googleUrl = "https://script.google.com/macros/s/AKfycbxGBOuTmWNOiewczAfCmlNmn47-MA_cA3lnZk0JRmlAXlNG95w2AFe3m6bhl_9A4FeG/exec";

  // 4. Create the "Log Entry" package
  const payload = JSON.stringify({
    ip: ip,
    ua: userAgent
  });

  // 5. Send the data to your Google Sheet "Logbook"
  // We use a Promise wrapper to make sure Vercel doesn't kill the request too early
  try {
    await new Promise((resolve) => {
      const googleReq = https.request(googleUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      }, (googleRes) => {
        // Log the status to Vercel so you know if Google accepted it
        console.log(`[GOOGLE STATUS]: ${googleRes.statusCode}`);
        resolve();
      });

      googleReq.on('error', (e) => {
        console.error("Failed to log to Google Sheets:", e.message);
        resolve();
      });

      googleReq.write(payload);
      googleReq.end();
    });
  } catch (err) {
    console.error("Critical Error sending to Google:", err);
  }

  // 6. Serve the 1x1 Invisible Tracking Pixel
  const pixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgEwh3JQAAAAASUVORK5CYII=",
    "base64"
  );

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  
  res.status(200).send(pixel);
}
