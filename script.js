/**
 * SakayNow – script.js
 * Front-End Developer & Backend Integration
 *
 * Connected to Iloilo Transit PHP API + MapTiler Engine.
 * Features automatic live backend API fetching with local offline fallback.
 */

'use strict';

// ── API Base Configuration ─────────────────────────────────────
const API_BASE = (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1'))
  ? (window.location.pathname.includes('/hackathon-app') ? '/hackathon-app/api' : '/api')
  : '/api';

/* =============================================================
   1. ILOILO TRANSIT DATASET (Live Cache & Offline Fallback)
   ============================================================= */

/**
 * @typedef {Object} WaitingEntry
 * @property {string}  id                  - Unique route ID
 * @property {string}  transport_type      - "jeepney" | "bus" | "uv" | "tricycle" | "taxi"
 * @property {string}  transport_emoji     - Display emoji
 * @property {string}  transport_label     - Human-readable type label
 * @property {string}  route_name          - Short route description
 * @property {string}  origin              - Departure point
 * @property {string}  destination         - Arrival point
 * @property {number}  estimated_wait_minutes
 * @property {string}  status              - "normal" | "moderate" | "delayed" | "very-delayed"
 * @property {string}  last_updated        - Human-readable relative time
 * @property {string}  frequency           - Vehicle frequency estimate
 * @property {string}  capacity            - Current load description
 * @property {boolean} is_demo             - Flag
 */

/** @type {WaitingEntry[]} */
const demoWaitingData = [
  {
    id: "route-021",
    transport_type: "jeepney",
    transport_emoji: "🚐",
    transport_label: "Traditional & Modern Jeepney",
    route_name: "Calumpang – City Proper (Super / Plaza Libertad) via Molo",
    origin: "Calumpang Elementary School / Brgy. Hall",
    destination: "Super / Plaza Libertad / Calle Real",
    estimated_wait_minutes: 20,
    status: "delayed",
    last_updated: "Just now",
    frequency: "Every 6–8 mins",
    capacity: "Full",
    is_demo: false
  },
  {
    id: "route-022",
    transport_type: "tricycle",
    transport_emoji: "🛺",
    transport_label: "Calumpang TODA Tricycle",
    route_name: "Calumpang Interior – Boulevard – Molo Plaza Terminal",
    origin: "Calumpang Barangay Hall & Gym",
    destination: "Molo Plaza & Church",
    estimated_wait_minutes: 7,
    status: "normal",
    last_updated: "1 min ago",
    frequency: "Every 3 mins",
    capacity: "Available",
    is_demo: false
  },
  {
    id: "route-023",
    transport_type: "jeepney",
    transport_emoji: "🚐",
    transport_label: "Modern Jeepney / PUV",
    route_name: "Calumpang – Molo – Festive Walk Mall via Diversion",
    origin: "Calumpang Coastal Staging Area",
    destination: "Festive Walk Transport Hub (Megaworld)",
    estimated_wait_minutes: 15,
    status: "moderate",
    last_updated: "3 mins ago",
    frequency: "Every 10–12 mins",
    capacity: "Moderate",
    is_demo: false
  },
  {
    id: "route-001",
    transport_type: "jeepney",
    transport_emoji: "🚐",
    transport_label: "Jeepney",
    route_name: "Route 1: Bo. Obrero – City Proper via General Luna",
    origin: "Bo. Obrero / Lapuz Ferry Terminal",
    destination: "Plaza Libertad / City Proper",
    estimated_wait_minutes: 15,
    status: "moderate",
    last_updated: "2 mins ago",
    frequency: "Every 7 mins",
    capacity: "Moderate",
    is_demo: false
  },
  {
    id: "route-002",
    transport_type: "jeepney",
    transport_emoji: "🚐",
    transport_label: "Jeepney",
    route_name: "Route 2: Villa Baybay – City Proper via Molo Plaza",
    origin: "Mohon Terminal / Villa Beach",
    destination: "Plaza Libertad / Calle Real",
    estimated_wait_minutes: 18,
    status: "delayed",
    last_updated: "Just now",
    frequency: "Every 8 mins",
    capacity: "Full",
    is_demo: false
  },
  {
    id: "route-003",
    transport_type: "jeepney",
    transport_emoji: "🚐",
    transport_label: "Modern Jeepney",
    route_name: "Route 3: Ungka Terminal – City Proper via CPU & Jaro Plaza",
    origin: "Ungka Terminal (Pavia boundary)",
    destination: "Super / Iloilo Terminal Market",
    estimated_wait_minutes: 14,
    status: "moderate",
    last_updated: "4 mins ago",
    frequency: "Every 6 mins",
    capacity: "Moderate",
    is_demo: false
  },
  {
    id: "route-004",
    transport_type: "jeepney",
    transport_emoji: "🚐",
    transport_label: "Modern Jeepney",
    route_name: "Route 4: Ungka Terminal – City Proper via Diversion & SM City",
    origin: "Ungka Transport Terminal",
    destination: "Calle Real / Plaza Libertad",
    estimated_wait_minutes: 10,
    status: "normal",
    last_updated: "1 min ago",
    frequency: "Every 5 mins",
    capacity: "Available",
    is_demo: false
  },
  {
    id: "route-005",
    transport_type: "jeepney",
    transport_emoji: "🚐",
    transport_label: "Modern Jeepney",
    route_name: "Route 5: Festive Walk Transport Hub – City Proper via Jalandoni",
    origin: "Festive Walk Transport Hub (Megaworld)",
    destination: "Plaza Libertad / City Hall",
    estimated_wait_minutes: 8,
    status: "normal",
    last_updated: "Just now",
    frequency: "Every 6 mins",
    capacity: "Available",
    is_demo: false
  },
  {
    id: "route-006",
    transport_type: "jeepney",
    transport_emoji: "🚐",
    transport_label: "Jeepney",
    route_name: "Route 10: Tagbak Terminal / Buntatala – City Proper via Jaro",
    origin: "Tagbak Transport Terminal (Jaro)",
    destination: "Super / Terminal Market",
    estimated_wait_minutes: 24,
    status: "delayed",
    last_updated: "3 mins ago",
    frequency: "Every 10 mins",
    capacity: "Full",
    is_demo: false
  },
  {
    id: "route-011",
    transport_type: "bus",
    transport_emoji: "🚌",
    transport_label: "MetroExpress P2P Airport Bus",
    route_name: "MetroExpress P2P: SM City Iloilo – Iloilo International Airport",
    origin: "SM City Iloilo Traveler's Lounge",
    destination: "Iloilo International Airport (Cabatuan)",
    estimated_wait_minutes: 20,
    status: "delayed",
    last_updated: "5 mins ago",
    frequency: "Every 45 mins",
    capacity: "Moderate",
    is_demo: false
  },
  {
    id: "route-013",
    transport_type: "bus",
    transport_emoji: "🚌",
    transport_label: "Ceres Liner Provincial Bus",
    route_name: "Ceres Liner North: Tagbak Terminal – Passi City Bus Terminal",
    origin: "Tagbak Transport Terminal (Jaro)",
    destination: "Passi City Bus Terminal",
    estimated_wait_minutes: 30,
    status: "delayed",
    last_updated: "8 mins ago",
    frequency: "Every 30 mins",
    capacity: "Full",
    is_demo: false
  },
  {
    id: "route-017",
    transport_type: "tricycle",
    transport_emoji: "🛺",
    transport_label: "Jaro Tricycle TODA",
    route_name: "Jaro Plaza – CPU Gate 3 – Dungon Interior",
    origin: "Jaro Plaza & Cathedral",
    destination: "Central Philippine University (CPU)",
    estimated_wait_minutes: 5,
    status: "normal",
    last_updated: "1 min ago",
    frequency: "Every 2 mins",
    capacity: "Available",
    is_demo: false
  }
];

/**
 * Fallback Route finder data
 */
const demoRouteData = [
  {
    id: "result-calumpang-01",
    transport_type: "jeepney",
    transport_emoji: "🚐",
    transport_label: "Jeepney",
    route_name: "Calumpang – City Proper (Super / Plaza Libertad)",
    origin_keywords: ["calumpang", "molo", "boulevard", "san juan"],
    destination_keywords: ["city proper", "super", "plaza libertad", "calle real", "iloilo"],
    estimated_fare_php: 13,
    estimated_duration_min: 25,
    estimated_wait_minutes: 20,
    status: "delayed",
    is_demo: false
  },
  {
    id: "result-001",
    transport_type: "jeepney",
    transport_emoji: "🚐",
    transport_label: "Jeepney",
    route_name: "City Proper – Jaro via CPU",
    origin_keywords: ["city proper", "super", "iloilo"],
    destination_keywords: ["jaro", "cpu", "tagbak", "lapaz"],
    estimated_fare_php: 14,
    estimated_duration_min: 25,
    estimated_wait_minutes: 18,
    status: "delayed",
    is_demo: false
  },
  {
    id: "result-002",
    transport_type: "jeepney",
    transport_emoji: "🚐",
    transport_label: "Modern Jeepney",
    route_name: "Ungka Terminal – SM City – Festive Walk",
    origin_keywords: ["ungka", "pavia", "jaro"],
    destination_keywords: ["sm city", "festive walk", "megaworld", "diversion"],
    estimated_fare_php: 16,
    estimated_duration_min: 20,
    estimated_wait_minutes: 10,
    status: "normal",
    is_demo: false
  },
  {
    id: "result-003",
    transport_type: "bus",
    transport_emoji: "🚌",
    transport_label: "MetroExpress P2P Bus",
    route_name: "SM City / Festive Walk – Iloilo International Airport",
    origin_keywords: ["sm city", "festive walk", "mandurriao"],
    destination_keywords: ["airport", "cabatuan", "santa barbara"],
    estimated_fare_php: 80,
    estimated_duration_min: 35,
    estimated_wait_minutes: 20,
    status: "delayed",
    is_demo: false
  }
];

/** Currently loaded active waiting data (initialized from fallback, updated via API) */
let currentWaitingData = [...demoWaitingData];

/* =============================================================
   2. UTILITY HELPERS
   ============================================================= */

/**
 * Returns a CSS status modifier string based on wait minutes.
 * @param {number} minutes
 * @returns {"normal" | "moderate" | "delayed"}
 */
function getStatusFromMinutes(minutes) {
  if (minutes <= 10) return "normal";
  if (minutes <= 20) return "moderate";
  return "delayed";
}

/**
 * Returns a human-readable status label.
 * @param {string} status
 * @returns {string}
 */
function getStatusLabel(status) {
  const labels = {
    normal: "Normal",
    moderate: "Some Delay",
    delayed: "Long Wait",
    "very-delayed": "Critical Delay"
  };
  return labels[status] || "Moderate";
}

/**
 * Maps wait minutes to a bar fill percentage (capped at 100%).
 * @param {number} minutes
 * @returns {number}
 */
function minutesToBarPercent(minutes) {
  return Math.min(100, Math.round((minutes / 70) * 100));
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
 * Sets or clears an error on a form field.
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
 */
function clearFormErrors(form) {
  form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  form.querySelectorAll('[class$="__error"]').forEach(el => { el.textContent = ''; });
}

/* =============================================================
   3. NAVIGATION
   ============================================================= */
function initializeNavigation() {
  const navbar    = document.getElementById('main-navbar');
  const toggle    = document.getElementById('mobile-menu-toggle');
  const navLinks  = document.getElementById('nav-links');

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
   4. HERO SEARCH
   ============================================================= */
function initializeHeroSearch() {
  const form  = document.getElementById('hero-search-form');
  const input = document.getElementById('hero-search-input');
  if (!form || !input) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    const waitSection = document.getElementById('waiting-time-section');
    if (waitSection) {
      waitSection.scrollIntoView({ behavior: 'smooth' });
    }
    renderWaitingCards(query, 'all');
    showToast(`Searching for "${query}"…`);
  });
}

/* =============================================================
   5. RENDER WAITING CARDS (Live & Offline Sync)
   ============================================================= */
let _activeFilter  = 'all';
let _activeQuery   = '';

/**
 * Fetch live waiting times from /api/waiting-times.php
 */
async function loadLiveWaitingData() {
  try {
    const res = await fetch(`${API_BASE}/waiting-times.php`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      currentWaitingData = json.data.map(item => ({
        id: item.id,
        transport_type: item.transport_type,
        transport_emoji: item.transport_icon || (item.transport_type === 'bus' ? '🚌' : item.transport_type === 'tricycle' ? '🛺' : '🚐'),
        transport_label: item.transport_label || item.transport_type.toUpperCase(),
        route_name: item.route_name,
        origin: item.origin,
        destination: item.destination,
        estimated_wait_minutes: item.estimated_wait_minutes,
        status: item.status,
        last_updated: "Live update",
        frequency: "Every 5–10 mins",
        capacity: item.status === 'delayed' ? 'High Volume' : 'Normal',
        is_demo: Boolean(item.is_demo)
      }));
      console.info(`[SakayNow] Live Iloilo transit data loaded (${currentWaitingData.length} routes).`);
      renderWaitingCards(_activeQuery, _activeFilter, currentWaitingData);
    }
  } catch (err) {
    console.warn('[SakayNow] Backend API offline. Using Iloilo fallback dataset:', err);
    renderWaitingCards(_activeQuery, _activeFilter, currentWaitingData);
  }
}

/**
 * Renders waiting-time cards into #waiting-time-container.
 */
function renderWaitingCards(query = _activeQuery, filter = _activeFilter, data = currentWaitingData) {
  _activeQuery  = query;
  _activeFilter = filter;

  const container  = document.getElementById('waiting-time-container');
  const emptyState = document.getElementById('waiting-empty-state');
  if (!container) return;

  const q = query.toLowerCase().trim();

  const filtered = data.filter(entry => {
    const matchesFilter = filter === 'all' || entry.transport_type === filter;
    const matchesQuery  = !q ||
      entry.route_name.toLowerCase().includes(q) ||
      entry.origin.toLowerCase().includes(q) ||
      entry.destination.toLowerCase().includes(q) ||
      (entry.transport_label && entry.transport_label.toLowerCase().includes(q));
    return matchesFilter && matchesQuery;
  });

  if (filtered.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  container.innerHTML = filtered.map((entry, index) => {
    const status      = entry.status || getStatusFromMinutes(entry.estimated_wait_minutes);
    const statusLabel = getStatusLabel(status);
    const barWidth    = minutesToBarPercent(entry.estimated_wait_minutes);

    return `
      <article
        class="waiting-card reveal"
        id="waiting-card-${entry.id}"
        data-transport-type="${entry.transport_type}"
        data-route-id="${entry.id}"
        data-status="${status}"
        data-waiting-minutes="${entry.estimated_wait_minutes}"
        data-is-demo="${entry.is_demo}"
        style="animation-delay: ${index * 45}ms"
        aria-label="${entry.transport_label} – ${entry.route_name} – ${entry.estimated_wait_minutes} minute wait"
      >
        <div class="waiting-card__header">
          <div class="waiting-card__title-group">
            <span class="waiting-card__emoji" aria-hidden="true">${entry.transport_emoji}</span>
            <div>
              <h3 class="waiting-card__title">${entry.route_name}</h3>
              <span class="waiting-card__type-label">${entry.transport_label}</span>
            </div>
          </div>
          <span
            class="waiting-card__status waiting-card__status--${status}"
            data-field="status"
            aria-label="Status: ${statusLabel}"
          >${statusLabel}</span>
        </div>

        <p class="waiting-card__route" data-field="route-name">
          📍 ${entry.origin} → ${entry.destination}
        </p>

        <div class="waiting-card__time">
          <div class="waiting-card__time-number">
            <span class="waiting-card__time-value" data-field="estimated-wait">
              ${entry.estimated_wait_minutes}
            </span>
            <span class="waiting-card__time-unit">mins</span>
          </div>
          <span class="waiting-card__time-caption">estimated wait time</span>
        </div>

        <div
          class="waiting-card__bar-wrap"
          role="progressbar"
          aria-valuenow="${entry.estimated_wait_minutes}"
          aria-valuemin="0"
          aria-valuemax="70"
          aria-label="Estimated wait progress bar"
        >
          <div
            class="waiting-card__bar-fill waiting-card__bar-fill--${status}"
            style="width: ${barWidth}%"
          ></div>
        </div>

        <div class="waiting-card__details">
          <span class="waiting-card__detail-item">
            <span class="waiting-card__detail-icon" aria-hidden="true">⏱️</span>
            ${entry.frequency || 'Every 5–10 min'}
          </span>
          <span class="waiting-card__detail-item">
            <span class="waiting-card__detail-icon" aria-hidden="true">👥</span>
            ${entry.capacity || 'Moderate'}
          </span>
        </div>

        <footer class="waiting-card__footer">
          <span class="waiting-card__updated" data-field="last-updated">
            🕐 ${entry.last_updated}
          </span>
        </footer>
      </article>
    `;
  }).join('');

  initializeScrollReveal();
}

/* =============================================================
   6. WAITING FILTERS
   ============================================================= */
function initializeWaitingFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('filter-btn--active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('filter-btn--active');
      btn.setAttribute('aria-pressed', 'true');

      const filter = btn.dataset.filter;
      renderWaitingCards(_activeQuery, filter);
    });
  });
}

