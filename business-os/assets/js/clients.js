/* ============================================================
   CLIENTS.JS — Client Management Module
   ============================================================ */

const Clients = (() => {

  let _clients = [];
  let _filtered = [];
  let _currentPage = 1;
  let _pageSize = 10;
  let _sortKey = 'name';
  let _sortDir = 'asc';
  let _filterStatus = '';
  let _searchQuery = '';
  let _viewMode = 'table'; // 'table' | 'grid'

  function getClients() {
    _clients = Storage.getAll('clients');
    return _clients;
  }

  function renderPage() {
    getClients();
    applyFilters();

    const html = `
      ${UI.buildBreadcrumb([{ label: 'Dashboard', href: '#dashboard', page: 'dashboard' }, { label: 'Clients' }])}
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Clients</h1>
          <p class="page-subtitle">${_clients.length} total clients • ${_clients.filter(c => c.status === 'active').length} active</p>
        </div>
        <div class="page-header-right">
          <button class="btn btn-secondary btn-sm" onclick="Clients.exportCSV()">⬇ Export</button>
          <button class="btn btn-primary" onclick="Clients.openCreateModal()">+ New Client</button>
        </div>
      </div>

      <div class="stats-row stagger-children" id="clientStats"></div>

      <div class="table-container">
        <div class="table-toolbar">
          <div class="table-toolbar-left">
            <div class="table-search-wrapper">
              <span class="table-search-icon">🔍</span>
              <input type="text" class="table-search-input" id="clientSearch" placeholder="Search clients..." value="${_searchQuery}" />
            </div>
            <select class="filter-select" id="clientStatusFilter">
              <option value="">All Status</option>
              <option value="active" ${_filterStatus === 'active' ? 'selected' : ''}>Active</option>
              <option value="inactive" ${_filterStatus === 'inactive' ? 'selected' : ''}>Inactive</option>
            </select>
            <select class="filter-select" id="clientIndustryFilter">
              <option value="">All Industries</option>
              ${[...new Set(_clients.map(c => c.industry))].map(i => `<option value="${i}">${i}</option>`).join('')}
            </select>
          </div>
          <div class="table-toolbar-right">
            <button class="btn btn-ghost btn-icon btn-sm" onclick="Clients.setView('table')" data-tooltip="Table view" id="viewTableBtn">☰</button>
            <button class="btn btn-ghost btn-icon btn-sm" onclick="Clients.setView('grid')" data-tooltip="Grid view" id="viewGridBtn">⊞</button>
          </div>
        </div>

        <div id="clientsContent"></div>
        <div class="pagination" id="clientPagination"></div>
      </div>
    `;

    Utils.renderPage(html);
    renderStats();
    renderContent();
    bindEvents();
  }

  function renderStats() {
    const active = _clients.filter(c => c.status === 'active').length;
    const totalRevenue = Utils.sumBy(_clients, 'totalRevenue');
    const outstanding = Utils.sumBy(_clients, 'outstandingAmount');
    const newThisMonth = _clients.filter(c => {
      const d = new Date(c.joinDate);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const el = document.getElementById('clientStats');
    if (!el) return;
    el.innerHTML = `
      ${statCard('Total Clients', _clients.length, '👥', 'blue', '+' + newThisMonth + ' this month', 'up')}
      ${statCard('Active Clients', active, '✓', 'green', `${_clients.length ? Math.round(active/_clients.length*100) : 0}% active rate`, 'up')}
      ${statCard('Total Revenue', Utils.formatCurrency(totalRevenue, 'USD', true), '💰', 'gold', 'Across all clients', 'neutral')}
      ${statCard('Outstanding', Utils.formatCurrency(outstanding, 'USD', true), '⏳', 'red', 'Pending collection', 'down')}
    `;
  }

  function statCard(title, value, icon, color, change, dir) {
    return `
      <div class="stat-card">
        <div class="stat-card-header">
          <span class="stat-card-title">${title}</span>
          <div class="stat-card-icon ${color}">${icon}</div>
        </div>
        <div class="stat-card-value">${value}</div>
        <div class="stat-card-change ${dir}">
          ${dir === 'up' ? '↑' : dir === 'down' ? '↓' : '→'} ${change}
        </div>
      </div>
    `;
  }

  function applyFilters() {
    let data = [..._clients];
    if (_searchQuery) {
      data = Utils.searchFilter(data, _searchQuery, ['name', 'company', 'email', 'phone', 'industry']);
    }
    if (_filterStatus) data = data.filter(c => c.status === _filterStatus);
    data = Utils.sortBy(data, _sortKey, _sortDir);
    _filtered = data;
  }

  function renderContent() {
    const container = document.getElementById('clientsContent');
    if (!container) return;

    const start = (_currentPage - 1) * _pageSize;
    const paged = _filtered.slice(start, start + _pageSize);

    if (_filtered.length === 0) {
      container.innerHTML = UI.emptyState('👥', 'No clients found', 'Try adjusting your search or filters, or add your first client.', '+ Add Client', 'Clients.openCreateModal()');
      document.getElementById('clientPagination').innerHTML = '';
      return;
    }

    if (_viewMode === 'grid') {
      container.innerHTML = `<div class="clients-grid" style="padding:var(--space-4);">${paged.map(renderClientCard).join('')}</div>`;
    } else {
      container.innerHTML = renderTable(paged);
    }
    renderPagination();
    addRowListeners();
  }

  function renderTable(clients) {
    return `
      <div class="table-wrapper">
        <table class="data-table" id="clientsTable">
          <thead>
            <tr>
              <th class="col-check"><input type="checkbox" class="table-checkbox" id="selectAllClients" /></th>
              <th class="sortable" data-sort="name">Name <span class="sort-icon">↕</span></th>
              <th class="sortable" data-sort="company">Company <span class="sort-icon">↕</span></th>
              <th class="sortable" data-sort="industry">Industry <span class="sort-icon">↕</span></th>
              <th class="sortable" data-sort="totalRevenue">Revenue <span class="sort-icon">↕</span></th>
              <th>Status</th>
              <th>Projects</th>
              <th class="sortable" data-sort="lastActivity">Last Activity <span class="sort-icon">↕</span></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${clients.map(c => `
              <tr data-id="${c.id}" class="client-row">
                <td class="col-check"><input type="checkbox" class="table-checkbox row-check" data-id="${c.id}" /></td>
                <td>
                  <div class="cell-name">
                    ${UI.buildAvatar(c.name, 'sm')}
                    <div>
                      <div class="cell-name-text">${c.name}</div>
                      <div class="cell-name-sub">${c.email}</div>
                    </div>
                  </div>
                </td>
                <td>${c.company || '—'}</td>
                <td><span class="badge badge-neutral">${c.industry || '—'}</span></td>
                <td class="cell-amount">${Utils.formatCurrency(c.totalRevenue, 'USD', true)}</td>
                <td>${Utils.getStatusBadge(c.status)}</td>
                <td>${c.totalProjects || 0}</td>
                <td class="cell-date">${Utils.formatRelativeTime(c.lastActivity)}</td>
                <td>
                  <div class="cell-actions">
                    <button class="cell-action-btn" onclick="event.stopPropagation();Clients.openDrawer('${c.id}')" data-tooltip="View">👁</button>
                    <button class="cell-action-btn" onclick="event.stopPropagation();Clients.openEditModal('${c.id}')" data-tooltip="Edit">✏️</button>
                    <button class="cell-action-btn danger" onclick="event.stopPropagation();Clients.deleteClient('${c.id}')" data-tooltip="Delete">🗑</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderClientCard(c) {
    const color = Utils.getAvatarColor(c.name);
    const initials = Utils.getInitials(c.name);
    return `
      <div class="client-card" data-id="${c.id}" onclick="Clients.openDrawer('${c.id}')">
        <button class="favorite-btn ${c.isFavorite ? 'active' : ''}" onclick="event.stopPropagation();Clients.toggleFavorite('${c.id}')">★</button>
        <div class="client-card-header">
          <div class="avatar avatar-md avatar-${color}">${initials}</div>
          <div class="client-card-info">
            <div class="client-card-name">${c.name}</div>
            <div class="client-card-company">${c.company}</div>
          </div>
          ${Utils.getStatusBadge(c.status)}
        </div>
        <div class="client-card-body">
          <div class="client-card-row">📧 <span>${Utils.truncate(c.email, 28)}</span></div>
          <div class="client-card-row">📞 <span>${c.phone}</span></div>
          <div class="client-card-row">🏭 <span>${c.industry}</span></div>
        </div>
        <div class="client-card-stats">
          <div class="client-card-stat">
            <div class="client-card-stat-val">${c.totalProjects}</div>
            <div class="client-card-stat-lbl">Projects</div>
          </div>
          <div class="client-card-stat">
            <div class="client-card-stat-val">${Utils.formatCurrency(c.totalRevenue,'USD',true)}</div>
            <div class="client-card-stat-lbl">Revenue</div>
          </div>
          <div class="client-card-stat">
            <div class="client-card-stat-val">${Utils.formatCurrency(c.outstandingAmount,'USD',true)}</div>
            <div class="client-card-stat-lbl">Outstanding</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderPagination() {
    const el = document.getElementById('clientPagination');
    if (!el) return;
    const total = _filtered.length;
    const pages = Math.ceil(total / _pageSize);
    const start = (_currentPage - 1) * _pageSize + 1;
    const end = Math.min(_currentPage * _pageSize, total);

    el.innerHTML = `
      <div class="pagination-info">Showing ${start}–${end} of ${total} clients</div>
      <div class="pagination-controls">
        <button class="page-btn" onclick="Clients.goPage(${_currentPage - 1})" ${_currentPage <= 1 ? 'disabled' : ''}>‹</button>
        ${Array.from({ length: Math.min(pages, 7) }, (_, i) => {
          const p = i + 1;
          return `<button class="page-btn ${p === _currentPage ? 'active' : ''}" onclick="Clients.goPage(${p})">${p}</button>`;
        }).join('')}
        <button class="page-btn" onclick="Clients.goPage(${_currentPage + 1})" ${_currentPage >= pages ? 'disabled' : ''}>›</button>
      </div>
      <select class="page-size-select" onchange="Clients.setPageSize(this.value)">
        ${[10,25,50].map(s => `<option value="${s}" ${s === _pageSize ? 'selected' : ''}>${s} / page</option>`).join('')}
      </select>
    `;
  }

  function addRowListeners() {
    document.querySelectorAll('.client-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('button, input')) return;
        openDrawer(row.dataset.id);
      });
    });
  }

  function bindEvents() {
    const search = document.getElementById('clientSearch');
    if (search) search.addEventListener('input', Utils.debounce(e => {
      _searchQuery = e.target.value;
      _currentPage = 1;
      applyFilters();
      renderContent();
    }, 300));

    const statusFilter = document.getElementById('clientStatusFilter');
    if (statusFilter) statusFilter.addEventListener('change', e => {
      _filterStatus = e.target.value;
      _currentPage = 1;
      applyFilters();
      renderContent();
    });
  }

  // ── Drawer ──
  function openDrawer(id) {
    const client = Storage.getById('clients', id);
    if (!client) return;

    const projects = Storage.getAll('projects').filter(p => p.clientId === id);
    const invoices = Storage.getAll('invoices').filter(i => i.clientId === id);
    const payments = Storage.getAll('payments').filter(p => p.clientId === id);
    const docs = Storage.getAll('documents').filter(d => d.clientId === id);

    const overviewTab = `
      ${Drawer.buildStats([
        { value: projects.length, label: 'Projects' },
        { value: invoices.length, label: 'Invoices' },
        { value: Utils.formatCurrency(client.totalRevenue,'USD',true), label: 'Revenue' },
      ])}
      <div class="drawer-section">
        <div class="drawer-section-title">Contact Details</div>
        ${Drawer.buildDetailRows([
          { label: 'Email', value: `<a href="mailto:${client.email}">${client.email}</a>`, highlight: true },
          { label: 'Phone', value: client.phone },
          { label: 'Company', value: client.company },
          { label: 'Industry', value: client.industry },
          { label: 'Website', value: client.website ? `<a href="https://${client.website}" target="_blank">${client.website}</a>` : '—' },
        ])}
      </div>
      <div class="drawer-section">
        <div class="drawer-section-title">Address</div>
        ${Drawer.buildDetailRows([
          { label: 'Address', value: client.address },
          { label: 'City/State', value: `${client.city}, ${client.state}` },
          { label: 'Country', value: client.country },
        ])}
      </div>
      <div class="drawer-section">
        <div class="drawer-section-title">Tax Information</div>
        ${Drawer.buildDetailRows([
          { label: 'GST No.', value: `<code>${client.gst || '—'}</code>` },
          { label: 'PAN No.', value: `<code>${client.pan || '—'}</code>` },
        ])}
      </div>
    `;

    const projectsTab = projects.length ? `
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${projects.slice(0, 8).map(p => `
          <div class="recent-item">
            <div style="width:8px;height:8px;border-radius:50%;background:var(--accent-primary);flex-shrink:0;margin-top:3px;"></div>
            <div class="recent-item-body">
              <div class="recent-item-name">${p.name}</div>
              <div class="recent-item-meta">${Utils.getStatusBadge(p.status)} • ${Utils.formatDate(p.deadline)}</div>
            </div>
            <div class="recent-item-value">${p.progress}%</div>
          </div>
        `).join('')}
      </div>
    ` : UI.emptyState('🚀', 'No Projects', 'No projects associated with this client yet.');

    const invoicesTab = invoices.length ? `
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${invoices.slice(0, 8).map(i => `
          <div class="recent-item">
            <div class="recent-item-body">
              <div class="recent-item-name">${i.number}</div>
              <div class="recent-item-meta">${Utils.getStatusBadge(i.status)} • Due ${Utils.formatDate(i.dueDate)}</div>
            </div>
            <div class="recent-item-value">${Utils.formatCurrency(i.total)}</div>
          </div>
        `).join('')}
      </div>
    ` : UI.emptyState('📄', 'No Invoices', 'No invoices for this client yet.');

    const timelineItems = [
      { title: 'Client Added', desc: 'Added to Business OS', time: Utils.formatDate(client.joinDate), active: false },
      ...projects.slice(0,3).map(p => ({ title: `Project: ${p.name}`, desc: p.status, time: Utils.formatDate(p.startDate), active: p.status === 'in-progress' })),
      { title: 'Last Activity', desc: 'Recent interaction', time: Utils.formatRelativeTime(client.lastActivity), active: true },
    ];

    Drawer.open({
      title: client.name,
      subtitle: `${client.company} • ${client.industry}`,
      avatar: { initials: Utils.getInitials(client.name), color: Utils.getAvatarColor(client.name) },
      record: client,
      type: 'client',
      tabs: [
        { id: 'overview', label: 'Overview', icon: '📋', content: overviewTab },
        { id: 'projects', label: `Projects (${projects.length})`, icon: '🚀', content: projectsTab },
        { id: 'invoices', label: `Invoices (${invoices.length})`, icon: '📄', content: invoicesTab },
        { id: 'timeline', label: 'Timeline', icon: '⏱', content: Drawer.buildTimeline(timelineItems) },
      ],
      onEdit: () => { Drawer.close(); openEditModal(id); },
      onDelete: () => { Drawer.close(); deleteClient(id); },
    });
  }

  // ── CRUD Modal ──
  function openCreateModal() {
    Modal.open({
      title: 'Add New Client',
      icon: '👤',
      size: 'modal-lg',
      body: buildClientForm(),
      onSave: () => saveClient(null),
    });
  }

  function openEditModal(id) {
    const client = Storage.getById('clients', id);
    if (!client) return;
    Modal.open({
      title: 'Edit Client',
      icon: '✏️',
      size: 'modal-lg',
      body: buildClientForm(client),
      saveLabel: 'Update Client',
      onSave: () => saveClient(id),
    });
  }

  function buildClientForm(client = {}) {
    return `
      <div class="form-section">
        <div class="form-section-title">👤 Personal Information</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Full Name <span class="required">*</span></label>
            <input type="text" name="name" class="form-input" value="${client.name || ''}" placeholder="John Smith" required />
          </div>
          <div class="form-group">
            <label class="form-label">Email Address <span class="required">*</span></label>
            <input type="email" name="email" class="form-input" value="${client.email || ''}" placeholder="john@company.com" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="tel" name="phone" class="form-input" value="${client.phone || ''}" placeholder="+1 (555) 000-0000" />
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select name="status" class="form-select">
              <option value="active" ${client.status === 'active' ? 'selected' : ''}>Active</option>
              <option value="inactive" ${client.status === 'inactive' ? 'selected' : ''}>Inactive</option>
            </select>
          </div>
        </div>
      </div>
      <div class="form-section">
        <div class="form-section-title">🏢 Business Details</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Company Name</label>
            <input type="text" name="company" class="form-input" value="${client.company || ''}" placeholder="Company Inc." />
          </div>
          <div class="form-group">
            <label class="form-label">Industry</label>
            <select name="industry" class="form-select">
              ${['Technology','Finance','Healthcare','Manufacturing','Retail','Education','Real Estate','Media','Consulting','Energy'].map(i =>
                `<option value="${i}" ${client.industry === i ? 'selected' : ''}>${i}</option>`
              ).join('')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">GST Number</label>
            <input type="text" name="gst" class="form-input" value="${client.gst || ''}" placeholder="GST Registration Number" />
          </div>
          <div class="form-group">
            <label class="form-label">PAN Number</label>
            <input type="text" name="pan" class="form-input" value="${client.pan || ''}" placeholder="PAN Card Number" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Website</label>
          <input type="text" name="website" class="form-input" value="${client.website || ''}" placeholder="www.company.com" />
        </div>
      </div>
      <div class="form-section">
        <div class="form-section-title">📍 Address</div>
        <div class="form-group">
          <label class="form-label">Street Address</label>
          <input type="text" name="address" class="form-input" value="${client.address || ''}" placeholder="123 Main Street" />
        </div>
        <div class="form-row-3">
          <div class="form-group">
            <label class="form-label">City</label>
            <input type="text" name="city" class="form-input" value="${client.city || ''}" placeholder="New York" />
          </div>
          <div class="form-group">
            <label class="form-label">State</label>
            <input type="text" name="state" class="form-input" value="${client.state || ''}" placeholder="NY" />
          </div>
          <div class="form-group">
            <label class="form-label">Country</label>
            <input type="text" name="country" class="form-input" value="${client.country || 'USA'}" placeholder="USA" />
          </div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Notes <span class="optional">(optional)</span></label>
        <textarea name="notes" class="form-textarea" rows="3" placeholder="Additional notes about this client...">${client.notes || ''}</textarea>
      </div>
    `;
  }

  function saveClient(editId) {
    const fields = [{ name: 'name', label: 'Name' }, { name: 'email', label: 'Email' }];
    if (!Modal.validateRequired(fields)) return false;

    const data = Modal.getFormData();
    if (!data.name.trim() || !data.email.trim()) return false;

    if (editId) {
      Storage.update('clients', editId, data);
      UI.toast(`Client "${data.name}" updated successfully.`, 'success');
    } else {
      const newClient = Storage.create('clients', {
        ...data,
        totalRevenue: 0, totalProjects: 0, totalInvoices: 0, outstandingAmount: 0,
        isFavorite: false, joinDate: Utils.todayISO(), lastActivity: Utils.todayISO(),
        avatar: Utils.getAvatarColor(data.name),
        tags: [],
      });
      Notifications.add({ type: 'client', icon: '👤', title: 'New Client Added', message: `${newClient.name} from ${newClient.company || 'Unknown Company'} has been added.` });
      UI.toast(`Client "${data.name}" created successfully!`, 'success');
    }

    renderPage();
    return true;
  }

  function deleteClient(id) {
    const client = Storage.getById('clients', id);
    if (!client) return;
    UI.confirm(
      `Are you sure you want to delete client <strong>${client.name}</strong>? This action cannot be undone.`,
      'Delete Client',
      () => {
        Storage.del('clients', id);
        UI.toast(`Client "${client.name}" deleted.`, 'success');
        renderPage();
      }
    );
  }

  function toggleFavorite(id) {
    const client = Storage.getById('clients', id);
    if (!client) return;
    Storage.update('clients', id, { isFavorite: !client.isFavorite });
    renderPage();
    UI.toast(client.isFavorite ? 'Removed from favorites' : 'Added to favorites ★', 'info');
  }

  function setView(mode) {
    _viewMode = mode;
    renderContent();
  }

  function goPage(page) {
    const pages = Math.ceil(_filtered.length / _pageSize);
    if (page < 1 || page > pages) return;
    _currentPage = page;
    renderContent();
    document.querySelector('.app-main').scrollTo(0, 0);
  }

  function setPageSize(size) {
    _pageSize = parseInt(size);
    _currentPage = 1;
    renderContent();
  }

  function exportCSV() {
    const data = _filtered.map(c => ({
      Name: c.name, Company: c.company, Email: c.email, Phone: c.phone,
      Industry: c.industry, Status: c.status, Revenue: c.totalRevenue, City: c.city,
    }));
    Utils.downloadCSV(data, 'clients-export.csv');
    UI.toast('Clients exported to CSV.', 'success');
  }

  return { renderPage, openCreateModal, openEditModal, openDrawer, deleteClient, toggleFavorite, setView, goPage, setPageSize, exportCSV };
})();
