// Admin Dashboard JavaScript
const ADMIN_BASE = `${location.origin}/Backend`;
const API_URL = `${ADMIN_BASE}/api.php`;
const UPLOAD_URL = `${ADMIN_BASE}/upload.php`;
let galleryImages = [];

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = e.target.dataset.view;
        switchView(view);
    });
});

function switchView(view) {
    // Update active nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    // Update views
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
    });
    document.getElementById(`view-${view}`).classList.add('active');
    
    // Update title
    const titles = {
        'dashboard': 'Dashboard',
        'einstellungen': 'Website-Einstellungen',
        'alpakas': 'Alpakas verwalten',
        'termine': 'Termine verwalten',
        'buchungen': 'Buchungen',
        'kontakt': 'Kontaktanfragen',
        'galerie': 'Galerie',
        'benutzer': 'Benutzerverwaltung'
    };
    document.getElementById('page-title').textContent = titles[view];
    
    // Load data
    loadViewData(view);
}

async function loadViewData(view) {
    switch(view) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'einstellungen':
            loadEinstellungen();
            break;
        case 'alpakas':
            loadAlpakas();
            break;
        case 'termine':
            loadTermine();
            break;
        case 'buchungen':
            loadBuchungen();
            break;
        case 'kontakt':
            loadKontakt();
            break;
        case 'galerie':
            loadGalerie();
            break;
        case 'benutzer':
            loadBenutzer();
            break;
    }
}

// Dashboard
async function loadDashboard() {
    try {
        const [alpakas, termine] = await Promise.all([
            fetch(`${API_URL}?action=alpakas`).then(r => r.json()),
            fetch(`${API_URL}?action=termine`).then(r => r.json())
        ]);
        
        document.getElementById('stat-alpakas').textContent = alpakas.data?.length || 0;
        document.getElementById('stat-termine').textContent = termine.data?.length || 0;
        document.getElementById('stat-buchungen').textContent = '0';
        document.getElementById('stat-kontakt').textContent = '0';
    } catch (error) {
        console.error('Fehler beim Laden:', error);
    }
}

