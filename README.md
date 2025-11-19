# Seelenzauber-Alpaka

Webprojekt mit Frontend (Kunden-Website), Admin-Bereich und Backend-API.

## Projektstruktur

```
/frontend     - Kunden-Website (öffentlich)
/admin        - Admin-Dashboard (geschützt)
/backend      - API & Server-Logik
```

## Setup

1. Umgebungsvariablen konfigurieren:
```bash
cp .env.example .env
# Trage die richtigen Datenbank-Credentials ein
```

2. Abhängigkeiten installieren:
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install

# Admin
cd ../admin && npm install
```

3. Entwicklung starten:
```bash
# Backend (Port 3000)
cd backend && npm run dev

# Frontend (Port 3001)
cd frontend && npm run dev

# Admin (Port 3002)
cd admin && npm run dev
```

## Datenbank

- **Host:** database-501903760l.webspace-host.com
- **Typ:** MariaDB 10.11
- **Name:** dbs14981836

Zugangsdaten in `.env` hinterlegen.
