# Iloilo Transit API & MapTiler Integration Guide

> **Project: Long Waiting Times in Iloilo Public Transportation**  
> Covers: Jeepneys (Modern & Traditional), Ceres Buses, P2P Express, UV Express, Tricycle TODAs, and Taxis across Iloilo City and Metro Iloilo.  
> **Interactive Map Powered by MapTiler Key:** `guHcH7diPQJI56dDsa2f`

---

## 1. Quick Start

**Start local PHP API Server:**
```powershell
cd C:\Users\renz\Documents\Visual_Code\Projects\hackathon-app
C:\xampp\php\php.exe -S localhost:8888
```

Base API URL: `http://localhost:8888/api/`  
*(Or `http://localhost/hackathon-app/api/` when running through XAMPP Apache)*

---

## 2. API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/places.php` | List & search specific Iloilo transit stops, terminals, plazas, universities, malls |
| `GET` | `/api/geocoding.php?q=...` | MapTiler geocoding strictly bounded to Iloilo + local Iloilo places registry |
| `GET` | `/api/routing.php` | Road routing (distance, duration, GeoJSON line) + matches best Iloilo PUVs |
| `GET` | `/api/map-config.php` | MapTiler key, tile URLs, Iloilo center coordinates and boundary settings |
| `GET` | `/api/waiting-times.php` | Real-time estimated waiting times for all Iloilo PUV routes |
| `GET` | `/api/routes.php` | Search and filter Iloilo transportation routes |
| `POST`| `/api/reports.php` | Submit commuter wait time reports |
| `GET` | `/api/stats.php` | Summary statistics for the landing page hero section |

---

## 3. Detailed Endpoint Reference

### A. Iloilo Transit Places (`GET /api/places.php`)
Returns curated Iloilo public transportation hubs, terminals, and stops with exact coordinates and wait times.

**Query Parameters:**
* `q`: Search term (e.g. `jaro`, `cpu`, `sm city`, `medical city`, `ungka`)
* `district`: Filter by district (`city proper`, `jaro`, `mandurriao`, `molo`, `la paz`, `arevalo`, `lapuz`, `pavia`, `santa barbara`, `cabatuan`, `oton`, etc.)
* `type`: Filter by PUV mode (`jeepney`, `bus`, `uv`, `tricycle`, `taxi`)
* `category`: Filter by type (`terminal`, `mall`, `plaza`, `university`, `hospital`, `port`, `airport`)

**Sample Request:**
```
GET /api/places.php?district=jaro&type=jeepney
```

**Sample Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "place-001",
      "name": "Jaro Plaza & Cathedral",
      "district": "Jaro",
      "category": "plaza",
      "address": "E. Lopez St. cor. Commission Civil St., Jaro, Iloilo City",
      "coordinates": [10.7289, 122.5583],
      "transport_types": ["jeepney", "bus", "taxi", "tricycle"],
      "passing_routes": ["Route 3 Ungka-City Proper", "Route 10 Buntatala", "Route 14 Hibao-an-Jaro CPU"],
      "waiting_time_estimate": 18,
      "status": "delayed",
      "is_terminal": false
    }
  ],
  "meta": { "count": 8, "region": "Iloilo Province & City" }
}
```

---

### B. Geocoding strictly in Iloilo (`GET /api/geocoding.php?q=...`)
Converts any Iloilo street, building, or landmark into coordinates `[latitude, longitude]`. Uses MapTiler Geocoding API bounded strictly to Iloilo (`bbox=122.35,10.55,123.10,11.35`) merged with the local Iloilo database.

**Sample Request:**
```
GET /api/geocoding.php?q=Molo+Plaza
```

**Sample Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "Molo Plaza & St. Anne Church",
      "district": "Molo",
      "full_address": "San Pedro St. cor. MH Del Pilar St., Molo, Iloilo City",
      "coordinates": [10.6975, 122.5447],
      "category": "plaza",
      "source": "local_iloilo_registry",
      "waiting_time": 14,
      "status": "moderate",
      "puv_types": ["jeepney", "taxi", "tricycle"]
    }
  ]
}
```

---

### C. Transit Routing & Map Path (`GET /api/routing.php`)
Calculates the shortest road distance, driving travel time, GeoJSON polyline for MapTiler rendering, and matches the best Iloilo PUV routes.

**Query Parameters:**
* `origin`: Name or coordinates of departure (e.g. `Jaro Plaza` or `10.7289,122.5583`)
* `destination`: Name or coordinates of arrival (e.g. `SM City Iloilo` or `10.7138,122.5516`)
* `type`: Transport mode filter (`all`, `jeepney`, `bus`, `uv`, `tricycle`, `taxi`)

**Sample Request:**
```
GET /api/routing.php?origin=Jaro+Plaza&destination=SM+City+Iloilo
```

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "origin": {
      "name": "Jaro Plaza & Cathedral",
      "district": "Jaro",
      "coordinates": [10.7289, 122.5583]
    },
    "destination": {
      "name": "SM City Iloilo Transport Terminal & Overpass",
      "district": "Mandurriao",
      "coordinates": [10.7138, 122.5516]
    },
    "route_summary": {
      "distance_km": 2.4,
      "road_travel_minutes": 5,
      "geometry": {
        "type": "LineString",
        "coordinates": [[122.5583, 10.7289], "..."]
      }
    },
    "available_transport_options": [
      {
        "route_id": "route-004",
        "route_name": "Route 4: Ungka Terminal – City Proper via Diversion & SM City",
        "transport_type": "jeepney",
        "transport_label": "Modern Jeepney",
        "transport_icon": "🚐",
        "estimated_fare": 16.00,
        "travel_time_minutes": 5,
        "estimated_wait_minutes": 10,
        "total_commute_minutes": 15,
        "status": "normal",
        "frequency": "Every 5-8 mins"
      }
    ]
  }
}
```

---

## 4. How the Front-End Adds the Interactive MapTiler Map

A drop-in helper file [`iloilo-map.js`](file:///C:/Users/renz/Documents/Visual_Code\Projects\hackathon-app\iloilo-map.js) has been provided.

### Step 1: Add Map Container in `index.html`
Place this `<div>` inside or above `#route-search-section`:
```html
<!-- Interactive Iloilo Transit Map -->
<div id="iloilo-transit-map" style="width: 100%; height: 420px; border-radius: 12px; margin: 20px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.08);"></div>

<!-- Load Map Script -->
<script src="iloilo-map.js"></script>
```

### Step 2: Initialize in `script.js`
In your `DOMContentLoaded` callback:
```js
window.addEventListener('DOMContentLoaded', () => {
  // Initialize Iloilo Map with MapTiler
  if (window.IloiloTransitMap) {
    window.iloiloMap = new IloiloTransitMap('iloilo-transit-map');
    window.iloiloMap.init();
  }
});
```

### Features Enabled Automatically:
1. **Interactive Streets Map:** MapTiler Street style centered on Iloilo City `[10.7202, 122.5621]`.
2. **Color-coded Stop Markers:**
   - 🟢 Green: Normal Wait (< 10 mins)
   - 🟡 Amber: Moderate Wait (10 - 20 mins)
   - 🔴 Red: Long Wait / Delayed (> 20 mins)
3. **Stop Popups:** Shows live wait times, available PUVs, and "From Here" / "To Here" buttons that auto-fill the route search form fields.
4. **Interactive Routing:** Submitting `#route-search-form` queries `/api/routing.php` and automatically draws the path polyline on the map!
