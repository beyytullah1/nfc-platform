-- Admin Panel için Veritabanı Güncellemeleri
-- Bu SQL komutlarını Manuel olarak çalıştırabilirsiniz (veya dev server'ı kapatıp prisma migrate dev yapın)

-- 1. User modeline role alanı ekle
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- 2. AdminLog tablosu oluştur
CREATE TABLE IF NOT EXISTS admin_logs (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Mevcut admin kullanıcıya admin rolü ver
UPDATE users SET role = 'admin' WHERE email = 'admin@nfc.com';

-- 4. Demo kullanıcıya admin rolü ver (İsteğe bağlı)
UPDATE users SET role = 'admin' WHERE email = 'demo@nfc.com';
