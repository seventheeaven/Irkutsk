// Скрипт для очистки KV базы данных
// Запуск: node scripts/clear-kv.js

const { kv } = require('@vercel/kv');

async function clearAllData() {
  try {
    console.log('⚠️  Начинаю очистку KV базы данных...\n');

    // Удаляем все публикации
    await kv.del('publications:all');
    console.log('✓ Публикации удалены');

    // Примечание: Vercel KV не поддерживает получение всех ключей
    // Для удаления пользователей нужно знать их email
    // Или использовать Vercel Dashboard

    console.log('\n✓ Очистка завершена');
    console.log('\n⚠️  Для удаления пользователей:');
    console.log('   1. Зайдите в Vercel Dashboard');
    console.log('   2. Откройте ваш проект → Storage → KV');
    console.log('   3. Найдите и удалите ключи, начинающиеся с "user:"');
    console.log('   4. Также удалите ключи, начинающиеся с "username:"');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при очистке:', error);
    process.exit(1);
  }
}

clearAllData();


