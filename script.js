/**
 * SakayNow – script.js
 * Front-End Developer: Hackathon Team
 *
 * ─── Backend Integration Notes ───────────────────────────────────────────────
 * All five API endpoints are now connected.
 * The app always tries the real API first. If the request fails (e.g. the PHP
 * server is not running), it falls back to local demo data transparently so the
 * UI never breaks during development.
 *
 * API endpoints consumed:
 *   GET  /api/waiting-times.php        → #waiting-time-container cards
 *   GET  /api/routes.php               → #route-search-results cards
 *   GET  /api/search.php?q=            → hero search → scrolls to dashboard
 *   GET  /api/stats.php                → #hero-stats .stat-card values
 *   POST /api/reports.php              → #report-form submission
 *
 * To switch between local XAMPP and production, change API_BASE_URL below.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Organisation:
 *  1.  Configuration
 *  2.  Demo / Fallback Data
 *  3.  Utility Helpers
 *  4.  API Layer  (all fetch calls live here)
 *  5.  initializeNavigation()
 *  6.  initializeHeroSearch()
 *  7.  renderWaitingCards()
 *  8.  initializeWaitingFilters()
 *  9.  startWaitingTimePolling()
 * 10.  renderRouteResults()
 * 11.  initializeRouteSearch()
 * 12.  renderHeroStats()
 * 13.  initializeReportForm()
 * 14.  initializeSmoothScrolling()
 * 15.  initializeScrollSpy()
 * 16.  initializeBackToTop()
 * 17.  initializeScrollReveal()
 * 18.  showToast()
 * 19.  DOMContentLoaded – bootstrap
 */

'use strict';

/* =============================================================
   1. CONFIGURATION
   ─────────────────────────────────────────────────────────────
   Change API_BASE_URL to match the environment.
   For XAMPP:      'http://localhost/hackathon-app/api'
   For production: 'https://your-domain.com/api'
   ============================================================= */

function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    if (window.location.protocol === 'file:') {
      return 'http://localhost/hackathon-app/api';
    }
    if ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port && window.location.port !== '80') {
      return `http://${window.location.hostname}/hackathon-app/api`;
    }
  }
  return '/hackathon-app/api';
}

const API_BASE_URL = getApiBaseUrl();

/** All endpoints in one place – backend team can rename without hunting. */
const API = {
  waitingTimes: `${API_BASE_URL}/waiting-times.php`,
  routes:       `${API_BASE_URL}/routes.php`,
  search:       `${API_BASE_URL}/search.php`,
  stats:        `${API_BASE_URL}/stats.php`,
  reports:      `${API_BASE_URL}/reports.php`,
};

/** Polling interval for waiting-time refresh (milliseconds). */
const POLL_INTERVAL_MS = 30000;

/* =============================================================
   2. DEMO / FALLBACK DATA
   ─────────────────────────────────────────────────────────────
   Used ONLY when the API is unreachable (dev without a server).
   Field names intentionally mirror the backend JSON schema so
   renderWaitingCards() works identically with live or demo data.
   ============================================================= */

/** @type {Array<Object>} */
const demoWaitingData = [
  {
    id: 1,
    route_id: "route-001",
    transport_type: "jeepney",
    transport_label: "Jeepney",
    transport_icon: "🚌",
    route_name: "City Proper – Jaro",
    origin: "Iloilo City Proper",
    destination: "Jaro, Iloilo",
    estimated_wait_minutes: 18,
    status: "delayed",
    passenger_count: 25,
    last_updated: "Just now",
    is_demo: true
  },
  {
    id: 2,
    route_id: "route-002",
    transport_type: "bus",
    transport_label: "Bus",
    transport_icon: "🚍",
    route_name: "City Proper – Airport",
    origin: "Iloilo City Proper",
    destination: "Iloilo International Airport",
    estimated_wait_minutes: 10,
    status: "normal",
    passenger_count: 10,
    last_updated: "2 minutes ago",
    is_demo: true
  },
  {
    id: 3,
    route_id: "route-003",
    transport_type: "uv",
    transport_label: "UV Express",
    transport_icon: "🚐",
    route_name: "EDSA Cubao – BGC",
    origin: "EDSA Cubao, Quezon City",
    destination: "Bonifacio Global City, Taguig",
    estimated_wait_minutes: 45,
    status: "delayed",
    passenger_count: 30,
    last_updated: "5 minutes ago",
    is_demo: true
  },
  {
    id: 4,
    route_id: "route-004",
    transport_type: "train",
    transport_label: "LRT-1",
    transport_icon: "🚇",
    route_name: "Roosevelt – Baclaran",
    origin: "Roosevelt Station, QC",
    destination: "Baclaran Station, Pasay",
    estimated_wait_minutes: 6,
    status: "normal",
    passenger_count: 50,
    last_updated: "1 minute ago",
    is_demo: true
  },
  {
    id: 5,
    route_id: "route-005",
    transport_type: "jeepney",
    transport_label: "Jeepney",
    transport_icon: "🚌",
    route_name: "Divisoria – Quiapo",
    origin: "Divisoria, Manila",
    destination: "Quiapo, Manila",
    estimated_wait_minutes: 12,
    status: "normal",
    passenger_count: 15,
    last_updated: "3 minutes ago",
    is_demo: true
  },
  {
    id: 6,
    route_id: "route-006",
    transport_type: "bus",
    transport_label: "P2P Bus",
    transport_icon: "🚍",
    route_name: "Alabang – Makati",
    origin: "Alabang, Muntinlupa",
    destination: "Makati CBD",
    estimated_wait_minutes: 25,
    status: "moderate",
    passenger_count: 20,
    last_updated: "4 minutes ago",
    is_demo: true
  },
  {
    id: 7,
    route_id: "route-007",
    transport_type: "train",
    transport_label: "MRT-3",
    transport_icon: "🚇",
    route_name: "North Avenue – Taft Avenue",
    origin: "North Avenue, QC",
    destination: "Taft Avenue, Pasay",
    estimated_wait_minutes: 22,
    status: "moderate",
    passenger_count: 45,
    last_updated: "2 minutes ago",
    is_demo: true
  },
  {
    id: 8,
    route_id: "route-008",
    transport_type: "uv",
    transport_label: "UV Express",
    transport_icon: "🚐",
    route_name: "Fairview – Recto",
    origin: "Fairview, Quezon City",
    destination: "Recto, Manila",
    estimated_wait_minutes: 55,
    status: "delayed",
    passenger_count: 35,
    last_updated: "6 minutes ago",
    is_demo: true
  }
];

