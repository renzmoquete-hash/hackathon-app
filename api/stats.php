<?php
/**
 * API: Stats
 * 
 * GET /api/stats.php  — Retrieve hero-section statistics
 * 
 * Front-end integration points:
 *   #hero-stats     — Stats container
 *   .stat-card      — Each stat card
 */

require_once __DIR__ . '/bootstrap.php';

if (getMethod() !== 'GET') {
    Response::error('Method not allowed.', 405);
}

$db = Database::getInstance()->getConnection();

// ── Live-computed stats ──────────────────────────────────────
$stats = [];

// 1. Total active routes
$stmt = $db->query("SELECT COUNT(*) FROM routes WHERE is_active = 1");
$stats[] = [
    'stat_key'   => 'total_routes',
    'stat_value' => (string) $stmt->fetchColumn(),
    'stat_label' => 'Active Routes',
];

// 2. Average wait time (from latest readings per route)
$stmt = $db->query("
    SELECT ROUND(AVG(sub.estimated_wait_minutes), 1)
    FROM (
        SELECT wt.route_id, wt.estimated_wait_minutes
        FROM waiting_times wt
        INNER JOIN (
            SELECT route_id, MAX(recorded_at) AS max_recorded
            FROM waiting_times
            GROUP BY route_id
        ) latest ON wt.route_id = latest.route_id AND wt.recorded_at = latest.max_recorded
    ) sub
");
$avg = $stmt->fetchColumn();
$stats[] = [
    'stat_key'   => 'avg_wait_time',
    'stat_value' => ($avg ? $avg . ' min' : 'N/A'),
    'stat_label' => 'Avg. Wait Time',
];

// 3. Total reports filed
$stmt = $db->query("SELECT COUNT(*) FROM reports");
$stats[] = [
    'stat_key'   => 'total_reports',
    'stat_value' => number_format((int) $stmt->fetchColumn()),
    'stat_label' => 'Reports Filed',
];

// 4. Delayed routes right now
$stmt = $db->query("
    SELECT COUNT(DISTINCT sub.route_id)
    FROM (
        SELECT wt.route_id, wt.status
        FROM waiting_times wt
        INNER JOIN (
            SELECT route_id, MAX(recorded_at) AS max_recorded
            FROM waiting_times
            GROUP BY route_id
        ) latest ON wt.route_id = latest.route_id AND wt.recorded_at = latest.max_recorded
        WHERE wt.status IN ('delayed', 'very-delayed')
    ) sub
");
$stats[] = [
    'stat_key'   => 'delayed_routes',
    'stat_value' => (string) $stmt->fetchColumn(),
    'stat_label' => 'Routes Currently Delayed',
];

Response::success($stats, 'Stats retrieved.');
