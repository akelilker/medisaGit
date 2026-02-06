<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
// OPTIONS metoduna da izin veriyoruz
header('Access-Control-Allow-Methods: POST, OPTIONS, GET');
header('Access-Control-Allow-Headers: Content-Type');

// Eğer tarayıcı "Veri gönderebilir miyim?" (OPTIONS) diye sorarsa "Evet" de ve çık.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// POST isteği kontrolü
$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN';
if ($requestMethod !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'error' => 'Sadece POST istekleri kabul edilir',
        'received_method' => $requestMethod,
        'suggestion' => 'Sunucu yapılandırmasını kontrol edin. POST metodu aktif olmalı.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// --- KLASÖR VE DOSYA AYARLARI ---
$dataDir = __DIR__ . '/data';
$backupDir = $dataDir . '/backups'; // Yedeklerin duracağı klasör
$dataFile = $dataDir . '/data.json';

// 1. Data klasörü yoksa oluştur
if (!file_exists($dataDir)) {
    if (!mkdir($dataDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Data klasörü oluşturulamadı'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// 2. Backup klasörü yoksa oluştur
if (!file_exists($backupDir)) {
    if (!mkdir($backupDir, 0755, true)) {
        // Backup klasörü oluşturulamazsa bile devam edelim, ana kayıt bozulmasın ama log düşelim
        error_log('Backup klasörü oluşturulamadı: ' . $backupDir);
    }
}

// Klasör yazma iznini kontrol et (Garanti olsun)
if (!is_writable($dataDir)) {
    chmod($dataDir, 0755);
}

// --- VERİYİ ALMA ---
$input = file_get_contents('php://input');

if ($input === false || empty($input)) {
    http_response_code(400);
    echo json_encode(['error' => 'Veri alınamadı veya boş'], JSON_UNESCAPED_UNICODE);
    exit;
}

// JSON Doğrulama
$data = json_decode($input, true);
if ($data === null) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Geçersiz JSON verisi',
        'json_error' => json_last_error_msg()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// --- YEDEKLEME İŞLEMİ (BACKUP) ---
$backupStatus = "Yedek gerekmedi (ilk dosya)";
if (file_exists($dataFile)) {
    // Tarih formatı: Gün-Ay-Yıl_Saat-Dakika-Saniye (Örn: data_23-01-2026_14-30-05.json)
    $timestamp = date('d-m-Y_H-i-s');
    $backupFile = $backupDir . '/data_' . $timestamp . '.json';
    
    // Mevcut dosyayı yedekler klasörüne kopyala
    if (copy($dataFile, $backupFile)) {
        // Backup dosyası için güvenli izin (0644: owner rw-, group r--, others r--)
        chmod($backupFile, 0644);
        $backupStatus = "Yedek alındı: " . basename($backupFile);
    } else {
        $backupStatus = "Yedek alınamadı (yazma hatası)";
    }
}

// --- ANA KAYIT İŞLEMİ ---
// JSON'u güzelleştirerek (Pretty Print) stringe çevir
$jsonData = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

// Dosyayı kilitleyerek yaz (LOCK_EX: Aynı anda iki kişi yazarsa veri bozulmaz)
$result = file_put_contents($dataFile, $jsonData, LOCK_EX);

if ($result === false) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Veri dosyasına yazılamadı',
        'file_path' => $dataFile
    ], JSON_UNESCAPED_UNICODE);
} else {
    // Dosya izinlerini güvenli hale getir (0644: owner rw-, group r--, others r--)
    chmod($dataFile, 0644);
    
    echo json_encode([
        'success' => true,
        'message' => 'Veri başarıyla kaydedildi',
        'backup_status' => $backupStatus,
        'bytes_written' => $result
    ], JSON_UNESCAPED_UNICODE);
}
?>
