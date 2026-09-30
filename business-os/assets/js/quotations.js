/* ============================================================
   QUOTATIONS.JS — Quotations Module
   ============================================================ */

const Quotations = (() => {
  let _quotations = [];
  let _filtered = [];
  let _search = '';
  let _status = '';
  let _currentPage = 1;
  const PAGE_SIZE = 10;
  const STATUSES = ['draft', 'sent', 'accepted', 'declined', 'expired'];

  function getQuotations() {
    _quotations = Storage.getAll('quotations');
    return _quotations;
  }

  function renderPage() {
    getQuotations();
    applyFilters();
    const total = Utils.sumBy(_quotations, 'total');
    const sent = _quotations.filter(q => q.status === 'sent').length;
    const draft = _quotations.filter(q => q.status === 'draft').length;

    Utils.renderPage(`
      ${UI.buildBreadcrumb([{ label: 'Dashboard', href: '#dashboard', page: 'dashboard' }, { label: 'Projects' }, { label: 'Quotations' }])}
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Quotations</h1>
          <p class="page-subtitle">${_quotations.length} quotes • ${sent} sent • ${draft} drafts</p>
        </div>
        <div class="page-header-right">
          <button class="btn btn-secondary btn-sm" onclick="Quotations.exportCSV()">⬇ Export</button>
          <button class="btn btn-primary" onclick="Quotations.openCreateModal()">+ New Quote</button>
        </div>
      </div>
      <div class="stats-row stagger-children">
        <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">Total Value</span><div class="stat-card-icon green">💰</div></div><div class="stat-card-value">${Utils.formatCurrency(total, 'USD', true)}</div><div class="stat-card-change neutral">All quotes</div></div>
        <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">Sent</span><div class="stat-card-icon blue">📤</div></div><div class="stat-card-value">${sent}</div><div class="stat-card-change up">Ready for review</div></div>
        <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">Drafts</span><div class="stat-card-icon purple">📝</div></div><div class="stat-card-value">${draft}</div><div class="stat-card-change neutral">Work in progress</div></div>
      </div>
      <div class="table-container">
        <div class="table-toolbar">
          <div class="table-toolbar-left">
            <div class="table-search-wrapper"><span class="table-search-icon">🔍</span>
              <input type="text" class="table-search-input" id="quoteSearch" placeholder="Search quotations..." value="${_search}" /></div>
            <select class="filter-select" id="quoteStatusFilter">
              <option value="">All Status</option>
              ${STATUSES.map(status => `<option value="${status}" ${_status === status ? 'selected' : ''}>${status.charAt(0).toUpperCase() + status.slice(1)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div id="quotationsContent"></div>
        <div class="pagination" id="quotePagination"></div>
      </div>
    `);

    bindEvents();
    renderContent();
  }

  function applyFilters() {
    _filtered = [..._quotations];
    if (_search) {
      _filtered = Utils.searchFilter(_filtered, _search, ['number', 'title', 'notes']);
    }
    if (_status) {
      _filtered = _filtered.filter(q => q.status === _status);
    }
  }

  function renderContent() {
    const container = document.getElementById('quotationsContent');
    if (!container) return;
    const start = (_currentPage - 1) * PAGE_SIZE;
    const pageQuotes = _filtered.slice(start, start + PAGE_SIZE);
    if (!_filtered.length) {
      container.innerHTML = UI.emptyState('📋', 'No quotations found', 'Create your first quote to send to clients.', '+ New Quote', 'Quotations.openCreateModal()');
      document.getElementById('quotePagination').innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>Number</th><th>Client</th><th>Title</th><th>Status</th><th>Total</th><th>Valid Until</th><th></th></tr></thead>
          <tbody>
            ${pageQuotes.map(q => {
              const client = Storage.getById('clients', q.clientId);
              return `<tr>
                <td>${q.number}</td>
                <td>${client ? client.name : '—'}</td>
                <td>${q.title}</td>
                <td>${Utils.getStatusBadge(q.status)}</td>
                <td>${Utils.formatCurrency(q.total)}</td>
                <td>${Utils.formatDate(q.validUntil)}</td>
                <td><div class="cell-actions"><button class="cell-action-btn" onclick="event.stopPropagation();Quotations.openEditModal('${q.id}')">✏️</button><button class="cell-action-btn danger" onclick="event.stopPropagation();Quotations.deleteQuotation('${q.id}')">🗑</button></div></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    const pages = Math.ceil(_filtered.length / PAGE_SIZE);
    const pagination = document.getElementById('quotePagination');
    if (pagination) {
      pagination.innerHTML = `
        <div class="pagination-info">Showing ${start + 1}–${Math.min(start + PAGE_SIZE, _filtered.length)} of ${_filtered.length}</div>
        <div class="pagination-controls">
          <button class="page-btn" onclick="Quotations.goPage(${_currentPage - 1})" ${_currentPage <= 1 ? 'disabled' : ''}>‹</button>
          ${Array.from({ length: Math.min(pages, 7) }, (_, i) => `<button class="page-btn ${i + 1 === _currentPage ? 'active' : ''}" onclick="Quotations.goPage(${i + 1})">${i + 1}</button>`).join('')}
          <button class="page-btn" onclick="Quotations.goPage(${_currentPage + 1})" ${_currentPage >= pages ? 'disabled' : ''}>›</button>
        </div>
      `;
    }
  }

  function bindEvents() {
    const search = document.getElementById('quoteSearch');
    const status = document.getElementById('quoteStatusFilter');
    if (search) {
      search.addEventListener('input', Utils.debounce(e => {
        _search = e.target.value;
        _currentPage = 1;
        applyFilters();
        renderContent();
      }, 250));
    }
    if (status) {
      status.addEventListener('change', e => {
        _status = e.target.value;
        _currentPage = 1;
        applyFilters();
        renderContent();
      });
    }
  }

  function openCreateModal() {
    const clients = Storage.getAll('clients');
    Modal.open({
      title: 'New Quotation',
      icon: '📋',
      body: `
        <div class="form-row">
          <div class="form-group"><label class="form-label">Client</label><select name="clientId" class="form-select"><option value="">Select client</option>${clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Title</label><input name="title" class="form-input" placeholder="Proposal title" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Status</label><select name="status" class="form-select">${STATUSES.map(status => `<option value="${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Valid Until</label><input name="validUntil" type="date" class="form-input" value="${Utils.todayISO()}" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Subtotal</label><input name="subtotal" type="number" class="form-input" placeholder="0" /></div>
          <div class="form-group"><label class="form-label">Tax %</label><input name="taxRate" type="number" class="form-input" value="18" /></div>
        </div>
        <div class="form-group"><label class="form-label">Notes</label><textarea name="notes" class="form-textarea" rows="3"></textarea></div>
      `,
      onSave: () => {
        const data = Modal.getFormData();
        const subtotal = parseFloat(data.subtotal) || 0;
        const taxRate = parseFloat(data.taxRate) || 0;
        const tax = Math.round(subtotal * (taxRate / 100));
        const total = subtotal + tax;
        const count = Storage.getAll('quotations').length;
        const number = `QUO-${2024000 + count + 1}`;
        Storage.create('quotations', {
          number,
          clientId: data.clientId || null,
          title: data.title || 'Untitled Quotation',
          status: data.status || 'draft',
          subtotal,
          tax,
          total,
          validUntil: data.validUntil || Utils.todayISO(),
          notes: data.notes || '',
          items: [],
        });
        UI.toast('Quotation created.', 'success');
        renderPage();
        return true;
      }
    });
  }

  function openEditModal(id) {
    const quote = Storage.getById('quotations', id);
    if (!quote) return;
    const clients = Storage.getAll('clients');
    Modal.open({
      title: 'Edit Quotation',
      icon: '✏️',
      body: `
        <div class="form-row">
          <div class="form-group"><label class="form-label">Client</label><select name="clientId" class="form-select"><option value="">Select client</option>${clients.map(c => `<option value="${c.id}" ${quote.clientId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Title</label><input name="title" class="form-input" value="${quote.title || ''}" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Status</label><select name="status" class="form-select">${STATUSES.map(status => `<option value="${status}" ${quote.status === status ? 'selected' : ''}>${status.charAt(0).toUpperCase() + status.slice(1)}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Valid Until</label><input name="validUntil" type="date" class="form-input" value="${quote.validUntil || Utils.todayISO()}" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Subtotal</label><input name="subtotal" type="number" class="form-input" value="${quote.subtotal || 0}" /></div>
          <div class="form-group"><label class="form-label">Tax %</label><input name="taxRate" type="number" class="form-input" value="${quote.tax ? Math.round((quote.tax / (quote.subtotal || 1)) * 100) : 18}" /></div>
        </div>
        <div class="form-group"><label class="form-label">Notes</label><textarea name="notes" class="form-textarea" rows="3">${quote.notes || ''}</textarea></div>
      `,
      saveLabel: 'Update Quote',
      onSave: () => {
        const data = Modal.getFormData();
        const subtotal = parseFloat(data.subtotal) || 0;
        const taxRate = parseFloat(data.taxRate) || 0;
        const tax = Math.round(subtotal * (taxRate / 100));
        const total = subtotal + tax;
        Storage.update('quotations', id, {
          clientId: data.clientId || null,
          title: data.title || 'Untitled Quotation',
          status: data.status || 'draft',
          subtotal,
          tax,
          total,
          validUntil: data.validUntil || Utils.todayISO(),
          notes: data.notes || '',
        });
        UI.toast('Quotation updated.', 'success');
        renderPage();
        return true;
      }
    });
  }

  function deleteQuotation(id) {
    const quote = Storage.getById('quotations', id);
    if (!quote) return;
    UI.confirm(`Delete quotation <strong>${quote.number}</strong>?`, 'Delete Quotation', () => {
      Storage.del('quotations', id);
      UI.toast('Quotation deleted.', 'success');
      renderPage();
    });
  }

  function goPage(page) {
    const pages = Math.ceil(_filtered.length / PAGE_SIZE);
    if (page < 1 || page > pages) return;
    _currentPage = page;
    renderContent();
  }

  function exportCSV() {
    Utils.downloadCSV(_filtered.map(q => ({ Number: q.number, Client: Storage.getById('clients', q.clientId)?.name || '', Status: q.status, Total: q.total, ValidUntil: q.validUntil })), 'quotations.csv');
    UI.toast('Quotations exported.', 'success');
  }

  return { renderPage, openCreateModal, openEditModal, deleteQuotation, goPage, exportCSV };
})();
