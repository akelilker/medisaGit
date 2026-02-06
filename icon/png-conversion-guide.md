# PNG Dönüştürme Rehberi

## Renk Profili ve Kalite Ayarları

Logo'yu PNG'ye dönüştürürken şu ayarları kullan:

### Önerilen Ayarlar:
- **Boyut**: 300px (veya 600px retina için)
- **Renk Profili**: sRGB
- **Format**: PNG-24 (alpha channel ile)
- **Kalite**: %100 (lossless)
- **Anti-aliasing**: Açık (kenar yumuşatma)

### Photoshop/Illustrator:
1. SVG'yi aç
2. Image > Mode > RGB Color (sRGB)
3. Image > Image Size > 300px width
4. File > Export > Export As > PNG
5. Quality: 100%, Transparency: On

### Online Araçlar:
- **CloudConvert**: sRGB profile seç
- **Convertio**: PNG-24 format, sRGB
- **SVG2PNG**: Quality: 100

### Inkscape (Komut satırı):
```bash
inkscape logo-header.svg --export-filename=logo-header-300.png --export-width=300 --export-type=png
```

### Renk Kontrolü:
- Kırmızı: #ff0000 (RGB: 255, 0, 0)
- Beyaz: #ffffff (RGB: 255, 255, 255)
- Arka plan: Transparent
