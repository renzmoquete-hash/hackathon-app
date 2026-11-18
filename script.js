/**
 * SakayNow – script.js
 * Front-End Developer: Hackathon Team
 *
 * All data in this file is SIMULATED DEMO DATA.
 * No data is sent to a server. No backend is connected.
 *
 * Organisation:
 *  1. Demo Data
 *  2. Utility helpers
 *  3. initializeNavigation()
 *  4. initializeHeroSearch()
 *  5. renderWaitingCards()
 *  6. initializeWaitingFilters()
 *  7. updateWaitingStatus()
 *  8. initializeRouteSearch()
 *  9. initializeReportForm()
 * 10. initializeSmoothScrolling()
 * 11. initializeScrollSpy()
 * 12. initializeBackToTop()
 * 13. initializeScrollReveal()
 * 14. showToast()
 * 15. DOMContentLoaded – bootstrap
 */

'use strict';

/* =============================================================
   1. DEMO DATA
   ─────────────────────────────────────────────────────────────
   These arrays represent the shape of data the backend will
   eventually supply. Field names match the JSON spec in the
   project brief. The `is_demo` flag must remain true until
   replaced with real API responses.
   ============================================================= */

/**
 * @typedef {Object} WaitingEntry
 * @property {string}  id                  - Unique route ID
 * @property {string}  transport_type      - "jeepney" | "bus" | "uv" | "train"
 * @property {string}  transport_emoji     - Display emoji
 * @property {string}  transport_label     - Human-readable type label
 * @property {string}  route_name          - Short route description
 * @property {string}  origin              - Departure point
 * @property {string}  destination         - Arrival point
 * @property {number}  estimated_wait_minutes
 * @property {string}  status              - "normal" | "moderate" | "delayed"
 * @property {string}  last_updated        - Human-readable relative time
 * @property {string}  frequency           - Vehicle frequency estimate
 * @property {string}  capacity            - Current load description
 * @property {boolean} is_demo             - Always true for demo data
 */

/** @type {WaitingEntry[]} */
const demoWaitingData = [
  {
    id: "route-001",
    transport_type: "jeepney",
    transport_emoji: "🚌",
    transport_label: "Jeepney",
    route_name: "City Proper – Jaro",
    origin: "Iloilo City Proper",
    destination: "Jaro, Iloilo",
    estimated_wait_minutes: 18,
    status: "delayed",
    last_updated: "Just now",
    frequency: "Every 8 min (est.)",
    capacity: "Full",
    is_demo: true
  },
  {
    id: "route-002",
    transport_type: "bus",
    transport_emoji: "🚍",
    transport_label: "Bus",
    route_name: "City Proper – Airport",
    origin: "Iloilo City Proper",
    destination: "Iloilo International Airport",
    estimated_wait_minutes: 10,
    status: "normal",
    last_updated: "2 minutes ago",
    frequency: "Every 20 min (est.)",
    capacity: "Moderate",
    is_demo: true
  },
  {
    id: "route-003",
    transport_type: "uv",
    transport_emoji: "🚐",
    transport_label: "UV Express",
    route_name: "EDSA Cubao – BGC",
    origin: "EDSA Cubao, Quezon City",
    destination: "Bonifacio Global City, Taguig",
    estimated_wait_minutes: 45,
    status: "delayed",
    last_updated: "5 minutes ago",
    frequency: "Every 15 min (est.)",
    capacity: "Full",
    is_demo: true
  },
  {
    id: "route-004",
    transport_type: "train",
    transport_emoji: "🚇",
    transport_label: "LRT-1",
    route_name: "Roosevelt – Baclaran",
    origin: "Roosevelt Station, QC",
    destination: "Baclaran Station, Pasay",
    estimated_wait_minutes: 6,
    status: "normal",
    last_updated: "1 minute ago",
    frequency: "Every 4 min (est.)",
    capacity: "Available",
    is_demo: true
  },
  {
    id: "route-005",
    transport_type: "jeepney",
    transport_emoji: "🚌",
    transport_label: "Jeepney",
    route_name: "Divisoria – Quiapo",
    origin: "Divisoria, Manila",
    destination: "Quiapo, Manila",
    estimated_wait_minutes: 12,
    status: "normal",
    last_updated: "3 minutes ago",
    frequency: "Every 5 min (est.)",
    capacity: "Moderate",
    is_demo: true
  },
  {
    id: "route-006",
    transport_type: "bus",
    transport_emoji: "🚍",
    transport_label: "P2P Bus",
    route_name: "Alabang – Makati",
    origin: "Alabang, Muntinlupa",
    destination: "Makati CBD",
    estimated_wait_minutes: 25,
    status: "moderate",
    last_updated: "4 minutes ago",
    frequency: "Every 10 min (est.)",
    capacity: "Full",
    is_demo: true
  },
  {
    id: "route-007",
    transport_type: "train",
    transport_emoji: "🚇",
    transport_label: "MRT-3",
    route_name: "North Avenue – Taft Avenue",
    origin: "North Avenue, QC",
    destination: "Taft Avenue, Pasay",
    estimated_wait_minutes: 22,
    status: "moderate",
    last_updated: "2 minutes ago",
    frequency: "Every 5 min (est.)",
    capacity: "Full",
    is_demo: true
  },
  {
    id: "route-008",
    transport_type: "uv",
    transport_emoji: "🚐",
    transport_label: "UV Express",
    route_name: "Fairview – Recto",
    origin: "Fairview, Quezon City",
    destination: "Recto, Manila",
    estimated_wait_minutes: 55,
    status: "delayed",
    last_updated: "6 minutes ago",
    frequency: "Every 20 min (est.)",
    capacity: "Full",
    is_demo: true
  },
  {
    id: "route-009",
    transport_type: "jeepney",
    transport_emoji: "🚌",
    transport_label: "Jeepney",
    route_name: "Ortigas – Quiapo",
    origin: "Ortigas Center, Pasig",
    destination: "Quiapo, Manila",
    estimated_wait_minutes: 30,
    status: "moderate",
    last_updated: "Just now",
    frequency: "Every 7 min (est.)",
    capacity: "Moderate",
    is_demo: true
  },
  {
    id: "route-010",
    transport_type: "bus",
    transport_emoji: "🚍",
    transport_label: "Bus",
    route_name: "EDSA Southbound",
    origin: "EDSA North (QC)",
    destination: "Pasay City",
    estimated_wait_minutes: 50,
    status: "delayed",
    last_updated: "3 minutes ago",
    frequency: "Every 12 min (est.)",
    capacity: "Full",
    is_demo: true
  }
];

