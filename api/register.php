<?php
session_start();
require_once __DIR__ . '/db.php';
$data = json_decode(file_get_contents('php://input'), true);
$email = filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL);
$password = $data['password'] ?? '';

if (!$email || strlen($password) < 8) {
  http_response_code(400);
  echo json_encode(['error' => 'Ungültige Eingaben']);
  exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $pdo->prepare('INSERT INTO users (email, password_hash, created_at) VALUES (:email, :hash, :now)');
try {
  $stmt->execute([':email' => $email, ':hash' => $hash, ':now' => date('c')]);
  echo json_encode(['ok' => true]);
} catch (PDOException $e) {
  if (strpos($e->getMessage(), 'UNIQUE') !== false) {
    http_response_code(409);
    echo json_encode(['error' => 'E-Mail bereits registriert']);
  } else {
    http_response_code(500);
    echo json_encode(['error' => 'Serverfehler']);
  }
}