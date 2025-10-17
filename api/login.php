<?php
session_start();
require_once __DIR__ . '/db.php';
$data = json_decode(file_get_contents('php://input'), true);
$email = filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL);
$password = $data['password'] ?? '';

if (!$email || !$password) {
  http_response_code(400);
  echo json_encode(['error' => 'Ungültige Eingaben']);
  exit;
}

$stmt = $pdo->prepare('SELECT id, password_hash FROM users WHERE email = :email LIMIT 1');
$stmt->execute([':email' => $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($password, $user['password_hash'])) {
  session_regenerate_id(true);
  $_SESSION['user_id'] = $user['id'];
  $_SESSION['email'] = $email;
  echo json_encode(['ok' => true]);
} else {
  http_response_code(401);
  echo json_encode(['error' => 'Ungültige Zugangsdaten']);
}