<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Nur POST erlaubt.']);
    exit;
}

require __DIR__ . '/db.php';

$errors = [];

$email    = trim($_POST['email']    ?? '');
$password =        $_POST['password'] ?? '';
$redirect = $_POST['redirect'] ?? '/index.html';
// CSRF fürs Erste ignorieren
$csrf     = $_POST['csrf_token'] ?? '';

if ($email === '') {
    $errors['email'] = 'Bitte E-Mail angeben.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Bitte eine gültige E-Mail-Adresse eingeben.';
}

if ($password === '') {
    $errors['password'] = 'Bitte Passwort eingeben.';
}

if (!empty($errors)) {
    echo json_encode([
        'ok'      => false,
        'message' => 'Bitte korrigiere die markierten Felder.',
        'errors'  => $errors,
    ]);
    exit;
}

$emailNorm = mb_strtolower($email, 'UTF-8');

// User holen
$stmt = $pdo->prepare('SELECT id, first_name, password_hash FROM users WHERE email = :email');
$stmt->execute([':email' => $emailNorm]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    echo json_encode([
        'ok'      => false,
        'message' => 'E-Mail oder Passwort ist falsch.',
        'errors'  => [
            'email'    => 'E-Mail oder Passwort ist falsch.',
            'password' => 'E-Mail oder Passwort ist falsch.',
        ],
    ]);
    exit;
}

// Login erfolgreich → Session setzen
$_SESSION['user_id']   = $user['id'];
$_SESSION['user_name'] = $user['first_name'];

echo json_encode([
    'ok'       => true,
    'message'  => 'Erfolgreich angemeldet.',
    'redirect' => $redirect ?: '/index.html',
]);
