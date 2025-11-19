# Seelenzauber-Alpaka - Entwicklungsrichtlinien für KI-Assistenten

## Projektübersicht
Webprojekt mit getrenntem Frontend (Kunden-Website), Admin-Dashboard und Backend-API.

## Architektur & Struktur
Monorepo-Struktur mit drei Hauptkomponenten:

### Wichtige Verzeichnisse
- `/frontend` - Öffentliche Kunden-Website
- `/admin` - Geschützter Admin-Bereich für Verwaltung
- `/backend` - Server-Logik, API-Endpoints und Datenbank-Anbindung
- `.env.example` - Vorlage für Umgebungsvariablen (`.env` nicht committen!)

## Technologie-Stack
- Datenbank: MariaDB 10.11 (STRATO Webspace)
  - Host: `database-501903760l.webspace-host.com`
  - DB: `dbs14981836`
  - User: `dbu395884`
- Backend: [Node.js/PHP - noch zu definieren]
- Frontend: [React/Vue/Next.js - noch zu definieren]
- Admin: [Dashboard-Framework - noch zu definieren]

## Entwicklungs-Workflow

### Setup & Installation
```bash
# 1. Umgebungsvariablen konfigurieren
cp .env.example .env
# Datenbank-Passwort in .env eintragen

# 2. Abhängigkeiten installieren
cd backend && npm install
cd ../frontend && npm install
cd ../admin && npm install
```

### Build & Run
```bash
# Backend starten (Port 3000)
cd backend && npm run dev

# Frontend starten (Port 3001)
cd frontend && npm run dev

# Admin starten (Port 3002)
cd admin && npm run dev
```

### Tests ausführen
```bash
# Backend-Tests
cd backend && npm test

# Frontend-Tests
cd frontend && npm test
```

## Code-Konventionen & Patterns

### Namenskonventionen
[Beschreibe projektspezifische Namenskonventionen]

### Projektspezifische Patterns
[Dokumentiere wiederkehrende Code-Patterns oder Architektur-Entscheidungen]

## Wichtige Konfigurationsdateien
- `.env` - Enthält Datenbank-Credentials und Secrets (NICHT committen!)
- `.env.example` - Vorlage für Umgebungsvariablen
- `.gitignore` - Verhindert Commit von sensiblen Daten und Build-Outputs

## Abhängigkeiten & Integration
- **Datenbank:** MariaDB 10.11 auf STRATO Webspace
- **Hosting:** STRATO (database-501903760l.webspace-host.com)
- PHPMyAdmin verfügbar für Datenbank-Management

## Deployment
- Backend: STRATO Webspace
- Frontend/Admin: [Deploy-Strategie noch zu definieren]
- Datenbank: Bereits auf STRATO gehostet

## Hinweise für KI-Assistenten
- **Sicherheit:** Niemals Passwörter oder `.env`-Dateien committen
- **Struktur:** Klare Trennung zwischen Frontend, Admin und Backend
- **Datenbank:** Verwende immer die Credentials aus `.env`, niemals hardcoded
- **Port-Zuordnung:** Backend=3000, Frontend=3001, Admin=3002
