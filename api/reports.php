<?php
/**
 * API: Reports
 * 
 * POST /api/reports.php   — Submit a new waiting-time report
 * GET  /api/reports.php   — List reports (with optional filters)
 * 
 * Front-end integration points:
 *   #report-form                — The report submission form
 *   #report-success-message     — Success feedback element
 *   #report-error-message       — Error feedback element
 * 
 * Expected POST body (JSON or form-data):
 * {
 *   "commuter_name":      "Juan",
 *   "transport_type":     "jeepney",
 *   "route_name":         "City Proper - Jaro",
 *   "location":           "Jaro Plaza",
 *   "waiting_minutes":    25,
 *   "report_description": "Very long line"
 * }
 */

require_once __DIR__ . '/bootstrap.php';

$db = Database::getInstance()->getConnection();

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
      ->maxLength($data, 'commuter_name',    100, 'Name')
      ->maxLength($data, 'report_description', 2000, 'Description');

    if (!$v->passes()) {
        Response::error('Validation failed.', 422, $v->errors());
    }

    // ── Sanitise ─────────────────────────────────────────────
    $commuterName = !empty($data['commuter_name'])
        ? Validator::sanitize($data['commuter_name'])
        : null;
    $transportType     = Validator::sanitize($data['transport_type']);
    $routeName         = Validator::sanitize($data['route_name']);
    $location          = Validator::sanitize($data['location']);
    $waitingMinutes    = (int) $data['waiting_minutes'];
    $reportDescription = !empty($data['report_description'])
        ? Validator::sanitize($data['report_description'])
        : null;

    // Client IP (respects proxy headers in dev)
    $ip = $_SERVER['HTTP_X_FORWARDED_FOR']
        ?? $_SERVER['HTTP_X_REAL_IP']
        ?? $_SERVER['REMOTE_ADDR']
        ?? null;

    // ── Insert ───────────────────────────────────────────────
    $stmt = $db->prepare("
        INSERT INTO reports
            (commuter_name, transport_type, route_name, location, waiting_minutes, report_description, ip_address)
        VALUES
            (:name, :type, :route, :location, :minutes, :description, :ip)
    ");

    $stmt->execute([
        ':name'        => $commuterName,
        ':type'        => $transportType,
        ':route'       => $routeName,
        ':location'    => $location,
        ':minutes'     => $waitingMinutes,
        ':description' => $reportDescription,
        ':ip'          => $ip,
    ]);

    $reportId = (int) $db->lastInsertId();

    Response::success(
        ['report_id' => $reportId],
        'Report submitted successfully. Thank you for helping fellow commuters!',
        201
    );
}

// ══════════════════════════════════════════════════════════════
// GET — List Reports
// ══════════════════════════════════════════════════════════════
if (getMethod() === 'GET') {

    $page    = max(1, (int) ($_GET['page']     ?? 1));
    $perPage = min(50, max(1, (int) ($_GET['per_page'] ?? 20)));
    $offset  = ($page - 1) * $perPage;

    $where  = [];
    $params = [];

    // Filter by transport type
    if (!empty($_GET['type'])) {
        $where[]  = 'transport_type = :type';
        $params[':type'] = $_GET['type'];
    }

    // Filter by status
    if (!empty($_GET['status'])) {
        $where[]  = 'status = :status';
        $params[':status'] = $_GET['status'];
    }

    $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

    // Count total
    $countStmt = $db->prepare("SELECT COUNT(*) FROM reports {$whereClause}");
    $countStmt->execute($params);
    $total = (int) $countStmt->fetchColumn();

    // Fetch page
    $sql = "
        SELECT
            id,
            commuter_name,
            transport_type,
            route_name,
            location,
            waiting_minutes,
            report_description,
            status,
            created_at
        FROM reports
        {$whereClause}
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset
    ";

    $stmt = $db->prepare($sql);
    foreach ($params as $k => $v) {
        $stmt->bindValue($k, $v);
    }
    $stmt->bindValue(':limit',  $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset,  PDO::PARAM_INT);
    $stmt->execute();

    $rows = $stmt->fetchAll();

    Response::paginated($rows, $total, $page, $perPage, 'Reports retrieved.');
}

Response::error('Method not allowed.', 405);