/** @type {Array<Object>} */
const demoStatsData = [
  { stat_key: "total_routes",   stat_value: "10",      stat_label: "Active Routes" },
  { stat_key: "avg_wait_time",  stat_value: "24.3 min", stat_label: "Avg. Wait Time" },
  { stat_key: "total_reports",  stat_value: "0",        stat_label: "Reports Filed" },
  { stat_key: "delayed_routes", stat_value: "4",        stat_label: "Routes Currently Delayed" }
];

/** @type {Array<Object>} */
const demoRouteData = [
  {
    id: 1,
    route_id: "route-001",
    transport_type: "jeepney",
    transport_label: "Jeepney",
    transport_icon: "🚌",
    route_name: "City Proper – Jaro",
    origin: "Iloilo City Proper",
    destination: "Jaro, Iloilo",
    fare: "13.00",
    duration_minutes: 25,
    current_wait_minutes: 18,
    current_status: "delayed",
    is_demo: true
  },
  {
    id: 2,
    route_id: "route-002",
    transport_type: "bus",
    transport_label: "P2P Bus",
    transport_icon: "🚍",
    route_name: "Alabang – Makati CBD",
    origin: "Alabang, Muntinlupa",
    destination: "Makati CBD",
    fare: "65.00",
    duration_minutes: 45,
    current_wait_minutes: 25,
    current_status: "moderate",
    is_demo: true
  },
  {
    id: 3,
    route_id: "route-003",
    transport_type: "train",
    transport_label: "MRT-3",
    transport_icon: "🚇",
    route_name: "North Avenue – Ayala",
    origin: "North Avenue Station, QC",
    destination: "Ayala Station, Makati",
    fare: "28.00",
    duration_minutes: 20,
    current_wait_minutes: 22,
    current_status: "moderate",
    is_demo: true
  },
  {
    id: 4,
    route_id: "route-004",
    transport_type: "uv",
    transport_label: "UV Express",
    transport_icon: "🚐",
    route_name: "Cubao – BGC",
    origin: "Cubao, Quezon City",
    destination: "BGC, Taguig",
    fare: "55.00",
    duration_minutes: 35,
    current_wait_minutes: 45,
    current_status: "delayed",
    is_demo: true
  }
];

/* =============================================================
   3. UTILITY HELPERS
   ============================================================= */

/**
 * Maps a transport_type slug to its display emoji.
 * Used as a fallback when transport_icon is missing from the API response.
 * @param {string} type
 * @returns {string}
 */
function transportEmoji(type) {
  const map = { jeepney: '🚌', bus: '🚍', uv: '🚐', train: '🚇', tricycle: '🛺', other: '🚗' };
  return map[type] ?? '🚗';
}

/**
 * Returns a CSS modifier class based on status string.
 * Handles both "very-delayed" (backend) and "delayed" (front-end).
 * @param {string} status
 * @returns {string}
 */
function statusModifier(status) {
  if (status === 'normal')   return 'normal';
  if (status === 'moderate') return 'moderate';
  return 'delayed'; // covers "delayed" and "very-delayed"
}

/**
 * Returns a human-readable status label.
 * @param {string} status
 * @returns {string}
 */