/**
 * Demo route data for the Route Finder.
 * Shape matches expected backend response.
 * @type {Array<Object>}
 */
const demoRouteData = [
  {
    id: "result-001",
    transport_type: "jeepney",
    transport_emoji: "🚌",
    transport_label: "Jeepney",
    route_name: "City Proper – Jaro",
    origin_keywords: ["city proper", "iloilo", "citi"],
    destination_keywords: ["jaro", "lapaz"],
    estimated_fare_php: 13,
    estimated_duration_min: 25,
    estimated_wait_minutes: 18,
    status: "delayed",
    is_demo: true
  },
  {
    id: "result-002",
    transport_type: "bus",
    transport_emoji: "🚍",
    transport_label: "P2P Bus",
    route_name: "Alabang – Makati CBD",
    origin_keywords: ["alabang", "muntinlupa", "southmall"],
    destination_keywords: ["makati", "ayala", "cbd", "bgc"],
    estimated_fare_php: 65,
    estimated_duration_min: 45,
    estimated_wait_minutes: 25,
    status: "moderate",
    is_demo: true
  },
  {
    id: "result-003",
    transport_type: "train",
    transport_emoji: "🚇",
    transport_label: "MRT-3",
    route_name: "North Avenue – Ayala",
    origin_keywords: ["north avenue", "quezon", "qc", "north"],
    destination_keywords: ["ayala", "makati", "edsa ayala"],
    estimated_fare_php: 28,
    estimated_duration_min: 20,
    estimated_wait_minutes: 22,
    status: "moderate",
    is_demo: true
  },
  {
    id: "result-004",
    transport_type: "uv",
    transport_emoji: "🚐",
    transport_label: "UV Express",
    route_name: "Cubao – BGC",
    origin_keywords: ["cubao", "quezon", "araneta"],
    destination_keywords: ["bgc", "bonifacio", "taguig", "fort"],
    estimated_fare_php: 55,
    estimated_duration_min: 35,
    estimated_wait_minutes: 45,
    status: "delayed",
    is_demo: true
  },
  {
    id: "result-005",
    transport_type: "jeepney",
    transport_emoji: "🚌",
    transport_label: "Jeepney",
    route_name: "Divisoria – Quiapo",
    origin_keywords: ["divisoria", "tutuban", "manila"],
    destination_keywords: ["quiapo", "carriedo", "hidalgo"],
    estimated_fare_php: 13,
    estimated_duration_min: 15,
    estimated_wait_minutes: 12,
    status: "normal",
    is_demo: true
  }
];

