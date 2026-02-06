---
name: Admin Rapor Filtre ve Tablo
overview: Admin rapor sayfasında filtre etiketlerini tek satırda tutma, bilgi kutuları yüksekliğini yarıya indirme, tablo başlıklarını arka plansız/çerçevesiz yapma, sütun genişliklerini içeriğe göre ayarlama ve sütunlar arası ince dikey çizgiler ekleme.
todos: []
isProject: false
---

# Admin Rapor Filtre ve Tablo Düzenlemeleri

## Değişiklikler

### 1. Dönem, Şube, Durum Etiketleri – Tek Satır

**[admin/admin-report.css](admin/admin-report.css)**

- `.report-filters`: `flex-wrap: nowrap` ekle (masaüstü için), böylece Dönem, Şube, Durum aynı satırda kalır
- Mobilde (`@media (max-width: 640px)`) `flex-wrap: wrap` veya `flex-direction: column` kalacak (dar ekranda alt alta geçer)

### 2. Bilgi Kutuları Dikey Yükseklik – Yarıya İndirme

**[admin/admin-report.css](admin/admin-report.css)**

- `.report-stat-box`: `min-height: 72px` → `min-height: 36px`
- `padding: 0.75rem 1rem` → `padding: 0.35rem 0.75rem` (iç boşluk azaltılır)
- `.report-stat-box .value`: `font-size: 1.25rem` → `1.1rem` (isteğe bağlı)

### 3. Tablo Başlıkları – Arka Plansız ve Çerçevesiz

**[admin/admin-report.css](admin/admin-report.css)**

- `.report-table th`: `background: rgba(255, 255, 255, 0.06)` kaldır → `background: transparent`
- Tablo wrapper (`.report-table-wrap`) varsa `border` kaldırılabilir; sadece başlık stilinden bahsediliyorsa sadece th güncellenir

### 4. Sütun Genişlikleri – Metin Genişliği Kadar

**[admin/admin-report.css](admin/admin-report.css)**

- `.report-table`: `table-layout: auto` (varsayılan, netleştirmek için eklenebilir)
- `.report-table th`: `width: 1%`, `white-space: nowrap` — sütunlar içeriğe göre daralır, başlık metni satır kırmaz
- `.report-table td`: `white-space: nowrap` — metin tek satırda kalır (isteğe bağlı; uzun hücreler taşabilir)

### 5. Sütunlar Arası İnce Dikey Çizgiler

**[admin/admin-report.css](admin/admin-report.css)**

- `.report-table th, .report-table td`: `border-left: 0.5px solid rgba(255, 255, 255, 0.15)` ekle
- `.report-table th:first-child, .report-table td:first-child`: `border-left: none` — ilk sütunda sol çizgi olmaz

Alternatif: `border-right` kullanılıp son sütunda sağ çizgi kaldırılabilir.

### 6. Tablo Wrapper Çerçevesi

Plan "8 sütun başlığı arka plansız" diyor; tablo dış çerçevesi (`report-table-wrap` border) ayrı tutulacak. Gerekirse kullanıcı feedback’ine göre kaldırılır.

---

## Özet Tablo


| Bileşen                                      | Değişiklik                                                  |
| -------------------------------------------- | ----------------------------------------------------------- |
| .report-filters                              | flex-wrap: nowrap (masaüstü)                                |
| .report-stat-box                             | min-height: 36px, padding azalt                             |
| .report-table th                             | background: transparent                                     |
| .report-table th, td                         | width: 1%, white-space: nowrap (th); border-left ince çizgi |
| .report-table th:first-child, td:first-child | border-left: none                                           |


