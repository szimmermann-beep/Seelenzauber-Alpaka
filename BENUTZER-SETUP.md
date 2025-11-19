# Benutzerverwaltung - Setup-Anleitung

## ✅ Was wurde erstellt:

### 1. Datenbank-Tabelle (`benutzer`)
**Datei:** `backend/database/setup-benutzer.sql`

**Enthält:**
- Admin-Benutzer: `admin@seelenzauber-alpaka.de` mit Passwort: `Superheld2025!`
- Sandro: `s.zimmermann@anschluss.de` (bekommt Passwort-Reset-E-Mail)

### 2. Backend-API
**Datei:** `backend/api/benutzer-api.php`

**Funktionen:**
- `GET ?action=benutzer` - Alle Benutzer abrufen
- `POST ?action=add_benutzer` - Neuen Benutzer anlegen (sendet automatisch E-Mail)
- `DELETE ?action=delete_benutzer` - Benutzer löschen
- `PUT ?action=toggle_benutzer` - Benutzer aktivieren/deaktivieren

### 3. Frontend (Admin-Panel)
**Datei:** `admin/js/admin.js` (erweitert)

**Features:**
- Benutzer-Liste mit Tabelle
- Neuen Benutzer anlegen (Modal)
- Benutzer aktivieren/deaktivieren
- Benutzer löschen
- Automatischer E-Mail-Versand mit Passwort-Reset-Link

---

## 📋 Setup-Schritte:

### Schritt 1: Datenbank einrichten

1. **PHPMyAdmin öffnen:** https://phpmyadmin.strato.de/
2. **Login:** Mit deinen STRATO-DB-Zugangsdaten
3. **Datenbank wählen:** `dbs14981836`
4. **SQL-Tab** öffnen
5. **Inhalt von** `backend/database/setup-benutzer.sql` **einfügen und ausführen**

✅ Dadurch werden erstellt:
- Tabelle `benutzer`
- Admin-Benutzer (E-Mail: `admin@seelenzauber-alpaka.de`, Passwort: `Superheld2025!`)
- Sandro (E-Mail: `s.zimmermann@anschluss.de`, bekommt Reset-Link)

### Schritt 2: Backend-API hochladen

Per SFTP auf den Server hochladen:
```
backend/api/benutzer-api.php → /Backend/benutzer-api.php
```

### Schritt 3: Frontend aktualisieren

Per SFTP auf den Server hochladen:
```
admin/js/admin.js → /admin/js/admin.js
```

### Schritt 4: Admin-HTML erweitern (noch zu tun!)

Das HTML muss noch erweitert werden um:
- Benutzer-View (`<div id="view-benutzer">`)
- Benutzer-Modal für "Neuen Benutzer anlegen"

---

## 🔐 Login-Daten:

### Admin-Benutzer:
- **E-Mail:** admin@seelenzauber-alpaka.de
- **Passwort:** Superheld2025!
- **Rolle:** admin

### Sandro:
- **E-Mail:** s.zimmermann@anschluss.de
- **Passwort:** Wird per E-Mail mit Reset-Link zugesendet
- **Rolle:** admin

---

## 📧 E-Mail-Versand:

Wenn ein neuer Benutzer angelegt wird:
1. System generiert einen einzigartigen Token
2. Token ist 7 Tage gültig
3. E-Mail wird automatisch versendet an die Benutzer-E-Mail
4. Benutzer klickt auf den Link und setzt sein Passwort

**Beispiel-Link:**
```
https://seelenzauber-alpaka.de/admin/passwort-reset.html?token=abc123def456...
```

---

## 🚀 Nutzung im Admin-Panel:

1. **Öffne:** https://seelenzauber-alpaka.de/admin/
2. **Klicke auf:** 🧑 Benutzer
3. **Du siehst:**
   - Liste aller Benutzer
   - Button "+ Neuer Benutzer"
   - Aktionen: Aktivieren/Deaktivieren, Löschen

4. **Neuen Benutzer anlegen:**
   - Klicke "+ Neuer Benutzer"
   - Fülle Name, E-Mail, Rolle aus
   - Klicke "Speichern"
   - System sendet automatisch E-Mail mit Passwort-Link

---

## ⚠️ Noch zu erledigen:

1. **HTML erweitern** - Benutzer-View und Modal hinzufügen
2. **Passwort-Reset-Seite** erstellen (`admin/passwort-reset.html`)
3. **E-Mail-Template** verbessern (aktuell nur Plain-Text)
4. **Login-System** für Admin-Panel (Authentifizierung)

---

## 🔧 Technische Details:

**Passwort-Hashing:** bcrypt (`password_hash()` in PHP)
**Token-Generierung:** `bin2hex(random_bytes(32))` (64 Zeichen)
**Token-Gültigkeit:** 7 Tage
**E-Mail-From:** noreply@seelenzauber-alpaka.de

**Datenbank-Tabelle:**
- `id` - Primärschlüssel
- `name` - Benutzername
- `email` - E-Mail (unique)
- `passwort_hash` - bcrypt-Hash
- `rolle` - admin, editor, viewer
- `ist_aktiv` - 0/1
- `passwort_reset_token` - Token für Passwort-Reset
- `passwort_reset_ablauf` - Gültigkeit des Tokens
- `letzter_login` - Zeitstempel
- `erstellt_am`, `aktualisiert_am` - Timestamps

---

**Erstellt am:** 19. November 2025
**Status:** Backend + API fertig, Frontend-UI noch zu ergänzen