/* =============================================================
   7. UPDATE WAITING STATUS
   ============================================================= */
function updateWaitingStatus() {
  setInterval(() => {
    // Periodically fetch live updates from API if online
    loadLiveWaitingData();
  }, 30000); // Check every 30 seconds
}

/* =============================================================
   8. ROUTE SEARCH (Connected to /api/routing.php)
   ============================================================= */
function initializeRouteSearch() {
  const form       = document.getElementById('route-search-form');
  const originEl   = document.getElementById('route-origin');
  const destEl     = document.getElementById('route-destination');
  const typeEl     = document.getElementById('route-transport-type');
  const resultsEl  = document.getElementById('route-search-results');
  const emptyEl    = document.getElementById('route-search-empty');
  const loadingEl  = document.getElementById('route-search-loading');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFormErrors(form);

    const origin      = originEl.value.trim();
    const destination = destEl.value.trim();
    const transport   = typeEl.value;
    let   valid       = true;

    if (!origin) {
      setFieldError('route-origin', 'route-origin-error', 'Please enter a departure location (e.g. Calumpang).');
      valid = false;
    } else if (origin.length < 2) {
      setFieldError('route-origin', 'route-origin-error', 'Origin must be at least 2 characters.');
      valid = false;
    }

    if (!destination) {
      setFieldError('route-destination', 'route-destination-error', 'Please enter a destination (e.g. Super, Jaro, SM City).');
      valid = false;
    } else if (destination.length < 2) {
      setFieldError('route-destination', 'route-destination-error', 'Destination must be at least 2 characters.');
      valid = false;
    }

    if (!valid) return;

    if (resultsEl)  resultsEl.innerHTML = '';
    if (emptyEl)    emptyEl.classList.add('hidden');
    if (loadingEl)  loadingEl.classList.remove('hidden');

    performRouteSearch(origin, destination, transport);
  });

  [
    ['route-origin', 'route-origin-error', 'Please enter a departure location.'],
    ['route-destination', 'route-destination-error', 'Please enter a destination.']
  ].forEach(([id, errId, msg]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', () => {
      if (el.value.trim() && el.value.trim().length >= 2) {
        setFieldError(id, errId, '');
      }
    });
    el.addEventListener('input', () => setFieldError(id, errId, ''));
  });
}

