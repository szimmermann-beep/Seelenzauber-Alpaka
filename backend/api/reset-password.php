<?php
// Backend: Passwort-Reset
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$token = $_GET['token'] ?? '';

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASSWORD,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'DB-Verbindung fehlgeschlagen']);
    exit;
}

// Token validieren (GET)
if ($method === 'GET' && $action === 'validate') {
    if (empty($token)) {
        echo json_encode(['success' => false, 'error' => 'Kein Token übergeben']);
        exit;
    }
    try {
        $stmt = $pdo->prepare('SELECT id, passwort_reset_ablauf FROM benutzer WHERE passwort_reset_token = :token');
        $stmt->execute(['token' => $token]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            echo json_encode(['success' => false, 'error' => 'Token ungültig']);
            exit;
        }
        if (!$row['passwort_reset_ablauf'] || strtotime($row['passwort_reset_ablauf']) < time()) {
            echo json_encode(['success' => false, 'error' => 'Token abgelaufen']);
            exit;
        }
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => 'Fehler bei Validierung']);
    }
    exit;
}

// Passwort setzen (POST)
if ($method === 'POST' && $action === 'reset') {
    $data = json_decode(file_get_contents('php://input'), true);
    $tokenPost = $data['token'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($tokenPost) || empty($password)) {
        echo json_encode(['success' => false, 'error' => 'Token und Passwort erforderlich']);
        exit;
    }
    if (strlen($password) < 8) {
        echo json_encode(['success' => false, 'error' => 'Passwort zu kurz (min. 8 Zeichen)']);
        exit;
    }

    try {
        $stmt = $pdo->prepare('SELECT id, passwort_reset_ablauf FROM benutzer WHERE passwort_reset_token = :token');
        $stmt->execute(['token' => $tokenPost]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            echo json_encode(['success' => false, 'error' => 'Token ungültig']);
            exit;
        }
        if (!$row['passwort_reset_ablauf'] || strtotime($row['passwort_reset_ablauf']) < time()) {
            echo json_encode(['success' => false, 'error' => 'Token abgelaufen']);
            exit;
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $update = $pdo->prepare('UPDATE benutzer SET passwort_hash = :hash, passwort_reset_token = NULL, passwort_reset_ablauf = NULL, ist_aktiv = 1 WHERE id = :id');
        $update->execute(['hash' => $hash, 'id' => $row['id']]);

        echo json_encode(['success' => true, 'message' => 'Passwort gesetzt']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => 'Fehler beim Setzen']);
    }
    exit;
}

echo json_encode(['success' => false, 'error' => 'Ungültige Anfrage']);