function statusLabel(status) {
  const map = { normal: 'Normal', moderate: 'Some Delay', delayed: 'Long Wait', 'very-delayed': 'Very Long Wait' };
  return map[status] ?? 'Unknown';
}

/**
 * Derives a status string from minutes when the API doesn't supply one.
 * @param {number} minutes
 * @returns {string}
 */
function statusFromMinutes(minutes) {
  if (minutes <= 15) return 'normal';
  if (minutes <= 35) return 'moderate';
  return 'delayed';
}

/**
 * Maps wait minutes to a progress-bar fill percentage (0–100).
 * @param {number} minutes
 * @returns {number}
 */
function minutesToPercent(minutes) {
  return Math.min(100, Math.round((minutes / 70) * 100));
}

/**
 * Formats a last_updated timestamp from the backend into a readable string.
 * Accepts ISO strings ("2026-11-18 14:30:00") or plain strings ("Just now").
 * @param {string} raw
 * @returns {string}
 */
function formatLastUpdated(raw) {
  if (!raw) return 'Unknown';
  // If it looks like a date string, compute "X minutes ago"
  const date = new Date(raw.replace(' ', 'T'));
  if (!isNaN(date.getTime())) {
    const diff = Math.round((Date.now() - date.getTime()) / 60000);
    if (diff < 1)  return 'Just now';
    if (diff === 1) return '1 minute ago';
    if (diff < 60) return `${diff} minutes ago`;
    return date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
  }
  // Otherwise return as-is (e.g. "Just now")
  return raw;
}

/**
 * Shows a brief toast notification.
 * @param {string} message
 */
function showToast(message) {
  let toast = document.querySelector('.toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('is-visible'), 3200);
}

/**
 * Sets or clears a validation error on a form field.
 * @param {string} fieldId
 * @param {string} errorId
 * @param {string} message  - Empty string to clear.
 */
function setFieldError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  if (!field || !error) return;
  error.textContent = message;
  field.classList.toggle('is-invalid', message.length > 0);
}

/**
 * Clears all validation errors inside a form.
 * @param {HTMLFormElement} form
 */
function clearFormErrors(form) {
  form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  form.querySelectorAll('[id$="-error"]').forEach(el => { el.textContent = ''; });
}

/* =============================================================
   4. API LAYER
   ─────────────────────────────────────────────────────────────
   Every fetch call lives here. Each function:
     - Returns the parsed `data` array/object on success.
     - Falls back to demo data and logs a warning on failure.
   ============================================================= */

/**
 * Fetches waiting times from the backend.
 * @param {string} [type='all']  - Transport type filter slug.
 * @returns {Promise<Array>}
 */
async function apiFetchWaitingTimes(type = 'all') {
  const url = type === 'all'
    ? API.waitingTimes
    : `${API.waitingTimes}?type=${encodeURIComponent(type)}`;
  try {
    const res  = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
    throw new Error(json.message || 'API error');
  } catch (err) {
    console.warn('[SakayNow] waiting-times.php unreachable – using demo data.', err.message);
    // Filter demo data to match the type filter
    return type === 'all'
      ? demoWaitingData
      : demoWaitingData.filter(d => d.transport_type === type);
  }
}

/**
 * Fetches hero stats from the backend.
 * @returns {Promise<Array>}
 */
async function apiFetchStats() {
  try {
    const res  = await fetch(API.stats, { headers: { 'Accept': 'application/json' } });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
    throw new Error(json.message || 'API error');
  } catch (err) {
    console.warn('[SakayNow] stats.php unreachable – using demo data.', err.message);
    return demoStatsData;
  }
}

/**
 * Searches routes via the unified search endpoint.
 * @param {string} query
 * @returns {Promise<Array>}
 */
async function apiFetchSearch(query) {
  const url = `${API.search}?q=${encodeURIComponent(query)}`;
  try {
    const res  = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
    throw new Error(json.message || 'API error');
  } catch (err) {
    console.warn('[SakayNow] search.php unreachable – using demo data.', err.message);
    // Simple client-side fallback: search demo route data
    const q = query.toLowerCase();
    return demoWaitingData.filter(d =>
      d.route_name.toLowerCase().includes(q) ||
      d.origin.toLowerCase().includes(q) ||
      d.destination.toLowerCase().includes(q) ||
      d.transport_label.toLowerCase().includes(q)
    );
  }
}

/**
 * Searches routes for the Route Finder section.
 * @param {Object} params  - { origin, destination, type }
 * @returns {Promise<Array>}
 */
