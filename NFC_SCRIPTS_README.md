# 🚀 NFC Public Code Yönetimi - Hızlı Başlangıç

## 📋 Mevcut Script'ler

### 1️⃣ **Yeni Kodlar Üret** (`generate-public-codes.js`)

```bash
# 10 kod üret (10 karakter)
node generate-public-codes.js 10

# 20 kod üret (10 karakter)
node generate-public-codes.js 20

# 50 kod üret (12 karakter uzunluğunda)
node generate-public-codes.js 50 12
```

**Ne Yapar:**
- Benzersiz public code üretir
- Veritabanında çakışma kontrolü yapar
- Ekrana listeyi yazdırır

---

### 2️⃣ **Eşleşmiş Tag Bul** (`find-linked-tag.js`)

```bash
node find-linked-tag.js
```

**Ne Yapar:**
- Profil/karta bağlı tag'leri gösterir
- Test için hazır URL verir
- İlk bulduğunu detaylı gösterir

**Örnek Çıktı:**
```
✅ EŞLEŞMİŞ TAG BULUNDU!
Public Code: DEMO_PERSONAL
Card: Kişisel Profilim
🔗 TEST URL: http://localhost:3000/t/DEMO_PERSONAL
```

---

### 3️⃣ **Tüm Kodları Listele** (`list-public-codes.js`)

```bash
node list-public-codes.js
```

**Ne Yapar:**
- Veritabanındaki TÜM public code'ları gösterir
- Kod atanmış/atanmamış sayısını verir
- Son 50 kodu detaylı listeler

---

### 4️⃣ **Tag Durumu Kontrol** (`check-tag-status.js`)

```bash
node check-tag-status.js
```

**Ne Yapar:**
- DEMO2026 kodlu tag'in durumunu gösterir
- Owner, module type bilgilerini verir
- İlişkilendirilmiş profilleri listeler

---

## 🎯 Pratik Kullanım Senaryoları

### Senaryo 1: Yeni NFC Tag'ler Hazırlamak
```bash
# Adım 1: 100 kod üret
node generate-public-codes.js 100

# Adım 2: Kodları not et (ekrandan kopyala)

# Adım 3: Fiziksel tag'lere yaz
```

### Senaryo 2: Test Etmek
```bash
# Adım 1: Eşleşmiş tag bul
node find-linked-tag.js

# Adım 2: Verilen URL'i tarayıcıda aç
# Örn: http://localhost:3000/t/DEMO_PERSONAL

# Adım 3: Profil sayfasının açıldığını doğrula
```

### Senaryo 3: Mevcut Durumu Görmek
```bash
# Tüm kodları listele
node list-public-codes.js
```

---

## 💡 İpuçları

1. **Kod Uzunluğu:**
   - 100'den az tag → 8 karakter
   - 1000'den az tag → 10 karakter
   - Daha fazla → 12 karakter

2. **Test:**
   - Her zaman `find-linked-tag.js` ile eşleşmiş bir tag bulun
   - Test URL'i tarayıcıda açarak doğrulayın

3. **CSV Export:**
   - Önceden oluşturulmuş: `nfc_tags_export.csv`
   - Excel'de açabilirsiniz

---

## ⚡ Hızlı Komutlar

```bash
# En çok kullanılanlar:
node generate-public-codes.js 20        # 20 kod üret
node find-linked-tag.js                 # Test için kod bul
node list-public-codes.js               # Tüm kodları gör
```

---

## 📞 Yardım

Herhangi bir script'i argümansız çalıştırın, kullanım bilgisi gösterir.
