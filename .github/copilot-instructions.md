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
  - Host: `database-5019037601.webspace-host.com`
  - DB: `dbs14981836`
  - User: `dbu395884`
  - Passwort: In `.env` / `backend/api/config.php`
- Backend: PHP 8.x (STRATO-optimiert)
  - API-Endpoints in `/backend/api/`
  - Deployed auf STRATO via SFTP
- Frontend: [Noch zu definieren - HTML/CSS/JS oder Framework]
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

### Backend (PHP auf STRATO)
```bash
# SFTP-Zugangsdaten
Server: ssh.strato.de:22
User: admin@seelenzauber-alpaka.de
Startverzeichnis: /seelenzauber-alpaka/

# Upload via SFTP
cd backend/api
sftp -P 22 admin@seelenzauber-alpaka.de@ssh.strato.de
# Dateien nach /Backend/ hochladen
```

### Datenbank-Setup
1. PHPMyAdmin: https://phpmyadmin.strato.de
2. SQL-Schema: `backend/database/schema.sql`
3. Test-Daten: `backend/database/testdata.sql`

### Domain-Konfiguration (TODO)
- Domain muss in STRATO auf `/seelenzauber-alpaka/Backend/` zeigen
- Oder Dateien ins Document-Root verschieben

## Hinweise für KI-Assistenten
- **Sicherheit:** Niemals Passwörter oder `.env`-Dateien committen (`backend/api/config.php` ist in .gitignore)
- **Struktur:** Klare Trennung zwischen Frontend, Admin und Backend
- **Datenbank:** 
  - Lokal: Nicht erreichbar von außerhalb STRATO
  - Credentials in `backend/api/config.php`
  - PHPMyAdmin für direkte DB-Verwaltung nutzen
- **Backend:** 
  - PHP-basiert für STRATO-Kompatibilität
  - API-Endpoints in `backend/api/index.php`
  - Setup-Script: `backend/api/setup.php` (Test-Daten einfügen)
- **SFTP-Upload:** Dateien nach `/Backend/` auf STRATO hochladen
