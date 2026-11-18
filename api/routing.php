<?php
/**
 * API: Iloilo Public Transport Routing & Map Navigation
 *
 * GET /api/routing.php?origin=Jaro+Plaza&destination=SM+City+Iloilo
 * GET /api/routing.php?from=10.7289,122.5583&to=10.7138,122.5516&type=jeepney
 */

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../config/maptiler.php';

if (getMethod() !== 'GET') {
    Response::error('Method not allowed.', 405);
}

$originInput = trim($_GET['origin'] ?? $_GET['from'] ?? '');
$destInput   = trim($_GET['destination'] ?? $_GET['to'] ?? '');
$transportFilter = trim($_GET['type'] ?? 'all');

if (empty($originInput) || empty($destInput)) {
    Response::error('Both origin and destination are required.', 400);
}

// ── Helper: Resolve Input to Coordinates [lat, lng] & Label ──
function resolveLocation(string $input): array
{
    // Case A: Coordinates passed as "lat,lng"
    if (preg_match('/^([-+]?[0-9]*\.?[0-9]+),\s*([-+]?[0-9]*\.?[0-9]+)$/', $input, $matches)) {
        return [
            'name'        => 'Selected Location (' . round((float)$matches[1], 4) . ', ' . round((float)$matches[2], 4) . ')',
            'coordinates' => [(float)$matches[1], (float)$matches[2]],
            'district'    => 'Iloilo'
        ];
    }

    // Case B: Search local Iloilo places database
    $store = new JsonStore('iloilo_places');
    $places = $store->all();
    $inputLower = mb_strtolower($input);

    foreach ($places as $place) {
        if (str_contains(mb_strtolower($place['name']), $inputLower) ||
            str_contains(mb_strtolower($place['district']), $inputLower)) {
            return [
                'name'        => $place['name'],
                'coordinates' => $place['coordinates'],
                'district'    => $place['district']
            ];
        }
    }

    // Case C: Query MapTiler Geocoding API bounded to Iloilo
    $url = sprintf(
        'https://api.maptiler.com/geocoding/%s.json?key=%s&proximity=%s&bbox=%s&language=en',
        urlencode($input . ', Iloilo'),
        MAPTILER_API_KEY,
        ILOILO_PROXIMITY,
        ILOILO_BBOX
    );

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 4);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($code === 200 && !empty($res)) {
        $json = json_decode($res, true);
        if (!empty($json['features'][0]['geometry']['coordinates'])) {
            $lng = (float)$json['features'][0]['geometry']['coordinates'][0];
            $lat = (float)$json['features'][0]['geometry']['coordinates'][1];
            return [
                'name'        => $json['features'][0]['text'] ?? $input,
                'coordinates' => [$lat, $lng],
                'district'    => 'Iloilo'
            ];
        }
    }

    // Fallback default: Iloilo City center
    return [
        'name'        => $input . ' (Iloilo)',
        'coordinates' => [ILOILO_CENTER_LAT, ILOILO_CENTER_LNG],
        'district'    => 'Iloilo City'
    ];
}

$origin = resolveLocation($originInput);
$destination = resolveLocation($destInput);

$origLat = $origin['coordinates'][0];
$origLng = $origin['coordinates'][1];
$destLat = $destination['coordinates'][0];
$destLng = $destination['coordinates'][1];

// ── Call OSRM Routing Engine for GeoJSON Polyline & Road Distance ──
// OSRM expects coordinates as: lng,lat;lng,lat
$osrmUrl = sprintf(
    'https://router.project-osrm.org/route/v1/driving/%F,%F;%F,%F?overview=full&geometries=geojson',
    $origLng, $origLat, $destLng, $destLat
);

$ch = curl_init($osrmUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_USERAGENT, 'IloiloTransitRouter/1.0');
$routeRaw = curl_exec($ch);
$routeCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$distanceMeters = 0;
$durationSeconds = 0;
$geometryGeoJson = null;

if ($routeCode === 200 && !empty($routeRaw)) {
    $routeData = json_decode($routeRaw, true);
    if (!empty($routeData['routes'][0])) {
        $distanceMeters  = (float) $routeData['routes'][0]['distance'];
        $durationSeconds = (float) $routeData['routes'][0]['duration'];
        $geometryGeoJson = $routeData['routes'][0]['geometry'];
    }
}

