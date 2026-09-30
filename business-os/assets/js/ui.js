/* ============================================================
   UI.JS — UI System: Toast, Skeleton, Theme, Sidebar
   ============================================================ */

const UI = (() => {

  // ── Toast Notifications ──
  function toast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    const colors = {
      success: 'var(--status-success)',
      error:   'var(--status-error)',
      warning: 'var(--status-warning)',
      info:    'var(--status-info)',
    };
    const bgs = {
      success: 'var(--status-success-bg)',
      error:   'var(--status-error-bg)',
      warning: 'var(--status-warning-bg)',
      info:    'var(--status-info-bg)',
    };

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderColor = bgs[type] || 'var(--border-default)';
    toast.style.borderLeftColor = colors[type] || 'var(--accent-primary)';

    toast.innerHTML = `
      <span class="toast-icon" style="background: ${bgs[type]}; color: ${colors[type]};">${icons[type] || 'i'}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.click()">✕</button>
    `;

    toast.classList.add('notification-enter');
    container.appendChild(toast);

    // Auto dismiss
    const timer = setTimeout(() => dismiss(toast), duration);

    toast.addEventListener('click', () => {
      clearTimeout(timer);
      dismiss(toast);
    });

    function dismiss(el) {
      el.style.animation = 'toastSlideOut 0.25s ease both';
      setTimeout(() => el.remove(), 250);
    }

    return toast;
  }

  // ── Skeleton Loading ──
  function showSkeleton(container, rows = 5) {
    if (!container) return;
    container.innerHTML = Array.from({ length: rows }, () => `
      <div style="display:flex;align-items:center;gap:12px;padding:14px 20px;border-bottom:1px solid var(--border-subtle);">
        <div class="skeleton skeleton-circle" style="width:36px;height:36px;flex-shrink:0;"></div>
        <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
          <div class="skeleton skeleton-text medium"></div>
          <div class="skeleton skeleton-text short"></div>
        </div>
        <div class="skeleton skeleton-text" style="width:80px;height:24px;"></div>
      </div>
    `).join('');
  }

  function showCardSkeleton(container, count = 6) {
    if (!container) return;
    container.innerHTML = Array.from({ length: count }, () => `
      <div class="card" style="display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="skeleton skeleton-circle" style="width:44px;height:44px;flex-shrink:0;"></div>
          <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
            <div class="skeleton skeleton-text medium"></div>
            <div class="skeleton skeleton-text short"></div>
          </div>
        </div>
        <div class="skeleton skeleton-text long"></div>
        <div class="skeleton skeleton-text medium"></div>
        <div style="display:flex;gap:8px;">
          <div class="skeleton" style="height:26px;flex:1;border-radius:4px;"></div>
          <div class="skeleton" style="height:26px;flex:1;border-radius:4px;"></div>
          <div class="skeleton" style="height:26px;flex:1;border-radius:4px;"></div>
        </div>
      </div>
    `).join('');
  }

  // ── Sidebar ──
  function getSidebarState() {
    return Storage.get('sidebarCollapsed') || false;
  }

  function setSidebarCollapsed(collapsed) {
    const shell = document.getElementById('appShell');
    if (!shell) return;
    if (collapsed) shell.classList.add('sidebar-collapsed');
    else shell.classList.remove('sidebar-collapsed');
    Storage.set('sidebarCollapsed', collapsed);
  }

  function toggleSidebar() {
    const shell = document.getElementById('appShell');
    if (!shell) return;

    // Mobile: toggle mobile class
    if (window.innerWidth <= 768) {
      const sidebar = document.getElementById('appSidebar');
      const overlay = document.getElementById('mobileSidebarOverlay');
      const isOpen = sidebar && sidebar.classList.contains('mobile-open');
      sidebar.classList.toggle('mobile-open', !isOpen);
      if (overlay) overlay.classList.toggle('open', !isOpen);
      return;
    }

    // Desktop: collapse/expand
    const isCollapsed = shell.classList.contains('sidebar-collapsed');
    setSidebarCollapsed(!isCollapsed);
  }

  function initSidebar() {
    if (window.innerWidth > 768) {
      setSidebarCollapsed(getSidebarState());
    }

    // Mobile overlay click
    const overlay = document.getElementById('mobileSidebarOverlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        document.getElementById('appSidebar')?.classList.remove('mobile-open');
        overlay.classList.remove('open');
      });
    }
  }

  // ── Submenu toggles ──
  function initSubmenus() {
    document.querySelectorAll('.nav-item.has-submenu').forEach(item => {
      item.addEventListener('click', () => {
        const submenuId = item.dataset.submenu;
        const submenu = document.getElementById(submenuId);
        if (!submenu) return;
        const isOpen = submenu.classList.contains('open');
        // Close all
        document.querySelectorAll('.nav-submenu.open').forEach(sm => {
          sm.classList.remove('open');
          sm.previousElementSibling?.classList.remove('open');
        });
        if (!isOpen) {
          submenu.classList.add('open');
          item.classList.add('open');
        }
      });
    });
  }

  // ── Active nav item ──
  function setActiveNav(page) {
    document.querySelectorAll('.nav-item, .nav-subitem').forEach(item => {
      item.classList.remove('active');
    });
    const target = document.querySelector(`[data-page="${page}"]`);
    if (target) {
      target.classList.add('active');
      // Open parent submenu if needed
      const submenu = target.closest('.nav-submenu');
      if (submenu) {
        submenu.classList.add('open');
        submenu.previousElementSibling?.classList.add('open');
      }
    }
  }

  // ── Dropdown ──
  function createDropdown(anchor, items, onSelect) {
    // Close existing
    document.querySelectorAll('.dropdown-menu').forEach(d => d.remove());

    const rect = anchor.getBoundingClientRect();
    const menu = document.createElement('div');
    menu.className = 'dropdown-menu';
    menu.style.cssText = `
      position: fixed;
      top: ${rect.bottom + 6}px;
      left: ${rect.left}px;
      min-width: ${Math.max(rect.width, 160)}px;
      background: var(--bg-dropdown);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-dropdown);
      z-index: var(--z-dropdown);
      padding: 4px;
      animation: scaleIn 0.15s ease;
    `;

    items.forEach(item => {
      if (item === 'divider') {
        const div = document.createElement('div');
        div.style.cssText = 'height:1px;background:var(--border-subtle);margin:4px 0;';
        menu.appendChild(div);
        return;
      }
      const btn = document.createElement('button');
      btn.className = `menu-item ${item.danger ? 'danger' : ''}`;
      btn.innerHTML = `<span class="menu-icon">${item.icon || ''}</span> ${item.label}`;
      btn.addEventListener('click', () => {
        onSelect(item);
        menu.remove();
      });
      menu.appendChild(btn);
    });

    document.body.appendChild(menu);

    // Close on outside click
    setTimeout(() => {
      const closeHandler = (e) => {
        if (!menu.contains(e.target) && e.target !== anchor) {
          menu.remove();
          document.removeEventListener('click', closeHandler);
        }
      };
      document.addEventListener('click', closeHandler);
    }, 10);

    return menu;
  }

  // ── Confirm Dialog ──
  function confirm(message, title = 'Confirm', onConfirm = null) {
    const overlay = document.getElementById('crudOverlay');
    const modal = document.getElementById('crudModal');
    const titleEl = document.getElementById('crudModalTitle');
    const body = document.getElementById('crudModalBody');
    const footer = document.getElementById('crudModalFooter');
    const iconEl = document.getElementById('crudModalIcon');

    if (!overlay) return;

    iconEl.textContent = '⚠️';
    iconEl.style.background = 'var(--status-warning-bg)';
    iconEl.style.color = 'var(--status-warning)';
    titleEl.textContent = title;
    body.innerHTML = `<p style="font-size:var(--text-base);color:var(--text-secondary);line-height:1.6;">${message}</p>`;
    footer.innerHTML = `
      <button class="btn btn-secondary" id="confirmCancelBtn">Cancel</button>
      <button class="btn btn-danger" id="confirmOkBtn">Confirm</button>
    `;

    overlay.classList.add('open');

    document.getElementById('confirmCancelBtn').onclick = () => {
      overlay.classList.remove('open');
    };

    document.getElementById('confirmOkBtn').onclick = () => {
      overlay.classList.remove('open');
      if (onConfirm) onConfirm();
    };

    document.getElementById('crudModalClose').onclick = () => {
      overlay.classList.remove('open');
    };
  }

  // ── Empty State ──
  function emptyState(icon, title, description, actionLabel = null, onAction = null) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">${icon}</div>
        <h3>${title}</h3>
        <p>${description}</p>
        ${actionLabel ? `<button class="btn btn-primary" onclick="${onAction}">${actionLabel}</button>` : ''}
      </div>
    `;
  }

  // ── Page breadcrumb ──
  function buildBreadcrumb(items) {
    return `
      <nav class="breadcrumb" aria-label="Breadcrumb">
        ${items.map((item, i) => `
          <div class="breadcrumb-item ${i === items.length - 1 ? 'active' : ''}">
            ${i > 0 ? '<span class="breadcrumb-separator">›</span>' : ''}
            ${item.href && i < items.length - 1
              ? `<a href="${item.href}" data-page="${item.page || ''}">${item.label}</a>`
              : `<span>${item.label}</span>`
            }
          </div>
        `).join('')}
      </nav>
    `;
  }

  // ── Avatar ──
  function buildAvatar(name, size = 'md', extraClass = '') {
    const initials = Utils.getInitials(name);
    const color = Utils.getAvatarColor(name);
    return `<div class="avatar avatar-${size} avatar-${color} ${extraClass}">${initials}</div>`;
  }

  // ── Animate stat cards on load ──
  function animateStatCards() {
    document.querySelectorAll('.stat-card-value[data-target]').forEach(el => {
      const target = parseFloat(el.dataset.target) || 0;
      const isCurrency = el.dataset.currency === 'true';
      Utils.animateNumber(el, 0, target, 900);
    });
  }

  // ── Tab system ──
  function initTabs(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.querySelectorAll('.tab-btn, .modal-tab, .drawer-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabGroup = btn.dataset.tabGroup || btn.closest('[data-tab-group]')?.dataset.tabGroup;
        const targetId = btn.dataset.tab;

        // Deactivate all in group
        const scope = tabGroup
          ? document.querySelectorAll(`[data-tab-group="${tabGroup}"] .tab-btn, [data-tab-group="${tabGroup}"] .modal-tab`)
          : container.querySelectorAll('.tab-btn, .modal-tab, .drawer-tab');

        scope.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Show/hide content
        const allContent = tabGroup
          ? document.querySelectorAll(`[data-tab-content][data-tab-group="${tabGroup}"]`)
          : container.querySelectorAll('.modal-tab-content, .drawer-tab-content, .tab-content');

        allContent.forEach(c => {
          c.classList.toggle('active', c.id === targetId || c.dataset.tabId === targetId);
        });
      });
    });
  }

  // ── Table sort ──
  function initTableSort(tableId, data, renderFn) {
    const table = document.getElementById(tableId);
    if (!table) return;

    let sortKey = null;
    let sortDir = 'asc';

    table.querySelectorAll('th.sortable').forEach(th => {
      th.addEventListener('click', () => {
        const key = th.dataset.sort;
        if (sortKey === key) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        else { sortKey = key; sortDir = 'asc'; }

        table.querySelectorAll('th').forEach(t => {
          t.classList.remove('sorted');
          const icon = t.querySelector('.sort-icon');
          if (icon) icon.textContent = '↕';
        });
        th.classList.add('sorted');
        const icon = th.querySelector('.sort-icon');
        if (icon) icon.textContent = sortDir === 'asc' ? '↑' : '↓';

        const sorted = Utils.sortBy(data, sortKey, sortDir);
        renderFn(sorted);
      });
    });
  }

  return {
    toast, showSkeleton, showCardSkeleton,
    getSidebarState, setSidebarCollapsed, toggleSidebar, initSidebar,
    initSubmenus, setActiveNav,
    createDropdown, confirm, emptyState,
    buildBreadcrumb, buildAvatar, animateStatCards,
    initTabs, initTableSort,
  };
})();
