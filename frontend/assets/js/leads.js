/* ============================================================
   LEADS.JS — Leads & Opportunity Management
   ============================================================ */

const Leads = (() => {
  let _leads = [];
  let _filtered = [];
  let _search = '';
  let _filterStage = '';
  let _currentPage = 1;
  const PAGE_SIZE = 10;
  const STAGES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

  function getLeads() {
    _leads = Storage.getAll('leads');
    return _leads;
  }

  function renderPage() {
    getLeads();
    applyFilters();

    const active = _leads.filter(l => l.stage === 'proposal' || l.stage === 'contacted').length;
    const closed = _leads.filter(l => l.stage === 'won' || l.stage === 'lost').length;
    const newLeads = _leads.filter(l => l.stage === 'new').length;

    Utils.renderPage(`
      ${UI.buildBreadcrumb([{ label: 'Dashboard', href: '#dashboard', page: 'dashboard' }, { label: 'Leads' }])}
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Leads</h1>
          <p class="page-subtitle">${_leads.length} leads • ${active} active • ${closed} closed</p>
        </div>
        <div class="page-header-right">
          <button class="btn btn-secondary btn-sm" onclick="Leads.exportCSV()">⬇ Export</button>
          <button class="btn btn-primary" onclick="Leads.openCreateModal()">+ New Lead</button>
        </div>
      </div>
      <div class="stats-row stagger-children">
        <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">New Leads</span><div class="stat-card-icon purple">🎯</div></div><div class="stat-card-value">${newLeads}</div><div class="stat-card-change neutral">This pipeline</div></div>
        <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">In Progress</span><div class="stat-card-icon blue">📈</div></div><div class="stat-card-value">${active}</div><div class="stat-card-change up">Ongoing engagement</div></div>
        <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">Closed</span><div class="stat-card-icon green">✅</div></div><div class="stat-card-value">${closed}</div><div class="stat-card-change neutral">Won or lost</div></div>
      </div>
      <div class="table-container">
        <div class="table-toolbar">
          <div class="table-toolbar-left">
            <div class="table-search-wrapper"><span class="table-search-icon">🔍</span>
              <input type="text" class="table-search-input" id="leadSearch" placeholder="Search leads..." value="${_search}" /></div>
            <select class="filter-select" id="leadStageFilter">
              <option value="">All Stages</option>
              ${STAGES.map(stage => `<option value="${stage}" ${_filterStage === stage ? 'selected' : ''}>${stage.charAt(0).toUpperCase() + stage.slice(1)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div id="leadsContent"></div>
        <div class="pagination" id="leadPagination"></div>
      </div>
    `);

    bindEvents();
    renderContent();
  }

  function applyFilters() {
    _filtered = [..._leads];
    if (_search) {
      _filtered = Utils.searchFilter(_filtered, _search, ['name', 'company', 'email', 'source']);
    }
    if (_filterStage) {
      _filtered = _filtered.filter(lead => lead.stage === _filterStage);
    }
  }

  function renderContent() {
    const container = document.getElementById('leadsContent');
    if (!container) return;
    const start = (_currentPage - 1) * PAGE_SIZE;
    const pageLeads = _filtered.slice(start, start + PAGE_SIZE);

    if (!_filtered.length) {
      container.innerHTML = UI.emptyState('🎯', 'No leads found', 'Capture your next opportunity and grow your pipeline.', '+ New Lead', 'Leads.openCreateModal()');
      document.getElementById('leadPagination').innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr><th>Name</th><th>Company</th><th>Source</th><th>Stage</th><th>Value</th><th></th></tr>
          </thead>
          <tbody>
            ${pageLeads.map(lead => `
              <tr>
                <td>${lead.name}</td>
                <td>${lead.company || '—'}</td>
                <td>${lead.source || '—'}</td>
                <td>${Utils.getStatusBadge(lead.stage)}</td>
                <td>${Utils.formatCurrency(lead.value || 0)}</td>
                <td><div class="cell-actions"><button class="cell-action-btn" onclick="event.stopPropagation();Leads.openEditModal('${lead.id}')">✏️</button><button class="cell-action-btn danger" onclick="event.stopPropagation();Leads.deleteLead('${lead.id}')">🗑</button></div></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const pages = Math.ceil(_filtered.length / PAGE_SIZE);
    const pagination = document.getElementById('leadPagination');
    if (pagination) {
      pagination.innerHTML = `
        <div class="pagination-info">Showing ${start + 1}–${Math.min(start + PAGE_SIZE, _filtered.length)} of ${_filtered.length}</div>
        <div class="pagination-controls">
          <button class="page-btn" onclick="Leads.goPage(${_currentPage - 1})" ${_currentPage <= 1 ? 'disabled' : ''}>‹</button>
          ${Array.from({ length: Math.min(pages, 7) }, (_, i) => `<button class="page-btn ${i + 1 === _currentPage ? 'active' : ''}" onclick="Leads.goPage(${i + 1})">${i + 1}</button>`).join('')}
          <button class="page-btn" onclick="Leads.goPage(${_currentPage + 1})" ${_currentPage >= pages ? 'disabled' : ''}>›</button>
        </div>
      `;
    }
  }

  function bindEvents() {
    const search = document.getElementById('leadSearch');
    const stage = document.getElementById('leadStageFilter');
    if (search) {
      search.addEventListener('input', Utils.debounce(e => {
        _search = e.target.value;
        _currentPage = 1;
        applyFilters();
        renderContent();
      }, 250));
    }
    if (stage) {
      stage.addEventListener('change', e => {
        _filterStage = e.target.value;
        _currentPage = 1;
        applyFilters();
        renderContent();
      });
    }
  }

  function openCreateModal() {
    Modal.open({
      title: 'New Lead',
      icon: '🎯',
      body: `
        <div class="form-row">
          <div class="form-group"><label class="form-label">Name <span class="required">*</span></label><input name="name" class="form-input" required /></div>
          <div class="form-group"><label class="form-label">Company</label><input name="company" class="form-input" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Email</label><input name="email" type="email" class="form-input" /></div>
          <div class="form-group"><label class="form-label">Source</label><input name="source" class="form-input" placeholder="LinkedIn, Referral, Website" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Stage</label><select name="stage" class="form-select">${STAGES.map(stage => `<option value="${stage}">${stage.charAt(0).toUpperCase() + stage.slice(1)}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Estimated Value</label><input name="value" type="number" class="form-input" placeholder="0" /></div>
        </div>
      `,
      onSave: () => {
        if (!Modal.validateRequired([{ name: 'name', label: 'Name' }])) return false;
        const data = Modal.getFormData();
        data.value = parseFloat(data.value) || 0;
        Storage.create('leads', data);
        UI.toast('Lead created.', 'success');
        renderPage();
        return true;
      }
    });
  }

  function openEditModal(id) {
    const lead = Storage.getById('leads', id);
    if (!lead) return;
    Modal.open({
      title: 'Edit Lead',
      icon: '✏️',
      body: `
        <div class="form-row">
          <div class="form-group"><label class="form-label">Name</label><input name="name" class="form-input" value="${lead.name || ''}" /></div>
          <div class="form-group"><label class="form-label">Company</label><input name="company" class="form-input" value="${lead.company || ''}" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Email</label><input name="email" type="email" class="form-input" value="${lead.email || ''}" /></div>
          <div class="form-group"><label class="form-label">Source</label><input name="source" class="form-input" value="${lead.source || ''}" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Stage</label><select name="stage" class="form-select">${STAGES.map(stage => `<option value="${stage}" ${lead.stage === stage ? 'selected' : ''}>${stage.charAt(0).toUpperCase() + stage.slice(1)}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Estimated Value</label><input name="value" type="number" class="form-input" value="${lead.value || 0}" /></div>
        </div>
      `,
      saveLabel: 'Update Lead',
      onSave: () => {
        if (!Modal.validateRequired([{ name: 'name', label: 'Name' }])) return false;
        const data = Modal.getFormData();
        data.value = parseFloat(data.value) || 0;
        Storage.update('leads', id, data);
        UI.toast('Lead updated.', 'success');
        renderPage();
        return true;
      }
    });
  }

  function deleteLead(id) {
    const lead = Storage.getById('leads', id);
    if (!lead) return;
    UI.confirm(`Delete lead <strong>${lead.name}</strong>?`, 'Delete Lead', () => {
      Storage.del('leads', id);
      UI.toast('Lead deleted.', 'success');
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
    Utils.downloadCSV(_filtered.map(l => ({ Name: l.name, Company: l.company, Email: l.email, Stage: l.stage, Value: l.value })), 'leads.csv');
    UI.toast('Leads exported.', 'success');
  }

  return { renderPage, openCreateModal, openEditModal, deleteLead, goPage, exportCSV };
})();
