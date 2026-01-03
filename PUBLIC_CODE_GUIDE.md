# NFC Public Code Üretici

## 📚 Public Code Nedir?

Public Code, NFC tag'inizin URL'inde kullanılan benzersiz koddur.

**Örnek:**
- Public Code: `KWNKCiL338`
- NFC URL: `http://localhost:3000/t/KWNKCiL338`

## 🎯 Kod Formatı

- **Uzunluk:** 10 karakter (varsayılan)
- **Karakterler:** A-Z, 2-9 (okunması kolay, I/O/0/1 hariç)
- **Benzersizlik:** Her kod unique olmalı

## 🚀 Kullanım

### Tek Kod Üret:
```javascript
const code = generatePublicCode(10) // 10 karakterlik
console.log(code) // örn: "ABC123XYZ9"
```

### Toplu Kod Üret:
```bash
# 10 adet kod (10 karakter)
node generate-public-codes.js 10

# 50 adet kod (12 karakter)
node generate-public-codes.js 50 12

# 100 adet kod (8 karakter)
node generate-public-codes.js 100 8
```

## 📊 Önerilen Uzunluklar

| NFC Tag Sayısı | Önerilen Uzunluk | Kombinasyon Sayısı |
|----------------|------------------|--------------------|
| < 1,000        | 6 karakter       | ~1 milyar          |
| < 10,000       | 8 karakter       | ~1 trilyon         |
| < 100,000      | 10 karakter      | ~kuadrilyon        |
| > 100,000      | 12 karakter      | Sınırsız           |

## 💡 Örnek Kullanım Senaryosu

### 1. 500 NFC Tag Üret:
```bash
node generate-public-codes.js 500 8
```

### 2. Çıktı:
```
001. ABC123XY
002. DEF456ZW
003. GHJ789KL
...
500. MNP234QR
```

### 3. Bu Kodları NFC Tag'lere Yaz:
- NFC yazıcı ile her tag'e bir kod yaz
- Veya QR Code olarak bas

### 4. Veritabanına Kaydet:
Public code'ları tag'lere atamak için ayrı script kullan.

## 🔒 Güvenlik

- Tahmin edilemez rastgele kodlar
- Benzersizlik garantisi (veritabanı kontrolü)
- Okunması kolay karakterler

## 📝 Notlar

- Kodlar otomatik olarak veritabanına KAYDEDILMEZ
- Sadece üretilip ekrana yazdırılır
- Tag'lere atama için ayrı işlem gerekir