// Alpakas
async function loadAlpakas() {
    try {
        const response = await fetch(`${API_URL}?action=alpakas`);
        const data = await response.json();
        
        const container = document.getElementById('alpakas-list');
        
        if (data.success && data.data.length > 0) {
            container.innerHTML = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Geschlecht</th>
                            <th>Farbe</th>
                            <th>Geburtsdatum</th>
                            <th>Status</th>
                            <th>Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.data.map(alpaka => `
                            <tr>
                                <td><strong>${alpaka.name}</strong></td>
                                <td>${alpaka.geschlecht}</td>
                                <td>${alpaka.farbe}</td>
                                <td>${formatDate(alpaka.geburtsdatum)}</td>
                                <td><span class="badge badge-success">Aktiv</span></td>
                                <td>
                                    <button class="btn btn-sm btn-primary">Bearbeiten</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            container.innerHTML = '<div class="loading">Keine Alpakas vorhanden</div>';
        }
    } catch (error) {
        console.error('Fehler:', error);
    }
}

// Termine
async function loadTermine() {
    try {
        const response = await fetch(`${API_URL}?action=termine`);
        const data = await response.json();
        
        const container = document.getElementById('termine-list');
        
        if (data.success && data.data.length > 0) {
            container.innerHTML = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Titel</th>
                            <th>Datum</th>
                            <th>Uhrzeit</th>
                            <th>Max. Teilnehmer</th>
                            <th>Preis</th>
                            <th>Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.data.map(termin => `
                            <tr>
                                <td><strong>${termin.titel}</strong></td>
                                <td>${formatDate(termin.datum)}</td>
                                <td>${termin.uhrzeit_von} - ${termin.uhrzeit_bis}</td>
                                <td>${termin.max_teilnehmer}</td>
                                <td>${termin.preis} €</td>
                                <td>
                                    <button class="btn btn-sm btn-primary">Bearbeiten</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            container.innerHTML = '<div class="loading">Keine Termine vorhanden</div>';
        }
    } catch (error) {
        console.error('Fehler:', error);
    }
}

// Buchungen
async function loadBuchungen() {
    const container = document.getElementById('buchungen-list');
    container.innerHTML = '<div class="loading">Noch keine Buchungen vorhanden</div>';
}

// Kontakt
async function loadKontakt() {
    const container = document.getElementById('kontakt-list');
    container.innerHTML = '<div class="loading">Keine Kontaktanfragen vorhanden</div>';
}

// Galerie
async function loadGalerie() {
    try {
        const response = await fetch(`${UPLOAD_URL}?typ=galerie`);
        const data = await response.json();
        galleryImages = data.success ? data.data : [];
        const container = document.getElementById('galerie-list');
        
        if (data.success && galleryImages.length > 0) {
            container.innerHTML = galleryImages.map(bild => `
                <div class="gallery-item" onclick="showImageDetail(${bild.id})" style="cursor: pointer;">
                    <img src="${ADMIN_BASE}${bild.dateipfad}" alt="${bild.beschreibung || 'Bild'}">
                    <div class="gallery-item-info">
                        <small>${bild.dateiname}</small>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="loading">Keine Bilder vorhanden</div>';
        }
    } catch (error) {
        console.error('Fehler beim Laden der Galerie:', error);
        document.getElementById('galerie-list').innerHTML = '<div class="loading">Fehler beim Laden</div>';
    }
}

// Bild Detail Popup
function showImageDetail(id) {
    const bild = galleryImages.find(b => b.id === id);
    if (!bild) return;
    document.getElementById('detail-image').src = `${ADMIN_BASE}${bild.dateipfad}`;
    document.getElementById('detail-id').textContent = bild.id;
    document.getElementById('detail-dateiname').textContent = bild.dateiname;
    document.getElementById('detail-typ').textContent = bild.typ || 'galerie';
    document.getElementById('detail-beschreibung').textContent = bild.beschreibung || '—';
    document.getElementById('detail-pfad').textContent = bild.dateipfad;
    document.getElementById('detail-erstellt').textContent = formatDate(bild.erstellt_am);
    const delBtn = document.getElementById('detail-delete-btn');
    delBtn.onclick = () => { deleteBild(bild.id); closeImageDetail(); };
    document.getElementById('image-detail-modal').classList.add('active');
}

function closeImageDetail() {
    document.getElementById('image-detail-modal').classList.remove('active');
}

function copyBildUrl() {
    const pfad = document.getElementById('detail-pfad').textContent.trim();
    const fullUrl = `${ADMIN_BASE}${pfad}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
        alert('URL kopiert!');
    }).catch(() => alert('Kopieren fehlgeschlagen'));
}

// ============================================
// BILD-UPLOAD FUNKTIONEN
// ============================================

let selectedFile = null;
let alpakasList = [];
let termineList = [];

// Upload-Modal öffnen
function showUploadModal() {
    document.getElementById('upload-modal').classList.add('active');
    loadUploadOptions();
}

// Upload-Modal schließen
function closeUploadModal() {
    document.getElementById('upload-modal').classList.remove('active');
    document.getElementById('upload-form').reset();
    removePreview();
    selectedFile = null;
}

// Typ-Änderung behandeln
async function handleTypeChange() {
    const typ = document.getElementById('upload-typ').value;
    const referenzGroup = document.getElementById('referenz-group');
    const referenzLabel = document.getElementById('referenz-label');
    const referenzSelect = document.getElementById('upload-referenz');
    
    if (typ === 'galerie') {
        referenzGroup.style.display = 'none';
        return;
    }
    
    referenzGroup.style.display = 'block';
    
    if (typ === 'alpaka') {
        referenzLabel.textContent = 'Alpaka auswählen';
        if (alpakasList.length === 0) {
            await loadAlpakasForUpload();
        }
        referenzSelect.innerHTML = '<option value="">Bitte wählen...</option>' +
            alpakasList.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    } else if (typ === 'termin') {
        referenzLabel.textContent = 'Termin auswählen';
        if (termineList.length === 0) {
            await loadTermineForUpload();
        }
        referenzSelect.innerHTML = '<option value="">Bitte wählen...</option>' +
            termineList.map(t => `<option value="${t.id}">${t.titel} (${formatDate(t.datum)})</option>`).join('');
    }
}

// Alpakas für Dropdown laden
async function loadAlpakasForUpload() {
    try {
        const response = await fetch(`${API_URL}?action=alpakas`);
        const data = await response.json();
        if (data.success) {
            alpakasList = data.data;
        }
    } catch (error) {
        console.error('Fehler beim Laden der Alpakas:', error);
    }
}

// Termine für Dropdown laden
async function loadTermineForUpload() {
    try {
        const response = await fetch(`${API_URL}?action=termine`);
        const data = await response.json();
        if (data.success) {
            termineList = data.data;
        }
    } catch (error) {
        console.error('Fehler beim Laden der Termine:', error);
    }
}

// Upload-Optionen initial laden
async function loadUploadOptions() {
    await Promise.all([
        loadAlpakasForUpload(),
        loadTermineForUpload()
    ]);
}

// Datei-Auswahl behandeln
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        selectedFile = file;
        showPreview(file);
    }
}

