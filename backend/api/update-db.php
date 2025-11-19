<?php
// Datenbank-Update Script für Airbnb-Features

require_once 'config.php';

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASSWORD,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
    
    echo "✅ Datenbankverbindung erfolgreich!<br><br>";
    
    // 1. Alpakas-Tabelle erweitern
    echo "🔧 Erweitere Alpakas-Tabelle...<br>";
    try {
        $pdo->exec("
            ALTER TABLE alpakas 
            ADD COLUMN IF NOT EXISTS hauptbild VARCHAR(500) DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS bilder TEXT DEFAULT NULL COMMENT 'JSON Array von Bild-URLs',
            ADD COLUMN IF NOT EXISTS durchschnittliche_bewertung DECIMAL(3,2) DEFAULT 0.00,
            ADD COLUMN IF NOT EXISTS anzahl_bewertungen INT DEFAULT 0
        ");
        echo "✅ Alpakas-Tabelle erweitert<br>";
    } catch (PDOException $e) {
        echo "⚠️ Alpakas-Tabelle bereits erweitert oder Fehler: " . $e->getMessage() . "<br>";
    }
    
    // 2. Termine-Tabelle erweitern
    echo "🔧 Erweitere Termine-Tabelle...<br>";
    try {
        $pdo->exec("
            ALTER TABLE termine
            ADD COLUMN IF NOT EXISTS hauptbild VARCHAR(500) DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS bilder TEXT DEFAULT NULL COMMENT 'JSON Array von Bild-URLs',
            ADD COLUMN IF NOT EXISTS highlights TEXT DEFAULT NULL COMMENT 'JSON Array von Highlights',
            ADD COLUMN IF NOT EXISTS was_wir_bieten TEXT DEFAULT NULL COMMENT 'JSON Array von Features'
        ");
        echo "✅ Termine-Tabelle erweitert<br>";
    } catch (PDOException $e) {
        echo "⚠️ Termine-Tabelle bereits erweitert oder Fehler: " . $e->getMessage() . "<br>";
    }
    
    // 3. Bewertungen-Tabelle erstellen
    echo "🔧 Erstelle Bewertungen-Tabelle...<br>";
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS bewertungen (
                id INT PRIMARY KEY AUTO_INCREMENT,
                typ ENUM('alpaka', 'termin', 'allgemein') NOT NULL,
                referenz_id INT DEFAULT NULL COMMENT 'ID des Alpakas oder Termins',
                name VARCHAR(100) NOT NULL,
                bewertung INT NOT NULL CHECK (bewertung >= 1 AND bewertung <= 5),
                kommentar TEXT,
                datum DATE NOT NULL,
                erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_typ_referenz (typ, referenz_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        echo "✅ Bewertungen-Tabelle erstellt<br>";
    } catch (PDOException $e) {
        echo "⚠️ Bewertungen-Tabelle existiert bereits oder Fehler: " . $e->getMessage() . "<br>";
    }
    
    // 4. Bilder-Tabelle erstellen
    echo "🔧 Erstelle Bilder-Tabelle...<br>";
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS bilder (
                id INT PRIMARY KEY AUTO_INCREMENT,
                dateiname VARCHAR(255) NOT NULL,
                dateipfad VARCHAR(500) NOT NULL,
                typ ENUM('alpaka', 'termin', 'galerie') NOT NULL,
                referenz_id INT DEFAULT NULL COMMENT 'ID des Alpakas oder Termins',
                beschreibung TEXT,
                sortierung INT DEFAULT 0,
                erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_typ_referenz (typ, referenz_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        echo "✅ Bilder-Tabelle erstellt<br>";
    } catch (PDOException $e) {
        echo "⚠️ Bilder-Tabelle existiert bereits oder Fehler: " . $e->getMessage() . "<br>";
    }
    
    // 5. Test-Bewertungen einfügen
    echo "🔧 Füge Test-Bewertungen ein...<br>";
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM bewertungen");
    $result = $stmt->fetch();
    
    if ($result['count'] == 0) {
        $bewertungen = [
            ['allgemein', null, 'Sarah M.', 5, 'Ein unvergessliches Erlebnis! Die Alpakas sind so zutraulich und die Atmosphäre ist magisch. Perfekt für einen entspannten Nachmittag.', '2025-10-15'],
            ['allgemein', null, 'Michael B.', 5, 'Unsere Kinder waren begeistert! Die Führung war sehr informativ und liebevoll gestaltet. Absolut empfehlenswert!', '2025-09-22'],
            ['allgemein', null, 'Julia K.', 5, 'Wunderschöne Location und super nette Betreuung. Die Alpakas sind einfach herzallerliebst. Wir kommen definitiv wieder!', '2025-08-30'],
            ['allgemein', null, 'Thomas W.', 4, 'Sehr schöne Erfahrung, nur die Parkplatzsituation könnte besser sein. Ansonsten top!', '2025-07-18'],
            ['alpaka', 1, 'Anna L.', 5, 'Luna ist so ein sanftes und liebevolles Alpaka. Sie hat sich sofort mit meiner Tochter angefreundet!', '2025-11-01'],
            ['alpaka', 2, 'Markus S.', 5, 'Felix ist der Charmeur unter den Alpakas. So verspielt und fröhlich!', '2025-10-28'],
            ['allgemein', null, 'Petra H.', 5, 'Ein wunderschöner Tag! Die Alpakas sind so friedlich und die Landschaft einfach traumhaft.', '2025-06-14'],
            ['allgemein', null, 'Hans G.', 4, 'Tolle Erfahrung, sehr zu empfehlen. Nur etwas mehr Infos vorab wären hilfreich gewesen.', '2025-05-22']
        ];
        
        $stmt = $pdo->prepare("
            INSERT INTO bewertungen (typ, referenz_id, name, bewertung, kommentar, datum) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($bewertungen as $bew) {
            $stmt->execute($bew);
        }
        
        echo "✅ " . count($bewertungen) . " Test-Bewertungen eingefügt<br>";
    } else {
        echo "⚠️ Bewertungen existieren bereits (" . $result['count'] . " Einträge)<br>";
    }
    
    // 6. Durchschnittsbewertungen berechnen
    echo "🔧 Berechne Durchschnittsbewertungen...<br>";
    $pdo->exec("
        UPDATE alpakas a
        SET durchschnittliche_bewertung = COALESCE((
            SELECT AVG(bewertung) 
            FROM bewertungen 
            WHERE typ = 'alpaka' AND referenz_id = a.id
        ), 0),
        anzahl_bewertungen = COALESCE((
            SELECT COUNT(*) 
            FROM bewertungen 
            WHERE typ = 'alpaka' AND referenz_id = a.id
        ), 0)
    ");
    echo "✅ Durchschnittsbewertungen berechnet<br>";
    
    echo "<br>🎉 <strong>Datenbank-Update erfolgreich abgeschlossen!</strong><br>";
    echo "<br>📊 <a href='test-db.php'>Datenbank testen</a> | <a href='../index.html'>Zur Website</a>";
    
} catch (PDOException $e) {
    echo "❌ Fehler: " . $e->getMessage();
}
?>
