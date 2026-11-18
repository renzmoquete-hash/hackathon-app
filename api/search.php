<?php
/**
 * API: Search (Unified)
 * 
 * GET /api/search.php?q=jaro  — Search routes, locations, transport types
 * 
 * Front-end integration point:
 *   #hero-search-form   — The hero search bar
 *   #hero-search-input  — Search input (name="search_query")
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

$db = Database::getInstance()->getConnection();

$likeQuery = '%' . $query . '%';

$stmt = $db->prepare("
    SELECT
        r.id,
        r.route_code                  AS route_id,
        tt.slug                       AS transport_type,
        tt.label                      AS transport_label,
        tt.icon                       AS transport_icon,
        r.route_name,
        r.origin,
        r.destination,
        r.estimated_fare              AS fare,
        r.estimated_duration_minutes  AS duration_minutes,
        (
            SELECT wt.estimated_wait_minutes
            FROM waiting_times wt
            WHERE wt.route_id = r.id
            ORDER BY wt.recorded_at DESC
            LIMIT 1
        ) AS current_wait_minutes,
        (
            SELECT wt.status
            FROM waiting_times wt
            WHERE wt.route_id = r.id
            ORDER BY wt.recorded_at DESC
            LIMIT 1
        ) AS current_status
    FROM routes r
    JOIN transport_types tt ON r.transport_type_id = tt.id
    WHERE r.is_active = 1
      AND (
          r.route_name   LIKE :like1
          OR r.origin    LIKE :like2
          OR r.destination LIKE :like3
          OR tt.slug     LIKE :like4
          OR tt.label    LIKE :like5
      )
    ORDER BY r.route_name ASC
    LIMIT 20
");

$stmt->execute([
    ':like1' => $likeQuery,
    ':like2' => $likeQuery,
    ':like3' => $likeQuery,
    ':like4' => $likeQuery,
    ':like5' => $likeQuery,
]);

$results = $stmt->fetchAll();

Response::success($results, 'Search results.', 200, ['count' => count($results), 'query' => $query]);
