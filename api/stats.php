<?php
/**
 * API: Stats
 *
 * GET /api/stats.php  — Retrieve hero-section statistics
 *
 * Front-end targets:
 *   #hero-stats, .stat-card
 */

require_once __DIR__ . '/bootstrap.php';

if (getMethod() !== 'GET') {
    Response::error('Method not allowed.', 405);
}

$routes  = new JsonStore('routes');
$reports = new JsonStore('reports');

$allRoutes = $routes->all();
$totalRoutes = count($allRoutes);

// Average wait time
$waits = array_column($allRoutes, 'estimated_wait_minutes');
$avgWait = $totalRoutes > 0 ? round(array_sum($waits) / $totalRoutes, 1) : 0;

// Total reports filed
$totalReports = $reports->count();

// Delayed routes
$delayedCount = count(array_filter($allRoutes, fn($r) =>
    in_array($r['status'] ?? '', ['delayed', 'very-delayed'])
));

$stats = [
    [
        'stat_key'   => 'total_routes',
        'stat_value' => (string) $totalRoutes,
        'stat_label' => 'Active Routes',
    ],
    [
        'stat_key'   => 'avg_wait_time',
        'stat_value' => $avgWait . ' min',
        'stat_label' => 'Avg. Wait Time',
    ],
    [
        'stat_key'   => 'total_reports',
        'stat_value' => number_format($totalReports),
        'stat_label' => 'Reports Filed',
    ],
    [
        'stat_key'   => 'delayed_routes',
        'stat_value' => (string) $delayedCount,
        'stat_label' => 'Routes Currently Delayed',
    ],
];

Response::success($stats, 'Stats retrieved.');
