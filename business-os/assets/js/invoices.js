/* ============================================================
   INVOICES.JS — Invoice, Payments & Expenses Module
   ============================================================ */

const Invoices = (() => {
  let _invoices = [], _filtered = [], _currentPage = 1, _pageSize = 10, _search = '', _filterStatus = '';

  function renderPage() {
    _invoices = Storage.getAll('invoices');
    applyFilters();

    const totalRevenue = Utils.sumBy(_invoices.filter(i => i.status === 'paid'), 'total');
    const outstanding = Utils.sumBy(_invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled'), 'balance');
    const overdue = _invoices.filter(i => i.status === 'overdue').length;

    const html = `
      ${UI.buildBreadcrumb([{label:'Dashboard',href:'#dashboard',page:'dashboard'},{label:'Finance'},{label:'Invoices'}])}
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Invoices</h1>
          <p class="page-subtitle">${_invoices.length} total invoices</p>
        </div>
        <div class="page-header-right">
          <button class="btn btn-secondary btn-sm" onclick="Invoices.exportCSV()">⬇ Export</button>
          <button class="btn btn-primary" onclick="Invoices.openCreateModal()">+ New Invoice</button>
        </div>
      </div>
      <div class="stats-row stagger-children">
        <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">Total Invoices</span><div class="stat-card-icon blue">📄</div></div><div class="stat-card-value">${_invoices.length}</div><div class="stat-card-change neutral">→ All time</div></div>
        <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">Total Revenue</span><div class="stat-card-icon green">💰</div></div><div class="stat-card-value">${Utils.formatCurrency(totalRevenue,'USD',true)}</div><div class="stat-card-change up">↑ Paid invoices</div></div>
        <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">Outstanding</span><div class="stat-card-icon gold">⏳</div></div><div class="stat-card-value">${Utils.formatCurrency(outstanding,'USD',true)}</div><div class="stat-card-change neutral">→ Awaiting payment</div></div>
        <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">Overdue</span><div class="stat-card-icon red">⚠</div></div><div class="stat-card-value">${overdue}</div><div class="stat-card-change ${overdue>0?'down':'neutral'}">${overdue>0?'↓ Needs attention':'→ All on time'}</div></div>
      </div>
      <div class="table-container">
        <div class="table-toolbar">
          <div class="table-toolbar-left">
            <div class="table-search-wrapper">
              <span class="table-search-icon">🔍</span>
              <input type="text" class="table-search-input" id="invoiceSearch" placeholder="Search invoices..." />
            </div>
            <select class="filter-select" id="invoiceStatusFilter">
              <option value="">All Status</option>
              <option value="paid">Paid</option><option value="sent">Sent</option>
              <option value="draft">Draft</option><option value="overdue">Overdue</option>
              <option value="partial">Partial</option>
            </select>
          </div>
        </div>
        <div id="invoicesContent"></div>
        <div class="pagination" id="invoicePagination"></div>
      </div>
    `;
    Utils.renderPage(html);
    renderContent();
    bindEvents();
  }

  function applyFilters() {
    let data = [..._invoices];
    if (_search) data = Utils.searchFilter(data, _search, ['number', 'title']);
    if (_filterStatus) data = data.filter(i => i.status === _filterStatus);
    _filtered = data;
  }

  function renderContent() {
    const container = document.getElementById('invoicesContent');
    if (!container) return;
    const start = (_currentPage - 1) * _pageSize;
    const paged = _filtered.slice(start, start + _pageSize);

    if (_filtered.length === 0) {
      container.innerHTML = UI.emptyState('📄','No Invoices Found','Create your first invoice.','+ New Invoice','Invoices.openCreateModal()');
      document.getElementById('invoicePagination').innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr>
            <th>Invoice #</th><th>Client</th><th>Title</th>
            <th>Amount</th><th>Status</th><th>Issue Date</th><th>Due Date</th><th></th>
          </tr></thead>
          <tbody>
            ${paged.map(i => {
              const client = i.clientId ? Storage.getById('clients', i.clientId) : null;
              const isOverdue = i.status === 'overdue' || (Utils.isOverdue(i.dueDate) && i.status !== 'paid');
              return `
                <tr data-id="${i.id}" ${isOverdue?'class="overdue"':''}>
                  <td><span style="font-family:var(--font-mono);font-weight:600;color:var(--text-primary);">${i.number}</span></td>
                  <td>${client ? `<div>${client.name}</div><div style="font-size:var(--text-xs);color:var(--text-muted);">${client.company||''}</div>` : '—'}</td>
                  <td>${Utils.truncate(i.title, 32)}</td>
                  <td>
                    <div class="cell-amount">${Utils.formatCurrency(i.total)}</div>
                    ${i.balance > 0 ? `<div style="font-size:var(--text-xs);color:var(--status-error);">Due: ${Utils.formatCurrency(i.balance)}</div>` : ''}
                  </td>
                  <td>${Utils.getStatusBadge(i.status)}</td>
                  <td class="cell-date">${Utils.formatDate(i.issueDate)}</td>
                  <td class="cell-date ${isOverdue?'text-error':''}">${Utils.formatDate(i.dueDate)}</td>
                  <td>
                    <div class="cell-actions">
                      <button class="cell-action-btn" onclick="event.stopPropagation();Invoices.openDrawer('${i.id}')">👁</button>
                      <button class="cell-action-btn" onclick="event.stopPropagation();Invoices.markPaid('${i.id}')" title="Mark Paid">💰</button>
                      <button class="cell-action-btn" onclick="event.stopPropagation();Invoices.openEditModal('${i.id}')">✏️</button>
                      <button class="cell-action-btn danger" onclick="event.stopPropagation();Invoices.deleteInvoice('${i.id}')">🗑</button>
                    </div>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    renderPagination();
    document.querySelectorAll('.data-table tbody tr[data-id]').forEach(row => {
      row.addEventListener('click', e => { if (e.target.closest('button')) return; openDrawer(row.dataset.id); });
    });
  }

  function renderPagination() {
    const el = document.getElementById('invoicePagination');
    if (!el) return;
    const total = _filtered.length;
    const pages = Math.ceil(total / _pageSize);
    const start = (_currentPage - 1) * _pageSize + 1;
    const end = Math.min(_currentPage * _pageSize, total);
    el.innerHTML = `
      <div class="pagination-info">Showing ${start}–${end} of ${total}</div>
      <div class="pagination-controls">
        <button class="page-btn" onclick="Invoices.goPage(${_currentPage-1})" ${_currentPage<=1?'disabled':''}>‹</button>
        ${Array.from({length:Math.min(pages,7)},(_,i)=>`<button class="page-btn ${i+1===_currentPage?'active':''}" onclick="Invoices.goPage(${i+1})">${i+1}</button>`).join('')}
        <button class="page-btn" onclick="Invoices.goPage(${_currentPage+1})" ${_currentPage>=pages?'disabled':''}>›</button>
      </div>
    `;
  }

  function bindEvents() {
    const s = document.getElementById('invoiceSearch');
    if (s) s.addEventListener('input', Utils.debounce(e => { _search = e.target.value; _currentPage = 1; applyFilters(); renderContent(); }, 300));
    const sf = document.getElementById('invoiceStatusFilter');
    if (sf) sf.addEventListener('change', e => { _filterStatus = e.target.value; _currentPage = 1; applyFilters(); renderContent(); });
  }

  function openDrawer(id) {
    const inv = Storage.getById('invoices', id);
    if (!inv) return;
    const client = inv.clientId ? Storage.getById('clients', inv.clientId) : null;

    const overviewTab = `
      ${Drawer.buildStats([
        { value: Utils.formatCurrency(inv.total), label: 'Total' },
        { value: Utils.formatCurrency(inv.paidAmount), label: 'Paid' },
        { value: Utils.formatCurrency(inv.balance), label: 'Balance' },
      ])}
      <div class="drawer-section">
        <div class="drawer-section-title">Invoice Details</div>
        ${Drawer.buildDetailRows([
          { label: 'Number', value: `<code>${inv.number}</code>`, highlight: true },
          { label: 'Status', value: Utils.getStatusBadge(inv.status) },
          { label: 'Client', value: client ? client.name : '—' },
          { label: 'Issue Date', value: Utils.formatDate(inv.issueDate) },
          { label: 'Due Date', value: Utils.formatDate(inv.dueDate) },
          { label: 'Subtotal', value: Utils.formatCurrency(inv.subtotal) },
          { label: 'Tax (18%)', value: Utils.formatCurrency(inv.tax) },
          { label: 'Total', value: Utils.formatCurrency(inv.total), highlight: true },
        ])}
      </div>
      ${inv.notes ? `<div class="drawer-section"><div class="drawer-section-title">Notes</div><p style="font-size:var(--text-sm);color:var(--text-secondary);">${inv.notes}</p></div>` : ''}
    `;

    const itemsTab = `
      <table style="width:100%;border-collapse:collapse;font-size:var(--text-sm);">
        <thead><tr style="border-bottom:1px solid var(--border-subtle);">
          <th style="text-align:left;padding:8px 0;color:var(--text-muted);font-size:var(--text-xs);text-transform:uppercase;">Description</th>
          <th style="text-align:center;padding:8px;color:var(--text-muted);font-size:var(--text-xs);">Qty</th>
          <th style="text-align:right;padding:8px 0;color:var(--text-muted);font-size:var(--text-xs);">Rate</th>
          <th style="text-align:right;padding:8px 0;color:var(--text-muted);font-size:var(--text-xs);">Amount</th>
        </tr></thead>
        <tbody>
          ${(inv.items||[]).map(item => `
            <tr style="border-bottom:1px solid var(--border-subtle);">
              <td style="padding:10px 0;color:var(--text-secondary);">${item.description}</td>
              <td style="padding:10px;text-align:center;color:var(--text-muted);">${item.qty}</td>
              <td style="padding:10px 0;text-align:right;color:var(--text-secondary);">${Utils.formatCurrency(item.rate)}</td>
              <td style="padding:10px 0;text-align:right;font-weight:600;color:var(--text-primary);">${Utils.formatCurrency(item.amount)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr><td colspan="3" style="padding:12px 0;text-align:right;color:var(--text-muted);">Subtotal</td><td style="padding:12px 0;text-align:right;">${Utils.formatCurrency(inv.subtotal)}</td></tr>
          <tr><td colspan="3" style="padding:4px 0;text-align:right;color:var(--text-muted);">Tax</td><td style="padding:4px 0;text-align:right;">${Utils.formatCurrency(inv.tax)}</td></tr>
          <tr style="border-top:2px solid var(--border-medium);"><td colspan="3" style="padding:12px 0;text-align:right;font-weight:700;color:var(--text-primary);">Total</td><td style="padding:12px 0;text-align:right;font-weight:700;color:var(--accent-primary);">${Utils.formatCurrency(inv.total)}</td></tr>
        </tfoot>
      </table>
    `;

    Drawer.open({
      title: inv.number,
      subtitle: `${client ? client.name : 'Unknown Client'} • ${Utils.formatDate(inv.issueDate)}`,
      record: inv, type: 'invoice',
      tabs: [
        { id: 'overview', label: 'Overview', icon: '📋', content: overviewTab },
        { id: 'items', label: 'Line Items', icon: '📋', content: itemsTab },
      ],
      onEdit: () => { Drawer.close(); openEditModal(id); },
      onDelete: () => { Drawer.close(); deleteInvoice(id); },
    });
  }

  function openCreateModal() {
    Modal.open({
      title: 'New Invoice', icon: '📄', size: 'modal-lg',
      body: buildInvoiceForm(),
      onSave: () => saveInvoice(null),
    });
  }

  function openEditModal(id) {
    const inv = Storage.getById('invoices', id);
    if (!inv) return;
    Modal.open({
      title: 'Edit Invoice', icon: '✏️', size: 'modal-lg',
      body: buildInvoiceForm(inv),
      saveLabel: 'Update Invoice',
      onSave: () => saveInvoice(id),
    });
  }

  function buildInvoiceForm(inv = {}) {
    const clients = Storage.getAll('clients');
    return `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Client <span class="required">*</span></label>
          <select name="clientId" class="form-select">
            <option value="">Select client...</option>
            ${clients.map(c => `<option value="${c.id}" ${inv.clientId===c.id?'selected':''}>${c.name} — ${c.company||''}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select name="status" class="form-select">
            ${['draft','sent','paid','partial','overdue','cancelled'].map(s => `<option value="${s}" ${inv.status===s?'selected':''}>${Utils.titleCase(s)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Invoice Title <span class="required">*</span></label>
        <input type="text" name="title" class="form-input" value="${inv.title||''}" placeholder="Web Development Services" required />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Issue Date</label>
          <input type="date" name="issueDate" class="form-input" value="${inv.issueDate||Utils.todayISO()}" />
        </div>
        <div class="form-group">
          <label class="form-label">Due Date</label>
          <input type="date" name="dueDate" class="form-input" value="${inv.dueDate||Utils.addDays(Utils.todayISO(),30)}" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Subtotal ($)</label>
          <input type="number" name="subtotal" class="form-input" value="${inv.subtotal||0}" placeholder="10000" oninput="Invoices.calcTotal()" />
        </div>
        <div class="form-group">
          <label class="form-label">Tax Rate (%)</label>
          <input type="number" name="taxRate" class="form-input" value="${inv.taxRate||18}" placeholder="18" oninput="Invoices.calcTotal()" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Tax Amount</label>
          <input type="number" name="tax" class="form-input" id="invTaxAmount" value="${inv.tax||0}" readonly style="opacity:0.6;" />
        </div>
        <div class="form-group">
          <label class="form-label">Total</label>
          <input type="number" name="total" class="form-input" id="invTotalAmount" value="${inv.total||0}" readonly style="opacity:0.6;font-weight:700;color:var(--accent-primary);" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Notes</label>
        <textarea name="notes" class="form-textarea" rows="2">${inv.notes||'Payment due within 30 days.'}</textarea>
      </div>
    `;
  }

  function calcTotal() {
    const subtotal = parseFloat(document.querySelector('[name="subtotal"]')?.value) || 0;
    const taxRate = parseFloat(document.querySelector('[name="taxRate"]')?.value) || 0;
    const tax = Math.round(subtotal * taxRate / 100);
    const total = subtotal + tax;
    const taxEl = document.getElementById('invTaxAmount');
    const totalEl = document.getElementById('invTotalAmount');
    if (taxEl) taxEl.value = tax;
    if (totalEl) totalEl.value = total;
  }

  function saveInvoice(editId) {
    if (!Modal.validateRequired([{ name: 'title', label: 'Title' }])) return false;
    const data = Modal.getFormData();
    data.subtotal = parseFloat(data.subtotal) || 0;
    data.taxRate = parseFloat(data.taxRate) || 18;
    data.tax = Math.round(data.subtotal * data.taxRate / 100);
    data.total = data.subtotal + data.tax;
    data.paidAmount = editId ? (Storage.getById('invoices', editId)?.paidAmount || 0) : 0;
    data.balance = data.total - data.paidAmount;

    if (editId) {
      Storage.update('invoices', editId, data);
      UI.toast('Invoice updated.', 'success');
    } else {
      const invoiceCount = Storage.getAll('invoices').length;
      data.number = `INV-${2024000 + invoiceCount + 1}`;
      data.items = [];
      Storage.create('invoices', data);
      UI.toast('Invoice created!', 'success');
    }
    renderPage();
    return true;
  }

  function markPaid(id) {
    const inv = Storage.getById('invoices', id);
    if (!inv) return;
    if (inv.status === 'paid') { UI.toast('Already marked as paid.', 'info'); return; }
    Storage.update('invoices', id, { status: 'paid', paidAmount: inv.total, balance: 0 });
    Notifications.add({ type: 'payment', icon: '💰', title: 'Invoice Paid', message: `Invoice ${inv.number} marked as paid. Amount: ${Utils.formatCurrency(inv.total)}` });
    UI.toast(`Invoice ${inv.number} marked as paid!`, 'success');
    renderPage();
  }

  function deleteInvoice(id) {
    const inv = Storage.getById('invoices', id);
    if (!inv) return;
    UI.confirm(`Delete invoice "<strong>${inv.number}</strong>"?`, 'Delete Invoice', () => {
      Storage.del('invoices', id);
      UI.toast(`Invoice ${inv.number} deleted.`, 'success');
      renderPage();
    });
  }

  function goPage(page) {
    const pages = Math.ceil(_filtered.length / _pageSize);
    if (page < 1 || page > pages) return;
    _currentPage = page;
    renderContent();
  }

  function exportCSV() {
    const data = _invoices.map(i => ({
      Number: i.number, Title: i.title, Status: i.status,
      Subtotal: i.subtotal, Tax: i.tax, Total: i.total,
      IssueDate: i.issueDate, DueDate: i.dueDate,
    }));
    Utils.downloadCSV(data, 'invoices-export.csv');
    UI.toast('Invoices exported.', 'success');
  }

  return { renderPage, openCreateModal, openEditModal, openDrawer, markPaid, deleteInvoice, calcTotal, goPage, exportCSV };
})();