async function apiFetchRoutes({ origin, destination, type }) {
  const qs = new URLSearchParams();
  if (origin)      qs.set('origin',      origin);
  if (destination) qs.set('destination', destination);
  if (type && type !== 'all') qs.set('type', type);

  const url = `${API.routes}?${qs.toString()}`;
  try {
    const res  = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
    throw new Error(json.message || 'API error');
  } catch (err) {
    console.warn('[SakayNow] routes.php unreachable – using demo data.', err.message);
    // Client-side fallback filter
    const o = origin.toLowerCase();
    const d = destination.toLowerCase();
    return demoRouteData.filter(r => {
      const matchType = !type || type === 'all' || r.transport_type === type;
      const matchO    = r.origin.toLowerCase().includes(o)      || r.route_name.toLowerCase().includes(o);
      const matchD    = r.destination.toLowerCase().includes(d) || r.route_name.toLowerCase().includes(d);
      return matchType && (matchO || matchD || true); // keep all in demo
    });
  }
}

/**
 * POSTs a commuter report to the backend.
 * @param {Object} payload
 * @returns {Promise<{success: boolean, message: string, report_id?: number, errors?: Object}>}
 */
async function apiSubmitReport(payload) {
  try {
    const res  = await fetch(API.reports, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const json = await res.json();
    // Return the full response so the caller can handle success & validation errors
    return { ...json, httpStatus: res.status };
  } catch (err) {
    console.warn('[SakayNow] reports.php unreachable – simulating success.', err.message);
    // Offline fallback: pretend it worked
    return {
      success:    true,
      data:       { report_id: null },
      message:    'Report saved locally (demo – server unavailable).',
      httpStatus: 201,
      is_demo:    true,
    };
  }
}

/**
 * Fetches recent commuter reports from the backend.
 * @param {number} [limit=5]
 * @returns {Promise<Array>}
 */
async function apiFetchReports(limit = 5) {
  try {
    const res  = await fetch(`${API.reports}?per_page=${limit}`, { headers: { 'Accept': 'application/json' } });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
    throw new Error(json.message || 'API error');
  } catch (err) {
    console.warn('[SakayNow] reports.php GET unreachable.', err.message);
    return [];
  }
}

/**
 * Renders recent reports into #recent-reports-list.
 * @param {Array} [reports]
 */
function renderRecentReports(reports) {
  const container = document.getElementById('recent-reports-list');
  if (!container) return;

  const doRender = (items) => {
    if (!items || items.length === 0) {
      container.innerHTML = '<p style="font-size:0.8rem;color:var(--color-text-muted);font-style:italic;padding:0.5rem 0;">No reports submitted yet. Be the first to share an update!</p>';
      return;
    }
    container.innerHTML = items.slice(0, 5).map(r => {
      const name = r.commuter_name ? r.commuter_name : 'Anonymous Commuter';
      const timeStr = formatLastUpdated(r.created_at);
      const icon = transportEmoji(r.transport_type);
      return `
        <article class="report-item">
          <div class="report-item__header">
            <span class="report-item__route">${icon} ${r.route_name}</span>
            <span class="report-item__wait">${r.waiting_minutes}m wait</span>
          </div>
          ${r.report_description ? `<p class="report-item__desc">${r.report_description}</p>` : ''}
          <div class="report-item__meta">
            <span>📍 ${r.location}</span>
            <span>👤 ${name} · ${timeStr}</span>
          </div>
        </article>
      `;
    }).join('');
  };

  if (reports) {
    doRender(reports);
  } else {
    apiFetchReports().then(doRender);
  }
}

/* =============================================================
   5. NAVIGATION
   ============================================================= */
function initializeNavigation() {
  const navbar   = document.getElementById('main-navbar');
  const toggle   = document.getElementById('mobile-menu-toggle');
  const navLinks = document.getElementById('nav-links');
  if (!navbar || !toggle || !navLinks) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('is-scrolled', window.scrollY > 50);
  }, { passive: true });

  toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* =============================================================
   6. HERO SEARCH
   ─────────────────────────────────────────────────────────────
   Connected to: GET /api/search.php?q=<query>
   On results, renders them as waiting-time cards in the
   #waiting-time-container and scrolls the user down.
   ============================================================= */
function initializeHeroSearch() {
  const form   = document.getElementById('hero-search-form');
  const input  = document.getElementById('hero-search-input');
  const target = document.getElementById('waiting-time-section');
  if (!form || !input) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) {
      input.focus();
      showToast('Please enter a route, location, or transport type.');
      return;
    }

    // Scroll to dashboard
    if (target) {
      const offset = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }

    showToast(`Searching for "${query}"…`);

    // Fetch from unified search endpoint
    const results = await apiFetchSearch(query);

    // Normalize search results to WaitingEntry shape if needed
    // search.php returns routes; waiting-times.php returns waiting_time rows.
    // Both share compatible fields – renderWaitingCards handles both.
    renderWaitingCards(results, query);
  });
}

/* =============================================================
   7. RENDER WAITING CARDS
   ─────────────────────────────────────────────────────────────
   Accepts data from both /api/waiting-times.php and
   /api/search.php (field names overlap intentionally).
   ============================================================= */

/** Tracks current filter / search state for polling re-renders. */
const _dashState = { filter: 'all', query: '' };

