<?php
// CORS Headers für Frontend-Zugriff
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Laden der Konfiguration
require_once 'config.php';

// Verbindung zur Datenbank
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASSWORD,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Datenbankverbindung fehlgeschlagen'
    ]);
    exit;
}

// Route ermitteln
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// API Router
if ($request_method === 'GET') {
    
    // Root-Route
    if (preg_match('/\/api\/?$/', $request_uri)) {
        echo json_encode([
            'message' => '🦙 Seelenzauber-Alpaka Backend läuft!',
            'status' => 'online',
            'version' => '1.0.0'
        ]);
        exit;
    }
    
    // Test Datenbankverbindung
    if (preg_match('/\/api\/test-db/', $request_uri)) {
        try {
            $stmt = $pdo->query('SELECT 1 + 1 AS result');
            $result = $stmt->fetch();
            echo json_encode([
                'success' => true,
                'message' => 'Datenbank-Verbindung erfolgreich!',
                'result' => $result['result']
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
        exit;
    }
    
    // Alle Alpakas abrufen
    if (preg_match('/\/api\/alpakas/', $request_uri)) {
        try {
            $stmt = $pdo->query('SELECT * FROM alpakas WHERE ist_aktiv = TRUE ORDER BY name ASC');
            $alpakas = $stmt->fetchAll();
            echo json_encode([
                'success' => true,
                'data' => $alpakas
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
        exit;
    }
    
    // Alle Termine abrufen
    if (preg_match('/\/api\/termine/', $request_uri)) {
        try {
            $stmt = $pdo->query('SELECT * FROM termine WHERE ist_aktiv = TRUE ORDER BY datum ASC');
            $termine = $stmt->fetchAll();
            echo json_encode([
                'success' => true,
                'data' => $termine
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
        exit;
    }
    
    // Galerie-Bilder abrufen
    if (preg_match('/\/api\/galerie/', $request_uri)) {
        try {
            $stmt = $pdo->query('SELECT * FROM galerie WHERE ist_aktiv = TRUE ORDER BY sortierung ASC');
            $bilder = $stmt->fetchAll();
            echo json_encode([
                'success' => true,
                'data' => $bilder
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
        exit;
    }
}

// POST-Anfragen
if ($request_method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Kontaktanfrage speichern
    if (preg_match('/\/api\/kontakt/', $request_uri)) {
        try {
            $stmt = $pdo->prepare('
                INSERT INTO kontaktanfragen 
                (vorname, nachname, email, telefon, betreff, nachricht) 
                VALUES (:vorname, :nachname, :email, :telefon, :betreff, :nachricht)
            ');
            $stmt->execute([
                ':vorname' => $input['vorname'] ?? '',
                ':nachname' => $input['nachname'] ?? '',
                ':email' => $input['email'] ?? '',
                ':telefon' => $input['telefon'] ?? null,
                ':betreff' => $input['betreff'] ?? '',
                ':nachricht' => $input['nachricht'] ?? ''
            ]);
            echo json_encode([
                'success' => true,
                'message' => 'Ihre Anfrage wurde erfolgreich gesendet!'
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
        exit;
    }
    
    // Termin-Buchung
    if (preg_match('/\/api\/buchung/', $request_uri)) {
        try {
            $stmt = $pdo->prepare('
                INSERT INTO buchungen 
                (termin_id, vorname, nachname, email, telefon, anzahl_personen, bemerkung) 
                VALUES (:termin_id, :vorname, :nachname, :email, :telefon, :anzahl_personen, :bemerkung)
            ');
            $stmt->execute([
                ':termin_id' => $input['termin_id'] ?? 0,
                ':vorname' => $input['vorname'] ?? '',
                ':nachname' => $input['nachname'] ?? '',
                ':email' => $input['email'] ?? '',
                ':telefon' => $input['telefon'] ?? null,
                ':anzahl_personen' => $input['anzahl_personen'] ?? 1,
                ':bemerkung' => $input['bemerkung'] ?? null
            ]);
            echo json_encode([
                'success' => true,
                'message' => 'Buchung erfolgreich!'
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
        exit;
    }
}

// 404 für unbekannte Routen
http_response_code(404);
echo json_encode([
    'success' => false,
    'error' => 'Endpoint nicht gefunden'
]);
