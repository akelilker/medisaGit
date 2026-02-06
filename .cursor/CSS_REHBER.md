# CSS ÇAKIŞMA ÖNLEME REHBERİ

## 🔴 SORUN: Eski Güncellemeler Bozuluyor

### Neden Oluyor?
1. **Aynı selector için birden fazla kural** → Son kural öncekini eziyor
2. **Media query çakışmaları** → Mobil/Desktop kuralları birbirini eziyor
3. **!important fazla kullanımı** → Öncelik sırası karışıyor
4. **Kural sırası** → CSS'te sonraki kural öncekini eziyor

---

## ✅ ÇÖZÜM: CSS Yapısını Organize Et

### 1. CSS Dosyası Yapısı (Önerilen Sıra)

```css
/* =========================================
   1. GENEL KURALLAR (Desktop varsayılan)
   ========================================= */
.selector {
    /* Desktop için varsayılan değerler */
}

/* =========================================
   2. MOBİL ÖZEL (@media max-width: 640px)
   ========================================= */
@media (max-width: 640px) {
    .selector {
        /* Mobil için özel değerler */
    }
}

/* =========================================
   3. MASAÜSTÜ ÖZEL (@media min-width: 641px)
   ========================================= */
@media (min-width: 641px) {
    .selector {
        /* Masaüstü için özel değerler (sadece gerektiğinde) */
    }
}
```

---

## 🛡️ ÖNLEM KURALLARI

### ✅ YAPILMASI GEREKENLER:

1. **Tek Kural Prensibi**
   - Her selector için sadece 1 genel kural
   - Media query içinde sadece değişen değerler

2. **Media Query Kullanımı**
   ```css
   /* ❌ YANLIŞ: Aynı selector 3 yerde */
   .btn-save { width: 100px; }
   @media (max-width: 640px) { .btn-save { width: 200px; } }
   @media (min-width: 641px) { .btn-save { width: 150px; } }
   
   /* ✅ DOĞRU: Genel + sadece değişenler */
   .btn-save { width: 150px; } /* Desktop varsayılan */
   @media (max-width: 640px) { .btn-save { width: 200px !important; } }
   ```

3. **!important Kullanımı**
   - Sadece media query içinde kullan
   - Genel kurallarda mümkünse kullanma

4. **Kural Birleştirme**
   ```css
   /* ❌ YANLIŞ: Aynı selector 2 kere */
   .btn-save { width: 100px; }
   .btn-save { height: 50px; }
   
   /* ✅ DOĞRU: Tek kural */
   .btn-save {
       width: 100px;
       height: 50px;
   }
   ```

---

## 🔍 ÇAKIŞMA TESPİTİ

### PowerShell Komutu (Çakışmaları Bul)
```powershell
# Aynı selector'ı kaç kere kullandığını bul
Select-String -Path "kayit.css" -Pattern "\.btn-save" | Measure-Object
```

### Manuel Kontrol
1. Dosyada `Ctrl+F` ile selector'ı ara
2. Kaç kere geçtiğini say
3. 1'den fazla ise → ÇAKIŞMA VAR!

---

## 📋 DEĞİŞİKLİK YAPARKEN KONTROL LİSTESİ

### Her Değişiklikten Önce:
- [ ] Aynı selector için başka kural var mı? (Ctrl+F ile ara)
- [ ] Media query içinde mi, dışında mı?
- [ ] !important kullanımı gerekli mi?

### Her Değişiklikten Sonra:
- [ ] Eski kurallar hala çalışıyor mu? (Test et)
- [ ] Mobil/Desktop'ta farklı görünüyor mu? (Test et)
- [ ] Başka bir şey bozuldu mu? (Genel kontrol)

---

## 🚨 ACİL DURUM: Bir Şey Bozulduysa

1. **Son değişikliği geri al**
2. **Çakışmaları tespit et** (Ctrl+F ile selector'ı ara)
3. **Kuralları birleştir** (Aynı selector için tek kural)
4. **Test et** (Mobil + Desktop)

---

## 💡 İPUÇLARI

1. **CSS Versiyonlama**: `kayit.css?v=20260113p` → Cache sorunlarını önler
2. **Yorum Satırları**: Her değişiklikte neden yapıldığını yaz
3. **Küçük Değişiklikler**: Büyük değişiklikler yerine küçük adımlar
4. **Test**: Her değişiklikten sonra test et

---

## 📝 ÖRNEK: Buton Düzeltmesi

### ❌ ÖNCE (Çakışmalı):
```css
.btn-save { width: 100px; }
.btn-save { height: 50px; }
@media (max-width: 640px) { .btn-save { width: 200px; } }
@media (min-width: 641px) { .btn-save { width: 150px; } }
```

### ✅ SONRA (Düzenli):
```css
/* Genel kural (Desktop varsayılan) */
.btn-save {
    width: 150px;
    height: 50px;
}

/* Mobil özel */
@media (max-width: 640px) {
    .btn-save {
        width: 200px !important;
    }
}
```

---

**Son Güncelleme:** 2026-01-13
**Dosya:** kayit.css
