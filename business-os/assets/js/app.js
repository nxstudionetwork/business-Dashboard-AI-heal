/* ============================================================
   APP.JS — Application Initialization
   ============================================================ */

const App = (() => {
  const quickActions = [
    { icon: '👥', title: 'New Client', action: () => { Router.navigate('clients'); setTimeout(() => Clients.openCreateModal(), 250); } },
    { icon: '🚀', title: 'New Project', action: () => { Router.navigate('projects'); setTimeout(() => Projects.openCreateModal(), 250); } },
    { icon: '📄', title: 'New Invoice', action: () => { Router.navigate('invoices'); setTimeout(() => Invoices.openCreateModal(), 250); } },
    { icon: '💸', title: 'New Expense', action: () => { Router.navigate('expenses'); setTimeout(() => Payments.openExpenseModal(), 250); } },
    { icon: '📝', title: 'New Note', action: () => { Router.navigate('notes'); setTimeout(() => Notes.createNote(), 250); } },
    { icon: '📁', title: 'Upload Document', action: () => { Router.navigate('documents'); setTimeout(() => Documents.openUploadModal(), 250); } },
  ];

  function initQuickAdd() {
    const grid = document.getElementById('quickAddGrid');
    const overlay = document.getElementById('quickAddOverlay');
    const openBtn = document.getElementById('quickAddBtn');
    const closeBtn = document.getElementById('quickAddClose');

    if (grid) {
      grid.innerHTML = quickActions.map((action, index) => `
        <button type="button" class="quick-add-card" data-quick-action="${index}">
          <span class="quick-add-icon">${action.icon}</span>
          <span class="quick-add-title">${action.title}</span>
        </button>
      `).join('');
      grid.querySelectorAll('button[data-quick-action]').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.dataset.quickAction, 10);
          const action = quickActions[index];
          if (action) {
            overlay?.classList.remove('open');
            action.action();
          }
        });
      });
    }

    openBtn?.addEventListener('click', () => overlay?.classList.add('open'));
    closeBtn?.addEventListener('click', () => overlay?.classList.remove('open'));
    overlay?.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });

    const fab = document.getElementById('floatingFab');
    if (fab) {
      fab.style.display = 'flex';
      fab.addEventListener('click', () => overlay?.classList.add('open'));
    }
  }

  function initSidebarToggle() {
    const toggle = document.getElementById('sidebarToggle');
    toggle?.addEventListener('click', UI.toggleSidebar);
  }

  function initBranchSelector() {
    const branchBtn = document.getElementById('branchBtn');
    if (!branchBtn) return;

    branchBtn.addEventListener('click', () => {
      UI.createDropdown(branchBtn, [
        { label: 'Main Office', value: 'main' },
        { label: 'Remote Office', value: 'remote' },
        { label: 'Field Team', value: 'field' },
      ], (selection) => {
        branchBtn.querySelector('span:last-child').textContent = `▾ ${selection.label}`;
      });
    });
  }

  function initLogout() {
    document.getElementById('logoutBtn')?.addEventListener('click', Auth.logout);
  }

  function init() {
    if (!Auth.requireAuth()) return;
    Storage.initSeedData();
    UI.initSidebar();
    UI.initSubmenus();
    Search.init();
    Notifications.init();
    Drawer.init();
    initQuickAdd();
    initSidebarToggle();
    initBranchSelector();
    initLogout();
    Router.init();
  }

  return { init };
})();

window.addEventListener('DOMContentLoaded', App.init);
