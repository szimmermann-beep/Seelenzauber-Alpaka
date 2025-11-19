# PHP Backend für STRATO

Backend-API in PHP für STRATO Webspace mit MariaDB.

## Struktur

```
/api
├── index.php    - Haupt-API mit allen Endpoints
├── config.php   - Datenbank-Konfiguration (NICHT committen!)
└── setup.php    - Test-Daten einfügen
```

## API Endpoints

### GET-Endpoints
- `GET /api/` - Status-Check
- `GET /api/test-db` - Datenbank-Verbindung testen
- `GET /api/alpakas` - Alle Alpakas abrufen
- `GET /api/termine` - Alle Termine abrufen
- `GET /api/galerie` - Galerie-Bilder abrufen

### POST-Endpoints
- `POST /api/kontakt` - Kontaktanfrage speichern
- `POST /api/buchung` - Termin buchen

## Deployment auf STRATO

1. **Per FTP verbinden:**
   - Host: Deine STRATO FTP-Adresse
   - User: Dein FTP-Benutzername
   - Passwort: Dein FTP-Passwort

2. **Dateien hochladen:**
   - Lade den kompletten `/backend/api/` Ordner hoch
   - Ziel: z.B. `/api/` auf dem Webspace

3. **Test-Daten einfügen:**
   - Öffne im Browser: `https://deine-domain.de/api/setup.php`
   - Nur einmal ausführen!

4. **API testen:**
   - `https://deine-domain.de/api/` - Sollte "Backend läuft!" zeigen
   - `https://deine-domain.de/api/alpakas` - Sollte Alpaka-Daten zeigen

## .htaccess für schöne URLs

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ /api/index.php [L,QSA]
```

## Sicherheit

- `config.php` sollte NICHT ins Git-Repository (ist in .gitignore)
- Erstelle eine `config.example.php` als Vorlage
- Ändere Admin-Passwort nach dem ersten Login!
