/**
 * Iloilo Transit Interactive Map Component (MapTiler + Leaflet)
 *
 * Provides interactive map visualization, stop markers, live wait times,
 * and routing paths for Iloilo public transportation.
 *
 * API Key: guHcH7diPQJI56dDsa2f (MapTiler)
 */

class IloiloTransitMap {
  constructor(containerId = 'iloilo-transit-map') {
    this.containerId = containerId;
    this.map = null;
    this.markersLayer = null;
    this.routeLayer = null;
    this.apiKey = 'guHcH7diPQJI56dDsa2f';
    this.iloiloCenter = [10.7202, 122.5621]; // Iloilo City [lat, lng]
    this.apiBase = (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1'))
      ? (window.location.pathname.includes('/hackathon-app') ? '/hackathon-app/api' : '/api')
      : '/api';
  }

  /**
   * Initialize Leaflet library and MapTiler tiles
   */
  async init() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.warn(`[IloiloTransitMap] Container #${this.containerId} not found.`);
      return;
    }

    // Ensure Leaflet is loaded
    await this.loadLeafletAssets();

    // Create Map instance
    this.map = L.map(this.containerId, {
      center: this.iloiloCenter,
      zoom: 13,
      minZoom: 10,
      maxZoom: 18,
      maxBounds: [
        [10.45, 122.15], // Southwest Iloilo bounds
        [11.45, 123.35]  // Northeast Iloilo bounds
      ]
    });

    // Add MapTiler Streets TileLayer
    const tileUrl = `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${this.apiKey}`;
    L.tileLayer(tileUrl, {
      tileSize: 512,
      zoomOffset: -1,
      minZoom: 1,
      attribution: '\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e',
      crossOrigin: true
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
    this.routeLayer = L.layerGroup().addTo(this.map);

    // Load and plot Iloilo transit places
    await this.loadTransitStops();

    // Connect to Route Search Form
    this.connectRouteForm();

    console.info('[IloiloTransitMap] Interactive MapTiler map ready.');
  }

  /**
   * Dynamically loads Leaflet CSS and JS if not already on page
   */
  loadLeafletAssets() {
    return new Promise((resolve) => {
      if (window.L) return resolve();

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  }

  /**
   * Fetches Iloilo transit places from backend and adds color-coded markers
   */
  async loadTransitStops(district = 'all') {
    try {
      const url = `${this.apiBase}/places.php${district !== 'all' ? `?district=${district}` : ''}`;
      const res = await fetch(url);
      const json = await res.json();

      if (!json.success || !json.data) return;

      this.markersLayer.clearLayers();

      json.data.forEach((place) => {
        const [lat, lng] = place.coordinates;
        const statusColor = place.status === 'delayed' ? '#ef4444'
                          : place.status === 'very-delayed' ? '#991b1b'
                          : place.status === 'moderate' ? '#f59e0b'
                          : '#10b981';

        // Custom Circle Marker
        const marker = L.circleMarker([lat, lng], {
          radius: place.is_terminal ? 9 : 7,
          fillColor: statusColor,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        });

        // Popup with Iloilo transit details
        const puvBadges = (place.transport_types || [])
          .map(t => `<span style="display:inline-block;padding:2px 6px;margin:2px;background:#e2e8f0;border-radius:4px;font-size:11px;text-transform:capitalize;">${t}</span>`)
          .join('');

        const popupContent = `
          <div style="font-family:sans-serif;min-width:200px;font-size:13px;line-height:1.4;">
            <strong style="font-size:14px;color:#1e293b;">${place.name}</strong>
            <div style="color:#64748b;font-size:12px;margin-bottom:4px;">${place.district}, Iloilo</div>
            <div style="margin:6px 0;padding:6px;background:#f8fafc;border-radius:6px;border-left:4px solid ${statusColor};">
              <div style="font-size:11px;color:#64748b;">ESTIMATED WAIT</div>
              <strong style="font-size:16px;color:#0f172a;">${place.waiting_time_estimate} mins</strong>
              <span style="font-size:11px;color:${statusColor};font-weight:bold;text-transform:uppercase;">(${place.status})</span>
            </div>
            <div style="margin-top:4px;">${puvBadges}</div>
            <div style="margin-top:8px;display:flex;gap:4px;">
              <button onclick="window.iloiloMap.setOrigin('${place.name.replace(/'/g, "\\'")}')" style="flex:1;background:#2563eb;color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:11px;">From Here</button>
              <button onclick="window.iloiloMap.setDestination('${place.name.replace(/'/g, "\\'")}')" style="flex:1;background:#059669;color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:11px;">To Here</button>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        this.markersLayer.addLayer(marker);
      });
    } catch (err) {
      console.error('[IloiloTransitMap] Failed to load transit stops:', err);
    }
  }

  /**
   * Set Origin input field in route form
   */
  setOrigin(name) {
    const el = document.getElementById('route-origin');
    if (el) {
      el.value = name;
      el.focus();
    }
  }

  /**
   * Set Destination input field in route form
   */
  setDestination(name) {
    const el = document.getElementById('route-destination');
    if (el) {
      el.value = name;
      el.focus();
    }
  }

  /**
   * Connect to the existing HTML route search form
   */
  connectRouteForm() {
    const form = document.getElementById('route-search-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      const originInput = document.getElementById('route-origin')?.value.trim();
      const destInput = document.getElementById('route-destination')?.value.trim();
      const typeSelect = document.getElementById('route-transport-type')?.value || 'all';

      if (!originInput || !destInput) return;

      await this.calculateAndDrawRoute(originInput, destInput, typeSelect);
    });
  }

  /**
   * Calculate route via /api/routing.php and draw the GeoJSON path on MapTiler
   */
  async calculateAndDrawRoute(origin, destination, type = 'all') {
    try {
      const params = new URLSearchParams({
        origin: origin,
        destination: destination,
        type: type
      });

      const res = await fetch(`${this.apiBase}/routing.php?${params}`);
      const json = await res.json();

      if (!json.success || !json.data) return;

      const { route_summary, origin: origData, destination: destData } = json.data;

      this.routeLayer.clearLayers();

      // Plot Origin Marker (Blue)
      const origMarker = L.circleMarker(origData.coordinates, {
        radius: 10,
        fillColor: '#2563eb',
        color: '#ffffff',
        weight: 3,
        fillOpacity: 1
      }).bindPopup(`<strong>Origin:</strong> ${origData.name}`);
      this.routeLayer.addLayer(origMarker);

      // Plot Destination Marker (Green)
      const destMarker = L.circleMarker(destData.coordinates, {
        radius: 10,
        fillColor: '#10b981',
        color: '#ffffff',
        weight: 3,
        fillOpacity: 1
      }).bindPopup(`<strong>Destination:</strong> ${destData.name}`);
      this.routeLayer.addLayer(destMarker);

      // Draw Path Polyline from GeoJSON
      if (route_summary.geometry && route_summary.geometry.coordinates) {
        // GeoJSON has [lng, lat], Leaflet polyline needs [lat, lng]
        const latLngs = route_summary.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        const polyline = L.polyline(latLngs, {
          color: '#3b82f6',
          weight: 5,
          opacity: 0.85,
          dashArray: '8, 8'
        });
        this.routeLayer.addLayer(polyline);

        // Fit map bounds to show whole route
        this.map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
      }
    } catch (err) {
      console.error('[IloiloTransitMap] Route calculation error:', err);
    }
  }
}

// Global accessor
window.IloiloTransitMap = IloiloTransitMap;
