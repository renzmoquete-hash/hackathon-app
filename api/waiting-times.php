<?php
/**
 * API: Waiting Times
 * 
 * GET  /api/waiting-times.php              — List all current waiting times
 * GET  /api/waiting-times.php?type=jeepney — Filter by transport type
 * GET  /api/waiting-times.php?id=1         — Get single waiting time by route ID
 * 
 * Front-end integration points:
 *   #waiting-time-container   — Render cards here
 *   .waiting-card             — Each card
 *   data-transport-type       — Filter attribute
 *   data-route-id             — Route identifier
 *   data-status               — Status badge
 *   data-waiting-minutes      — Numeric wait value
 */

require_once __DIR__ . '/bootstrap.php';

if (getMethod() !== 'GET') {
    Response::error('Method not allowed.', 405);
}

$db = Database::getInstance()->getConnection();

// ── Single record by route ID ────────────────────────────────
if (isset($_GET['id'])) {
    $id = (int) $_GET['id'];
    $stmt = $db->prepare("
        SELECT
            wt.id                       AS id,
            r.route_code                AS route_id,
            tt.slug                     AS transport_type,
            tt.label                    AS transport_label,
            tt.icon                     AS transport_icon,
            r.route_name                AS route_name,
            r.origin                    AS origin,
            r.destination               AS destination,
            wt.estimated_wait_minutes   AS estimated_wait_minutes,
            wt.status                   AS status,
            wt.passenger_count          AS passenger_count,
            wt.notes                    AS notes,
            wt.is_demo                  AS is_demo,
            wt.recorded_at              AS last_updated
        FROM waiting_times wt
        JOIN routes r          ON wt.route_id = r.id
        JOIN transport_types tt ON r.transport_type_id = tt.id
        WHERE r.id = :id
        ORDER BY wt.recorded_at DESC
        LIMIT 1
    ");
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if (!$row) {
        Response::error('Waiting time not found.', 404);
    }

    $row['is_demo'] = (bool) $row['is_demo'];
    Response::success($row);
}

// ── List (optionally filtered) ───────────────────────────────
$where  = ['r.is_active = 1'];
$params = [];

// Filter by transport type slug
if (!empty($_GET['type']) && $_GET['type'] !== 'all') {
    $where[]  = 'tt.slug = :type';
    $params[':type'] = $_GET['type'];
}

// Filter by status
if (!empty($_GET['status'])) {
    $where[]  = 'wt.status = :status';
    $params[':status'] = $_GET['status'];
}

$whereClause = implode(' AND ', $where);

$sql = "
    SELECT
        wt.id                       AS id,
        r.route_code                AS route_id,
        tt.slug                     AS transport_type,
        tt.label                    AS transport_label,
        tt.icon                     AS transport_icon,
        r.route_name                AS route_name,
        r.origin                    AS origin,
        r.destination               AS destination,
        r.estimated_fare            AS fare,
        r.estimated_duration_minutes AS duration_minutes,
        wt.estimated_wait_minutes   AS estimated_wait_minutes,
        wt.status                   AS status,
        wt.passenger_count          AS passenger_count,
        wt.is_demo                  AS is_demo,
        wt.recorded_at              AS last_updated
    FROM waiting_times wt
    JOIN routes r          ON wt.route_id = r.id
    JOIN transport_types tt ON r.transport_type_id = tt.id
    WHERE {$whereClause}
    ORDER BY wt.recorded_at DESC
";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

// Cast booleans
foreach ($rows as &$row) {
    $row['is_demo'] = (bool) $row['is_demo'];
}
unset($row);

Response::success($rows, 'Waiting times retrieved.', 200, ['count' => count($rows)]);
