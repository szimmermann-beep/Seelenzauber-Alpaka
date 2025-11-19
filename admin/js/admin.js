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
        'alpakas': 'Alpakas verwalten',
        'termine': 'Termine verwalten',
        'buchungen': 'Buchungen',
        'kontakt': 'Kontaktanfragen',
        'galerie': 'Galerie'
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
            // später: loadBenutzer();
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
                <div class="gallery-item" data-id="${bild.id}" onclick="showImageDetail(${bild.id})">
                    <img src="${ADMIN_BASE}${bild.dateipfad}" alt="${bild.beschreibung || 'Bild'}">
                    <div class="gallery-item-actions">
                        <button class="btn-icon delete" onclick="event.stopPropagation(); deleteBild(${bild.id})" title="Löschen">🗑️</button>
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

function showAddAlpakaForm() {
    alert('Alpaka-Formular wird bald verfügbar sein!');
}

function showAddTerminForm() {
    alert('Termin-Formular wird bald verfügbar sein!');
}

// Initial Load
loadDashboard();
