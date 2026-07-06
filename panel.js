// ── panel.js ── Entry point
import { logs, selectedId, editingId, sendingId, activeTab, activeSubTab,
         setLogs, setSelectedId, setEditingId, setSendingId,
         setActiveTab, setActiveSubTab, ignoreStorageChange, setIgnoreStorageChange,
         logListEl, detailEmpty, detailContent, searchInput, filterMethod,
         filterStatus, filterContent, countBadge, statusText, statusCount,
         divider, MAX_LOGS } from './modules/state.js';
import { loadLogs, saveLogs } from './modules/storage.js';
import { filterLogs } from './modules/filter.js';
import { renderList, renderDetail } from './modules/render.js';
import { startCapture } from './modules/network.js';
import { refresh } from './modules/refresh.js';
import { theme, setTheme } from './modules/state.js';

// ── Resize divider ──
let isDragging = false;
divider.addEventListener('mousedown', (e) => {
  isDragging = true;
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
});
document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const rect = document.getElementById('split-view').getBoundingClientRect();
  const x = e.clientX - rect.left;
  const percentage = Math.min(Math.max((x / rect.width) * 100, 15), 85);
  logListEl.style.width = percentage + '%';
});
document.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }
});

// ── Event listeners ──
searchInput.addEventListener('input', renderList);
filterMethod.addEventListener('change', renderList);
filterStatus.addEventListener('change', renderList);
filterContent.addEventListener('input', renderList);

document.getElementById('clear').onclick = async () => {
  setLogs([]);
  setSelectedId(null);
  setEditingId(null);
  setSendingId(null);
  await saveLogs();
  renderList();
  detailEmpty.style.display = 'block';
  detailContent.style.display = 'none';
  statusText.textContent = 'Cleared';
};

chrome.storage.onChanged.addListener((changes, ns) => {
  if (ns === 'local' && changes.logs && !ignoreStorageChange) {
    refresh();
  }
});

// ── INIT ──
(async function init() {
  await refresh();
  await loadTheme();
  startCapture();
  statusText.textContent = 'Listening…';
  console.log('[BrutuSuite] Panel siap, menunggu request...');
})();

// ── Tema ──
const themeSelect = document.getElementById('theme-select');

function applyTheme(themeName) {
  document.body.className = 'theme-' + themeName;
  themeSelect.value = themeName;
}

async function loadTheme() {
  const result = await chrome.storage.local.get('theme');
  const saved = result.theme || 'vscode-dark';
  setTheme(saved);
  applyTheme(saved);
}

async function saveTheme(themeName) {
  await chrome.storage.local.set({ theme: themeName });
}

// Event listener untuk ganti tema
themeSelect.addEventListener('change', async (e) => {
  const newTheme = e.target.value;
  setTheme(newTheme);
  applyTheme(newTheme);
  await saveTheme(newTheme);
});