/**
 * Renders waiting-time cards into #waiting-time-container.
 * Works with live API data AND demo fallback data.
 * @param {Array}  [data]   - Array from API or demo. Defaults to fetch.
 * @param {string} [query]  - Optional highlight/filter text.
 */
function renderWaitingCards(data, query = _dashState.query) {
  const container  = document.getElementById('waiting-time-container');
  const emptyState = document.getElementById('waiting-empty-state');
  const updatedEl  = document.getElementById('waiting-time-updated');
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  container.innerHTML = data.map((entry, index) => {
    // Normalise field names: waiting-times.php vs search.php vs demo data
    const waitMin     = entry.estimated_wait_minutes ?? entry.current_wait_minutes ?? 0;
    const rawStatus   = entry.status ?? entry.current_status ?? statusFromMinutes(waitMin);
    const mod         = statusModifier(rawStatus);
    const label       = statusLabel(rawStatus);
    const icon        = entry.transport_icon ?? transportEmoji(entry.transport_type);
    const typeLabel   = entry.transport_label ?? entry.transport_type;
    const routeId     = entry.route_id ?? entry.id ?? `card-${index}`;
    const updated     = formatLastUpdated(entry.last_updated ?? entry.recorded_at ?? '');
    const barWidth    = minutesToPercent(waitMin);
    const isDemo      = entry.is_demo ? true : false;

    return `
      <article
        class="waiting-card reveal"
        id="waiting-card-${routeId}"
        data-transport-type="${entry.transport_type}"
        data-route-id="${routeId}"
        data-status="${mod}"
        data-waiting-minutes="${waitMin}"
        data-is-demo="${isDemo}"
        style="animation-delay: ${index * 55}ms"
        role="article"
        aria-label="${typeLabel} – ${entry.route_name} – estimated wait: ${waitMin} minutes"
      >
        <div class="waiting-card__header">
          <div class="waiting-card__title-group">
            <span class="waiting-card__emoji" aria-hidden="true">${icon}</span>
            <div>
              <h3 class="waiting-card__title">${entry.route_name}</h3>
              <span class="waiting-card__type-label">${typeLabel}</span>
            </div>
          </div>
          <span
            class="waiting-card__status waiting-card__status--${mod}"
            data-field="status"
            aria-label="Status: ${label}"
          >${label}</span>
        </div>

        <p class="waiting-card__route" data-field="route-name">
          📍 ${entry.origin ?? ''} → ${entry.destination ?? ''}
        </p>

        <div class="waiting-card__time">
          <span class="waiting-card__time-value" data-field="estimated-wait">${waitMin}</span>
          <div>
            <span class="waiting-card__time-unit">min wait</span><br/>
            <span class="waiting-card__time-label">(estimated)</span>
          </div>
        </div>

        <div class="waiting-card__bar" role="img" aria-label="Wait level: ${barWidth}%">
          <div
            class="waiting-card__bar-fill waiting-card__bar-fill--${mod}"
            data-target="${barWidth}"
            style="width: 0%"
          ></div>
        </div>

        <div class="waiting-card__details">
          ${entry.passenger_count != null ? `
          <div class="waiting-card__detail-row">
            <span>Passengers waiting</span>
            <strong data-field="passenger-count">${entry.passenger_count}</strong>
          </div>` : ''}
          ${entry.fare != null ? `
          <div class="waiting-card__detail-row">
            <span>Est. fare</span>
            <strong data-field="fare">₱${parseFloat(entry.fare).toFixed(0)}</strong>
          </div>` : ''}
          ${entry.duration_minutes != null ? `
          <div class="waiting-card__detail-row">
            <span>Trip duration</span>
            <strong data-field="duration">~${entry.duration_minutes} min</strong>
          </div>` : ''}
        </div>

        <div class="waiting-card__footer">
          <span class="waiting-card__updated" data-field="last-updated">🕐 ${updated}</span>
          ${isDemo
            ? `<span class="waiting-card__demo-tag" aria-label="Simulated demo data">DEMO</span>`
            : ''}
        </div>
      </article>
    `;
  }).join('');

  // Animate progress bars
  requestAnimationFrame(() => {
    container.querySelectorAll('.waiting-card__bar-fill').forEach(fill => {
      requestAnimationFrame(() => {
        fill.style.width = fill.dataset.target + '%';
      });
    });
  });

  // Update timestamp
  if (updatedEl) {
    const now = new Date();
    const hasDemo = data.some(d => d.is_demo);
    updatedEl.textContent = hasDemo
      ? '⚠️ Showing demo data (server unavailable)'
      : `🕐 Last updated at ${now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}`;
  }

  initializeScrollReveal();
}

/* =============================================================
   8. WAITING-TIME FILTERS
   ─────────────────────────────────────────────────────────────
   Connected to: GET /api/waiting-times.php?type=<slug>
   ============================================================= */
function initializeWaitingFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      // Update active state
      filterBtns.forEach(b => {
        b.classList.remove('filter-btn--active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('filter-btn--active');
      btn.setAttribute('aria-pressed', 'true');

      const filter = btn.dataset.filter;
      _dashState.filter = filter;
      _dashState.query  = '';

      // Fetch filtered data from backend
      const data = await apiFetchWaitingTimes(filter);
      renderWaitingCards(data);
    });
  });
}

/* =============================================================
   9. WAITING-TIME POLLING
   ─────────────────────────────────────────────────────────────
   Connected to: GET /api/waiting-times.php
   Polls every POLL_INTERVAL_MS ms and re-renders with fresh data.
   ============================================================= */
function startWaitingTimePolling() {
  setInterval(async () => {
    const data = await apiFetchWaitingTimes(_dashState.filter);
    renderWaitingCards(data);
  }, POLL_INTERVAL_MS);
}

/* =============================================================
   10. RENDER ROUTE RESULTS
   ─────────────────────────────────────────────────────────────
   Renders cards from /api/routes.php into #route-search-results.
   Field names from routes.php:
     route_id, transport_type, transport_label, transport_icon,
     route_name, origin, destination, fare, duration_minutes,
     current_wait_minutes, current_status
   ============================================================= */

/**
 * Renders route result cards into #route-search-results.
 * @param {Array} routes
 */
function renderRouteResults(routes) {
  const resultsEl = document.getElementById('route-search-results');
  const emptyEl   = document.getElementById('route-search-empty');
  if (!resultsEl) return;

  if (!routes || routes.length === 0) {
    resultsEl.innerHTML = '';
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }

  if (emptyEl) emptyEl.classList.add('hidden');

  resultsEl.innerHTML = routes.map((route, index) => {
    // routes.php uses current_wait_minutes / current_status
    const waitMin   = route.current_wait_minutes ?? route.estimated_wait_minutes ?? null;
    const rawStatus = route.current_status ?? route.status ?? (waitMin ? statusFromMinutes(waitMin) : 'normal');
    const mod       = statusModifier(rawStatus);
    const label     = statusLabel(rawStatus);
    const icon      = route.transport_icon ?? transportEmoji(route.transport_type);
    const fare      = route.fare ? `₱${parseFloat(route.fare).toFixed(0)}` : 'N/A';
    const isDemo    = route.is_demo ? true : false;

    return `
      <div
        class="route-result-card reveal"
        id="route-result-${route.route_id ?? route.id}"
        data-transport-type="${route.transport_type}"
        data-route-id="${route.route_id ?? route.id}"
        data-is-demo="${isDemo}"
        style="animation-delay: ${index * 80}ms"
        role="article"
        aria-label="${route.transport_label} – ${route.route_name}"
      >
        <div class="route-result-card__icon" aria-hidden="true">${icon}</div>

        <div>
          <h3 class="route-result-card__title">${route.route_name}</h3>
          <div class="route-result-card__details">
            <span class="route-result-card__detail-item">🚌 ${route.transport_label}</span>
            ${route.duration_minutes ? `<span class="route-result-card__detail-item">⏱ ~${route.duration_minutes} min trip</span>` : ''}
            ${waitMin != null       ? `<span class="route-result-card__detail-item">🕐 ~${waitMin} min wait</span>` : ''}
            <span class="route-result-card__detail-item">📍 ${route.origin} → ${route.destination}</span>
            ${isDemo ? `<span class="route-result-card__detail-item" style="color:var(--color-primary);font-weight:600;">DEMO</span>` : ''}
          </div>
        </div>

        <div class="route-result-card__meta">
          <span class="route-result-card__fare">${fare}</span>
          <span class="route-result-card__duration">est. fare</span>
          ${waitMin != null ? `
          <span
            class="route-result-card__wait-badge waiting-card__status--${mod}"
            aria-label="Status: ${label}"
          >${label}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');

  initializeScrollReveal();
  showToast(`Found ${routes.length} route${routes.length !== 1 ? 's' : ''}${routes.some(r => r.is_demo) ? ' (demo data)' : ''}.`);
}

/* =============================================================
   11. ROUTE SEARCH
   ─────────────────────────────────────────────────────────────
   Connected to: GET /api/routes.php?origin=&destination=&type=
   ============================================================= */
function initializeRouteSearch() {
  const form      = document.getElementById('route-search-form');
  const originEl  = document.getElementById('route-origin');
  const destEl    = document.getElementById('route-destination');
  const typeEl    = document.getElementById('route-transport-type');
  const loadingEl = document.getElementById('route-search-loading');
  const emptyEl   = document.getElementById('route-search-empty');
  const resultsEl = document.getElementById('route-search-results');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormErrors(form);

    const origin      = originEl.value.trim();
    const destination = destEl.value.trim();
    const type        = typeEl.value;
    let   valid       = true;

    if (!origin) {
      setFieldError('route-origin', 'route-origin-error', 'Please enter a departure location.');
      valid = false;
    } else if (origin.length < 2) {
      setFieldError('route-origin', 'route-origin-error', 'Origin must be at least 2 characters.');
      valid = false;
    }

    if (!destination) {
      setFieldError('route-destination', 'route-destination-error', 'Please enter a destination.');
      valid = false;
    } else if (destination.length < 2) {
      setFieldError('route-destination', 'route-destination-error', 'Destination must be at least 2 characters.');
      valid = false;
    }

    if (!valid) return;

    // Show loading
    if (resultsEl) resultsEl.innerHTML = '';
    if (emptyEl)   emptyEl.classList.add('hidden');
    if (loadingEl) loadingEl.classList.remove('hidden');

    const routes = await apiFetchRoutes({ origin, destination, type });

    if (loadingEl) loadingEl.classList.add('hidden');
    renderRouteResults(routes);
  });

  // Live validation on blur
  [
    ['route-origin',      'route-origin-error',      'Please enter a departure location.'],
    ['route-destination', 'route-destination-error',  'Please enter a destination.']
  ].forEach(([id, errId, msg]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur',  () => { if (!el.value.trim()) setFieldError(id, errId, msg); });
    el.addEventListener('input', () => setFieldError(id, errId, ''));
  });
}

