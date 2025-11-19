<?php
// Bild-Upload-Handler für Alpakas, Termine und Galerie

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once 'config.php';

// Datenbank-Verbindung
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
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Datenbankverbindung fehlgeschlagen']);
    exit;
}

$request_method = $_SERVER['REQUEST_METHOD'];
$upload_dir = __DIR__ . '/uploads/';

// Upload-Verzeichnis erstellen falls nicht vorhanden
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

// GET: Alle Bilder abrufen
if ($request_method === 'GET') {
    $typ = $_GET['typ'] ?? null;
    $referenz_id = $_GET['referenz_id'] ?? null;
    
    try {
        $sql = 'SELECT * FROM bilder WHERE 1=1';
        $params = [];
        
        if ($typ) {
            $sql .= ' AND typ = :typ';
            $params[':typ'] = $typ;
        }
        
        if ($referenz_id) {
            $sql .= ' AND referenz_id = :referenz_id';
            $params[':referenz_id'] = $referenz_id;
        }
        
        $sql .= ' ORDER BY sortierung ASC, erstellt_am DESC';
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $bilder = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'data' => $bilder
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// POST: Bild hochladen
if ($request_method === 'POST') {
    if (!isset($_FILES['bild'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Keine Datei hochgeladen']);
        exit;
    }
    
    $file = $_FILES['bild'];
    $typ = $_POST['typ'] ?? 'galerie';
    $referenz_id = $_POST['referenz_id'] ?? null;
    $beschreibung = $_POST['beschreibung'] ?? '';
    $sortierung = $_POST['sortierung'] ?? 0;
    
    // Validierung
    $allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    $max_size = 5 * 1024 * 1024; // 5 MB
    
    if (!in_array($file['type'], $allowed_types)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Ungültiger Dateityp. Nur JPG, PNG, GIF und WebP erlaubt.']);
        exit;
    }
    
    if ($file['size'] > $max_size) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Datei zu groß. Maximal 5 MB erlaubt.']);
        exit;
    }
    
    if ($file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Upload-Fehler: ' . $file['error']]);
        exit;
    }
    
    // Eindeutigen Dateinamen generieren
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $filename = uniqid() . '_' . time() . '.' . $extension;
    $filepath = $upload_dir . $filename;
    
    // Datei verschieben
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Fehler beim Speichern der Datei']);
        exit;
    }
    
    // In Datenbank speichern
    try {
        $stmt = $pdo->prepare('
            INSERT INTO bilder (dateiname, dateipfad, typ, referenz_id, beschreibung, sortierung)
            VALUES (:dateiname, :dateipfad, :typ, :referenz_id, :beschreibung, :sortierung)
        ');
        
        $relative_path = '/Backend/uploads/' . $filename;
        
        $stmt->execute([
            ':dateiname' => $filename,
            ':dateipfad' => $relative_path,
            ':typ' => $typ,
            ':referenz_id' => $referenz_id,
            ':beschreibung' => $beschreibung,
            ':sortierung' => $sortierung
        ]);
        
        $bild_id = $pdo->lastInsertId();
        
        // Bei Alpaka oder Termin: hauptbild setzen falls erstes Bild
        if (($typ === 'alpaka' || $typ === 'termin') && $referenz_id) {
            $table = $typ === 'alpaka' ? 'alpakas' : 'termine';
            $check_stmt = $pdo->prepare("SELECT hauptbild FROM $table WHERE id = :id");
            $check_stmt->execute([':id' => $referenz_id]);
            $result = $check_stmt->fetch();
            
            if ($result && !$result['hauptbild']) {
                $update_stmt = $pdo->prepare("UPDATE $table SET hauptbild = :hauptbild WHERE id = :id");
                $update_stmt->execute([
                    ':hauptbild' => $relative_path,
                    ':id' => $referenz_id
                ]);
            }
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Bild erfolgreich hochgeladen',
            'data' => [
                'id' => $bild_id,
                'dateiname' => $filename,
                'dateipfad' => $relative_path,
                'url' => 'http://admin.seelenzauber-alpaka.de' . $relative_path
            ]
        ]);
    } catch (PDOException $e) {
        // Bei Fehler: Datei löschen
        if (file_exists($filepath)) {
            unlink($filepath);
        }
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// DELETE: Bild löschen
if ($request_method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $bild_id = $input['id'] ?? null;
    
    if (!$bild_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Bild-ID fehlt']);
        exit;
    }
    
    try {
        // Bild-Info abrufen
        $stmt = $pdo->prepare('SELECT * FROM bilder WHERE id = :id');
        $stmt->execute([':id' => $bild_id]);
        $bild = $stmt->fetch();
        
        if (!$bild) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Bild nicht gefunden']);
            exit;
        }
        
        // Datei löschen
        $filepath = $upload_dir . $bild['dateiname'];
        if (file_exists($filepath)) {
            unlink($filepath);
        }
        
        // Aus Datenbank löschen
        $delete_stmt = $pdo->prepare('DELETE FROM bilder WHERE id = :id');
        $delete_stmt->execute([':id' => $bild_id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Bild erfolgreich gelöscht'
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Methode nicht erlaubt']);
?>
