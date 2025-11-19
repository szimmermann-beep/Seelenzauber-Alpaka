<?php
// Backend: Benutzer-API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';
session_start();

// Mail-Logging
function log_mail($context, $email, $subject, $success) {
    $line = date('c') . "\t$context\t$email\t$subject\t" . ($success ? 'OK' : 'FAIL') . "\n";
    @file_put_contents(__DIR__ . '/email.log', $line, FILE_APPEND);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Aktuellen Benutzer & Rolle (Session)
$currentUserId = $_SESSION['user_id'] ?? null;
$currentUserRole = null;
if ($currentUserId) {
    try {
        $tmpPdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASSWORD,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        $rs = $tmpPdo->prepare('SELECT rolle FROM benutzer WHERE id = :id');
        $rs->execute(['id' => $currentUserId]);
        $r = $rs->fetch(PDO::FETCH_ASSOC);
        if ($r) { $currentUserRole = $r['rolle']; }
    } catch (Exception $e) {}
}

// Zugriffsregeln
$requiresLogin = ['benutzer','add_benutzer','resend_email','delete_benutzer','toggle_benutzer'];
$requiresAdmin = ['add_benutzer','resend_email','delete_benutzer','toggle_benutzer'];
if (in_array($action, $requiresLogin, true) && !$currentUserId) {
    echo json_encode(['success' => false, 'error' => 'Nicht eingeloggt']);
    exit;
}
if (in_array($action, $requiresAdmin, true) && $currentUserRole !== 'admin') {
    echo json_encode(['success' => false, 'error' => 'Keine Berechtigung']);
    exit;
}

// Datenbankverbindung
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASSWORD,
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
    $name = trim($name);
    $email = strtolower(trim($email));
    $rolle = strtolower(trim($rolle));
    $allowedRoles = ['admin','editor','viewer'];
    if (!in_array($rolle, $allowedRoles, true)) { $rolle = 'editor'; }
    if (strlen($name) > 100) { echo json_encode(['success'=>false,'error'=>'Name zu lang']); exit; }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { echo json_encode(['success'=>false,'error'=>'Ungültige E-Mail']); exit; }
    
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
        
        // E-Mail mit Reset-Link senden (erweitert & geloggt)
        $reset_link = 'https://seelenzauber-alpaka.de/admin/passwort-reset.html?token=' . $token;
        $subject = 'Willkommen – Passwort festlegen';
        $message = "Hallo $name,\n\n" .
            "dein Benutzerkonto wurde erstellt. Bitte klicke auf den folgenden Link, um dein Passwort festzulegen (gültig 7 Tage):\n" .
            $reset_link . "\n\nViele Grüße\nSeelenzauber Alpaka Team";
        $headers = "From: Seelenzauber Alpaka <noreply@seelenzauber-alpaka.de>\r\n" .
            "Reply-To: info@seelenzauber-alpaka.de\r\n" .
            "MIME-Version: 1.0\r\n" .
            "Content-Type: text/plain; charset=UTF-8\r\n";
        $mailOk = @mail($email, $subject, $message, $headers, '-fnoreply@seelenzauber-alpaka.de');
        log_mail('add_benutzer', $email, $subject, $mailOk);
        echo json_encode([
            'success' => true,
            'message' => $mailOk ? 'Benutzer erstellt, E-Mail gesendet.' : 'Benutzer erstellt, E-Mail konnte nicht gesendet werden.',
            'mail_success' => $mailOk,
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

// POST: E-Mail erneut senden
if ($method === 'POST' && $action === 'resend_email') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? 0;
    
    try {
        // Benutzer laden
        $stmt = $pdo->prepare("SELECT name, email FROM benutzer WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            echo json_encode(['success' => false, 'error' => 'Benutzer nicht gefunden']);
            exit;
        }
        
        // Neuen Token generieren
        $token = bin2hex(random_bytes(32));
        $ablauf = date('Y-m-d H:i:s', strtotime('+7 days'));
        
        $stmt = $pdo->prepare("UPDATE benutzer SET passwort_reset_token = :token, passwort_reset_ablauf = :ablauf WHERE id = :id");
        $stmt->execute(['token' => $token, 'ablauf' => $ablauf, 'id' => $id]);
        
        // E-Mail senden (erweitert & geloggt)
        $reset_link = 'https://seelenzauber-alpaka.de/admin/passwort-reset.html?token=' . $token;
        $subject = 'Neuer Passwort-Link';
        $message = "Hallo {$user['name']},\n\n" .
            "hier ist dein neuer Link zum Festlegen des Passworts (gültig 7 Tage):\n" .
            $reset_link . "\n\nViele Grüße\nSeelenzauber Alpaka Team";
        $headers = "From: Seelenzauber Alpaka <noreply@seelenzauber-alpaka.de>\r\n" .
            "Reply-To: info@seelenzauber-alpaka.de\r\n" .
            "MIME-Version: 1.0\r\n" .
            "Content-Type: text/plain; charset=UTF-8\r\n";
        $mailOk = @mail($user['email'], $subject, $message, $headers, '-fnoreply@seelenzauber-alpaka.de');
        log_mail('resend_email', $user['email'], $subject, $mailOk);
        echo json_encode([
            'success' => true,
            'message' => $mailOk ? 'E-Mail wurde versendet!' : 'E-Mail konnte nicht gesendet werden.',
            'mail_success' => $mailOk,
            'reset_link' => $reset_link
        ]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
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