// Fallback straight-line calculation if OSRM is unreachable
if ($distanceMeters === 0.0) {
    // Haversine formula
    $earthRadius = 6371000;
    $dLat = deg2rad($destLat - $origLat);
    $dLng = deg2rad($destLng - $origLng);
    $a = sin($dLat/2) * sin($dLat/2) +
         cos(deg2rad($origLat)) * cos(deg2rad($destLat)) *
         sin($dLng/2) * sin($dLng/2);
    $c = 2 * atan2(sqrt($a), sqrt(1-$a));
    $distanceMeters = $earthRadius * $c;
    // Estimate 25 km/h urban traffic in Iloilo
    $durationSeconds = ($distanceMeters / (25 * 1000 / 3600));
    $geometryGeoJson = [
        'type' => 'LineString',
        'coordinates' => [
            [$origLng, $origLat],
            [$destLng, $destLat]
        ]
    ];
}

$distanceKm = round($distanceMeters / 1000, 2);
$travelMinutes = max(3, (int) round($durationSeconds / 60));

// ── Match Matching Iloilo PUV Options (Jeepney, Bus, UV, Tricycle, Taxi) ──
$routesStore = new JsonStore('routes');
$allRoutes = $routesStore->all();

$matchedOptions = [];

foreach ($allRoutes as $route) {
    if ($transportFilter !== 'all' && $route['transport_type'] !== $transportFilter) {
        continue;
    }

    $score = 0;
    $routeText = mb_strtolower($route['route_name'] . ' ' . $route['origin'] . ' ' . $route['destination'] . ' ' . ($route['via'] ?? ''));
    $origWord = mb_strtolower($origin['name']);
    $destWord = mb_strtolower($destination['name']);

    if (str_contains($routeText, $origWord)) $score += 2;
    if (str_contains($routeText, $destWord)) $score += 2;
    if (str_contains($routeText, mb_strtolower($origin['district']))) $score += 1;
    if (str_contains($routeText, mb_strtolower($destination['district']))) $score += 1;

    // Calculate dynamic fare based on LTFRB matrix (Base 4km: ₱13 / ₱15, +₱1.80/km)
    $estimatedFare = $route['fare'];
    if ($route['transport_type'] === 'jeepney' && $distanceKm > 4) {
        $estimatedFare = round(13 + ($distanceKm - 4) * 1.80, 2);
    } elseif ($route['transport_type'] === 'taxi') {
        $estimatedFare = round(45 + ($distanceKm * 13.50), 2); // Flagdown ₱45 + ₱13.50/km
    }

    $waitEstimate = $route['estimated_wait_minutes'];

    $matchedOptions[] = [
        'route_id'             => $route['id'],
        'route_name'           => $route['route_name'],
        'transport_type'       => $route['transport_type'],
        'transport_label'      => $route['transport_label'],
        'transport_icon'       => $route['transport_icon'],
        'via'                  => $route['via'] ?? '',
        'estimated_fare'       => $estimatedFare,
        'travel_time_minutes'  => $travelMinutes,
        'estimated_wait_minutes' => $waitEstimate,
        'total_commute_minutes'=> $travelMinutes + $waitEstimate,
        'status'               => $route['status'],
        'frequency'            => ($route['transport_type'] === 'jeepney' ? 'Every 5-8 mins' : 'Every 20-30 mins'),
        'relevance_score'      => $score
    ];
}

// Sort by relevance score, then by total commute time
usort($matchedOptions, function($a, $b) {
    if ($b['relevance_score'] !== $a['relevance_score']) {
        return $b['relevance_score'] <=> $a['relevance_score'];
    }
    return $a['total_commute_minutes'] <=> $b['total_commute_minutes'];
});

// Take top 6 options
$matchedOptions = array_slice($matchedOptions, 0, 6);

// Build Response
$payload = [
    'origin' => [
        'name'        => $origin['name'],
        'district'    => $origin['district'],
        'coordinates' => $origin['coordinates'] // [lat, lng]
    ],
    'destination' => [
        'name'        => $destination['name'],
        'district'    => $destination['district'],
        'coordinates' => $destination['coordinates'] // [lat, lng]
    ],
    'route_summary' => [
        'distance_km'          => $distanceKm,
        'road_travel_minutes'  => $travelMinutes,
        'geometry'             => $geometryGeoJson, // GeoJSON LineString
        'maptiler_style_url'   => MAPTILER_STYLE_URL
    ],
    'available_transport_options' => $matchedOptions
];

Response::success($payload, 'Iloilo route calculated successfully.');
