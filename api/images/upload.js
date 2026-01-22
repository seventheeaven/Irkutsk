// API для загрузки изображений в Cloudinary
const cloudinary = require('cloudinary').v2;

// Настройка Cloudinary из переменных окружения
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Получаем base64 изображение из тела запроса
    const { image } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!image || !image.startsWith('data:image/')) {
      res.status(400).json({ error: 'Invalid image data' });
      return;
    }

    // Загружаем в Cloudinary
    // Используем upload preset для оптимизации
    const result = await cloudinary.uploader.upload(image, {
      folder: 'suydacity/publications',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }, // Автоматическая оптимизация
        { width: 1200, height: 1200, crop: 'limit' }, // Максимальный размер
      ],
      resource_type: 'image',
    });

    // Возвращаем оптимизированный URL
    res.status(200).json({ 
      ok: true, 
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (e) {
    console.error('Cloudinary upload error:', e);
    res.status(500).json({ error: 'Failed to upload image: ' + (e.message || 'Unknown error') });
  }
};

