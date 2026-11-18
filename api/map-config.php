<?php
/**
 * API: MapTiler & Iloilo Map Configuration
 *
 * GET /api/map-config.php — Returns MapTiler key, styles, center, and bounding box
 */

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../config/maptiler.php';

if (getMethod() !== 'GET') {
    Response::error('Method not allowed.', 405);
}

$config = [
    'apiKey'         => MAPTILER_API_KEY,
    'tileUrl'        => MAPTILER_TILE_URL,
    'styleUrl'       => MAPTILER_STYLE_URL,
    'center'         => [ILOILO_CENTER_LAT, ILOILO_CENTER_LNG],
    'defaultZoom'    => ILOILO_DEFAULT_ZOOM,
    'minZoom'        => 10,
    'maxZoom'        => 18,
    'bbox'           => explode(',', ILOILO_BBOX),
    'regionName'     => 'Iloilo, Philippines',
    'districts'      => [
        'City Proper',
        'Jaro',
        'Mandurriao',
        'Molo',
        'La Paz',
        'Arevalo (Villa)',
        'Lapuz',
        'Pavia',
        'Santa Barbara',
        'Cabatuan',
        'Oton',
        'San Miguel',
        'Leganes',
        'Zarraga',
        'Passi City',
        'Miagao',
        'Guimbal',
        'Dumangas'
    ]
];

Response::success($config, 'Map configuration retrieved.');
