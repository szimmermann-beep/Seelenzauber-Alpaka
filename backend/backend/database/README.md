# Datenbank-Setup Anleitung

## Schritt 1: Schema erstellen
1. Öffne PHPMyAdmin: https://phpmyadmin.strato.de
2. Wähle deine Datenbank `dbs14981836` aus
3. Klicke auf den Tab "SQL"
4. Kopiere den Inhalt von `schema.sql`
5. Füge ihn ein und klicke "OK"

## Schritt 2: Test-Daten einfügen (optional)
1. Bleibe im SQL-Tab
2. Kopiere den Inhalt von `testdata.sql`
3. Füge ihn ein und klicke "OK"

## Fertig!
Nach diesen Schritten solltest du folgende Tabellen sehen:
- `users` (Benutzer/Admins)
- `alpakas` (Alpaka-Daten)
- `galerie` (Bilder)
- `kontaktanfragen` (Kontaktformular)
- `termine` (Events/Termine)
- `buchungen` (Termin-Buchungen)
- `seiteninhalte` (CMS-Inhalte)

## Tabellen-Übersicht

### users
Admin-Benutzer für das Backend-Dashboard

### alpakas
Informationen zu jedem Alpaka (Name, Alter, Charakter, Bilder)

### galerie
Foto-Galerie für die Website

### kontaktanfragen
Speichert Nachrichten aus dem Kontaktformular

### termine
Verfügbare Termine für Alpaka-Wanderungen, etc.

### buchungen
Buchungen/Reservierungen von Kunden

### seiteninhalte
Editierbare Texte für die Website (einfaches CMS)
