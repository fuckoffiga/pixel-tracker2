export default async function handler(req, res) {
  // 1. Capture the Data
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const timestamp = new Date().toISOString();

  // 2. Skip Vercel's internal bots
  if (userAgent.includes('vercel-favicon')) {
    return res.status(204).end();
  }

  // 3. LOG TO VERCEL DASHBOARD (So you see it live)
  console.log("------------------------------------------");
  console.log(`🎯 HIT DETECTED: ${timestamp}`);
  console.log(`🌐 IP: ${ip}`);
  console.log(`🔍 UA: ${userAgent}`);
  console.log("------------------------------------------");

  // 4. YOUR GOOGLE SHEETS WEB APP URL
  const googleUrl = "https://script.google.com/macros/s/AKfycbxGBOuTmWNOiewczAfCmlNmn47-MA_cA3lnZk0JRmlAXlNG95w2AFe3m6bhl_9A4FeG/exec";

  // 5. SEND TO GOOGLE SHEETS
  try {
    const response = await fetch(googleUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ip: ip,
        ua: userAgent
      })
    });

    // This will print "200" in your Vercel logs if Google accepted it
    console.log(`[GOOGLE RESPONSE] Status: ${response.status}`);
    
  } catch (err) {
    console.error("[CRITICAL ERROR] Failed to reach Google Sheets:", err.message);
  }

  // 6. SERVE THE 1x1 PIXEL
  const pixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgEwh3JQAAAAASUVORK5CYII=",
    "base64"
  );

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  
  res.status(200).send(pixel);
}