// Vorschau anzeigen
function showPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('preview-image').src = e.target.result;
        document.querySelector('.upload-placeholder').style.display = 'none';
        document.getElementById('upload-preview').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// Vorschau entfernen
function removePreview() {
    document.querySelector('.upload-placeholder').style.display = 'block';
    document.getElementById('upload-preview').style.display = 'none';
    document.getElementById('upload-file').value = '';
    selectedFile = null;
}

// Drag & Drop Setup
const dropZone = document.getElementById('drop-zone');

dropZone.addEventListener('click', () => {
    document.getElementById('upload-file').click();
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        selectedFile = files[0];
        document.getElementById('upload-file').files = files;
        showPreview(files[0]);
    }
});

// Upload-Formular absenden
document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
        alert('Bitte wähle ein Bild aus!');
        return;
    }
    
    const formData = new FormData();
    formData.append('bild', selectedFile);
    formData.append('typ', document.getElementById('upload-typ').value);
    formData.append('beschreibung', document.getElementById('upload-beschreibung').value);
    formData.append('sortierung', document.getElementById('upload-sortierung').value);
    
    const referenzId = document.getElementById('upload-referenz').value;
    if (referenzId) {
        formData.append('referenz_id', referenzId);
    }
    
    // Progress anzeigen
    const progressDiv = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const submitBtn = document.getElementById('upload-submit');
    
    progressDiv.style.display = 'block';
    submitBtn.disabled = true;
    
    try {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percent = (e.loaded / e.total) * 100;
                progressFill.style.width = percent + '%';
                progressText.textContent = `Wird hochgeladen... ${Math.round(percent)}%`;
            }
        });
        
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                const result = JSON.parse(xhr.responseText);
                if (result.success) {
                    alert('✅ Bild erfolgreich hochgeladen!');
                    closeUploadModal();
                    loadGalerie(); // Galerie neu laden
                } else {
                    alert('❌ Fehler: ' + result.error);
                }
            } else {
                alert('❌ Upload fehlgeschlagen');
            }
            progressDiv.style.display = 'none';
            submitBtn.disabled = false;
        });
        
        xhr.addEventListener('error', () => {
            alert('❌ Upload fehlgeschlagen');
            progressDiv.style.display = 'none';
            submitBtn.disabled = false;
        });
        
        xhr.open('POST', UPLOAD_URL);
        xhr.send(formData);
        
    } catch (error) {
        console.error('Upload-Fehler:', error);
        alert('❌ Upload fehlgeschlagen: ' + error.message);
        progressDiv.style.display = 'none';
        submitBtn.disabled = false;
    }
});

// Bild löschen
async function deleteBild(bildId) {
    if (!confirm('Möchtest du dieses Bild wirklich löschen?')) {
        return;
    }
    
    try {
        const response = await fetch(UPLOAD_URL, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: bildId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Bild gelöscht!');
            loadGalerie();
        } else {
            alert('❌ Fehler beim Löschen: ' + result.error);
        }
    } catch (error) {
        console.error('Fehler beim Löschen:', error);
        alert('❌ Fehler beim Löschen');
    }
}

// Helper Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    });
}

