<?php
/**
 * Database Setup Script
 * 
 * Run this ONCE to create the database, tables, and seed data.
 * 
 * Usage (CLI — recommended):
 *   C:\xampp\php\php.exe database/setup.php
 * 
 * Usage (Browser — if Apache is running):
 *   http://localhost/hackathon-app/database/setup.php
 * 
 * ⚠ WARNING: Running this will recreate tables and re-insert seed data.
 */

// Allow running from CLI or browser
if (php_sapi_name() !== 'cli') {
    header('Content-Type: text/plain; charset=utf-8');
}

echo "=== PH Transport Waits — Database Setup ===\n\n";

// Load config
require_once __DIR__ . '/../config/config.php';

try {
    // Connect without selecting a database first
    $dsn = sprintf('mysql:host=%s;port=%s;charset=%s', DB_HOST, DB_PORT, DB_CHARSET);
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    echo "[1/4] Connected to MySQL/MariaDB successfully.\n";

    // ── Run schema ───────────────────────────────────────────
    echo "[2/4] Running schema.sql...\n";
    $schema = file_get_contents(__DIR__ . '/schema.sql');
    $statements = array_filter(
        array_map('trim', preg_split('/;\s*$/m', $schema)),
        fn($s) => !empty($s)
    );

    foreach ($statements as $sql) {
        $pdo->exec($sql);
    }
    echo "     Tables created successfully.\n";

    // ── Run seed ─────────────────────────────────────────────
    echo "[3/4] Running seed.sql...\n";
    $seed = file_get_contents(__DIR__ . '/seed.sql');
    $statements = array_filter(
        array_map('trim', preg_split('/;\s*$/m', $seed)),
        fn($s) => !empty($s)
    );

    foreach ($statements as $sql) {
        $pdo->exec($sql);
    }
    echo "     Seed data inserted successfully.\n";

    // ── Verify ───────────────────────────────────────────────
    echo "[4/4] Verifying...\n";
    $pdo->exec("USE `" . DB_NAME . "`");

    $tables = ['transport_types', 'routes', 'waiting_times', 'reports', 'stats'];
    foreach ($tables as $table) {
        $count = $pdo->query("SELECT COUNT(*) FROM `{$table}`")->fetchColumn();
        echo "     + {$table}: {$count} rows\n";
    }

    echo "\n=== Database setup complete! ===\n";
    echo "\nAPI endpoints:\n";
    echo "  GET  /api/waiting-times.php\n";
    echo "  GET  /api/routes.php\n";
    echo "  POST /api/reports.php\n";
    echo "  GET  /api/reports.php\n";
    echo "  GET  /api/stats.php\n";
    echo "  GET  /api/search.php?q=...\n";

} catch (PDOException $e) {
    echo "\n!!! ERROR: " . $e->getMessage() . "\n";
    echo "\nTroubleshooting:\n";
    echo "  1. Make sure XAMPP MySQL/MariaDB is running.\n";
    echo "  2. Check config/config.php credentials.\n";
    echo "  3. Default XAMPP: user=root, password=(empty)\n";
    exit(1);
}