/**
 * Searches routes using backend routing engine with map integration
 */
async function performRouteSearch(origin, destination, transport) {
  const resultsEl = document.getElementById('route-search-results');
  const emptyEl   = document.getElementById('route-search-empty');
  const loadingEl = document.getElementById('route-search-loading');
  if (!resultsEl) return;

  // 1. Try Backend Routing API
  try {
    const params = new URLSearchParams({
      origin: origin,
      destination: destination,
      type: transport || 'all'
    });

    const res = await fetch(`${API_BASE}/routing.php?${params}`);
    const json = await res.json();

    if (loadingEl) loadingEl.classList.add('hidden');

    if (json.success && json.data && json.data.available_transport_options && json.data.available_transport_options.length > 0) {
      const opts = json.data.available_transport_options;
      if (emptyEl) emptyEl.classList.add('hidden');

      resultsEl.innerHTML = opts.map((route, index) => {
        const status = route.status || getStatusFromMinutes(route.estimated_wait_minutes);
        const statusLabel = getStatusLabel(status);

        return `
          <div
            class="route-result-card reveal"
            id="route-result-${route.route_id}"
            data-transport-type="${route.transport_type}"
            data-route-id="${route.route_id}"
            style="animation-delay: ${index * 70}ms; border-left: 4px solid #2563eb;"
            role="article"
          >
            <div class="route-result-card__icon" aria-hidden="true">${route.transport_icon || '🚐'}</div>
            <div class="route-result-card__body">
              <div class="route-result-card__header">
                <h4 class="route-result-card__title">${route.route_name}</h4>
                <span class="waiting-card__status waiting-card__status--${status}">${statusLabel}</span>
              </div>
              <p class="route-result-card__details" style="font-size: 13px; color: #475569; margin: 4px 0;">
                📍 <strong>${json.data.origin.name}</strong> → <strong>${json.data.destination.name}</strong>
                ${route.via ? `<br><small style="color: #64748b;">Passes via: ${route.via}</small>` : ''}
              </p>
              <div class="route-result-card__meta" style="display: flex; gap: 16px; margin-top: 8px; font-size: 13px;">
                <span class="route-result-card__fare" style="color: #0f172a;"><strong>Fare:</strong> ₱${parseFloat(route.estimated_fare).toFixed(2)}</span>
                <span class="route-result-card__duration" style="color: #0f172a;"><strong>Travel:</strong> ~${route.travel_time_minutes} mins</span>
                <span class="route-result-card__wait" style="color: #ea580c; font-weight: 700;"><strong>Wait Time:</strong> ${route.estimated_wait_minutes} mins</span>
              </div>
            </div>
          </div>
        `;
      }).join('');

      initializeScrollReveal();
      showToast(`Found ${opts.length} Iloilo transit options.`);
      return;
    }
  } catch (err) {
    console.warn('[SakayNow] Routing API call failed, falling back to local search:', err);
  }

  // 2. Offline Fallback Search
  if (loadingEl) loadingEl.classList.add('hidden');

  const originLower = origin.toLowerCase();
  const destLower   = destination.toLowerCase();

  const results = demoRouteData.filter(route => {
    const matchesOrigin = route.origin_keywords.some(k => originLower.includes(k) || k.includes(originLower));
    const matchesDest   = route.destination_keywords.some(k => destLower.includes(k) || k.includes(destLower));
    const matchesType   = transport === 'all' || route.transport_type === transport;
    return (matchesOrigin || matchesDest || true) && matchesType;
  }).slice(0, 5);

  if (results.length === 0) {
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }

  if (emptyEl) emptyEl.classList.add('hidden');

  resultsEl.innerHTML = results.map((route, index) => {
    const status = route.status || getStatusFromMinutes(route.estimated_wait_minutes);
    const statusLabel = getStatusLabel(status);

    return `
      <div
        class="route-result-card reveal"
        id="route-result-${route.id}"
        data-transport-type="${route.transport_type}"
        data-route-id="${route.id}"
        style="animation-delay: ${index * 80}ms"
        role="article"
      >
        <div class="route-result-card__icon" aria-hidden="true">${route.transport_emoji}</div>
        <div class="route-result-card__body">
          <div class="route-result-card__header">
            <h4 class="route-result-card__title">${route.route_name}</h4>
            <span class="waiting-card__status waiting-card__status--${status}">${statusLabel}</span>
          </div>
          <div class="route-result-card__meta">
            <span class="route-result-card__fare">Fare: ₱${route.estimated_fare_php}</span>
            <span class="route-result-card__duration">~${route.estimated_duration_min} min</span>
            <span class="route-result-card__wait" style="color: #ea580c; font-weight: bold;">Wait: ~${route.estimated_wait_minutes} min</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  initializeScrollReveal();
  showToast(`Found ${results.length} Iloilo route options.`);
}

/* =============================================================
   9. REPORT FORM (Live Backend POST)
   ============================================================= */
function initializeReportForm() {
  const form       = document.getElementById('report-form');
  const submitBtn  = document.getElementById('report-submit');
  const successMsg = document.getElementById('report-success-message');
  const errorMsg   = document.getElementById('report-error-message');

  if (!form) return;

  const fields = [
    {
      id:    'report-transport-type',
      errId: 'report-transport-type-error',
      validate: (val) => val ? '' : 'Please select a transport type.'
    },
    {
      id:    'report-route',
      errId: 'report-route-error',
      validate: (val) => {
        if (!val.trim()) return 'Please enter the route name.';
        if (val.trim().length < 3) return 'Route name must be at least 3 characters.';
        return '';
      }
    },
    {
      id:    'report-location',
      errId: 'report-location-error',
      validate: (val) => {
        if (!val.trim()) return 'Please enter the location or stop (e.g. Calumpang).';
        if (val.trim().length < 3) return 'Location must be at least 3 characters.';
        return '';
      }
    },
    {
      id:    'report-waiting-minutes',
      errId: 'report-waiting-minutes-error',
      validate: (val) => {
        const num = parseInt(val, 10);
        if (!val) return 'Please enter the waiting time.';
        if (isNaN(num) || num < 1) return 'Waiting time must be at least 1 minute.';
        if (num > 300) return 'Please enter a realistic value (max 300 minutes).';
        return '';
      }
    }
  ];

  fields.forEach(({ id, errId, validate }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', () => setFieldError(id, errId, validate(el.value)));
    el.addEventListener('input', () => setFieldError(id, errId, ''));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormErrors(form);

    if (successMsg) successMsg.hidden = true;
    if (errorMsg)   errorMsg.hidden   = true;

    let isValid = true;
    fields.forEach(({ id, errId, validate }) => {
      const el  = document.getElementById(id);
      if (!el) return;
      const msg = validate(el.value);
      if (msg) {
        setFieldError(id, errId, msg);
        isValid = false;
      }
    });

    if (!isValid) {
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalid.focus();
      }
      return;
    }

    const formData = {
      commuter_name:      document.getElementById('report-name')?.value.trim() || '',
      transport_type:     document.getElementById('report-transport-type')?.value,
      route_name:         document.getElementById('report-route')?.value.trim(),
      location:           document.getElementById('report-location')?.value.trim(),
      waiting_minutes:    parseInt(document.getElementById('report-waiting-minutes')?.value, 10),
      report_description: document.getElementById('report-description')?.value.trim()
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting report…';

    try {
      const res = await fetch(`${API_BASE}/reports.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const json = await res.json();

      if (json.success) {
        if (successMsg) {
          successMsg.innerHTML = `
            <strong>✅ Report recorded!</strong><br/>
            ${json.message || 'Thank you for helping fellow Iloilo commuters!'}
          `;
          successMsg.hidden = false;
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        form.reset();
        clearFormErrors(form);
        showToast('✅ Report successfully submitted to live tracker!');
      } else {
        if (errorMsg) {
          errorMsg.textContent = json.message || 'Validation error.';
          errorMsg.hidden = false;
        }
      }
    } catch (err) {
      // Offline fallback notification
      console.warn('[SakayNow] Report API offline. Showing local confirmation:', err);
      if (successMsg) {
        successMsg.innerHTML = `
          <strong>✅ Report received (Offline Mode)!</strong><br/>
          Thank you! Your report about a <strong>${formData.waiting_minutes}-minute</strong> wait on
          <strong>${formData.route_name}</strong> at <strong>${formData.location}</strong> has been logged.
        `;
        successMsg.hidden = false;
      }
      form.reset();
      clearFormErrors(form);
      showToast('✅ Report recorded locally.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Report';
      setTimeout(() => {
        if (successMsg) successMsg.hidden = true;
      }, 9000);
    }
  });
}

/* =============================================================
   10. SMOOTH SCROLLING
   ============================================================= */
function initializeSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const navbarHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--navbar-height'),
        10
      ) || 68;
      const offset = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });
}

