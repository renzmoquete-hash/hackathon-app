<?php
/**
 * API: Waiting Times
 *
 * GET  /api/waiting-times.php              — List all current waiting times
 * GET  /api/waiting-times.php?type=jeepney — Filter by transport type
 * GET  /api/waiting-times.php?id=route-001 — Get single record
 *
 * Front-end targets:
 *   #waiting-time-container, .waiting-card
 *   data-transport-type, data-route-id, data-status, data-waiting-minutes
 */

require_once __DIR__ . '/bootstrap.php';

if (getMethod() !== 'GET') {
    Response::error('Method not allowed.', 405);
}

$store = new JsonStore('routes');

// ── Single record by ID ──────────────────────────────────────
if (!empty($_GET['id'])) {
    $row = $store->find('id', $_GET['id']);
    if (!$row) {
        Response::error('Waiting time not found.', 404);
    }
    Response::success($row);
}

// ── List (optionally filtered) ───────────────────────────────
$results = $store->all();

// Filter by transport type
if (!empty($_GET['type']) && $_GET['type'] !== 'all') {
    $type = $_GET['type'];
    $results = array_values(array_filter($results, fn($r) => $r['transport_type'] === $type));
}

// Filter by status
if (!empty($_GET['status'])) {
    $status = $_GET['status'];
    $results = array_values(array_filter($results, fn($r) => $r['status'] === $status));
}

Response::success($results, 'Waiting times retrieved.', 200, ['count' => count($results)]);
