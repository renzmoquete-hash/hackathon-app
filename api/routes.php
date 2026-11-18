<?php
/**
 * API: Routes
 * 
 * GET  /api/routes.php                                    — List all routes
 * GET  /api/routes.php?origin=Jaro&destination=Molo       — Search routes
 * GET  /api/routes.php?type=jeepney                       — Filter by type
 * GET  /api/routes.php?q=airport                          — Full-text search
 * 
 * Front-end integration points:
 *   #route-search-form      — Search form
 *   #route-search-results   — Results container
 *   .route-result-card      — Each result card
 *   name="origin"           — Origin field
 *   name="destination"      — Destination field
 *   name="transport_type"   — Type filter
 */

require_once __DIR__ . '/bootstrap.php';

if (getMethod() !== 'GET') {
    Response::error('Method not allowed.', 405);
}

$db = Database::getInstance()->getConnection();

$where  = ['r.is_active = 1'];
$params = [];

// ── Filter by transport type ─────────────────────────────────
if (!empty($_GET['type']) && $_GET['type'] !== 'all') {
    $where[]  = 'tt.slug = :type';
    $params[':type'] = $_GET['type'];
}

// ── Search by origin ─────────────────────────────────────────
if (!empty($_GET['origin'])) {
    $where[]  = 'r.origin LIKE :origin';
    $params[':origin'] = '%' . $_GET['origin'] . '%';
}

// ── Search by destination ────────────────────────────────────
if (!empty($_GET['destination'])) {
    $where[]  = 'r.destination LIKE :destination';
    $params[':destination'] = '%' . $_GET['destination'] . '%';
}

// ── Full-text search (hero search bar, general query) ────────
if (!empty($_GET['q'])) {
    $where[]  = '(r.route_name LIKE :like_q OR r.origin LIKE :like_q2 OR r.destination LIKE :like_q3 OR tt.label LIKE :like_q4)';
    $likeQ = '%' . $_GET['q'] . '%';
    $params[':like_q']  = $likeQ;
    $params[':like_q2'] = $likeQ;
    $params[':like_q3'] = $likeQ;
    $params[':like_q4'] = $likeQ;
}

$whereClause = implode(' AND ', $where);

$sql = "
    SELECT
        r.id                          AS id,
        r.route_code                  AS route_id,
        tt.slug                       AS transport_type,
        tt.label                      AS transport_label,
        tt.icon                       AS transport_icon,
        r.route_name                  AS route_name,
        r.origin                      AS origin,
        r.destination                 AS destination,
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
    WHERE {$whereClause}
    ORDER BY r.route_name ASC
";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

Response::success($rows, 'Routes retrieved.', 200, ['count' => count($rows)]);
