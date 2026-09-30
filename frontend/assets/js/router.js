/* ============================================================
   ROUTER.JS — Client-side Hash Routing
   ============================================================ */

const Router = (() => {
  const routes = {
    dashboard: Dashboard.renderPage,
    leads: Leads.renderPage,
    clients: Clients.renderPage,
    projects: Projects.renderPage,
    quotations: Quotations.renderPage,
    invoices: Invoices.renderPage,
    payments: Payments.renderPage,
    expenses: Payments.renderExpensesPage,
    documents: Documents.renderPage,
    calendar: Calendar.renderPage,
    notes: Notes.renderPage,
    reports: Reports.renderPage,
    settings: Settings.renderPage,
  };

  function getPageFromHash(hash = window.location.hash) {
    const page = hash.startsWith('#') ? hash.slice(1) : hash;
    return page || 'dashboard';
  }

  function navigate(page) {
    const target = page.startsWith('#') ? page : `#${page}`;
    if (window.location.hash !== target) {
      window.location.hash = target;
    } else {
      render();
    }
  }

  function renderNotFound(page) {
    Utils.renderPage(`
      <div class="page-container">
        <div class="page-header">
          <div class="page-header-left">
            <h1 class="page-title">Page not found</h1>
            <p class="page-subtitle">The page “${page}” does not exist or has not been built yet.</p>
          </div>
        </div>
      </div>
    `);
  }

  function render() {
    const page = getPageFromHash();
    const route = routes[page];
    let timer = setTimeout(() => Utils.showPageSkeleton(), 100);
    if (route) {
      requestAnimationFrame(() => { clearTimeout(timer); route(); });
    } else {
      requestAnimationFrame(() => { clearTimeout(timer); renderNotFound(page); });
    }
    UI.setActiveNav(page);
  }

  function init() {
    window.addEventListener('hashchange', render);
    render();
  }

  return { navigate, init, render, getCurrentPage: () => getPageFromHash() };
})();
