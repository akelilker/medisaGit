/* =========================================
   MEDISA KULLANICI MODÜLÜ - SCRIPT
   ========================================= */

// API Base URL: /medisa/ altındaysa her zaman /medisa/driver/ (PHP'ler driver klasöründe)
const API_BASE = (function(){
  var p = document.location.pathname;
  if (p.indexOf('/medisa') === 0) return '/medisa/driver/';
  var base = '/';
  var driverIdx = p.indexOf('/driver');
  if (driverIdx !== -1) {
    base = p.substring(0, driverIdx) + '/';
  } else if (p && p !== '/') {
    base = p.endsWith('/') ? p : p + '/';
  }
  return (base === '/' ? './' : base) + (base !== '/' ? 'driver/' : '');
})();

// Uygulama sürümü (footer #version-display tek kaynak)
const APP_VERSION = 'v78.2';

// Global değişkenler
let currentToken = null;
let currentUser = null;
let currentRecordId = null;
let allHistoryRecords = [];
let allHistoryVehicles = [];

/* =========================================
   LOGIN SAYFASI
   ========================================= */

/* Footer dimmer + versiyon */
(function initLoginFooterDim() {
  const footer = document.getElementById('app-footer');
  const versionEl = document.getElementById('version-display');
  if (versionEl) versionEl.textContent = APP_VERSION;
  if (!footer) return;
  footer.classList.add('dimmed');
  footer.classList.remove('delayed');
  setTimeout(function() {
    if (footer) footer.classList.add('delayed');
  }, 4000);
})();

if (document.getElementById('login-form')) {
    /* Mobilde sayfa açılışında klavye açılmasın - readonly ile engelliyoruz.
       Kullanıcı inputa tıkladığında readonly kaldır, yazabilsin. */
    var usernameInput = document.getElementById('username');
    var passwordInput = document.getElementById('password');
    function removeReadonlyOnFocus(el) {
      if (el && el.hasAttribute && el.hasAttribute('readonly')) {
        el.removeAttribute('readonly');
      }
    }
    if (usernameInput) usernameInput.addEventListener('focus', function() { removeReadonlyOnFocus(this); }, { once: true });
    if (usernameInput) usernameInput.addEventListener('touchstart', function() { removeReadonlyOnFocus(this); }, { once: true, passive: true });
    if (passwordInput) passwordInput.addEventListener('focus', function() { removeReadonlyOnFocus(this); }, { once: true });
    if (passwordInput) passwordInput.addEventListener('touchstart', function() { removeReadonlyOnFocus(this); }, { once: true, passive: true });

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        const errorDiv = document.getElementById('error-message');
        const loginBtn = document.getElementById('login-btn');
        const btnText = loginBtn.querySelector('.btn-text');
        const btnLoader = loginBtn.querySelector('.btn-loader');
        
        errorDiv.classList.remove('show');
        loginBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';
        
        const base = (typeof window.MEDISA_BASE !== 'undefined' ? window.MEDISA_BASE : '/medisa/');
        const loginUrl = window.location.origin + base + 'driver/driver_login.php';
        
        try {
            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                if (remember) {
                    localStorage.setItem('driver_token', data.token);
                } else {
                    sessionStorage.setItem('driver_token', data.token);
                }
                window.location.href = (window.MEDISA_BASE || '/medisa/') + 'driver/dashboard.html';
            } else {
                errorDiv.textContent = data.message || 'Giriş başarısız!';
                errorDiv.classList.add('show');
                loginBtn.disabled = false;
                btnText.style.display = 'inline';
                btnLoader.style.display = 'none';
            }
        } catch (error) {
            console.error('Hata:', error);
            errorDiv.textContent = 'Bağlantı hatası! Lütfen tekrar deneyin.';
            errorDiv.classList.add('show');
            loginBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });
}

/* =========================================
   DASHBOARD SAYFASI
   ========================================= */

