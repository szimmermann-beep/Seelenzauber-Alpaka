#!/bin/bash
# Remote Server Backup via SFTP
# Sichert alle Dateien vom STRATO Server

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="$HOME/Documents/GitHub/Seelenzauber-Alpaka-Backups/server"
BACKUP_NAME="server_backup_${TIMESTAMP}"

echo "🌐 Erstelle Server-Backup: ${BACKUP_NAME}"

# Backup-Verzeichnis erstellen
mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}"

# SFTP Download aller wichtigen Verzeichnisse
sftp -P 22 admin@seelenzauber-alpaka.de@ssh.strato.de << EOF
get -r Backend "${BACKUP_DIR}/${BACKUP_NAME}/Backend"
get -r Frontend "${BACKUP_DIR}/${BACKUP_NAME}/Frontend"
get -r admin "${BACKUP_DIR}/${BACKUP_NAME}/admin"
get .htaccess "${BACKUP_DIR}/${BACKUP_NAME}/.htaccess"
bye
EOF

# Komprimieren
echo "🗜️  Komprimiere Server-Backup..."
cd "${BACKUP_DIR}"
tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}/" 2>/dev/null
rm -rf "${BACKUP_NAME}/"

ARCHIVE_SIZE=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)

echo "✅ Server-Backup erfolgreich!"
echo "📁 Speicherort: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
echo "💾 Größe: ${ARCHIVE_SIZE}"
echo ""
echo "📋 Letzte Server-Backups:"
ls -lht "${BACKUP_DIR}"/*.tar.gz 2>/dev/null | head -3 | awk '{print "   " $9 " (" $5 ")"}'
