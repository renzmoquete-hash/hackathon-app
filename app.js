// ============================================================
// Constants
// ============================================================
const STORAGE_KEY = "app_data";

// ============================================================
// Priority Logic
// Priority matrix:
//   Rescue  + urgent  → Critical
//   Medical + urgent  → High
//   Food    + urgent  → Medium
//   Rescue  (normal)  → High
//   Medical (normal)  → Medium
//   Food    (normal)  → Low
// ============================================================
function computePriority(needType, isUrgent) {
  if (needType === "Rescue")  return isUrgent ? "Critical" : "High";
  if (needType === "Medical") return isUrgent ? "High"     : "Medium";
  if (needType === "Food")    return isUrgent ? "Medium"   : "Low";
  return "Low";
}

// ============================================================
// localStorage helpers
// ============================================================
function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveData(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// ============================================================
// ID generator  (short unique string)
// ============================================================
function generateId() {
  return "REQ-" + Date.now().toString(36).toUpperCase() +
         Math.random().toString(36).substring(2, 5).toUpperCase();
}

// ============================================================
// Priority badge HTML
// ============================================================
const PRIORITY_CLASSES = {
  Critical: "bg-red-100 text-red-700",
  High:     "bg-orange-100 text-orange-700",
  Medium:   "bg-yellow-100 text-yellow-700",
  Low:      "bg-green-100 text-green-700",
};

const PRIORITY_DOTS = {
  Critical: "🔴",
  High:     "🟠",
  Medium:   "🟡",
  Low:      "🟢",
};

function priorityBadge(priority) {
  const cls  = PRIORITY_CLASSES[priority] || "bg-slate-100 text-slate-600";
  const dot  = PRIORITY_DOTS[priority]    || "⚪";
  return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}">
            ${dot} ${priority}
          </span>`;
}

// ============================================================
// Render table
// ============================================================
function renderTable() {
  const records   = loadData();
  const tbody     = document.getElementById("tableBody");
  const emptyState = document.getElementById("emptyState");
  const countEl   = document.getElementById("requestCount");

  countEl.textContent = `${records.length} record(s)`;

  if (records.length === 0) {
    tbody.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  tbody.innerHTML = records.map((r, idx) => `
    <tr class="border-t border-slate-100 hover:bg-slate-50 transition ${idx % 2 === 0 ? "" : "bg-slate-50/40"}">
      <td class="px-5 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">${escapeHtml(r.id)}</td>
      <td class="px-5 py-3 font-medium text-slate-800 whitespace-nowrap">${escapeHtml(r.residentName)}</td>
      <td class="px-5 py-3 text-slate-700">${escapeHtml(r.needType)}</td>
      <td class="px-5 py-3">
        ${r.isUrgent
          ? '<span class="inline-block bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">YES</span>'
          : '<span class="inline-block bg-slate-200 text-slate-500 text-xs font-medium px-2 py-0.5 rounded-full">No</span>'}
      </td>
      <td class="px-5 py-3">${priorityBadge(r.priority)}</td>
      <td class="px-5 py-3 text-center">
        <button
          data-id="${escapeHtml(r.id)}"
          class="delete-btn text-xs text-red-500 hover:text-red-700 hover:underline font-medium transition"
        >Delete</button>
      </td>
    </tr>
  `).join("");

  // Attach delete handlers
  tbody.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => deleteRecord(btn.dataset.id));
  });
}

// ============================================================
// Delete a single record
// ============================================================
function deleteRecord(id) {
  const records = loadData().filter(r => r.id !== id);
  saveData(records);
  renderTable();
}

// ============================================================
// Clear all records
// ============================================================
function clearAll() {
  if (!confirm("Are you sure you want to clear all requests? This cannot be undone.")) return;
  saveData([]);
  renderTable();
}

// ============================================================
// Form submission
// ============================================================
function handleSubmit(e) {
  e.preventDefault();

  const nameInput = document.getElementById("residentName");
  const needInput = document.getElementById("needType");
  const urgentInput = document.getElementById("isUrgent");
  const nameError = document.getElementById("nameError");
  const needError = document.getElementById("needError");

  // Reset errors
  nameError.classList.add("hidden");
  needError.classList.add("hidden");
  nameInput.classList.remove("border-red-400");
  needInput.classList.remove("border-red-400");

  const residentName = nameInput.value.trim();
  const needType     = needInput.value;
  const isUrgent     = urgentInput.checked;

  let valid = true;

  if (!residentName) {
    nameError.classList.remove("hidden");
    nameInput.classList.add("border-red-400");
    nameInput.focus();
    valid = false;
  }

  if (!needType) {
    needError.classList.remove("hidden");
    needInput.classList.add("border-red-400");
    if (valid) needInput.focus();
    valid = false;
  }

  if (!valid) return;

  const priority = computePriority(needType, isUrgent);

  /** @type {{ id: string, residentName: string, needType: string, isUrgent: boolean, priority: string }} */
  const newRecord = {
    id: generateId(),
    residentName,
    needType,
    isUrgent,
    priority,
  };

  const records = loadData();
  records.unshift(newRecord); // newest first
  saveData(records);

  // Reset form
  nameInput.value     = "";
  needInput.value     = "";
  urgentInput.checked = false;

  renderTable();

  // Brief flash feedback
  nameInput.classList.add("ring-2", "ring-green-400");
  setTimeout(() => nameInput.classList.remove("ring-2", "ring-green-400"), 800);
}

// ============================================================
// Utility: escape HTML to prevent XSS
// ============================================================
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ============================================================
// Bootstrap
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  renderTable();
  document.getElementById("requestForm").addEventListener("submit", handleSubmit);
  document.getElementById("clearBtn").addEventListener("click", clearAll);
});
