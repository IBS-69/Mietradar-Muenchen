<?php
declare(strict_types=1);
$dbFile = __DIR__ . '/../db/users.sqlite';
if (!file_exists($dbFile)) {
    if (!is_dir(dirname($dbFile))) mkdir(dirname($dbFile), 0750, true);
    $init = true;
}
$pdo = new PDO('sqlite:' . $dbFile);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->exec('PRAGMA foreign_keys = ON;');
