/* ============================================================
   PAYMENTS.JS — Payments & Expenses Modules
   ============================================================ */

const Payments = (() => {
  let _payments = [], _filtPay = [], _pagePay = 1, _searchPay = '', _filterPayStatus = '';
  let _expenses = [], _filtExp = [], _pageExp = 1, _searchExp = '', _filterExpStatus = '';
  const PS = 10;

  // ════════════ PAYMENTS ════════════
  function renderPage() {
    _payments = Storage.getAll('payments');
    _filtPay = [..._payments];
    const total = Utils.sumBy(_payments, 'amount');
    const completed = Utils.sumBy(_payments.filter(p => p.status === 'completed'), 'amount');
    const pending = _payments.filter(p => p.status === 'pending').length;

    Utils.renderPage(`
      ${UI.buildBreadcrumb([{label:'Dashboard',href:'#dashboard',page:'dashboard'},{label:'Finance'},{label:'Payments'}])}
      <div class="page-header">
        <div class="page-header-left"><h1 class="page-title">Payments</h1>
          <p class="page-subtitle">${_payments.length} total payments</p></div>
        <div class="page-header-right">
          <button class="btn btn-secondary btn-sm" onclick="Payments.exportPayCSV()">⬇ Export</button>
          <button class="btn btn-primary" onclick="Payments.openCreateModal()">+ Record Payment</button>
        </div>
      </div>
      <div class="stats-row stagger-children">
        <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">Total Received</span><div class="stat-card-icon green">💰</div></div><div class="stat-card-value">${Utils.formatCurrency(total,'USD',true)}</div><div class="stat-card-change up">↑ All time</div></div>
        <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">Completed</span><div class="stat-card-icon blue">✓</div></div><div class="stat-card-value">${Utils.formatCurrency(completed,'USD',true)}</div><div class="stat-card-change up">↑ ${_payments.filter(p=>p.status==='completed').length} payments</div></div>
        <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">Pending</span><div class="stat-card-icon gold">⏳</div></div><div class="stat-card-value">${pending}</div><div class="stat-card-change ${pending>0?'down':'neutral'}">${pending>0?'↓ Awaiting':'→ All clear'}</div></div>
        <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">This Month</span><div class="stat-card-icon purple">📅</div></div><div class="stat-card-value">${Utils.formatCurrency(Utils.sumBy(_payments.filter(p=>{const d=new Date(p.date);const n=new Date();return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear()}),'amount'),'USD',true)}</div><div class="stat-card-change neutral">→ Current month</div></div>
      </div>
      <div class="table-container">
        <div class="table-toolbar">
          <div class="table-toolbar-left">
            <div class="table-search-wrapper"><span class="table-search-icon">🔍</span>
              <input type="text" class="table-search-input" id="paySearch" placeholder="Search payments..." /></div>
            <select class="filter-select" id="payStatusFilter">
              <option value="">All Status</option>
              <option value="completed">Completed</option><option value="pending">Pending</option><option value="failed">Failed</option>
            </select>
          </div>
        </div>
        <div id="paymentsContent"></div>
        <div class="pagination" id="payPagination"></div>
      </div>
    `);
    renderPayContent();
    const s = document.getElementById('paySearch');
    if (s) s.addEventListener('input', Utils.debounce(e => { _searchPay = e.target.value; _pagePay = 1; applyPayFilters(); renderPayContent(); }, 300));
    const sf = document.getElementById('payStatusFilter');
    if (sf) sf.addEventListener('change', e => { _filterPayStatus = e.target.value; _pagePay = 1; applyPayFilters(); renderPayContent(); });
  }

  function applyPayFilters() {
    let d = [..._payments];
    if (_searchPay) d = Utils.searchFilter(d, _searchPay, ['reference', 'method', 'notes']);
    if (_filterPayStatus) d = d.filter(p => p.status === _filterPayStatus);
    _filtPay = d;
  }

  function renderPayContent() {
    const container = document.getElementById('paymentsContent');
    if (!container) return;
    const start = (_pagePay - 1) * PS;
    const paged = _filtPay.slice(start, start + PS);
    if (!_filtPay.length) { container.innerHTML = UI.emptyState('💰','No Payments Found','Record your first payment.','+ Record Payment','Payments.openCreateModal()'); document.getElementById('payPagination').innerHTML=''; return; }

    container.innerHTML = `<div class="table-wrapper"><table class="data-table"><thead><tr>
      <th>Reference</th><th>Client</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th></th>
    </tr></thead><tbody>${paged.map(p => {
      const client = p.clientId ? Storage.getById('clients', p.clientId) : null;
      return `<tr data-id="${p.id}">
        <td><span style="font-family:var(--font-mono);font-weight:600;color:var(--text-primary);">${p.reference}</span></td>
        <td>${client ? `<div>${client.name}</div><div style="font-size:var(--text-xs);color:var(--text-muted);">${client.company||''}</div>` : '—'}</td>
        <td class="cell-amount positive">${Utils.formatCurrency(p.amount)}</td>
        <td><span class="badge badge-neutral">${p.method}</span></td>
        <td>${Utils.getStatusBadge(p.status)}</td>
        <td class="cell-date">${Utils.formatDate(p.date)}</td>
        <td><div class="cell-actions">
          <button class="cell-action-btn" onclick="event.stopPropagation();Payments.openEditModal('${p.id}')">✏️</button>
          <button class="cell-action-btn danger" onclick="event.stopPropagation();Payments.deletePayment('${p.id}')">🗑</button>
        </div></td>
      </tr>`;
    }).join('')}</tbody></table></div>`;

    const el = document.getElementById('payPagination');
    const pages = Math.ceil(_filtPay.length / PS);
    if (el) el.innerHTML = `<div class="pagination-info">Showing ${start+1}–${Math.min(_pagePay*PS,_filtPay.length)} of ${_filtPay.length}</div><div class="pagination-controls">
      <button class="page-btn" onclick="Payments.goPayPage(${_pagePay-1})" ${_pagePay<=1?'disabled':''}>‹</button>
      ${Array.from({length:Math.min(pages,7)},(_,i)=>`<button class="page-btn ${i+1===_pagePay?'active':''}" onclick="Payments.goPayPage(${i+1})">${i+1}</button>`).join('')}
      <button class="page-btn" onclick="Payments.goPayPage(${_pagePay+1})" ${_pagePay>=pages?'disabled':''}>›</button></div>`;

    document.querySelectorAll('#paymentsContent tr[data-id]').forEach(r => r.addEventListener('click', e => { if(e.target.closest('button')) return; Payments.openEditModal(r.dataset.id); }));
  }

  function openCreateModal(invoiceId = '') {
    const clients = Storage.getAll('clients');
    const invoices = Storage.getAll('invoices');
    Modal.open({
      title: 'Record Payment', icon: '💰',
      body: `
        <div class="form-row">
          <div class="form-group"><label class="form-label">Client</label>
            <select name="clientId" class="form-select"><option value="">Select client...</option>
              ${clients.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Invoice</label>
            <select name="invoiceId" class="form-select"><option value="">No Invoice</option>
              ${invoices.map(i=>`<option value="${i.id}" ${i.id===invoiceId?'selected':''}>${i.number}</option>`).join('')}</select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Amount ($) <span class="required">*</span></label>
            <input type="number" name="amount" class="form-input" placeholder="5000" required /></div>
          <div class="form-group"><label class="form-label">Payment Method</label>
            <select name="method" class="form-select">
              ${['Bank Transfer','Credit Card','Cash','Check','UPI','Wire Transfer'].map(m=>`<option value="${m}">${m}</option>`).join('')}</select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Date</label>
            <input type="date" name="date" class="form-input" value="${Utils.todayISO()}" /></div>
          <div class="form-group"><label class="form-label">Status</label>
            <select name="status" class="form-select">
              <option value="completed">Completed</option><option value="pending">Pending</option><option value="failed">Failed</option></select></div>
        </div>
        <div class="form-group"><label class="form-label">Notes</label>
          <textarea name="notes" class="form-textarea" rows="2" placeholder="Payment notes..."></textarea></div>`,
      onSave: () => {
        if (!Modal.validateRequired([{name:'amount',label:'Amount'}])) return false;
        const data = Modal.getFormData();
        data.amount = parseFloat(data.amount) || 0;
        const count = Storage.getAll('payments').length;
        Storage.create('payments', { ...data, reference: `PAY-${2024000+count+1}` });
        Notifications.add({ type:'payment', icon:'💰', title:'Payment Recorded', message:`Payment of ${Utils.formatCurrency(data.amount)} recorded.` });
        UI.toast('Payment recorded!', 'success');
        renderPage(); return true;
      }
    });
  }

  function openEditModal(id) {
    const p = Storage.getById('payments', id);
    if (!p) return;
    const clients = Storage.getAll('clients');
    Modal.open({
      title: 'Edit Payment', icon: '✏️',
      body: `
        <div class="form-row">
          <div class="form-group"><label class="form-label">Client</label>
            <select name="clientId" class="form-select"><option value="">Select...</option>
              ${clients.map(c=>`<option value="${c.id}" ${p.clientId===c.id?'selected':''}>${c.name}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Amount ($)</label>
            <input type="number" name="amount" class="form-input" value="${p.amount}" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Method</label>
            <select name="method" class="form-select">
              ${['Bank Transfer','Credit Card','Cash','Check','UPI','Wire Transfer'].map(m=>`<option value="${m}" ${p.method===m?'selected':''}>${m}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Status</label>
            <select name="status" class="form-select">
              <option value="completed" ${p.status==='completed'?'selected':''}>Completed</option>
              <option value="pending" ${p.status==='pending'?'selected':''}>Pending</option>
              <option value="failed" ${p.status==='failed'?'selected':''}>Failed</option></select></div>
        </div>
        <div class="form-group"><label class="form-label">Date</label>
          <input type="date" name="date" class="form-input" value="${p.date}" /></div>
        <div class="form-group"><label class="form-label">Notes</label>
          <textarea name="notes" class="form-textarea" rows="2">${p.notes||''}</textarea></div>`,
      saveLabel: 'Update Payment',
      onSave: () => {
        const data = Modal.getFormData();
        data.amount = parseFloat(data.amount) || 0;
        Storage.update('payments', id, data);
        UI.toast('Payment updated.', 'success'); renderPage(); return true;
      }
    });
  }

  function deletePayment(id) {
    const p = Storage.getById('payments', id);
    if (!p) return;
    UI.confirm(`Delete payment <strong>${p.reference}</strong>?`, 'Delete Payment', () => {
      Storage.del('payments', id);
      UI.toast('Payment deleted.', 'success'); renderPage();
    });
  }

  function goPayPage(p) { const pages = Math.ceil(_filtPay.length/PS); if(p<1||p>pages) return; _pagePay=p; renderPayContent(); }
  function exportPayCSV() { Utils.downloadCSV(_payments.map(p=>({Reference:p.reference,Amount:p.amount,Method:p.method,Status:p.status,Date:p.date})), 'payments.csv'); UI.toast('Exported!','success'); }

  // ════════════ EXPENSES ════════════
  const EXPENSE_CATS = ['Software','Hardware','Travel','Marketing','Office','Utilities','Salaries','Contractors','Legal','Miscellaneous'];

  function renderExpensesPage() {
    _expenses = Storage.getAll('expenses');
    _filtExp = [..._expenses];
    const total = Utils.sumBy(_expenses, 'amount');
    const approved = Utils.sumBy(_expenses.filter(e=>e.status==='approved'),'amount');
    const pending = _expenses.filter(e=>e.status==='pending').length;

    Utils.renderPage(`
      ${UI.buildBreadcrumb([{label:'Dashboard',href:'#dashboard',page:'dashboard'},{label:'Finance'},{label:'Expenses'}])}
      <div class="page-header">
        <div class="page-header-left"><h1 class="page-title">Expenses</h1>
          <p class="page-subtitle">${_expenses.length} total expenses</p></div>
        <div class="page-header-right">
          <button class="btn btn-secondary btn-sm" onclick="Payments.exportExpCSV()">⬇ Export</button>
          <button class="btn btn-primary" onclick="Payments.openExpenseModal()">+ Add Expense</button>
        </div>
      </div>
      <div class="stats-row stagger-children">
        <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">Total Expenses</span><div class="stat-card-icon red">💸</div></div><div class="stat-card-value">${Utils.formatCurrency(total,'USD',true)}</div><div class="stat-card-change down">↓ All time</div></div>
        <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">Approved</span><div class="stat-card-icon green">✓</div></div><div class="stat-card-value">${Utils.formatCurrency(approved,'USD',true)}</div><div class="stat-card-change neutral">→ ${_expenses.filter(e=>e.status==='approved').length} expenses</div></div>
        <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">Pending</span><div class="stat-card-icon gold">⏳</div></div><div class="stat-card-value">${pending}</div><div class="stat-card-change ${pending>0?'down':'neutral'}">${pending>0?'↓ Awaiting approval':'→ All approved'}</div></div>
        <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">Categories</span><div class="stat-card-icon blue">📂</div></div><div class="stat-card-value">${[...new Set(_expenses.map(e=>e.category))].length}</div><div class="stat-card-change neutral">→ Unique categories</div></div>
      </div>
      <div class="table-container">
        <div class="table-toolbar">
          <div class="table-toolbar-left">
            <div class="table-search-wrapper"><span class="table-search-icon">🔍</span>
              <input type="text" class="table-search-input" id="expSearch" placeholder="Search expenses..." /></div>
            <select class="filter-select" id="expStatusFilter">
              <option value="">All Status</option>
              <option value="approved">Approved</option><option value="pending">Pending</option><option value="rejected">Rejected</option>
            </select>
            <select class="filter-select" id="expCatFilter">
              <option value="">All Categories</option>
              ${EXPENSE_CATS.map(c=>`<option value="${c}">${c}</option>`).join('')}
            </select>
          </div>
        </div>
        <div id="expensesContent"></div>
        <div class="pagination" id="expPagination"></div>
      </div>
    `);
    renderExpContent();
    document.getElementById('expSearch')?.addEventListener('input', Utils.debounce(e=>{_searchExp=e.target.value;_pageExp=1;applyExpFilters();renderExpContent();},300));
    document.getElementById('expStatusFilter')?.addEventListener('change', e=>{_filterExpStatus=e.target.value;_pageExp=1;applyExpFilters();renderExpContent();});
    document.getElementById('expCatFilter')?.addEventListener('change', e=>{_filtExp=_expenses.filter(ex=>!e.target.value||ex.category===e.target.value);_pageExp=1;renderExpContent();});
  }

  function applyExpFilters() {
    let d = [..._expenses];
    if (_searchExp) d = Utils.searchFilter(d, _searchExp, ['title','category','vendor']);
    if (_filterExpStatus) d = d.filter(e=>e.status===_filterExpStatus);
    _filtExp = d;
  }

  function renderExpContent() {
    const container = document.getElementById('expensesContent');
    if (!container) return;
    const start = (_pageExp-1)*PS;
    const paged = _filtExp.slice(start, start+PS);
    if (!_filtExp.length) { container.innerHTML=UI.emptyState('💸','No Expenses','Add your first expense.','+ Add Expense','Payments.openExpenseModal()'); document.getElementById('expPagination').innerHTML=''; return; }

    container.innerHTML = `<div class="table-wrapper"><table class="data-table"><thead><tr>
      <th>Title</th><th>Category</th><th>Vendor</th><th>Amount</th><th>Status</th><th>Date</th><th></th>
    </tr></thead><tbody>${paged.map(e=>`<tr data-id="${e.id}">
      <td><div style="font-weight:500;color:var(--text-primary);">${e.title}</div></td>
      <td><span class="badge badge-neutral">${e.category}</span></td>
      <td style="color:var(--text-secondary);">${e.vendor||'—'}</td>
      <td class="cell-amount negative">${Utils.formatCurrency(e.amount)}</td>
      <td>${Utils.getStatusBadge(e.status)}</td>
      <td class="cell-date">${Utils.formatDate(e.date)}</td>
      <td><div class="cell-actions">
        <button class="cell-action-btn" onclick="event.stopPropagation();Payments.approveExpense('${e.id}')" title="Approve">✓</button>
        <button class="cell-action-btn" onclick="event.stopPropagation();Payments.openExpenseModal('${e.id}')">✏️</button>
        <button class="cell-action-btn danger" onclick="event.stopPropagation();Payments.deleteExpense('${e.id}')">🗑</button>
      </div></td>
    </tr>`).join('')}</tbody></table></div>`;

    const el = document.getElementById('expPagination');
    const pages = Math.ceil(_filtExp.length/PS);
    if (el) el.innerHTML = `<div class="pagination-info">Showing ${start+1}–${Math.min(_pageExp*PS,_filtExp.length)} of ${_filtExp.length}</div><div class="pagination-controls">
      <button class="page-btn" onclick="Payments.goExpPage(${_pageExp-1})" ${_pageExp<=1?'disabled':''}>‹</button>
      ${Array.from({length:Math.min(pages,7)},(_,i)=>`<button class="page-btn ${i+1===_pageExp?'active':''}" onclick="Payments.goExpPage(${i+1})">${i+1}</button>`).join('')}
      <button class="page-btn" onclick="Payments.goExpPage(${_pageExp+1})" ${_pageExp>=pages?'disabled':''}>›</button></div>`;
  }

  function openExpenseModal(id = null) {
    const exp = id ? Storage.getById('expenses', id) : {};
    Modal.open({
      title: id ? 'Edit Expense' : 'Add Expense', icon: '💸',
      body: `
        <div class="form-row">
          <div class="form-group"><label class="form-label">Title <span class="required">*</span></label>
            <input type="text" name="title" class="form-input" value="${exp.title||''}" placeholder="Software subscription" required /></div>
          <div class="form-group"><label class="form-label">Category</label>
            <select name="category" class="form-select">${EXPENSE_CATS.map(c=>`<option value="${c}" ${exp.category===c?'selected':''}>${c}</option>`).join('')}</select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Amount ($) <span class="required">*</span></label>
            <input type="number" name="amount" class="form-input" value="${exp.amount||''}" placeholder="1000" required /></div>
          <div class="form-group"><label class="form-label">Vendor</label>
            <input type="text" name="vendor" class="form-input" value="${exp.vendor||''}" placeholder="Vendor name" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Date</label>
            <input type="date" name="date" class="form-input" value="${exp.date||Utils.todayISO()}" /></div>
          <div class="form-group"><label class="form-label">Status</label>
            <select name="status" class="form-select">
              <option value="pending" ${exp.status==='pending'?'selected':''}>Pending</option>
              <option value="approved" ${exp.status==='approved'?'selected':''}>Approved</option>
              <option value="rejected" ${exp.status==='rejected'?'selected':''}>Rejected</option></select></div>
        </div>
        <div class="form-group"><label class="form-label">Notes</label>
          <textarea name="notes" class="form-textarea" rows="2">${exp.notes||''}</textarea></div>`,
      saveLabel: id ? 'Update Expense' : 'Add Expense',
      onSave: () => {
        if (!Modal.validateRequired([{name:'title',label:'Title'},{name:'amount',label:'Amount'}])) return false;
        const data = Modal.getFormData(); data.amount = parseFloat(data.amount)||0;
        id ? Storage.update('expenses',id,data) : Storage.create('expenses',data);
        UI.toast(id?'Expense updated.':'Expense added!','success'); renderExpensesPage(); return true;
      }
    });
  }

  function approveExpense(id) {
    Storage.update('expenses', id, { status: 'approved' });
    UI.toast('Expense approved.', 'success'); renderExpensesPage();
  }

  function deleteExpense(id) {
    const e = Storage.getById('expenses', id);
    UI.confirm(`Delete expense "<strong>${e?.title}</strong>"?`, 'Delete', () => {
      Storage.del('expenses', id); UI.toast('Deleted.','success'); renderExpensesPage();
    });
  }

  function goExpPage(p) { const pages=Math.ceil(_filtExp.length/PS); if(p<1||p>pages) return; _pageExp=p; renderExpContent(); }
  function exportExpCSV() { Utils.downloadCSV(_expenses.map(e=>({Title:e.title,Category:e.category,Amount:e.amount,Vendor:e.vendor,Status:e.status,Date:e.date})),'expenses.csv'); UI.toast('Exported!','success'); }

  return { renderPage, renderExpensesPage, openCreateModal, openEditModal, deletePayment, goPayPage, exportPayCSV, openExpenseModal, approveExpense, deleteExpense, goExpPage, exportExpCSV };
})();
