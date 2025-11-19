<?php
// Backend: Benutzer-API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Datenbankverbindung
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Datenbankverbindung fehlgeschlagen']);
    exit;
}

// GET: Benutzer abrufen
if ($method === 'GET' && $action === 'benutzer') {
    try {
        $stmt = $pdo->query("
            SELECT id, name, email, rolle, ist_aktiv, letzter_login, erstellt_am 
            FROM benutzer 
            ORDER BY erstellt_am DESC
        ");
        $benutzer = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $benutzer]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// POST: Neuen Benutzer anlegen
if ($method === 'POST' && $action === 'add_benutzer') {
    $data = json_decode(file_get_contents('php://input'), true);
    $name = $data['name'] ?? '';
    $email = $data['email'] ?? '';
    $rolle = $data['rolle'] ?? 'editor';
    
    if (empty($name) || empty($email)) {
        echo json_encode(['success' => false, 'error' => 'Name und E-Mail sind erforderlich']);
        exit;
    }
    
    try {
        // Passwort-Reset-Token generieren
        $token = bin2hex(random_bytes(32));
        $ablauf = date('Y-m-d H:i:s', strtotime('+7 days'));
        
        $stmt = $pdo->prepare("
            INSERT INTO benutzer (name, email, rolle, passwort_reset_token, passwort_reset_ablauf) 
            VALUES (:name, :email, :rolle, :token, :ablauf)
        ");
        $stmt->execute([
            'name' => $name,
            'email' => $email,
            'rolle' => $rolle,
            'token' => $token,
            'ablauf' => $ablauf
        ]);
        
        // E-Mail mit Reset-Link senden
        $reset_link = "https://seelenzauber-alpaka.de/admin/passwort-reset.html?token=" . $token;
        $subject = "Willkommen bei Seelenzauber Alpaka - Passwort festlegen";
        $message = "Hallo $name,\n\n";
        $message .= "dein Benutzerkonto wurde erstellt!\n\n";
        $message .= "Bitte klicke auf den folgenden Link, um dein Passwort festzulegen:\n";
        $message .= $reset_link . "\n\n";
        $message .= "Der Link ist 7 Tage gültig.\n\n";
        $message .= "Viele Grüße,\n";
        $message .= "Seelenzauber Alpaka Team";
        
        $headers = "From: noreply@seelenzauber-alpaka.de\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        
        mail($email, $subject, $message, $headers);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Benutzer erstellt! E-Mail mit Passwort-Link wurde versendet.',
            'reset_link' => $reset_link
        ]);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            echo json_encode(['success' => false, 'error' => 'E-Mail-Adresse bereits vergeben']);
        } else {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }
    exit;
}

// DELETE: Benutzer löschen
if ($method === 'DELETE' && $action === 'delete_benutzer') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? 0;
    
    try {
        $stmt = $pdo->prepare("DELETE FROM benutzer WHERE id = :id");
        $stmt->execute(['id' => $id]);
        echo json_encode(['success' => true, 'message' => 'Benutzer gelöscht']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// PUT: Benutzer aktivieren/deaktivieren
if ($method === 'PUT' && $action === 'toggle_benutzer') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? 0;
    
    try {
        $stmt = $pdo->prepare("UPDATE benutzer SET ist_aktiv = NOT ist_aktiv WHERE id = :id");
        $stmt->execute(['id' => $id]);
        echo json_encode(['success' => true, 'message' => 'Status aktualisiert']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

echo json_encode(['success' => false, 'error' => 'Ungültige Anfrage']);
