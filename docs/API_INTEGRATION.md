# Backend API — Integration Guide

> **For the Front-End Developer**  
> This document explains every API endpoint, their URLs, request/response formats, and which HTML elements they connect to.

## Base URL

When running on XAMPP:
```
http://localhost/hackathon-app/api/
```

---

## 1. Waiting Times

### `GET /api/waiting-times.php`

Returns current waiting times for all active routes.

**Query Parameters:**

| Param    | Type   | Required | Description                                           |
|----------|--------|----------|-------------------------------------------------------|
| `type`   | string | No       | Filter: `jeepney`, `bus`, `uv`, `train`               |
| `status` | string | No       | Filter: `normal`, `moderate`, `delayed`, `very-delayed` |
| `id`     | int    | No       | Get single record by route ID                         |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "route_id": "route-001",
      "transport_type": "jeepney",
      "transport_label": "Jeepney",
      "transport_icon": "🚐",
      "route_name": "City Proper - Jaro",
      "origin": "Iloilo City Proper",
      "destination": "Jaro",
      "fare": "13.00",
      "duration_minutes": 25,
      "estimated_wait_minutes": 18,
      "status": "delayed",
      "passenger_count": 25,
      "is_demo": true,
      "last_updated": "2026-11-18 14:30:00"
    }
  ],
  "message": "Waiting times retrieved.",
  "meta": { "timestamp": "...", "count": 12 }
}
```

**Front-end elements:**
- `#waiting-time-container` → render cards here
- `#waiting-filter-all`, `#waiting-filter-jeepney`, etc. → trigger `?type=` filter
- `.waiting-card` with `data-transport-type`, `data-route-id`, `data-status`, `data-waiting-minutes`

**JS integration example:**
```js
async function fetchWaitingTimes(type = 'all') {
    const url = type === 'all'
        ? '/hackathon-app/api/waiting-times.php'
        : `/hackathon-app/api/waiting-times.php?type=${type}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.success) {
        renderWaitingCards(json.data);
    }
}
```

---

## 2. Routes

### `GET /api/routes.php`

Search and list transportation routes.

| Param         | Type   | Required | Description              |
|---------------|--------|----------|--------------------------|
| `origin`      | string | No       | Filter by origin (LIKE)  |
| `destination` | string | No       | Filter by destination    |
| `type`        | string | No       | Filter by transport type |
| `q`           | string | No       | General search query     |

**Front-end elements:**
- `#route-search-form` → form with `name="origin"`, `name="destination"`, `name="transport_type"`
- `#route-search-results` → results container
- `.route-result-card` → each result

**JS integration example:**
```js
document.getElementById('route-search-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const params = new URLSearchParams({
        origin: form.get('origin'),
        destination: form.get('destination'),
        type: form.get('transport_type'),
    });
    const res = await fetch(`/hackathon-app/api/routes.php?${params}`);
    const json = await res.json();
    if (json.success) {
        renderRouteResults(json.data);
    }
});
```

---

## 3. Reports

### `POST /api/reports.php`

Submit a commuter waiting-time report.

**Request Body (JSON):**
```json
{
  "commuter_name": "Juan",
  "transport_type": "jeepney",
  "route_name": "City Proper - Jaro",
  "location": "Jaro Plaza",
  "waiting_minutes": 25,
  "report_description": "Very long line, only 2 jeepneys in 30 min"
}
```

| Field                | Type   | Required | Validation                 |
|----------------------|--------|----------|----------------------------|
| `commuter_name`      | string | No       | Max 100 chars              |
| `transport_type`     | string | Yes      | jeepney/bus/uv/train/other |
| `route_name`         | string | Yes      | Max 120 chars              |
| `location`           | string | Yes      | Max 200 chars              |
| `waiting_minutes`    | int    | Yes      | Positive integer           |
| `report_description` | string | No       | Max 2000 chars             |

**Success Response (201):**
```json
{
  "success": true,
  "data": { "report_id": 42 },
  "message": "Report submitted successfully. Thank you for helping fellow commuters!"
}
```

**Validation Error (422):**
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "transport_type": "Transport type is required.",
    "waiting_minutes": "Waiting time must be a positive number."
  }
}
```

**Front-end elements:**
- `#report-form` → the form
- `#report-success-message` → show on success
- `#report-error-message` → show on validation error
- Form fields: `name="commuter_name"`, `name="transport_type"`, etc.

### `GET /api/reports.php`

List submitted reports (paginated).

| Param      | Type   | Description                          |
|------------|--------|--------------------------------------|
| `page`     | int    | Page number (default: 1)             |
| `per_page` | int    | Items per page (default: 20, max: 50)|
| `type`     | string | Filter by transport type             |
| `status`   | string | Filter: pending/reviewed/resolved    |

---

## 4. Stats

### `GET /api/stats.php`

Returns live-computed statistics for the hero section.

```json
{
  "success": true,
  "data": [
    { "stat_key": "total_routes",    "stat_value": "12",      "stat_label": "Active Routes" },
    { "stat_key": "avg_wait_time",   "stat_value": "17.8 min","stat_label": "Avg. Wait Time" },
    { "stat_key": "total_reports",   "stat_value": "0",       "stat_label": "Reports Filed" },
    { "stat_key": "delayed_routes",  "stat_value": "7",       "stat_label": "Routes Currently Delayed" }
  ]
}
```

**Front-end elements:** `#hero-stats`, `.stat-card`

---

## 5. Search (Unified)

### `GET /api/search.php?q=...`

Unified search for the hero search bar.

| Param | Type   | Required | Description                |
|-------|--------|----------|----------------------------|
| `q`   | string | Yes      | Search query (min 2 chars) |

**Front-end elements:** `#hero-search-form`, `#hero-search-input`

---

## Standard Response Envelope

Every endpoint returns:
```json
{
  "success": true,
  "data": "...",
  "message": "...",
  "meta": {
    "timestamp": "2026-11-18T14:30:00Z",
    "count": 12
  }
}
```

For paginated endpoints, `meta` also includes:
```json
{
  "total": 100,
  "page": 1,
  "per_page": 20,
  "total_pages": 5
}
```

---

## HTTP Status Codes

| Code | Meaning                      |
|------|------------------------------|
| 200  | Success                      |
| 201  | Created (report submitted)   |
| 400  | Bad request / missing params |
| 404  | Not found                    |
| 405  | Method not allowed           |
| 422  | Validation error             |
| 500  | Server error                 |
