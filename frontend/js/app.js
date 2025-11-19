// API Base URL
const API_URL = 'https://seelenzauber-alpaka.de';

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Alpakas laden
async function loadAlpakas() {
    try {
        const response = await fetch(`${API_URL}/index.php?action=alpakas`);
        const data = await response.json();
        
        const container = document.getElementById('alpakas-container');
        
        if (data.success && data.data.length > 0) {
            container.innerHTML = data.data.map(alpaka => `
                <div class="card">
                    <div class="card-img"></div>
                    <div class="card-content">
                        <h3>${alpaka.name}</h3>
                        <p><strong>Geschlecht:</strong> ${alpaka.geschlecht}</p>
                        <p><strong>Farbe:</strong> ${alpaka.farbe}</p>
                        <p><strong>Charakter:</strong> ${alpaka.charakter}</p>
                        <p>${alpaka.beschreibung}</p>
                        <div class="card-meta">
                            <span class="badge">Geboren: ${formatDate(alpaka.geburtsdatum)}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="loading">Keine Alpakas gefunden.</p>';
        }
    } catch (error) {
        console.error('Fehler beim Laden der Alpakas:', error);
        document.getElementById('alpakas-container').innerHTML = 
            '<p class="loading">Fehler beim Laden der Alpakas.</p>';
    }
}

// Termine laden
async function loadTermine() {
    try {
        const response = await fetch(`${API_URL}/index.php?action=termine`);
        const data = await response.json();
        
        const container = document.getElementById('termine-container');
        
        if (data.success && data.data.length > 0) {
            container.innerHTML = data.data.map(termin => `
                <div class="card termin-card">
                    <div class="card-content">
                        <h3>${termin.titel}</h3>
                        <p class="termin-date">📅 ${formatDate(termin.datum)} | 🕐 ${termin.uhrzeit_von.substring(0,5)} - ${termin.uhrzeit_bis.substring(0,5)} Uhr</p>
                        <p>${termin.beschreibung}</p>
                        <div class="card-meta">
                            <span class="badge">Max. ${termin.max_teilnehmer} Personen</span>
                        </div>
                        <p class="termin-price">${termin.preis} €</p>
                        <button class="btn btn-book" onclick="bucheTermin(${termin.id}, '${termin.titel}')">
                            Jetzt buchen
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="loading">Keine Termine verfügbar.</p>';
        }
    } catch (error) {
        console.error('Fehler beim Laden der Termine:', error);
        document.getElementById('termine-container').innerHTML = 
            '<p class="loading">Fehler beim Laden der Termine.</p>';
    }
}

// Galerie laden
async function loadGalerie() {
    try {
        const response = await fetch(`${API_URL}/index.php?action=galerie`);
        const data = await response.json();
        
        const container = document.getElementById('galerie-container');
        
        if (data.success && data.data.length > 0) {
            container.innerHTML = data.data.map(bild => `
                <div class="gallery-item">
                    <div class="card-img"></div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="loading">Keine Bilder vorhanden.</p>';
        }
    } catch (error) {
        console.error('Fehler beim Laden der Galerie:', error);
        document.getElementById('galerie-container').innerHTML = 
            '<p class="loading">Fehler beim Laden der Galerie.</p>';
    }
}

// Kontaktformular
document.getElementById('kontakt-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch(`${API_URL}/index.php?action=kontakt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        const messageDiv = document.getElementById('kontakt-message');
        
        if (result.success) {
            messageDiv.className = 'message success';
            messageDiv.textContent = result.message;
            e.target.reset();
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Fehler beim Senden der Nachricht.';
        }
    } catch (error) {
        console.error('Fehler:', error);
        const messageDiv = document.getElementById('kontakt-message');
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Fehler beim Senden der Nachricht.';
    }
});

// Termin buchen
function bucheTermin(terminId, titel) {
    const vorname = prompt(`Termin buchen: ${titel}\n\nDein Vorname:`);
    if (!vorname) return;
    
    const nachname = prompt('Dein Nachname:');
    if (!nachname) return;
    
    const email = prompt('Deine E-Mail:');
    if (!email) return;
    
    const telefon = prompt('Deine Telefonnummer (optional):');
    const anzahl = prompt('Anzahl Personen:', '1');
    
    fetch(`${API_URL}/index.php?action=buchung`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            termin_id: terminId,
            vorname, nachname, email, telefon,
            anzahl_personen: parseInt(anzahl) || 1
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('✅ Buchung erfolgreich! Wir melden uns bei dir.');
        } else {
            alert('❌ Fehler bei der Buchung.');
        }
    })
    .catch(err => {
        console.error(err);
        alert('❌ Fehler bei der Buchung.');
    });
}

// Datum formatieren
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    loadAlpakas();
    loadTermine();
    loadGalerie();
});