/* =============================================================
   2. UTILITY HELPERS
   ============================================================= */

/**
 * Determines congestion level from minutes.
 * @param {number} minutes
 * @returns {"normal"|"moderate"|"delayed"}
 */
function getStatusFromMinutes(minutes) {
  if (minutes <= 15) return "normal";
  if (minutes <= 35) return "moderate";
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
    delayed: "Long Wait"
  };
  return labels[status] || "Unknown";
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
 * @param {string} fieldId   - ID of the input element
 * @param {string} errorId   - ID of the error span
 * @param {string} message   - Error message (empty string to clear)
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

  // Scroll: add scrolled class to navbar
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('is-scrolled', window.scrollY > 50);
  }, { passive: true });

  // Hamburger toggle
  toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close mobile menu when any nav link is clicked
  navLinks.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu on outside click
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
  const form   = document.getElementById('hero-search-form');
  const input  = document.getElementById('hero-search-input');
  const target = document.getElementById('waiting-time-section');

  if (!form || !input) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) {
      input.focus();
      showToast('Please enter a route, location, or transport type.');
      return;
    }

    // Scroll to dashboard and trigger filter
    if (target) {
      const offset = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }

    // Push query into the waiting-time section's search
    const waitSearchInput = document.getElementById('waiting-search-input');
    if (waitSearchInput) {
      waitSearchInput.value = query;
      waitSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      // Fall back: render cards filtered by hero query
      renderWaitingCards(query, 'all');
    }

    showToast(`Searching for "${query}"…`);
  });
}

/* =============================================================
   5. RENDER WAITING CARDS
   ─────────────────────────────────────────────────────────────
   Called by filters and search. Accepts optional overrides.
   Backend developers: replace `demoWaitingData` with an
   API call and pass the response array to this function.
   ============================================================= */

/** Tracks the current active filter for re-renders. */
let _activeFilter  = 'all';
let _activeQuery   = '';

/**
 * Renders waiting-time cards into #waiting-time-container.
 * @param {string} [query='']            - Text search query
 * @param {string} [filter='all']        - Transport type filter
 * @param {WaitingEntry[]} [data]        - Data source (defaults to demoWaitingData)
 */
