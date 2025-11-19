# Backup & Restore System für Seelenzauber-Alpaka

## 📦 Verfügbare Backup-Typen

### 1. Git Commits (Automatisch)
- **Was:** Jede Änderung wird automatisch versioniert
- **Vorteil:** Immer verfügbar, unbegrenzte Historie
- **Zurücksetzen:**
  ```bash
  # Letzten funktionierenden Commit finden
  git log --oneline --graph -20
  
  # Auf bestimmten Commit zurücksetzen
  git reset --hard <commit-hash>
  
  # Beispiel: Auf Airbnb-Design zurück
  git reset --hard 6cd0ef2
  ```

### 2. Lokales Backup (Manuell)
- **Was:** Vollständige Kopie aller Projektdateien
- **Speicherort:** `~/Documents/GitHub/Seelenzauber-Alpaka-Backups/`
- **Erstellen:**
  ```bash
  cd scripts
  chmod +x backup-local.sh
  ./backup-local.sh
  ```
- **Wiederherstellen:**
  ```bash
  cd scripts
  chmod +x restore.sh
  ./restore.sh ~/Documents/GitHub/Seelenzauber-Alpaka-Backups/backup_20251119_140000.tar.gz
  ```

### 3. Server Backup (SFTP)
- **Was:** Backup aller Dateien vom Live-Server
- **Speicherort:** `~/Documents/GitHub/Seelenzauber-Alpaka-Backups/server/`
- **Erstellen:**
  ```bash
  cd scripts
  chmod +x backup-server.sh
  ./backup-server.sh
  # Passwort: 233feb426tr234623rgwezfu2345!!!&
  ```

### 4. Datenbank Backup (PHPMyAdmin)
- **Manuell:** https://phpmyadmin.strato.de
  1. Einloggen mit DB-Credentials
  2. Datenbank `dbs14981836` auswählen
  3. "Exportieren" → SQL-Format → Herunterladen
- **Speichern als:** `backups/database_YYYYMMDD.sql`

## 🔄 Empfohlene Backup-Strategie

### Vor größeren Änderungen:
```bash
# 1. Git Commit (immer!)
git add -A
git commit -m "Beschreibung der Änderung"
git push

# 2. Lokales Backup erstellen
./scripts/backup-local.sh

# 3. Optional: Server-Backup
./scripts/backup-server.sh
```

### Regelmäßig (wöchentlich):
```bash
# Vollständiges Server-Backup
./scripts/backup-server.sh

# Datenbank-Export via PHPMyAdmin
```

## ⏪ Notfall-Wiederherstellung

### Szenario 1: Lokale Dateien kaputt
```bash
# Option A: Git zurücksetzen
git reset --hard HEAD~1  # Letzter Commit
git reset --hard 6cd0ef2  # Bestimmter Commit

# Option B: Aus lokalem Backup
./scripts/restore.sh ~/Documents/.../backup_DATUM.tar.gz
```

### Szenario 2: Live-Server kaputt
```bash
# 1. Server-Backup als Notfall speichern
./scripts/backup-server.sh

# 2. Funktionierende Version neu hochladen
cd /Users/sandro/Documents/GitHub/Seelenzauber-Alpaka
git reset --hard 6cd0ef2  # Letzter guter Stand

# 3. Per SFTP neu deployen
sftp -P 22 admin@seelenzauber-alpaka.de@ssh.strato.de
# put -r Frontend/* Frontend/
# put -r admin/* admin/
# put -r Backend/* Backend/
```

### Szenario 3: Datenbank kaputt
```bash
# 1. PHPMyAdmin öffnen: https://phpmyadmin.strato.de
# 2. Datenbank auswählen: dbs14981836
# 3. "Importieren" → SQL-Datei auswählen
# 4. Ausführen
```

## 📋 Backup-Historie prüfen

```bash
# Lokale Backups
ls -lht ~/Documents/GitHub/Seelenzauber-Alpaka-Backups/*.tar.gz

# Git-Historie
git log --oneline --graph -20

# Aktueller Stand
git status
```

## 🎯 Quick Commands

```bash
# Schnelles Backup vor Änderungen
./scripts/backup-local.sh && git add -A && git commit -m "Pre-change backup" && git push

# Auf letzten funktionierenden Stand zurück
git log --oneline -10  # Hash finden
git reset --hard <hash>

# Aktuellen Stand als Tag markieren (wichtiger Meilenstein)
git tag -a v1.0-working -m "Funktionierende Airbnb-Version"
git push --tags
```

## 💡 Best Practices

1. **Vor jeder größeren Änderung:** Commit + Push
2. **Nach erfolgreicher Änderung:** Commit + Push
3. **Wöchentlich:** Server-Backup + DB-Export
4. **Vor Live-Deployment:** Lokales Backup
5. **Tags nutzen:** Wichtige Versionen markieren (`git tag`)

## 🆘 Im Notfall

1. **Ruhe bewahren** - Nichts überstürzen
2. **Aktuellen Stand sichern** (auch wenn kaputt)
3. **Letzten funktionierenden Commit finden** (`git log`)
4. **Zurücksetzen** (`git reset --hard`)
5. **Testen** ob alles wieder funktioniert
6. **Neu deployen** falls nötig

## 📞 Wichtige Infos

- **GitHub Repo:** https://github.com/szimmermann-beep/Seelenzauber-Alpaka
- **Live-Server:** https://seelenzauber-alpaka.de
- **Admin:** https://seelenzauber-alpaka.de/admin/
- **Letzter guter Stand:** Commit `6cd0ef2` (Airbnb-Design)
