<?php
/**
 * API: Iloilo Geocoding (MapTiler + Local Iloilo Transit Database)
 *
 * GET /api/geocoding.php?q=Jaro+Plaza
 *
 * Strictly constrained to Iloilo Province & City.
 */

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../config/maptiler.php';

if (getMethod() !== 'GET') {
    Response::error('Method not allowed.', 405);
}

$query = trim($_GET['q'] ?? '');

if ($query === '') {
    Response::error('Search query is required.', 400);
}

$results = [];
$seenCoords = [];

// ── 1. Search local curated Iloilo transit places first ──────
$store = new JsonStore('iloilo_places');
$localPlaces = $store->all();
$qLower = mb_strtolower($query);

foreach ($localPlaces as $place) {
    $nameLower = mb_strtolower($place['name']);
    $distLower = mb_strtolower($place['district']);
    $addrLower = mb_strtolower($place['address'] ?? '');

    if (str_contains($nameLower, $qLower) || str_contains($distLower, $qLower) || str_contains($addrLower, $qLower)) {
        $coordKey = round($place['coordinates'][0], 4) . ',' . round($place['coordinates'][1], 4);
        if (!isset($seenCoords[$coordKey])) {
            $seenCoords[$coordKey] = true;
            $results[] = [
                'name'         => $place['name'],
                'district'     => $place['district'],
                'full_address' => $place['address'] ?? ($place['name'] . ', ' . $place['district'] . ', Iloilo'),
                'coordinates'  => $place['coordinates'], // [lat, lng]
                'category'     => $place['category'],
                'source'       => 'local_iloilo_registry',
                'waiting_time' => $place['waiting_time_estimate'] ?? null,
                'status'       => $place['status'] ?? 'normal',
                'puv_types'    => $place['transport_types'] ?? []
            ];
        }
    }
}

// ── 2. Query MapTiler Geocoding API (strictly bounded to Iloilo) ──
$encodedQuery = urlencode($query . ', Iloilo');
$maptilerUrl = sprintf(
    'https://api.maptiler.com/geocoding/%s.json?key=%s&proximity=%s&bbox=%s&language=en',
    $encodedQuery,
    MAPTILER_API_KEY,
    ILOILO_PROXIMITY,
    ILOILO_BBOX
);

$ch = curl_init($maptilerUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 4);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_USERAGENT, 'IloiloTransitTracker/1.0');
$rawResponse = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200 && !empty($rawResponse)) {
    $geoData = json_decode($rawResponse, true);
    if (!empty($geoData['features'])) {
        foreach ($geoData['features'] as $feature) {
            // MapTiler returns coordinates as [lng, lat]
            $lng = (float) $feature['geometry']['coordinates'][0];
            $lat = (float) $feature['geometry']['coordinates'][1];

            // Verify coordinate falls inside Iloilo bounds (approx 10.5 - 11.4 lat, 122.3 - 123.2 lng)
            if ($lat < 10.5 || $lat > 11.4 || $lng < 122.2 || $lng > 123.2) {
                continue;
            }

            $coordKey = round($lat, 4) . ',' . round($lng, 4);
            if (!isset($seenCoords[$coordKey])) {
                $seenCoords[$coordKey] = true;
                $results[] = [
                    'name'         => $feature['text'] ?? $feature['place_name'],
                    'district'     => $feature['context'][0]['text'] ?? 'Iloilo',
                    'full_address' => $feature['place_name'],
                    'coordinates'  => [$lat, $lng],
                    'category'     => $feature['place_type'][0] ?? 'location',
                    'source'       => 'maptiler_geocoding',
                    'waiting_time' => 15,
                    'status'       => 'normal',
                    'puv_types'    => ['jeepney', 'taxi', 'tricycle']
                ];
            }
        }
    }
}

Response::success($results, 'Geocoding results for Iloilo.', 200, [
    'count' => count($results),
    'query' => $query,
    'bounds' => 'Iloilo Province & City'
]);
