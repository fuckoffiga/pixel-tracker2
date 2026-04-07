export default async function handler(req, res) {
  // 1. COLLECT VISITOR DATA
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const timestamp = new Date().toISOString();

  // 2. FILTER OUT VERCEL BOTS
  if (userAgent.includes('vercel-favicon')) {
    return res.status(204).end();
  }

  // 3. LIVE VERCEL LOGGING (Visible in your Vercel Dashboard)
  console.log("------------------------------------------");
  console.log(`🎯 HIT DETECTED: ${timestamp}`);
  console.log(`🌐 IP: ${ip}`);
  console.log(`🔍 UA: ${userAgent}`);
  console.log("------------------------------------------");

  // 4. SUPABASE CONFIGURATION
  const SUPABASE_URL = "https://lpgvvvvhyrntagpwcaix.supabase.co"; 
  const SUPABASE_KEY = "sb_secret_vOkIFPygZ2hFqYB2g8e5qw_JfDCn76W";

  // 5. PERMANENT DATABASE LOGGING
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/logs`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        ip: ip,                 // Matches your 'ip' column
        user_agent: userAgent,  // Matches your 'user_agent' column
        date_and_time: timestamp // Matches your 'date_and_time' column
      })
    });

    if (response.ok) {
      console.log(`[DB SUCCESS] Status: ${response.status}`);
    } else {
      const errorText = await response.text();
      console.error(`[DB FAILED] ${response.status}: ${errorText}`);
    }
    
  } catch (err) {
    console.error("[CRITICAL DB ERROR]:", err.message);
  }

  // 6. SERVE THE 1x1 INVISIBLE PIXEL
  const pixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgEwh3JQAAAAASUVORK5CYII=",
    "base64"
  );

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  
  res.status(200).send(pixel);
}
