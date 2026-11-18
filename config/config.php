<?php
/**
 * Database & App Configuration
 * 
 * ╔════════════════════════════════════════════════════════════╗
 * ║  IMPORTANT: Update DB_PASS below with your MySQL root    ║
 * ║  password. Your system runs MySQL 8.0 (not XAMPP MariaDB) ║
 * ║  on port 3306.                                            ║
 * ╚════════════════════════════════════════════════════════════╝
 */

// ── Environment ──────────────────────────────────────────────
define('APP_ENV',   getenv('APP_ENV')   ?: 'development');
define('APP_DEBUG', APP_ENV === 'development');

// ── Database ─────────────────────────────────────────────────
define('DB_HOST',    getenv('DB_HOST')    ?: 'localhost');
define('DB_PORT',    getenv('DB_PORT')    ?: '3306');
define('DB_NAME',    getenv('DB_NAME')    ?: 'ph_transport_waits');
define('DB_USER',    getenv('DB_USER')    ?: 'root');
define('DB_PASS',    getenv('DB_PASS')    ?: '');       // ← PUT YOUR MySQL root PASSWORD HERE
define('DB_CHARSET', 'utf8mb4');

// ── CORS (allowed front-end origins) ─────────────────────────
define('CORS_ALLOWED_ORIGINS', [
    'http://localhost',
    'http://localhost:3000',
    'http://127.0.0.1',
    'http://127.0.0.1:5500',      // VS Code Live Server
    'http://localhost:5500',
]);

// ── Rate Limiting ────────────────────────────────────────────
define('RATE_LIMIT_REQUESTS', 60);   // per window
define('RATE_LIMIT_WINDOW',   60);   // seconds