function renderWaitingCards(query = _activeQuery, filter = _activeFilter, data = demoWaitingData) {
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
      entry.transport_label.toLowerCase().includes(q);
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
        style="animation-delay: ${index * 55}ms"
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
          <span
            class="waiting-card__time-value"
            data-field="estimated-wait"
          >${entry.estimated_wait_minutes}</span>
          <div>
            <span class="waiting-card__time-unit">min wait</span><br/>
            <span class="waiting-card__time-label">(estimated)</span>
          </div>
        </div>

        <div
          class="waiting-card__bar"
          role="img"
          aria-label="Wait level: ${barWidth}% of maximum"
        >
          <div
            class="waiting-card__bar-fill waiting-card__bar-fill--${status}"
            data-target="${barWidth}"
            style="width: 0%"
          ></div>
        </div>

        <div class="waiting-card__details">
          <div class="waiting-card__detail-row">
            <span>Frequency</span>
            <strong data-field="frequency">${entry.frequency}</strong>
          </div>
          <div class="waiting-card__detail-row">
            <span>Capacity</span>
            <strong data-field="capacity">${entry.capacity}</strong>
          </div>
        </div>

        <div class="waiting-card__footer">
          <span class="waiting-card__updated" data-field="last-updated">
            🕐 Updated ${entry.last_updated}
          </span>
          ${entry.is_demo
            ? `<span class="waiting-card__demo-tag" aria-label="Simulated demo data">DEMO</span>`
            : ''}
        </div>
      </article>
    `;
  }).join('');

  // Animate progress bars after render
  requestAnimationFrame(() => {
    container.querySelectorAll('.waiting-card__bar-fill').forEach(fill => {
      const target = fill.dataset.target;
      requestAnimationFrame(() => {
        fill.style.width = target + '%';
      });
    });
  });

  // Trigger scroll-reveal for newly injected cards
  initializeScrollReveal();
}

/* =============================================================
   6. WAITING-TIME FILTERS
   ============================================================= */
function initializeWaitingFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
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
   ─────────────────────────────────────────────────────────────
   Simulates a periodic "refresh" of wait times.
   Backend developers: replace this function with a real
   polling/WebSocket call that fetches fresh data.
   ============================================================= */
function updateWaitingStatus() {
  const updated = document.getElementById('waiting-time-updated');

  // Simulate minor fluctuations in demo data every 45 seconds
  setInterval(() => {
    demoWaitingData.forEach(entry => {
      const delta = Math.floor(Math.random() * 7) - 3; // ± 3 minutes
      entry.estimated_wait_minutes = Math.max(1, entry.estimated_wait_minutes + delta);
      entry.status = getStatusFromMinutes(entry.estimated_wait_minutes);
      entry.last_updated = "Just now";
    });

    renderWaitingCards(_activeQuery, _activeFilter);

    if (updated) {
      const now = new Date();
      updated.textContent = `🕐 Simulated refresh at ${now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })} (Demo only)`;
    }
  }, 45000);
}

/* =============================================================
   8. ROUTE SEARCH
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

    // Validation
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

    // Show loading state
    if (resultsEl)  resultsEl.innerHTML = '';
    if (emptyEl)    emptyEl.classList.add('hidden');
    if (loadingEl)  loadingEl.classList.remove('hidden');

    // Simulate async search with 800 ms delay
    setTimeout(() => {
      if (loadingEl) loadingEl.classList.add('hidden');
      performRouteSearch(origin, destination, transport);
    }, 800);
  });

  // Live validation on blur
  [
    ['route-origin', 'route-origin-error', 'Please enter a departure location.'],
    ['route-destination', 'route-destination-error', 'Please enter a destination.']
  ].forEach(([id, errId, msg]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', () => {
      if (!el.value.trim()) setFieldError(id, errId, msg);
    });
    el.addEventListener('input', () => setFieldError(id, errId, ''));
  });
}

/**
 * Filters demoRouteData and renders result cards.
 * @param {string} origin
 * @param {string} destination
 * @param {string} transport
 */
function performRouteSearch(origin, destination, transport) {
  const resultsEl = document.getElementById('route-search-results');
  const emptyEl   = document.getElementById('route-search-empty');
  if (!resultsEl) return;

  const originLower = origin.toLowerCase();
  const destLower   = destination.toLowerCase();

  const results = demoRouteData.filter(route => {
    const matchesOrigin = route.origin_keywords.some(k => originLower.includes(k) || k.includes(originLower));
    const matchesDest   = route.destination_keywords.some(k => destLower.includes(k) || k.includes(destLower));
    const matchesType   = transport === 'all' || route.transport_type === transport;

    // If we have a keyword match, use it; otherwise include everything for demo
    return (matchesOrigin || matchesDest || true) && matchesType;
  }).slice(0, 4); // Limit demo results

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
        data-is-demo="${route.is_demo}"
        style="animation-delay: ${index * 80}ms"
        role="article"
        aria-label="${route.transport_label} – ${route.route_name}"
      >
        <div class="route-result-card__icon" aria-hidden="true">${route.transport_emoji}</div>

        <div>
          <h3 class="route-result-card__title">${route.route_name}</h3>
          <div class="route-result-card__details">
            <span class="route-result-card__detail-item">
              🚌 ${route.transport_label}
            </span>
            <span class="route-result-card__detail-item">
              ⏱ ~${route.estimated_duration_min} min trip
            </span>
            <span class="route-result-card__detail-item">
              🕐 ~${route.estimated_wait_minutes} min wait
            </span>
            ${route.is_demo
              ? `<span class="route-result-card__detail-item" style="color:var(--color-primary);font-weight:600;">DEMO</span>`
              : ''}
          </div>
        </div>

        <div class="route-result-card__meta">
          <span class="route-result-card__fare">₱${route.estimated_fare_php}</span>
          <span class="route-result-card__duration">est. fare</span>
          <span
            class="route-result-card__wait-badge waiting-card__status--${status}"
            aria-label="Status: ${statusLabel}"
          >${statusLabel}</span>
        </div>
      </div>
    `;
  }).join('');

  initializeScrollReveal();
  showToast(`Found ${results.length} route${results.length !== 1 ? 's' : ''} (demo data).`);
}

