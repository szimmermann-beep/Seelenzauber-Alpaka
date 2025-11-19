#!/bin/bash
# Lokales Backup-Script für Seelenzauber-Alpaka
# Erstellt ein vollständiges Backup aller wichtigen Dateien

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="$HOME/Documents/GitHub/Seelenzauber-Alpaka-Backups"
BACKUP_NAME="backup_${TIMESTAMP}"
PROJECT_DIR="$HOME/Documents/GitHub/Seelenzauber-Alpaka"

echo "🔄 Erstelle Backup: ${BACKUP_NAME}"

# Backup-Verzeichnis erstellen
mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}"

# Git-Commit-Hash speichern
cd "$PROJECT_DIR"
git log -1 --format="%H %s" > "${BACKUP_DIR}/${BACKUP_NAME}/git-commit.txt"
echo "📝 Git-Commit gespeichert: $(cat ${BACKUP_DIR}/${BACKUP_NAME}/git-commit.txt)"

# Vollständiges Projekt kopieren (ohne node_modules und .git)
echo "📦 Kopiere Projektdateien..."
rsync -av --exclude='node_modules' --exclude='.git' --exclude='*.log' \
  "${PROJECT_DIR}/" "${BACKUP_DIR}/${BACKUP_NAME}/" > /dev/null 2>&1

# Komprimiertes Archiv erstellen
echo "🗜️  Erstelle komprimiertes Archiv..."
cd "${BACKUP_DIR}"
tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}/" 2>/dev/null
ARCHIVE_SIZE=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)

# Unkomprimiertes Verzeichnis löschen (Platz sparen)
rm -rf "${BACKUP_NAME}/"

echo "✅ Backup erfolgreich erstellt!"
echo "📁 Speicherort: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
echo "💾 Größe: ${ARCHIVE_SIZE}"
echo ""
echo "🔄 Wiederherstellen mit:"
echo "   cd ${BACKUP_DIR} && tar -xzf ${BACKUP_NAME}.tar.gz"
echo ""

# Liste der letzten 5 Backups anzeigen
echo "📋 Letzte Backups:"
ls -lht "${BACKUP_DIR}"/*.tar.gz 2>/dev/null | head -5 | awk '{print "   " $9 " (" $5 ")"}'
