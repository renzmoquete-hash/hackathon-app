<?php
/**
 * API: Search (Unified)
 *
 * GET /api/search.php?q=jaro  — Search routes, locations, transport types
 *
 * Front-end targets:
 *   #hero-search-form, #hero-search-input (name="search_query")
 */

require_once __DIR__ . '/bootstrap.php';

if (getMethod() !== 'GET') {
    Response::error('Method not allowed.', 405);
}

$query = trim($_GET['q'] ?? '');

if ($query === '') {
    Response::error('Search query is required.', 400);
}

if (mb_strlen($query) < 2) {
    Response::error('Search query must be at least 2 characters.', 400);
}

$store   = new JsonStore('routes');
$results = $store->search(
    $query,
    ['route_name', 'origin', 'destination', 'transport_type', 'transport_label']
);

Response::success($results, 'Search results.', 200, [
    'count' => count($results),
    'query' => $query,
]);
