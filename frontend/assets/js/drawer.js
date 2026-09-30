/* ============================================================
   DRAWER.JS — Right-side Detail Drawer
   ============================================================ */

const Drawer = (() => {

  let _currentRecord = null;
  let _currentType = null;

  function open(config) {
    const {
      title = '',
      subtitle = '',
      avatar = null,
      tabs = [],
      record = null,
      type = null,
      onEdit = null,
      onDelete = null,
    } = config;

    _currentRecord = record;
    _currentType = type;

    const overlay = document.getElementById('drawerOverlay');
    const titleEl = document.getElementById('drawerTitle');
    const subtitleEl = document.getElementById('drawerSubtitle');
    const avatarEl = document.getElementById('drawerAvatar');
    const tabsEl = document.getElementById('drawerTabs');
    const bodyEl = document.getElementById('drawerBody');
    const editBtn = document.getElementById('drawerEditBtn');
    const deleteBtn = document.getElementById('drawerDeleteBtn');

    if (!overlay) return;

    // Set header
    titleEl.textContent = title;
    subtitleEl.textContent = subtitle;

    if (avatar) {
      avatarEl.className = `avatar avatar-md avatar-${avatar.color}`;
      avatarEl.textContent = avatar.initials;
      avatarEl.style.display = '';
    } else {
      avatarEl.style.display = 'none';
    }

    // Set tabs
    if (tabs.length > 0) {
      tabsEl.innerHTML = tabs.map((tab, i) => `
        <button class="drawer-tab ${i === 0 ? 'active' : ''}" data-tab="${tab.id}">
          ${tab.icon ? tab.icon + ' ' : ''}${tab.label}
        </button>
      `).join('');

      bodyEl.innerHTML = tabs.map((tab, i) => `
        <div class="drawer-tab-content ${i === 0 ? 'active' : ''}" id="drawer-tab-${tab.id}">
          ${tab.content}
        </div>
      `).join('');

      // Bind tab clicks
      tabsEl.querySelectorAll('.drawer-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          tabsEl.querySelectorAll('.drawer-tab').forEach(t => t.classList.remove('active'));
          btn.classList.add('active');
          const tabId = btn.dataset.tab;
          bodyEl.querySelectorAll('.drawer-tab-content').forEach(c => {
            c.classList.toggle('active', c.id === `drawer-tab-${tabId}`);
          });
        });
      });
    } else {
      tabsEl.innerHTML = '';
      bodyEl.innerHTML = '<div style="padding:var(--space-5);">No content available.</div>';
    }

    // Edit/Delete buttons
    editBtn.style.display = onEdit ? '' : 'none';
    deleteBtn.style.display = onDelete ? '' : 'none';
    editBtn.onclick = onEdit;
    deleteBtn.onclick = onDelete;

    // Open drawer
    overlay.classList.add('open');

    // Close handlers
    document.getElementById('drawerClose').onclick = close;
  }

  function close() {
    const overlay = document.getElementById('drawerOverlay');
    if (overlay) overlay.classList.remove('open');
    _currentRecord = null;
    _currentType = null;
  }

  function updateBody(tabId, html) {
    const content = document.getElementById(`drawer-tab-${tabId}`);
    if (content) content.innerHTML = html;
  }

  function buildDetailRows(fields) {
    return fields.map(({ label, value, highlight = false }) => `
      <div class="detail-row">
        <span class="detail-row-label">${label}</span>
        <span class="detail-row-value ${highlight ? 'highlight' : ''}">${value || '—'}</span>
      </div>
    `).join('');
  }

  function buildTimeline(items) {
    if (!items || items.length === 0) {
      return `<div style="padding:var(--space-4);color:var(--text-muted);font-size:var(--text-sm);">No timeline activity yet.</div>`;
    }
    return `
      <div class="drawer-timeline">
        ${items.map(item => `
          <div class="timeline-item">
            <div class="timeline-dot ${item.active ? 'active' : ''}"></div>
            <div class="timeline-content">
              <div class="timeline-title">${item.title}</div>
              <div class="timeline-desc">${item.desc || ''}</div>
              <div class="timeline-time">${item.time}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function buildStats(stats) {
    return `
      <div class="drawer-stats">
        ${stats.map(s => `
          <div class="drawer-stat">
            <div class="drawer-stat-val">${s.value}</div>
            <div class="drawer-stat-lbl">${s.label}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function init() {
    document.getElementById('drawerOverlay').addEventListener('click', (e) => {
      if (e.target === document.getElementById('drawerOverlay')) close();
    });
  }

  return { open, close, updateBody, buildDetailRows, buildTimeline, buildStats, init };
})();
