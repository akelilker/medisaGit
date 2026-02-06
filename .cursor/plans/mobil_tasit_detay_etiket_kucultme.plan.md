---
name: ""
overview: ""
todos: []
isProject: false
---

# Mobil Taşıt Detay - Lastık Durumu ve Takip Cihazı Etiketlerinin Otomatik Küçülmesi

## Sorun

Mobil taşıt detay ekranında uzun etiketler ekran dışına kaçmak üzere:

- "Yazlık/Kışlık Lastik Durumu:" (28 karakter)
- "Taşıt Takip Cihazı Montajı:" (26 karakter)

**Mevcut durum:**

- Mobilde `.detail-row-label` font-size: 17px
- `.detail-row-inline .detail-row-label` için `flex-shrink: 0` var (küçülmüyor)
- Etiketler ekran dışına taşıyor

## Çözüm

Mobilde uzun etiketler için otomatik font-size küçültme ve esnek genişlik ayarı uygulanacak.

## Yapılacak Değişiklikler

### tasitlar.css - Mobil Uzun Etiketler İçin Otomatik Küçültme

**Dosya:** `tasitlar.css`
**Konum:** `@media (max-width: 640px)` bloğu içinde (satır 1576'dan sonra)

**Eklenecek CSS:**

```css
/* Uzun etiketler için otomatik küçültme - mobil */
.detail-row-inline .detail-row-label {
  font-size: clamp(11px, 3.5vw, 14px) !important; /* 17px yerine responsive küçültme */
  max-width: 45% !important; /* Maksimum genişlik sınırı */
  flex-shrink: 1 !important; /* Küçülebilir (0 → 1) */
  white-space: normal !important; /* Gerekirse alt satıra geçebilir */
  word-break: break-word !important; /* Uzun kelimeleri kır */
}
```

**Değiştirilecek:**
Mevcut `.detail-row-inline .detail-row-label` stili (satır 473-477) mobilde override edilecek.

## Beklenen Sonuç

- Uzun etiketler ekran dışına kaçmayacak
- Font-size otomatik olarak küçülecek (clamp ile responsive)
- Gerekirse alt satıra geçebilecek
- Kullanıcı deneyimi iyileşecek

