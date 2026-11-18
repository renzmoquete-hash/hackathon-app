<?php
/**
 * API: Iloilo Transit Places & Stops
 *
 * GET /api/places.php                      — List all Iloilo transit places
 * GET /api/places.php?q=jaro               — Search places by name, street, or landmark
 * GET /api/places.php?district=molo        — Filter places by district
 * GET /api/places.php?type=tricycle        — Filter by available PUV type
 * GET /api/places.php?category=terminal    — Filter by category (terminal, mall, plaza, etc.)
 */

require_once __DIR__ . '/bootstrap.php';

if (getMethod() !== 'GET') {
    Response::error('Method not allowed.', 405);
}

$store = new JsonStore('iloilo_places');
$results = $store->all();

// Filter by search query
if (!empty($_GET['q'])) {
    $q = mb_strtolower(trim($_GET['q']));
    $results = array_values(array_filter($results, function($place) use ($q) {
        $nameMatch = str_contains(mb_strtolower($place['name']), $q);
        $districtMatch = str_contains(mb_strtolower($place['district']), $q);
        $addressMatch = str_contains(mb_strtolower($place['address'] ?? ''), $q);
        $notesMatch = str_contains(mb_strtolower($place['notes'] ?? ''), $q);
        
        $routesMatch = false;
        if (!empty($place['passing_routes']) && is_array($place['passing_routes'])) {
            foreach ($place['passing_routes'] as $r) {
                if (str_contains(mb_strtolower($r), $q)) {
                    $routesMatch = true;
                    break;
                }
            }
        }
        return $nameMatch || $districtMatch || $addressMatch || $notesMatch || $routesMatch;
    }));
}

// Filter by district
if (!empty($_GET['district']) && $_GET['district'] !== 'all') {
    $dist = mb_strtolower(trim($_GET['district']));
    $results = array_values(array_filter($results, function($place) use ($dist) {
        return str_contains(mb_strtolower($place['district']), $dist);
    }));
}

// Filter by transport type
if (!empty($_GET['type']) && $_GET['type'] !== 'all') {
    $type = mb_strtolower(trim($_GET['type']));
    $results = array_values(array_filter($results, function($place) use ($type) {
        return !empty($place['transport_types']) && in_array($type, $place['transport_types'], true);
    }));
}

// Filter by category
if (!empty($_GET['category']) && $_GET['category'] !== 'all') {
    $cat = mb_strtolower(trim($_GET['category']));
    $results = array_values(array_filter($results, function($place) use ($cat) {
        return strtolower($place['category'] ?? '') === $cat;
    }));
}

Response::success($results, 'Iloilo transit places retrieved.', 200, [
    'count' => count($results),
    'region' => 'Iloilo Province & City'
]);
