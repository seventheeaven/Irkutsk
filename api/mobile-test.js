// Простой endpoint для проверки доступности API на мобильных
module.exports = async function handler(req, res) {
  // Логируем запрос для диагностики
  console.log('Mobile test request:', {
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    host: req.headers['host'],
    origin: req.headers['origin'],
    referer: req.headers['referer'],
    'x-forwarded-for': req.headers['x-forwarded-for'],
    'x-vercel-ip-country': req.headers['x-vercel-ip-country']
  });
  
  // Устанавливаем заголовки для мобильных устройств
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Обрабатываем OPTIONS запрос (preflight для CORS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  res.status(200).json({ 
    ok: true, 
    message: 'API доступен',
    timestamp: Date.now(),
    userAgent: req.headers['user-agent'] || 'unknown',
    method: req.method
  });
};