function formatFileSize(bytes) {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function showAddAlpakaForm() {
    alert('Alpaka-Formular wird bald verfügbar sein!');
}

function showAddTerminForm() {
    document.getElementById('termin-modal').classList.add('active');
}

function closeTerminModal() {
    document.getElementById('termin-modal').classList.remove('active');
    document.getElementById('termin-form').reset();
}

// Termin speichern
if (document.getElementById('termin-form')) {
    document.getElementById('termin-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const titel = document.getElementById('termin-titel').value;
        const datum = document.getElementById('termin-datum').value;
        const uhrzeit_von = document.getElementById('termin-uhrzeit-von').value;
        const uhrzeit_bis = document.getElementById('termin-uhrzeit-bis').value;
        const max_teilnehmer = document.getElementById('termin-max-teilnehmer').value;
        const preis = document.getElementById('termin-preis').value;
        try {
            const response = await fetch(`${API_URL}?action=add_termin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    titel,
                    datum,
                    uhrzeit_von,
                    uhrzeit_bis,
                    max_teilnehmer,
                    preis
                })
            });
            const result = await response.json();
            if (result.success) {
                alert('✅ Termin erfolgreich angelegt!');
                closeTerminModal();
                loadTermine();
            } else {
                alert('❌ Fehler: ' + (result.error || 'Unbekannter Fehler'));
            }
        } catch (err) {
            alert('❌ Fehler beim Speichern!');
        }
    });
}

// ============================================
// EINSTELLUNGEN FUNKTIONEN
// ============================================

let currentImageId = null;

function loadEinstellungen() {
    // Lädt gespeicherte Einstellungen aus localStorage
    document.getElementById('site-name').value = localStorage.getItem('site-name') || 'Seelenzauber Alpaka';
    document.getElementById('site-description').value = localStorage.getItem('site-description') || '';
    document.getElementById('site-keywords').value = localStorage.getItem('site-keywords') || '';
    document.getElementById('site-favicon').value = localStorage.getItem('site-favicon') || '';
    document.getElementById('site-og-image').value = localStorage.getItem('site-og-image') || '';
    document.getElementById('site-ga-id').value = localStorage.getItem('site-ga-id') || '';
    document.getElementById('site-clarity-id').value = localStorage.getItem('site-clarity-id') || '';
}

// Einstellungen-Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Speichere in localStorage (später: Backend-API)
            const settings = {
                'site-name': document.getElementById('site-name').value,
                'site-description': document.getElementById('site-description').value,
                'site-keywords': document.getElementById('site-keywords').value,
                'site-favicon': document.getElementById('site-favicon').value,
                'site-og-image': document.getElementById('site-og-image').value,
                'site-ga-id': document.getElementById('site-ga-id').value,
                'site-clarity-id': document.getElementById('site-clarity-id').value
            };
            
            Object.keys(settings).forEach(key => {
                localStorage.setItem(key, settings[key]);
            });
            
            alert('✅ Einstellungen gespeichert!');
        });
    }
});

// ============================================
// BILD-DETAIL MODAL FUNKTIONEN
// ============================================

function showImageDetail(bildId) {
    const bild = galleryImages.find(b => b.id === bildId);
    if (!bild) return;
    
    currentImageId = bildId;
    
    // Fülle Modal mit Daten
    document.getElementById('detail-image').src = `${ADMIN_BASE}${bild.dateipfad}`;
    document.getElementById('detail-filename').value = bild.dateiname || '';
    document.getElementById('detail-typ').value = bild.typ || 'galerie';
    document.getElementById('detail-beschreibung').value = bild.beschreibung || '';
    document.getElementById('detail-size').value = formatFileSize(bild.groesse);
    document.getElementById('detail-date').value = formatDate(bild.erstellt_am);
    document.getElementById('detail-url').value = `${ADMIN_BASE}${bild.dateipfad}`;
    
    // Modal öffnen
    document.getElementById('image-modal').classList.add('active');
}

function closeImageModal() {
    document.getElementById('image-modal').classList.remove('active');
    currentImageId = null;
}

function copyImageUrl() {
    const url = document.getElementById('detail-url').value;
    navigator.clipboard.writeText(url).then(() => {
        alert('✅ URL in Zwischenablage kopiert!');
    }).catch(() => {
        alert('❌ Kopieren fehlgeschlagen');
    });
}

async function deleteImage() {
    if (!currentImageId) return;
    
    if (!confirm('🗑️ Möchtest du dieses Bild wirklich löschen?')) {
        return;
    }
    
    try {
        const response = await fetch(UPLOAD_URL, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: currentImageId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Bild erfolgreich gelöscht!');
            closeImageModal();
            loadGalerie();
        } else {
            alert('❌ Fehler beim Löschen: ' + result.error);
        }
    } catch (error) {
        console.error('Fehler beim Löschen:', error);
        alert('❌ Fehler beim Löschen');
    }
}

async function saveImageDetails() {
    if (!currentImageId) return;
    
    const beschreibung = document.getElementById('detail-beschreibung').value;
    
    try {
        const response = await fetch(UPLOAD_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: currentImageId,
                beschreibung: beschreibung
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Änderungen gespeichert!');
            loadGalerie();
        } else {
            alert('❌ Fehler beim Speichern: ' + result.error);
        }
    } catch (error) {
        console.error('Fehler beim Speichern:', error);
        alert('❌ Fehler beim Speichern');
    }
}

// Initial Load
loadDashboard();

// ============================================
// BENUTZER-VERWALTUNG
// ============================================

const BENUTZER_API = `${ADMIN_BASE}/benutzer-api.php`;

async function loadBenutzer() {
    try {
        const response = await fetch(`${BENUTZER_API}?action=benutzer`);
        const data = await response.json();
        
        const container = document.getElementById('benutzer-list');
        
        if (data.success && data.data.length > 0) {
            container.innerHTML = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>E-Mail</th>
                            <th>Rolle</th>
                            <th>Status</th>
                            <th>Erstellt am</th>
                            <th>Letzter Login</th>
                            <th>Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.data.map(user => `
                            <tr>
                                <td><strong>${user.name}</strong></td>
                                <td>${user.email}</td>
                                <td><span class="badge ${user.rolle === 'admin' ? 'badge-danger' : 'badge-success'}">${user.rolle}</span></td>
                                <td><span class="badge ${user.ist_aktiv ? 'badge-success' : 'badge-warning'}">${user.ist_aktiv ? 'Aktiv' : 'Inaktiv'}</span></td>
                                <td>${formatDate(user.erstellt_am)}</td>
                                <td>${user.letzter_login ? formatDate(user.letzter_login) : '—'}</td>
                                <td>
                                    <button class="btn btn-sm btn-secondary" onclick="toggleBenutzer(${user.id})">${user.ist_aktiv ? 'Deaktivieren' : 'Aktivieren'}</button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteBenutzer(${user.id})">Löschen</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            container.innerHTML = '<div class="loading">Keine Benutzer vorhanden</div>';
        }
    } catch (error) {
        console.error('Fehler:', error);
        document.getElementById('benutzer-list').innerHTML = '<div class="loading">Fehler beim Laden</div>';
    }
}

function showAddBenutzerForm() {
    document.getElementById('benutzer-modal').classList.add('active');
}

function closeBenutzerModal() {
    document.getElementById('benutzer-modal').classList.remove('active');
    document.getElementById('benutzer-form').reset();
}

// Benutzer hinzufügen
document.addEventListener('DOMContentLoaded', () => {
    const benutzerForm = document.getElementById('benutzer-form');
    if (benutzerForm) {
        benutzerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const name = document.getElementById('benutzer-name').value;
            const email = document.getElementById('benutzer-email').value;
            const rolle = document.getElementById('benutzer-rolle').value;
            
            try {
                const response = await fetch(`${BENUTZER_API}?action=add_benutzer`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, rolle })
                });
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ Benutzer erstellt! E-Mail mit Passwort-Link wurde versendet an: ' + email);
                    console.log('Reset-Link:', result.reset_link);
                    closeBenutzerModal();
                    loadBenutzer();
                } else {
                    alert('❌ Fehler: ' + (result.error || 'Unbekannter Fehler'));
                }
            } catch (err) {
                alert('❌ Fehler beim Speichern!');
            }
        });
    }
});

async function deleteBenutzer(id) {
    if (!confirm('🗑️ Möchtest du diesen Benutzer wirklich löschen?')) {
        return;
    }
    
    try {
        const response = await fetch(`${BENUTZER_API}?action=delete_benutzer`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Benutzer gelöscht!');
            loadBenutzer();
        } else {
            alert('❌ Fehler: ' + result.error);
        }
    } catch (error) {
        alert('❌ Fehler beim Löschen!');
    }
}

async function toggleBenutzer(id) {
    try {
        const response = await fetch(`${BENUTZER_API}?action=toggle_benutzer`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const result = await response.json();
        
        if (result.success) {
            loadBenutzer();
        } else {
            alert('❌ Fehler: ' + result.error);
        }
    } catch (error) {
        alert('❌ Fehler beim Aktualisieren!');
    }
}