if (document.getElementById('vehicles-list')) {
    window.addEventListener('DOMContentLoaded', async () => {
        await loadDashboard();
    });
}

async function loadDashboard() {
    const token = localStorage.getItem('driver_token') || 
                  sessionStorage.getItem('driver_token');
    
    if (!token) {
        window.location.href = (window.MEDISA_BASE || '/medisa/') + 'driver/index.html';
        return;
    }
    
    currentToken = token;
    
    try {
        const response = await fetch(API_BASE + 'driver_data.php', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        
        const data = await response.json();
        
        if (!data.success) {
            alert('Oturum süresi doldu! Lütfen tekrar giriş yapın.');
            logout();
            return;
        }
        
        currentUser = data.user;
        allHistoryRecords = data.records || [];
        allHistoryVehicles = data.vehicles || [];
        const userNameEl = document.getElementById('driver-user-name');
        if (userNameEl && currentUser && currentUser.isim) {
            userNameEl.textContent = currentUser.isim;
        }
        
        const currentPeriod = data.current_period;
        document.getElementById('loading-spinner').style.display = 'none';
        
        if (data.vehicles.length === 0) {
            document.getElementById('empty-state').style.display = 'block';
            return;
        }
        
        const container = document.getElementById('vehicles-list');
        container.innerHTML = '';
        const vehicles = data.vehicles;
        const records = data.records;

        if (vehicles.length > 1) {
            const wrap = document.createElement('div');
            wrap.className = 'driver-multi-vehicle-wrap';
            const first = vehicles[0];
            wrap.innerHTML = `
                <div class="driver-plate-row">
                    <h3 id="driver-current-plaka" class="driver-current-plaka">${first.plaka}</h3>
                    <button type="button" class="driver-plate-trigger" onclick="toggleDriverPlateDropdown(event)" aria-label="Taşıt seç" title="Diğer taşıtlar">
                        <span class="driver-plate-chevron" aria-hidden="true">▾</span>
                    </button>
                    <div id="driver-plate-dropdown" class="driver-plate-dropdown" role="listbox" style="display:none"></div>
                </div>
                <div class="driver-cards-inner"></div>
            `;
            const cardsInner = wrap.querySelector('.driver-cards-inner');
            vehicles.forEach((vehicle, index) => {
                const card = createVehicleCard(vehicle, records, currentPeriod);
                card.setAttribute('data-vehicle-id', vehicle.id);
                if (index > 0) card.classList.add('driver-card-hidden');
                cardsInner.appendChild(card);
            });
            container.appendChild(wrap);
            const dropdown = document.getElementById('driver-plate-dropdown');
            const currentPlakaEl = document.getElementById('driver-current-plaka');
            dropdown.innerHTML = vehicles.map(v => `<div class="driver-plate-dropdown-item" role="option" data-vehicle-id="${v.id}" tabindex="0">${v.plaka}${v.marka || v.model ? ' – ' + [v.marka, v.model].filter(Boolean).join(' ') : ''}</div>`).join('');
            dropdown.querySelectorAll('.driver-plate-dropdown-item').forEach(item => {
                item.addEventListener('click', function () {
                    const vehicleId = this.getAttribute('data-vehicle-id');
                    selectDriverVehicle(vehicleId, vehicles, currentPlakaEl, wrap);
                    dropdown.style.display = 'none';
                });
            });
            document.addEventListener('click', function closePlateDropdown(ev) {
                if (wrap.contains(ev.target)) return;
                dropdown.style.display = 'none';
            });
        } else {
            vehicles.forEach(vehicle => {
                const card = createVehicleCard(vehicle, records, currentPeriod);
                container.appendChild(card);
            });
        }
        setupEkstraNotAutoResize();
        setupKmInputs();
        
    } catch (error) {
        console.error('Veri yükleme hatası:', error);
        alert('Veriler yüklenemedi! Lütfen sayfayı yenileyin.');
    }
}

window.toggleDriverPlateDropdown = function(ev) {
    ev.stopPropagation();
    const dropdown = document.getElementById('driver-plate-dropdown');
    if (!dropdown) return;
    const isOpen = dropdown.style.display === 'block';
    dropdown.style.display = isOpen ? 'none' : 'block';
};

function selectDriverVehicle(vehicleId, vehicles, currentPlakaEl, wrap) {
    const vehicle = vehicles.find(v => String(v.id) === String(vehicleId));
    if (!vehicle || !currentPlakaEl || !wrap) return;
    currentPlakaEl.textContent = vehicle.plaka;
    const cards = wrap.querySelectorAll('.driver-cards-inner .vehicle-card');
    cards.forEach(card => {
        if (card.getAttribute('data-vehicle-id') === String(vehicleId)) {
            card.classList.remove('driver-card-hidden');
        } else {
            card.classList.add('driver-card-hidden');
        }
    });
}

function createVehicleCard(vehicle, records, currentPeriod) {
    const card = document.createElement('div');
    card.className = 'vehicle-card';
    
    const existingRecord = records.find(r => 
        r.arac_id === vehicle.id && 
        r.donem === currentPeriod
    );

    // Bakım veya Kaza varsa panelleri açık getir
    const bakimVar = existingRecord && (existingRecord.bakim_durumu || (existingRecord.bakim_aciklama || '').trim());
    const kazaVar = existingRecord && (existingRecord.kaza_durumu || (existingRecord.kaza_aciklama || '').trim());
    
    card.innerHTML = `
        <div class="vehicle-header">
            <h3>${vehicle.plaka}</h3>
            <p>${vehicle.marka} ${vehicle.model}</p>
        </div>
        
        <div class="form-group driver-km-form">
<label for="km-${vehicle.id}">Güncel KM</label>
            <div class="driver-km-input-wrap">
                <span class="driver-km-fake-placeholder" id="km-placeholder-${vehicle.id}">Örn: 45230</span>
                <input type="text"
                       id="km-${vehicle.id}"
                       class="driver-km-input"
                       inputmode="numeric"
                       pattern="[0-9]*"
                       maxlength="8"
                       data-vehicle-id="${vehicle.id}"
                       value="${existingRecord ? existingRecord.guncel_km : ''}"
                       required
                       autocomplete="off"
                       aria-label="Güncel kilometre">
            </div>
        </div>
        
        <div class="driver-report-actions">
            <div class="driver-report-item">
                <button type="button" class="driver-report-btn driver-report-btn-bakim" onclick="toggleReportBlock('bakim', ${vehicle.id})">
                    <span class="driver-report-btn-icon" aria-hidden="true">🛠</span>
                    <span class="driver-report-btn-text">Bakım Bildir</span>
                </button>
                <div id="bakim-block-${vehicle.id}" class="driver-report-block driver-report-block-bakim ${bakimVar ? 'show' : ''}">
                    <div class="form-group">
                        <label for="bakim-tarih-${vehicle.id}">Bakım Tarihi</label>
                        <input type="date" id="bakim-tarih-${vehicle.id}" class="driver-bakim-input" value="${existingRecord && existingRecord.bakim_tarih ? existingRecord.bakim_tarih : new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label for="bakim-detay-${vehicle.id}">Açıklama</label>
                        <textarea id="bakim-detay-${vehicle.id}" class="driver-report-textarea-auto driver-bakim-textarea" rows="1" placeholder="Bakım detayını yazın..." maxlength="500">${existingRecord ? (existingRecord.bakim_aciklama || '') : ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="bakim-servis-${vehicle.id}">İşlemi Yapan Servis</label>
                        <input type="text" id="bakim-servis-${vehicle.id}" class="driver-bakim-input" placeholder="Servis adı">
                    </div>
                    <div class="form-group">
                        <label for="bakim-kisi-${vehicle.id}">Taşıtı Bakıma Götüren Kişi</label>
                        <input type="text" id="bakim-kisi-${vehicle.id}" class="driver-bakim-input" placeholder="Kişi adı">
                    </div>
                    <div class="form-group">
                        <label for="bakim-km-${vehicle.id}">Km</label>
                        <input type="text" id="bakim-km-${vehicle.id}" class="driver-bakim-input" placeholder="50.000" inputmode="numeric">
                    </div>
                    <div class="form-group">
                        <label for="bakim-tutar-${vehicle.id}">Tutar (TL)</label>
                        <input type="text" id="bakim-tutar-${vehicle.id}" class="driver-bakim-input" placeholder="2.500" inputmode="numeric">
                    </div>
                </div>
            </div>
            <div class="driver-report-item">
                <button type="button" class="driver-report-btn driver-report-btn-kaza" onclick="toggleReportBlock('kaza', ${vehicle.id})">
                    <span class="driver-report-btn-icon" aria-hidden="true">💥</span>
                    <span class="driver-report-btn-text">Kaza Bildir</span>
                </button>
                <div id="kaza-block-${vehicle.id}" class="driver-report-block driver-report-block-kaza ${kazaVar ? 'show' : ''}">
                    <div class="form-group">
                        <label for="kaza-tarih-${vehicle.id}">Kaza Tarihi</label>
                        <input type="date" id="kaza-tarih-${vehicle.id}" class="driver-kaza-input" value="${existingRecord && existingRecord.kaza_tarih ? existingRecord.kaza_tarih : new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label for="kaza-detay-${vehicle.id}">Açıklama</label>
                        <textarea id="kaza-detay-${vehicle.id}" class="driver-report-textarea-auto driver-kaza-textarea" rows="1" placeholder="Kaza açıklamasını yazın..." maxlength="500">${existingRecord ? (existingRecord.kaza_aciklama || '') : ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="kaza-tutar-${vehicle.id}">Hasar Tutarı (TL)</label>
                        <input type="text" id="kaza-tutar-${vehicle.id}" class="driver-kaza-input" placeholder="5.000" inputmode="numeric">
                    </div>
                </div>
            </div>
        </div>
        
        <div class="form-group driver-ekstra-not-form">
            <label for="not-${vehicle.id}">Not</label>
            <textarea id="not-${vehicle.id}" class="driver-ekstra-not" rows="1"
                      placeholder="Varsa Belirtin.."
                      maxlength="500">${existingRecord ? existingRecord.ekstra_not : ''}</textarea>
        </div>
        
        <button onclick="saveVehicleData(${vehicle.id})" 
                class="btn-save" id="btn-save-${vehicle.id}">
            Bildir
        </button>
        
        <div id="status-${vehicle.id}" class="status-message"></div>
    `;
    
    return card;
}

function setupKmInputs() {
    document.querySelectorAll('.vehicle-card input.driver-km-input').forEach(input => {
        var ph = input.parentElement && input.parentElement.querySelector('.driver-km-fake-placeholder');
        function togglePlaceholder() {
            if (ph) ph.style.visibility = (input.value || document.activeElement === input) ? 'hidden' : 'visible';
        }
        togglePlaceholder();
        input.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 8);
            togglePlaceholder();
        });
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            var text = '';
            try {
                text = (e.clipboardData || window.clipboardData).getData('text');
            } catch (err) {}
            this.value = (this.value + (text || '')).replace(/\D/g, '').slice(0, 8);
            togglePlaceholder();
        });
        input.addEventListener('focus', togglePlaceholder);
        input.addEventListener('blur', togglePlaceholder);
    });
}

