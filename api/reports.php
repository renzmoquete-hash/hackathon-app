<?php
/**
 * API: Reports
 *
 * POST /api/reports.php   — Submit a new waiting-time report
 * GET  /api/reports.php   — List reports (paginated)
 *
 * Front-end targets:
 *   #report-form, #report-success-message, #report-error-message
 *   name="commuter_name", name="transport_type", name="route_name",
 *   name="location", name="waiting_minutes", name="report_description"
 */

require_once __DIR__ . '/bootstrap.php';

$store = new JsonStore('reports');

// ══════════════════════════════════════════════════════════════
// POST — Submit Report
// ══════════════════════════════════════════════════════════════
if (getMethod() === 'POST') {

    $data = getJsonBody();

    // ── Validate ─────────────────────────────────────────────
    $allowedTypes = ['jeepney', 'bus', 'uv', 'train', 'other'];

    $v = new Validator();
    $v->required($data, 'transport_type', 'Transport type')
      ->inList($data, 'transport_type', $allowedTypes, 'Transport type')
      ->required($data, 'route_name',    'Route')
      ->maxLength($data, 'route_name',   120, 'Route')
      ->required($data, 'location',      'Location')
      ->maxLength($data, 'location',     200, 'Location')
      ->required($data, 'waiting_minutes', 'Waiting time')
      ->positiveInt($data, 'waiting_minutes', 'Waiting time')
      ->maxLength($data, 'commuter_name',       100, 'Name')
      ->maxLength($data, 'report_description', 2000, 'Description');

    if (!$v->passes()) {
        Response::error('Validation failed.', 422, $v->errors());
    }

    // ── Build record ─────────────────────────────────────────
    $report = [
        'id'                 => 'rpt-' . time() . '-' . random_int(1000, 9999),
        'commuter_name'      => !empty($data['commuter_name'])
                                    ? Validator::sanitize($data['commuter_name'])
                                    : null,
        'transport_type'     => Validator::sanitize($data['transport_type']),
        'route_name'         => Validator::sanitize($data['route_name']),
        'location'           => Validator::sanitize($data['location']),
        'waiting_minutes'    => (int) $data['waiting_minutes'],
        'report_description' => !empty($data['report_description'])
                                    ? Validator::sanitize($data['report_description'])
                                    : null,
        'status'             => 'pending',
        'created_at'         => date('c'),   // ISO 8601
    ];

    $store->append($report);

    Response::success(
        ['report_id' => $report['id']],
        'Report submitted successfully. Thank you for helping fellow commuters!',
        201
    );
}

// ══════════════════════════════════════════════════════════════
// GET — List Reports (paginated)
// ══════════════════════════════════════════════════════════════
if (getMethod() === 'GET') {

    $page    = max(1, (int) ($_GET['page']     ?? 1));
    $perPage = min(50, max(1, (int) ($_GET['per_page'] ?? 20)));

    $all = $store->all();

    // Filter by transport type
    if (!empty($_GET['type'])) {
        $type = $_GET['type'];
        $all = array_values(array_filter($all, fn($r) => $r['transport_type'] === $type));
    }

    // Filter by status
    if (!empty($_GET['status'])) {
        $status = $_GET['status'];
        $all = array_values(array_filter($all, fn($r) => $r['status'] === $status));
    }

    // Sort newest first
    usort($all, fn($a, $b) => strcmp($b['created_at'] ?? '', $a['created_at'] ?? ''));

    $total = count($all);
    $paged = $store->paginate($all, $page, $perPage);

    Response::paginated($paged, $total, $page, $perPage, 'Reports retrieved.');
}

Response::error('Method not allowed.', 405);
