<?php
// Simple Login Endpoint
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: ' . ($_SERVER['HTTP_ORIGIN'] ?? '*'));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (!$email || !$password) {
  echo json_encode(['success' => false, 'error' => 'E-Mail und Passwort erforderlich']);
  exit;
}

try {
  $pdo = new PDO(
    'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
    DB_USER,
    DB_PASSWORD,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
  );

  $stmt = $pdo->prepare('SELECT id, name, email, rolle, ist_aktiv, passwort_hash FROM benutzer WHERE email = :email LIMIT 1');
  $stmt->execute(['email' => $email]);
  $user = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$user || !$user['ist_aktiv']) {
    echo json_encode(['success' => false, 'error' => 'Benutzer nicht gefunden oder deaktiviert']);
    exit;
  }

  if (!$user['passwort_hash'] || !password_verify($password, $user['passwort_hash'])) {
    echo json_encode(['success' => false, 'error' => 'Falsches Passwort']);
    exit;
  }

  $_SESSION['user'] = [
    'id' => (int)$user['id'],
    'name' => $user['name'],
    'email' => $user['email'],
    'rolle' => $user['rolle']
  ];

  // letzten Login aktualisieren
  $upd = $pdo->prepare('UPDATE benutzer SET letzter_login = NOW() WHERE id = :id');
  $upd->execute(['id' => $user['id']]);

  echo json_encode(['success' => true]);
} catch (PDOException $e) {
  echo json_encode(['success' => false, 'error' => 'DB-Fehler']);
}
