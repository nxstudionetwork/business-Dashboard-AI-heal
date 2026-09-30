/* ============================================================
   PROJECTS.JS — Project Management Module
   ============================================================ */

const Projects = (() => {
  let _projects = [];
  let _filtered = [];
  let _currentPage = 1;
  let _pageSize = 10;
  let _search = '';
  let _filterStatus = '';
  let _filterPriority = '';

  function getProjects() {
    _projects = Storage.getAll('projects');
    return _projects;
  }

  function renderPage() {
    getProjects();
    applyFilters();

    const html = `
      ${UI.buildBreadcrumb([{label:'Dashboard',href:'#dashboard',page:'dashboard'},{label:'Projects'}])}
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Projects</h1>
          <p class="page-subtitle">${_projects.length} total • ${_projects.filter(p => p.status === 'in-progress').length} in progress</p>
        </div>
        <div class="page-header-right">
          <button class="btn btn-secondary btn-sm" onclick="Projects.exportCSV()">⬇ Export</button>
          <button class="btn btn-primary" onclick="Projects.openCreateModal()">+ New Project</button>
        </div>
      </div>
      <div class="stats-row stagger-children" id="projectStats"></div>
      <div class="table-container">
        <div class="table-toolbar">
          <div class="table-toolbar-left">
            <div class="table-search-wrapper">
              <span class="table-search-icon">🔍</span>
              <input type="text" class="table-search-input" id="projectSearch" placeholder="Search projects..." />
            </div>
            <select class="filter-select" id="projectStatusFilter">
              <option value="">All Status</option>
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>
            <select class="filter-select" id="projectPriorityFilter">
              <option value="">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div class="table-toolbar-right">
            <button class="btn btn-ghost btn-sm" onclick="Projects.showPinned()">📌 Pinned</button>
          </div>
        </div>
        <div id="projectsContent"></div>
        <div class="pagination" id="projectPagination"></div>
      </div>
    `;

    Utils.renderPage(html);
    renderStats();
    renderContent();
    bindEvents();
  }

  function renderStats() {
    const el = document.getElementById('projectStats');
    if (!el) return;
    const active = _projects.filter(p => p.status === 'in-progress').length;
    const completed = _projects.filter(p => p.status === 'completed').length;
    const totalBudget = Utils.sumBy(_projects, 'budget');
    const overdue = _projects.filter(p => Utils.isOverdue(p.deadline) && p.status !== 'completed').length;

    el.innerHTML = `
      <div class="stat-card">
        <div class="stat-card-header"><span class="stat-card-title">Total Projects</span><div class="stat-card-icon blue">🚀</div></div>
        <div class="stat-card-value">${_projects.length}</div>
        <div class="stat-card-change neutral">→ ${active} active</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><span class="stat-card-title">In Progress</span><div class="stat-card-icon green">▶</div></div>
        <div class="stat-card-value">${active}</div>
        <div class="stat-card-change up">↑ On track</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><span class="stat-card-title">Completed</span><div class="stat-card-icon gold">✓</div></div>
        <div class="stat-card-value">${completed}</div>
        <div class="stat-card-change up">↑ ${_projects.length ? Math.round(completed/_projects.length*100) : 0}% completion rate</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><span class="stat-card-title">Total Budget</span><div class="stat-card-icon purple">💰</div></div>
        <div class="stat-card-value">${Utils.formatCurrency(totalBudget,'USD',true)}</div>
        <div class="stat-card-change ${overdue > 0 ? 'down' : 'neutral'}">${overdue > 0 ? '↓ ' + overdue + ' overdue' : '→ On track'}</div>
      </div>
    `;
  }

  function applyFilters() {
    let data = [..._projects];
    if (_search) data = Utils.searchFilter(data, _search, ['name', 'description', 'status']);
    if (_filterStatus) data = data.filter(p => p.status === _filterStatus);
    if (_filterPriority) data = data.filter(p => p.priority === _filterPriority);
    _filtered = data;
  }

  function renderContent() {
    const container = document.getElementById('projectsContent');
    if (!container) return;
    const start = (_currentPage - 1) * _pageSize;
    const paged = _filtered.slice(start, start + _pageSize);

    if (_filtered.length === 0) {
      container.innerHTML = UI.emptyState('🚀', 'No Projects Found', 'Create your first project to get started.', '+ New Project', 'Projects.openCreateModal()');
      document.getElementById('projectPagination').innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr>
            <th class="sortable" data-sort="name">Project Name</th>
            <th>Client</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Progress</th>
            <th class="sortable" data-sort="budget">Budget</th>
            <th class="sortable" data-sort="deadline">Deadline</th>
            <th></th>
          </tr></thead>
          <tbody>
            ${paged.map(p => {
              const client = p.clientId ? Storage.getById('clients', p.clientId) : null;
              const isOverdue = Utils.isOverdue(p.deadline) && p.status !== 'completed';
              return `
                <tr data-id="${p.id}" class="${isOverdue ? 'overdue' : ''}">
                  <td>
                    <div class="cell-name">
                      <div>
                        <div class="cell-name-text" style="display:flex;align-items:center;gap:6px;">
                          ${p.isPinned ? '<span title="Pinned">📌</span>' : ''}${p.name}
                        </div>
                        <div class="cell-name-sub">${p.tags ? p.tags.join(' • ') : ''}</div>
                      </div>
                    </div>
                  </td>
                  <td>${client ? `<span class="truncate" style="max-width:120px;display:block;">${client.company || client.name}</span>` : '—'}</td>
                  <td>${Utils.getStatusBadge(p.status)}</td>
                  <td>${Utils.getPriorityBadge(p.priority)}</td>
                  <td style="min-width:100px;">
                    <div style="display:flex;align-items:center;gap:8px;">
                      <div class="progress" style="flex:1;"><div class="progress-bar ${p.progress > 80 ? '' : p.progress > 50 ? '' : 'info'}" style="width:${p.progress}%"></div></div>
                      <span style="font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap;">${p.progress}%</span>
                    </div>
                  </td>
                  <td class="cell-amount">${Utils.formatCurrency(p.budget,'USD',true)}</td>
                  <td class="cell-date ${isOverdue ? 'text-error' : ''}">${Utils.formatDate(p.deadline)}</td>
                  <td>
                    <div class="cell-actions">
                      <button class="cell-action-btn" onclick="event.stopPropagation();Projects.openDrawer('${p.id}')">👁</button>
                      <button class="cell-action-btn" onclick="event.stopPropagation();Projects.openEditModal('${p.id}')">✏️</button>
                      <button class="cell-action-btn danger" onclick="event.stopPropagation();Projects.deleteProject('${p.id}')">🗑</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    renderPagination();
    document.querySelectorAll('.data-table tbody tr[data-id]').forEach(row => {
      row.addEventListener('click', e => {
        if (e.target.closest('button')) return;
        openDrawer(row.dataset.id);
      });
    });
  }

  function renderPagination() {
    const el = document.getElementById('projectPagination');
    if (!el) return;
    const total = _filtered.length;
    const pages = Math.ceil(total / _pageSize);
    const start = (_currentPage - 1) * _pageSize + 1;
    const end = Math.min(_currentPage * _pageSize, total);
    el.innerHTML = `
      <div class="pagination-info">Showing ${start}–${end} of ${total} projects</div>
      <div class="pagination-controls">
        <button class="page-btn" onclick="Projects.goPage(${_currentPage-1})" ${_currentPage<=1?'disabled':''}>‹</button>
        ${Array.from({length:Math.min(pages,7)},(_,i)=>`<button class="page-btn ${i+1===_currentPage?'active':''}" onclick="Projects.goPage(${i+1})">${i+1}</button>`).join('')}
        <button class="page-btn" onclick="Projects.goPage(${_currentPage+1})" ${_currentPage>=pages?'disabled':''}>›</button>
      </div>
    `;
  }

  function bindEvents() {
    const s = document.getElementById('projectSearch');
    if (s) s.addEventListener('input', Utils.debounce(e => { _search = e.target.value; _currentPage = 1; applyFilters(); renderContent(); }, 300));
    const sf = document.getElementById('projectStatusFilter');
    if (sf) sf.addEventListener('change', e => { _filterStatus = e.target.value; _currentPage = 1; applyFilters(); renderContent(); });
    const pf = document.getElementById('projectPriorityFilter');
    if (pf) pf.addEventListener('change', e => { _filterPriority = e.target.value; _currentPage = 1; applyFilters(); renderContent(); });
  }

  function openDrawer(id) {
    const p = Storage.getById('projects', id);
    if (!p) return;
    const client = p.clientId ? Storage.getById('clients', p.clientId) : null;
    const invoices = Storage.getAll('invoices').filter(i => i.projectId === id);
    const budgetPct = Math.round((p.spent / p.budget) * 100);

    const overviewTab = `
      ${Drawer.buildStats([
        { value: `${p.progress}%`, label: 'Progress' },
        { value: Utils.formatCurrency(p.budget,'USD',true), label: 'Budget' },
        { value: Utils.formatCurrency(p.spent,'USD',true), label: 'Spent' },
      ])}
      <div class="drawer-section">
        <div class="drawer-section-title">Project Details</div>
        ${Drawer.buildDetailRows([
          { label: 'Status', value: Utils.getStatusBadge(p.status) },
          { label: 'Priority', value: Utils.getPriorityBadge(p.priority) },
          { label: 'Client', value: client ? client.name : '—' },
          { label: 'Start Date', value: Utils.formatDate(p.startDate) },
          { label: 'Deadline', value: Utils.formatDate(p.deadline) },
          { label: 'Team Size', value: `${p.teamSize} members` },
        ])}
      </div>
      <div class="drawer-section">
        <div class="drawer-section-title">Budget Usage</div>
        <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--text-muted);margin-bottom:6px;">
          <span>Spent: ${Utils.formatCurrency(p.spent)}</span>
          <span>Budget: ${Utils.formatCurrency(p.budget)}</span>
        </div>
        <div class="progress"><div class="progress-bar ${budgetPct > 90 ? 'error' : budgetPct > 70 ? 'warning' : ''}" style="width:${Math.min(budgetPct, 100)}%"></div></div>
        <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:4px;">${budgetPct}% used • Profit: ${Utils.formatCurrency(p.profit)}</div>
      </div>
      ${p.description ? `<div class="drawer-section"><div class="drawer-section-title">Description</div><p style="font-size:var(--text-sm);color:var(--text-secondary);">${p.description}</p></div>` : ''}
    `;

    const milestonesTab = `
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${(p.milestones || []).map(m => `
          <div class="milestone-item" style="margin-bottom:0;">
            <div class="milestone-checkbox ${m.done ? 'done' : ''}">✓</div>
            <div class="milestone-info">
              <div class="milestone-title">${m.name}</div>
              <div class="milestone-date">Due: ${Utils.formatDate(m.dueDate)}</div>
            </div>
            ${Utils.getStatusBadge(m.done ? 'completed' : 'pending')}
          </div>
        `).join('')}
      </div>
    `;

    Drawer.open({
      title: p.name,
      subtitle: `${client ? client.company : 'No Client'} • ${Utils.titleCase(p.status)}`,
      avatar: null,
      record: p, type: 'project',
      tabs: [
        { id: 'overview', label: 'Overview', icon: '📋', content: overviewTab },
        { id: 'milestones', label: `Milestones (${(p.milestones||[]).length})`, icon: '🎯', content: milestonesTab },
        { id: 'invoices', label: `Invoices (${invoices.length})`, icon: '📄', content: invoices.length ? invoices.map(i => `<div class="recent-item"><div class="recent-item-body"><div class="recent-item-name">${i.number}</div><div class="recent-item-meta">${Utils.getStatusBadge(i.status)}</div></div><div class="recent-item-value">${Utils.formatCurrency(i.total)}</div></div>`).join('') : UI.emptyState('📄','No Invoices','') },
        { id: 'timeline', label: 'Timeline', icon: '⏱', content: Drawer.buildTimeline([
          { title: 'Project Started', desc: 'Kickoff', time: Utils.formatDate(p.startDate), active: false },
          ...((p.milestones||[]).slice(0,3).map(m => ({ title: m.name, desc: m.done ? 'Completed' : 'Pending', time: Utils.formatDate(m.dueDate), active: m.done }))),
          { title: 'Deadline', desc: p.status === 'completed' ? 'Project delivered' : 'Target date', time: Utils.formatDate(p.deadline), active: p.status === 'completed' },
        ]) },
      ],
      onEdit: () => { Drawer.close(); openEditModal(id); },
      onDelete: () => { Drawer.close(); deleteProject(id); },
    });
  }

  function openCreateModal() {
    Modal.open({
      title: 'New Project', icon: '🚀', size: 'modal-lg',
      body: buildProjectForm(),
      onSave: () => saveProject(null),
    });
  }

  function openEditModal(id) {
    const p = Storage.getById('projects', id);
    if (!p) return;
    Modal.open({
      title: 'Edit Project', icon: '✏️', size: 'modal-lg',
      body: buildProjectForm(p),
      saveLabel: 'Update Project',
      onSave: () => saveProject(id),
    });
  }

  function buildProjectForm(p = {}) {
    const clients = Storage.getAll('clients');
    return `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Project Name <span class="required">*</span></label>
          <input type="text" name="name" class="form-input" value="${p.name||''}" placeholder="Website Redesign" required />
        </div>
        <div class="form-group">
          <label class="form-label">Client</label>
          <select name="clientId" class="form-select">
            <option value="">No Client</option>
            ${clients.map(c => `<option value="${c.id}" ${p.clientId===c.id?'selected':''}>${c.name} — ${c.company||''}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Status</label>
          <select name="status" class="form-select">
            ${['planning','in-progress','completed','on-hold'].map(s => `<option value="${s}" ${p.status===s?'selected':''}>${Utils.titleCase(s)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Priority</label>
          <select name="priority" class="form-select">
            ${['low','medium','high','critical'].map(s => `<option value="${s}" ${p.priority===s?'selected':''}>${Utils.titleCase(s)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Start Date</label>
          <input type="date" name="startDate" class="form-input" value="${p.startDate||Utils.todayISO()}" />
        </div>
        <div class="form-group">
          <label class="form-label">Deadline</label>
          <input type="date" name="deadline" class="form-input" value="${p.deadline||Utils.addDays(Utils.todayISO(),30)}" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Budget ($)</label>
          <input type="number" name="budget" class="form-input" value="${p.budget||0}" placeholder="50000" />
        </div>
        <div class="form-group">
          <label class="form-label">Progress (%)</label>
          <input type="number" name="progress" class="form-input" value="${p.progress||0}" min="0" max="100" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea name="description" class="form-textarea" rows="3" placeholder="Project description...">${p.description||''}</textarea>
      </div>
    `;
  }

  function saveProject(editId) {
    if (!Modal.validateRequired([{ name: 'name', label: 'Project Name' }])) return false;
    const data = Modal.getFormData();
    if (!data.name.trim()) return false;
    data.budget = parseFloat(data.budget) || 0;
    data.progress = parseInt(data.progress) || 0;

    if (editId) {
      Storage.update('projects', editId, data);
      UI.toast(`Project "${data.name}" updated.`, 'success');
    } else {
      Storage.create('projects', { ...data, spent: 0, profit: data.budget, milestones: [], isPinned: false, teamSize: 1 });
      UI.toast(`Project "${data.name}" created!`, 'success');
    }
    renderPage();
    return true;
  }

  function deleteProject(id) {
    const p = Storage.getById('projects', id);
    if (!p) return;
    UI.confirm(`Delete project "<strong>${p.name}</strong>"? This cannot be undone.`, 'Delete Project', () => {
      Storage.del('projects', id);
      UI.toast(`Project "${p.name}" deleted.`, 'success');
      renderPage();
    });
  }

  function showPinned() {
    _filterStatus = '';
    _search = '';
    _filtered = _projects.filter(p => p.isPinned);
    renderContent();
    UI.toast('Showing pinned projects.', 'info');
  }

  function goPage(page) {
    const pages = Math.ceil(_filtered.length / _pageSize);
    if (page < 1 || page > pages) return;
    _currentPage = page;
    renderContent();
  }

  function exportCSV() {
    const data = _projects.map(p => ({
      Name: p.name, Status: p.status, Priority: p.priority,
      Budget: p.budget, Spent: p.spent, Progress: p.progress + '%',
      Deadline: p.deadline,
    }));
    Utils.downloadCSV(data, 'projects-export.csv');
    UI.toast('Projects exported.', 'success');
  }

  return { renderPage, openCreateModal, openEditModal, openDrawer, deleteProject, showPinned, goPage, exportCSV };
})();