/* =============================================================
   9. REPORT FORM
   ============================================================= */
function initializeReportForm() {
  const form       = document.getElementById('report-form');
  const submitBtn  = document.getElementById('report-submit');
  const successMsg = document.getElementById('report-success-message');
  const errorMsg   = document.getElementById('report-error-message');

  if (!form) return;

  // ── Validation rules ──────────────────────────────────────────
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
        if (!val.trim()) return 'Please enter the location or stop.';
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

  // Live blur validation
  fields.forEach(({ id, errId, validate }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', () => setFieldError(id, errId, validate(el.value)));
    el.addEventListener('input', () => setFieldError(id, errId, ''));
  });

  // ── Submit handler ─────────────────────────────────────────────
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFormErrors(form);

    // Hide previous messages
    if (successMsg) successMsg.hidden = true;
    if (errorMsg)   errorMsg.hidden   = true;

    // Run all validations
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
      // Scroll to first invalid field
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalid.focus();
      }
      return;
    }

    // Gather form data (ready for backend submission)
    const formData = {
      commuter_name:      document.getElementById('report-name')?.value.trim() || '',
      transport_type:     document.getElementById('report-transport-type')?.value,
      route_name:         document.getElementById('report-route')?.value.trim(),
      location:           document.getElementById('report-location')?.value.trim(),
      waiting_minutes:    parseInt(document.getElementById('report-waiting-minutes')?.value, 10),
      report_description: document.getElementById('report-description')?.value.trim(),
      submitted_at:       new Date().toISOString(),
      is_demo:            true
    };

    // Log for backend reference (remove in production)
    console.info('[SakayNow] Report submitted (demo — no server call):', formData);

    // Simulate submission
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Submitting…';

    setTimeout(() => {
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Submit Report';

      // Show success message
      if (successMsg) {
        successMsg.innerHTML = `
          <strong>✅ Report received! (Demo only)</strong><br/>
          Thank you${formData.commuter_name ? ', ' + formData.commuter_name : ''}! Your report
          about a <strong>${formData.waiting_minutes}-minute</strong> wait on
          <strong>${formData.route_name}</strong> has been recorded.
          No data has been sent to any server.
        `;
        successMsg.hidden = false;
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      form.reset();
      clearFormErrors(form);
      showToast('✅ Report submitted (demo)!');

      // Auto-hide after 8 seconds
      setTimeout(() => {
        if (successMsg) successMsg.hidden = true;
      }, 8000);

    }, 1200);
  });
}

/* =============================================================
   10. SMOOTH SCROLLING
   ─────────────────────────────────────────────────────────────
   Accounts for the fixed navbar height on anchor-link clicks.
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
   11. SCROLL SPY — Active Nav Links
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
   ─────────────────────────────────────────────────────────────
   Applies a fade-up animation to .reveal elements as they
   enter the viewport. Called after each card render.
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
   14. TOAST  (defined above in utilities, referenced here for
   completeness in the function listing)
   ============================================================= */
// showToast() — see Section 2 (Utility Helpers)

/* =============================================================
   15. BOOTSTRAP — DOMContentLoaded
   ============================================================= */
document.addEventListener('DOMContentLoaded', () => {

  // Core UI
  initializeNavigation();
  initializeSmoothScrolling();
  initializeScrollSpy();
  initializeBackToTop();

  // Dashboard
  renderWaitingCards();         // Initial render with all data
  initializeWaitingFilters();
  updateWaitingStatus();        // Simulated periodic refresh

  // Sections
  initializeHeroSearch();
  initializeRouteSearch();
  initializeReportForm();

  // Scroll animations for static content
  document.querySelectorAll('.tip-card, .stat-card').forEach(el => {
    el.classList.add('reveal');
  });
  initializeScrollReveal();

  console.info(
    '%c[SakayNow] Front-end initialised.',
    'color: #1a56db; font-weight: bold;'
  );
  console.info('%c⚠ All data is simulated. No backend is connected.', 'color: #f59e0b;');
});
