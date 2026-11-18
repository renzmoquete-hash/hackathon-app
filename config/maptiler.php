<?php
/**
 * MapTiler & Iloilo Transit Configuration
 */

define('MAPTILER_API_KEY', 'guHcH7diPQJI56dDsa2f');

// Iloilo City geographic center and bounds
define('ILOILO_CENTER_LAT', 10.7202);
define('ILOILO_CENTER_LNG', 122.5621);
define('ILOILO_DEFAULT_ZOOM', 13);

// Bounding box for Iloilo Province (prevents searches outside Iloilo)
// [min_lng, min_lat, max_lng, max_lat]
define('ILOILO_BBOX', '122.35,10.55,123.10,11.35');
define('ILOILO_PROXIMITY', '122.5621,10.7202');

// MapTiler Tile Layer URL (Streets V2)
define('MAPTILER_TILE_URL', 'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=' . MAPTILER_API_KEY);
define('MAPTILER_STYLE_URL', 'https://api.maptiler.com/maps/streets-v2/style.json?key=' . MAPTILER_API_KEY);
