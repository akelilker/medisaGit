\# MEDİSA - Taşıt Yönetim Sistemi (v2.0)



!\[Medisa Logo](icon/logo-header2.svg)



> \*\*"Standart bir kayıt defteri değil; iş kurallarını bilen, kullanıcıyı yönlendiren ve hatayı minimize eden akıllı bir filo asistanı."\*\*



\## 📋 Proje Özeti

MEDİSA; araç filolarının takibini, bakım/onarım geçmişini, yasal süreçlerini (Sigorta/Muayene/UTTS), personel zimmetlerini ve şube bazlı yönetimini sağlamak amacıyla geliştirilmiştir. \*\*Mobil öncelikli (mobile-first)\*\* tasarım prensipleriyle hazırlanmış, \*\*Local-First (Önce Yerel)\*\* mimarisine sahip hibrit bir web uygulamasıdır.



\## 🚀 Temel Özellikler



\### 1. 🧠 Akıllı İş Mantıkları ve Olay Yönetimi

\* \*\*Genişletilmiş Olay Takibi:\*\* Km Güncelleme, Kaza, Sigorta, Kasko, Muayene, Yedek Anahtar, Kredi/Rehin, Lastik, UTTS ve Takip Cihazı gibi 14 farklı kategoride işlem yapabilme.

\* \*\*Otomatik Hesaplama:\*\* Araç tipine göre (Otomobil/Ticari) muayene periyotlarını (3-2-1 yıl) otomatik hesaplar. Sigorta bitişlerini 1 yıl sonrasına otomatik atar.

\* \*\*Tramer ve Hasar Yönetimi:\*\* Tramer kayıtları tarih/tutar bazlı girilebilir.

\* \*\*Dinamik Uyarı Sistemi:\*\* Kritik tarihlere 3 hafta kala \*\*Turuncu\*\*, 3 gün kala \*\*Kırmızı\*\* uyarı verir.



\### 2. 🔧 Gelişmiş Kullanıcı ve Zimmet Yönetimi

\* \*\*Rol Tabanlı Erişim (RBAC):\*\*

&nbsp; \* \*\*Admin:\*\* Tam yetki (Araç/Şube/Kullanıcı Yönetimi).

&nbsp; \* \*\*Sales:\*\* Görüntüleme yetkisi.

&nbsp; \* \*\*Driver (Şoför):\*\* Sadece kendine zimmetli araçları görür.

\* \*\*Akıllı Zimmet:\*\* Araç bir kişiye atandığında, hem araç kartı hem personel profili eş zamanlı güncellenir.

\* \*\*Şoför Portalı:\*\* Sürücüler kendilerine özel panelden araç durumunu takip edip, hatalı bilgiler için "Düzeltme Talebi" oluşturabilir.



\### 3. 📱 Mobil Öncelikli UX \& UI

\* \*\*Drag \& Drop Sütun Yönetimi:\*\* Raporlarda sütunların yerini sürükleyip bırakarak değiştirin; sistem tercihinizi hatırlar.

\* \*\*Akıllı Klavye:\*\* Km ve tutar girişlerinde otomatik sayısal tuş takımı açılır.

\* \*\*PWA Desteği:\*\* "Ana Ekrana Ekle" özelliği ile mobil uygulama gibi çalışır.



\### 4. 🎨 Görsel ve İnteraktif Özellikler

\* \*\*SVG Kaporta Ekspertizi:\*\* Araç şeması üzerinde parçalara tıklayarak (Boyalı/Değişen) işaretleme yapın.

\* \*\*Sekmeli Raporlama:\*\* Stok ve Kullanıcı bazlı detaylı rapor ekranları.



\### 5. 🛠 Teknik Altyapı

\* \*\*Excel Export:\*\* `ExcelJS` ile verileri renkli ve formatlı Excel tablosuna dönüştürür.

\* \*\*Hibrit Veri Yapısı:\*\* Veriler tarayıcıda (LocalStorage) şifreli saklanır, internet geldiğinde PHP backend (`save.php`) ile sunucuya yedeklenir.

\* \*\*Tam Yedekleme:\*\* Tüm sistem tek bir JSON dosyası olarak indirilip geri yüklenebilir.



---



\## 💻 Kurulum ve Kullanım



Bu proje PHP tabanlı basit bir backend kullanır. Çalıştırmak için:



1\. Dosyaları bir PHP destekli sunucuya (Apache/Nginx) yükleyin.

2\. `data/` klasörüne yazma izni (chmod 777 veya 755) verin.

3\. Tarayıcıdan `index.html` dosyasını açın.

4\. \*\*Yönetici Girişi:\*\* Sağ üst menüden ayarlar.

5\. \*\*Sürücü Girişi:\*\* `/driver` klasörü altından erişilir.



---

\*Geliştirici: \[Senin Adın/Ekibin]\*

