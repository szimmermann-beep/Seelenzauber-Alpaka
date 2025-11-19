#!/bin/bash
# Restore Script - Stellt ein Backup wieder her
# Usage: ./restore.sh <backup-file.tar.gz>

if [ -z "$1" ]; then
    echo "❌ Fehler: Kein Backup angegeben"
    echo "Usage: ./restore.sh <backup-file.tar.gz>"
    echo ""
    echo "Verfügbare Backups:"
    ls -lht "$HOME/Documents/GitHub/Seelenzauber-Alpaka-Backups"/*.tar.gz 2>/dev/null | head -5
    exit 1
fi

BACKUP_FILE="$1"
PROJECT_DIR="$HOME/Documents/GitHub/Seelenzauber-Alpaka"
TEMP_DIR="/tmp/seelenzauber_restore_$$"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup-Datei nicht gefunden: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  WARNUNG: Diese Aktion überschreibt alle aktuellen Dateien!"
echo "📦 Backup: $BACKUP_FILE"
echo ""
read -p "Fortfahren? (ja/nein): " CONFIRM

if [ "$CONFIRM" != "ja" ]; then
    echo "❌ Abgebrochen"
    exit 0
fi

# Aktuellen Stand als Sicherheit speichern
echo "💾 Erstelle Sicherheitskopie des aktuellen Stands..."
SAFETY_BACKUP="${PROJECT_DIR}_before_restore_$(date +%Y%m%d_%H%M%S)"
cp -r "$PROJECT_DIR" "$SAFETY_BACKUP"
echo "✅ Sicherheitskopie: $SAFETY_BACKUP"

# Backup entpacken
echo "📦 Entpacke Backup..."
mkdir -p "$TEMP_DIR"
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Backup-Verzeichnis finden
BACKUP_CONTENT=$(ls -1 "$TEMP_DIR" | head -1)

if [ -z "$BACKUP_CONTENT" ]; then
    echo "❌ Fehler beim Entpacken"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Dateien wiederherstellen
echo "🔄 Stelle Dateien wieder her..."
rsync -av --delete "${TEMP_DIR}/${BACKUP_CONTENT}/" "${PROJECT_DIR}/"

# Aufräumen
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Wiederherstellung abgeschlossen!"
echo "📁 Projekt: $PROJECT_DIR"
echo "🔒 Sicherheitskopie: $SAFETY_BACKUP"
echo ""
echo "Git-Status:"
cd "$PROJECT_DIR"
git status --short
echo ""
echo "💡 Tipp: Prüfe die Dateien und committe die Änderungen falls nötig:"
echo "   cd $PROJECT_DIR"
echo "   git status"
echo "   git add -A && git commit -m 'Restore from backup'"
