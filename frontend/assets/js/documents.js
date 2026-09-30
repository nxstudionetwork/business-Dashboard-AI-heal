/* ============================================================
   DOCUMENTS.JS — Document Library
   ============================================================ */

const Documents = (() => {
  let _documents = [];
  let _filtered = [];
  let _search = '';
  let _folder = '';
  let _type = '';
  const FOLDERS = ['Contracts', 'Proposals', 'Reports', 'Invoices', 'Legal', 'Marketing', 'Technical', 'Finance'];
  const TYPES = ['pdf', 'excel', 'word', 'img'];

  function getDocuments() {
    _documents = Storage.getAll('documents');
    return _documents;
  }

  function renderPage() {
    getDocuments();
    applyFilters();
    const total = _documents.length;
    const pdfCount = _documents.filter(d => d.type === 'pdf').length;
    const shared = _documents.filter(d => d.clientId || d.projectId).length;

    Utils.renderPage(`
      ${UI.buildBreadcrumb([{ label: 'Dashboard', href: '#dashboard', page: 'dashboard' }, { label: 'Documents' }])}
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Documents</h1>
          <p class="page-subtitle">${total} documents • ${pdfCount} PDFs • ${shared} linked items</p>
        </div>
        <div class="page-header-right">
          <button class="btn btn-secondary btn-sm" onclick="Documents.exportCSV()">⬇ Export</button>
          <button class="btn btn-primary" onclick="Documents.openUploadModal()">+ Upload Document</button>
        </div>
      </div>
      <div class="stats-row stagger-children">
        <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">Total Documents</span><div class="stat-card-icon blue">📁</div></div><div class="stat-card-value">${total}</div><div class="stat-card-change neutral">Library size</div></div>
        <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">Linked Items</span><div class="stat-card-icon green">🔗</div></div><div class="stat-card-value">${shared}</div><div class="stat-card-change neutral">Projects & clients</div></div>
        <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">Folders</span><div class="stat-card-icon purple">🗂</div></div><div class="stat-card-value">${new Set(_documents.map(d => d.folder)).size}</div><div class="stat-card-change neutral">Organized content</div></div>
      </div>
      <div class="table-container">
        <div class="table-toolbar">
          <div class="table-toolbar-left">
            <div class="table-search-wrapper"><span class="table-search-icon">🔍</span>
              <input type="text" class="table-search-input" id="documentSearch" placeholder="Search documents..." value="${_search}" /></div>
            <select class="filter-select" id="documentFolderFilter">
              <option value="">All Folders</option>
              ${FOLDERS.map(folder => `<option value="${folder}" ${_folder === folder ? 'selected' : ''}>${folder}</option>`).join('')}
            </select>
            <select class="filter-select" id="documentTypeFilter">
              <option value="">All Types</option>
              ${TYPES.map(type => `<option value="${type}" ${_type === type ? 'selected' : ''}>${type.toUpperCase()}</option>`).join('')}
            </select>
          </div>
        </div>
        <div id="documentsContent"></div>
      </div>
    `);

    bindEvents();
    renderContent();
  }

  function applyFilters() {
    _filtered = [..._documents];
    if (_search) {
      _filtered = Utils.searchFilter(_filtered, _search, ['name', 'folder', 'uploadedBy', 'tags']);
    }
    if (_folder) {
      _filtered = _filtered.filter(doc => doc.folder === _folder);
    }
    if (_type) {
      _filtered = _filtered.filter(doc => doc.type === _type);
    }
  }

  function renderContent() {
    const container = document.getElementById('documentsContent');
    if (!container) return;
    if (!_filtered.length) {
      container.innerHTML = UI.emptyState('📁', 'No documents available', 'Upload important files to keep your workspace organized.', '+ Upload Document', 'Documents.openUploadModal()');
      return;
    }

    container.innerHTML = `
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>Name</th><th>Folder</th><th>Type</th><th>Uploaded By</th><th>Date</th><th></th></tr></thead>
          <tbody>
            ${_filtered.map(doc => `
              <tr>
                <td><strong>${doc.name}</strong></td>
                <td>${doc.folder}</td>
                <td>${doc.type.toUpperCase()}</td>
                <td>${doc.uploadedBy}</td>
                <td>${Utils.formatDate(doc.uploadedAt)}</td>
                <td><div class="cell-actions"><button class="cell-action-btn" onclick="event.stopPropagation();Documents.openEditModal('${doc.id}')">✏️</button><button class="cell-action-btn danger" onclick="event.stopPropagation();Documents.deleteDocument('${doc.id}')">🗑</button></div></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function bindEvents() {
    const search = document.getElementById('documentSearch');
    const folder = document.getElementById('documentFolderFilter');
    const type = document.getElementById('documentTypeFilter');
    if (search) {
      search.addEventListener('input', Utils.debounce(e => {
        _search = e.target.value;
        applyFilters();
        renderContent();
      }, 250));
    }
    if (folder) {
      folder.addEventListener('change', e => {
        _folder = e.target.value;
        applyFilters();
        renderContent();
      });
    }
    if (type) {
      type.addEventListener('change', e => {
        _type = e.target.value;
        applyFilters();
        renderContent();
      });
    }
  }

  function openUploadModal(id = null) {
    const doc = id ? Storage.getById('documents', id) : {};
    const clients = Storage.getAll('clients');
    const projects = Storage.getAll('projects');

    Modal.open({
      title: id ? 'Edit Document' : 'Upload Document',
      icon: '📁',
      body: `
        <div class="form-row">
          <div class="form-group"><label class="form-label">Document Name</label><input name="name" class="form-input" value="${doc.name || ''}" placeholder="Proposal.pdf" /></div>
          <div class="form-group"><label class="form-label">Folder</label><select name="folder" class="form-select">${FOLDERS.map(folder => `<option value="${folder}" ${doc.folder === folder ? 'selected' : ''}>${folder}</option>`).join('')}</select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Type</label><select name="type" class="form-select">${TYPES.map(type => `<option value="${type}" ${doc.type === type ? 'selected' : ''}>${type.toUpperCase()}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Size (KB)</label><input name="size" type="number" class="form-input" value="${doc.size || ''}" placeholder="120" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Client</label><select name="clientId" class="form-select"><option value="">None</option>${clients.map(c => `<option value="${c.id}" ${doc.clientId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Project</label><select name="projectId" class="form-select"><option value="">None</option>${projects.map(p => `<option value="${p.id}" ${doc.projectId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}</select></div>
        </div>
        <div class="form-group"><label class="form-label">Uploaded By</label><input name="uploadedBy" class="form-input" value="${doc.uploadedBy || ''}" placeholder="Jane Doe" /></div>
      `,
      saveLabel: id ? 'Update Document' : 'Upload',
      onSave: () => {
        const data = Modal.getFormData();
        const payload = {
          name: data.name || 'Untitled Document',
          folder: data.folder || FOLDERS[0],
          type: data.type || TYPES[0],
          size: `${parseInt(data.size, 10) || Utils.randomBetween(50, 1200)} KB`,
          clientId: data.clientId || null,
          projectId: data.projectId || null,
          uploadedBy: data.uploadedBy || 'System',
          uploadedAt: Utils.todayISO(),
          tags: [],
        };
        if (id) {
          Storage.update('documents', id, payload);
          UI.toast('Document updated.', 'success');
        } else {
          Storage.create('documents', payload);
          UI.toast('Document uploaded.', 'success');
        }
        renderPage();
        return true;
      }
    });
  }

  function openEditModal(id) {
    openUploadModal(id);
  }

  function deleteDocument(id) {
    const doc = Storage.getById('documents', id);
    if (!doc) return;
    UI.confirm(`Delete document <strong>${doc.name}</strong>?`, 'Delete Document', () => {
      Storage.del('documents', id);
      UI.toast('Document deleted.', 'success');
      renderPage();
    });
  }

  function exportCSV() {
    Utils.downloadCSV(_filtered.map(d => ({ Name: d.name, Folder: d.folder, Type: d.type, UploadedBy: d.uploadedBy, Date: d.uploadedAt })), 'documents.csv');
    UI.toast('Documents exported.', 'success');
  }

  return { renderPage, openUploadModal, openEditModal, deleteDocument, exportCSV };
})();
