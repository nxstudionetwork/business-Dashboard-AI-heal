/* ============================================================
   NOTIFICATIONS.JS — Notification System
   ============================================================ */

const Notifications = (() => {

  function getAll() {
    return Storage.get('notifications') || generateDefaultNotifs();
  }

  function generateDefaultNotifs() {
    const notifs = [
      { id: 'n1', type: 'payment', icon: '💰', title: 'Payment Received', message: 'Payment of $12,500 received from TechVision Inc.', read: false, time: new Date(Date.now() - 15 * 60000).toISOString(), link: 'payments' },
      { id: 'n2', type: 'invoice', icon: '📄', title: 'Invoice Overdue', message: 'Invoice INV-2024003 is 5 days overdue. Amount: $8,200.', read: false, time: new Date(Date.now() - 2 * 3600000).toISOString(), link: 'invoices' },
      { id: 'n3', type: 'project', icon: '🚀', title: 'Project Deadline', message: 'Website Redesign project deadline is in 3 days.', read: false, time: new Date(Date.now() - 5 * 3600000).toISOString(), link: 'projects' },
      { id: 'n4', type: 'lead', icon: '🎯', title: 'New Lead', message: 'New lead from LinkedIn: Sarah Connor at Apex Corp.', read: true, time: new Date(Date.now() - 24 * 3600000).toISOString(), link: 'leads' },
      { id: 'n5', type: 'system', icon: '⚙️', title: 'System Update', message: 'Business OS has been updated to v2.1.0 with new features.', read: true, time: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), link: null },
    ];
    Storage.set('notifications', notifs);
    return notifs;
  }

  function getUnreadCount() {
    return getAll().filter(n => !n.read).length;
  }

  function markRead(id) {
    const notifs = getAll();
    const idx = notifs.findIndex(n => n.id === id);
    if (idx !== -1) {
      notifs[idx].read = true;
      Storage.set('notifications', notifs);
      updateBadge();
    }
  }

  function markAllRead() {
    const notifs = getAll().map(n => ({ ...n, read: true }));
    Storage.set('notifications', notifs);
    updateBadge();
  }

  function add(notif) {
    const notifs = getAll();
    notifs.unshift({
      id: Utils.generateId('notif'),
      ...notif,
      read: false,
      time: new Date().toISOString(),
    });
    Storage.set('notifications', notifs.slice(0, 50)); // max 50
    updateBadge();
    render();
  }

  function updateBadge() {
    const badge = document.getElementById('notifBadge');
    const count = getUnreadCount();
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? '' : 'none';
    }
  }

  function render() {
    const list = document.getElementById('notifList');
    if (!list) return;
    const notifs = getAll();

    if (notifs.length === 0) {
      list.innerHTML = `
        <div style="padding:2rem;text-align:center;color:var(--text-muted);">
          <div style="font-size:2rem;margin-bottom:1rem;">🔔</div>
          <p>No notifications</p>
        </div>
      `;
      return;
    }

    list.innerHTML = notifs.map(n => `
      <div class="notif-item ${!n.read ? 'unread' : ''}" data-notif-id="${n.id}" onclick="Notifications.handleClick('${n.id}', '${n.link || ''}')">
        <div class="notif-item-body">
          <div class="notif-icon" style="background: ${getTypeColor(n.type)};">${n.icon || '🔔'}</div>
          <div class="notif-content">
            <div class="notif-title">
              <span>${n.title}</span>
              ${!n.read ? '<span class="notif-badge-dot"></span>' : ''}
            </div>
            <p class="notif-message">${n.message}</p>
            <span class="notif-time">${Utils.formatRelativeTime(n.time)}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  function getTypeColor(type) {
    const colors = {
      payment: 'rgba(0,217,126,0.12)',
      invoice: 'rgba(255,71,87,0.12)',
      project: 'rgba(77,166,255,0.12)',
      lead:    'rgba(245,197,66,0.12)',
      system:  'rgba(155,89,182,0.12)',
    };
    return colors[type] || 'rgba(255,255,255,0.06)';
  }

  function handleClick(id, link) {
    markRead(id);
    render();
    updateBadge();
    if (link) {
      closePanel();
      Router.navigate(link);
    }
  }

  function openPanel() {
    const overlay = document.getElementById('notifOverlay');
    if (overlay) {
      render();
      overlay.classList.add('open');
    }
  }

  function closePanel() {
    const overlay = document.getElementById('notifOverlay');
    if (overlay) overlay.classList.remove('open');
  }

  function init() {
    updateBadge();

    const btn = document.getElementById('notifBtn');
    const overlay = document.getElementById('notifOverlay');
    const closeBtn = document.getElementById('notifClose');
    const markAllBtn = document.getElementById('markAllReadBtn');

    if (btn) btn.addEventListener('click', () => openPanel());
    if (closeBtn) closeBtn.addEventListener('click', closePanel);
    if (overlay) overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePanel();
    });
    if (markAllBtn) markAllBtn.addEventListener('click', () => {
      markAllRead();
      render();
    });
  }

  return { getAll, getUnreadCount, markRead, markAllRead, add, updateBadge, render, init, handleClick, openPanel, closePanel };
})();
