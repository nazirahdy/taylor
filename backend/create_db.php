<?php
try {
    $pdo = new PDO("mysql:host=127.0.0.1", "root", "");
    $pdo->exec("CREATE DATABASE IF NOT EXISTS taylor");
    echo "DATABASE_CREATED_OR_EXISTS";
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage();
}
