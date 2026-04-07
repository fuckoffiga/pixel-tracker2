const https = require('https');

export default async function handler(req, res) {
  // 1. Capture the "Who" and "Where"
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const timestamp = new Date().toISOString();

  // 2. Filter out Vercel's internal bots so they don't fill your sheet with trash
  if (userAgent.includes('vercel-favicon')) {
    return res.status(204).end();
  }

  // 3. YOUR GOOGLE SHEETS WEB APP URL
  const googleUrl = "https://script.google.com/macros/s/AKfycbxGBOuTmWNOiewczAfCmlNmn47-MA_cA3lnZk0JRmlAXlNG95w2AFe3m6bhl_9A4FeG/exec";

  // 4. Create the "Log Entry" package
  const payload = JSON.stringify({
    ip: ip,
    ua: userAgent
  });

  // 5. Send the data to your Google Sheet "Logbook"
  // We don't use 'await' here so the pixel is served instantly to the target
  const googleReq = https.request(googleUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  googleReq.on('error', (e) => {
    console.error("Failed to log to Google Sheets:", e.message);
  });

  googleReq.write(payload);
  googleReq.end();

  // 6. Serve the 1x1 Invisible Tracking Pixel
  const pixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgEwh3JQAAAAASUVORK5CYII=",
    "base64"
  );

  res.setHeader('Content-Type', 'image/png');
  // This ensures the browser doesn't "remember" the image and skip the log next time
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  
  res.status(200).send(pixel);
}
