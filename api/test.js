// Максимально простой endpoint для тестирования
module.exports = async function handler(req, res) {
  console.log('TEST ENDPOINT CALLED:', {
    method: req.method,
    url: req.url,
    headers: {
      'user-agent': req.headers['user-agent'],
      'host': req.headers['host'],
      'x-forwarded-for': req.headers['x-forwarded-for']
    }
  });
  
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.status(200).send('OK');
};


