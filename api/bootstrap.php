<?php
/**
 * API Bootstrap
 *
 * Include at the top of every API endpoint.
 * Sets up: JSON headers, CORS, error handling, includes.
 */

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// ── Headers ──────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// ── Includes ─────────────────────────────────────────────────
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/JsonStore.php';
require_once __DIR__ . '/../includes/Response.php';
require_once __DIR__ . '/../includes/Validator.php';

// ── CORS ─────────────────────────────────────────────────────
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, CORS_ALLOWED_ORIGINS, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
} elseif (APP_DEBUG) {
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Global Exception Handler ─────────────────────────────────
set_exception_handler(function (Throwable $e) {
    $msg = APP_DEBUG ? $e->getMessage() : 'Internal server error';
    error_log("API Error: {$e->getMessage()} in {$e->getFile()}:{$e->getLine()}");
    Response::error($msg, 500);
});

// ── Helpers ──────────────────────────────────────────────────
function getJsonBody(): array
{
    $raw = file_get_contents('php://input');
    if (empty($raw)) {
        return $_POST ?: [];
    }
    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        Response::error('Invalid JSON in request body.', 400);
    }
    return $data;
}

function getMethod(): string
{
    return strtoupper($_SERVER['REQUEST_METHOD']);
}