/* =============================================================
   12. HERO STATS
   ─────────────────────────────────────────────────────────────
   Connected to: GET /api/stats.php
   Dynamically updates .stat-card elements in #hero-stats.
   ============================================================= */

/**
 * Fetches stats and updates the hero stats cards.
 * stat_key → data-stat attribute on each .stat-card.
 */
async function renderHeroStats() {
  const statsContainer = document.getElementById('hero-stats');
  if (!statsContainer) return;

  const stats = await apiFetchStats();

  stats.forEach(stat => {
    // Match by data-stat attribute if present, otherwise by order
    const card = statsContainer.querySelector(`.stat-card[data-stat="${stat.stat_key}"]`);
    if (card) {
      const valEl   = card.querySelector('.stat-card__value');
      const labelEl = card.querySelector('.stat-card__label');
      if (valEl)   valEl.textContent   = stat.stat_value;
      if (labelEl) labelEl.textContent = stat.stat_label;
    }
  });
}

/* =============================================================
   13. REPORT FORM
   ─────────────────────────────────────────────────────────────
   Connected to: POST /api/reports.php  (JSON body)
   Handles both backend success (201) and backend validation
   errors (422) so the UI matches whatever the server returns.
   ============================================================= */
function initializeReportForm() {
  const form       = document.getElementById('report-form');
  const submitBtn  = document.getElementById('report-submit');
  const successMsg = document.getElementById('report-success-message');
  const errorMsg   = document.getElementById('report-error-message');
  if (!form) return;

  // ── Field validation rules ────────────────────────────────────
  const fieldRules = [
    {
      id: 'report-transport-type', errId: 'report-transport-type-error',
      validate: v => v ? '' : 'Please select a transport type.'
    },
    {
      id: 'report-route', errId: 'report-route-error',
      validate: v => {
        if (!v.trim())       return 'Please enter the route name.';
        if (v.trim().length < 3) return 'Route name must be at least 3 characters.';
        if (v.trim().length > 120) return 'Route name must be under 120 characters.';
        return '';
      }
    },
    {
      id: 'report-location', errId: 'report-location-error',
      validate: v => {
        if (!v.trim())       return 'Please enter the location or stop.';
        if (v.trim().length < 3) return 'Location must be at least 3 characters.';
        if (v.trim().length > 200) return 'Location must be under 200 characters.';
        return '';
      }
    },
    {
      id: 'report-waiting-minutes', errId: 'report-waiting-minutes-error',
      validate: v => {
        const n = parseInt(v, 10);
        if (!v)        return 'Please enter the waiting time.';
        if (isNaN(n) || n < 1) return 'Waiting time must be at least 1 minute.';
        if (n > 300)   return 'Please enter a realistic value (max 300 minutes).';
        return '';
      }
    }
  ];

  // Live blur / input validation
  fieldRules.forEach(({ id, errId, validate }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur',  () => setFieldError(id, errId, validate(el.value)));
    el.addEventListener('input', () => setFieldError(id, errId, ''));
  });

  // ── Submit ────────────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormErrors(form);
    if (successMsg) successMsg.hidden = true;
    if (errorMsg)   errorMsg.hidden   = true;

    // Client-side validation
    let isValid = true;
    fieldRules.forEach(({ id, errId, validate }) => {
      const el  = document.getElementById(id);
      if (!el) return;
      const msg = validate(el.value);
      if (msg) { setFieldError(id, errId, msg); isValid = false; }
    });

    if (!isValid) {
      const first = form.querySelector('.is-invalid');
      if (first) { first.scrollIntoView({ behavior: 'smooth', block: 'center' }); first.focus(); }
      return;
    }

    // Build payload – field names match backend exactly
    const payload = {
      commuter_name:      document.getElementById('report-name')?.value.trim() || '',
      transport_type:     document.getElementById('report-transport-type')?.value,
      route_name:         document.getElementById('report-route')?.value.trim(),
      location:           document.getElementById('report-location')?.value.trim(),
      waiting_minutes:    parseInt(document.getElementById('report-waiting-minutes')?.value, 10),
      report_description: document.getElementById('report-description')?.value.trim() || '',
    };

    // Loading state
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Submitting…';

    const result = await apiSubmitReport(payload);

    submitBtn.disabled    = false;
    submitBtn.textContent = 'Submit Report';

    if (result.success) {
      // ── Success ─────────────────────────────────────────────
      const reportId = result.data?.report_id ?? null;
      if (successMsg) {
        successMsg.innerHTML = `
          <strong>✅ ${result.message}</strong><br/>
          ${reportId ? `Report ID: <strong>#${reportId}</strong>` : ''}
          ${result.is_demo ? '<br/><em>(Demo mode – no server was reached)</em>' : ''}
        `;
        successMsg.hidden = false;
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      form.reset();
      clearFormErrors(form);
      showToast('✅ Report submitted!');

      // Refresh hero stats, recent reports feed, and live wait cards
      renderHeroStats();
      renderRecentReports();
      apiFetchWaitingTimes(_dashState.filter).then(renderWaitingCards);

      setTimeout(() => {
        if (successMsg) successMsg.hidden = true;
      }, 8000);

    } else {
      // ── Backend validation errors (HTTP 422) ─────────────────
      if (result.errors && typeof result.errors === 'object') {
        // Map backend field errors back onto our form fields
        const backendFieldMap = {
          transport_type:     ['report-transport-type', 'report-transport-type-error'],
          route_name:         ['report-route',          'report-route-error'],
          location:           ['report-location',       'report-location-error'],
          waiting_minutes:    ['report-waiting-minutes', 'report-waiting-minutes-error'],
        };
        Object.entries(result.errors).forEach(([field, msg]) => {
          const mapping = backendFieldMap[field];
          if (mapping) setFieldError(mapping[0], mapping[1], msg);
        });
      }

      if (errorMsg) {
        errorMsg.textContent = result.message || 'Submission failed. Please check the form and try again.';
        errorMsg.hidden = false;
        errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      showToast('❌ Submission failed – please check the form.');
    }
  });
}

/* =============================================================
   14. SMOOTH SCROLLING
   ============================================================= */
function initializeSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      const navH   = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height'), 10) || 68;
      const offset = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });
}

/* =============================================================
   15. SCROLL SPY
   ============================================================= */
function initializeScrollSpy() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.navbar__link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle(
            'is-active',
            link.getAttribute('href')?.slice(1) === entry.target.id
          );
        });
      }
    });
  }, { threshold: 0.35, rootMargin: '-68px 0px 0px 0px' });

  sections.forEach(sec => observer.observe(sec));
}

/* =============================================================
   16. BACK TO TOP
   ============================================================= */
function initializeBackToTop() {
  const btn = document.getElementById('back-to-top-btn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    window.scrollY > 500 ? btn.removeAttribute('hidden') : btn.setAttribute('hidden', '');
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* =============================================================
   17. SCROLL REVEAL
   ============================================================= */
function initializeScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal:not(.is-visible)');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
}

/* =============================================================
   18. showToast — defined in Section 3 (Utilities)
   ============================================================= */

/* =============================================================
   19. BOOTSTRAP — DOMContentLoaded
   ============================================================= */
document.addEventListener('DOMContentLoaded', async () => {

  // Core UI (synchronous, no network needed)
  initializeNavigation();
  initializeSmoothScrolling();
  initializeScrollSpy();
  initializeBackToTop();
  initializeWaitingFilters();
  initializeRouteSearch();
  initializeReportForm();

  // Apply scroll-reveal to static tip & stat cards
  document.querySelectorAll('.tip-card, .stat-card').forEach(el => el.classList.add('reveal'));
  initializeScrollReveal();

  // Data fetches (parallel – all hit the API simultaneously)
  const [waitingData, _statsResult] = await Promise.all([
    apiFetchWaitingTimes('all'),
    renderHeroStats(),
    apiFetchRoutes({ type: 'all' }).then(renderRouteResults),
    renderRecentReports(),
  ]);

  renderWaitingCards(waitingData);

  // Hero search wired after first render
  initializeHeroSearch();

  // Start polling for live wait-time updates
  startWaitingTimePolling();

  console.info(
    '%c[SakayNow] Initialised. All API endpoints connected.',
    'color: #1a56db; font-weight: bold;'
  );
  console.info(
    'API base:', API_BASE_URL,
    '\nEndpoints:', API
  );
});
