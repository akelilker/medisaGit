<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// OPTIONS isteği için hızlı yanıt
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Veri dosyasının yolu
$dataDir = __DIR__ . '/data';
$dataFile = $dataDir . '/data.json';

// Eğer data klasörü yoksa oluştur
if (!file_exists($dataDir)) {
    if (!mkdir($dataDir, 0755, true)) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Data klasörü oluşturulamadı',
            'path' => $dataDir
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Klasör okuma iznini kontrol et
if (!is_readable($dataDir)) {
    chmod($dataDir, 0755);
}

// Eğer veri dosyası yoksa boş bir JSON oluştur
if (!file_exists($dataFile)) {
    $emptyData = json_encode([
        'tasitlar' => [],
        'kayitlar' => [],
        'branches' => [],
        'users' => [],
        'ayarlar' => [
            'sirketAdi' => 'Medisa',
            'yetkiliKisi' => '',
            'telefon' => '',
            'eposta' => ''
        ],
        'sifreler' => []
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
    $writeResult = file_put_contents($dataFile, $emptyData, LOCK_EX);
    if ($writeResult === false) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Varsayılan veri dosyası oluşturulamadı',
            'file_path' => $dataFile
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    chmod($dataFile, 0644);
}

// Dosya okuma iznini kontrol et
if (!is_readable($dataFile)) {
    chmod($dataFile, 0644);
    if (!is_readable($dataFile)) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Veri dosyası okunabilir değil',
            'file_path' => $dataFile,
            'permissions' => substr(sprintf('%o', fileperms($dataFile)), -4)
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Veri dosyasını oku ve gönder
$data = @file_get_contents($dataFile);

if ($data === false) {
    // Hata detaylarını al
    $error = error_get_last();
    http_response_code(500);
    echo json_encode([
        'error' => 'Veri okunamadı',
        'file_path' => $dataFile,
        'file_exists' => file_exists($dataFile),
        'is_readable' => is_readable($dataFile),
        'php_error' => $error ? $error['message'] : 'Bilinmeyen hata'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (empty($data) || trim($data) === '') {
    // Dosya boşsa varsayılan veri döndür
    $emptyData = json_encode([
        'tasitlar' => [],
        'kayitlar' => [],
        'branches' => [],
        'users' => [],
        'ayarlar' => [
            'sirketAdi' => 'Medisa',
            'yetkiliKisi' => '',
            'telefon' => '',
            'eposta' => ''
        ],
        'sifreler' => []
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    echo $emptyData;
} else {
    // JSON geçerli mi kontrol et
    $decoded = json_decode($data, true);
    if ($decoded === null && json_last_error() !== JSON_ERROR_NONE) {
        // Geçersiz JSON, varsayılan veri döndür
        $emptyData = json_encode([
            'tasitlar' => [],
            'kayitlar' => [],
            'branches' => [],
            'users' => [],
            'ayarlar' => [
                'sirketAdi' => 'Medisa',
                'yetkiliKisi' => '',
                'telefon' => '',
                'eposta' => ''
            ],
            'sifreler' => []
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        echo $emptyData;
    } else {
        // Başarılı - veriyi gönder
        echo $data;
    }
}
?>
