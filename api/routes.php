<?php
/**
 * API: Routes
 *
 * GET  /api/routes.php                                    — List all routes
 * GET  /api/routes.php?origin=Jaro&destination=Molo       — Search
 * GET  /api/routes.php?type=jeepney                       — Filter by type
 * GET  /api/routes.php?q=airport                          — General search
 *
 * Front-end targets:
 *   #route-search-form, #route-search-results, .route-result-card
 *   name="origin", name="destination", name="transport_type"
 */

require_once __DIR__ . '/bootstrap.php';

if (getMethod() !== 'GET') {
    Response::error('Method not allowed.', 405);
}

$store   = new JsonStore('routes');
$results = $store->all();

// ── Filter by transport type ─────────────────────────────────
if (!empty($_GET['type']) && $_GET['type'] !== 'all') {
    $type = $_GET['type'];
    $results = array_values(array_filter($results, fn($r) => $r['transport_type'] === $type));
}

// ── Filter by origin ─────────────────────────────────────────
if (!empty($_GET['origin'])) {
    $origin = mb_strtolower($_GET['origin']);
    $results = array_values(array_filter($results, fn($r) =>
        str_contains(mb_strtolower($r['origin']), $origin)
    ));
}

// ── Filter by destination ────────────────────────────────────
if (!empty($_GET['destination'])) {
    $dest = mb_strtolower($_GET['destination']);
    $results = array_values(array_filter($results, fn($r) =>
        str_contains(mb_strtolower($r['destination']), $dest)
    ));
}

// ── General search query ─────────────────────────────────────
if (!empty($_GET['q'])) {
    $results = $store->search(
        $_GET['q'],
        ['route_name', 'origin', 'destination', 'transport_type', 'transport_label']
    );
}

Response::success($results, 'Routes retrieved.', 200, ['count' => count($results)]);
