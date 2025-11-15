<?php
// db.php – zentrale PostgreSQL-Verbindung

$DB_HOST = 'mixmaxjulien.de';   // oder interne Adresse, falls dein Kollege dir eine andere nennt
$DB_PORT = '5432';
$DB_NAME = 'Mietradar';         // so wie in pgAdmin
$DB_USER = 'mietradar@muenchen.de';         // oder der Web-User, den ihr verwendet
$DB_PASS = 'ZJ*ILKB!333MGyoVZm4y'; // <-- PASSWORT

$dsn = "pgsql:host=$DB_HOST;port=$DB_PORT;dbname=$DB_NAME;";

try {
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'ok'      => false,
        'message' => 'Datenbankverbindung fehlgeschlagen.',
    ]);
    exit;
}
