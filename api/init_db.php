<?php
require_once __DIR__ . '/db.php';
$sql = "
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);
";
$pdo->exec($sql);
echo 'DB ready';
