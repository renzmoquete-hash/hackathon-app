<?php
/**
 * App Configuration
 * No database required — data stored in JSON files.
 */

// ── Environment ──────────────────────────────────────────────
define('APP_ENV',   'development');
define('APP_DEBUG', true);

// ── Paths ────────────────────────────────────────────────────
define('DATA_DIR',  __DIR__ . '/../data');
define('ROOT_DIR',  __DIR__ . '/..');

// ── CORS (allowed front-end origins) ─────────────────────────
define('CORS_ALLOWED_ORIGINS', [
    'http://localhost',
    'http://localhost:3000',
    'http://127.0.0.1',
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'null',                        // local file:// opens send Origin: null
]);
