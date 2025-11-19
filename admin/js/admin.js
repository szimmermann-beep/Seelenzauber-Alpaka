// Admin Dashboard JavaScript
const API_URL = 'https://seelenzauber-alpaka.de/api.php';

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
    const container = document.getElementById('galerie-list');
    container.innerHTML = '<div class="loading">Keine Bilder vorhanden</div>';
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

function showAddImageForm() {
    alert('Bild-Upload wird bald verfügbar sein!');
}

// Initial Load
loadDashboard();