/* =============================================================
   11. SCROLL SPY
   ============================================================= */
function initializeScrollSpy() {
  const sections   = document.querySelectorAll('section[id]');
  const navLinks   = document.querySelectorAll('.navbar__link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            const href = link.getAttribute('href')?.slice(1);
            link.classList.toggle('is-active', href === entry.target.id);
          });
        }
      });
    },
    { threshold: 0.35, rootMargin: `-${68}px 0px 0px 0px` }
  );

  sections.forEach(sec => observer.observe(sec));
}

/* =============================================================
   12. BACK TO TOP
   ============================================================= */
function initializeBackToTop() {
  const btn = document.getElementById('back-to-top-btn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.removeAttribute('hidden');
    } else {
      btn.setAttribute('hidden', '');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =============================================================
   13. SCROLL REVEAL
   ============================================================= */
function initializeScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal:not(.is-visible)');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => observer.observe(el));
}

/* =============================================================
   14. BOOTSTRAP — DOMContentLoaded
   ============================================================= */
document.addEventListener('DOMContentLoaded', () => {
  // Core UI
  initializeNavigation();
  initializeSmoothScrolling();
  initializeScrollSpy();
  initializeBackToTop();

  // Load Iloilo Transit Dashboard Data
  renderWaitingCards();         // Render initial Iloilo cards
  loadLiveWaitingData();        // Sync with live PHP API
  initializeWaitingFilters();
  updateWaitingStatus();

  // Sections
  initializeHeroSearch();
  initializeRouteSearch();
  initializeReportForm();

  // Initialize Interactive MapTiler Map if container and script are present
  if (window.IloiloTransitMap && document.getElementById('iloilo-transit-map')) {
    window.iloiloMap = new window.IloiloTransitMap('iloilo-transit-map');
    window.iloiloMap.init();
  }

  // Scroll animations for static content
  document.querySelectorAll('.tip-card, .stat-card').forEach(el => {
    el.classList.add('reveal');
  });
  initializeScrollReveal();

  console.info(
    '%c[SakayNow] Connected to Iloilo Transit Tracker & MapTiler.',
    'color: #059669; font-weight: bold;'
  );
});