function setupEkstraNotAutoResize() {
    document.querySelectorAll('.vehicle-card textarea.driver-ekstra-not').forEach(ta => {
        function resize() {
            ta.style.height = 'auto';
            ta.style.height = ta.scrollHeight + 'px';
        }
        ta.addEventListener('input', resize);
        resize();
    });
    document.querySelectorAll('.vehicle-card textarea.driver-report-textarea-auto').forEach(ta => {
        function resize() {
            ta.style.height = 'auto';
            ta.style.height = ta.scrollHeight + 'px';
        }
        ta.addEventListener('input', resize);
        resize();
    });
}

// Blok Aç/Kapa
window.toggleReportBlock = function(type, vehicleId) {
    const block = document.getElementById(`${type}-block-${vehicleId}`);
    if (!block) return;
    
    const isShown = block.classList.contains('show');
    if (isShown) {
        block.classList.remove('show');
    } else {
        block.classList.add('show');
        // Açılınca tarih boşsa bugünün tarihini ver
        const dateEl = document.getElementById(`${type}-tarih-${vehicleId}`);
        if(dateEl && !dateEl.value) {
             dateEl.value = new Date().toISOString().split('T')[0];
        }
    }
};

// Kaydetme
window.saveVehicleData = async function(vehicleId) {
    const km = document.getElementById(`km-${vehicleId}`).value;
    
    const bakimBlock = document.getElementById(`bakim-block-${vehicleId}`);
    const bakimAciklama = document.getElementById(`bakim-detay-${vehicleId}`).value.trim();
    const bakimTarih = document.getElementById(`bakim-tarih-${vehicleId}`).value;
    const bakimServis = document.getElementById(`bakim-servis-${vehicleId}`)?.value.trim() || '';
    const bakimKisi = document.getElementById(`bakim-kisi-${vehicleId}`)?.value.trim() || '';
    const bakimKm = document.getElementById(`bakim-km-${vehicleId}`)?.value.trim() || '';
    const bakimTutar = document.getElementById(`bakim-tutar-${vehicleId}`)?.value.trim() || '';
    
    const kazaBlock = document.getElementById(`kaza-block-${vehicleId}`);
    const kazaAciklama = document.getElementById(`kaza-detay-${vehicleId}`).value.trim();
    const kazaTarih = document.getElementById(`kaza-tarih-${vehicleId}`).value;
    const kazaHasarTutari = document.getElementById(`kaza-tutar-${vehicleId}`)?.value.trim() || '';

    const not = document.getElementById(`not-${vehicleId}`).value;

    // Panel açık veya açıklama doluysa "Var" say
    const bakimVar = bakimBlock.classList.contains('show') || bakimAciklama.length > 0;
    const kazaVar = kazaBlock.classList.contains('show') || kazaAciklama.length > 0;

    if (!km || km <= 0) {
        alert('Lütfen geçerli bir KM değeri girin!');
        document.getElementById(`km-${vehicleId}`).focus();
        return;
    }

    if (bakimVar && bakimAciklama === '') {
        alert('Bakım bildirdiniz, lütfen açıklama girin veya iptal etmek için paneli kapatın.');
        bakimBlock.classList.add('show');
        return;
    }

    if (kazaVar && kazaAciklama === '') {
        alert('Kaza bildirdiniz, lütfen açıklama girin veya iptal etmek için paneli kapatın.');
        kazaBlock.classList.add('show');
        return;
    }
    
    const btn = document.getElementById(`btn-save-${vehicleId}`);
    btn.disabled = true;
    btn.textContent = 'Kaydediliyor...';
    
    try {
        const response = await fetch(API_BASE + 'driver_save.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + currentToken
            },
            body: JSON.stringify({
                arac_id: vehicleId,
                guncel_km: parseInt(km),
                bakim_durumu: bakimVar ? 1 : 0,
                bakim_aciklama: bakimAciklama,
                bakim_tarih: bakimTarih,
                bakim_servis: bakimServis,
                bakim_kisi: bakimKisi,
                bakim_km: bakimKm,
                bakim_tutar: bakimTutar,
                kaza_durumu: kazaVar ? 1 : 0,
                kaza_aciklama: kazaAciklama,
                kaza_tarih: kazaTarih,
                kaza_hasar_tutari: kazaHasarTutari,
                ekstra_not: not
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showStatus(vehicleId, 'success', '✅ Kaydedildi!');
            btn.textContent = 'GÜNCELLE';
            if (data.warning) {
                setTimeout(() => { alert(data.warning); }, 500);
            }
        } else {
            showStatus(vehicleId, 'error', '❌ ' + data.message);
            btn.textContent = 'KAYDET';
        }
        
    } catch (error) {
        console.error('Kaydetme hatası:', error);
        showStatus(vehicleId, 'error', '❌ Bağlantı hatası!');
        btn.textContent = 'KAYDET';
    } finally {
        btn.disabled = false;
    }
};

// Durum mesajı
function showStatus(vehicleId, type, message) {
    const statusDiv = document.getElementById(`status-${vehicleId}`);
    statusDiv.className = `status-message ${type}`;
    statusDiv.textContent = message;
    
    setTimeout(() => {
        statusDiv.className = 'status-message';
        statusDiv.textContent = '';
    }, 5000);
}

// Dönem formatı
function formatPeriod(period) {
    const [year, month] = period.split('-');
    const months = ['OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN',
                    'TEMMUZ', 'AĞUSTOS', 'EYLÜL', 'EKİM', 'KASIM', 'ARALIK'];
    return `${months[parseInt(month) - 1]} ${year}`;
}

function formatKm(value) {
    if (value == null || value === '') return '';
    const numStr = String(value).replace(/[^\d]/g, '');
    if (!numStr) return '';
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Geçmiş kayıtlar - custom dropdown
window.showHistory = function() {
    const hiddenInput = document.getElementById('history-vehicle-filter');
    const triggerText = document.querySelector('.history-vehicle-trigger-text');
    const dropdown = document.getElementById('history-vehicle-dropdown');
    const trigger = document.querySelector('.history-vehicle-trigger');
    dropdown.innerHTML = '';
    const optAll = document.createElement('div');
    optAll.className = 'history-vehicle-option';
    optAll.dataset.value = '';
    optAll.textContent = 'Tüm Taşıtlar';
    optAll.onclick = function() { selectHistoryVehicle('', 'Tüm Taşıtlar'); };
    dropdown.appendChild(optAll);
    allHistoryVehicles.forEach(v => {
        const opt = document.createElement('div');
        opt.className = 'history-vehicle-option';
        opt.dataset.value = String(v.id);
        opt.textContent = [v.plaka, v.marka, v.model].filter(Boolean).join(' ');
        opt.onclick = function() { selectHistoryVehicle(String(v.id), opt.textContent); };
        dropdown.appendChild(opt);
    });
    let defaultVal = '';
    let defaultText = 'Tüm Taşıtlar';
    if (allHistoryVehicles.length === 1) {
        defaultVal = String(allHistoryVehicles[0].id);
        defaultText = [allHistoryVehicles[0].plaka, allHistoryVehicles[0].marka, allHistoryVehicles[0].model].filter(Boolean).join(' ');
    }
    hiddenInput.value = defaultVal;
    if (triggerText) triggerText.textContent = defaultText;
    if (dropdown) dropdown.style.display = 'none';
    if (trigger) trigger.classList.remove('history-vehicle-trigger-open');
    renderHistoryList();
    document.getElementById('history-modal').classList.add('show');
};

window.toggleHistoryVehicleDropdown = function(ev) {
    ev.stopPropagation();
    const dropdown = document.getElementById('history-vehicle-dropdown');
    const trigger = document.querySelector('.history-vehicle-trigger');
    if (!dropdown || !trigger) return;
    const isOpen = dropdown.style.display !== 'none';
    if (isOpen) {
        dropdown.style.display = 'none';
        trigger.classList.remove('history-vehicle-trigger-open');
    } else {
        dropdown.style.display = 'block';
        trigger.classList.add('history-vehicle-trigger-open');
    }
};

function selectHistoryVehicle(value, text) {
    const hiddenInput = document.getElementById('history-vehicle-filter');
    const triggerText = document.querySelector('.history-vehicle-trigger-text');
    const dropdown = document.getElementById('history-vehicle-dropdown');
    const trigger = document.querySelector('.history-vehicle-trigger');
    if (hiddenInput) hiddenInput.value = value;
    if (triggerText) triggerText.textContent = text;
    if (dropdown) dropdown.style.display = 'none';
    if (trigger) trigger.classList.remove('history-vehicle-trigger-open');
    renderHistoryList();
}

document.addEventListener('click', function(ev) {
    const wrap = document.querySelector('.history-vehicle-dropdown-wrap');
    const dropdown = document.getElementById('history-vehicle-dropdown');
    if (wrap && dropdown && dropdown.style.display !== 'none' && !wrap.contains(ev.target)) {
        dropdown.style.display = 'none';
        const trigger = document.querySelector('.history-vehicle-trigger');
        if (trigger) trigger.classList.remove('history-vehicle-trigger-open');
    }
});

function renderHistoryList() {
    const vehicleFilter = document.getElementById('history-vehicle-filter').value;
    const filtered = vehicleFilter
        ? allHistoryRecords.filter(r => String(r.arac_id) === String(vehicleFilter))
        : allHistoryRecords;
    const sorted = filtered.slice().sort((a, b) => (b.donem + (b.kayit_tarihi || '')).localeCompare(a.donem + (a.kayit_tarihi || '')));
    const listEl = document.getElementById('history-list');
    listEl.innerHTML = '';
    if (sorted.length === 0) {
        listEl.innerHTML = '<p class="history-empty">Geçmiş kayıt bulunamadı.</p>';
        return;
    }
    window._historyRecordMap = window._historyRecordMap || {};
    sorted.forEach(record => {
        window._historyRecordMap[record.id] = record;
        const vehicle = allHistoryVehicles.find(v => v.id === record.arac_id);
        const plaka = vehicle ? vehicle.plaka : record.arac_id;
        const periodLabel = formatPeriod(record.donem);
        const kayitTarihi = record.kayit_tarihi
            ? new Date(record.kayit_tarihi).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            : '-';
        const card = document.createElement('div');
        card.className = 'history-card';
        card.innerHTML = `
            <div class="history-header">
                <span class="history-period">${periodLabel}</span>
                <span class="history-vehicle">${plaka}</span>
            </div>
            <div class="history-details">
                <p><strong>KM:</strong> ${formatKm(record.guncel_km) || '0'}</p>
                <p><strong>Bakım:</strong> ${record.bakim_durumu ? (record.bakim_aciklama || 'Var') : 'Yok'}</p>
                <p><strong>Kaza:</strong> ${record.kaza_durumu ? (record.kaza_aciklama || 'Var') : 'Yok'}</p>
                <p><strong>Kayıt:</strong> ${kayitTarihi}</p>
            </div>
            <button onclick="showEditRequest(${record.id})" class="btn-edit-request">Düzeltme Talep Et</button>
        `;
        listEl.appendChild(card);
    });
}

window.closeHistory = function() {
    document.getElementById('history-modal').classList.remove('show');
};

// Düzeltme talebi
window.showEditRequest = function(recordId) {
    const record = window._historyRecordMap && window._historyRecordMap[recordId];
    if (!record) return;
    currentRecordId = recordId;
    document.getElementById('current-km').textContent = formatKm(record.guncel_km) || '0';
    document.getElementById('new-km').value = formatKm(record.guncel_km) || '';
    document.getElementById('current-bakim').textContent = record.bakim_durumu ? (record.bakim_aciklama || 'Var') : 'Yok';
    document.getElementById('new-bakim').value = record.bakim_durumu ? (record.bakim_aciklama || '') : '';
    document.getElementById('current-kaza').textContent = record.kaza_durumu ? (record.kaza_aciklama || 'Var') : 'Yok';
    document.getElementById('new-kaza').value = record.kaza_durumu ? (record.kaza_aciklama || '') : '';
    document.getElementById('edit-reason').value = '';
    document.getElementById('edit-request-modal').classList.add('show');
};

window.closeEditRequest = function() {
    document.getElementById('edit-request-modal').classList.remove('show');
    currentRecordId = null;
};

window.submitEditRequest = async function() {
    const record = window._historyRecordMap && window._historyRecordMap[currentRecordId];
    if (!record) return;
    const newKmVal = document.getElementById('new-km').value.trim();
    const newKm = newKmVal ? parseInt(newKmVal.replace(/\./g, ''), 10) : null;
    const newBakim = document.getElementById('new-bakim').value.trim();
    const newKaza = document.getElementById('new-kaza').value.trim();
    const reason = document.getElementById('edit-reason').value.trim();
    const currentBakim = record.bakim_durumu ? (record.bakim_aciklama || '') : '';
    const currentKaza = record.kaza_durumu ? (record.kaza_aciklama || '') : '';
    const kmChanged = newKm !== null && newKm !== (record.guncel_km || 0);
    const bakimChanged = (newBakim || '') !== (currentBakim || '');
    const kazaChanged = (newKaza || '') !== (currentKaza || '');
    if (!kmChanged && !bakimChanged && !kazaChanged) {
        alert('En az bir alanda değişiklik yapmalısınız!');
        return;
    }
    if (!reason) {
        alert('Düzeltme sebebini yazmalısınız!');
        return;
    }
    if (newKm !== null && newKm <= 0) {
        alert('Geçerli bir KM değeri girin!');
        return;
    }
    const payload = { kayit_id: currentRecordId, sebep: reason };
    if (kmChanged && newKm !== null) payload.yeni_km = newKm;
    if (bakimChanged) {
        payload.yeni_bakim_durumu = newBakim ? 1 : 0;
        payload.yeni_bakim_aciklama = newBakim;
    }
    if (kazaChanged) {
        payload.yeni_kaza_durumu = newKaza ? 1 : 0;
        payload.yeni_kaza_aciklama = newKaza;
    }
    try {
        const response = await fetch(API_BASE + 'driver_request.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + currentToken
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Düzeltme talebiniz gönderildi. Admin onayı bekleniyor.');
            closeEditRequest();
            if (document.getElementById('history-list').parentElement && document.getElementById('history-modal').classList.contains('show')) {
                renderHistoryList();
            }
        } else {
            alert('❌ ' + data.message);
        }
        
    } catch (error) {
        alert('❌ Bağlantı hatası!');
    }
};

// Çıkış
window.logout = function() {
    localStorage.removeItem('driver_token');
    sessionStorage.removeItem('driver_token');
    window.location.href = (window.MEDISA_BASE || '/medisa/') + 'driver/index.html';
};

/* Service Worker (PWA cache) – driver sayfaları doğrudan açıldığında da çalışır */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    var swPaths = ['../sw.js', '/sw.js', '/medisa/sw.js'];
    var currentPathIndex = 0;
    function tryRegisterSW() {
      if (currentPathIndex >= swPaths.length) return;
      var swPath = swPaths[currentPathIndex];
      navigator.serviceWorker.register(swPath, { scope: './' })
        .then(function() {})
        .catch(function(error) {
          if (error.message && (
            error.message.indexOf('404') !== -1 ||
            error.message.indexOf('Failed to fetch') !== -1 ||
            error.message.indexOf('bad HTTP response code') !== -1
          )) {
            currentPathIndex++;
            tryRegisterSW();
          } else if (error.message && (error.message.indexOf('redirect') !== -1 || error.message.indexOf('Redirect') !== -1)) {
            currentPathIndex++;
            tryRegisterSW();
          } else if (error.name === 'SecurityError') {
            currentPathIndex++;
            tryRegisterSW();
          } else {
            currentPathIndex++;
            tryRegisterSW();
          }
        });
    }
    tryRegisterSW();
  });
}