<?php
/**
 * JSON Response Helper
 * 
 * Standardises every API response into a predictable envelope:
 * {
 *   "success": true|false,
 *   "data":    { ... } | [ ... ],
 *   "message": "...",
 *   "meta":    { "timestamp": "...", "count": N }
 * }
 */

class Response
{
    /**
     * Send a success response.
     */
    public static function success(mixed $data = null, string $message = 'OK', int $code = 200, array $meta = []): void
    {
        http_response_code($code);
        $payload = [
            'success' => true,
            'data'    => $data,
            'message' => $message,
            'meta'    => array_merge([
                'timestamp' => gmdate('Y-m-d\TH:i:s\Z'),
            ], $meta),
        ];
        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Send an error response.
     */
    public static function error(string $message = 'An error occurred', int $code = 400, mixed $errors = null): void
    {
        http_response_code($code);
        $payload = [
            'success' => false,
            'data'    => null,
            'message' => $message,
            'meta'    => [
                'timestamp' => gmdate('Y-m-d\TH:i:s\Z'),
            ],
        ];
        if ($errors !== null) {
            $payload['errors'] = $errors;
        }
        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Send a paginated success response.
     */
    public static function paginated(array $data, int $total, int $page, int $perPage, string $message = 'OK'): void
    {
        self::success($data, $message, 200, [
            'count'        => count($data),
            'total'        => $total,
            'page'         => $page,
            'per_page'     => $perPage,
            'total_pages'  => (int) ceil($total / max($perPage, 1)),
        ]);
    }
}
