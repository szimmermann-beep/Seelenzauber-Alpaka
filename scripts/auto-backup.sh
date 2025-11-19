#!/bin/bash

# Automatisches stündliches Backup-Script
# Wird von Cron ausgeführt

# Projektverzeichnis
PROJECT_DIR="/Users/sandro/Documents/GitHub/Seelenzauber-Alpaka"
BACKUP_DIR="/Users/sandro/Documents/GitHub/Seelenzauber-Alpaka-Backups"

# Führe Backup aus
cd "$PROJECT_DIR" && ./scripts/backup-local.sh

# Lösche Backups älter als 7 Tage (optional - speichert nur letzte Woche)
find "$BACKUP_DIR" -name "backup_*.tar.gz" -type f -mtime +7 -delete

# Log-Eintrag (optional)
echo "$(date '+%Y-%m-%d %H:%M:%S') - Automatisches Backup erstellt" >> "$BACKUP_DIR/backup.log"
