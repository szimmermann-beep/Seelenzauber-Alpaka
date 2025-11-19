<?php
require_once 'config.php';

echo "🔍 Prüfe Datenbank-Verbindung...\n";

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASSWORD,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    echo "✅ Verbindung zur Datenbank hergestellt!\n\n";
    
    // Prüfe ob Test-Daten schon vorhanden
    $stmt = $pdo->query('SELECT COUNT(*) as count FROM users');
    $result = $stmt->fetch();
    
    if ($result['count'] > 0) {
        echo "✅ Datenbank enthält bereits Daten.\n";
        exit;
    }
    
    echo "📝 Füge Test-Daten ein...\n";
    
    // Test-Admin-User
    $pdo->exec("
        INSERT INTO users (username, email, password_hash, role) VALUES
        ('admin', 'admin@seelenzauber-alpaka.de', '\$2b\$10\$rXQ7VqZ5QqZ5QqZ5QqZ5Qe', 'admin')
    ");
    echo "  ✓ Admin-User erstellt\n";
    
    // Beispiel-Alpakas
    $pdo->exec("
        INSERT INTO alpakas (name, geburtsdatum, geschlecht, farbe, beschreibung, charakter) VALUES
        ('Luna', '2020-05-15', 'weiblich', 'Weiß', 'Luna ist unser sanftes Alpaka-Mädchen', 'Ruhig und freundlich'),
        ('Felix', '2019-03-22', 'männlich', 'Braun', 'Felix ist sehr neugierig und verspielt', 'Energisch und sozial'),
        ('Bella', '2021-07-10', 'weiblich', 'Grau', 'Bella liebt Streicheleinheiten', 'Verschmust und geduldig')
    ");
    echo "  ✓ 3 Alpakas erstellt\n";
    
    // Beispiel-Termine
    $pdo->exec("
        INSERT INTO termine (titel, beschreibung, datum, uhrzeit_von, uhrzeit_bis, max_teilnehmer, preis, ist_aktiv) VALUES
        ('Alpaka-Wanderung', 'Entspannte Wanderung mit unseren Alpakas durch die Natur', '2025-12-01', '10:00:00', '12:00:00', 8, 45.00, TRUE),
        ('Alpaka-Begegnung', 'Kennenlernen und Füttern der Alpakas', '2025-12-05', '14:00:00', '15:30:00', 6, 25.00, TRUE)
    ");
    echo "  ✓ 2 Termine erstellt\n";
    
    echo "\n✅ Test-Daten erfolgreich eingefügt!\n";
    
} catch (PDOException $e) {
    echo "❌ Fehler: " . $e->getMessage() . "\n";
    exit(1);
}
